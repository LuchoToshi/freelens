import { describe, expect, it } from "vitest";
import {
  dayDiff,
  NEEDS_YOU_QUEUES,
  placeInquiry,
  QUEUE_ORDER,
  type QueueInquiry,
} from "@/lib/frontdesk/queue";

const TZ = "Europe/Amsterdam";
const NOW = new Date("2026-08-30T10:00:00Z");

function inquiry(overrides: Partial<QueueInquiry> = {}): QueueInquiry {
  return {
    status: "new",
    created_at: "2026-08-29T09:00:00Z",
    replied_at: null,
    client_email: "lisa@example.com",
    snoozed_until: null,
    ...overrides,
  };
}

function draft(validation_status: string, failures: string[] = [], outcome: string | null = null) {
  return {
    kind: "reply" as const,
    outcome,
    validation_status,
    validation_failures: failures,
    created_at: "2026-08-29T09:01:00Z",
  };
}

describe("the fixed queue-priority model", () => {
  it("order is the priority model and never changes", () => {
    expect(QUEUE_ORDER).toEqual([
      "decision", "review", "missing", "followup", "waiting", "monitoring", "done",
    ]);
  });

  it("a needs_review draft is a decision only the human can make", () => {
    const p = placeInquiry(inquiry(), draft("needs_review", ["recipient-missing"]), NOW, TZ);
    expect(p.queue).toBe("decision");
    expect(p.failures).toEqual(["recipient-missing"]);
  });

  it("a validated draft waits in review", () => {
    expect(placeInquiry(inquiry(), draft("ready_for_review"), NOW, TZ).queue).toBe("review");
  });

  it("a failed draft is missing information, with the evidence attached", () => {
    const p = placeInquiry(inquiry(), draft("failed", ["body-only-greeting"]), NOW, TZ);
    expect(p.queue).toBe("missing");
    expect(p.failures).toEqual(["body-only-greeting"]);
  });

  it("no draft within the generating window is monitoring, after it is missing", () => {
    const fresh = inquiry({ created_at: new Date(NOW.getTime() - 4 * 60_000).toISOString() });
    expect(placeInquiry(fresh, null, NOW, TZ).queue).toBe("monitoring");
    expect(placeInquiry(inquiry(), null, NOW, TZ).queue).toBe("missing");
  });

  it("replied waits on the client; booked and lost are done", () => {
    expect(placeInquiry(inquiry({ status: "replied" }), null, NOW, TZ).queue).toBe("waiting");
    expect(placeInquiry(inquiry({ status: "booked" }), null, NOW, TZ).queue).toBe("done");
    expect(placeInquiry(inquiry({ status: "lost" }), null, NOW, TZ).queue).toBe("done");
  });

  it("follow-up due states overdue in days AND as an exact date (§7.6)", () => {
    const p = placeInquiry(
      inquiry({ status: "nudge_due", replied_at: "2026-08-21T08:00:00Z" }),
      null,
      NOW,
      TZ
    );
    expect(p.queue).toBe("followup");
    expect(p.due).toEqual({ kind: "overdue", days: 6, date: "2026-08-24" });
  });

  it("a snoozed inquiry defers with the snoozed-until date, never as overdue", () => {
    const p = placeInquiry(
      inquiry({ status: "nudge_due", snoozed_until: "2026-09-02T08:00:00Z" }),
      null,
      NOW,
      TZ
    );
    expect(p.due?.kind).toBe("snoozed");
    expect(p.due?.date).toBe("2026-09-02");
  });

  it("day arithmetic respects the freelancer's timezone at midnight boundaries", () => {
    // 23:30 UTC on the 29th is already the 30th in Amsterdam (CEST, +2).
    const lateUtc = new Date("2026-08-29T23:30:00Z");
    const nextMorning = new Date("2026-08-30T06:00:00Z");
    expect(dayDiff(lateUtc, nextMorning, "Europe/Amsterdam")).toBe(0);
    expect(dayDiff(lateUtc, nextMorning, "UTC")).toBe(1);
  });

  it("every placement carries a reason and a next action — bare scores are forbidden", () => {
    const cases = [
      placeInquiry(inquiry(), draft("ready_for_review"), NOW, TZ),
      placeInquiry(inquiry({ status: "replied" }), null, NOW, TZ),
      placeInquiry(inquiry({ status: "booked" }), null, NOW, TZ),
    ];
    for (const p of cases) {
      expect(p.reasonKey).toBeTruthy();
      expect(p.actionKey).toBeTruthy();
    }
  });
});

describe("the desk and the inbox order the same work the same way (handoff §5.1)", () => {
  it("Needs you is the leading slice of the inbox order, not a second opinion", () => {
    expect(NEEDS_YOU_QUEUES).toEqual(QUEUE_ORDER.slice(0, NEEDS_YOU_QUEUES.length));
  });

  it("Needs you holds exactly the queues that ask the freelancer for something", () => {
    expect([...NEEDS_YOU_QUEUES]).toEqual(["decision", "review", "missing"]);
  });

  it("nothing the desk watches on its own is filed under Needs you", () => {
    for (const queue of ["followup", "waiting", "monitoring", "done"] as const) {
      expect(NEEDS_YOU_QUEUES).not.toContain(queue);
    }
  });
});
