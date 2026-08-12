"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { container } from "@/components/container";
import { riseIn, stagger } from "@/components/home/home-motion";

/**
 * The follow-up hook: one idea at full theatrical weight. The only place the
 * accent is used as a surface — a burnt-orange band with the question in
 * oversized ink Fraunces and a ghost quote drifting behind on scroll. Nothing
 * else shares this treatment, which is what makes it land.
 */
export function FollowupHook({ q, a }: { q: string; a: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ghostY = useTransform(scrollYProgress, [0, 1], ["10%", reduce ? "10%" : "-14%"]);

  return (
    <section
      ref={ref}
      aria-label={q}
      className="relative overflow-hidden bg-[var(--fd-accent)]"
    >
      <motion.span
        aria-hidden="true"
        style={{ y: ghostY }}
        className="pointer-events-none absolute -left-[2vw] top-0 select-none font-serif text-[38vw] font-semibold leading-none text-[#1A1A1A]/[0.07]"
      >
        &ldquo;
      </motion.span>

      <motion.div
        variants={stagger(reduce, 0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className={`${container} relative flex flex-col gap-6 py-24 sm:py-36`}
      >
        <motion.h2
          variants={riseIn(reduce)}
          className="max-w-[18ch] font-serif text-[clamp(2.2rem,6vw,5rem)] font-medium italic leading-[1.02] tracking-tight text-[var(--fd-ink)]"
        >
          {q}
        </motion.h2>
        <motion.p
          variants={riseIn(reduce)}
          className="max-w-2xl text-lg leading-relaxed text-[var(--fd-ink)]/85 sm:text-xl"
        >
          {a}
        </motion.p>
      </motion.div>
    </section>
  );
}
