import { describe, expect, it } from "vitest";
import { deriveGmailHealth } from "@/lib/frontdesk/connectionHealth";

const NOW = new Date("2026-08-30T12:00:00Z");

describe("gmail connection health (§15): derived, never invented", () => {
  it("no row is disconnected, with no sync to report", () => {
    expect(deriveGmailHealth(null, NOW)).toEqual({ state: "disconnected", lastSyncAt: null });
  });

  it("a revoked_at wins over everything and keeps the last sync visible", () => {
    expect(
      deriveGmailHealth(
        {
          connected_at: "2026-08-01T00:00:00Z",
          revoked_at: "2026-08-25T00:00:00Z",
          last_used_at: "2026-08-24T09:00:00Z",
        },
        NOW
      )
    ).toEqual({ state: "revoked", lastSyncAt: "2026-08-24T09:00:00Z" });
  });

  it("recent activity is connected; more than 24h of silence is stale", () => {
    const fresh = {
      connected_at: "2026-08-01T00:00:00Z",
      revoked_at: null,
      last_used_at: "2026-08-30T01:00:00Z",
    };
    expect(deriveGmailHealth(fresh, NOW).state).toBe("connected");
    const silent = { ...fresh, last_used_at: "2026-08-28T00:00:00Z" };
    expect(deriveGmailHealth(silent, NOW).state).toBe("stale");
  });

  it("a never-used connection ages from its connected_at", () => {
    const justConnected = {
      connected_at: "2026-08-30T10:00:00Z",
      revoked_at: null,
      last_used_at: null,
    };
    expect(deriveGmailHealth(justConnected, NOW).state).toBe("connected");
    const oldConnect = { ...justConnected, connected_at: "2026-08-27T00:00:00Z" };
    expect(deriveGmailHealth(oldConnect, NOW).state).toBe("stale");
  });
});
