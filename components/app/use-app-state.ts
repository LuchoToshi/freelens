"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearAppState,
  emptyAppState,
  loadAppState,
  saveAppState,
  type AppState,
  type MigrationNotice,
  type StoredAllocation,
  type UserSetup,
} from "@/lib/domain/persistence";
import type { WeeklyPositionInput } from "@/lib/domain/allocation";

export interface UseAppState {
  state: AppState;
  /** False until the first client-side load completes (SSR-safe gate). */
  hydrated: boolean;
  storageAvailable: boolean;
  migrationNotice: MigrationNotice | null;
  setSetup: (setup: UserSetup) => void;
  recordAllocation: (allocation: StoredAllocation) => void;
  saveWeeklyPosition: (input: WeeklyPositionInput) => void;
  clearAll: () => void;
  dismissMigrationNotice: () => void;
}

/**
 * Owns the single AppState and its persistence. Renders neutral defaults on the
 * server and during the first client render, then hydrates from localStorage in
 * an effect (the `hydrated` gate prevents an SSR/client markup mismatch on this
 * statically-prerendered app). Field edits autosave so nothing is lost;
 * `recordAllocation` / `saveWeeklyPosition` are the explicit commit points the
 * UI surfaces as "Saved on this device".
 */
export function useAppState(): UseAppState {
  const [state, setState] = useState<AppState>(emptyAppState);
  const [hydrated, setHydrated] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    // One-time sync from storage post-mount. Rendering neutral defaults first
    // keeps server/client markup identical, so this is deliberately an effect,
    // not a lazy initializer.
    const loaded = loadAppState();
    /* eslint-disable react-hooks/set-state-in-effect */
    setState(loaded.state);
    setStorageAvailable(loaded.storageAvailable);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Autosave after hydration so we never overwrite stored data with the neutral
  // pre-hydration default.
  useEffect(() => {
    if (!hydrated) return;
    saveAppState(state);
  }, [state, hydrated]);

  const setSetup = useCallback((setup: UserSetup) => {
    setState((prev) => ({ ...prev, setup }));
  }, []);

  const recordAllocation = useCallback((allocation: StoredAllocation) => {
    setState((prev) => ({ ...prev, lastAllocation: allocation }));
  }, []);

  const saveWeeklyPosition = useCallback((input: WeeklyPositionInput) => {
    setState((prev) => ({
      ...prev,
      weeklyPosition: { input, timestampIso: new Date().toISOString() },
    }));
  }, []);

  const dismissMigrationNotice = useCallback(() => {
    setState((prev) =>
      prev.migrationNotice
        ? { ...prev, migrationNotice: { ...prev.migrationNotice, show: false } }
        : prev
    );
  }, []);

  const clearAll = useCallback(() => {
    clearAppState();
    setState(emptyAppState());
  }, []);

  return {
    state,
    hydrated,
    storageAvailable,
    migrationNotice: state.migrationNotice,
    setSetup,
    recordAllocation,
    saveWeeklyPosition,
    clearAll,
    dismissMigrationNotice,
  };
}
