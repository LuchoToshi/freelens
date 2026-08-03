"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/components/i18n/locale-provider";

/**
 * A real closing moment (audit Q6): a full-width color band with an oversized
 * wordmark, one concise trust line, and a single primary action, the last page
 * of a portfolio, not dead space.
 */
export function SiteFooter() {
  const t = useT();
  const links = [
    { href: "/about", label: t.common.nav.about },
    { href: "/accuracy", label: t.common.nav.accuracy },
    { href: "/methodology", label: t.common.nav.methodology },
    { href: "/tarief", label: t.common.nav.rate },
    { href: "/tool", label: t.common.nav.openFreelens },
  ];

  return (
    <footer className="mt-auto bg-[var(--fl-ink)] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-14 sm:px-8 sm:py-16">
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
          <Link
            href="/tool"
            className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-medium text-[var(--fl-ink)] transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
          >
            {t.common.footer.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-9 items-center text-sm font-medium text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
