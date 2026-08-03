"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearAppState,
  defaultUserSetup,
  emptyAppState,
  loadAppState,
  saveAppState,
  type AppState,
  type MigrationNotice,
  type StoredAllocation,
  type UserSetup,
} from "@/lib/domain/persistence";
import type { WeeklyPositionInput } from "@/lib/domain/allocation";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
import {
  addPayment,
  removePayment,
  updatePayment,
  type PaymentPatch,
  type PaymentRecord,
} from "@/lib/domain/paymentHistory";

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
  /** Non-zero when saved payments were unreadable on load and had to be dropped. */
  discardedPaymentRecords: number;
  /** True when a stored check-in was unreadable on load and had to be dropped. */
  discardedWeeklyPosition: boolean;
  /** Persists a deduction answer given from the correction strip. */
  updateProfileFlags: (patch: {
    meetsHoursCriterion?: boolean;
    isStarter?: boolean;
  }) => void;
  savePayment: (record: PaymentRecord) => void;
  editPayment: (id: string, patch: PaymentPatch) => void;
  deletePayment: (id: string) => void;
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
  const [discardedPaymentRecords, setDiscardedPaymentRecords] = useState(0);
  const [discardedWeeklyPosition, setDiscardedWeeklyPosition] = useState(false);

  useEffect(() => {
    // One-time sync from storage post-mount. Rendering neutral defaults first
    // keeps server/client markup identical, so this is deliberately an effect,
    // not a lazy initializer.
    const loaded = loadAppState();
    /* eslint-disable react-hooks/set-state-in-effect */
    setState(loaded.state);
    setStorageAvailable(loaded.storageAvailable);
    setDiscardedPaymentRecords(loaded.discardedPaymentRecords);
    setDiscardedWeeklyPosition(loaded.discardedWeeklyPosition);
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

  // Saving a payment is always an explicit user action, never a side effect of
  // running the calculator. A reserve you did not choose to record should not
  // silently change what the next payment asks for.
  const updateProfileFlags = useCallback(
    (patch: { meetsHoursCriterion?: boolean; isStarter?: boolean }) => {
      setState((prev) => {
        // A user with no profile yet must not lose the answer: the strip
        // promises "you are only asked once", so the first correction creates
        // the profile it belongs to.
        const setup =
          prev.setup ??
          defaultUserSetup(latestProfileYear(DEFAULT_COUNTRY) ?? 0, DEFAULT_COUNTRY);
        const method = setup.reserveMethod;
        if (method.mode !== "guided-estimate") return prev;
        return {
          ...prev,
          setup: { ...setup, reserveMethod: { ...method, ...patch } },
        };
      });
    },
    []
  );

  const savePayment = useCallback((record: PaymentRecord) => {
    setState((prev) => ({
      ...prev,
      paymentHistory: addPayment(prev.paymentHistory, record),
    }));
  }, []);

  const editPayment = useCallback((id: string, patch: PaymentPatch) => {
    setState((prev) => ({
      ...prev,
      paymentHistory: updatePayment(prev.paymentHistory, id, patch),
    }));
  }, []);

  const deletePayment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      paymentHistory: removePayment(prev.paymentHistory, id),
    }));
  }, []);

  const clearAll = useCallback(() => {
    clearAppState();
    setState(emptyAppState());
    setDiscardedPaymentRecords(0);
    setDiscardedWeeklyPosition(false);
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
    discardedPaymentRecords,
    discardedWeeklyPosition,
    updateProfileFlags,
    savePayment,
    editPayment,
    deletePayment,
  };
}
