"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ExampleBadge } from "@/components/example-badge";
import { riseIn, stagger } from "@/components/home/home-motion";

/**
 * The centerpiece: bold FRAME, calm CONTENT. The frame is an ink gallery
 * wall — the darkest, most dramatic surface on the page — and the reveal is a
 * single choreographed rise. The inquiry card and the drafted reply inside
 * stay white, sharp and perfectly still: seeing and READING the draft is the
 * conversion, so nothing ever moves or obscures the text after arrival.
 *
 * Static and presentational on purpose: hardcoded dictionary copy marked with
 * the Example badge, never the live pipeline. The renderer takes a data
 * object, so a later interactive demo (pick an event type, a draft forms up)
 * only swaps the object.
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
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={stagger(reduce, 0.14)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5"
    >
      <motion.div
        variants={riseIn(reduce)}
        className="flex flex-col gap-1.5 border border-white/15 bg-white p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fd-slate)]">
            {data.inquiryLabel}
          </span>
          <ExampleBadge />
        </div>
        <p className="text-sm font-medium text-[var(--fd-ink)]">{data.clientName}</p>
        <p className="fl-tnum text-sm text-[var(--fd-slate)]">
          {data.eventType} · {data.eventDate} · {data.budget}
        </p>
      </motion.div>

      <motion.div
        variants={riseIn(reduce)}
        className="relative flex flex-col gap-3 bg-white p-6 outline outline-1 outline-offset-8 outline-white/25 sm:p-9"
      >
        <span aria-hidden="true" className="absolute left-0 top-0 h-[3px] w-16 bg-[var(--fd-accent)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fd-slate)]">
          {data.draftLabel}
        </span>
        <p className="whitespace-pre-line border-t border-[var(--fd-line)] pt-4 font-serif text-[1.15rem] leading-[1.75] text-[var(--fd-ink)]">
          {data.draft}
        </p>
      </motion.div>

      <motion.p variants={riseIn(reduce)} className="text-sm leading-relaxed text-white/60">
        {data.caption}
      </motion.p>
    </motion.div>
  );
}
