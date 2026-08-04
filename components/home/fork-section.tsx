"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { JobQuoteFlow } from "@/components/rate/job-quote-flow";
import { useRateProfile } from "@/components/rate/use-rate-profile";
import { linkButtonClass, primaryButtonClass } from "@/components/app/styles";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
import { useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

const TAX_YEAR = latestProfileYear(DEFAULT_COUNTRY) ?? 0;

/**
 * Both moments, side by side.
 *
 * The hero has already made the product's one promise, so this is the first
 * thing on the page a visitor can act on. It offers a choice between two
 * questions rather than putting a question to them.
 *
 * Only the left card holds a live calculator. /tool is a four-mode workspace
 * with persistent state and cannot be embedded in a card without gutting it,
 * so the right card is a doorway with enough substance to hold its half of the
 * row. Pretending to symmetry here would mean shrinking the workspace into
 * something that misrepresents it.
 *
 * Reads the saved profile, writes nothing.
 */
export function ForkSection() {
  const t = useT();
  const f = t.home.fork;
  const { profile, projectedProfit } = useRateProfile();

  return (
    <section
      id="start"
      aria-label={f.ariaLabel}
      className="border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {f.eyebrow}
          </span>
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {f.heading}
          </h2>
        </div>

        {/* Single column until there is genuinely room for two: below that the
            calculator and the workspace card stack, calculator first, with
            nothing between them. */}
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
          <div className="flex flex-col gap-5 rounded-2xl border border-[var(--fl-line)] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
                {f.before.eyebrow}
              </span>
              <h3 className="font-serif text-2xl font-medium leading-tight tracking-tight text-[var(--fl-ink)]">
                {f.before.heading}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
                {fill(f.before.body, { year: TAX_YEAR })}
              </p>
            </div>

            <div className="border-t border-[var(--fl-line)] pt-5">
              <JobQuoteFlow
                profile={profile}
                knownProjectedProfit={projectedProfit}
              />
            </div>

            <Link href="/tarief" className={`${linkButtonClass} w-fit`}>
              {f.before.fullPage}
            </Link>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-[var(--fl-line)] bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-28">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
                {f.after.eyebrow}
              </span>
              <h3 className="font-serif text-2xl font-medium leading-tight tracking-tight text-[var(--fl-ink)]">
                {f.after.heading}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
                {f.after.body}
              </p>
            </div>

            <ul className="flex flex-col gap-2.5 border-t border-[var(--fl-line)] pt-5">
              {f.after.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--fl-ink)]"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[var(--fl-slate)]"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>

            <Link href="/tool" className={`${primaryButtonClass} w-fit`}>
              {f.after.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
