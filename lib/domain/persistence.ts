/**
 * Local persistence. This is the ONLY domain module that touches storage.
 *
 * All financial data stays on the device — nothing is ever sent anywhere. The
 * storage backend is injectable so it can be unit-tested without a DOM and so
 * "localStorage unavailable" (private browsing, disabled storage) degrades to
 * an in-memory session instead of throwing.
 */
import {
  asCentsUnsafe,
  parseAmountInput,
  parsePercentInput,
  type Cents,
} from "@/lib/domain/money";
import type { ReserveMethod, ReserveSource } from "@/lib/domain/reserves";
import type { WeeklyPositionInput } from "@/lib/domain/allocation";
import type { VatTreatment } from "@/lib/domain/vat";

export const APP_STATE_STORAGE_KEY = "freelens.app-state.v2";
const LEGACY_INPUTS_KEY = "freelens.safe-to-spend.v1";
const LEGACY_CHECKIN_KEY = "freelens.checkin.v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface UserSetup {
  isEntrepreneurNL: boolean;
  vatRegistered: boolean;
  participatesKOR: boolean;
  commonVatTreatments: VatTreatment[];
  accountingSystem: "invoice" | "cash";
  amountsDefaultInclusive: boolean;
  reserveMethod: ReserveMethod;
  essentialMonthlyBusinessCostsCents: Cents;
  bufferMonths: number;
  essentialMonthlyPersonalCents?: Cents;
  recommendPersonalPayout: boolean;
}

export interface StoredAllocation {
  label?: string;
  grossPaymentCents: Cents;
  vatComponentCents: Cents | null;
  reserveCents: Cents;
  reserveSource: ReserveSource;
  obligationsCents: Cents;
  bufferCents: Cents;
  availableForPersonalPayoutCents: Cents;
  timestampIso: string;
  status: "planned" | "handled";
}

export interface StoredWeeklyPosition {
  input: WeeklyPositionInput;
  timestampIso: string;
}

export interface MigrationNotice {
  show: boolean;
  from: "v1";
  legacyReservePercentage: number | null;
}

export interface AppState {
  schemaVersion: 2;
  setup: UserSetup | null;
  lastAllocation: StoredAllocation | null;
  weeklyPosition: StoredWeeklyPosition | null;
  migrationNotice: MigrationNotice | null;
}

export function emptyAppState(): AppState {
  return {
    schemaVersion: 2,
    setup: null,
    lastAllocation: null,
    weeklyPosition: null,
    migrationNotice: null,
  };
}

/** Feature-detect a working localStorage; returns null when unavailable. */
export function getDefaultStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const probe = "__freelens_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isValidAppState(value: unknown): value is AppState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.schemaVersion !== 2) return false;
  if (!("setup" in v) || !("lastAllocation" in v) || !("weeklyPosition" in v)) {
    return false;
  }
  return true;
}

export interface LoadResult {
  state: AppState;
  recovered: boolean; // true when corrupt data was discarded
  migrated: boolean; // true when built from a v1 migration
  storageAvailable: boolean;
}

export function loadAppState(
  storage: StorageLike | null = getDefaultStorage()
): LoadResult {
  if (!storage) {
    return {
      state: emptyAppState(),
      recovered: false,
      migrated: false,
      storageAvailable: false,
    };
  }

  const raw = storage.getItem(APP_STATE_STORAGE_KEY);
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      if (isValidAppState(parsed)) {
        return {
          state: parsed,
          recovered: false,
          migrated: false,
          storageAvailable: true,
        };
      }
      // Present but wrong shape → discard, don't throw.
      return {
        state: emptyAppState(),
        recovered: true,
        migrated: false,
        storageAvailable: true,
      };
    } catch {
      // Corrupt JSON → recover with a fresh state.
      return {
        state: emptyAppState(),
        recovered: true,
        migrated: false,
        storageAvailable: true,
      };
    }
  }

  // No v2 state yet — attempt a one-time migration from v1.
  const migrated = migrateFromV1(storage);
  if (migrated) {
    return { state: migrated, recovered: false, migrated: true, storageAvailable: true };
  }
  return {
    state: emptyAppState(),
    recovered: false,
    migrated: false,
    storageAvailable: true,
  };
}

export function saveAppState(
  state: AppState,
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or serialization failure: fail quietly, keep the in-memory state.
  }
}

/** Removes the v2 state AND legacy v1 keys so stale data can't re-migrate. */
export function clearAppState(
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  storage.removeItem(APP_STATE_STORAGE_KEY);
  storage.removeItem(LEGACY_INPUTS_KEY);
  storage.removeItem(LEGACY_CHECKIN_KEY);
}

interface LegacyInputs {
  balance?: string;
  monthlyEssentialCosts?: string;
  taxReservePercent?: string;
  bufferMonths?: string;
  incomeThisYear?: string;
  vatCollected?: string;
}

/**
 * Migrate legacy v1 localStorage into a v2 AppState. The old flat tax
 * percentage becomes a "Legacy user selected reserve" (own-rule, source
 * "manual") — NEVER reinterpreted as a final tax liability. Setup is left null
 * so the user confirms their VAT/reserve details; the legacy percentage is kept
 * so the setup flow can pre-fill it and the notice can name it.
 */
export function migrateFromV1(storage: StorageLike): AppState | null {
  const rawInputs = storage.getItem(LEGACY_INPUTS_KEY);
  if (rawInputs === null) return null;

  let legacy: LegacyInputs;
  try {
    legacy = JSON.parse(rawInputs) as LegacyInputs;
  } catch {
    return null;
  }

  const balance = amountOrNull(legacy.balance);
  const monthlyCosts = amountOrNull(legacy.monthlyEssentialCosts);
  const bufferMonths = numberOrNull(legacy.bufferMonths) ?? 2;
  const income = amountOrNull(legacy.incomeThisYear);
  const vat = amountOrNull(legacy.vatCollected);
  const pct = parsePercentInput(legacy.taxReservePercent ?? "").value;

  const base = income ?? balance ?? asCentsUnsafe(0);
  const reserveCents =
    pct !== null ? asCentsUnsafe((base * pct) / 100) : asCentsUnsafe(0);
  const bufferTargetCents =
    monthlyCosts !== null
      ? asCentsUnsafe(monthlyCosts * bufferMonths)
      : asCentsUnsafe(0);

  const weeklyInput: WeeklyPositionInput = {
    currentBalanceCents: balance ?? asCentsUnsafe(0),
    vatProtectedCents: vat ?? asCentsUnsafe(0),
    vatProtectedIsActual: vat !== null,
    reserveProtectedCents: reserveCents,
    reserveSource: "manual" as ReserveSource,
    obligations: [],
    bufferTargetCents,
    essentialMonthlyCostsCents: monthlyCosts ?? undefined,
  };

  return {
    schemaVersion: 2,
    setup: null,
    lastAllocation: null,
    weeklyPosition:
      balance !== null || monthlyCosts !== null
        ? { input: weeklyInput, timestampIso: new Date().toISOString() }
        : null,
    migrationNotice: { show: true, from: "v1", legacyReservePercentage: pct },
  };
}

function amountOrNull(raw: string | undefined): Cents | null {
  if (raw === undefined || raw.trim() === "") return null;
  return parseAmountInput(raw).cents;
}

function numberOrNull(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** True when a saved timestamp is older than `days` (default 14). */
export function isStale(timestampIso: string, days = 14): boolean {
  const then = new Date(timestampIso).getTime();
  if (!Number.isFinite(then)) return false;
  const ageMs = Date.now() - then;
  return ageMs > days * 24 * 60 * 60 * 1000;
}
