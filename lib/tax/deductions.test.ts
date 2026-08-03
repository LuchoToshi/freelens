import { describe, expect, it } from "vitest";
import { toCents } from "@/lib/domain/money";
import { applyDeductions } from "@/lib/tax/deductions";
import { loadProfile } from "@/lib/tax/loadProfile";

const profile = loadProfile("NL", 2026);

const established = { meetsHoursCriterion: true, isStarter: false };
const starter = { meetsHoursCriterion: true, isStarter: true };
const noHours = { meetsHoursCriterion: false, isStarter: false };
const starterWithoutHours = { meetsHoursCriterion: false, isStarter: true };

const amountOf = (result: ReturnType<typeof applyDeductions>, id: string) =>
  result.deductions.find((d) => d.id === id)!;

describe("applyDeductions", () => {
  it("applies zelfstandigenaftrek then the MKB exemption, in that order", () => {
    const result = applyDeductions(toCents(40_000), profile, established);
    expect(amountOf(result, "zelfstandigenaftrek").amount).toBe(toCents(1200));
    expect(amountOf(result, "startersaftrek").applied).toBe(false);
    // 12,7% of €38.800, not of €40.000.
    expect(amountOf(result, "mkb-winstvrijstelling").amount).toBe(toCents(4927.6));
    expect(result.profitAfterDeductions).toBe(toCents(33_872.4));
  });

  it("adds startersaftrek before the MKB exemption is calculated", () => {
    const result = applyDeductions(toCents(25_000), profile, starter);
    expect(amountOf(result, "startersaftrek").amount).toBe(toCents(2123));
    // 12,7% of €25.000 - €1.200 - €2.123 = 12,7% of €21.677 = €2.752,979,
    // floored to €2.752,97 so the taxable base stays a shade higher.
    expect(amountOf(result, "mkb-winstvrijstelling").amount).toBe(toCents(2752.97));
    expect(result.profitAfterDeductions).toBe(toCents(18_924.03));
  });

  it("skips the entrepreneur deductions without the hours criterion", () => {
    const result = applyDeductions(toCents(50_000), profile, noHours);
    expect(amountOf(result, "zelfstandigenaftrek").applied).toBe(false);
    expect(amountOf(result, "zelfstandigenaftrek").skippedBecause).toMatch(/hours criterion/);
    expect(amountOf(result, "mkb-winstvrijstelling").applied).toBe(true);
    expect(result.profitAfterDeductions).toBe(toCents(43_650));
  });

  it("skips startersaftrek when the hours criterion is not met, even for a starter", () => {
    const result = applyDeductions(toCents(25_000), profile, starterWithoutHours);
    expect(amountOf(result, "startersaftrek").applied).toBe(false);
    expect(amountOf(result, "zelfstandigenaftrek").applied).toBe(false);
  });

  it("caps zelfstandigenaftrek at the profit for a non-starter", () => {
    const result = applyDeductions(toCents(700), profile, established);
    expect(amountOf(result, "zelfstandigenaftrek").amount).toBe(toCents(700));
    expect(result.profitAfterDeductions).toBe(0);
  });

  it("caps zelfstandigenaftrek at zero rather than going negative on a loss", () => {
    const result = applyDeductions(toCents(-3000), profile, established);
    expect(amountOf(result, "zelfstandigenaftrek").amount).toBe(0);
  });

  it("waives the cap for a starter, so the full deduction can deepen a loss", () => {
    const result = applyDeductions(toCents(700), profile, starter);
    expect(amountOf(result, "zelfstandigenaftrek").amount).toBe(toCents(1200));
    expect(amountOf(result, "startersaftrek").amount).toBe(toCents(2123));
    // €700 - €1.200 - €2.123 = -€2.623, then the MKB exemption shrinks the loss.
    expect(result.profitAfterDeductions).toBe(toCents(-2289.87));
  });

  it("applies the MKB exemption to a loss, which makes the loss smaller", () => {
    const result = applyDeductions(toCents(-5000), profile, noHours);
    expect(amountOf(result, "mkb-winstvrijstelling").amount).toBe(toCents(-635));
    expect(result.profitAfterDeductions).toBe(toCents(-4365));
  });

  it("counts every applied deduction toward the rate adjustment", () => {
    const result = applyDeductions(toCents(95_000), profile, established);
    expect(result.totalSubjectToRateAdjustment).toBe(result.total);
    expect(result.total).toBe(toCents(1200 + 11_912.6));
  });
});
