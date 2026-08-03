/**
 * Does this job push you into a higher bracket, and how much of it lands there?
 *
 * This is the thing a flat-percentage calculator structurally cannot produce.
 * It needs the real bracket table, the real taxable-income measure, and the
 * knowledge that the two are not the same as profit.
 *
 * The subtlety that makes it worth its own module: bracket thresholds apply to
 * TAXABLE INCOME, not to profit or to the invoice. €10.000 more profit adds
 * roughly €8.730 of taxable income once the MKB-winstvrijstelling has taken its
 * 12,7%, and less again if a deduction moves. So the crossing point is found by
 * solving for the profit at which taxable income reaches the threshold, then
 * reporting the split in profit terms, which is the unit the freelancer is
 * actually pricing in.
 */
import { asCentsUnsafe, toCents, type Cents } from "@/lib/domain/money";
import { solveForThreshold } from "@/lib/tax/solve";
import type { BracketConfig } from "@/lib/tax/types";

export interface BracketCrossing {
  crossed: boolean;
  /** The taxable-income threshold passed, in euros. */
  threshold: number;
  /** Profit from this job taxed below the threshold, in cents. */
  amountBelow: Cents;
  /** Profit from this job taxed above it, in cents. */
  amountAbove: Cents;
  /**
   * Statutory bracket rate below the threshold, as a percent.
   *
   * This is the rate on taxable income, NOT the share of those job euros that
   * disappears. Deductions, the MKB exemption and the credit phase-outs all sit
   * between the two. The real blended cost of the job is `effectiveJobRate`.
   */
  rateBelow: number;
  /** Statutory bracket rate above the threshold, as a percent. */
  rateAbove: number;
}

/**
 * Reports the highest bracket threshold this job crosses, or null.
 *
 * A job large enough to cross two thresholds reports the top one, with
 * `amountBelow` spanning everything under it. That keeps the statement the UI
 * makes true ("€X of this is taxed at the top rate") without inventing a
 * second, quieter sentence nobody reads.
 *
 * @param profitBefore profit projected before the job, in cents
 * @param profitAfter  profit projected after it, in cents
 * @param brackets     the country's bracket table, thresholds in euros
 * @param taxableIncomeAt taxable income at a given profit
 */
export function detectBracketCrossing(
  profitBefore: Cents,
  profitAfter: Cents,
  brackets: BracketConfig[],
  taxableIncomeAt: (profit: Cents) => Cents
): BracketCrossing | null {
  if (profitAfter <= profitBefore) {
    return null;
  }

  const incomeBefore = taxableIncomeAt(profitBefore);
  const incomeAfter = taxableIncomeAt(profitAfter);

  // Thresholds are the upper bounds of every bracket but the last.
  const thresholds = brackets
    .map((bracket, index) => ({ bracket, index }))
    .filter((entry) => entry.bracket.upTo !== null)
    .map((entry) => ({
      euros: entry.bracket.upTo as number,
      cents: toCents(entry.bracket.upTo as number),
      rateBelow: entry.bracket.rate,
      rateAbove: brackets[entry.index + 1]?.rate ?? entry.bracket.rate,
    }))
    .filter((t) => t.cents >= incomeBefore && t.cents < incomeAfter)
    .sort((a, b) => a.cents - b.cents);

  const top = thresholds.at(-1);
  if (!top) {
    return null;
  }

  // The profit level at which taxable income reaches the threshold. Bisected
  // rather than derived, so it stays right when a deduction cap or a starter
  // allowance bends the relationship between profit and taxable income.
  const crossingProfit = solveForThreshold(
    top.cents,
    profitBefore,
    profitAfter,
    taxableIncomeAt
  );

  return {
    crossed: true,
    threshold: top.euros,
    amountBelow: asCentsUnsafe(Math.max(0, crossingProfit - profitBefore)),
    amountAbove: asCentsUnsafe(Math.max(0, profitAfter - crossingProfit)),
    rateBelow: top.rateBelow,
    rateAbove: top.rateAbove,
  };
}
