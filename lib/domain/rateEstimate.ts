/**
 * The rate question outside the Netherlands: same arithmetic, honest about tax.
 *
 * The NL flow solves over verified Belastingdienst rules. We have verified no
 * other country's rules, and pretending otherwise is the one thing this
 * product must never do. So elsewhere the tax input belongs to the user: an
 * effective rate on profit, clearly labelled as their estimate. Everything
 * around it — costs, billable units, the division — is arithmetic that is true
 * in any country and any currency.
 *
 * No model, no clock, no locale in here. Rounding follows the house rule:
 * whatever protects the user rounds against them being short, so the required
 * rate rounds UP to the whole unit.
 */
import { asCentsUnsafe, fromCents, toCents, type Cents } from "@/lib/domain/money";

export interface RateEstimateRequest {
  /** Take-home you want from the business this year, after tax, in whole currency units. */
  targetAnnualNet: number;
  /** Days (or hours) you can realistically bill in a year. Must be above zero. */
  billableUnitsPerYear: number;
  /** Ongoing business costs per year, in whole currency units. */
  annualBusinessCosts: number;
  /**
   * The user's estimate of income tax plus social contributions, as a percent
   * of profit. Theirs to set; never presented as verified.
   */
  effectiveTaxRatePercent: number;
}

export interface RateEstimateResult {
  requiredGrossRevenue: Cents;
  /** requiredGrossRevenue / billableUnitsPerYear, rounded UP to the whole unit. */
  requiredRatePerUnit: Cents;
  /** profit − takeHome under the estimated rate. */
  estimatedTax: Cents;
  takeHome: Cents;
  annualBusinessCosts: Cents;
  /** The rate actually used after clamping, so the UI can echo it truthfully. */
  effectiveTaxRatePercent: number;
}

/** Above this an "effective rate on profit" stops being a plausible estimate. */
export const MAX_ESTIMATE_RATE = 70;
export const MIN_ESTIMATE_RATE = 0;

export function rateEstimateForTargetNet(request: RateEstimateRequest): RateEstimateResult {
  if (request.billableUnitsPerYear <= 0) {
    throw new Error("billableUnitsPerYear must be above zero");
  }
  const pct = Math.min(
    MAX_ESTIMATE_RATE,
    Math.max(MIN_ESTIMATE_RATE, request.effectiveTaxRatePercent)
  );

  const takeHome = toCents(Math.max(0, request.targetAnnualNet));
  const costs = toCents(Math.max(0, request.annualBusinessCosts));

  // net = profit × (1 − rate)  ⇒  profit = net / (1 − rate). Ceil so the tax
  // line absorbs the rounding and the take-home is never short.
  const profit = asCentsUnsafe(Math.ceil(takeHome / (1 - pct / 100)));
  const estimatedTax = asCentsUnsafe(profit - takeHome);
  const requiredGrossRevenue = asCentsUnsafe(profit + costs);

  const perUnitEuros = Math.ceil(
    fromCents(requiredGrossRevenue) / request.billableUnitsPerYear
  );

  return {
    requiredGrossRevenue,
    requiredRatePerUnit: toCents(perUnitEuros),
    estimatedTax,
    takeHome,
    annualBusinessCosts: costs,
    effectiveTaxRatePercent: pct,
  };
}
