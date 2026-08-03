/**
 * Progressive bracket tax and the top-bracket rate adjustment.
 *
 * Nothing here knows it is calculating Dutch tax. Brackets are data.
 */
import { asCentsUnsafe, toCents, type Cents } from "@/lib/domain/money";
import { ceilCents, percentUp } from "@/lib/tax/rounding";
import type { BracketConfig, RateAdjustmentConfig } from "@/lib/tax/types";

export interface BracketSlice {
  /** 1-based, matching how the official tables number them. */
  bracket: number;
  rate: number;
  incomeInBracket: Cents;
  tax: Cents;
}

export interface BracketTaxResult {
  tax: Cents;
  slices: BracketSlice[];
}

/**
 * Applies the bracket table to a taxable income. Income at or below zero is
 * taxed at zero: a loss is carried forward on the real return, which this
 * engine does not model, so the safe answer for a planning reserve is no tax
 * this year and no credit for the loss either.
 */
export function bracketTax(
  taxableIncome: Cents,
  brackets: BracketConfig[]
): BracketTaxResult {
  const slices: BracketSlice[] = [];
  if (taxableIncome <= 0) {
    return { tax: asCentsUnsafe(0), slices };
  }

  let lowerBound = 0;
  let total = 0;

  brackets.forEach((bracket, index) => {
    const upperBound = bracket.upTo === null ? Number.POSITIVE_INFINITY : toCents(bracket.upTo);
    const inBracket = Math.max(0, Math.min(taxableIncome, upperBound) - lowerBound);
    lowerBound = upperBound;
    if (inBracket <= 0) return;

    const sliceCents = asCentsUnsafe(inBracket);
    const sliceTax = percentUp(sliceCents, bracket.rate);
    total += sliceTax;
    slices.push({
      bracket: index + 1,
      rate: bracket.rate,
      incomeInBracket: sliceCents,
      tax: sliceTax,
    });
  });

  return { tax: ceilCents(total), slices };
}

/**
 * The correction that caps how much tax a deduction can save you.
 *
 * Deductions come off the top of your income, so without this they would save
 * tax at the top rate. The correction adds back a fixed percentage of whatever
 * part of the deduction sat above the threshold, which is what caps the benefit
 * at a lower rate.
 *
 * @param deductionsSubjectToAdjustment total of the deductions that qualify
 * @param incomeBeforeDeductions        income the deductions were taken from
 */
export function rateAdjustment(
  deductionsSubjectToAdjustment: Cents,
  incomeBeforeDeductions: Cents,
  config: RateAdjustmentConfig | null
): Cents {
  if (!config || deductionsSubjectToAdjustment <= 0) {
    return asCentsUnsafe(0);
  }
  const threshold = toCents(config.appliesAboveIncome);
  const incomeAboveThreshold = Math.max(0, incomeBeforeDeductions - threshold);
  const affected = Math.min(deductionsSubjectToAdjustment, incomeAboveThreshold);
  if (affected <= 0) {
    return asCentsUnsafe(0);
  }
  return percentUp(asCentsUnsafe(affected), config.correctionRate);
}
