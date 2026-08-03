/**
 * Locale plumbing.
 *
 * English is the source of truth: `en.ts` defines the shape, and every other
 * locale is a partial of it. Anything a translation has not covered falls back
 * to English at runtime rather than rendering a key or an empty string, which
 * is the one failure mode a user must never see.
 *
 * Completeness is enforced by `dictionary.test.ts`, not by the type, so a
 * translation in progress never blocks a build while still being impossible to
 * forget.
 */
export const LOCALES = ["en", "nl"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Label for the switcher. Deliberately text, not a flag: a language is not a country. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  nl: "NL",
};

/** Full name, used for the accessible label on the switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends string
    ? T[K]
    : T[K] extends readonly string[]
      ? T[K]
      : T[K] extends object
        ? DeepPartial<T[K]>
        : T[K];
};
