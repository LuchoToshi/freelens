"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  calculateSafeToSpend,
  formatEuro,
  getMonthStatus,
  getStatusReason,
  roundToNearest,
  type MonthStatus,
} from "@/lib/calc";
import { useCountUp } from "@/components/design-a/use-count-up";

const FIXED_COSTS = 1200;
const FIXED_BUFFER_MONTHS = 2;
const FIXED_TAX_PERCENT = 30;
const MIN_INCOME = 1000;
const MAX_INCOME = 10000;
const STEP = 50;
const DEFAULT_INCOME = 5500;
const LOWER_BUFFER_SAVINGS = FIXED_COSTS * 1;

const STATUS_COPY: Record<
  MonthStatus,
  { label: string; tint: string; text: string }
> = {
  good: { label: "Healthy", tint: "#eaf4ee", text: "#1f7a4d" },
  tight: { label: "Borderline", tint: "#fbf1de", text: "#a8721c" },
  short: { label: "Tight", tint: "#fbeaea", text: "#b8362b" },
};

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function InteractiveHero() {
  const [income, setIncome] = useState(DEFAULT_INCOME);
  const prefersReducedMotion = useReducedMotion();

  const { taxReserve, buffer, safeToSpend } = calculateSafeToSpend({
    balance: income,
    monthlyEssentialCosts: FIXED_COSTS,
    taxReservePercent: FIXED_TAX_PERCENT,
    bufferMonths: FIXED_BUFFER_MONTHS,
    taxBase: income,
  });
  const rounded = roundToNearest(safeToSpend);
  const isShort = rounded < 0;
  const status = getMonthStatus(safeToSpend, FIXED_COSTS);
  const statusCopy = STATUS_COPY[status];
  const statusReason = getStatusReason(status, safeToSpend, FIXED_COSTS);

  const animatedResult = useCountUp(rounded);
  const animatedBuffer = useCountUp(buffer);
  const animatedTaxReserve = useCountUp(taxReserve);

  return (
    <div
      id="live-demo"
      className="rounded-2xl border border-[#e3e1da] p-6 shadow-sm transition-colors duration-300 sm:p-8"
      style={{ backgroundColor: statusCopy.tint }}
    >
      <div className="flex items-center justify-between">
        <label htmlFor="income-slider" className="text-sm font-medium text-[#5b6472]">
          Drag your monthly income
        </label>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={prefersReducedMotion ? false : { opacity: 0, y: -4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="text-sm font-semibold"
            style={{ color: statusCopy.text }}
          >
            {statusCopy.label}
          </motion.span>
        </AnimatePresence>
      </div>

      <input
        id="income-slider"
        type="range"
        min={MIN_INCOME}
        max={MAX_INCOME}
        step={STEP}
        value={income}
        onChange={(event) => setIncome(Number(event.target.value))}
        className="mt-4 w-full accent-[#122540]"
      />
      <div className="mt-1 flex justify-between text-xs text-[#5b6472]">
        <span>{formatEuro(MIN_INCOME)}</span>
        <span className="font-semibold text-[#122540]">
          {formatEuro(income)}
        </span>
        <span>{formatEuro(MAX_INCOME)}</span>
      </div>
      <p className="mt-2 text-xs text-[#5b6472]">
        Based on example costs and a cautious buffer — /tool uses your real
        numbers.
      </p>

      <div className="mt-6 border-t border-black/10 pt-6">
        {isShort ? (
          <>
            <span className="text-sm font-medium text-[#5b6472]">
              Right now
            </span>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-[#122540] sm:text-4xl">
              You&apos;re {formatEuro(Math.abs(animatedResult))} short of
              covered.
            </p>
            <p className="mt-2 text-sm text-[#5b6472]">
              That&apos;s because {statusReason}
            </p>
          </>
        ) : (
          <>
            <span className="text-sm font-medium text-[#5b6472]">
              Safe to spend
            </span>
            <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums text-[#122540] sm:text-6xl">
              {formatEuro(animatedResult)}
            </p>
          </>
        )}
        <p className="mt-3 text-sm font-medium text-[#122540]">
          {isShort
            ? "A few tweaks below could close that gap."
            : "That's yours to spend guilt-free this month."}
        </p>
      </div>

      <motion.div
        className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-5 text-sm"
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.15 }}
      >
        <motion.div
          className="flex items-center justify-between"
          variants={rowVariants}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }}
        >
          <span className="text-[#5b6472]">Your money</span>
          <span className="font-semibold tabular-nums text-[#122540]">
            {formatEuro(income)}
          </span>
        </motion.div>
        <motion.div
          className="flex flex-col gap-1"
          variants={rowVariants}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[#5b6472]">Minus your cushion</span>
            <span className="font-semibold tabular-nums text-[#122540]">
              −{formatEuro(animatedBuffer)}
            </span>
          </div>
          <p className="text-xs text-[#5b6472]">
            Lower your buffer to 1 month and free up{" "}
            {formatEuro(LOWER_BUFFER_SAVINGS)}.
          </p>
        </motion.div>
        <motion.div
          className="flex items-center justify-between"
          variants={rowVariants}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }}
        >
          <span className="text-[#5b6472]">Minus taxes</span>
          <span className="font-semibold tabular-nums text-[#122540]">
            −{formatEuro(animatedTaxReserve)}
          </span>
        </motion.div>
        <motion.div
          className="flex items-center justify-between border-t border-black/10 pt-3"
          variants={rowVariants}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }}
        >
          <span className="font-medium text-[#122540]">Safe to spend</span>
          <span className="font-semibold tabular-nums text-[#122540]">
            {isShort
              ? `${formatEuro(Math.abs(animatedResult))} short`
              : formatEuro(animatedResult)}
          </span>
        </motion.div>
      </motion.div>

      <p className="mt-4 text-xs text-[#5b6472]">
        Not tax advice — a clear estimate to work from. Your numbers never
        leave your browser.
      </p>
    </div>
  );
}
