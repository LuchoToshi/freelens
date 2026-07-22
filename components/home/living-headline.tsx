"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const CONTEXTS = [
  "from a shoot",
  "from a gig",
  "from a client",
  "from a campaign",
  "from a production day",
];

/**
 * The living hero headline (audit L2): "Money arrived" stays stable while the
 * creative context swaps with a masked vertical reveal, then resolves to "Know
 * what happens next." Under `prefers-reduced-motion` it renders the strong
 * static promise with no rotation and no typewriter effect.
 */
export function LivingHeadline() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % CONTEXTS.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-balance text-[var(--fl-ink)] sm:text-6xl lg:text-7xl">
      {reduce ? (
        <>Money arrived. Know what happens next.</>
      ) : (
        <>
          <span>Money arrived </span>
          <span className="relative inline-flex h-[1.05em] overflow-hidden align-bottom">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={i}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="whitespace-nowrap text-[var(--fl-vat-text)]"
              >
                {CONTEXTS[i]}
              </motion.span>
            </AnimatePresence>
          </span>
          <span>.</span>
          <br />
          <span>Know what happens next.</span>
        </>
      )}
    </h1>
  );
}
