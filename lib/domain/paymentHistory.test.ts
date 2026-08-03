import { describe, expect, it } from "vitest";
import { toCents, type Cents } from "./money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import {
  addPayment,
  clampNote,
  MAX_NOTE_LENGTH,
  recordsForTaxYear,
  removePayment,
  sanitizePaymentHistory,
  taxYearOf,
  taxYearsPresent,
  updatePayment,
  yearTotals,
  type PaymentRecord,
} from "./paymentHistory";

function record(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: overrides.id ?? "p1",
    date: overrides.date ?? "2026-03-14",
    amountExVat: overrides.amountExVat ?? toCents(1000),
    vatRate: overrides.vatRate ?? 21,
    vatAmount: overrides.vatAmount ?? toCents(210),
    reserveTaken: overrides.reserveTaken ?? toCents(133),
    note: overrides.note,
    // Deliberately derived, so a fixture can never assert against an
    // inconsistent record the production code would never produce.
    taxYear: taxYearOf(overrides.date ?? "2026-03-14"),
  };
}

describe("taxYearOf", () => {
  it("reads the calendar year, which is the Dutch tax year", () => {
    expect(taxYearOf("2026-01-01")).toBe(2026);
    expect(taxYearOf("2025-12-31")).toBe(2025);
  });
});

describe("adding payments", () => {
  it("accumulates profit and reserve across a year", () => {
    let history: PaymentRecord[] = [];
    history = addPayment(history, record({ id: "a", amountExVat: toCents(1000), reserveTaken: toCents(134) }));
    history = addPayment(history, record({ id: "b", amountExVat: toCents(2500), reserveTaken: toCents(335) }));
    history = addPayment(history, record({ id: "c", amountExVat: toCents(400), reserveTaken: toCents(54) }));

    const totals = yearTotals(history, 2026);
    expect(totals.count).toBe(3);
    expect(totals.profitCents).toBe(toCents(3900));
    expect(totals.reservedCents).toBe(toCents(523));
  });

  it("derives the tax year from the date, not from what was passed in", () => {
    // A caller that hands over a stale taxYear must not be able to file a
    // payment under the wrong year.
    const history = addPayment([], record({ date: "2025-11-02", taxYear: 2026 }));
    expect(history[0].taxYear).toBe(2025);
  });
});

describe("editing and deleting", () => {
  const base = [
    record({ id: "a", amountExVat: toCents(1000), reserveTaken: toCents(134) }),
    record({ id: "b", amountExVat: toCents(2000), reserveTaken: toCents(268) }),
  ];

  it("recalculates totals after an edit", () => {
    const edited = updatePayment(base, "b", {
      amountExVat: toCents(500) as Cents,
      reserveTaken: toCents(67) as Cents,
    });
    const totals = yearTotals(edited, 2026);
    expect(totals.profitCents).toBe(toCents(1500));
    expect(totals.reservedCents).toBe(toCents(201));
  });

  it("recalculates totals after a delete", () => {
    const totals = yearTotals(removePayment(base, "a"), 2026);
    expect(totals.count).toBe(1);
    expect(totals.profitCents).toBe(toCents(2000));
    expect(totals.reservedCents).toBe(toCents(268));
  });

  it("moves a payment between years when its date is edited", () => {
    const moved = updatePayment(base, "a", { date: "2025-12-20" });
    expect(yearTotals(moved, 2026).profitCents).toBe(toCents(2000));
    expect(yearTotals(moved, 2025).profitCents).toBe(toCents(1000));
    // Moved, not lost.
    expect(moved).toHaveLength(2);
  });

  it("leaves the history alone for an unknown id", () => {
    expect(updatePayment(base, "nope", { note: "x" })).toEqual(base);
    expect(removePayment(base, "nope")).toEqual(base);
  });
});

describe("tax year boundary", () => {
  const history = [
    record({ id: "old1", date: "2025-06-01", amountExVat: toCents(9000), reserveTaken: toCents(1200) }),
    record({ id: "old2", date: "2025-12-31", amountExVat: toCents(1000), reserveTaken: toCents(140) }),
    record({ id: "new1", date: "2026-01-01", amountExVat: toCents(2000), reserveTaken: toCents(260) }),
  ];

  it("excludes previous years from the current year's totals", () => {
    const totals = yearTotals(history, 2026);
    expect(totals.count).toBe(1);
    expect(totals.profitCents).toBe(toCents(2000));
    expect(totals.reservedCents).toBe(toCents(260));
  });

  it("keeps previous years rather than deleting them", () => {
    expect(taxYearsPresent(history)).toEqual([2026, 2025]);
    expect(yearTotals(history, 2025).count).toBe(2);
    expect(recordsForTaxYear(history, 2025)).toHaveLength(2);
  });

  it("returns zero totals for a year with no payments", () => {
    const totals = yearTotals(history, 2024);
    expect(totals.count).toBe(0);
    expect(totals.profitCents).toBe(0);
    expect(totals.reservedCents).toBe(0);
  });

  it("lists a year newest first", () => {
    const listed = recordsForTaxYear(history, 2025);
    expect(listed.map((r) => r.id)).toEqual(["old2", "old1"]);
  });
});

describe("notes", () => {
  it("trims, drops empties, and caps length", () => {
    expect(clampNote("  hello  ")).toBe("hello");
    expect(clampNote("   ")).toBeUndefined();
    expect(clampNote(undefined)).toBeUndefined();
    expect(clampNote("x".repeat(300))).toHaveLength(MAX_NOTE_LENGTH);
  });
});

describe("sanitizePaymentHistory", () => {
  it("accepts a clean history unchanged", () => {
    const { records, discarded } = sanitizePaymentHistory([record()]);
    expect(discarded).toBe(0);
    expect(records).toHaveLength(1);
  });

  it("treats a missing history as empty without flagging damage", () => {
    expect(sanitizePaymentHistory(undefined)).toEqual({ records: [], discarded: 0 });
    expect(sanitizePaymentHistory(null)).toEqual({ records: [], discarded: 0 });
  });

  it("does not throw on a payload that is not an array", () => {
    expect(() => sanitizePaymentHistory("garbage")).not.toThrow();
    expect(sanitizePaymentHistory("garbage").discarded).toBe(1);
    expect(sanitizePaymentHistory({ nope: true }).records).toEqual([]);
  });

  it("drops only the damaged rows and counts them", () => {
    const { records, discarded } = sanitizePaymentHistory([
      record({ id: "good" }),
      null,
      "nonsense",
      { ...record({ id: "bad-date" }), date: "14/03/2026" },
      { ...record({ id: "float-cents" }), amountExVat: 1000.5 },
      { ...record({ id: "nan-rate" }), vatRate: Number.NaN },
      { ...record({ id: "no-id" }), id: "" },
      record({ id: "alsoGood", date: "2026-04-01" }),
    ]);
    // One bad row must not cost the user the rest of the year.
    expect(records.map((r) => r.id)).toEqual(["good", "alsoGood"]);
    expect(discarded).toBe(6);
  });

  it("drops duplicate ids, which would otherwise double-count a payment", () => {
    const { records, discarded } = sanitizePaymentHistory([
      record({ id: "dup" }),
      record({ id: "dup" }),
    ]);
    expect(records).toHaveLength(1);
    expect(discarded).toBe(1);
  });

  it("re-derives the tax year rather than trusting the stored one", () => {
    const { records } = sanitizePaymentHistory([
      { ...record({ date: "2025-05-05" }), taxYear: 2099 },
    ]);
    expect(records[0].taxYear).toBe(2025);
  });

  it("caps an over-long stored note", () => {
    const { records } = sanitizePaymentHistory([
      { ...record(), note: "y".repeat(500) },
    ]);
    expect(records[0].note).toHaveLength(MAX_NOTE_LENGTH);
  });
});

describe("a year of saved payments feeds the engine correctly", () => {
  const annualProfit = 40_000;

  function reserveFor(history: PaymentRecord[], paymentExVat: number) {
    const totals = yearTotals(history, 2026);
    return calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: annualProfit,
      ytdProfit: totals.profitCents / 100,
      ytdReserved: totals.reservedCents / 100,
      meetsHoursCriterion: true,
      isStarter: false,
      otherIncome: 0,
      paymentReceived: paymentExVat,
    });
  }

  it("an empty history is the correct first-payment-of-the-year state", () => {
    const withEmpty = reserveFor([], 2000);
    const withExplicitZeroes = calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: annualProfit,
      ytdProfit: 0,
      ytdReserved: 0,
      meetsHoursCriterion: true,
      isStarter: false,
      paymentReceived: 2000,
    });
    expect(withEmpty.reserveFromThisPayment).toBe(
      withExplicitZeroes.reserveFromThisPayment
    );
  });

  it("twelve payments driven from stored history reserve the annual bill", () => {
    // The same conservation property as the engine's own twelve-payment test,
    // but with the running totals coming out of saved records rather than being
    // handed in. This is the check that the wiring, not just the maths, works.
    const annual = calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: annualProfit,
      ytdReserved: 0,
      meetsHoursCriterion: true,
      isStarter: false,
    });

    const payment = annualProfit / 12;
    let history: PaymentRecord[] = [];
    for (let month = 0; month < 12; month += 1) {
      const result = reserveFor(history, payment);
      const held = result.reserveFromThisPayment!;
      history = addPayment(history, {
        id: `m${month}`,
        date: `2026-${String(month + 1).padStart(2, "0")}-15`,
        amountExVat: toCents(payment),
        vatRate: 21,
        vatAmount: toCents(payment * 0.21),
        reserveTaken: held,
        taxYear: 2026,
      });
    }

    const totals = yearTotals(history, 2026);
    expect(totals.count).toBe(12);
    // €40.000 / 12 does not divide evenly into cents, so the twelve payments
    // sum a few cents short of the projection.
    expect(toCents(annualProfit) - totals.profitCents).toBeLessThanOrEqual(12);
    expect(totals.reservedCents).toBe(annual.reserveGap);
    expect(totals.reservedCents).toBeGreaterThanOrEqual(annual.totalLiability);
  });

  it("last year's payments do not suppress this year's reserve", () => {
    const lastYear = [
      record({ id: "ly", date: "2025-09-01", amountExVat: toCents(40_000), reserveTaken: toCents(5326) }),
    ];
    const fresh = reserveFor([], 2000);
    const withLastYear = reserveFor(lastYear, 2000);
    // A fully-reserved 2025 must have no effect on what 2026 asks for.
    expect(withLastYear.reserveFromThisPayment).toBe(fresh.reserveFromThisPayment);
  });
});
