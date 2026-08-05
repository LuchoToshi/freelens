"use client";

import { AllocationBar } from "@/components/app/allocation-bar";
import { formatEuro } from "@/lib/domain/money";
import { examplePaymentSplit } from "@/lib/domain/exampleScenario";
import { useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

export function ProblemSection() {
  const t = useT();

  const claims = [
    { label: t.home.problem.claims.vat, color: "var(--fl-vat-fill)" },
    { label: t.home.problem.claims.tax, color: "var(--fl-reserve-fill)" },
    { label: t.home.problem.claims.costs, color: "var(--fl-costs-fill)" },
    { label: t.home.problem.claims.buffer, color: "var(--fl-ink)" },
  ];

  // Same scenario, same engine as the hero and every other illustration. These
  // used to be four hardcoded figures that disagreed with the engine's reserve
  // by a factor of two, on the same scroll as the engine's own answer.
  const split = examplePaymentSplit();
  const segments = [
    { label: t.app.allocation.vat, cents: split.vat, color: "var(--fl-vat-fill)" },
    { label: t.app.allocation.reserve, cents: split.reserve, color: "var(--fl-reserve-fill)" },
    { label: t.app.allocation.business, cents: split.business, color: "var(--fl-costs-fill)" },
    { label: t.app.allocation.yours, cents: split.yours, color: "var(--fl-payout-fill)" },
  ];

  return (
    <section className="border-t border-[var(--fl-line)] bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {t.home.problem.eyebrow}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {t.home.problem.heading}
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.home.problem.body}
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {claims.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 border-b border-[var(--fl-line)] pb-3 text-base text-[var(--fl-ink)]"
              >
                <span
                  className="size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                {item.label}
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--fl-ink)]">
            {t.home.problem.closing}
          </p>
        </div>

        {/* Visual demonstration: one payment, given jobs. */}
        <div className="rounded-3xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[var(--fl-slate)]">
              {fill(t.home.problem.demoLabel, { amount: formatEuro(split.gross) })}
            </span>
            <span className="fl-tnum font-serif text-2xl font-medium text-[var(--fl-payout-text)]">
              {fill(t.home.problem.demoYours, { amount: formatEuro(split.yours) })}
            </span>
          </div>
          <div className="mt-5">
            <AllocationBar segments={segments} interactive={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
