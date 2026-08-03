import { describe, expect, it } from "vitest";
import { fromCents, toCents } from "@/lib/domain/money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import {
  flatRuleError,
  HIGH_COST_CASE,
  HIGH_EARNER_CASE,
  type FlatRuleCase,
} from "@/lib/tax/flatRuleEvidence";
import { referenceAnnualLiability } from "@/lib/tax/__testkit/referenceLiability";

/**
 * These two figures are printed on /tarief as evidence that the old flat rule
 * was wrong. Evidence that has drifted from the engine is worse than no
 * evidence, so every part of both cases is checked back against the engine and
 * against the independent reference.
 *
 * If a config change moves either number, this fails and the page copy has to
 * be updated with it. That is the point.
 */

const CASES: { name: string; c: FlatRuleCase }[] = [
  { name: "high-cost (OLD_VS_NEW case 9)", c: HIGH_COST_CASE },
  { name: "high earner (OLD_VS_NEW case 7)", c: HIGH_EARNER_CASE },
];

function engineBill(profitCents: number): number {
  return calculateTaxReserve({
    taxYear: 2026,
    country: "NL",
    projectedAnnualProfit: profitCents / 100,
    ytdReserved: 0,
    meetsHoursCriterion: true,
    isStarter: false,
  }).totalLiability;
}

describe("the figures the site cites are the figures the engine produces", () => {
  it.each(CASES)("$name states the real bill correctly", ({ c }) => {
    expect(engineBill(c.profit)).toBe(c.realBill);
  });

  it.each(CASES)("$name agrees with the independent reference", ({ c }) => {
    const reference = referenceAnnualLiability({ profit: fromCents(c.profit) });
    // The engine rounds every line upward, so it sits at or just above exact.
    expect(c.realBill).toBeGreaterThanOrEqual(reference);
    expect(c.realBill - reference).toBeLessThanOrEqual(20);
  });

  it.each(CASES)("$name is internally consistent", ({ c }) => {
    expect(c.revenue - c.costs).toBe(c.profit);
    // The old rule was 30% of revenue excluding btw.
    expect(c.oldReserve).toBe(toCents(fromCents(c.revenue) * 0.3));
  });
});

describe("the claim that the rule errs in both directions", () => {
  it("holds: one case over-reserves, the other under-reserves", () => {
    expect(HIGH_COST_CASE.oldReserve).toBeGreaterThan(HIGH_COST_CASE.realBill);
    expect(HIGH_EARNER_CASE.oldReserve).toBeLessThan(HIGH_EARNER_CASE.realBill);
  });

  it("states errors big enough to be worth printing", () => {
    // Both are thousands of euros. If a config change shrank either to noise,
    // the sentence on the page would stop being worth making.
    expect(flatRuleError(HIGH_COST_CASE)).toBeGreaterThan(toCents(10_000));
    expect(flatRuleError(HIGH_EARNER_CASE)).toBeGreaterThan(toCents(3_000));
  });

  it("reports the exact errors the copy quotes", () => {
    expect(flatRuleError(HIGH_COST_CASE)).toBe(toCents(16_720.2));
    expect(flatRuleError(HIGH_EARNER_CASE)).toBe(toCents(4_914.9));
  });
});
