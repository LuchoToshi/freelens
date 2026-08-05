"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useT } from "@/components/i18n/locale-provider";

/**
 * The living hero headline (audit L2): "Money arrived" stays stable while the
 * creative context swaps with a masked vertical reveal, then resolves to "Know
 * what happens next." Under `prefers-reduced-motion` it renders the strong
 * static promise with no rotation and no typewriter effect.
 */
export function LivingHeadline() {
  const reduce = useReducedMotion();
  const t = useT();
  const [i, setI] = useState(0);
  const contexts = t.home.hero.contexts;

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % contexts.length), 2600);
    return () => clearInterval(id);
  }, [reduce, contexts.length]);

  // A shorter translated list must never leave the index out of range.
  const index = i % contexts.length;

  return (
    // 48px on a 375px screen turned a two-sentence headline into eight lines
    // and pushed the body copy, both calls to action and the trust row off the
    // first viewport. The headline still leads the page; it no longer is the page.
    <h1 className="font-serif text-4xl font-medium leading-[1.06] tracking-tight text-balance text-[var(--fl-ink)] sm:text-5xl lg:text-6xl">
      {reduce ? (
        <>{t.home.hero.headlineStatic}</>
      ) : (
        <>
          <span className="block">{t.home.hero.headlineLine1}</span>
          {/* The rotating phrase gets its own reserved slot. An invisible sizer
              stacks every phrase in one grid cell, so the slot always occupies
              the largest phrase's width and wrapped height at any breakpoint-
              shorter phrases can never change the layout below. */}
          <span className="relative block">
            <span className="grid" aria-hidden="true">
              {contexts.map((c) => (
                <span key={c} className="invisible col-start-1 row-start-1">
                  {c}.
                </span>
              ))}
            </span>
            <span className="absolute inset-0 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={index}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  <span className="text-[var(--fl-vat-text)]">{contexts[index]}</span>
                  <span>.</span>
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
          <span className="block">{t.home.hero.headlineLine3}</span>
        </>
      )}
    </h1>
  );
}
