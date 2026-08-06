"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { AllocationBar } from "@/components/app/allocation-bar";
import { container } from "@/components/container";
import type { Cents } from "@/lib/domain/money";
import {
  examplePaymentSplit,
  exampleQuoteSplit,
} from "@/lib/domain/exampleScenario";
import { useT } from "@/components/i18n/locale-provider";

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type StageKey =
  | "appears"
  | "beforeSend"
  | "waiting"
  | "outcome"
  | "lands"
  | "learns";

/**
 * The product as one job's timeline, not a set of tools.
 *
 * Six stages, and every sentence in them is true of the shipped product today:
 * the pricing and the split come from the engine, the guardrail questions sit
 * on the quote result, the waiting clocks come from the signals layer, and the
 * outcomes are the /offertes record. Nothing here describes a capability that
 * does not exist; when the brief-reading layer ships, it gets its own stage,
 * not a promissory note in this one.
 *
 * Two stages carry engine-fed figures from the site's one shared scenario, so
 * this section can never disagree with the calculator above it.
 */
export function LifecycleSection() {
  const reduce = useReducedMotion();
  const t = useT();
  const l = t.home.lifecycle;

  const quote = exampleQuoteSplit();
  const split = examplePaymentSplit();

  const quoteDemo = [
    { label: t.rate.segments.tax, cents: quote.tax, color: "var(--fl-reserve-fill)" },
    { label: t.rate.segments.yours, cents: quote.yours, color: "var(--fl-payout-fill)" },
  ];
  const paymentDemo = [
    { label: t.app.allocation.vat, cents: split.vat, color: "var(--fl-vat-fill)" },
    { label: t.app.allocation.reserve, cents: split.reserve, color: "var(--fl-reserve-fill)" },
    { label: t.app.allocation.business, cents: split.business, color: "var(--fl-costs-fill)" },
    { label: t.app.allocation.yours, cents: split.yours, color: "var(--fl-payout-fill)" },
  ];

  const stages: { key: StageKey; visual?: { label: string; cents: Cents; color: string }[] }[] = [
    { key: "appears", visual: quoteDemo },
    { key: "beforeSend" },
    { key: "waiting" },
    { key: "outcome" },
    { key: "lands", visual: paymentDemo },
    { key: "learns" },
  ];

  return (
    <section
      id="lifecycle"
      aria-label={l.ariaLabel}
      className="scroll-mt-24 border-t border-[var(--fl-line)]"
    >
      <div className={`${container} py-16 sm:py-24`}>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {l.eyebrow}
        </span>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          {l.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
          {l.body}
        </p>

        {/* One rail, six stops. The line down the left is the job's life. */}
        <ol className="mt-14 flex max-w-3xl flex-col border-l-2 border-[var(--fl-line)]">
          {stages.map((stage, i) => (
            <motion.li
              key={stage.key}
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={variants}
              transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative pb-12 pl-8 last:pb-0 sm:pl-10"
            >
              <span
                aria-hidden="true"
                className="fl-tnum absolute -left-[1.05rem] top-0 inline-flex size-8 items-center justify-center rounded-full border-2 border-[var(--fl-line)] bg-[var(--fl-canvas)] font-serif text-sm font-medium text-[var(--fl-ink)]"
              >
                {i + 1}
              </span>
              <h3 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
                {l.stages[stage.key].title}
              </h3>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-[var(--fl-slate)]">
                {l.stages[stage.key].body}
              </p>
              {stage.visual && (
                <div className="mt-4 max-w-md">
                  <AllocationBar segments={stage.visual} interactive={false} />
                </div>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
