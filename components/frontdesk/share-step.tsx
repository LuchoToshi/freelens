"use client";

import { useState } from "react";
import Link from "next/link";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { shareLinks } from "@/lib/frontdesk/shareLinks";

/**
 * Step 4: the link, three source-tagged variants, done. The ?src= tag is how
 * the admin funnel later knows which channel actually brings inquiries.
 */
export function ShareStep({ locale, handle }: { locale: FrontdeskLocale; handle: string }) {
  const t = fdDict(locale).setup.share;
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { base, variants } = shareLinks(origin, handle);

  async function copy(url: string, tag: string) {
    await navigator.clipboard.writeText(url);
    setCopied(tag);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25">{t.heading}</h1>
        <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.hint}</p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--fd-ink)] bg-white p-4">
        <code className="truncate text-sm text-[var(--fd-ink)]">{base}</code>
        <button
          type="button"
          onClick={() => copy(base, "base")}
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-[var(--fd-line-control)] px-3 text-sm font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]"
        >
          {copied === "base" ? t.copied : t.copy}
        </button>
      </div>

      <details className="rounded-2xl border border-[var(--fd-line)] bg-white px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--fd-ink)]">
          {t.trackingSummary}
        </summary>
        <div className="flex flex-col gap-2 pt-3">
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.trackingIntro}</p>
        {variants.map(({ tag, url }) => (
          <div key={tag} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--fd-line)] bg-white p-3">
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
                {t.variants[tag]}
              </span>
              <code className="truncate text-xs text-[var(--fd-slate)]">{url}</code>
            </div>
            <button
              type="button"
              onClick={() => copy(url, tag)}
              className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-[var(--fd-line-control)] px-3 text-sm font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]"
            >
              {copied === tag ? t.copied : t.copy}
            </button>
          </div>
        ))}
        </div>
      </details>

      <Link
        href="/inbox"
        className="inline-flex min-h-12 w-fit items-center justify-center rounded-xl bg-[var(--fd-ink)] px-6 text-base font-medium text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
      >
        {t.toInbox}
      </Link>
    </section>
  );
}
