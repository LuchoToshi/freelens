import { describe, expect, it } from "vitest";
import {
  MAX_ESTIMATE_RATE,
  rateEstimateForTargetNet,
} from "@/lib/domain/rateEstimate";
import { fromCents } from "@/lib/domain/money";

describe("rateEstimateForTargetNet", () => {
  it("solves the worked case: 40k net, 30% rate, 140 days, 6k costs", () => {
    const r = rateEstimateForTargetNet({
      targetAnnualNet: 40_000,
      billableUnitsPerYear: 140,
      annualBusinessCosts: 6_000,
      effectiveTaxRatePercent: 30,
    });
    // profit = 40000 / 0.7 = 57142.86 → 57142.86, tax ≈ 17142.86
    expect(fromCents(r.estimatedTax)).toBeCloseTo(17_142.86, 1);
    expect(fromCents(r.requiredGrossRevenue)).toBeCloseTo(63_142.86, 1);
    // 63142.86 / 140 = 451.02 → rounds up to 452
    expect(fromCents(r.requiredRatePerUnit)).toBe(452);
  });

  it("reconciles: revenue − costs − tax = take-home, to the cent", () => {
    for (const pct of [0, 12.5, 30, 41, 55]) {
      const r = rateEstimateForTargetNet({
        targetAnnualNet: 37_331,
        billableUnitsPerYear: 117,
        annualBusinessCosts: 4_211,
        effectiveTaxRatePercent: pct,
      });
      expect(
        r.requiredGrossRevenue - r.annualBusinessCosts - r.estimatedTax
      ).toBe(r.takeHome);
    }
  });

  it("at 0% the revenue is net plus costs and tax is zero", () => {
    const r = rateEstimateForTargetNet({
      targetAnnualNet: 30_000,
      billableUnitsPerYear: 100,
      annualBusinessCosts: 2_000,
      effectiveTaxRatePercent: 0,
    });
    expect(r.estimatedTax).toBe(0);
    expect(fromCents(r.requiredGrossRevenue)).toBe(32_000);
    expect(fromCents(r.requiredRatePerUnit)).toBe(320);
  });

  it("clamps absurd rates to the maximum and reports the clamp", () => {
    const r = rateEstimateForTargetNet({
      targetAnnualNet: 30_000,
      billableUnitsPerYear: 100,
      annualBusinessCosts: 0,
      effectiveTaxRatePercent: 99,
    });
    expect(r.effectiveTaxRatePercent).toBe(MAX_ESTIMATE_RATE);
    expect(Number.isFinite(r.requiredGrossRevenue)).toBe(true);
  });

  it("rounds the per-unit rate up, never down", () => {
    const r = rateEstimateForTargetNet({
      targetAnnualNet: 10_000,
      billableUnitsPerYear: 3,
      annualBusinessCosts: 0,
      effectiveTaxRatePercent: 0,
    });
    // 10000 / 3 = 3333.33… → 3334
    expect(fromCents(r.requiredRatePerUnit)).toBe(3_334);
  });

  it("refuses zero billable units", () => {
    expect(() =>
      rateEstimateForTargetNet({
        targetAnnualNet: 10_000,
        billableUnitsPerYear: 0,
        annualBusinessCosts: 0,
        effectiveTaxRatePercent: 30,
      })
    ).toThrow();
  });
});
