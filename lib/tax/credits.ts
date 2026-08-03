/**
 * Piecewise-linear tax credits.
 *
 * Credits come off the tax you owe, not off your income, and they are the
 * single largest thing a flat-percentage reserve model gets wrong at low and
 * middle incomes. Both Dutch credits are published as income tables with a
 * base amount and a slope per band, so one segment shape expresses both.
 */
import { asCentsUnsafe, toCents, type Cents } from "@/lib/domain/money";
import { floorCents } from "@/lib/tax/rounding";
import type { CreditConfig, CreditSegment } from "@/lib/tax/types";

function findSegment(incomeCents: Cents, segments: CreditSegment[]): CreditSegment {
  for (const segment of segments) {
    if (segment.to === null) return segment;
    if (incomeCents <= toCents(segment.to)) return segment;
  }
  return segments[segments.length - 1];
}

/**
 * Evaluates one credit at a given income.
 *
 * Rounded DOWN and floored at zero: a smaller credit means more tax, which
 * means a larger reserve. Note that published tables can leave a few cents of
 * discontinuity at a band boundary; we follow the table as published rather
 * than smoothing it, because the table is what the assessment uses.
 */
export function evaluateCredit(income: Cents, credit: CreditConfig): Cents {
  const clamped = asCentsUnsafe(Math.max(0, income));
  const segment = findSegment(clamped, credit.segments);
  const fromCents = toCents(segment.from);
  const baseCents = toCents(segment.baseAmount);
  const value = floorCents(baseCents + ((clamped - fromCents) * segment.rate) / 100);
  return asCentsUnsafe(Math.max(0, value));
}

export interface AppliedCredit {
  id: string;
  label: string;
  explanation: string;
  base: string;
  /** The income figure the credit was evaluated at. */
  assessedOn: Cents;
  amount: Cents;
}

export interface CreditResult {
  credits: AppliedCredit[];
  /** Sum before any limit by tax owed. */
  total: Cents;
}

export function evaluateCredits(
  credits: CreditConfig[],
  incomeFor: (base: string) => Cents
): CreditResult {
  const applied: AppliedCredit[] = [];
  let total = 0;
  for (const credit of credits) {
    const assessedOn = incomeFor(credit.base);
    const amount = evaluateCredit(assessedOn, credit);
    total += amount;
    applied.push({
      id: credit.id,
      label: credit.label,
      explanation: credit.explanation,
      base: credit.base,
      assessedOn,
      amount,
    });
  }
  return { credits: applied, total: asCentsUnsafe(total) };
}
