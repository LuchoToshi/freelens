"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { AllocationBar } from "@/components/app/allocation-bar";
import { formatMonths, type Cents } from "@/lib/domain/money";
import {
  examplePaymentSplit,
  exampleQuoteSplit,
} from "@/lib/domain/exampleScenario";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";
import { container } from "@/components/container";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type VisualKind = "quote" | "allocate" | "runway";

/**
 * The product as three moments, not five features.
 *
 * This was five full-height steps: quote, payment, weekly check-in, check a
 * decision, and "peace of mind". The last was a feeling rather than a step, and
 * the two middle ones are both things you do inside the same workspace, so the
 * section spent roughly two screens describing one route. Folding them into
 * "over time" leaves three steps that match the three things the product
 * actually does, and each one now maps to somewhere the visitor can go.
 *
 * There is deliberately no step for chasing quotes or invoices. The domain
 * layer for it exists, but nothing is shipped, so nothing here claims it.
 */
export function HowItWorksSection() {
  const reduce = useReducedMotion();
  const t = useT();

  // Both illustrations come from the one scenario the whole site shares, so
  // the quote step and the payment step describe the same freelancer rather
  // than two people who happen to use round numbers.
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

  const steps: {
    title: string;
    body: string;
    accent: string;
    tint: string;
    visual: VisualKind;
  }[] = [
    {
      title: t.home.howItWorks.steps.beforeQuote.title,
      body: t.home.howItWorks.steps.beforeQuote.body,
      accent: "var(--fl-payout-fill)",
      tint: "var(--fl-payout-tint)",
      visual: "quote",
    },
    {
      title: t.home.howItWorks.steps.moneyArrives.title,
      body: t.home.howItWorks.steps.moneyArrives.body,
      accent: "var(--fl-vat-fill)",
      tint: "var(--fl-vat-tint)",
      visual: "allocate",
    },
    {
      title: t.home.howItWorks.steps.overTime.title,
      body: t.home.howItWorks.steps.overTime.body,
      accent: "var(--fl-reserve-fill)",
      tint: "var(--fl-reserve-tint)",
      visual: "runway",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-[var(--fl-line)]"
    >
      <div className={`${container} py-16 sm:py-24`}>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {t.home.howItWorks.eyebrow}
        </span>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          {t.home.howItWorks.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
          {t.home.howItWorks.body}
        </p>
        <div className="mt-14 flex flex-col gap-14 sm:gap-16">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={variants}
              transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <span
                  className="fl-tnum font-serif text-5xl font-medium sm:text-6xl"
                  style={{ color: s.accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-serif text-2xl font-medium text-[var(--fl-ink)]">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-[var(--fl-slate)]">
                  {s.body}
                </p>
              </div>
              <div
                className={`flex min-h-40 items-center justify-center rounded-3xl p-8 ${
                  i % 2 === 1 ? "lg:order-1" : ""
                }`}
                style={{ backgroundColor: s.tint }}
              >
                <SceneVisual
                  kind={s.visual}
                  accent={s.accent}
                  paymentDemo={paymentDemo}
                  quoteDemo={quoteDemo}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Segment = { label: string; cents: Cents; color: string };

function SceneVisual({
  kind,
  accent,
  paymentDemo,
  quoteDemo,
}: {
  kind: VisualKind;
  accent: string;
  paymentDemo: Segment[];
  quoteDemo: Segment[];
}) {
  const { locale, t } = useLocale();

  if (kind === "quote") {
    return (
      <div className="w-full max-w-sm">
        <AllocationBar
          segments={quoteDemo}
          interactive={false}
          caption={t.rate.quoteCaption}
        />
      </div>
    );
  }
  if (kind === "allocate") {
    return (
      <div className="w-full max-w-sm">
        <AllocationBar
          segments={paymentDemo}
          interactive={false}
          caption={t.app.allocation.caption}
        />
      </div>
    );
  }
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="relative h-6 w-full overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full" style={{ width: "76%", backgroundColor: accent }} />
        <span
          className="absolute top-0 h-full w-0.5 bg-[var(--fl-ink)]"
          style={{ left: "33%" }}
          aria-hidden="true"
        />
      </div>
      <span className="fl-tnum text-sm font-medium text-[var(--fl-ink)]">
        {fill(t.home.howItWorks.visuals.runway, {
          months: formatMonths(4.6, locale),
        })}
      </span>
    </div>
  );
}
