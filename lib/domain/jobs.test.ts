import { describe, expect, it } from "vitest";
import { toCents } from "@/lib/domain/money";
import {
  createJob,
  daysInStatus,
  isOverdue,
  markJobPaid,
  pipelineTotals,
  sanitizeJobs,
  sortJobsForPipeline,
  transitionJob,
  unmarkJobPaid,
  type JobRecord,
} from "@/lib/domain/jobs";
import {
  jobSignals,
  OUTSTANDING_TOTAL_FLOOR,
  QUOTE_WAITING_DAYS,
} from "@/lib/domain/jobSignals";

const quote = (overrides: Partial<Parameters<typeof createJob>[0]> = {}) =>
  createJob({
    id: overrides.id ?? "job-1",
    client: "Studio Noord",
    project: "Two-day shoot",
    feeExVatCents: toCents(1_800),
    jobCostsCents: toCents(200),
    vatRate: 21,
    quotedTakeHomeCents: toCents(1_050),
    quotedTaxCents: toCents(550),
    quotedConfigVersion: "nl-2026.1",
    createdAt: "2026-03-01",
    ...overrides,
  });

describe("createJob", () => {
  it("starts as a quote, with nothing owed", () => {
    const job = quote();
    expect(job.status).toBe("quoted");
    expect(job.statusChangedAt).toBe("2026-03-01");
    expect(job.taxYear).toBe(2026);
    expect(job.history).toEqual([{ status: "quoted", at: "2026-03-01" }]);
  });

  it("needs only a client name, not a profile", () => {
    const job = quote({ client: "Anna", project: undefined });
    expect(job.client).toBe("Anna");
    expect(job.project).toBeUndefined();
  });
});

describe("transitions", () => {
  it("records each state with the date it began", () => {
    let job = quote();
    job = transitionJob(job, "accepted", "2026-03-05");
    job = transitionJob(job, "invoiced", "2026-03-20");

    expect(job.status).toBe("invoiced");
    expect(job.statusChangedAt).toBe("2026-03-20");
    expect(job.history.map((e) => e.status)).toEqual(["quoted", "accepted", "invoiced"]);
  });

  it("ignores a repeated transition, so a double tap cannot duplicate history", () => {
    const once = transitionJob(quote(), "accepted", "2026-03-05");
    const twice = transitionJob(once, "accepted", "2026-03-09");

    expect(twice).toBe(once);
    expect(twice.history).toHaveLength(2);
    // And the clock on the current state does not restart.
    expect(twice.statusChangedAt).toBe("2026-03-05");
  });

  it("keeps the whole history when archived, rather than deleting", () => {
    let job = transitionJob(quote(), "accepted", "2026-03-05");
    job = transitionJob(job, "archived", "2026-04-01");
    expect(job.history.map((e) => e.status)).toEqual(["quoted", "accepted", "archived"]);
  });
});

describe("marking paid", () => {
  const invoiced = () => transitionJob(quote(), "invoiced", "2026-03-20");

  it("links the payment record instead of duplicating the job", () => {
    const paid = markJobPaid(invoiced(), {
      paidAt: "2026-04-10",
      amountExVatCents: toCents(1_800),
      paymentId: "pay-1",
    });

    expect(paid.status).toBe("paid");
    expect(paid.paymentId).toBe("pay-1");
    expect(paid.id).toBe("job-1"); // same object, later moment
    expect(paid.history.map((e) => e.status)).toEqual(["quoted", "invoiced", "paid"]);
  });

  it("keeps what was actually received when it differs from the quote", () => {
    const paid = markJobPaid(invoiced(), {
      paidAt: "2026-04-10",
      amountExVatCents: toCents(1_750),
      paymentId: "pay-1",
    });

    expect(paid.paidAmountExVatCents).toBe(toCents(1_750));
    // The original quote is untouched, so the difference stays visible.
    expect(paid.feeExVatCents).toBe(toCents(1_800));
  });

  it("files the payment in the year the money arrived, not the year quoted", () => {
    const paid = markJobPaid(quote({ createdAt: "2026-12-20" }), {
      paidAt: "2027-01-15",
      amountExVatCents: toCents(1_800),
      paymentId: "pay-1",
    });
    expect(paid.taxYear).toBe(2027);
  });

  it("accepts a payment date in the past", () => {
    const paid = markJobPaid(invoiced(), {
      paidAt: "2026-03-25",
      amountExVatCents: toCents(1_800),
      paymentId: "pay-1",
    });
    expect(paid.paidAt).toBe("2026-03-25");
  });

  it("can be undone, clearing the link so nothing dangles", () => {
    const paid = markJobPaid(invoiced(), {
      paidAt: "2026-04-10",
      amountExVatCents: toCents(1_800),
      paymentId: "pay-1",
    });
    const back = unmarkJobPaid(paid, "2026-04-11");

    expect(back.status).toBe("invoiced");
    expect(back.paymentId).toBeUndefined();
    expect(back.paidAt).toBeUndefined();
    expect(back.paidAmountExVatCents).toBeUndefined();
    expect(back.taxYear).toBe(2026);
  });

  it("does nothing when asked to undo a job that was never paid", () => {
    const job = invoiced();
    expect(unmarkJobPaid(job, "2026-04-11")).toBe(job);
  });
});

describe("overdue", () => {
  it("is never true without a real due date", () => {
    const job = transitionJob(quote(), "invoiced", "2026-03-01");
    expect(isOverdue(job, "2026-09-01")).toBe(false);
  });

  it("is true only once the due date has passed", () => {
    const job = transitionJob(quote({ dueDate: "2026-04-01" }), "invoiced", "2026-03-01");
    expect(isOverdue(job, "2026-03-31")).toBe(false);
    expect(isOverdue(job, "2026-04-01")).toBe(false);
    expect(isOverdue(job, "2026-04-02")).toBe(true);
  });

  it("is never true for a quote, because nothing is owed yet", () => {
    const job = quote({ dueDate: "2026-01-01" });
    expect(isOverdue(job, "2026-09-01")).toBe(false);
  });
});

describe("pipelineTotals", () => {
  const jobs = (): JobRecord[] => [
    transitionJob(quote({ id: "a" }), "invoiced", "2026-03-01"),
    transitionJob(quote({ id: "b" }), "invoiced", "2026-02-01"),
    transitionJob(quote({ id: "c" }), "accepted", "2026-03-10"),
    quote({ id: "d" }),
    markJobPaid(transitionJob(quote({ id: "e" }), "invoiced", "2026-01-05"), {
      paidAt: "2026-02-01",
      amountExVatCents: toCents(1_750),
      paymentId: "pay-e",
    }),
    transitionJob(quote({ id: "f" }), "archived", "2026-02-20"),
  ];

  it("counts only invoiced work as outstanding", () => {
    const t = pipelineTotals(jobs(), "2026-03-15", 2026);
    expect(t.outstandingCount).toBe(2);
    expect(t.outstandingCents).toBe(toCents(3_600));
  });

  it("keeps accepted and quoted separate from money owed", () => {
    const t = pipelineTotals(jobs(), "2026-03-15", 2026);
    expect(t.openCount).toBe(2);
    expect(t.openCents).toBe(toCents(3_600));
  });

  it("uses what was received for paid work, not what was quoted", () => {
    const t = pipelineTotals(jobs(), "2026-03-15", 2026);
    expect(t.paidCount).toBe(1);
    expect(t.paidCents).toBe(toCents(1_750));
  });

  it("excludes archived work from every total", () => {
    const t = pipelineTotals(jobs(), "2026-03-15", 2026);
    expect(t.outstandingCount + t.openCount + t.paidCount).toBe(5);
  });

  it("reports the longest wait, which is what needs attention", () => {
    const t = pipelineTotals(jobs(), "2026-03-15", 2026);
    expect(t.oldestOutstandingDays).toBe(42); // the 2026-02-01 invoice
  });

  it("excludes payments from other tax years", () => {
    const t = pipelineTotals(jobs(), "2026-03-15", 2025);
    expect(t.paidCount).toBe(0);
    expect(t.paidCents).toBe(0);
  });

  it("is all zeroes with no jobs at all", () => {
    const t = pipelineTotals([], "2026-03-15", 2026);
    expect(t).toMatchObject({
      outstandingCents: 0,
      outstandingCount: 0,
      openCount: 0,
      paidCount: 0,
      oldestOutstandingDays: 0,
    });
  });
});

describe("sortJobsForPipeline", () => {
  it("puts money owed first, oldest first, and sinks settled work", () => {
    const list = [
      quote({ id: "new-quote" }),
      markJobPaid(transitionJob(quote({ id: "paid" }), "invoiced", "2026-01-01"), {
        paidAt: "2026-02-01",
        amountExVatCents: toCents(1_800),
        paymentId: "p",
      }),
      transitionJob(quote({ id: "old-invoice" }), "invoiced", "2026-01-10"),
      transitionJob(quote({ id: "new-invoice" }), "invoiced", "2026-03-01"),
    ];
    expect(sortJobsForPipeline(list).map((j) => j.id)).toEqual([
      "old-invoice",
      "new-invoice",
      "new-quote",
      "paid",
    ]);
  });
});

describe("sanitizeJobs", () => {
  it("returns nothing for a non-array", () => {
    expect(sanitizeJobs(undefined)).toEqual({ jobs: [], discarded: 0 });
    expect(sanitizeJobs({ nope: true })).toEqual({ jobs: [], discarded: 0 });
  });

  it("drops one bad record without losing the good ones", () => {
    const good = quote();
    const result = sanitizeJobs([good, { id: "x" }, null, good]);
    expect(result.jobs).toHaveLength(2);
    expect(result.discarded).toBe(2);
  });

  it("walks a paid job with no payment link back to invoiced", () => {
    // Otherwise it would count toward paid totals while pointing at nothing.
    const broken = { ...quote(), status: "paid", paidAt: "2026-04-01" };
    const { jobs } = sanitizeJobs([broken]);
    expect(jobs[0].status).toBe("invoiced");
    expect(jobs[0].paymentId).toBeUndefined();
  });

  it("rebuilds a missing history rather than dropping the job", () => {
    const { jobs } = sanitizeJobs([{ ...quote(), history: "not an array" }]);
    expect(jobs[0].history).toEqual([{ status: "quoted", at: "2026-03-01" }]);
  });

  it("rejects a record with unreadable money", () => {
    const { jobs, discarded } = sanitizeJobs([
      { ...quote(), feeExVatCents: "1800" },
    ]);
    expect(jobs).toHaveLength(0);
    expect(discarded).toBe(1);
  });

  it("survives a round trip through JSON", () => {
    const job = markJobPaid(transitionJob(quote(), "invoiced", "2026-03-20"), {
      paidAt: "2026-04-10",
      amountExVatCents: toCents(1_750),
      paymentId: "pay-1",
    });
    const { jobs, discarded } = sanitizeJobs(JSON.parse(JSON.stringify([job])));
    expect(discarded).toBe(0);
    expect(jobs[0]).toEqual(job);
  });
});

describe("jobSignals", () => {
  it("says nothing when there are no jobs", () => {
    expect(jobSignals({ jobs: [], today: "2026-03-15" })).toEqual([]);
  });

  it("says nothing about a quote sent yesterday", () => {
    const jobs = [quote({ createdAt: "2026-03-14" })];
    expect(jobSignals({ jobs, today: "2026-03-15" })).toEqual([]);
  });

  it("mentions a quote that has waited two weeks", () => {
    const jobs = [quote({ createdAt: "2026-03-01" })];
    const signals = jobSignals({ jobs, today: `2026-03-${14 + QUOTE_WAITING_DAYS + 1}` });
    expect(signals[0]).toMatchObject({ kind: "quote-waiting", tone: "neutral" });
  });

  it("never calls an unanswered quote overdue", () => {
    const jobs = [quote({ createdAt: "2026-01-01", dueDate: "2026-01-10" })];
    const kinds = jobSignals({ jobs, today: "2026-06-01" }).map((s) => s.kind);
    expect(kinds).not.toContain("payment-overdue");
  });

  it("escalates an unpaid invoice one rung at a time", () => {
    const jobs = [transitionJob(quote(), "invoiced", "2026-01-01")];

    expect(jobSignals({ jobs, today: "2026-01-20" })).toEqual([]);
    expect(jobSignals({ jobs, today: "2026-02-05" })[0]).toMatchObject({
      kind: "payment-waiting",
      key: expect.stringContaining(":30"),
    });
    expect(jobSignals({ jobs, today: "2026-03-10" })[0]).toMatchObject({
      key: expect.stringContaining(":60"),
    });
  });

  it("prefers the overdue statement when a real due date has passed", () => {
    const jobs = [
      transitionJob(quote({ dueDate: "2026-02-01" }), "invoiced", "2026-01-01"),
    ];
    const signals = jobSignals({ jobs, today: "2026-03-10" });
    expect(signals).toHaveLength(1);
    expect(signals[0].kind).toBe("payment-overdue");
  });

  it("does not repeat a dismissed signal", () => {
    const jobs = [transitionJob(quote(), "invoiced", "2026-01-01")];
    const [signal] = jobSignals({ jobs, today: "2026-02-05" });
    expect(jobSignals({ jobs, today: "2026-02-06", dismissed: [signal.key] })).toEqual([]);
  });

  it("lets a dismissed signal speak again at the next rung", () => {
    const jobs = [transitionJob(quote(), "invoiced", "2026-01-01")];
    const [first] = jobSignals({ jobs, today: "2026-02-05" });
    const later = jobSignals({ jobs, today: "2026-03-10", dismissed: [first.key] });
    expect(later).toHaveLength(1);
    expect(later[0].key).not.toBe(first.key);
  });

  it("summarises only when more than one item is old and the total matters", () => {
    const one = [transitionJob(quote({ id: "a" }), "invoiced", "2026-01-01")];
    expect(jobSignals({ jobs: one, today: "2026-03-01" }).map((s) => s.kind)).not.toContain(
      "outstanding-total"
    );

    const many = [
      transitionJob(quote({ id: "a" }), "invoiced", "2026-01-01"),
      transitionJob(quote({ id: "b" }), "invoiced", "2026-01-02"),
    ];
    const summary = jobSignals({ jobs: many, today: "2026-03-01" }).find(
      (s) => s.kind === "outstanding-total"
    );
    expect(summary).toMatchObject({ count: 2, amountCents: toCents(3_600) });
    expect(summary!.amountCents!).toBeGreaterThanOrEqual(OUTSTANDING_TOTAL_FLOOR);
  });

  it("mentions a payment that just arrived, then stops", () => {
    const paid = markJobPaid(transitionJob(quote(), "invoiced", "2026-03-01"), {
      paidAt: "2026-04-01",
      amountExVatCents: toCents(1_800),
      paymentId: "pay-1",
    });

    expect(jobSignals({ jobs: [paid], today: "2026-04-03" })[0]).toMatchObject({
      kind: "recently-paid",
    });
    expect(jobSignals({ jobs: [paid], today: "2026-05-01" })).toEqual([]);
  });

  it("stays quiet about archived work", () => {
    const jobs = [transitionJob(quote({ createdAt: "2026-01-01" }), "archived", "2026-01-02")];
    expect(jobSignals({ jobs, today: "2026-06-01" })).toEqual([]);
  });
});

describe("daysInStatus", () => {
  it("counts from when the state began, not when the job was created", () => {
    const job = transitionJob(quote({ createdAt: "2026-01-01" }), "invoiced", "2026-03-01");
    expect(daysInStatus(job, "2026-03-15")).toBe(14);
  });

  it("never goes negative on a future-dated record", () => {
    expect(daysInStatus(quote({ createdAt: "2026-06-01" }), "2026-03-01")).toBe(0);
  });
});
