/**
 * Freelens motion grammar (audit L3). Reusable framer-motion transitions with a
 * single meaning each, so components never hand-roll bespoke animations.
 *
 * Every helper takes `reduce` (from `useReducedMotion()`) and collapses to an
 * instant/opacity-only change when the user prefers reduced motion. Financial
 * values must always be correct immediately — animation only affects presentation.
 */
import type { Transition, Variants } from "framer-motion";

/** Content settling in: a short ease-out with a slight upward settle. */
export function arrive(reduce: boolean | null): Variants {
  return {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] },
    },
  };
}

/** Staggered container for a group of arriving children. */
export function arriveGroup(reduce: boolean | null, stagger = 0.08): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : stagger },
    },
  };
}

/** Money dividing into segments — the allocation bar's spring. */
export function allocate(reduce: boolean | null): Transition {
  return reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 120, damping: 20, mass: 0.6 };
}

/** A protected amount locking into place — a short snap. */
export function protect(reduce: boolean | null): Transition {
  return reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 320, damping: 24 };
}

/** The permission moment — the payout settles last, with the strongest emphasis. */
export function permission(reduce: boolean | null): Transition {
  return reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 90, damping: 18, mass: 0.9, delay: 0.15 };
}

/** Shared-axis move between the four calculator modes. */
export function navigate(reduce: boolean | null): Variants {
  return {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] },
    },
  };
}
