"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadAppState, saveAppState } from "@/lib/domain/persistence";
import {
  addToYearPosition,
  resolveYearPosition,
  type YearPosition,
} from "@/lib/domain/yearPosition";
import type { Cents } from "@/lib/domain/money";
import { track } from "@/lib/analytics";

export interface UseYearPosition {
  /** Null until read, then the position for the current tax year. */
  position: YearPosition | null;
  hydrated: boolean;
  /** True once, when a position from an earlier year was dropped. */
  rolledOver: boolean;
  dismissRollover: () => void;
  /** True while an undo is still available for the last count. */
  canUndo: boolean;
  count: (contribution: Cents) => void;
  undo: () => void;
  reset: () => void;
}

/**
 * The running position, read on mount and written only on a user action.
 *
 * Reading and writing are separated on purpose. `useAppState` autosaves on
 * every state change, so mounting it anywhere rewrites the record; the homepage
 * says nothing is saved, and counting is a tap, not a page load. So the load
 * here is read-only and every write goes through an explicit call below.
 *
 * Each write re-reads storage before saving rather than holding a copy of the
 * whole app state. Two tabs, or the workspace open alongside the homepage,
 * would otherwise let this hook write back a stale payment history.
 *
 * Undo keeps the previous value in memory rather than in storage. It covers the
 * case that matters, a mis-tap noticed immediately, without turning a wrong tap
 * into a second stored thing that can itself go wrong.
 */
export function useYearPosition(currentTaxYear: number): UseYearPosition {
  const [position, setPosition] = useState<YearPosition | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [rolledOver, setRolledOver] = useState(false);
  const previous = useRef<YearPosition | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    const { state } = loadAppState();
    const resolved = resolveYearPosition(state.yearPosition, currentTaxYear);

    /* eslint-disable react-hooks/set-state-in-effect */
    // A stored position from last year is dropped in memory but not written
    // away here: a page view must not mutate storage. It is overwritten the
    // next time the user counts something, and until then the stale record is
    // harmless because nothing reads it without resolving the year first.
    setPosition(state.yearPosition ? resolved.position : null);
    setRolledOver(resolved.rolledOver);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [currentTaxYear]);

  const write = useCallback((next: YearPosition | null) => {
    const { state } = loadAppState();
    saveAppState({ ...state, yearPosition: next });
    setPosition(next);
  }, []);

  const count = useCallback(
    (contribution: Cents) => {
      const base = position ?? { profitCents: 0 as Cents, taxYear: currentTaxYear };
      previous.current = position;
      setCanUndo(true);
      write(addToYearPosition(base, contribution));
      track("year_position_counted");
    },
    [position, currentTaxYear, write]
  );

  const undo = useCallback(() => {
    if (!canUndo) return;
    write(previous.current);
    previous.current = null;
    setCanUndo(false);
    track("year_position_undone");
  }, [canUndo, write]);

  const reset = useCallback(() => {
    previous.current = null;
    setCanUndo(false);
    write(null);
    track("year_position_reset");
  }, [write]);

  const dismissRollover = useCallback(() => setRolledOver(false), []);

  return {
    position,
    hydrated,
    rolledOver,
    dismissRollover,
    canUndo,
    count,
    undo,
    reset,
  };
}
