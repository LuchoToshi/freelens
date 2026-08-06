"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BackLink } from "@/components/i18n/back-link";
import { container } from "@/components/container";
import { linkButtonClass, primaryButtonClass } from "@/components/app/styles";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";

/**
 * The calculators' front door now that the homepage belongs to Rebooking.
 *
 * Acquisition surface, not an archive: the tools keep their own routes and
 * their search traffic, this page is the two-sentence map between them.
 */
export function RekentoolsPageBody() {
  const t = useT();
  const r = t.rekentoolsPage;
  useDocumentTitle(t.meta.rekentools.title, t.meta.rekentools.description);

  const tools = [
    { card: r.tarief, href: "/tarief" },
    { card: r.tool, href: "/tool" },
  ];

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className={`${container} flex flex-col gap-8 py-12`}>
        <BackLink />

        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {r.eyebrow}
          </span>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-[var(--fl-ink)] sm:text-5xl">
            {r.heading}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
            {r.lead}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map(({ card, href }) => (
            <div
              key={href}
              className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-6"
            >
              <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
                {card.title}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
                {card.body}
              </p>
              <Link href={href} className={`${primaryButtonClass} mt-auto`}>
                {card.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6">
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--fl-ink)]">
            {r.accuracyTeaser}
          </p>
          <Link href="/accuracy" className={`${linkButtonClass} w-fit`}>
            {r.accuracyCta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
