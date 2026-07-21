import { describe, it, expect } from "vitest";
import { toCents } from "./money";
import { getActiveTaxYearConfig } from "./taxYearConfig";
import {
  calculateSuggestedReserve,
  validateReservePercentage,
} from "./reserves";

const config2026 = getActiveTaxYearConfig(2026);
const unverified = getActiveTaxYearConfig(2031);

describe("own-rule reserve", () => {
  it("applies a percentage to the profit base", () => {
    const r = calculateSuggestedReserve(
      { mode: "own-rule", percentage: 30 },
      config2026,
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
      config2026,
      { profitBaseCents: toCents(1000) }
    );
    expect(r.status).toBe("unavailable");
  });
  it("allows >100% but warns", () => {
    const r = calculateSuggestedReserve(
      { mode: "own-rule", percentage: 120 },
      config2026,
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
      config2026,
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
      config2026,
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
      },
      config2026
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
      },
      config2026
    );
    expect(r.status).toBe("calculated");
    if (r.status !== "calculated") return;
    expect(r.reserveCents).toBe(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

describe("guided-estimate reserve", () => {
  it("applies flat 30% income tax plus a separate Zvw line", () => {
    const r = calculateSuggestedReserve(
      {
        mode: "guided-estimate",
        expectedAnnualRevenueExVatCents: toCents(50000),
        expectedDeductibleCostsExVatCents: toCents(10000),
        alreadyReservedCents: toCents(0),
        alreadyPaidCents: toCents(0),
      },
      config2026
    );
    expect(r.status).toBe("calculated");
    if (r.status !== "calculated") return;
    // profit 40000 → income tax 30% = 12000; Zvw 4.85% of 40000 = 1940.
    expect(r.zvwCents).toBe(toCents(1940));
    expect(r.reserveCents).toBe(toCents(13940));
    expect(r.reserveRangeCents).not.toBeNull();
  });
  it("caps the Zvw base at the maximum contribution income", () => {
    const r = calculateSuggestedReserve(
      {
        mode: "guided-estimate",
        expectedAnnualRevenueExVatCents: toCents(200000),
        expectedDeductibleCostsExVatCents: toCents(0),
        alreadyReservedCents: toCents(0),
        alreadyPaidCents: toCents(0),
      },
      config2026
    );
    if (r.status !== "calculated") throw new Error("expected calculated");
    // Zvw capped at 4.85% of 79409 = 3851.34 → 385134 cents.
    expect(r.zvwCents).toBe(toCents(79409 * 0.0485));
  });
  it("floors to zero when costs exceed revenue, with a warning", () => {
    const r = calculateSuggestedReserve(
      {
        mode: "guided-estimate",
        expectedAnnualRevenueExVatCents: toCents(10000),
        expectedDeductibleCostsExVatCents: toCents(15000),
        alreadyReservedCents: toCents(0),
        alreadyPaidCents: toCents(0),
      },
      config2026
    );
    if (r.status !== "calculated") throw new Error("expected calculated");
    expect(r.reserveCents).toBe(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
  it("is unavailable for an unverified tax year", () => {
    const r = calculateSuggestedReserve(
      {
        mode: "guided-estimate",
        expectedAnnualRevenueExVatCents: toCents(50000),
        expectedDeductibleCostsExVatCents: toCents(10000),
        alreadyReservedCents: toCents(0),
        alreadyPaidCents: toCents(0),
      },
      unverified
    );
    expect(r.status).toBe("unavailable");
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
