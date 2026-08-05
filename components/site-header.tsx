"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useT } from "@/components/i18n/locale-provider";

export function SiteHeader() {
  const t = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--fl-line)] bg-[var(--fl-canvas)]/85 backdrop-blur-sm">
      {/* Two rows on mobile, one from `sm` up.
          Measured at 375px: 335px usable, brand 77, the two labels and the
          language switcher 235, gaps 44. That is 356 and does not fit. Rather
          than shorten the labels to "Before"/"After", which would make the
          nav vaguer than the routes it points at, the links take their own
          row. CSS order does it, so the language switcher stays a single
          control in the DOM: rendering it twice behind breakpoints would give
          a screen reader two identical language pickers. */}
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-0 px-5 py-2 sm:flex-nowrap sm:gap-x-5 sm:px-8 sm:py-4">
        <Link
          href="/"
          className="mr-auto inline-flex min-h-11 items-center font-serif text-xl font-medium tracking-tight text-[var(--fl-ink)] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          {t.common.brand}
        </Link>

        <nav
          aria-label={t.common.nav.ariaLabel}
          className="order-last flex w-full items-center justify-end gap-x-4 sm:order-none sm:w-auto sm:gap-x-5"
        >
          <Link
            href="/tarief"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {t.common.nav.beforeJob}
          </Link>
          <Link
            href="/tool"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {t.common.nav.afterPayment}
          </Link>
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--fl-slate)] hover:text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {t.common.nav.about}
          </Link>
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
