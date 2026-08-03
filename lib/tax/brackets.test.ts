import { describe, expect, it } from "vitest";
import { toCents } from "@/lib/domain/money";
import { bracketTax, rateAdjustment } from "@/lib/tax/brackets";
import { loadProfile } from "@/lib/tax/loadProfile";

const profile = loadProfile("NL", 2026);
const { brackets } = profile;

describe("bracketTax", () => {
  it("taxes nothing at or below zero income", () => {
    expect(bracketTax(toCents(0), brackets).tax).toBe(0);
    expect(bracketTax(toCents(-5000), brackets).tax).toBe(0);
    expect(bracketTax(toCents(-5000), brackets).slices).toHaveLength(0);
  });

  it("applies only the first bracket up to its ceiling", () => {
    // 35,75% x €38.883 = €13.900,6725, rounded UP to the cent = €13.900,68.
    const result = bracketTax(toCents(38883), brackets);
    expect(result.tax).toBe(toCents(13_900.68));
    expect(result.slices).toHaveLength(1);
    expect(result.slices[0]).toMatchObject({ bracket: 1, rate: 35.75 });
  });

  it("opens the second bracket one euro above the first ceiling", () => {
    const result = bracketTax(toCents(38884), brackets);
    expect(result.slices).toHaveLength(2);
    expect(result.slices[1].incomeInBracket).toBe(toCents(1));
    // €1 at 37,56% rounds up to €0,38.
    expect(result.tax).toBe(toCents(13_900.68 + 0.38));
  });

  it("fills both lower brackets exactly at the second ceiling", () => {
    const result = bracketTax(toCents(78426), brackets);
    expect(result.slices).toHaveLength(2);
    expect(result.slices[1].incomeInBracket).toBe(toCents(78426 - 38883));
    // 37,56% x (€78.426 - €38.883) = 37,56% x €39.543 = €14.852,3508, up = €14.852,36.
    expect(result.tax).toBe(toCents(13_900.68 + 14_852.36));
  });

  it("opens the top bracket one euro above the second ceiling", () => {
    const result = bracketTax(toCents(78427), brackets);
    expect(result.slices).toHaveLength(3);
    expect(result.slices[2]).toMatchObject({ bracket: 3, rate: 49.5 });
    // €1 at 49,50% rounds up to €0,50.
    expect(result.tax).toBe(toCents(13_900.68 + 14_852.36 + 0.5));
  });

  it("never falls as income rises", () => {
    let previous = 0;
    for (let income = 0; income <= 150_000; income += 250) {
      const tax = bracketTax(toCents(income), brackets).tax;
      expect(tax).toBeGreaterThanOrEqual(previous);
      previous = tax;
    }
  });
});

describe("rateAdjustment", () => {
  const config = profile.rateAdjustment!;

  it("is zero below the threshold", () => {
    expect(rateAdjustment(toCents(5000), toCents(50_000), config)).toBe(0);
    expect(rateAdjustment(toCents(5000), toCents(78_426), config)).toBe(0);
  });

  it("only bites on the part of the income above the threshold", () => {
    // €100 above the threshold, so only €100 of deduction is corrected.
    expect(rateAdjustment(toCents(5000), toCents(78_526), config)).toBe(
      Math.ceil(toCents(100) * 0.1194)
    );
  });

  it("caps at the total qualifying deduction", () => {
    // Deductions are smaller than the income above the threshold, so all of
    // them are corrected and adding more income changes nothing.
    const atNinetyFive = rateAdjustment(toCents(5000), toCents(95_000), config);
    const atOneTwenty = rateAdjustment(toCents(5000), toCents(120_000), config);
    expect(atNinetyFive).toBe(Math.ceil(toCents(5000) * 0.1194));
    expect(atOneTwenty).toBe(atNinetyFive);
  });

  it("is zero with no qualifying deductions, and zero without a config", () => {
    expect(rateAdjustment(toCents(0), toCents(200_000), config)).toBe(0);
    expect(rateAdjustment(toCents(5000), toCents(200_000), null)).toBe(0);
  });
});
