import { describe, it, expect } from "vitest";
import { asCentsUnsafe, toCents } from "./money";
import {
  calculateSuggestedReserve,
  validateReservePercentage,
  type ReserveMethod,
} from "./reserves";

/** A guided-estimate method with everything defaulted, for terse test cases. */
function guided(
  overrides: Partial<Extract<ReserveMethod, { mode: "guided-estimate" }>>
): ReserveMethod {
  return {
    mode: "guided-estimate",
    taxYear: 2026,
    country: "NL",
    expectedAnnualRevenueExVatCents: toCents(0),
    expectedDeductibleCostsExVatCents: toCents(0),
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncomeCents: asCentsUnsafe(0),
    otherIncomeTaxWithheldCents: asCentsUnsafe(0),
    alreadyReservedCents: asCentsUnsafe(0),
    alreadyPaidCents: asCentsUnsafe(0),
    ...overrides,
  };
}

describe("own-rule reserve", () => {
  it("applies a percentage to the profit base", () => {
    const r = calculateSuggestedReserve(
      { mode: "own-rule", percentage: 30 },
      { profitBaseCents: toCents(1000) }
    );
    expect(r.status).toBe("calculated");
    if (r.status !== "calculated") return;
    expect(r.reserveCents).toBe(toCents(300));
    expect(r.source).toBe("own-rule");
  });
  it("rejects a negative percentage", () => {
    const r = calculateSuggestedReserve(
      { mode: "own-rule", percentage: -5 },
      { profitBaseCents: toCents(1000) }
    );
    expect(r.status).toBe("unavailable");
  });
  it("allows >100% but warns", () => {
    const r = calculateSuggestedReserve(
      { mode: "own-rule", percentage: 120 },
      { profitBaseCents: toCents(1000) }
    );
    expect(r.status).toBe("calculated");
    if (r.status !== "calculated") return;
    expect(r.reserveCents).toBe(toCents(1200));
    expect(r.warnings.length).toBeGreaterThan(0);
  });
  it("floors to zero for a non-positive base, with a warning", () => {
    const r = calculateSuggestedReserve(
      { mode: "own-rule", percentage: 30 },
      { profitBaseCents: toCents(0) }
    );
    expect(r.status).toBe("calculated");
    if (r.status !== "calculated") return;
    expect(r.reserveCents).toBe(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
  it("is unavailable without a base", () => {
    const r = calculateSuggestedReserve(
      { mode: "own-rule", percentage: 30 },
      {}
    );
    expect(r.status).toBe("unavailable");
  });
});

describe("provisional-assessment reserve", () => {
  it("computes remaining minus already paid", () => {
    const r = calculateSuggestedReserve(
      {
        mode: "provisional-assessment",
        expectedRemainingAnnualCents: toCents(6000),
        alreadyPaidOrReservedCents: toCents(2000),
        monthsRemaining: 4,
      }
    );
    expect(r.status).toBe("calculated");
    if (r.status !== "calculated") return;
    expect(r.reserveCents).toBe(toCents(4000));
    expect(r.perMonthCents).toBe(toCents(1000));
  });
  it("floors to zero when already paid exceeds expected, with a warning", () => {
    const r = calculateSuggestedReserve(
      {
        mode: "provisional-assessment",
        expectedRemainingAnnualCents: toCents(1000),
        alreadyPaidOrReservedCents: toCents(3000),
      }
    );
    expect(r.status).toBe("calculated");
    if (r.status !== "calculated") return;
    expect(r.reserveCents).toBe(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

describe("guided-estimate reserve", () => {
  it("runs the real tax engine, not a flat percentage", () => {
    const r = calculateSuggestedReserve(
      guided({
        expectedAnnualRevenueExVatCents: toCents(50_000),
        expectedDeductibleCostsExVatCents: toCents(10_000),
      })
    );
    expect(r.status).toBe("calculated");
    if (r.status !== "calculated") return;

    // Profit €40.000, hours criterion met. Every figure below is derived by
    // hand from the Belastingdienst 2026 tables in the block comment above
    // golden case 3 in lib/tax/engine.test.ts, not copied from this code:
    //   income tax  €12.109,39 - €8.426,37 credits = €3.683,02
    //   Zvw         4,85% x €33.872,40             = €1.642,82
    //   total                                      = €5.325,84
    //   reserve gap rounded up to the euro         = €5.326
    //   marginal per €100 of profit                = 39,08%
    // The old flat model said €13.940 (30% of profit + Zvw) for the same year.
    expect(r.reserveCents).toBe(toCents(5326));
    expect(r.zvwCents).toBe(toCents(1642.82));
    expect(r.estimate?.netTaxCents).toBe(toCents(3683.02));
    expect(r.estimate?.marginalRate).toBeCloseTo(0.3908, 4);
    expect(r.estimate?.configVersion).toBe("nl-2026.1");
    expect(r.estimate?.assumptions.length).toBeGreaterThan(5);
  });

  it("shows a band from a real swing in the projected year", () => {
    const r = calculateSuggestedReserve(
      guided({ expectedAnnualRevenueExVatCents: toCents(50_000) })
    );
    if (r.status !== "calculated") throw new Error("expected calculated");
    const range = r.reserveRangeCents!;
    expect(range[0]).toBeLessThan(r.reserveCents);
    expect(range[1]).toBeGreaterThan(r.reserveCents);
  });

  it("charges less when the hours criterion is met", () => {
    const method = { expectedAnnualRevenueExVatCents: toCents(50_000) };
    const withHours = calculateSuggestedReserve(guided({ ...method }));
    const without = calculateSuggestedReserve(
      guided({ ...method, meetsHoursCriterion: false })
    );
    if (withHours.status !== "calculated" || without.status !== "calculated") {
      throw new Error("expected calculated");
    }
    expect(withHours.reserveCents).toBeLessThan(without.reserveCents);
  });

  it("charges less again for a starter", () => {
    const method = { expectedAnnualRevenueExVatCents: toCents(50_000) };
    const established = calculateSuggestedReserve(guided({ ...method }));
    const starter = calculateSuggestedReserve(
      guided({ ...method, isStarter: true })
    );
    if (established.status !== "calculated" || starter.status !== "calculated") {
      throw new Error("expected calculated");
    }
    expect(starter.reserveCents).toBeLessThan(established.reserveCents);
  });

  it("warns when there is other income but no loonheffing entered", () => {
    const r = calculateSuggestedReserve(
      guided({
        expectedAnnualRevenueExVatCents: toCents(20_000),
        otherIncomeCents: toCents(30_000),
      })
    );
    if (r.status !== "calculated") throw new Error("expected calculated");
    expect(r.warnings.some((w) => w.includes("loonheffing"))).toBe(true);
  });

  it("subtracts loonheffing already withheld, and drops the warning", () => {
    const method = {
      expectedAnnualRevenueExVatCents: toCents(20_000),
      otherIncomeCents: toCents(30_000),
    };
    const without = calculateSuggestedReserve(guided({ ...method }));
    const withHeld = calculateSuggestedReserve(
      guided({ ...method, otherIncomeTaxWithheldCents: toCents(2250) })
    );
    if (without.status !== "calculated" || withHeld.status !== "calculated") {
      throw new Error("expected calculated");
    }
    expect(withHeld.reserveCents).toBe(without.reserveCents - toCents(2250));
    expect(withHeld.warnings.some((w) => w.includes("loonheffing"))).toBe(false);
  });

  it("caps the Zvw base at the maximum contribution income", () => {
    const r = calculateSuggestedReserve(
      guided({ expectedAnnualRevenueExVatCents: toCents(200_000) })
    );
    if (r.status !== "calculated") throw new Error("expected calculated");
    expect(r.zvwCents).toBe(Math.ceil(toCents(79_409) * 0.0485));
  });

  it("subtracts what has already been set aside", () => {
    const full = calculateSuggestedReserve(
      guided({ expectedAnnualRevenueExVatCents: toCents(50_000) })
    );
    const partial = calculateSuggestedReserve(
      guided({
        expectedAnnualRevenueExVatCents: toCents(50_000),
        alreadyReservedCents: toCents(2000),
      })
    );
    if (full.status !== "calculated" || partial.status !== "calculated") {
      throw new Error("expected calculated");
    }
    expect(partial.reserveCents).toBe(full.reserveCents - toCents(2000));
  });

  it("floors to zero when costs exceed revenue, with a warning", () => {
    const r = calculateSuggestedReserve(
      guided({
        expectedAnnualRevenueExVatCents: toCents(10_000),
        expectedDeductibleCostsExVatCents: toCents(15_000),
      })
    );
    if (r.status !== "calculated") throw new Error("expected calculated");
    expect(r.reserveCents).toBe(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("is unavailable for a year with no verified figures", () => {
    const r = calculateSuggestedReserve(
      guided({
        taxYear: 2031,
        expectedAnnualRevenueExVatCents: toCents(50_000),
      })
    );
    expect(r.status).toBe("unavailable");
    if (r.status !== "unavailable") return;
    expect(r.reason).toContain("2031");
  });
});

describe("validateReservePercentage", () => {
  it("flags negative as invalid", () => {
    expect(validateReservePercentage(-1).valid).toBe(false);
  });
  it("allows >100 but returns an advisory message", () => {
    const v = validateReservePercentage(120);
    expect(v.valid).toBe(true);
    expect(v.error).not.toBeNull();
  });
  it("passes a normal value", () => {
    expect(validateReservePercentage(30)).toEqual({ valid: true, error: null });
  });
});
