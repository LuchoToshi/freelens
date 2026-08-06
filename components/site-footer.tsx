"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { container } from "@/components/container";
import { useT } from "@/components/i18n/locale-provider";

/**
 * A real closing moment (audit Q6): a full-width color band with an oversized
 * wordmark, one concise trust line, and a single primary action, the last page
 * of a portfolio, not dead space.
 */
export function SiteFooter() {
  const t = useT();
  const pathname = usePathname();
  // Every route the site has, plus privacy. Contact renders only when a real
  // address is configured: a mailto that bounces is worse than none.
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const links = [
    { href: "/rekentools", label: t.common.nav.tools },
    { href: "/tarief", label: t.common.nav.beforeJob },
    { href: "/tool", label: t.common.nav.afterPayment },
    { href: "/offertes", label: t.common.nav.quotes },
    { href: "/about", label: t.common.nav.about },
    { href: "/accuracy", label: t.common.nav.accuracy },
    { href: "/methodology", label: t.common.nav.methodology },
    { href: "/privacy", label: t.common.nav.privacy },
    ...(contactEmail
      ? [{ href: `mailto:${contactEmail}`, label: t.common.nav.contact }]
      : []),
  ];

  // A closing call to action that points at the page you are already reading is
  // not an action. On /tool the band keeps the wordmark and the trust line and
  // drops the button.
  const showCta = pathname !== "/tool";

  return (
    <footer className="mt-auto bg-[var(--fl-ink)] text-white">
      <div className={`${container} flex flex-col gap-8 py-14 sm:py-16`}>
        <Link
          href="/"
          className="font-serif text-5xl font-medium tracking-tight text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70 sm:text-7xl"
        >
          {t.common.brand}
        </Link>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-base leading-relaxed text-white/70">
            {t.common.footer.trustLine}
          </p>
          {showCta && (
            <Link
              href="/tool"
              className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-medium text-[var(--fl-ink)] transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            >
              {t.common.footer.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
        <nav
          aria-label={t.common.footer.navLabel}
          className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6"
        >
          {links.map(({ href, label }) => {
            const current = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-9 items-center text-sm font-medium underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70 ${
                  current
                    ? "text-white underline decoration-white decoration-2"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
