import { describe, expect, it } from "vitest";
import { toCents } from "@/lib/domain/money";
import {
  addToYearPosition,
  countKey,
  emptyYearPosition,
  jobContribution,
  resolveYearPosition,
  sanitizeYearPosition,
} from "@/lib/domain/yearPosition";

describe("resolveYearPosition", () => {
  it("starts at zero when nothing is stored", () => {
    const { position, rolledOver } = resolveYearPosition(null, 2026);
    expect(position).toEqual({ profitCents: 0, taxYear: 2026 });
    expect(rolledOver).toBe(false);
  });

  it("returns a position from the current year untouched", () => {
    const stored = { profitCents: toCents(38_400), taxYear: 2026 };
    const { position, rolledOver } = resolveYearPosition(stored, 2026);
    expect(position).toBe(stored);
    expect(rolledOver).toBe(false);
  });

  it("resets a position from a previous year, and says so", () => {
    // Last year's total would land this year's jobs at the wrong point on the
    // curve: different brackets, deductions and credits.
    const stored = { profitCents: toCents(38_400), taxYear: 2025 };
    const { position, rolledOver } = resolveYearPosition(stored, 2026);
    expect(position).toEqual({ profitCents: 0, taxYear: 2026 });
    expect(rolledOver).toBe(true);
  });

  it("treats a future stored year as a rollover too, rather than trusting it", () => {
    const { rolledOver } = resolveYearPosition(
      { profitCents: toCents(10_000), taxYear: 2027 },
      2026
    );
    expect(rolledOver).toBe(true);
  });
});

describe("addToYearPosition", () => {
  it("accumulates", () => {
    let p = emptyYearPosition(2026);
    p = addToYearPosition(p, toCents(1_800));
    p = addToYearPosition(p, toCents(2_200));
    expect(p.profitCents).toBe(toCents(4_000));
    expect(p.taxYear).toBe(2026);
  });

  it("never goes below zero, because a position is not a debt", () => {
    const p = addToYearPosition(emptyYearPosition(2026), toCents(-500));
    expect(p.profitCents).toBe(0);
  });

  it("does not mutate the position it was given", () => {
    const before = emptyYearPosition(2026);
    addToYearPosition(before, toCents(1_000));
    expect(before.profitCents).toBe(0);
  });
});

describe("jobContribution", () => {
  it("is the fee minus the job's own costs", () => {
    expect(jobContribution(toCents(1_800), toCents(200))).toBe(toCents(1_600));
  });

  it("ignores btw entirely, because it was never income", () => {
    // The fee is already excluding btw; nothing here should reintroduce it.
    expect(jobContribution(toCents(1_800), toCents(0))).toBe(toCents(1_800));
  });

  it("goes negative when a job loses money, and the caller floors it", () => {
    expect(jobContribution(toCents(500), toCents(900))).toBe(toCents(-400));
  });
});

describe("countKey", () => {
  const parts = {
    feeExVatCents: toCents(1_800),
    jobCostsCents: toCents(200),
    vatRate: 21,
    taxYear: 2026,
  };

  it("is stable for the same result", () => {
    expect(countKey(parts)).toBe(countKey({ ...parts }));
  });

  it("changes when any input changes, so a different job counts again", () => {
    expect(countKey({ ...parts, feeExVatCents: toCents(1_900) })).not.toBe(countKey(parts));
    expect(countKey({ ...parts, jobCostsCents: toCents(0) })).not.toBe(countKey(parts));
    expect(countKey({ ...parts, vatRate: 9 })).not.toBe(countKey(parts));
  });

  it("changes across years, so the same job may count once in each", () => {
    expect(countKey({ ...parts, taxYear: 2027 })).not.toBe(countKey(parts));
  });
});

describe("sanitizeYearPosition", () => {
  it("accepts a well-formed record", () => {
    expect(sanitizeYearPosition({ profitCents: 1_000, taxYear: 2026 })).toEqual({
      profitCents: 1_000,
      taxYear: 2026,
    });
  });

  it("returns null rather than zero for anything unreadable", () => {
    // Zero would tell the user they had earned nothing this year, which is a
    // claim. Null falls back to the default slider, which is a question.
    for (const bad of [
      null,
      undefined,
      42,
      "nope",
      {},
      { profitCents: "1000", taxYear: 2026 },
      { profitCents: 1_000 },
      { profitCents: 1_000.5, taxYear: 2026 },
      { profitCents: Number.NaN, taxYear: 2026 },
      { profitCents: -1, taxYear: 2026 },
      { profitCents: 1_000, taxYear: "2026" },
    ]) {
      expect(sanitizeYearPosition(bad)).toBeNull();
    }
  });

  it("survives a round trip through JSON", () => {
    const p = { profitCents: toCents(38_400), taxYear: 2026 };
    expect(sanitizeYearPosition(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
});
