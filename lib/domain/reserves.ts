/**
 * Income-tax + Zvw reserve suggestions.
 *
 * A reserve is ALWAYS a planning figure, never a tax assessment. Every result
 * carries a `source` the UI must display, so a number is never shown without
 * saying where it came from.
 *
 * The guided estimate runs the real tax engine in `lib/tax`: progressive
 * brackets, the entrepreneur deductions, the MKB-winstvrijstelling, both
 * heffingskortingen, and Zvw on its own capped base. It replaced a flat 30%
 * heuristic that was wrong in both directions, badly. See OLD_VS_NEW.md.
 */
import {
  asCentsUnsafe,
  fromCents,
  maxCents,
  minCents,
  subtractCents,
  type Cents,
} from "@/lib/domain/money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import type { TaxResult } from "@/lib/tax/types";

export type ReserveSource =
  | "own-rule"
  | "provisional-assessment"
  | "guided-estimate"
  | "manual";

export type ReserveMethod =
  | { mode: "own-rule"; percentage: number }
  | {
      mode: "provisional-assessment";
      expectedRemainingAnnualCents: Cents;
      alreadyPaidOrReservedCents: Cents;
      monthsRemaining?: number;
    }
  | {
      mode: "guided-estimate";
      /** Explicit, never read from the clock, so a stored estimate stays stable. */
      taxYear: number;
      country: string;
      expectedAnnualRevenueExVatCents: Cents;
      expectedDeductibleCostsExVatCents: Cents;
      /** At least 1.225 hours a year on the business. Unlocks the deductions. */
      meetsHoursCriterion: boolean;
      isStarter: boolean;
      /** Employment income or benefits alongside the business. */
      otherIncomeCents: Cents;
      /** Loonheffing the employer already withheld on that income. */
      otherIncomeTaxWithheldCents: Cents;
      alreadyReservedCents: Cents;
      alreadyPaidCents: Cents;
    };

export interface ReserveBreakdownStep {
  label: string;
  amountCents: Cents;
  /** Why this line is here. Written by the engine, shown by the UI verbatim. */
  explanation?: string;
}

/** Extra detail only the guided estimate can produce, because only it runs the engine. */
export interface GuidedEstimateDetail {
  totalLiabilityCents: Cents;
  netTaxCents: Cents;
  zvwCents: Cents;
  /** Share of total income that goes to tax and contributions. */
  effectiveRate: number;
  /** Share of the next euro of profit. This is what a per-payment reserve uses. */
  marginalRate: number;
  assumptions: string[];
  configVersion: string;
  configRetrievedAt: string;
}

export type SuggestedReserve =
  | {
      status: "calculated";
      source: Exclude<ReserveSource, "manual">;
      reserveCents: Cents;
      /** Low/high band for the guided estimate; null for exact methods. */
      reserveRangeCents: [Cents, Cents] | null;
      /** Zvw shown separately, never folded into reserveCents. */
      zvwCents: Cents | null;
      /** Populated for provisional-assessment when monthsRemaining is given. */
      perMonthCents: Cents | null;
      breakdown: ReserveBreakdownStep[];
      warnings: string[];
      /** Null for every mode except the guided estimate. */
      estimate: GuidedEstimateDetail | null;
    }
  | {
      status: "unavailable";
      source: Exclude<ReserveSource, "manual">;
      reason: string;
    };

export interface ReserveContext {
  /** Base amount own-rule applies its percentage to (e.g. a payment's net). */
  profitBaseCents?: Cents;
}

/**
 * How far the projected profit is swung to produce the low/high band.
 *
 * The old ±15% band was arbitrary decoration on a flat percentage. This one
 * answers a real question: what happens if the year comes in a tenth lighter or
 * heavier than projected. The engine is run at both ends, so the band picks up
 * bracket edges and credit phase-outs rather than scaling a single number.
 */
const PROFIT_SWING = 0.1;

export function calculateSuggestedReserve(
  method: ReserveMethod,
  context: ReserveContext = {}
): SuggestedReserve {
  switch (method.mode) {
    case "own-rule":
      return calculateOwnRule(method.percentage, context);
    case "provisional-assessment":
      return calculateProvisional(method);
    case "guided-estimate":
      return calculateGuided(method);
  }
}

function calculateOwnRule(
  percentage: number,
  context: ReserveContext
): SuggestedReserve {
  if (percentage < 0) {
    return {
      status: "unavailable",
      source: "own-rule",
      reason: "A reserve percentage can't be negative.",
    };
  }
  const base = context.profitBaseCents;
  if (base === undefined) {
    return {
      status: "unavailable",
      source: "own-rule",
      reason: "No amount to apply the reserve percentage to yet.",
    };
  }
  const warnings: string[] = [];
  if (percentage > 100) {
    warnings.push(
      "This reserve percentage is above 100%, so the reserve is larger than the amount itself."
    );
  }
  let reserveCents: Cents;
  if (base <= 0) {
    reserveCents = asCentsUnsafe(0);
    warnings.push(
      "There's nothing to reserve from this amount yet, so the reserve is €0."
    );
  } else {
    reserveCents = asCentsUnsafe((base * percentage) / 100);
  }
  return {
    status: "calculated",
    source: "own-rule",
    reserveCents,
    reserveRangeCents: null,
    zvwCents: null,
    perMonthCents: null,
    breakdown: [
      { label: "Amount to reserve from", amountCents: base },
      { label: `Your reserve rule (${percentage}%)`, amountCents: reserveCents },
    ],
    warnings,
    estimate: null,
  };
}

function calculateProvisional(
  method: Extract<ReserveMethod, { mode: "provisional-assessment" }>
): SuggestedReserve {
  const { expectedRemainingAnnualCents, alreadyPaidOrReservedCents, monthsRemaining } =
    method;
  const warnings: string[] = [];
  const rawRemaining = subtractCents(
    expectedRemainingAnnualCents,
    alreadyPaidOrReservedCents
  );
  const reserveCents = maxCents(rawRemaining, asCentsUnsafe(0));
  if (rawRemaining < 0) {
    warnings.push(
      "You've already reserved or paid more than the expected remaining amount, so nothing more needs to be set aside."
    );
  }
  let perMonthCents: Cents | null = null;
  if (monthsRemaining !== undefined && monthsRemaining > 0) {
    perMonthCents = asCentsUnsafe(reserveCents / monthsRemaining);
  }
  const breakdown: ReserveBreakdownStep[] = [
    { label: "Expected remaining this year", amountCents: expectedRemainingAnnualCents },
    { label: "Already paid or reserved", amountCents: alreadyPaidOrReservedCents },
    { label: "Still to set aside", amountCents: reserveCents },
  ];
  return {
    status: "calculated",
    source: "provisional-assessment",
    reserveCents,
    reserveRangeCents: null,
    zvwCents: null,
    perMonthCents,
    breakdown,
    warnings,
    estimate: null,
  };
}

function calculateGuided(
  method: Extract<ReserveMethod, { mode: "guided-estimate" }>
): SuggestedReserve {
  const {
    taxYear,
    country,
    expectedAnnualRevenueExVatCents,
    expectedDeductibleCostsExVatCents,
    meetsHoursCriterion,
    isStarter,
    otherIncomeCents,
    otherIncomeTaxWithheldCents,
    alreadyReservedCents,
    alreadyPaidCents,
  } = method;

  const rawProfit = subtractCents(
    expectedAnnualRevenueExVatCents,
    expectedDeductibleCostsExVatCents
  );
  const alreadyHandled = asCentsUnsafe(alreadyReservedCents + alreadyPaidCents);

  const run = (profitCents: number) =>
    calculateTaxReserve({
      taxYear,
      country,
      projectedAnnualProfit: fromCents(asCentsUnsafe(profitCents)),
      ytdReserved: fromCents(alreadyHandled),
      meetsHoursCriterion,
      isStarter,
      otherIncome: fromCents(otherIncomeCents),
      otherIncomeTaxWithheld: fromCents(otherIncomeTaxWithheldCents),
    });

  let result: TaxResult;
  try {
    result = run(rawProfit);
  } catch {
    // The engine refuses a year it has no verified figures for, rather than
    // reaching for last year's. The other reserve modes still work.
    return {
      status: "unavailable",
      source: "guided-estimate",
      reason: `Tax figures for ${taxYear} have not been verified yet. Use your own reserve percentage or a provisional assessment instead.`,
    };
  }

  const warnings: string[] = [];
  if (rawProfit <= 0) {
    warnings.push(
      "Your expected costs meet or exceed your expected revenue, so there is no income tax or Zvw to set aside for this year."
    );
  }
  if (alreadyHandled > result.totalLiability) {
    warnings.push(
      "You have already set aside more than this estimate, so nothing more is suggested."
    );
  }
  if (otherIncomeCents > 0 && otherIncomeTaxWithheldCents <= 0) {
    warnings.push(
      "You have employment income but have not entered the loonheffing your employer already withheld, so this estimate is higher than what you actually still owe."
    );
  }

  // Band from a real swing in the projected year, not a decorative percentage.
  const low = run(rawProfit * (1 - PROFIT_SWING)).reserveGap;
  const high = run(rawProfit * (1 + PROFIT_SWING)).reserveGap;

  const breakdown: ReserveBreakdownStep[] = result.breakdown.map((line) => ({
    label: line.label,
    amountCents: line.amount,
    explanation: line.explanation,
  }));

  return {
    status: "calculated",
    source: "guided-estimate",
    reserveCents: result.reserveGap,
    reserveRangeCents: [minCents(low, high), maxCents(low, high)],
    zvwCents: result.zvw,
    perMonthCents: null,
    breakdown,
    warnings,
    estimate: {
      totalLiabilityCents: result.totalLiability,
      netTaxCents: result.netTax,
      zvwCents: result.zvw,
      effectiveRate: result.effectiveRate,
      marginalRate: result.marginalRate,
      assumptions: result.assumptions,
      configVersion: result.configVersion,
      configRetrievedAt: result.configRetrievedAt,
    },
  };
}

export interface PerPaymentReserveInput {
  /** The payment's net amount, excluding VAT and any linked deductible costs. */
  paymentNetCents: Cents;
  taxYear: number;
  country: string;
  projectedAnnualProfitCents: Cents;
  /** Profit already earned this year, before this payment. */
  ytdProfitCents: Cents;
  /** Already set aside this year, before this payment. */
  ytdReservedCents: Cents;
  meetsHoursCriterion: boolean;
  isStarter: boolean;
  otherIncomeCents: Cents;
  otherIncomeTaxWithheldCents: Cents;
}

export interface PerPaymentReserve {
  reserveCents: Cents;
  /** The rate this payment was actually reserved at, as a fraction. */
  appliedRate: number;
  /** Tax on the next euro. Correct, but the wrong number to reserve at. */
  marginalRate: number;
  /** The whole year's bill, for context. */
  annualLiabilityCents: Cents;
  assumptions: string[];
  configVersion: string;
  configRetrievedAt: string;
}

/**
 * What to hold back from one payment.
 *
 * This payment's share of the annual bill that is still outstanding, allocated
 * across the income still expected this year. It is a running balance, not a
 * rate, which is what makes it self-correcting: set aside too much early and
 * later payments take less.
 *
 * It is deliberately NOT the marginal rate. The marginal rate is what the next
 * euro costs, which is far above the average, and charging it on every payment
 * over-reserves a year several times over. That is the same class of error as
 * the flat 30% rule this engine replaced.
 *
 * Returns null when the year has no verified figures, so the caller can fall
 * back to the user's own percentage rule rather than showing nothing.
 */
export function calculatePerPaymentReserve(
  input: PerPaymentReserveInput
): PerPaymentReserve | null {
  if (input.paymentNetCents <= 0) return null;
  try {
    const result = calculateTaxReserve({
      taxYear: input.taxYear,
      country: input.country,
      projectedAnnualProfit: fromCents(input.projectedAnnualProfitCents),
      ytdReserved: fromCents(input.ytdReservedCents),
      ytdProfit: fromCents(input.ytdProfitCents),
      meetsHoursCriterion: input.meetsHoursCriterion,
      isStarter: input.isStarter,
      otherIncome: fromCents(input.otherIncomeCents),
      otherIncomeTaxWithheld: fromCents(input.otherIncomeTaxWithheldCents),
      paymentReceived: fromCents(input.paymentNetCents),
    });
    const reserveCents = result.reserveFromThisPayment ?? asCentsUnsafe(0);
    return {
      reserveCents,
      appliedRate:
        input.paymentNetCents > 0 ? reserveCents / input.paymentNetCents : 0,
      marginalRate: result.marginalRate,
      annualLiabilityCents: result.totalLiability,
      assumptions: result.assumptions,
      configVersion: result.configVersion,
      configRetrievedAt: result.configRetrievedAt,
    };
  } catch {
    return null;
  }
}

export interface PercentageValidation {
  valid: boolean;
  error: string | null;
}

/** Advisory range check for inline field validation (not a hard calc block). */
export function validateReservePercentage(percentage: number): PercentageValidation {
  if (!Number.isFinite(percentage)) {
    return { valid: false, error: "Enter a percentage." };
  }
  if (percentage < 0) {
    return { valid: false, error: "A reserve percentage can't be negative." };
  }
  if (percentage > 100) {
    return {
      valid: true,
      error: "That's above 100%, the reserve would exceed the amount itself.",
    };
  }
  return { valid: true, error: null };
}
