import { describe, expect, it } from "vitest";
import { fromCents, toCents } from "@/lib/domain/money";
import { outcomeForJobFee, type JobOutcomeRequest } from "@/lib/tax/jobOutcome";
import { quoteForTargetNet } from "@/lib/tax/quote";

const base = (overrides: Partial<JobOutcomeRequest> = {}): JobOutcomeRequest => ({
  taxYear: 2026,
  country: "NL",
  feeExVat: 2_000,
  currentProjectedProfit: 40_000,
  vatRate: 21,
  meetsHoursCriterion: true,
  isStarter: false,
  ...overrides,
});

describe("outcomeForJobFee", () => {
  it("splits a fee into tax and what is kept, and they add back up", () => {
    const r = outcomeForJobFee(base());
    expect(r.feeExVat).toBe(toCents(2_000));
    expect(r.takeHome + r.additionalLiability + r.jobCosts).toBe(r.feeExVat);
  });

  it("adds btw on top without changing what is kept", () => {
    const with21 = outcomeForJobFee(base({ vatRate: 21 }));
    const with0 = outcomeForJobFee(base({ vatRate: 0 }));

    expect(with21.vat).toBe(toCents(420));
    expect(with21.feeInclVat).toBe(toCents(2_420));
    expect(with0.vat).toBe(toCents(0));
    expect(with0.feeInclVat).toBe(toCents(2_000));
    // The whole point of VAT passing through.
    expect(with21.takeHome).toBe(with0.takeHome);
  });

  it("takes job costs out of the fee before tax, not after", () => {
    const withCosts = outcomeForJobFee(base({ jobCosts: 500 }));
    const without = outcomeForJobFee(base({ feeExVat: 1_500 }));

    // A €2.000 fee with €500 of costs is taxed exactly like a €1.500 fee.
    expect(withCosts.taxableDelta).toBe(without.taxableDelta);
    expect(withCosts.additionalLiability).toBe(without.additionalLiability);
    expect(withCosts.takeHome).toBe(without.takeHome);
  });

  it("is worth less later in the year, because the bracket is higher", () => {
    const early = outcomeForJobFee(base({ currentProjectedProfit: 10_000 }));
    const late = outcomeForJobFee(base({ currentProjectedProfit: 90_000 }));
    expect(late.takeHome).toBeLessThan(early.takeHome);
  });

  it("reports an implied day rate only when days were given", () => {
    expect(outcomeForJobFee(base()).impliedDayRate).toBeNull();
    expect(outcomeForJobFee(base({ daysOfWork: 0 })).impliedDayRate).toBeNull();

    const twoDays = outcomeForJobFee(base({ daysOfWork: 2 }));
    expect(twoDays.impliedDayRate).toBe(Math.round(twoDays.takeHome / 2));
  });

  it("handles costs larger than the fee without inventing a special case", () => {
    const r = outcomeForJobFee(base({ feeExVat: 500, jobCosts: 900 }));
    // The job loses money and reduces profit for the year, so the tax it adds
    // is negative: it lowers the bill rather than raising it.
    expect(r.taxableDelta).toBe(toCents(-400));
    expect(r.additionalLiability).toBeLessThan(0);
    expect(r.takeHome).toBeLessThan(0);
  });

  it("treats a zero fee as zero rather than throwing", () => {
    const r = outcomeForJobFee(base({ feeExVat: 0 }));
    expect(r.feeExVat).toBe(0);
    expect(r.takeHome).toBe(0);
    expect(r.keptShare).toBe(0);
    expect(r.effectiveJobRate).toBe(0);
  });

  it("clamps a negative fee rather than producing a negative invoice", () => {
    expect(outcomeForJobFee(base({ feeExVat: -500 })).feeExVat).toBe(0);
  });

  it("flags a job that crosses a bracket", () => {
    const r = outcomeForJobFee(base({ currentProjectedProfit: 36_000, feeExVat: 10_000 }));
    expect(r.bracketCrossing).not.toBeNull();
    // The blend is reported, never a single bracket rate.
    expect(r.effectiveJobRate).toBeGreaterThan(0);
    expect(r.effectiveJobRate).toBeLessThan(1);
  });

  it("carries the config version so a result can be traced", () => {
    const r = outcomeForJobFee(base());
    expect(r.configVersion).toBe("nl-2026.1");
    expect(r.configRetrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

/**
 * The invariant that keeps the two directions honest.
 *
 * `quoteForTargetNet` says what to charge to keep X. Feeding that quote back in
 * here must return X. If these ever disagree, one of them is lying to a
 * freelancer about the same job.
 */
describe("round trip against quoteForTargetNet", () => {
  const cases = [
    { target: 1_000, profit: 0 },
    { target: 2_000, profit: 40_000 },
    { target: 5_000, profit: 36_000 }, // straddles a bracket edge
    { target: 10_000, profit: 75_000 }, // top bracket
    { target: 500, profit: 120_000 }, // past the Zvw ceiling
  ];

  for (const { target, profit } of cases) {
    it(`keeps €${target} at €${profit} of existing profit`, () => {
      const quote = quoteForTargetNet({
        taxYear: 2026,
        country: "NL",
        targetNet: target,
        currentProjectedProfit: profit,
        vatRate: 21,
        meetsHoursCriterion: true,
        isStarter: false,
      });

      const back = outcomeForJobFee(
        base({
          feeExVat: fromCents(quote.quoteExVat),
          currentProjectedProfit: profit,
        })
      );

      // One cent of slack: the solve stops within a cent, and both sides round
      // to whole cents independently.
      expect(Math.abs(back.takeHome - toCents(target))).toBeLessThanOrEqual(1);
      expect(back.feeInclVat).toBe(quote.quoteInclVat);
    });
  }

  it("agrees on the job costs path too", () => {
    const quote = quoteForTargetNet({
      taxYear: 2026,
      country: "NL",
      targetNet: 3_000,
      jobCosts: 750,
      currentProjectedProfit: 45_000,
      vatRate: 21,
      meetsHoursCriterion: true,
      isStarter: false,
    });

    const back = outcomeForJobFee(
      base({
        feeExVat: fromCents(quote.quoteExVat),
        jobCosts: 750,
        currentProjectedProfit: 45_000,
      })
    );

    expect(Math.abs(back.takeHome - toCents(3_000))).toBeLessThanOrEqual(1);
  });
});
