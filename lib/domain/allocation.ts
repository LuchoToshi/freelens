/**
 * The allocation engine: "give every euro a job."
 *
 * Two entry points share the same transparent bucket order:
 *   VAT → income-tax/Zvw reserve → business obligations → operating buffer →
 *   what's left for a personal payout.
 *
 * `allocatePayment` allocates a single incoming payment. `evaluateWeeklyPosition`
 * evaluates an ongoing balance. Neither clamps negative results, a shortfall
 * must stay visible, never be silently floored to zero.
 */
import {
  addCents,
  asCentsUnsafe,
  clampToNonNegative,
  subtractCents,
  sumCents,
  type Cents,
} from "@/lib/domain/money";
import type { ReserveSource } from "@/lib/domain/reserves";
import { calculateRunwayMonths } from "@/lib/domain/runway";

export interface Obligation {
  label: string;
  cents: Cents;
}

export interface BreakdownStep {
  label: string;
  /** Signed change applied at this step. */
  deltaCents: Cents;
  /** Running total after this step. */
  runningTotalCents: Cents;
}

// ---------------------------------------------------------------------------
// Single payment
// ---------------------------------------------------------------------------

export interface PaymentAllocationInput {
  grossPaymentCents: Cents;
  /** Resolved VAT for this payment (from vat.resolvePaymentVat). */
  vat: {
    vatCents: Cents | null;
    netCents: Cents;
    explanation: string | null;
  };
  reserve: { cents: Cents; source: ReserveSource };
  obligations: Obligation[];
  bufferCents: Cents;
  assumptions?: string[];
}

export interface PaymentAllocationResult {
  grossPaymentCents: Cents;
  netExVatCents: Cents;
  vatComponentCents: Cents | null;
  vatExplanation: string | null;
  reserveCents: Cents;
  reserveSource: ReserveSource;
  obligationsCents: Cents;
  obligations: Obligation[];
  bufferCents: Cents;
  /** Residual, may be negative. Never clamped. */
  availableForPersonalPayoutCents: Cents;
  assumptions: string[];
  breakdown: BreakdownStep[];
}

export function allocatePayment(
  input: PaymentAllocationInput
): PaymentAllocationResult {
  const { grossPaymentCents, vat, reserve, obligations, bufferCents } = input;
  const vatCents = vat.vatCents ?? asCentsUnsafe(0);
  const obligationsCents = sumCents(obligations.map((o) => o.cents));

  // Residual subtraction guarantees conservation structurally:
  // gross === vat + reserve + obligations + buffer + availableForPersonalPayout.
  const afterVat = subtractCents(grossPaymentCents, vatCents);
  const afterReserve = subtractCents(afterVat, reserve.cents);
  const afterObligations = subtractCents(afterReserve, obligationsCents);
  const availableForPersonalPayoutCents = subtractCents(
    afterObligations,
    bufferCents
  );

  const breakdown: BreakdownStep[] = [
    {
      label: "Payment received",
      deltaCents: grossPaymentCents,
      runningTotalCents: grossPaymentCents,
    },
  ];
  if (vat.vatCents !== null) {
    breakdown.push({
      label: "VAT included in this payment",
      deltaCents: asCentsUnsafe(-vatCents),
      runningTotalCents: afterVat,
    });
  }
  breakdown.push({
    label: "Income tax and Zvw reserve",
    deltaCents: asCentsUnsafe(-reserve.cents),
    runningTotalCents: afterReserve,
  });
  if (obligations.length > 0) {
    breakdown.push({
      label: "Business obligations",
      deltaCents: asCentsUnsafe(-obligationsCents),
      runningTotalCents: afterObligations,
    });
  }
  breakdown.push({
    label: "Business buffer",
    deltaCents: asCentsUnsafe(-bufferCents),
    runningTotalCents: availableForPersonalPayoutCents,
  });

  return {
    grossPaymentCents,
    netExVatCents: vat.netCents,
    vatComponentCents: vat.vatCents,
    vatExplanation: vat.explanation,
    reserveCents: reserve.cents,
    reserveSource: reserve.source,
    obligationsCents,
    obligations,
    bufferCents,
    availableForPersonalPayoutCents,
    assumptions: input.assumptions ?? [],
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// Ongoing weekly position
// ---------------------------------------------------------------------------

export type CompletenessLevel =
  | "quick-estimate"
  | "improved-estimate"
  | "bookkeeping-based";

export type WeeklyPositionStatus =
  | "reserve-gap"
  | "limited-room"
  | "reserves-covered";

export type ShortfallPriority = "vat" | "tax-reserve" | "obligations" | "buffer";

export interface WeeklyPositionInput {
  currentBalanceCents: Cents;
  /** Actual VAT to keep separated (from bookkeeping); 0 if not tracked. */
  vatProtectedCents: Cents;
  vatProtectedIsActual: boolean;
  reserveProtectedCents: Cents;
  reserveSource: ReserveSource | "not-tracked";
  obligations: Obligation[];
  bufferTargetCents: Cents;
  essentialMonthlyCostsCents?: Cents;
  recommendedPersonalPayoutCents?: Cents;
  assumptions?: string[];
}

export interface WeeklyPositionResult {
  currentBalanceCents: Cents;
  vatProtectedCents: Cents;
  reserveProtectedCents: Cents;
  reserveSource: ReserveSource | "not-tracked";
  obligationsCents: Cents;
  obligations: Obligation[];
  bufferTargetCents: Cents;
  /** Non-earmarked business cash (≥0), feeds runway. */
  operatingReserveCents: Cents;
  /** After the buffer is protected, may be negative. Never clamped. */
  availableForPersonalPayoutCents: Cents;
  recommendedPersonalPayoutCents: Cents;
  /** Discretionary room a decision is checked against, may be negative. */
  optionalSpendingRoomCents: Cents;
  essentialMonthlyCostsCents: Cents | null;
  runwayMonths: number | null;
  status: WeeklyPositionStatus;
  shortfallCents: Cents | null;
  shortfallPriority: ShortfallPriority | null;
  completeness: CompletenessLevel;
  assumptions: string[];
  breakdown: BreakdownStep[];
}

export function evaluateWeeklyPosition(
  input: WeeklyPositionInput
): WeeklyPositionResult {
  const {
    currentBalanceCents,
    vatProtectedCents,
    reserveProtectedCents,
    obligations,
    bufferTargetCents,
  } = input;
  const obligationsCents = sumCents(obligations.map((o) => o.cents));

  const afterVat = subtractCents(currentBalanceCents, vatProtectedCents);
  const afterReserve = subtractCents(afterVat, reserveProtectedCents);
  const afterObligations = subtractCents(afterReserve, obligationsCents);
  const availableForPersonalPayoutCents = subtractCents(
    afterObligations,
    bufferTargetCents
  );

  // Operating reserve = business cash not earmarked for VAT/tax/obligations
  // (i.e. buffer + any discretionary leftover), floored at 0 for runway.
  const operatingReserveCents = clampToNonNegative(afterObligations);

  const recommendedPersonalPayoutCents =
    input.recommendedPersonalPayoutCents ?? asCentsUnsafe(0);
  const optionalSpendingRoomCents = subtractCents(
    availableForPersonalPayoutCents,
    recommendedPersonalPayoutCents
  );

  const essentialMonthlyCostsCents = input.essentialMonthlyCostsCents ?? null;
  const runwayMonths =
    essentialMonthlyCostsCents === null
      ? null
      : calculateRunwayMonths(operatingReserveCents, essentialMonthlyCostsCents);

  // Status + shortfall.
  const protectedTotal = addCents(
    vatProtectedCents,
    reserveProtectedCents,
    obligationsCents,
    bufferTargetCents
  );
  let status: WeeklyPositionStatus;
  let shortfallCents: Cents | null = null;
  let shortfallPriority: ShortfallPriority | null = null;

  if (currentBalanceCents < protectedTotal) {
    status = "reserve-gap";
    shortfallCents = subtractCents(protectedTotal, currentBalanceCents);
    shortfallPriority = firstUncoveredBucket(currentBalanceCents, {
      vat: vatProtectedCents,
      "tax-reserve": reserveProtectedCents,
      obligations: obligationsCents,
      buffer: bufferTargetCents,
    });
  } else {
    // Covered. "Limited room" when discretionary room is under a month of costs
    // (or, without costs, a small fraction of the buffer target).
    const roomThreshold =
      essentialMonthlyCostsCents ?? asCentsUnsafe(bufferTargetCents * 0.1);
    status =
      optionalSpendingRoomCents < roomThreshold
        ? "limited-room"
        : "reserves-covered";
  }

  const completeness = deriveCompleteness(input);

  const breakdown: BreakdownStep[] = [
    {
      label: "Current business cash",
      deltaCents: currentBalanceCents,
      runningTotalCents: currentBalanceCents,
    },
  ];
  if (vatProtectedCents !== 0) {
    breakdown.push({
      label: "VAT set aside",
      deltaCents: asCentsUnsafe(-vatProtectedCents),
      runningTotalCents: afterVat,
    });
  }
  breakdown.push({
    label: "Income tax and Zvw reserve",
    deltaCents: asCentsUnsafe(-reserveProtectedCents),
    runningTotalCents: afterReserve,
  });
  if (obligations.length > 0) {
    breakdown.push({
      label: "Upcoming obligations",
      deltaCents: asCentsUnsafe(-obligationsCents),
      runningTotalCents: afterObligations,
    });
  }
  breakdown.push({
    label: "Business buffer",
    deltaCents: asCentsUnsafe(-bufferTargetCents),
    runningTotalCents: availableForPersonalPayoutCents,
  });

  return {
    currentBalanceCents,
    vatProtectedCents,
    reserveProtectedCents,
    reserveSource: input.reserveSource,
    obligationsCents,
    obligations,
    bufferTargetCents,
    operatingReserveCents,
    availableForPersonalPayoutCents,
    recommendedPersonalPayoutCents,
    optionalSpendingRoomCents,
    essentialMonthlyCostsCents,
    runwayMonths,
    status,
    shortfallCents,
    shortfallPriority,
    completeness,
    assumptions: input.assumptions ?? [],
    breakdown,
  };
}

function firstUncoveredBucket(
  balanceCents: Cents,
  buckets: Record<ShortfallPriority, Cents>
): ShortfallPriority {
  const order: ShortfallPriority[] = [
    "vat",
    "tax-reserve",
    "obligations",
    "buffer",
  ];
  let cumulative = 0;
  for (const key of order) {
    cumulative += buckets[key];
    if (cumulative > balanceCents) return key;
  }
  return "buffer";
}

/**
 * Heuristic completeness tier (not a confidence score). Driven by how much real
 * data was supplied: bookkeeping-based needs an actual VAT figure plus a
 * provisional-assessment reserve; improved needs some real detail; otherwise
 * quick.
 */
function deriveCompleteness(input: WeeklyPositionInput): CompletenessLevel {
  const hasObligations = input.obligations.length > 0;
  const hasCosts =
    input.essentialMonthlyCostsCents !== undefined &&
    input.essentialMonthlyCostsCents > 0;
  if (
    input.vatProtectedIsActual &&
    input.reserveSource === "provisional-assessment"
  ) {
    return "bookkeeping-based";
  }
  if (input.vatProtectedIsActual || hasObligations || hasCosts) {
    return "improved-estimate";
  }
  return "quick-estimate";
}
