/**
 * The old flat rule versus the engine, over the ten golden cases.
 *
 * This lives in `lib/` rather than in the test so the comparison the site shows
 * and the comparison `OLD_VS_NEW.md` records come from one function. Evidence
 * that has drifted from the thing it claims to prove is worse than no evidence,
 * and a page and a test computing it separately is exactly how that happens.
 *
 * Pure: no clock, no filesystem, no network. Every figure is derived from the
 * live engine and the shared golden cases.
 */
import { toCents, type Cents } from "@/lib/domain/money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import {
  GOLDEN_CASES,
  inputFor,
  profitOf,
  type GoldenCase,
} from "@/lib/tax/goldenCases";

/** The percentage the tool used to apply. */
export const OLD_FLAT_RATE = 30;

/**
 * A realistic loonheffing on €30.000 of salary in 2026. The engine puts the tax
 * on that income on its own at €2.245,88, so €2.250 is the right order.
 */
export const HYBRID_WITHHELD = 2250;

const ZVW_RATE = 4.85;
const ZVW_CAP = 79_409;

/** Old model A: 30% of revenue excluding VAT. What most users actually saw. */
export function oldPerPayment(testCase: GoldenCase): Cents {
  return toCents((testCase.revenueExVat * OLD_FLAT_RATE) / 100);
}

/** Old model B: 30% of profit, plus Zvw as a separate line. */
export function oldGuidedEstimate(testCase: GoldenCase): Cents {
  const profit = Math.max(0, profitOf(testCase));
  const incomeTax = (profit * OLD_FLAT_RATE) / 100;
  const zvw = (Math.min(profit, ZVW_CAP) * ZVW_RATE) / 100;
  return toCents(incomeTax + zvw);
}

export interface ComparisonRow {
  testCase: GoldenCase;
  profit: number;
  /** 30% of revenue. */
  oldA: Cents;
  /** 30% of profit plus Zvw. */
  oldB: Cents;
  /** What the engine says is really owed. */
  actual: Cents;
  /** Positive when the old rule took too much, negative when too little. */
  deltaA: number;
  deltaB: number;
}

export function buildComparisonRows(): ComparisonRow[] {
  return GOLDEN_CASES.map((testCase) => {
    const actual = calculateTaxReserve(inputFor(testCase)).totalLiability;
    const oldA = oldPerPayment(testCase);
    const oldB = oldGuidedEstimate(testCase);
    return {
      testCase,
      profit: profitOf(testCase),
      oldA,
      oldB,
      actual,
      deltaA: oldA - actual,
      deltaB: oldB - actual,
    };
  });
}

/**
 * The three cases the site leads with, in this order:
 *
 *   10  a loss year, where the rule asks for money against a bill of nothing
 *    9  high costs, where taxing revenue over-reserves by the most
 *    7  a good year, where the rule stops keeping up and under-reserves
 *
 * Chosen rather than sorted by size on purpose. Sorting by magnitude returns
 * four over-reserving cases and reads as "the old rule was too cautious",
 * which is only half true and the harmless half. The claim is that a flat
 * percentage errs in BOTH directions, so the evidence has to show both.
 *
 * The site shows three, not all ten: a page that lists every case is a table
 * nobody reads. The full set stays in OLD_VS_NEW.md for anyone checking.
 */
const HEADLINE_IDS = [10, 9, 7];

export function headlineRows(): ComparisonRow[] {
  const byId = new Map(buildComparisonRows().map((r) => [r.testCase.id, r]));
  return HEADLINE_IDS.map((id) => {
    const row = byId.get(id);
    if (!row) {
      throw new Error(`Golden case ${id} is missing; the evidence page needs it.`);
    }
    return row;
  });
}
