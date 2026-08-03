"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { AllocationBar } from "@/components/app/allocation-bar";
import { formatEuro, toCents } from "@/lib/domain/money";
import { useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type VisualKind = "allocate" | "runway" | "decision" | "locked";

export function HowItWorksSection() {
  const reduce = useReducedMotion();
  const t = useT();

  const demo = [
    { label: t.app.allocation.vat, cents: toCents(434), color: "var(--fl-vat-fill)" },
    { label: t.app.allocation.reserve, cents: toCents(620), color: "var(--fl-reserve-fill)" },
    { label: t.app.allocation.yours, cents: toCents(1446), color: "var(--fl-payout-fill)" },
  ];

  const steps: {
    title: string;
    body: string;
    accent: string;
    tint: string;
    visual: VisualKind;
  }[] = [
    {
      title: t.home.howItWorks.steps.moneyArrives.title,
      body: t.home.howItWorks.steps.moneyArrives.body,
      accent: "var(--fl-vat-fill)",
      tint: "var(--fl-vat-tint)",
      visual: "allocate",
    },
    {
      title: t.home.howItWorks.steps.weekly.title,
      body: t.home.howItWorks.steps.weekly.body,
      accent: "var(--fl-payout-fill)",
      tint: "var(--fl-payout-tint)",
      visual: "runway",
    },
    {
      title: t.home.howItWorks.steps.decision.title,
      body: t.home.howItWorks.steps.decision.body,
      accent: "var(--fl-decision-fill)",
      tint: "var(--fl-decision-tint)",
      visual: "decision",
    },
    {
      title: t.home.howItWorks.steps.peace.title,
      body: t.home.howItWorks.steps.peace.body,
      accent: "var(--fl-reserve-fill)",
      tint: "var(--fl-reserve-tint)",
      visual: "locked",
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-[var(--fl-line)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {t.home.howItWorks.eyebrow}
        </span>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          {t.home.howItWorks.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
          {t.home.howItWorks.body}
        </p>
        <div className="mt-14 flex flex-col gap-16 sm:gap-20">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={variants}
              transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <span
                  className="fl-tnum font-serif text-6xl font-medium sm:text-7xl"
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
                <SceneVisual kind={s.visual} accent={s.accent} demo={demo} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SceneVisual({
  kind,
  accent,
  demo,
}: {
  kind: VisualKind;
  accent: string;
  demo: { label: string; cents: ReturnType<typeof toCents>; color: string }[];
}) {
  const t = useT();

  if (kind === "allocate") {
    return (
      <div className="w-full max-w-sm">
        <AllocationBar segments={demo} interactive={false} caption={t.app.allocation.caption} />
      </div>
    );
  }
  if (kind === "runway") {
    return (
      <div className="flex w-full max-w-sm flex-col gap-2">
        <div className="relative h-6 w-full overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full" style={{ width: "76%", backgroundColor: accent }} />
          <span className="absolute top-0 h-full w-0.5 bg-[var(--fl-ink)]" style={{ left: "33%" }} aria-hidden="true" />
        </div>
        <span className="fl-tnum text-sm font-medium text-[var(--fl-ink)]">
          {fill(t.home.howItWorks.visuals.runway, { months: "4,6" })}
        </span>
      </div>
    );
  }
  if (kind === "decision") {
    return (
      <div className="flex flex-col items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold"
          style={{ color: accent }}
        >
          <Check className="size-4" aria-hidden="true" />
          {t.home.howItWorks.visuals.fits}
        </span>
        <span className="fl-tnum text-sm text-[var(--fl-ink)]">
          {fill(t.home.howItWorks.visuals.decisionRoom, {
            spend: formatEuro(toCents(3000)),
            room: formatEuro(toCents(2700)),
          })}
        </span>
      </div>
    );
  }
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <AllocationBar segments={demo} interactive={false} caption={t.app.allocation.caption} />
      <span
        className="inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: accent }}
      >
        <Lock className="size-4" aria-hidden="true" />
        {t.home.howItWorks.visuals.everyEuro}
      </span>
    </div>
  );
}
