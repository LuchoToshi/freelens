"use client";

import { useState } from "react";
import Link from "next/link";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * Step 4: the link, three source-tagged variants, done. The ?src= tag is how
 * the admin funnel later knows which channel actually brings inquiries.
 */
export function ShareStep({ locale, handle }: { locale: FrontdeskLocale; handle: string }) {
  const t = fdDict(locale).setup.share;
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const base = `${origin}/${handle}`;

  async function copy(url: string, tag: string) {
    await navigator.clipboard.writeText(url);
    setCopied(tag);
    setTimeout(() => setCopied(null), 2000);
  }

  const variants = [
    { tag: "ig", url: `${base}?src=ig` },
    { tag: "tt", url: `${base}?src=tt` },
    { tag: "sig", url: `${base}?src=sig` },
  ] as const;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">{t.heading}</h1>
        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{t.hint}</p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--fl-ink)] bg-white p-4">
        <code className="truncate text-sm text-[var(--fl-ink)]">{base}</code>
        <button
          type="button"
          onClick={() => copy(base, "base")}
          className="shrink-0 rounded-lg border border-[var(--fl-line-control)] px-3 py-1.5 text-sm font-medium text-[var(--fl-ink)] transition hover:border-[var(--fl-ink)]"
        >
          {copied === "base" ? t.copied : t.copy}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {variants.map(({ tag, url }) => (
          <div key={tag} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--fl-line)] bg-white p-3">
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
                {t.variants[tag]}
              </span>
              <code className="truncate text-xs text-[var(--fl-slate)]">{url}</code>
            </div>
            <button
              type="button"
              onClick={() => copy(url, tag)}
              className="shrink-0 rounded-lg border border-[var(--fl-line-control)] px-3 py-1.5 text-sm font-medium text-[var(--fl-ink)] transition hover:border-[var(--fl-ink)]"
            >
              {copied === tag ? t.copied : t.copy}
            </button>
          </div>
        ))}
      </div>

      <Link
        href="/inbox"
        className="inline-flex min-h-12 w-fit items-center justify-center rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white transition hover:bg-[var(--fl-ink-hover)]"
      >
        {t.toInbox}
      </Link>
    </section>
  );
}
