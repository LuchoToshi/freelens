"use client";

import { motion, useReducedMotion } from "framer-motion";
import { container } from "@/components/container";
import { riseIn, stagger } from "@/components/home/home-motion";

/**
 * Three objections as an editorial Q&A. Each spread layers the question over
 * an oversized ghost numeral — depth from typography, not shadows — with an
 * accent tick between question and answer and an alternating indent rhythm.
 * Reveals are sequenced (numeral, question, tick, answer) and fire once.
 */
export function Objections({ items }: { items: { q: string; a: string }[] }) {
  const reduce = useReducedMotion();

  return (
    <div className={`${container} flex flex-col`}>
      {items.map((item, i) => (
        <motion.div
          key={item.q}
          variants={stagger(reduce, 0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className={`relative border-t border-[var(--fd-line)] py-16 first:border-t-0 sm:py-24 ${
            i === 1 ? "sm:pl-[18%]" : i === 2 ? "sm:pl-[9%]" : ""
          }`}
        >
          <motion.span
            aria-hidden="true"
            variants={riseIn(reduce, 16)}
            className={`pointer-events-none absolute top-6 select-none font-serif text-[7rem] font-semibold leading-none text-[var(--fd-ink)]/[0.07] sm:top-2 sm:text-[13rem] ${
              i === 1 ? "left-0 sm:left-[18%]" : i === 2 ? "left-0 sm:left-[9%]" : "left-0"
            }`}
          >
            0{i + 1}
          </motion.span>

          <div className="relative flex flex-col gap-5 pt-10 sm:pt-20">
            <motion.h2
              variants={riseIn(reduce)}
              className="max-w-[18ch] font-serif text-[clamp(2.1rem,4.8vw,4.25rem)] font-medium leading-[1.02] tracking-tight text-[var(--fd-ink)]"
            >
              {item.q}
            </motion.h2>
            <motion.span
              aria-hidden="true"
              variants={riseIn(reduce, 8)}
              className="h-[2px] w-10 bg-[var(--fd-accent)]"
            />
            <motion.p
              variants={riseIn(reduce)}
              className="max-w-xl text-lg leading-relaxed text-[var(--fd-slate)] sm:text-xl"
            >
              {item.a}
            </motion.p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
