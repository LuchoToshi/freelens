"use client";

import { ShieldCheck, ChevronDown } from "lucide-react";
import { Accordion } from "@base-ui/react/accordion";

/**
 * Confidence block (audit Q3 / Signature C). Replaces repeated fine-print
 * disclaimers with one calm, designed trust module: a shield mark, one warm
 * sentence, and an expandable "How this estimate works" detail. Frames privacy
 * and caution as product features, not legal noise, without dropping any
 * necessary caveat.
 */
export function ConfidenceBlock({
  sentence = "A planning estimate, never a hidden promise. Your numbers stay on this device.",
  detail,
  className = "",
}: {
  sentence?: string;
  detail?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <ShieldCheck
          className="mt-0.5 size-5 shrink-0 text-[var(--fl-reserve-text)]"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-relaxed text-[var(--fl-ink)]">
            {sentence}
          </p>
          {detail ? (
            <Accordion.Root className="mt-1">
              <Accordion.Item>
                <Accordion.Header>
                  <Accordion.Trigger className="group flex min-h-11 items-center gap-1.5 bg-transparent py-1 text-sm font-medium text-[var(--fl-slate)] select-none hover:text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
                    How this estimate works
                    <ChevronDown
                      className="size-4 transition-transform duration-200 group-data-panel-open:rotate-180"
                      aria-hidden="true"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden text-sm leading-relaxed text-[var(--fl-slate)] transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0">
                  <div className="pt-1">{detail}</div>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>
          ) : null}
        </div>
      </div>
    </div>
  );
}
