import { describe, it, expect, vi, afterEach } from "vitest";
import { toCents } from "./money";
import {
  APP_STATE_STORAGE_KEY,
  emptyAppState,
  loadAppState,
  saveAppState,
  clearAppState,
  migrateFromV1,
  isStale,
  isValidAppState,
  type AppState,
  type StorageLike,
} from "./persistence";

function memoryStorage(seed: Record<string, string> = {}): StorageLike & {
  dump: () => Record<string, string>;
} {
  const store = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (k) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
    dump: () => Object.fromEntries(store),
  };
}

afterEach(() => vi.restoreAllMocks());

describe("save / load round trip", () => {
  it("persists and restores an app state", () => {
    const storage = memoryStorage();
    const state: AppState = {
      ...emptyAppState(),
      setup: {
        isEntrepreneurNL: true,
        vatRegistered: true,
        participatesKOR: false,
        commonVatTreatments: ["21"],
        accountingSystem: "invoice",
        amountsDefaultInclusive: true,
        reserveMethod: { mode: "own-rule", percentage: 30 },
        essentialMonthlyBusinessCostsCents: toCents(1200),
        bufferMonths: 2,
        recommendPersonalPayout: true,
      },
    };
    saveAppState(state, storage);
    const loaded = loadAppState(storage);
    expect(loaded.state).toEqual(state);
    expect(loaded.storageAvailable).toBe(true);
    expect(loaded.migrated).toBe(false);
  });
});

describe("corrupt / invalid recovery", () => {
  it("recovers from corrupt JSON with a fresh state", () => {
    const storage = memoryStorage({ [APP_STATE_STORAGE_KEY]: "{not json" });
    const loaded = loadAppState(storage);
    expect(loaded.recovered).toBe(true);
    expect(loaded.state).toEqual(emptyAppState());
  });
  it("recovers from a wrong-shape payload", () => {
    const storage = memoryStorage({
      [APP_STATE_STORAGE_KEY]: JSON.stringify({ schemaVersion: 99 }),
    });
    const loaded = loadAppState(storage);
    expect(loaded.recovered).toBe(true);
  });
  it("isValidAppState rejects non-v2 shapes", () => {
    expect(isValidAppState(null)).toBe(false);
    expect(isValidAppState({ schemaVersion: 1 })).toBe(false);
    expect(isValidAppState(emptyAppState())).toBe(true);
  });
});

describe("localStorage unavailable", () => {
  it("returns an in-memory state flagged not-available", () => {
    const loaded = loadAppState(null);
    expect(loaded.storageAvailable).toBe(false);
    expect(loaded.state).toEqual(emptyAppState());
  });
  it("saveAppState is a no-op without storage (does not throw)", () => {
    expect(() => saveAppState(emptyAppState(), null)).not.toThrow();
  });
});

describe("v1 → v2 migration", () => {
  it("maps the legacy tax percentage to a manual own-rule reserve, setup null", () => {
    const storage = memoryStorage({
      "freelens.safe-to-spend.v1": JSON.stringify({
        balance: "6000",
        monthlyEssentialCosts: "1200",
        taxReservePercent: "30",
        bufferMonths: "2",
        incomeThisYear: "",
        invoiceAmount: "",
        vatCollected: "800",
      }),
    });
    const migrated = migrateFromV1(storage);
    expect(migrated).not.toBeNull();
    if (!migrated) return;
    expect(migrated.setup).toBeNull();
    expect(migrated.migrationNotice).toEqual({
      show: true,
      from: "v1",
      legacyReservePercentage: 30,
    });
    const wp = migrated.weeklyPosition;
    expect(wp).not.toBeNull();
    if (!wp) return;
    expect(wp.input.currentBalanceCents).toBe(toCents(6000));
    expect(wp.input.reserveProtectedCents).toBe(toCents(1800)); // 30% of 6000
    expect(wp.input.reserveSource).toBe("manual");
    expect(wp.input.vatProtectedCents).toBe(toCents(800));
    expect(wp.input.bufferTargetCents).toBe(toCents(2400)); // 1200 * 2
  });

  it("loadAppState performs the migration when no v2 state exists", () => {
    const storage = memoryStorage({
      "freelens.safe-to-spend.v1": JSON.stringify({
        balance: "4000",
        monthlyEssentialCosts: "1000",
        taxReservePercent: "25",
        bufferMonths: "3",
      }),
    });
    const loaded = loadAppState(storage);
    expect(loaded.migrated).toBe(true);
    expect(loaded.state.migrationNotice?.legacyReservePercentage).toBe(25);
  });

  it("returns null when there is no legacy data", () => {
    expect(migrateFromV1(memoryStorage())).toBeNull();
  });
});

describe("clearAppState", () => {
  it("wipes both v2 and legacy v1 keys", () => {
    const storage = memoryStorage({
      [APP_STATE_STORAGE_KEY]: JSON.stringify(emptyAppState()),
      "freelens.safe-to-spend.v1": "{}",
      "freelens.checkin.v1": "{}",
    });
    clearAppState(storage);
    expect(storage.dump()).toEqual({});
  });
});

describe("no data leaves the browser", () => {
  it("makes no network calls during save/load/clear/migrate", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const storage = memoryStorage({
      "freelens.safe-to-spend.v1": JSON.stringify({ balance: "1000" }),
    });
    const loaded = loadAppState(storage);
    saveAppState(loaded.state, storage);
    clearAppState(storage);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("isStale", () => {
  it("flags old timestamps and passes recent ones", () => {
    const old = new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString();
    const recent = new Date().toISOString();
    expect(isStale(old)).toBe(true);
    expect(isStale(recent)).toBe(false);
  });
  it("treats an invalid date as not stale", () => {
    expect(isStale("not-a-date")).toBe(false);
  });
});
