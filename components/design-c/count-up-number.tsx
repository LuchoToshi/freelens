"use client";

import { useEffect, useRef, useState } from "react";
import { formatEuro } from "@/lib/calc";

export function CountUpNumber({
  value,
  durationMs = 800,
}: {
  value: number;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      // display already initialized to `value`; nothing to animate.
      return;
    }

    const start = performance.now();
    // Deliberate one-time count-up-on-mount reset: the initial render already
    // shows the correct value (SSR/no-JS/screen-reader safe via aria-label
    // below), so this is a decorative animation trigger, not a data sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplay(0);

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span aria-label={formatEuro(value)}>
      <span aria-hidden="true">{formatEuro(display)}</span>
    </span>
  );
}
