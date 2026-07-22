"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { AllocationBar } from "@/components/app/allocation-bar";
import { toCents } from "@/lib/domain/money";

const DEMO = [
  { label: "VAT", cents: toCents(434), color: "var(--fl-vat-fill)" },
  { label: "Reserve", cents: toCents(620), color: "var(--fl-reserve-fill)" },
  { label: "Yours", cents: toCents(1446), color: "var(--fl-payout-fill)" },
];

const STEPS = [
  {
    step: "Money arrives",
    body: "Enter a payment. Freelens separates the VAT, sets aside an income tax and Zvw reserve, and protects your business costs — so what's left is genuinely available to pay yourself.",
    accent: "var(--fl-vat-fill)",
    tint: "var(--fl-vat-tint)",
    visual: "allocate",
  },
  {
    step: "A calm weekly check-in",
    body: "Once a week, a quick read on your position: what's protected, what may be available, and how many months of runway you have. Saved on your device so it remembers, and you don't have to.",
    accent: "var(--fl-payout-fill)",
    tint: "var(--fl-payout-tint)",
    visual: "runway",
  },
  {
    step: "Check a decision",
    body: "Thinking about a purchase or a payout? See whether it fits within your optional spending room, and what it does to your runway — before you spend, not after.",
    accent: "var(--fl-decision-fill)",
    tint: "var(--fl-decision-tint)",
    visual: "decision",
  },
  {
    step: "Peace of mind",
    body: "Every euro has a job. Your reserves stay visible and protected. You know what you can do next.",
    accent: "var(--fl-reserve-fill)",
    tint: "var(--fl-reserve-tint)",
    visual: "locked",
  },
] as const;

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function HowItWorksSection() {
  const reduce = useReducedMotion();
  return (
    <section id="how-it-works" className="border-t border-[var(--fl-line)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          How it works
        </span>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          Every payment, given a job.
        </h2>
        <div className="mt-14 flex flex-col gap-16 sm:gap-20">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
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
                  {s.step}
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
                <SceneVisual kind={s.visual} accent={s.accent} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SceneVisual({ kind, accent }: { kind: string; accent: string }) {
  if (kind === "allocate") {
    return (
      <div className="w-full max-w-sm">
        <AllocationBar segments={DEMO} interactive={false} />
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
          4.6 months of runway
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
          Fits
        </span>
        <span className="fl-tnum text-sm text-[var(--fl-ink)]">
          €3.000 → €2.700 room
        </span>
      </div>
    );
  }
  // locked
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <AllocationBar segments={DEMO} interactive={false} />
      <span
        className="inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: accent }}
      >
        <Lock className="size-4" aria-hidden="true" />
        Every euro has a job
      </span>
    </div>
  );
}
