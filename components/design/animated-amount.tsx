"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { asCentsUnsafe, formatEuro, type Cents } from "@/lib/domain/money";

/**
 * The permission moment (audit Q1 / Signature B): an emotionally important euro
 * figure that counts up with a spring when it changes.
 *
 * Accessibility: the animated glyphs are `aria-hidden` and update the DOM
 * directly via a MotionValue (no per-frame React re-render, no per-frame screen
 * reader chatter). A separate visually-hidden live region announces only the
 * final settled value, once. Under `prefers-reduced-motion` the visible value is
 * correct immediately with no tween.
 */
export function AnimatedAmount({
  cents,
  className = "",
}: {
  cents: Cents;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(cents as number);
  const text = useTransform(mv, (v) => formatEuro(asCentsUnsafe(Math.round(v))));

  useEffect(() => {
    if (reduce) {
      mv.set(cents);
      return;
    }
    const controls = animate(mv, cents, {
      type: "spring",
      stiffness: 90,
      damping: 18,
      mass: 0.9,
    });
    return () => controls.stop();
  }, [cents, reduce, mv]);

  return (
    <span className={`fl-tnum ${className}`}>
      <motion.span aria-hidden="true">{text}</motion.span>
      <span className="sr-only" aria-live="polite">
        {formatEuro(cents)}
      </span>
    </span>
  );
}
