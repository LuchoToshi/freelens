/**
 * Money is stored and computed as integer cents throughout the domain layer.
 * Floating-point euros (the old `lib/calc.ts` approach) are never used for
 * stored or intermediate monetary values, only for display formatting at the
 * very edge, via `formatEuro` / `formatEuroExact`.
 *
 * `Cents` is a branded number so a euros value can never be passed where cents
 * are expected without going through `toCents`. That friction is deliberate:
 * mixing the two units was the exact bug class this module exists to prevent.
 */
export type Cents = number & { readonly __brand: "Cents" };

const MAX_CENTS = 1_000_000_000 as Cents; // €10,000,000 ceiling for input guards

function asCents(value: number): Cents {
  return value as Cents;
}

/**
 * Construct `Cents` from a value that is already an integer number of cents
 * (e.g. the result of an in-cents calculation). Escape hatch for other domain
 * modules doing integer math on cents; callers are responsible for passing a
 * whole number. Prefer `toCents` when starting from euros.
 */
export function asCentsUnsafe(value: number): Cents {
  return asCents(Math.round(value));
}

/** Convert a euros number to integer cents, rounding half-up to the cent. */
export function toCents(euros: number): Cents {
  return asCents(Math.round(euros * 100));
}

export function fromCents(cents: Cents): number {
  return cents / 100;
}

/**
 * Money stays in Dutch notation in both languages, deliberately.
 *
 * Every document this sits beside — the invoice, the btw-aangifte, the
 * Belastingdienst assessment — writes "€ 1.800,00". An English-reading ZZP'er
 * still files in the Netherlands, so switching to "€1,800.00" for them would
 * make the figures harder to reconcile, not easier. This is a decision, not an
 * oversight: if it is ever revisited, it has to move for both locales at once.
 *
 * Counts that are not money do follow the locale. See `formatMonths`.
 */
const euroWhole = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const euroExact = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Display format for headline figures: whole euros, e.g. "€ 1.400". Keeps the
 * product calm rather than accounting-like. Rounds to the nearest euro for
 * display only, the underlying cents are unchanged, and exact reconciliation
 * is shown in "Why this number?" via `formatEuroExact`.
 */
export function formatEuro(cents: Cents): string {
  // Guard against a display-only -0 ("-€ 0").
  const euros = fromCents(cents);
  return euroWhole.format(euros === 0 ? 0 : euros);
}

/** Two-decimal format for places where the cent matters (e.g. a VAT split). */
export function formatEuroExact(cents: Cents): string {
  const euros = fromCents(cents);
  return euroExact.format(euros === 0 ? 0 : euros);
}

/**
 * A month count to one decimal, in the reader's notation.
 *
 * Runway used to be written three ways: a hardcoded "4,6" on the homepage and
 * `toFixed(1)` in the app, which always produces a point. The same figure read
 * as "4,6" in one place and "4.0" in another, in both languages. One helper,
 * one convention per locale.
 */
export function formatMonths(months: number, locale: "en" | "nl"): string {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(months);
}

export function addCents(...values: Cents[]): Cents {
  return asCents(values.reduce((sum, v) => sum + v, 0));
}

export function subtractCents(a: Cents, b: Cents): Cents {
  return asCents(a - b);
}

export function sumCents(values: readonly Cents[]): Cents {
  return asCents(values.reduce((sum, v) => sum + v, 0));
}

export function clampToNonNegative(cents: Cents): Cents {
  return asCents(cents < 0 ? 0 : cents);
}

export function maxCents(a: Cents, b: Cents): Cents {
  return asCents(Math.max(a, b));
}

export function minCents(a: Cents, b: Cents): Cents {
  return asCents(Math.min(a, b));
}

export interface ParseAmountOptions {
  /** Allow negative amounts (e.g. an overdrawn balance). Default false. */
  allowNegative?: boolean;
}

export interface ParseAmountResult {
  cents: Cents | null;
  error: string | null;
}

const AMOUNT_BLANK = "Enter an amount.";
const AMOUNT_INVALID = "Enter a valid amount, e.g. 1.500 or 1500,50.";
const AMOUNT_NEGATIVE = "Enter a positive amount.";
const AMOUNT_TOO_LARGE = "That amount looks too large, check for a typo.";

/**
 * Parse free-form currency text into integer cents. Handles Dutch and
 * international conventions without ever running `Number()` on an ambiguous
 * string, so it can never produce NaN, Infinity, or -0.
 *
 * Accepts: "1.234,56", "1234.56", "1234,56", "€ 1.500", "(1.234,56)" (negative),
 * pasted whitespace/newlines, more than two decimals (rounded, not rejected).
 * Rejects: blank, non-numeric junk, values above the €10,000,000 guard, and
 * (by default) negatives.
 */
export function parseAmountInput(
  raw: string,
  options: ParseAmountOptions = {}
): ParseAmountResult {
  if (raw == null) return { cents: null, error: AMOUNT_BLANK };
  let s = raw.trim();
  if (s === "") return { cents: null, error: AMOUNT_BLANK };

  // Sign: leading minus, or accounting-style parentheses "(123,45)".
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1).trim();
  }
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1).trim();
  } else if (s.startsWith("+")) {
    s = s.slice(1).trim();
  }

  // Strip everything that isn't a digit or a separator (currency symbols,
  // "EUR", letters, NBSP, ordinary spaces).
  s = s.replace(/[^\d.,]/g, "");
  if (s === "" || !/\d/.test(s)) {
    return { cents: null, error: AMOUNT_INVALID };
  }

  // Decide which separator is the decimal point.
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  let decimalSep: "," | "." | null = null;

  if (hasComma && hasDot) {
    // Rightmost separator is the decimal; the other is grouping.
    decimalSep = s.lastIndexOf(",") > s.lastIndexOf(".") ? "," : ".";
  } else if (hasComma || hasDot) {
    const sep = hasComma ? "," : ".";
    const parts = s.split(sep);
    // A single separator is decimal only if it appears once with 1–2 trailing
    // digits; otherwise (repeats, or 3+ trailing digits like "1.234") it's a
    // thousands separator.
    if (parts.length === 2 && parts[1].length >= 1 && parts[1].length <= 2) {
      decimalSep = sep;
    } else {
      decimalSep = null; // treat as grouping only
    }
  }

  let wholePart: string;
  let fractionPart: string;
  if (decimalSep) {
    const idx = s.lastIndexOf(decimalSep);
    wholePart = s.slice(0, idx).replace(/[.,]/g, "");
    fractionPart = s.slice(idx + 1).replace(/[.,]/g, "");
  } else {
    wholePart = s.replace(/[.,]/g, "");
    fractionPart = "";
  }

  if (wholePart === "" && fractionPart === "") {
    return { cents: null, error: AMOUNT_INVALID };
  }
  if (wholePart === "") wholePart = "0";

  // Oversized guard before building the number (avoid float overflow).
  if (wholePart.length > 12) {
    return { cents: null, error: AMOUNT_TOO_LARGE };
  }

  const wholeCents = Number(wholePart) * 100;
  // Round using the third fractional digit; extra digits are ignored beyond
  // their effect on rounding the second digit. Pure integer/string work, no
  // float arithmetic on the fraction.
  const centsDigits = (fractionPart + "00").slice(0, 2);
  const thirdDigit = fractionPart.length >= 3 ? Number(fractionPart[2]) : 0;
  let fractionCents = Number(centsDigits);
  if (thirdDigit >= 5) fractionCents += 1;

  let total = wholeCents + fractionCents;
  if (!Number.isFinite(total)) {
    return { cents: null, error: AMOUNT_TOO_LARGE };
  }
  if (total > MAX_CENTS) {
    return { cents: null, error: AMOUNT_TOO_LARGE };
  }

  if (negative) {
    if (!options.allowNegative) {
      return { cents: null, error: AMOUNT_NEGATIVE };
    }
    total = -total;
  }

  // Normalize -0 → 0 explicitly.
  return { cents: asCents(total === 0 ? 0 : total), error: null };
}

export interface ParsePercentResult {
  value: number | null;
  error: string | null;
}

const PERCENT_BLANK = "Enter a percentage.";
const PERCENT_INVALID = "Enter a percentage, e.g. 30 or 30,5.";
const PERCENT_RANGE = "Enter a percentage between 0 and 100.";

/**
 * Parse a percentage field (reserve %, tax rate). One-decimal precision,
 * 0–100 range, no thousands separators. Returns a plain number (not cents).
 */
export function parsePercentInput(raw: string): ParsePercentResult {
  if (raw == null) return { value: null, error: PERCENT_BLANK };
  let s = raw.trim();
  if (s === "") return { value: null, error: PERCENT_BLANK };
  s = s.replace(/[%\s]/g, "").replace(",", ".");
  if (!/^\d*\.?\d*$/.test(s) || !/\d/.test(s)) {
    return { value: null, error: PERCENT_INVALID };
  }
  const value = Number(s);
  if (!Number.isFinite(value)) return { value: null, error: PERCENT_INVALID };
  if (value < 0 || value > 100) return { value: null, error: PERCENT_RANGE };
  // One-decimal precision.
  return { value: Math.round(value * 10) / 10, error: null };
}
