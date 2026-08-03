"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/locale-provider";

/**
 * Behaviour-framed outcomes (what Freelens changes), the product's promise,
 * deliberately NOT presented as quotes from invented people. Real freelancer
 * stories replace these once we have them.
 */
export function SocialProofSection() {
  const t = useT();
  return (
    <section
      aria-label={t.home.socialProof.ariaLabel}
      className="border-t border-[var(--fl-line)]"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {t.home.socialProof.eyebrow}
        </span>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          {t.home.socialProof.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
          {t.home.socialProof.body}
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {t.home.socialProof.outcomes.map((text) => (
            <li
              key={text}
              className="rounded-2xl border border-dashed border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6 text-base font-medium text-[var(--fl-ink)]"
            >
              {text}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-[var(--fl-slate)]">
          {t.home.socialProof.footnotePrefix}{" "}
          <Link
            href="/about"
            className="font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
          >
            {t.home.socialProof.footnoteLink}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
