"use client";

import { ExampleBadge } from "@/components/example-badge";

/**
 * The centerpiece of the homepage: one inquiry, the reply beneath it, a
 * caption. Seeing the draft IS the pitch, so this is visually the strongest
 * thing on the page.
 *
 * Static and presentational on purpose: the content is hardcoded dictionary
 * copy, marked with the Example badge so it never implies a real client, and
 * it never calls the live draft pipeline. It renders whatever data object it
 * is given, so a later interactive demo (visitor picks an event type, a draft
 * forms up) only has to swap the object — not rebuild the section.
 *
 * The draft models the product's honesty rules in the marketing itself: it
 * names a real package price and makes zero availability claims ("I'd love to
 * check the date", never "that date is open"). Do not alter that balance.
 */
export interface WorkedExampleData {
  inquiryLabel: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  budget: string;
  draftLabel: string;
  draft: string;
  caption: string;
}

export function WorkedExample({ data }: { data: WorkedExampleData }) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-1.5 rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {data.inquiryLabel}
          </span>
          <ExampleBadge />
        </div>
        <p className="text-sm font-medium text-[var(--fl-ink)]">{data.clientName}</p>
        <p className="fl-tnum text-sm text-[var(--fl-slate)]">
          {data.eventType} · {data.eventDate} · {data.budget}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-ink)] bg-white p-5 shadow-sm sm:p-7">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {data.draftLabel}
        </span>
        <p className="whitespace-pre-line border-t border-[var(--fl-line)] pt-3 text-base leading-relaxed text-[var(--fl-ink)]">
          {data.draft}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{data.caption}</p>
    </div>
  );
}
