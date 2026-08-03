/**
 * Dictionary resolution.
 *
 * Every locale is merged over English, so a key a translator has not reached
 * yet renders the English text instead of a raw key or a blank. That fallback
 * is deliberate and permanent: a half-translated screen is recoverable, a
 * screen showing `app.result.title` is not.
 */
import { en } from "@/lib/i18n/en";
import { nl } from "@/lib/i18n/nl";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/types";

export type Dictionary = typeof en;

type Mergeable = Record<string, unknown>;

/**
 * Overlays `override` onto `base`, leaf by leaf. Arrays are replaced whole
 * rather than merged: a translated list of three points is three points, not
 * three English ones with the first two overwritten.
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }
  if (typeof base !== "object" || base === null) {
    return (typeof override === typeof base ? override : base) as T;
  }
  if (typeof override !== "object") return base;

  const result: Mergeable = { ...(base as Mergeable) };
  for (const key of Object.keys(base as Mergeable)) {
    const overrideValue = (override as Mergeable)[key];
    if (overrideValue !== undefined) {
      result[key] = deepMerge((base as Mergeable)[key], overrideValue);
    }
  }
  return result as T;
}

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  nl: deepMerge(en, nl),
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Fills `{name}` placeholders. Kept dumb on purpose: the only interpolation the
 * copy needs is a pre-formatted number or a year, so there is no plural or
 * gender machinery to get wrong.
 */
export function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

export { en, nl };
