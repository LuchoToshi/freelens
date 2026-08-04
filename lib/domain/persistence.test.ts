import { describe, it, expect, vi, afterEach } from "vitest";
import { createJob } from "@/lib/domain/jobs";
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
        commonVatTreatments: ["21"],
        amountsDefaultInclusive: true,
        reserveMethod: { mode: "own-rule", percentage: 30 },
        essentialMonthlyBusinessCostsCents: toCents(1200),
        bufferMonths: 2,
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

describe("payment history in stored state", () => {
  it("round-trips saved payments", () => {
    const storage = memoryStorage();
    const state: AppState = {
      ...emptyAppState(),
      paymentHistory: [
        {
          id: "a",
          date: "2026-03-14",
          amountExVat: toCents(1000),
          vatRate: 21,
          vatAmount: toCents(210),
          reserveTaken: toCents(134),
          taxYear: 2026,
        },
      ],
    };
    saveAppState(state, storage);
    const loaded = loadAppState(storage);
    expect(loaded.state.paymentHistory).toHaveLength(1);
    expect(loaded.discardedPaymentRecords).toBe(0);
  });

  it("loads a state saved before payment history existed", () => {
    // An install from before this feature has no paymentHistory key at all.
    // It must load, not be discarded as the wrong shape.
    const withoutHistory: Record<string, unknown> = { ...emptyAppState() };
    delete withoutHistory.paymentHistory;
    const storage = memoryStorage({
      [APP_STATE_STORAGE_KEY]: JSON.stringify(withoutHistory),
    });
    const loaded = loadAppState(storage);
    expect(loaded.recovered).toBe(false);
    expect(loaded.state.paymentHistory).toEqual([]);
    expect(loaded.discardedPaymentRecords).toBe(0);
  });

  it("drops damaged payments without throwing or losing the rest", () => {
    const storage = memoryStorage({
      [APP_STATE_STORAGE_KEY]: JSON.stringify({
        ...emptyAppState(),
        paymentHistory: [
          {
            id: "good",
            date: "2026-03-14",
            amountExVat: 100000,
            vatRate: 21,
            vatAmount: 21000,
            reserveTaken: 13400,
            taxYear: 2026,
          },
          { id: "bad", date: "nonsense" },
          "not even an object",
        ],
      }),
    });
    let loaded: ReturnType<typeof loadAppState> | null = null;
    expect(() => {
      loaded = loadAppState(storage);
    }).not.toThrow();
    expect(loaded!.state.paymentHistory).toHaveLength(1);
    expect(loaded!.discardedPaymentRecords).toBe(2);
    // The rest of the app state survives a damaged history.
    expect(loaded!.recovered).toBe(false);
  });

  it("survives a history that is not an array at all", () => {
    const storage = memoryStorage({
      [APP_STATE_STORAGE_KEY]: JSON.stringify({
        ...emptyAppState(),
        paymentHistory: "wiped by something else",
      }),
    });
    const loaded = loadAppState(storage);
    expect(loaded.state.paymentHistory).toEqual([]);
    expect(loaded.discardedPaymentRecords).toBe(1);
  });
});

describe("an empty state leaves no trace", () => {
  it("saving an empty state removes the key rather than writing an empty record", () => {
    // Clearing sets the state to empty, which immediately triggers the app's
    // autosave. Without this the key came straight back, and the privacy copy
    // promises the opposite.
    const storage = memoryStorage({
      [APP_STATE_STORAGE_KEY]: JSON.stringify({ schemaVersion: 2, setup: {} }),
    });
    saveAppState(emptyAppState(), storage);
    expect(storage.dump()).toEqual({});
  });

  it("still writes as soon as there is anything to keep", () => {
    const storage = memoryStorage();
    saveAppState(
      {
        ...emptyAppState(),
        paymentHistory: [
          {
            id: "a",
            date: "2026-03-14",
            amountExVat: toCents(1000),
            vatRate: 21,
            vatAmount: toCents(210),
            reserveTaken: toCents(134),
            taxYear: 2026,
          },
        ],
      },
      storage
    );
    expect(storage.getItem(APP_STATE_STORAGE_KEY)).not.toBeNull();
  });

  it("clear then autosave leaves storage empty", () => {
    const storage = memoryStorage({
      [APP_STATE_STORAGE_KEY]: JSON.stringify(emptyAppState()),
      "freelens.safe-to-spend.v1": "{}",
    });
    clearAppState(storage);
    saveAppState(emptyAppState(), storage);
    expect(storage.dump()).toEqual({});
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

describe("a damaged check-in does not take the app down", () => {
  it("drops a weekly position with no obligations array", () => {
    // A record written by an older build, or truncated mid-write, used to
    // crash the whole /tool page inside evaluateWeeklyPosition.
    const storage = memoryStorage({
      [APP_STATE_STORAGE_KEY]: JSON.stringify({
        ...emptyAppState(),
        weeklyPosition: {
          input: { currentBalanceCents: 700000 },
          timestampIso: "2026-07-22T10:00:00.000Z",
        },
      }),
    });
    const loaded = loadAppState(storage);
    expect(loaded.state.weeklyPosition).toBeNull();
    expect(loaded.discardedWeeklyPosition).toBe(true);
    // The rest of the state survives.
    expect(loaded.recovered).toBe(false);
  });

  it("drops one with a damaged obligation row", () => {
    const storage = memoryStorage({
      [APP_STATE_STORAGE_KEY]: JSON.stringify({
        ...emptyAppState(),
        weeklyPosition: {
          input: { currentBalanceCents: 700000, obligations: [{ label: "x" }] },
          timestampIso: "2026-07-22T10:00:00.000Z",
        },
      }),
    });
    expect(loadAppState(storage).state.weeklyPosition).toBeNull();
  });

  it("keeps a valid check-in untouched", () => {
    const state: AppState = {
      ...emptyAppState(),
      weeklyPosition: {
        input: {
          currentBalanceCents: toCents(7000),
          vatProtectedCents: toCents(600),
          vatProtectedIsActual: false,
          reserveProtectedCents: toCents(1500),
          reserveSource: "manual",
          obligations: [],
          bufferTargetCents: toCents(2400),
        },
        timestampIso: "2026-07-22T10:00:00.000Z",
      },
    };
    const storage = memoryStorage();
    saveAppState(state, storage);
    const loaded = loadAppState(storage);
    expect(loaded.state.weeklyPosition).toEqual(state.weeklyPosition);
    expect(loaded.discardedWeeklyPosition).toBe(false);
  });
});

describe("jobs in stored state", () => {
  it("gives an empty list to state saved before jobs existed", () => {
    // The common case, not an error: nobody's saved state has this field yet.
    const storage = memoryStorage();
    const legacy = { ...emptyAppState() } as Record<string, unknown>;
    delete legacy.jobs;
    storage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify({ ...legacy, setup: null }));

    const loaded = loadAppState(storage);
    expect(loaded.state.jobs).toEqual([]);
    expect(loaded.discardedJobs).toBe(0);
    expect(loaded.recovered).toBe(false);
  });

  it("round-trips a saved job", () => {
    const storage = memoryStorage();
    const job = createJob({
      client: "Studio Noord",
      feeExVatCents: toCents(1_800),
      jobCostsCents: toCents(0),
      vatRate: 21,
      quotedTakeHomeCents: toCents(1_100),
      quotedTaxCents: toCents(700),
      quotedConfigVersion: "nl-2026.1",
      createdAt: "2026-03-01",
    });

    saveAppState({ ...emptyAppState(), jobs: [job] }, storage);
    expect(loadAppState(storage).state.jobs).toEqual([job]);
  });

  it("drops one damaged job and reports it, keeping the rest", () => {
    const storage = memoryStorage();
    const job = createJob({
      client: "A",
      feeExVatCents: toCents(1_000),
      jobCostsCents: toCents(0),
      vatRate: 21,
      quotedTakeHomeCents: toCents(600),
      quotedTaxCents: toCents(400),
      quotedConfigVersion: "nl-2026.1",
      createdAt: "2026-03-01",
    });
    storage.setItem(
      APP_STATE_STORAGE_KEY,
      JSON.stringify({ ...emptyAppState(), jobs: [job, { id: "broken" }] })
    );

    const loaded = loadAppState(storage);
    expect(loaded.state.jobs).toHaveLength(1);
    expect(loaded.discardedJobs).toBe(1);
  });

  it("counts a lone job as data worth keeping", () => {
    // Otherwise saving a first quote and reloading would lose it: saveAppState
    // deletes the key when it thinks the state is empty.
    const storage = memoryStorage();
    const job = createJob({
      client: "A",
      feeExVatCents: toCents(1_000),
      jobCostsCents: toCents(0),
      vatRate: 21,
      quotedTakeHomeCents: toCents(600),
      quotedTaxCents: toCents(400),
      quotedConfigVersion: "nl-2026.1",
      createdAt: "2026-03-01",
    });

    saveAppState({ ...emptyAppState(), jobs: [job] }, storage);
    expect(storage.getItem(APP_STATE_STORAGE_KEY)).not.toBeNull();
  });
});
