import type { FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * How a price is charged.
 *
 * The old field was "Unit (optional)", which asked a freelancer to invent a
 * word for something the product needed and gave no clue what a good answer
 * looked like. The question people can actually answer is: do you charge by
 * the hour, by the day, per session, per item, per project, or is this a fixed
 * package? That is a closed list, so it can be shown back to them in a
 * sentence and used in a draft without guessing.
 */
export const CHARGE_BY_VALUES = [
  "hour",
  "day",
  "session",
  "item",
  "project",
  "fixed",
] as const;

export type ChargeBy = (typeof CHARGE_BY_VALUES)[number];

const LABELS: Record<FrontdeskLocale, Record<ChargeBy, string>> = {
  en: {
    hour: "Hour",
    day: "Day",
    session: "Session",
    item: "Item",
    project: "Project",
    fixed: "Fixed package",
  },
  nl: {
    hour: "Uur",
    day: "Dag",
    session: "Sessie",
    item: "Stuk",
    project: "Project",
    fixed: "Vast pakket",
  },
};

/** How it reads inside a sentence: "€ 75 per hour", "€ 950 per project". */
const PER: Record<FrontdeskLocale, Record<ChargeBy, string>> = {
  en: {
    hour: "per hour",
    day: "per day",
    session: "per session",
    item: "per item",
    project: "per project",
    fixed: "",
  },
  nl: {
    hour: "per uur",
    day: "per dag",
    session: "per sessie",
    item: "per stuk",
    project: "per project",
    fixed: "",
  },
};

const FROM: Record<FrontdeskLocale, string> = { en: "from", nl: "vanaf" };

export function chargeByLabel(value: ChargeBy, locale: FrontdeskLocale): string {
  return LABELS[locale][value];
}

export function isChargeBy(value: string): value is ChargeBy {
  return (CHARGE_BY_VALUES as readonly string[]).includes(value);
}

export interface PackageShape {
  label: string;
  /** Digits as entered; empty means no price set yet. */
  price: string;
  chargeBy: ChargeBy | null;
  /** True when the amount is a starting price rather than the price. */
  priceIsFrom: boolean;
  /** Legacy free-text unit, from before charge_by existed. */
  unit?: string | null;
}

/**
 * The one line a freelancer sees under the fields, so they can tell what they
 * have described before anyone else reads it: "Brand consultation, from € 75
 * per hour". Returns null while there is not enough to say anything true.
 */
export function describePackage(pkg: PackageShape, locale: FrontdeskLocale): string | null {
  const label = pkg.label.trim();
  const price = pkg.price.trim();
  if (!label && !price) return null;
  if (!price) return label;

  const amount = `€ ${formatAmount(price, locale)}`;
  const lead = pkg.priceIsFrom ? `${FROM[locale]} ${amount}` : amount;
  const per = pkg.chargeBy ? PER[locale][pkg.chargeBy] : (pkg.unit ?? "").trim();
  const priced = per ? `${lead} ${per}` : lead;
  return label ? `${label}, ${priced}` : priced;
}

/** Dutch writes a thousands separator as a period; English as a comma. */
function formatAmount(digits: string, locale: FrontdeskLocale): string {
  const n = Number(digits);
  if (!Number.isFinite(n)) return digits;
  return n.toLocaleString(locale === "nl" ? "nl-NL" : "en-GB");
}

/**
 * The same description for the drafting prompt, in English and without the
 * locale's formatting: the model needs the number and the terms, and the guard
 * compares digits, so a formatted amount here would only add noise.
 */
export function packagePromptLine(pkg: {
  label: string;
  priceFromEur: number;
  chargeBy?: ChargeBy | null;
  priceIsFrom?: boolean;
  unit?: string | null;
  notes?: string | null;
}): string {
  const lead = pkg.priceIsFrom ? `from € ${pkg.priceFromEur}` : `€ ${pkg.priceFromEur}`;
  const per = pkg.chargeBy ? PER.en[pkg.chargeBy] : (pkg.unit ?? "").trim();
  const priced = per ? `${lead} ${per}` : lead;
  return `${pkg.label}: ${priced}${pkg.notes ? `, ${pkg.notes}` : ""}`;
}
