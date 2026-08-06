"use client";

import { BackLink } from "@/components/i18n/back-link";
import { container } from "@/components/container";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

/**
 * The privacy page, in the product's own register: short, factual, checkable.
 *
 * Everything stated here must remain true of the shipped build. When the
 * Rebooking app ships (auth, database, model provider, Stripe), this page
 * grows the full processor list — it does not get vaguer.
 */
const VERSION_DATE = "2026-08-06";

const SECTION_KEYS = ["calc", "analytics", "email", "never", "rights"] as const;

export function PrivacyPageBody() {
  const t = useT();
  const p = t.privacyPage;
  useDocumentTitle(t.meta.privacy.title, t.meta.privacy.description);

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className={`${container} flex max-w-3xl flex-col gap-8 py-12`}>
        <BackLink />

        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {p.eyebrow}
          </span>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-[var(--fl-ink)] sm:text-5xl">
            {p.heading}
          </h1>
          <p className="text-sm text-[var(--fl-slate)]">
            {fill(p.updated, { date: VERSION_DATE })}
          </p>
        </header>

        <div className="flex flex-col gap-6">
          {SECTION_KEYS.map((key) => (
            <section key={key} className="flex flex-col gap-2">
              <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
                {p[key].title}
              </h2>
              <p className="text-base leading-relaxed text-[var(--fl-slate)]">
                {p[key].body}
              </p>
            </section>
          ))}
        </div>

        <p className="text-sm text-[var(--fl-slate)]">{p.contactNote}</p>
      </div>
    </main>
  );
}
