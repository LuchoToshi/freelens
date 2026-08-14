/**
 * Reserve method shape, kept for the stored app-state schema.
 *
 * The reserve calculators that consumed these types ran the tax engine in
 * `lib/tax` and shipped with the calculator product. Only the types survive,
 * because `lib/domain/persistence.ts` still needs to read and migrate
 * `ReserveMethod` values out of state saved by the old calculator.
 */
import type { Cents } from "@/lib/domain/money";

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
