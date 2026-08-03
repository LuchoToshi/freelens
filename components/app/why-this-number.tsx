"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatEuro, type Cents } from "@/lib/domain/money";
import type { BreakdownStep } from "@/lib/domain/allocation";
import { pillButtonClass } from "@/components/app/styles";
import { useT } from "@/components/i18n/locale-provider";
import type { Dictionary } from "@/lib/i18n";

/**
 * Collapsible plain-language arithmetic behind any result. Renders the exact
 * cents so the parts always reconcile, even though headline figures elsewhere
 * are shown rounded to whole euros.
 */
/**
 * Breakdown steps arrive from `lib/domain/allocation` already worded in
 * English, because that module is pure calculation and knows nothing about a
 * locale. Rather than thread a locale through it, the label is looked up here
 * and falls back to itself, so an untranslated step still reads as a sentence.
 */
function translateStep(t: Dictionary, label: string): string {
  const table = t.app.breakdown as Record<string, string | undefined>;
  return table[label] ?? label;
}

export function WhyThisNumber({
  steps,
  resultLabel,
  resultCents,
  reserveSourceNote,
}: {
  steps: BreakdownStep[];
  resultLabel: string;
  resultCents: Cents;
  reserveSourceNote?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[var(--fl-line)] pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`${pillButtonClass} mx-auto`}
      >
        {t.app.whyThisNumber.toggle}
        {open ? (
          <ChevronUp className="size-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-3.5" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="mt-4 flex flex-col gap-2 text-left">
          {steps.map((step, i) => (
            <div
              key={`${step.label}-${i}`}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <span className="text-[var(--fl-slate)]">{translateStep(t, step.label)}</span>
              <span className="font-mono tabular-nums text-[var(--fl-ink)]">
                {i === 0 ? "" : signPrefix(step.deltaCents)}
                {formatEuro(absCents(step.deltaCents))}
              </span>
            </div>
          ))}
          <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-[var(--fl-line)] pt-2 text-sm font-semibold">
            <span className="text-[var(--fl-ink)]">{resultLabel}</span>
            <span className="font-mono tabular-nums text-[var(--fl-ink)]">
              {formatEuro(resultCents)}
            </span>
          </div>
          {reserveSourceNote && (
            <p className="mt-2 text-xs text-[var(--fl-slate)]">
              {reserveSourceNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function signPrefix(cents: Cents): string {
  if (cents < 0) return "− ";
  return "+ ";
}

function absCents(cents: Cents): Cents {
  return Math.abs(cents) as Cents;
}
