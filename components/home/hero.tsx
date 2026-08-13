"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { container } from "@/components/container";
import { drawRule, maskRise, riseIn, stagger } from "@/components/home/home-motion";

/**
 * The statement. Type is the design: the approved headline at up to ~9vw in
 * Fraunces, word by word out of masks, the final phrase in italic. Behind it a
 * ghost "FrontDesk" layer drifts on scroll — CSS/transform parallax only, no
 * WebGL, nothing blocking paint. Reduced motion collapses every trick to a
 * plain fade.
 *
 * The words are split for animation only; the h1 carries the full approved
 * string in aria-label so nothing about the copy changes for a reader.
 */
export function HomeHero({
  eyebrow,
  title,
  sub,
  cta,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const ghostY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "28%"]);

  const words = title.split(" ");
  // The closing phrase ("traag antwoord." / "a slow reply.") turns italic —
  // the one typographic mark of drama; the copy itself is untouched.
  const italicFrom = words.length - 2;

  return (
    <section
      ref={ref}
      aria-label={title}
      className="relative flex min-h-[88svh] flex-col justify-center overflow-hidden"
    >
      <motion.span
        aria-hidden="true"
        style={{ y: ghostY }}
        className="pointer-events-none absolute -right-[6vw] top-[4vh] select-none font-serif text-[30vw] font-semibold leading-none tracking-tight text-[#1A1A1A]/[0.045]"
      >
        FrontDesk
      </motion.span>

      <div className={`${container} relative flex flex-col gap-8 py-20 sm:py-24`}>
        <motion.div
          variants={riseIn(reduce, 14)}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3"
        >
          <span aria-hidden="true" className="size-2 bg-[var(--fd-accent)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--fd-ink)]">
            {eyebrow}
          </span>
        </motion.div>

        <motion.h1
          aria-label={title}
          variants={stagger(reduce, 0.05, 0.1)}
          initial="hidden"
          animate="visible"
          className="max-w-[16ch] font-serif text-[clamp(2.9rem,9vw,8.25rem)] font-medium leading-[0.98] tracking-[-0.02em] text-[var(--fd-ink)]"
        >
          <span aria-hidden="true">
            {words.map((word, i) => (
              <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  variants={maskRise(reduce)}
                  className={`inline-block ${i >= italicFrom ? "italic" : ""}`}
                >
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </span>
        </motion.h1>

        <motion.span
          aria-hidden="true"
          variants={drawRule(reduce)}
          initial="hidden"
          animate="visible"
          className="h-[3px] w-24 origin-left bg-[var(--fd-accent)]"
        />

        {/* The editorial counter-move: promise and action step off the left
            rail the headline owns, into their own offset column. */}
        <div className="flex flex-col gap-8 lg:ml-[38%]">
          <motion.p
            variants={riseIn(reduce)}
            initial="hidden"
            animate="visible"
            transition={{ delay: reduce ? 0 : 0.5 }}
            className="max-w-xl text-lg leading-relaxed text-[var(--fd-slate)] sm:text-xl"
          >
            {sub}
          </motion.p>

          <motion.div variants={riseIn(reduce)} initial="hidden" animate="visible">
            <a
              href="#early-access"
              className="group inline-flex min-h-14 items-center gap-3 bg-[var(--fd-accent)] px-8 text-base font-semibold text-[var(--fd-ink)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--fd-ink)]"
            >
              {cta}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
