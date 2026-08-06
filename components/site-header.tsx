"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { container } from "@/components/container";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useT } from "@/components/i18n/locale-provider";

/**
 * One nav link, with a real current state.
 *
 * Two of the three links used to be underlined and the third was not, which
 * read as a selected state and never was one: on /tarief the link to /tarief
 * looked exactly like the link away from it. The underline now means "this is
 * the page you are on" and nothing else, and it is backed by `aria-current` so
 * the same fact reaches a screen reader.
 */
function NavLink({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string | null;
  children: React.ReactNode;
}) {
  const current = pathname === href;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
        current
          ? "text-[var(--fl-ink)] underline decoration-[var(--fl-ink)] decoration-2"
          : "text-[var(--fl-slate)] hover:text-[var(--fl-ink)]"
      }`}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const t = useT();
  const pathname = usePathname();
  return (
    <header className="fl-chrome sticky top-0 z-40 border-b border-[var(--fl-line)] bg-[var(--fl-canvas)]/85 backdrop-blur-sm">
      {/* Two rows on mobile, one from `sm` up.
          Measured at 375px: 335px usable, brand 77, the two labels and the
          language switcher 235, gaps 44. That is 356 and does not fit. Rather
          than shorten the labels to "Before"/"After", which would make the
          nav vaguer than the routes it points at, the links take their own
          row. CSS order does it, so the language switcher stays a single
          control in the DOM: rendering it twice behind breakpoints would give
          a screen reader two identical language pickers. */}
      <div className={`${container} flex flex-wrap items-center gap-x-4 gap-y-0 py-2 sm:flex-nowrap sm:gap-x-5 sm:py-4`}>
        <Link
          href="/"
          className="mr-auto inline-flex min-h-11 items-center font-serif text-xl font-medium tracking-tight text-[var(--fl-ink)] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          {t.common.brand}
        </Link>

        {/* The two destinations carry the same two names here, in the footer,
            in the page headings and in the metadata. They used to have five
            between them ("After payment", "Open the workspace", "Your money
            workspace", "I have been paid", "See what's actually mine"), which
            is why the site read as more places than it has. */}
        <nav
          aria-label={t.common.nav.ariaLabel}
          className="order-last flex w-full items-center justify-end gap-x-4 sm:order-none sm:w-auto sm:gap-x-5"
        >
          <NavLink href="/tarief" pathname={pathname}>
            {t.common.nav.beforeJob}
          </NavLink>
          <NavLink href="/tool" pathname={pathname}>
            {t.common.nav.afterPayment}
          </NavLink>
          <NavLink href="/about" pathname={pathname}>
            {t.common.nav.about}
          </NavLink>
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
