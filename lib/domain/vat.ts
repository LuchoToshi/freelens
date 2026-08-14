/**
 * VAT treatment shape and the exclusive-add used by the rebooking fee
 * estimate.
 *
 * The gross-splitting and non-numeric-treatment logic that consumed
 * `VatTreatment` beyond this shipped with the calculator product. What
 * survives: the treatment enum, kept because `lib/domain/persistence.ts`
 * still reads it out of state saved by the old calculator, and
 * `addVatExclusive`, which `lib/tax/jobOutcome.ts` uses for the one tax
 * figure shown on the Rebooking Numbers screen.
 */
import { asCentsUnsafe, type Cents } from "@/lib/domain/money";

export type VatTreatment =
  | "21"
  | "9"
  | "0"
  | "exempt"
  | "reverse-charged"
  | "kor"
  | "mixed-unsure";

export type VatNumericRate = 21 | 9;

export interface VatExclusiveSplit {
  vatCents: Cents;
  grossCents: Cents;
}

/**
 * Add VAT onto a VAT-exclusive net amount.
 *   vat = round(net * rate / 100)
 *   gross = net + vat
 */
export function addVatExclusive(
  netCents: Cents,
  rate: VatNumericRate
): VatExclusiveSplit {
  const vat = asCentsUnsafe(Math.round((netCents * rate) / 100));
  const gross = asCentsUnsafe(netCents + vat);
  return { vatCents: vat, grossCents: gross };
}
