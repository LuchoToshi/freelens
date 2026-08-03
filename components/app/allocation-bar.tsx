"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { allocate } from "@/components/design/motion";
import { formatEuro, type Cents } from "@/lib/domain/money";
import { useT } from "@/components/i18n/locale-provider";

export interface AllocationSegment {
  label: string;
  cents: Cents;
  color: string;
}

/**
 * The Freelens signature (audit Q2 / Signature A): a tall, tactile, proportional
 * allocation bar. Segments slide into place, reveal their share on hover / focus
 * / tap, and are keyboard-focusable. Meaning is never carried by color alone-
 * every segment has a text label in the always-visible legend and a full
 * `aria-label`. Respects `prefers-reduced-motion`.
 *
 * The `segments` API is unchanged from the previous thin bar; `height` and
 * `interactive` are optional additions with backward-compatible defaults.
 */
export function AllocationBar({
  segments,
  height = 32,
  interactive = true,
  caption,
}: {
  segments: AllocationSegment[];
  height?: number;
  interactive?: boolean;
  /**
   * Resting caption above the bar. Overridable because on the rate page "job"
   * means a piece of client work, so the default reads as the wrong noun.
   */
  caption?: string;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const positive = segments.filter((s) => s.cents > 0);
  const total = positive.reduce((sum, s) => sum + s.cents, 0);
  if (total <= 0) return null;

  const pct = (cents: Cents) => Math.round((cents / total) * 100);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Reserved caption row so the reveal never shifts layout on hover/focus. */}
      <div
        className="min-h-4 text-xs font-medium text-[var(--fl-ink)]"
        aria-hidden="true"
      >
        {active !== null && positive[active] ? (
          <span>
            {positive[active].label}: {pct(positive[active].cents)}% ·{" "}
            <span className="fl-tnum">{formatEuro(positive[active].cents)}</span>
          </span>
        ) : (
          <span className="text-[var(--fl-slate)]">{caption ?? t.app.allocation.caption}</span>
        )}
      </div>

      <div
        className="flex w-full gap-px overflow-hidden rounded-full bg-[var(--fl-line)]"
        style={{ height }}
      >
        {positive.map((s, i) => {
          const isActive = active === i;
          return (
            <motion.div
              key={`${s.label}-${i}`}
              className="relative h-full first:rounded-l-full last:rounded-r-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
              style={{ backgroundColor: s.color }}
              initial={reduce ? false : { width: 0 }}
              animate={{
                width: `${(s.cents / total) * 100}%`,
                filter: isActive ? "brightness(1.06)" : "brightness(1)",
              }}
              transition={allocate(reduce)}
              tabIndex={interactive ? 0 : -1}
              aria-label={`${s.label}: ${pct(s.cents)} percent, ${formatEuro(s.cents)}`}
              onMouseEnter={interactive ? () => setActive(i) : undefined}
              onMouseLeave={interactive ? () => setActive(null) : undefined}
              onFocus={interactive ? () => setActive(i) : undefined}
              onBlur={interactive ? () => setActive(null) : undefined}
            />
          );
        })}
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
            {s.label}: <span className="fl-tnum">{formatEuro(s.cents)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
