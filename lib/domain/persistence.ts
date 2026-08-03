/**
 * Local persistence. This is the ONLY domain module that touches storage.
 *
 * All financial data stays on the device, nothing is ever sent anywhere. The
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
import {
  sanitizePaymentHistory,
  type PaymentRecord,
} from "@/lib/domain/paymentHistory";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
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

/**
 * The one-time profile. Everything here is asked once, stored, and editable
 * from settings; none of it blocks a first answer.
 *
 * Six fields used to live here that nothing ever read: isEntrepreneurNL,
 * vatRegistered, participatesKOR, accountingSystem, recommendPersonalPayout and
 * essentialMonthlyPersonalCents. They were removed rather than left collecting
 * answers that changed no output. A state saved before that carries them still
 * loads; the extra keys are simply ignored.
 */
export interface UserSetup {
  /** Prefills the VAT control on the calculator. */
  commonVatTreatments: VatTreatment[];
  /** Prefills whether a typed amount is read as including VAT. */
  amountsDefaultInclusive: boolean;
  reserveMethod: ReserveMethod;
  /** Used by the weekly check-in only. */
  essentialMonthlyBusinessCostsCents: Cents;
  /** Used by the weekly check-in only. */
  bufferMonths: number;
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
  /**
   * Every payment the user has saved, across all tax years. Old years are kept,
   * never pruned: they are excluded from the current year's totals by filtering,
   * not by deletion.
   */
  paymentHistory: PaymentRecord[];
}

/**
 * A profile with nothing answered yet. Used when the first thing a user does is
 * correct a single deduction from the calculator, so that answer is kept
 * instead of being dropped for want of an existing profile.
 */
export function defaultUserSetup(taxYear: number, country: string): UserSetup {
  return {
    commonVatTreatments: ["21"],
    amountsDefaultInclusive: true,
    reserveMethod: {
      mode: "guided-estimate",
      taxYear,
      country,
      expectedAnnualRevenueExVatCents: asCentsUnsafe(0),
      expectedDeductibleCostsExVatCents: asCentsUnsafe(0),
      meetsHoursCriterion: false,
      isStarter: false,
      otherIncomeCents: asCentsUnsafe(0),
      otherIncomeTaxWithheldCents: asCentsUnsafe(0),
      alreadyReservedCents: asCentsUnsafe(0),
      alreadyPaidCents: asCentsUnsafe(0),
    },
    essentialMonthlyBusinessCostsCents: asCentsUnsafe(0),
    bufferMonths: 2,
  };
}

export function emptyAppState(): AppState {
  return {
    schemaVersion: 2,
    setup: null,
    lastAllocation: null,
    weeklyPosition: null,
    migrationNotice: null,
    paymentHistory: [],
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

/**
 * Fills in guided-estimate fields added when the flat 30% model was replaced by
 * the real tax engine. Saved setups from before that change have a revenue and
 * a costs figure but no tax year, hours criterion, starter flag or other
 * income. Defaults are the cautious reading: no deductions claimed, which
 * estimates a higher bill than the user probably owes, and the setup screen
 * invites them to correct it.
 */
function normalizeSetup(setup: UserSetup | null): UserSetup | null {
  if (!setup || setup.reserveMethod.mode !== "guided-estimate") return setup;
  const method = setup.reserveMethod as Partial<
    Extract<ReserveMethod, { mode: "guided-estimate" }>
  > & { mode: "guided-estimate" };
  if (typeof method.taxYear === "number") return setup;
  return {
    ...setup,
    reserveMethod: {
      mode: "guided-estimate",
      taxYear: latestProfileYear(DEFAULT_COUNTRY) ?? 0,
      country: DEFAULT_COUNTRY,
      expectedAnnualRevenueExVatCents:
        method.expectedAnnualRevenueExVatCents ?? asCentsUnsafe(0),
      expectedDeductibleCostsExVatCents:
        method.expectedDeductibleCostsExVatCents ?? asCentsUnsafe(0),
      meetsHoursCriterion: false,
      isStarter: false,
      otherIncomeCents: asCentsUnsafe(0),
      otherIncomeTaxWithheldCents: asCentsUnsafe(0),
      alreadyReservedCents: method.alreadyReservedCents ?? asCentsUnsafe(0),
      alreadyPaidCents: method.alreadyPaidCents ?? asCentsUnsafe(0),
    },
  };
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

/**
 * Drops a stored weekly position that cannot be evaluated.
 *
 * `evaluateWeeklyPosition` reads `obligations` as an array and several fields
 * as numbers. A record written by an older build, or truncated mid-write, kills
 * the whole /tool page with no way back except clearing storage by hand. Saved
 * payments already get this treatment; the check-in deserves the same.
 *
 * Returns null when the record is unusable, which the UI shows as "no check-in
 * yet" rather than a blank screen.
 */
function sanitizeWeeklyPosition(value: unknown): StoredWeeklyPosition | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.timestampIso !== "string") return null;

  const input = record.input;
  if (typeof input !== "object" || input === null) return null;
  const i = input as Record<string, unknown>;

  const isMoney = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  if (!isMoney(i.currentBalanceCents)) return null;
  if (!Array.isArray(i.obligations)) return null;
  if (
    !i.obligations.every(
      (o) =>
        typeof o === "object" &&
        o !== null &&
        isMoney((o as Record<string, unknown>).cents)
    )
  ) {
    return null;
  }

  return record as unknown as StoredWeeklyPosition;
}

export interface LoadResult {
  state: AppState;
  recovered: boolean; // true when corrupt data was discarded
  migrated: boolean; // true when built from a v1 migration
  storageAvailable: boolean;
  /**
   * How many saved payments were unreadable and dropped. Non-zero means the UI
   * must tell the user rather than quietly showing a shorter list.
   */
  discardedPaymentRecords: number;
  /** True when a stored check-in was unreadable and had to be dropped. */
  discardedWeeklyPosition: boolean;
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
      discardedPaymentRecords: 0,
      discardedWeeklyPosition: false,
    };
  }

  const raw = storage.getItem(APP_STATE_STORAGE_KEY);
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      if (isValidAppState(parsed)) {
        // A history saved before this field existed, or one with a damaged row,
        // must not take the rest of the state down with it.
        const history = sanitizePaymentHistory(
          (parsed as { paymentHistory?: unknown }).paymentHistory
        );
        const weekly = sanitizeWeeklyPosition(
          (parsed as { weeklyPosition?: unknown }).weeklyPosition
        );
        return {
          state: {
            ...parsed,
            setup: normalizeSetup(parsed.setup),
            weeklyPosition: weekly,
            paymentHistory: history.records,
          },
          recovered: false,
          migrated: false,
          storageAvailable: true,
          discardedPaymentRecords: history.discarded,
          discardedWeeklyPosition:
            parsed.weeklyPosition !== null && weekly === null,
        };
      }
      // Present but wrong shape → discard, don't throw.
      return {
        state: emptyAppState(),
        recovered: true,
        migrated: false,
        storageAvailable: true,
        discardedPaymentRecords: 0,
        discardedWeeklyPosition: false,
      };
    } catch {
      // Corrupt JSON → recover with a fresh state.
      return {
        state: emptyAppState(),
        recovered: true,
        migrated: false,
        storageAvailable: true,
        discardedPaymentRecords: 0,
        discardedWeeklyPosition: false,
      };
    }
  }

  // No v2 state yet, attempt a one-time migration from v1.
  const migrated = migrateFromV1(storage);
  if (migrated) {
    return {
      state: migrated,
      recovered: false,
      migrated: true,
      storageAvailable: true,
      discardedPaymentRecords: 0,
      discardedWeeklyPosition: false,
    };
  }
  return {
    state: emptyAppState(),
    recovered: false,
    migrated: false,
    storageAvailable: true,
    discardedPaymentRecords: 0,
    discardedWeeklyPosition: false,
  };
}

/** True when the state holds nothing the user entered. */
function isEmptyAppState(state: AppState): boolean {
  return (
    state.setup === null &&
    state.lastAllocation === null &&
    state.weeklyPosition === null &&
    state.migrationNotice === null &&
    state.paymentHistory.length === 0
  );
}

export function saveAppState(
  state: AppState,
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    if (isEmptyAppState(state)) {
      // No data means no stored key, not a key holding an empty object. The
      // privacy copy promises that clearing removes everything from the device,
      // and the autosave that follows a clear must not quietly put a record
      // back.
      storage.removeItem(APP_STATE_STORAGE_KEY);
      return;
    }
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
 * "manual"), NEVER reinterpreted as a final tax liability. Setup is left null
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
    // A v1 install predates payment history entirely, so there is nothing to
    // carry over. The year starts empty, which is the honest state.
    paymentHistory: [],
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
