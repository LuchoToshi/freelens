/**
 * Homepage motion grammar. Same contract as components/design/motion.ts —
 * every helper takes `reduce` from useReducedMotion() and collapses to an
 * instant, opacity-only change — but scoped to the landing page's editorial
 * choreography so the shared grammar stays untouched.
 *
 * Everything animates transform/opacity only, once, on entering the viewport:
 * cheap on a mid-range phone, gone entirely under prefers-reduced-motion.
 */
import type { Variants } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** A word rising out of an overflow-hidden mask — the hero headline reveal. */
export function maskRise(reduce: boolean | null): Variants {
  return {
    hidden: reduce ? { opacity: 0 } : { y: "110%" },
    visible: {
      opacity: 1,
      y: "0%",
      transition: { duration: reduce ? 0 : 0.7, ease: EASE },
    },
  };
}

/** Container staggering its children's reveals. */
export function stagger(reduce: boolean | null, step = 0.05, delay = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : step, delayChildren: reduce ? 0 : delay },
    },
  };
}

/** A block settling in on scroll: rise + fade, once. */
export function riseIn(reduce: boolean | null, distance = 28): Variants {
  return {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.65, ease: EASE },
    },
  };
}

/** The accent rule drawing itself in under the headline. */
export function drawRule(reduce: boolean | null): Variants {
  return {
    hidden: reduce ? { opacity: 0 } : { scaleX: 0 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: { duration: reduce ? 0 : 0.8, ease: EASE, delay: reduce ? 0 : 0.55 },
    },
  };
}
