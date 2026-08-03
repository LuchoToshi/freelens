/**
 * The one numerical solve both reverse directions need.
 *
 * "How much profit do I need for €X to survive the tax" is the same question
 * whether it is asked about a single job (mode 1, on top of the profit already
 * projected) or about a whole year (mode 2, on top of nothing). Only the
 * starting point differs, so there is one solver rather than two.
 *
 * It bisects the real liability function. Dividing the target by one minus the
 * marginal rate is the shortcut every flat calculator takes, and it is wrong
 * wherever the answer spans a bracket edge, a credit phase-out, the deduction
 * cap or the contribution ceiling. See the worked example in ./quote.ts.
 */
import { asCentsUnsafe, type Cents } from "@/lib/domain/money";

/** Guards against a pathological config looping rather than converging. */
const MAX_ITERATIONS = 80;

export interface SolveResult {
  /** Extra profit needed on top of `baseProfit`, in cents. */
  delta: Cents;
  iterations: number;
}

/**
 * Finds the smallest `delta` where `delta - (liability(base + delta) -
 * liability(base))` reaches `target`.
 *
 * Monotonic in `delta` for any marginal rate below 100%, which is what makes
 * bisection safe here. Settles on the first amount that reaches the target and
 * never one cent short: rounding follows the same asymmetry as the rest of the
 * engine, because being under is a real shortfall and being over is a rounding
 * artefact worth a cent.
 *
 * @param target      what must survive the tax, in cents
 * @param baseProfit  profit already expected before this addition, in cents
 * @param liabilityAt the annual bill at a given profit. Called ~20 times.
 */
export function solveNetDelta(
  target: Cents,
  baseProfit: Cents,
  liabilityAt: (profit: Cents) => Cents
): SolveResult {
  if (target <= 0) {
    return { delta: asCentsUnsafe(0), iterations: 0 };
  }

  const baseLiability = liabilityAt(baseProfit);
  const netFor = (delta: number): number =>
    delta - (liabilityAt(asCentsUnsafe(baseProfit + delta)) - baseLiability);

  // Plain numbers, not Cents: these are search bounds, not money yet.
  let low: number = target;
  let high: number = target * 2;
  let iterations = 0;

  // Grow the upper bound until it clears the target. Doubling terminates for
  // any marginal rate below 100%.
  while (netFor(high) < target && iterations < MAX_ITERATIONS) {
    low = high;
    high *= 2;
    iterations += 1;
  }

  while (high - low > 1 && iterations < MAX_ITERATIONS) {
    const mid = Math.floor((low + high) / 2);
    if (netFor(mid) < target) {
      low = mid;
    } else {
      high = mid;
    }
    iterations += 1;
  }

  return {
    delta: asCentsUnsafe(netFor(low) >= target ? low : high),
    iterations,
  };
}

/**
 * Finds the lowest profit at which `measure` reaches `threshold`.
 *
 * Used to locate where a job crosses a bracket edge. `measure` is taxable
 * income, which rises with profit but more slowly than it, so the crossing
 * point cannot be read off the profit figure directly.
 *
 * Assumes `measure` is non-decreasing. Returns `high` when the threshold is
 * never reached in the range, which callers must check for.
 */
export function solveForThreshold(
  threshold: Cents,
  low: Cents,
  high: Cents,
  measure: (profit: Cents) => Cents
): Cents {
  let lo: number = low;
  let hi: number = high;
  let iterations = 0;

  while (hi - lo > 1 && iterations < MAX_ITERATIONS) {
    const mid = Math.floor((lo + hi) / 2);
    if (measure(asCentsUnsafe(mid)) < threshold) {
      lo = mid;
    } else {
      hi = mid;
    }
    iterations += 1;
  }

  return asCentsUnsafe(hi);
}
