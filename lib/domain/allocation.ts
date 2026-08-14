/**
 * Weekly-position input shape, kept for the stored app-state schema.
 *
 * The allocation engine that consumed this type (`allocatePayment`,
 * `evaluateWeeklyPosition`) shipped with the calculator product. Only the
 * type survives, because `lib/domain/persistence.ts` still needs to read and
 * migrate `WeeklyPositionInput` values out of state saved by the old
 * calculator.
 */
import type { Cents } from "@/lib/domain/money";
import type { ReserveSource } from "@/lib/domain/reserves";

export interface Obligation {
  label: string;
  cents: Cents;
}

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
