"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { LOCALE_LABELS, LOCALE_NAMES, LOCALES } from "@/lib/i18n/types";

/**
 * EN / NL, as text.
 *
 * No flags: a flag names a country, and neither English nor Dutch belongs to
 * one. It is also the smallest possible change to the header, which is all this
 * needs to be.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t.common.languageSwitcher.label}
      className={`inline-flex items-center rounded-lg border border-[var(--fd-line-control)] bg-white p-0.5 ${className}`}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            aria-label={`${t.common.languageSwitcher.switchTo} ${LOCALE_NAMES[option]}`}
            onClick={() => setLocale(option)}
            className={`min-h-9 rounded-md px-2.5 text-xs font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-focus-ring)] ${
              active
                ? "bg-[var(--fd-ink)] text-white"
                : "text-[var(--fd-slate)] hover:text-[var(--fd-ink)]"
            }`}
          >
            {LOCALE_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
