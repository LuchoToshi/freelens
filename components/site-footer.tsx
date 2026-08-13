"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { container } from "@/components/container";
import { useT } from "@/components/i18n/locale-provider";
import { chromeVariant } from "@/lib/frontdesk/handles";

/**
 * Two footers, one classification source (chromeVariant in
 * lib/frontdesk/handles.ts — register new routes there).
 *
 * "frontdesk" (/ and /about): wordmark, About, Privacy, and the AI trust
 * line. No calculator links, no tax strip — the FrontDesk story ends on its
 * own note, and the trust line lives here exactly once per page.
 *
 * "legacy" (calculators, rebooking, offertes, privacy, and any unknown
 * route): the original closing band, unchanged except that the "After
 * payment" link list entry yields to the CTA button pointing at the same
 * place — one destination, one element.
 *
 * "app" paths never reach this component; ChromeGate suppresses all chrome.
 */
export function SiteFooter() {
  const t = useT();
  const pathname = usePathname();
  if (chromeVariant(pathname ?? "") === "frontdesk") {
    return <FrontdeskFooter />;
  }
  return <LegacyFooter t={t} pathname={pathname} />;
}

function FrontdeskFooter() {
  const t = useT();
  const links = [
    { href: "/about", label: t.common.nav.about },
    { href: "/privacy", label: t.common.nav.privacy },
  ];
  return (
    <footer className="mt-auto bg-[var(--fl-ink)] text-white">
      <div className={`${container} flex flex-col gap-8 py-14 sm:py-16`}>
        <Link
          href="/"
          className="font-serif text-5xl font-medium tracking-tight text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70 sm:text-7xl"
        >
          {t.common.brand}
        </Link>
        <p className="max-w-md text-base leading-relaxed text-white/70">{t.home.frontdesk.trust}</p>
        <nav
          aria-label={t.common.footer.navLabel}
          className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-9 items-center text-sm font-medium text-white/70 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function LegacyFooter({
  t,
  pathname,
}: {
  t: ReturnType<typeof useT>;
  pathname: string | null;
}) {
  // Every route the site has, plus privacy. Contact renders only when a real
  // address is configured: a mailto that bounces is worse than none.
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  // A closing call to action that points at the page you are already reading is
  // not an action. On /tool the band keeps the wordmark and the trust line and
  // drops the button.
  const showCta = pathname !== "/tool";

  // The CTA button and the "After payment" list link share a destination;
  // only one of the two renders. Where the button shows, the list entry
  // yields; on /tool the button is gone and the list entry stays.
  const links = [
    { href: "/rekentools", label: t.common.nav.tools },
    { href: "/tarief", label: t.common.nav.beforeJob },
    ...(showCta ? [] : [{ href: "/tool", label: t.common.nav.afterPayment }]),
    { href: "/offertes", label: t.common.nav.quotes },
    { href: "/about", label: t.common.nav.about },
    { href: "/accuracy", label: t.common.nav.accuracy },
    { href: "/methodology", label: t.common.nav.methodology },
    { href: "/privacy", label: t.common.nav.privacy },
    ...(contactEmail
      ? [{ href: `mailto:${contactEmail}`, label: t.common.nav.contact }]
      : []),
  ];

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
