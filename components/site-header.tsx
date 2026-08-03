"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useT } from "@/components/i18n/locale-provider";

export function SiteHeader() {
  const t = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--fl-line)] bg-[var(--fl-canvas)]/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-serif text-xl font-medium tracking-tight text-[var(--fl-ink)] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          {t.common.brand}
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/about"
            className="hidden min-h-11 items-center text-sm font-medium text-[var(--fl-slate)] hover:text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] sm:inline-flex"
          >
            {t.common.nav.about}
          </Link>
          <Link
            href="/tool"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {t.common.nav.openTool}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
