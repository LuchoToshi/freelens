/**
 * Rounding policy for the tax engine.
 *
 * Rule: round in whichever direction increases the amount set aside. Under
 * reserving hands the user a surprise bill they cannot pay; over reserving only
 * costs them liquidity they get back. Those two outcomes are not equally bad,
 * so the rounding is deliberately asymmetric.
 *
 * In practice:
 * - tax and social contributions round UP to the cent      (`ceilCents`)
 * - deductions and credits round DOWN to the cent          (`floorCents`)
 * - the final amount to set aside rounds UP to whole euros (`ceilToEuro`)
 *
 * Every breakdown line is a whole number of cents, so the lines the UI shows
 * always reconcile exactly with the totals. Total drift from this policy is a
 * few cents a year, always in the user's favour.
 */
import { asCentsUnsafe, type Cents } from "@/lib/domain/money";

/**
 * Float noise guard. `cents * 4.85 / 100` can land a whisker either side of a
 * whole cent purely from binary representation, which would flip a ceil. We
 * snap to a millionth of a cent first, far below any real value.
 */
function snap(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export function ceilCents(value: number): Cents {
  return asCentsUnsafe(Math.ceil(snap(value)));
}

export function floorCents(value: number): Cents {
  return asCentsUnsafe(Math.floor(snap(value)));
}

/** Applies a percentage to a cents amount, rounding up. */
export function percentUp(cents: Cents, percent: number): Cents {
  return ceilCents((cents * percent) / 100);
}

/** Applies a percentage to a cents amount, rounding down. */
export function percentDown(cents: Cents, percent: number): Cents {
  return floorCents((cents * percent) / 100);
}

/**
 * Rounds up to the next whole euro. Applied only to the amount the user is
 * asked to set aside, never to a breakdown line.
 */
export function ceilToEuro(cents: Cents): Cents {
  return asCentsUnsafe(Math.ceil(cents / 100) * 100);
}
