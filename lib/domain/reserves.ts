/**
 * Income-tax + Zvw reserve suggestions.
 *
 * A reserve is ALWAYS a planning figure, never a tax assessment. Every result
 * carries a `source` the UI must display, so a number is never shown without
 * saying where it came from. The guided estimate is a flat, cautious percentage
 * of (revenue − costs), deliberately NOT a bracket calculation, with Zvw shown
 * as its own line and a ± range to signal that it's an estimate.
 */
import {
  addCents,
  asCentsUnsafe,
  maxCents,
  subtractCents,
  type Cents,
} from "@/lib/domain/money";
import {
  isVerifiedTaxYearConfig,
  type TaxYearConfigResult,
} from "@/lib/domain/taxYearConfig";

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
      expectedAnnualRevenueExVatCents: Cents;
      expectedDeductibleCostsExVatCents: Cents;
      alreadyReservedCents: Cents;
      alreadyPaidCents: Cents;
    };

export interface ReserveBreakdownStep {
  label: string;
  amountCents: Cents;
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

const GUIDED_RANGE_BAND = 0.15; // ±15% band communicates "this is an estimate".

export function calculateSuggestedReserve(
  method: ReserveMethod,
  config: TaxYearConfigResult,
  context: ReserveContext = {}
): SuggestedReserve {
  switch (method.mode) {
    case "own-rule":
      return calculateOwnRule(method.percentage, context);
    case "provisional-assessment":
      return calculateProvisional(method);
    case "guided-estimate":
      return calculateGuided(method, config);
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
  };
}

function calculateGuided(
  method: Extract<ReserveMethod, { mode: "guided-estimate" }>,
  config: TaxYearConfigResult
): SuggestedReserve {
  if (!isVerifiedTaxYearConfig(config)) {
    return {
      status: "unavailable",
      source: "guided-estimate",
      reason: `Tax references for ${config.taxYear} have not yet been verified. Use your own reserve percentage or a provisional assessment instead.`,
    };
  }
  const {
    expectedAnnualRevenueExVatCents,
    expectedDeductibleCostsExVatCents,
    alreadyReservedCents,
    alreadyPaidCents,
  } = method;

  const flatPct = config.guidedEstimateFlatReservePercentage.value;
  const zvwRate = config.zvw.ratePercentage.value;
  const zvwCap = config.zvw.maxContributionIncomeCents.value;

  const rawProfit = subtractCents(
    expectedAnnualRevenueExVatCents,
    expectedDeductibleCostsExVatCents
  );
  const profit = maxCents(rawProfit, asCentsUnsafe(0));

  // Flat income-tax reserve on profit. NOT a bracket calculation.
  const incomeTaxReserve = asCentsUnsafe((profit * flatPct) / 100);
  // Zvw on the same profit base, capped at the maximum contribution income.
  const zvwBase = Math.min(profit, zvwCap);
  const zvwCents = asCentsUnsafe((zvwBase * zvwRate) / 100);

  const grossReserve = addCents(incomeTaxReserve, zvwCents);
  const alreadyHandled = addCents(alreadyReservedCents, alreadyPaidCents);
  const netReserveRaw = subtractCents(grossReserve, alreadyHandled);
  const reserveCents = maxCents(netReserveRaw, asCentsUnsafe(0));

  const warnings: string[] = [];
  if (rawProfit <= 0) {
    warnings.push(
      "Your expected costs meet or exceed your expected revenue, so the estimated reserve is €0."
    );
  }
  if (netReserveRaw < 0) {
    warnings.push(
      "You've already set aside more than this estimate, so nothing more is suggested."
    );
  }

  const low = asCentsUnsafe(reserveCents * (1 - GUIDED_RANGE_BAND));
  const high = asCentsUnsafe(reserveCents * (1 + GUIDED_RANGE_BAND));

  const breakdown: ReserveBreakdownStep[] = [
    { label: "Expected profit (revenue − costs)", amountCents: profit },
    {
      label: `Flat income-tax reserve (${flatPct}%, a planning estimate)`,
      amountCents: incomeTaxReserve,
    },
    { label: `Zvw contribution (${zvwRate}%)`, amountCents: zvwCents },
    { label: "Already reserved or paid", amountCents: alreadyHandled },
    { label: "Suggested still to reserve", amountCents: reserveCents },
  ];

  return {
    status: "calculated",
    source: "guided-estimate",
    reserveCents,
    reserveRangeCents: [low, high],
    zvwCents,
    perMonthCents: null,
    breakdown,
    warnings,
  };
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
