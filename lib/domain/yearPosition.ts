/**
 * How much profit the user expects this year, accumulated one job at a time.
 *
 * This exists because of where it is used, not because anyone wants to track a
 * number. Dutch income tax runs up a progressive curve, so the reserve on a
 * given job depends entirely on where the year already sits. Step 3 of the quote
 * flow used to ask the user to guess that on a slider. A guess in that slot is
 * the weakest input in the most important calculation.
 *
 * It is deliberately ONE number and a year. Not a list of jobs, not a ledger,
 * not something to maintain. The moment this becomes a register the user has to
 * keep tidy, it is dead: the person it is for has already declined to adopt
 * bookkeeping software.
 *
 * Undo is a first-class concern rather than a nicety. A mis-tap here silently
 * shifts every later reserve on the curve, and there is nothing on screen that
 * would tell the user it happened.
 *
 * Pure. The tax year is always passed in; nothing here reads a clock.
 */
import { asCentsUnsafe, type Cents } from "@/lib/domain/money";

export interface YearPosition {
  /** Expected profit for the year so far, in cents. Never negative. */
  profitCents: Cents;
  /** The tax year these euros belong to. */
  taxYear: number;
}

export function emptyYearPosition(taxYear: number): YearPosition {
  return { profitCents: asCentsUnsafe(0), taxYear };
}

/**
 * What a stored position is worth for the year being calculated.
 *
 * A position from a previous year is not carried forward and not silently
 * reused: the brackets, the deductions and the credits are all different, so
 * last year's total would land this year's jobs in the wrong place on the
 * curve. It resets, and the caller is told so it can say so once.
 */
export function resolveYearPosition(
  stored: YearPosition | null,
  currentTaxYear: number
): { position: YearPosition; rolledOver: boolean } {
  if (!stored) {
    return { position: emptyYearPosition(currentTaxYear), rolledOver: false };
  }
  if (stored.taxYear !== currentTaxYear) {
    return { position: emptyYearPosition(currentTaxYear), rolledOver: true };
  }
  return { position: stored, rolledOver: false };
}

/** Adds a job's contribution. Floors at zero: a position is never a debt. */
export function addToYearPosition(
  position: YearPosition,
  contributionCents: Cents
): YearPosition {
  return {
    ...position,
    profitCents: asCentsUnsafe(Math.max(0, position.profitCents + contributionCents)),
  };
}

/**
 * What a job adds to the year: the fee minus its own costs.
 *
 * btw never appears, because it was never income. Job costs come off because
 * they are deductible, so they never became profit either. This is the same
 * figure the engine calls `taxableDelta`, restated here so the caller does not
 * have to know that.
 */
export function jobContribution(feeExVat: Cents, jobCosts: Cents): Cents {
  return asCentsUnsafe(feeExVat - jobCosts);
}

/**
 * A stable fingerprint of the result on screen.
 *
 * Counting is idempotent per result: tapping twice must not add twice, because
 * the second tap is almost always a mis-tap or an impatient double-click rather
 * than a genuine second job at the identical price. Change any input and the
 * fingerprint changes, so a genuinely different job counts again.
 *
 * The year is in the key so the same job may be counted once in each year, which
 * is the correct behaviour after a rollover.
 */
export function countKey(parts: {
  feeExVatCents: number;
  jobCostsCents: number;
  vatRate: number;
  taxYear: number;
}): string {
  return [parts.taxYear, parts.feeExVatCents, parts.jobCostsCents, parts.vatRate].join(":");
}

// ---------------------------------------------------------------------------
// Storage safety
// ---------------------------------------------------------------------------

/**
 * Turns an unknown stored payload into a position, or null.
 *
 * Anything unreadable becomes null rather than a zero, so the UI falls back to
 * its default slider instead of silently telling the user they have earned
 * nothing this year.
 */
export function sanitizeYearPosition(value: unknown): YearPosition | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;

  if (
    typeof v.profitCents !== "number" ||
    !Number.isFinite(v.profitCents) ||
    !Number.isInteger(v.profitCents) ||
    v.profitCents < 0
  ) {
    return null;
  }
  if (
    typeof v.taxYear !== "number" ||
    !Number.isFinite(v.taxYear) ||
    !Number.isInteger(v.taxYear)
  ) {
    return null;
  }

  return { profitCents: asCentsUnsafe(v.profitCents), taxYear: v.taxYear };
}
