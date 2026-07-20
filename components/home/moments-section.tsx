"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CheckFirstGlyph,
  HolidayGlyph,
  PaymentLandedGlyph,
  SundayCheckinGlyph,
} from "@/components/home/moment-glyphs";

const MOMENTS = [
  {
    glyph: PaymentLandedGlyph,
    title: "Money just landed.",
    detail: "Know what's yours immediately.",
  },
  {
    glyph: CheckFirstGlyph,
    title: "Thinking about buying something?",
    detail: "Check first. Spend with confidence.",
  },
  {
    glyph: SundayCheckinGlyph,
    title: "Sunday evening.",
    detail: "Five minutes, and you're ready for the week.",
  },
  {
    glyph: HolidayGlyph,
    title: "Planning a holiday.",
    detail: "Know exactly what you can enjoy.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function MomentsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="moments"
      aria-label="Moments this is built for"
      className="border-t border-[var(--fl-line)]"
    >
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="max-w-md font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          Moments this is built for.
        </h2>

        <motion.div
          className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2"
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {MOMENTS.map(({ glyph: Glyph, title, detail }, index) => (
            <motion.div
              key={title}
              variants={cardVariants}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.5,
                ease: "easeOut",
              }}
              className={
                index % 2 === 1 ? "sm:mt-10 flex flex-col gap-3" : "flex flex-col gap-3"
              }
            >
              <Glyph className="size-8 text-[var(--fl-ink)]" />
              <h3 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
                {title}
              </h3>
              <p className="text-base leading-relaxed text-[var(--fl-slate)]">
                {detail}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
