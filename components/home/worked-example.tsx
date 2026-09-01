"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExampleBadge } from "@/components/example-badge";
import { EASE, riseIn, stagger } from "@/components/home/home-motion";

/**
 * The centerpiece, now interactive: pick an event type, see the inquiry and
 * the drafted reply swap. An INTERACTIVE CANNED demo by deliberate decision:
 * every pair is pre-written dictionary copy, checked in the test suite
 * against the product's real draft guards. No API calls, no per-visit cost,
 * no latency, no abuse surface. The live-generation version is explicitly
 * out of scope.
 *
 * Bold FRAME, calm CONTENT still holds: the swap is one brief reveal (blur
 * settling into place, so it feels generated), and after it the text is
 * perfectly still and legible. Reduced motion swaps instantly. The reply
 * card carries a min-height sized to the longest draft so switching never
 * shifts the layout below.
 *
 * Honesty rules, load-bearing: wedding names €1.950 and portrait €350
 * because matching packages exist; party and business name none; no draft
 * ever claims a date is free. The Example badge persists across all chips.
 * Do not alter that balance.
 */
export interface DemoType {
  label: string;
  clientName: string;
  eventDate: string;
  budget: string;
  draft: string;
}

export interface WorkedExampleDemo {
  types: Record<"wedding" | "event" | "brand_film" | "social_content", DemoType>;
  caption: string;
  bridge: string;
  /** Sits above the inquiry card, framing it as just-arrived rather than a
   *  form receipt. Type-agnostic, like caption/bridge below, so it stays
   *  true no matter which chip is selected. */
  inquiryMeta: string;
  /** The before/after beat above the chips. Deliberately type-agnostic —
   *  naming the selected type here would go stale the moment someone picks
   *  a different chip, the same class of bug the product's own draft guards
   *  exist to prevent. */
  intro: string;
  /** Label in front of the demoted chip row, e.g. "or see:". */
  orSeeLabel: string;
}

const LEAD_KEY = "wedding" as const;
const OTHER_KEYS = ["event", "brand_film", "social_content"] as const;
type TypeKey = typeof LEAD_KEY | (typeof OTHER_KEYS)[number];

export function WorkedExample({
  demo,
  inquiryLabel,
  draftLabel,
}: {
  demo: WorkedExampleDemo;
  inquiryLabel: string;
  draftLabel: string;
}) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<TypeKey>("wedding");
  const active = demo.types[selected];

  // Keyed remount rather than AnimatePresence: the exiting child's animation
  // never completed here, so `mode="wait"` held the old card on screen forever
  // and every chip showed the wedding reply. The card only ever needed an
  // entrance, so the swap is the entrance and nothing has to finish leaving.
  const swap = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 10, filter: "blur(5px)" },
        animate: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.45, ease: EASE },
        },
      };

  return (
    <motion.div
      variants={stagger(reduce, 0.14)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5"
    >
      {/* The before/after beat: the payoff stated up front, not just at the
          bottom where it's easy to scroll past. */}
      <motion.p variants={riseIn(reduce)} className="text-sm font-medium leading-relaxed text-white/85">
        {demo.intro}
      </motion.p>

      {/* The pick: one persona leads (wedding, already preselected, so the
          section works with zero interaction), the other three demoted to a
          smaller row so this reads as one story instead of a feature matrix.
          Plain buttons throughout, so keyboard access is the platform's own. */}
      <motion.div variants={riseIn(reduce)} className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={selected === LEAD_KEY}
          onClick={() => setSelected(LEAD_KEY)}
          className={`min-h-11 border px-5 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            selected === LEAD_KEY
              ? "border-white bg-white text-[var(--fd-ink)]"
              : "border-white/30 bg-transparent text-white hover:border-white"
          }`}
        >
          {demo.types[LEAD_KEY].label}
        </button>

        <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
          {demo.orSeeLabel}
        </span>

        {OTHER_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={selected === key}
            onClick={() => setSelected(key)}
            className={`min-h-11 border px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              selected === key
                ? "border-white bg-white text-[var(--fd-ink)]"
                : "border-white/30 bg-transparent text-white/70 hover:border-white hover:text-white"
            }`}
          >
            {demo.types[key].label}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={riseIn(reduce)}
        className="flex flex-col gap-1.5 border border-white/15 bg-white p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fd-slate)]">
            {inquiryLabel}
          </span>
          <ExampleBadge />
        </div>
        <p className="text-xs text-[var(--fd-slate)]">{demo.inquiryMeta}</p>
        <motion.div key={selected} {...swap} className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-[var(--fd-ink)]">{active.clientName}</p>
          <p className="fl-tnum text-sm text-[var(--fd-slate)]">
            {active.label} · {active.eventDate} · {active.budget}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        variants={riseIn(reduce)}
        className="relative flex flex-col gap-3 bg-white p-6 outline outline-1 outline-offset-8 outline-white/25 sm:p-9"
      >
        <span aria-hidden="true" className="absolute left-0 top-0 h-[3px] w-16 bg-[var(--fd-accent)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fd-slate)]">
          {draftLabel}
        </span>
        {/* min-height fits the longest draft at each breakpoint, so switching
            chips never moves the content below the card. */}
        <div className="min-h-[29rem] border-t border-[var(--fd-line)] pt-4 sm:min-h-[19rem]">
          <motion.p
            key={selected}
            {...swap}
            className="whitespace-pre-line font-serif text-[1.15rem] leading-[1.75] text-[var(--fd-ink)]"
          >
            {active.draft}
          </motion.p>
        </div>
      </motion.div>

      <motion.div variants={riseIn(reduce)} className="flex flex-col gap-1.5">
        <p className="text-sm leading-relaxed text-white/60">{demo.caption}</p>
        <p className="text-sm font-medium leading-relaxed text-white/85">{demo.bridge}</p>
      </motion.div>
    </motion.div>
  );
}
