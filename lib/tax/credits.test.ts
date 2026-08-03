import { describe, expect, it } from "vitest";
import { toCents } from "@/lib/domain/money";
import { evaluateCredit, evaluateCredits } from "@/lib/tax/credits";
import { loadProfile } from "@/lib/tax/loadProfile";
import type { CreditConfig } from "@/lib/tax/types";

const profile = loadProfile("NL", 2026);
const byId = (id: string): CreditConfig => profile.credits.find((c) => c.id === id)!;

const ahk = byId("algemene-heffingskorting");
const arbeidskorting = byId("arbeidskorting");

describe("algemene heffingskorting 2026", () => {
  it("pays the full amount up to the taper point", () => {
    expect(evaluateCredit(toCents(0), ahk)).toBe(toCents(3115));
    expect(evaluateCredit(toCents(29736), ahk)).toBe(toCents(3115));
  });

  it("tapers at 6,398% of every euro above the taper point", () => {
    // €3.115 - 6,398% x €1 = €3.114,93602, floored to the cent.
    expect(evaluateCredit(toCents(29737), ahk)).toBe(311493);
  });

  it("reaches zero at the top of the taper and stays there", () => {
    expect(evaluateCredit(toCents(78426), ahk)).toBe(0);
    expect(evaluateCredit(toCents(78427), ahk)).toBe(0);
    expect(evaluateCredit(toCents(250_000), ahk)).toBe(0);
  });

  it("treats negative income as zero income", () => {
    expect(evaluateCredit(toCents(-10_000), ahk)).toBe(toCents(3115));
  });
});

describe("arbeidskorting 2026", () => {
  it("builds up at 8,324% in the first band", () => {
    expect(evaluateCredit(toCents(0), arbeidskorting)).toBe(0);
    // 8,324% x €11.965 = €995,9666, floored.
    expect(evaluateCredit(toCents(11965), arbeidskorting)).toBe(99596);
  });

  it("builds up steeply through the second band", () => {
    // €996 + 31,009% x €13.880 = €5.300,0492, floored.
    expect(evaluateCredit(toCents(25845), arbeidskorting)).toBe(530004);
  });

  it("peaks at the top of the third band", () => {
    // €5.300 + 1,950% x €19.747 = €5.685,0665, floored.
    expect(evaluateCredit(toCents(45592), arbeidskorting)).toBe(568506);
  });

  it("phases out to zero at the top of the fourth band", () => {
    expect(evaluateCredit(toCents(132920), arbeidskorting)).toBe(0);
    expect(evaluateCredit(toCents(132921), arbeidskorting)).toBe(0);
    expect(evaluateCredit(toCents(500_000), arbeidskorting)).toBe(0);
  });

  it("is never negative anywhere on the curve", () => {
    for (let income = 0; income <= 200_000; income += 137) {
      expect(evaluateCredit(toCents(income), arbeidskorting)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("evaluateCredits", () => {
  it("assesses each credit on its own declared income base", () => {
    const seen: string[] = [];
    const result = evaluateCredits(profile.credits, (base) => {
      seen.push(base);
      return base === "labourIncome" ? toCents(40_000) : toCents(33_872);
    });
    // The two Dutch credits deliberately use different bases. If this ever
    // collapses to one base, the arbeidskorting is being calculated wrong.
    expect(seen).toEqual(["taxableIncome", "labourIncome"]);
    expect(result.credits).toHaveLength(2);
    expect(result.total).toBe(result.credits[0].amount + result.credits[1].amount);
  });
});
