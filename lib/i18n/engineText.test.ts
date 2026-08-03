import { describe, expect, it } from "vitest";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { quoteForTargetNet } from "@/lib/tax/quote";
import { rateForTargetAnnualNet } from "@/lib/tax/rate";
import {
  hasBreakdownExplanation,
  hasBreakdownLabel,
  hasEngineTranslation,
  translateAssumption,
  translateBreakdownExplanation,
  translateBreakdownLabel,
} from "@/lib/i18n/engineText";

/**
 * Sweeps the engine across every shape that changes what it says, then asserts
 * the translation layer covers all of it.
 *
 * This is the check that keeps the English fallback honest. Without it, a new
 * assumption line added to the engine would quietly render in English on a
 * Dutch page and nobody would notice until a user did.
 */
function collect() {
  const assumptions = new Set<string>();
  const lines = new Map<string, { label: string; explanation: string }>();

  const record = (r: {
    assumptions: string[];
    breakdown: { id: string; label: string; explanation: string }[];
  }) => {
    r.assumptions.forEach((a) => assumptions.add(a));
    r.breakdown.forEach((b) =>
      lines.set(`${b.id}|${b.label}|${b.explanation}`, {
        label: b.label,
        explanation: b.explanation,
      })
    );
  };

  for (const profit of [-5_000, 0, 25_000, 40_000, 50_000, 95_000, 140_000]) {
    for (const hours of [true, false]) {
      for (const starter of [true, false]) {
        for (const otherIncome of [0, 30_000]) {
          for (const payment of [undefined, 2_000, 90_000]) {
            record(
              calculateTaxReserve({
                taxYear: 2026,
                country: "NL",
                projectedAnnualProfit: profit,
                ytdReserved: 0,
                ytdProfit: payment ? 1_000 : 0,
                meetsHoursCriterion: hours,
                isStarter: starter,
                otherIncome,
                otherIncomeTaxWithheld: otherIncome ? 2_250 : 0,
                paymentReceived: payment,
              })
            );
          }
        }
      }
    }
  }

  for (const target of [0, 2_000, 40_000]) {
    for (const base of [0, 36_000, 95_000]) {
      record(
        quoteForTargetNet({
          taxYear: 2026,
          country: "NL",
          targetNet: target,
          jobCosts: target ? 500 : 0,
          currentProjectedProfit: base,
          vatRate: 21,
          meetsHoursCriterion: true,
          isStarter: false,
        })
      );
    }
    record(
      rateForTargetAnnualNet({
        taxYear: 2026,
        country: "NL",
        targetAnnualNet: target || 1_000,
        billableUnitsPerYear: 140,
        annualBusinessCosts: 6_000,
        meetsHoursCriterion: true,
        isStarter: false,
        otherIncome: target ? 30_000 : 0,
        otherIncomeTaxWithheld: target ? 2_250 : 0,
      })
    );
  }

  return { assumptions: [...assumptions], lines };
}

const { assumptions, lines } = collect();

describe("every string the engine can emit has Dutch", () => {
  it("covers every assumption", () => {
    const missing = assumptions.filter((a) => !hasEngineTranslation("nl", a));
    expect(missing, `untranslated assumptions:\n${missing.join("\n\n")}`).toEqual([]);
  });

  it("covers every breakdown label", () => {
    const missing: string[] = [];
    for (const [key, { label }] of lines) {
      const id = key.split("|")[0];
      // Checked by presence, not by difference: several Dutch tax terms
      // (Zelfstandigenaftrek, Startersaftrek) are identical in both languages.
      if (!hasBreakdownLabel("nl", id, label)) missing.push(`${id}: ${label}`);
    }
    expect(missing, `untranslated labels:\n${missing.join("\n")}`).toEqual([]);
  });

  it("covers every breakdown explanation", () => {
    const missing: string[] = [];
    for (const [key, { explanation }] of lines) {
      const id = key.split("|")[0];
      if (!hasBreakdownExplanation("nl", id, explanation)) {
        missing.push(`${id}: ${explanation.slice(0, 70)}`);
      }
    }
    expect(missing, `untranslated explanations:\n${missing.join("\n")}`).toEqual([]);
  });

  it("swept enough of the engine to be worth trusting", () => {
    // Guards the guard: if a refactor made `collect` return almost nothing,
    // the three tests above would pass vacuously.
    expect(assumptions.length).toBeGreaterThan(18);
    expect(lines.size).toBeGreaterThan(30);
  });
});

describe("English is returned untouched", () => {
  it("never rewrites the engine's own wording", () => {
    for (const a of assumptions) expect(translateAssumption("en", a)).toBe(a);
    for (const [key, { label, explanation }] of lines) {
      const id = key.split("|")[0];
      expect(translateBreakdownLabel("en", id, label)).toBe(label);
      expect(translateBreakdownExplanation("en", id, explanation)).toBe(explanation);
    }
  });
});

describe("unknown strings fall back rather than blanking", () => {
  it("returns the input when there is no translation", () => {
    expect(translateAssumption("nl", "A sentence the engine never emits.")).toBe(
      "A sentence the engine never emits."
    );
    expect(translateBreakdownLabel("nl", "no-such-id", "Some label")).toBe("Some label");
  });
});
