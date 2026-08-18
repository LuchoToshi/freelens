import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decryptRefreshToken, encryptRefreshToken, signState, verifyState } from "@/lib/gmail/server/tokens";

beforeEach(() => {
  process.env.GMAIL_TOKEN_ENCRYPTION_KEY = "test-key-not-for-production-use";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("state signing", () => {
  it("round-trips the freelancer id", () => {
    const state = signState("11111111-1111-1111-1111-111111111111");
    expect(verifyState(state)).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("rejects a tampered state", () => {
    const state = signState("11111111-1111-1111-1111-111111111111");
    const tampered = state.slice(0, -2) + "zz";
    expect(verifyState(tampered)).toBeNull();
  });

  it("rejects garbage input", () => {
    expect(verifyState("not-a-real-state")).toBeNull();
    expect(verifyState("")).toBeNull();
  });

  it("accepts a state just under the 10min TTL and rejects one just over it", () => {
    vi.useFakeTimers({ now: new Date("2026-01-01T00:00:00Z") });
    const state = signState("11111111-1111-1111-1111-111111111111");

    vi.setSystemTime(new Date("2026-01-01T00:09:59Z"));
    expect(verifyState(state)).toBe("11111111-1111-1111-1111-111111111111");

    vi.setSystemTime(new Date("2026-01-01T00:10:01Z"));
    expect(verifyState(state)).toBeNull();
  });
});

describe("refresh token encryption", () => {
  it("round-trips a token", () => {
    const encrypted = encryptRefreshToken("1//0gABCDEF_fake_refresh_token");
    expect(encrypted).not.toContain("1//0g");
    expect(decryptRefreshToken(encrypted)).toBe("1//0gABCDEF_fake_refresh_token");
  });

  it("fails closed on malformed ciphertext", () => {
    expect(() => decryptRefreshToken("not.valid")).toThrow();
    expect(() => decryptRefreshToken("a.b.c")).toThrow();
  });
});
