import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/types";

/**
 * Medium-style date for saved timestamps, e.g. "Jul 22, 2026" / "22 jul 2026".
 *
 * Takes the locale explicitly rather than reading a global, so it stays pure
 * and testable. `fallback` is the wording shown for an unreadable timestamp,
 * which has to come from the dictionary like any other user-facing string.
 */
export function formatCheckInDate(
  iso: string,
  locale: Locale = DEFAULT_LOCALE,
  fallback = "recently"
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", {
    dateStyle: "medium",
  }).format(date);
}
