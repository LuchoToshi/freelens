"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(value: number, durationMs = 800): number {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const isFirstRun = useRef(true);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const from = isFirstRun.current ? 0 : displayRef.current;
    isFirstRun.current = false;

    if (prefersReducedMotion || from === value) {
      displayRef.current = value;
      setDisplay(value);
      return;
    }

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (value - from) * eased);
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs]);

  return display;
}
