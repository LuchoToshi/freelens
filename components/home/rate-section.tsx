"use client";

import Link from "next/link";
import { Clock, Lock, Scale } from "lucide-react";
import { JobQuoteFlow } from "@/components/rate/job-quote-flow";
import { useRateProfile } from "@/components/rate/use-rate-profile";
import { linkButtonClass } from "@/components/app/styles";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
import { useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

const TAX_YEAR = latestProfileYear(DEFAULT_COUNTRY) ?? 0;

/**
 * The rate calculator, on the homepage.
 *
 * Placed straight after "How it works" on purpose. Everything above it answers
 * what happens once money has arrived; by the end of that section the reader
 * has the loop, and the question that forms next is the one this answers. Any
 * earlier and it interrupts the explanation with a form.
 *
 * It reads the saved profile the same way /tarief does, and writes nothing.
 */
export function RateSection() {
  const t = useT();
  const s = t.home.rateSection;
  const { profile, projectedProfit } = useRateProfile();

  const promises = [
    { icon: Clock, text: s.youEnter },
    { icon: Scale, text: s.youGet },
    { icon: Lock, text: s.privacy },
  ];

  return (
    <section
      id="rate"
      aria-label={s.ariaLabel}
      className="border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
    >
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
              {s.eyebrow}
            </span>
            <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
              {s.heading}
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-[var(--fl-slate)]">
              {fill(s.body, { year: TAX_YEAR })}
            </p>

            {/* What they are signing up for, before they start. Icons carry the
                categories so the text can stay to one line each. */}
            <ul className="flex flex-col gap-2.5">
              {promises.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--fl-ink)]"
                >
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-[var(--fl-slate)]"
                    aria-hidden="true"
                  />
                  {text}
                </li>
              ))}
            </ul>

            <Link href="/tarief" className={`${linkButtonClass} w-fit`}>
              {s.fullPage}
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--fl-line)] bg-white p-5 shadow-sm sm:p-7">
            <JobQuoteFlow
              profile={profile}
              knownProjectedProfit={projectedProfit}
              showTariefLink
            />
          </div>
        </div>
      </div>
    </section>
  );
}
