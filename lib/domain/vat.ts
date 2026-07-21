/**
 * VAT handling. Numeric rates (21%, 9%) split a payment into VAT + net.
 * Non-numeric treatments (0%, exempt, reverse-charged, KOR, mixed/unsure)
 * never produce a "VAT to remit" figure — they return a structured
 * explanation, because a single payment cannot determine a VAT-return position.
 */
import { asCentsUnsafe, subtractCents, type Cents } from "@/lib/domain/money";

export type VatTreatment =
  | "21"
  | "9"
  | "0"
  | "exempt"
  | "reverse-charged"
  | "kor"
  | "mixed-unsure";

export type VatNumericRate = 21 | 9;
export type VatNonNumericTreatment = Exclude<VatTreatment, "21" | "9">;

export interface VatInclusiveSplit {
  vatCents: Cents;
  netCents: Cents;
}

export interface VatExclusiveSplit {
  vatCents: Cents;
  grossCents: Cents;
}

/**
 * Extract VAT from a VAT-inclusive gross amount.
 *   vat = round(gross * rate / (100 + rate))   (21% → gross*21/121, 9% → *9/109)
 *   net = gross - vat
 * The rounding remainder is always assigned to `net` (the derived value), so
 * `vatCents + netCents === grossCents` holds exactly, by construction.
 */
export function extractVatInclusive(
  grossCents: Cents,
  rate: VatNumericRate
): VatInclusiveSplit {
  const vat = asCentsUnsafe(Math.round((grossCents * rate) / (100 + rate)));
  const net = subtractCents(grossCents, vat);
  return { vatCents: vat, netCents: net };
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

export const VAT_EXPLANATIONS: Record<VatNonNumericTreatment, string> = {
  "reverse-charged":
    "VAT is not charged to this customer under the selected treatment. Confirm the transaction in your bookkeeping.",
  kor: "No VAT is added under the selected KOR treatment. Input VAT is generally not deductible while participating.",
  exempt:
    "No VAT is charged under the selected exempt treatment. The consequences for input VAT can vary.",
  // Authored in-tone (not given verbatim in the brief) — review before ship.
  "0": "This treatment applies a 0% VAT rate, for example exports or intra-EU supplies. No VAT is added and no VAT reserve is needed for this amount, but confirm the transaction qualifies in your bookkeeping.",
  "mixed-unsure":
    "This payment may mix VAT treatments, or the treatment isn't clear yet. No VAT amount is calculated automatically — check the invoice and your bookkeeping before deciding how much to set aside.",
};

export interface NonNumericVatResult {
  treatment: VatNonNumericTreatment;
  vatCents: null;
  explanation: string;
  requiresBookkeepingConfirmation: true;
}

export function describeNonNumericVatTreatment(
  treatment: VatNonNumericTreatment
): NonNumericVatResult {
  return {
    treatment,
    vatCents: null,
    explanation: VAT_EXPLANATIONS[treatment],
    requiresBookkeepingConfirmation: true,
  };
}

export function isNumericVatRate(
  treatment: VatTreatment
): treatment is "21" | "9" {
  return treatment === "21" || treatment === "9";
}

/**
 * Resolve a payment's VAT for the "money arrived" flow. A single payment can
 * always be split when the treatment is numeric; otherwise it returns a
 * non-numeric explanation with `vatCents: null` and `netCents === grossCents`
 * (no VAT is separated from this payment).
 */
export interface ResolvedPaymentVat {
  treatment: VatTreatment;
  vatCents: Cents | null;
  netCents: Cents;
  explanation: string | null;
  requiresBookkeepingConfirmation: boolean;
}

export function resolvePaymentVat(
  grossCents: Cents,
  treatment: VatTreatment,
  amountIncludesVat: boolean
): ResolvedPaymentVat {
  if (isNumericVatRate(treatment)) {
    const rate = Number(treatment) as VatNumericRate;
    if (amountIncludesVat) {
      const { vatCents, netCents } = extractVatInclusive(grossCents, rate);
      return {
        treatment,
        vatCents,
        netCents,
        explanation: null,
        requiresBookkeepingConfirmation: false,
      };
    }
    // Amount entered VAT-exclusive: the entered figure IS the net; VAT is on top.
    const { vatCents } = addVatExclusive(grossCents, rate);
    return {
      treatment,
      vatCents,
      netCents: grossCents,
      explanation: null,
      requiresBookkeepingConfirmation: false,
    };
  }
  const nonNumeric = describeNonNumericVatTreatment(treatment);
  return {
    treatment,
    vatCents: null,
    netCents: grossCents,
    explanation: nonNumeric.explanation,
    requiresBookkeepingConfirmation: true,
  };
}
