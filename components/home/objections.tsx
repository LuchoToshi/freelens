"use client";

import { motion, useReducedMotion } from "framer-motion";
import { container } from "@/components/container";
import { riseIn } from "@/components/home/home-motion";

/**
 * Three objections as an editorial Q&A — numbered spreads with an offset
 * rhythm, not feature cards. The big Fraunces questions carry the section;
 * the answers stay quiet, constrained to a readable measure. Each spread
 * rises in once as it enters the viewport.
 */
export function Objections({ items }: { items: { q: string; a: string }[] }) {
  const reduce = useReducedMotion();

  return (
    <div className={`${container} flex flex-col`}>
      {items.map((item, i) => (
        <motion.div
          key={item.q}
          variants={riseIn(reduce)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className={`flex flex-col gap-4 border-t border-[var(--fd-line)] py-14 first:border-t-0 sm:py-20 ${
            i === 1 ? "sm:pl-[14%]" : i === 2 ? "sm:pl-[7%]" : ""
          }`}
        >
          <div className="flex items-baseline gap-5">
            <span
              aria-hidden="true"
              className="fl-tnum font-serif text-5xl font-medium leading-none text-[var(--fd-ink)]/15 sm:text-7xl"
            >
              0{i + 1}
            </span>
            <h2 className="max-w-[22ch] font-serif text-3xl font-medium leading-[1.05] tracking-tight text-[var(--fd-ink)] sm:text-5xl">
              {item.q}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-[var(--fd-slate)] sm:pl-[4.5rem] sm:text-lg">
            {item.a}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
