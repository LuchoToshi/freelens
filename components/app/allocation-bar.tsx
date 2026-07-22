"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatEuro, type Cents } from "@/lib/domain/money";

export interface AllocationSegment {
  label: string;
  cents: Cents;
  color: string;
}

/**
 * A proportional, animated multi-segment bar (VAT / reserve / costs / buffer /
 * payout). Only positive segments are drawn; a negative payout is reported
 * separately by the caller. Respects prefers-reduced-motion.
 */
export function AllocationBar({ segments }: { segments: AllocationSegment[] }) {
  const reduce = useReducedMotion();
  const positive = segments.filter((s) => s.cents > 0);
  const total = positive.reduce((sum, s) => sum + s.cents, 0);
  if (total <= 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--fl-line)]">
        {positive.map((s, i) => (
          <motion.div
            key={`${s.label}-${i}`}
            className="h-full"
            style={{ backgroundColor: s.color }}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${(s.cents / total) * 100}%` }}
            transition={{ duration: reduce ? 0 : 0.6, ease: "easeOut" }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {positive.map((s, i) => (
          <li
            key={`legend-${s.label}-${i}`}
            className="flex items-center gap-1.5 text-xs text-[var(--fl-slate)]"
          >
            <span
              className="inline-block size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            {s.label}: {formatEuro(s.cents)}
          </li>
        ))}
      </ul>
    </div>
  );
}
