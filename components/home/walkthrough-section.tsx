"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  calculateInvoiceSplit,
  calculateSafeToSpend,
  formatEuro,
} from "@/lib/calc";

// A single worked example carried through the whole narrative, so every
// number below is real output from lib/calc.ts, not an illustration.
const EXAMPLE_INVOICE = 2000;
const EXAMPLE_TAX_PERCENT = 30;
const EXAMPLE_BALANCE = 6000;
const EXAMPLE_COSTS = 1200;
const EXAMPLE_BUFFER_MONTHS = 2;
const EXAMPLE_PURCHASE = 350;

const invoiceSplit = calculateInvoiceSplit(EXAMPLE_INVOICE, EXAMPLE_TAX_PERCENT);
const { safeToSpend } = calculateSafeToSpend({
  balance: EXAMPLE_BALANCE,
  monthlyEssentialCosts: EXAMPLE_COSTS,
  taxReservePercent: EXAMPLE_TAX_PERCENT,
  bufferMonths: EXAMPLE_BUFFER_MONTHS,
  taxBase: EXAMPLE_BALANCE,
});
const purchaseFits = EXAMPLE_PURCHASE <= safeToSpend;
const remainingAfterPurchase = safeToSpend - EXAMPLE_PURCHASE;

const BEATS = [
  {
    step: "Money comes in",
    body: `A ${formatEuro(EXAMPLE_INVOICE)} invoice lands. ${formatEuro(
      invoiceSplit.setAsideForTax
    )} is set aside for tax. The rest is yours.`,
    figure: formatEuro(invoiceSplit.keepAsSafeToSpend),
    figureLabel: "yours to keep",
  },
  {
    step: "Weekly check",
    body: "Five minutes on a Sunday: your balance, your costs, your buffer.",
    figure: formatEuro(EXAMPLE_BALANCE),
    figureLabel: "in the account",
  },
  {
    step: "Safe spending updates",
    body: "Taxes and buffer are already accounted for. One honest number remains.",
    figure: formatEuro(safeToSpend),
    figureLabel: "safe to spend",
  },
  {
    step: "Purchase approved",
    body: `Something costs ${formatEuro(EXAMPLE_PURCHASE)}. ${
      purchaseFits ? "It fits." : "It doesn't fit yet."
    }`,
    figure: purchaseFits
      ? formatEuro(remainingAfterPurchase)
      : formatEuro(EXAMPLE_PURCHASE - safeToSpend),
    figureLabel: purchaseFits ? "left after buying it" : "short of covered",
  },
  {
    step: "Peace of mind",
    body: "You know before you spend. Nothing to check twice.",
    figure: undefined,
    figureLabel: undefined,
  },
] as const;

const beatVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function WalkthroughSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="How Freelens works, start to finish"
      className="border-t border-[var(--fl-line)] bg-white"
    >
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          One thread, start to finish.
        </h2>

        <div className="mt-12 flex flex-col">
          {BEATS.map((beat, index) => (
            <motion.div
              key={beat.step}
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={beatVariants}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.5,
                ease: "easeOut",
              }}
              className={`flex items-start gap-6 py-6 ${
                index !== BEATS.length - 1
                  ? "border-b border-[var(--fl-line)]"
                  : ""
              }`}
            >
              <span className="mt-1 font-mono text-xs text-[var(--fl-slate)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
                    {beat.step}
                  </h3>
                  <p className="max-w-md text-sm leading-relaxed text-[var(--fl-slate)]">
                    {beat.body}
                  </p>
                </div>
                {beat.figure ? (
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="font-mono text-lg font-semibold tabular-nums text-[var(--fl-ink)]">
                      {beat.figure}
                    </p>
                    <p className="text-xs text-[var(--fl-slate)]">
                      {beat.figureLabel}
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
