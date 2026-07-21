import { describe, it, expect } from "vitest";
import {
  toCents,
  fromCents,
  formatEuro,
  formatEuroExact,
  addCents,
  subtractCents,
  sumCents,
  clampToNonNegative,
  parseAmountInput,
  parsePercentInput,
} from "./money";

describe("toCents / fromCents", () => {
  it("round-trips whole and fractional euros", () => {
    expect(toCents(1500)).toBe(150000);
    expect(fromCents(toCents(1500))).toBe(1500);
    expect(toCents(19.99)).toBe(1999);
  });
  it("rounds half-up to the cent", () => {
    expect(toCents(0.005)).toBe(1);
    expect(toCents(0.004)).toBe(0);
  });
});

describe("formatEuro", () => {
  it("shows whole euros in nl-NL", () => {
    expect(formatEuro(toCents(1400))).toContain("1.400");
    expect(formatEuro(toCents(1400))).not.toContain(",");
  });
  it("never renders negative zero", () => {
    expect(formatEuro(toCents(-0))).not.toContain("-");
  });
  it("formatEuroExact shows two decimals", () => {
    expect(formatEuroExact(toCents(19.99))).toContain("19,99");
  });
});

describe("cents arithmetic", () => {
  it("adds, subtracts, sums", () => {
    expect(addCents(toCents(10), toCents(5))).toBe(1500);
    expect(subtractCents(toCents(10), toCents(15))).toBe(-500);
    expect(sumCents([toCents(1), toCents(2), toCents(3)])).toBe(600);
    expect(clampToNonNegative(toCents(-5))).toBe(0);
  });
});

describe("parseAmountInput", () => {
  const cases: Array<[string, number | null]> = [
    ["1.234,56", 123456],
    ["1234.56", 123456],
    ["1234,56", 123456],
    ["1234", 123400],
    ["1.234", 123400], // dot as thousands separator (3 trailing digits)
    ["€ 1.500", 150000],
    ["  1500,50  ", 150050],
    ["12.345,678", 1234568], // 3+ decimals → rounded, not rejected
    ["0", 0],
  ];
  for (const [input, expected] of cases) {
    it(`parses "${input}" → ${expected}`, () => {
      const { cents, error } = parseAmountInput(input);
      expect(error).toBeNull();
      expect(cents).toBe(expected);
    });
  }

  it("rejects blank", () => {
    expect(parseAmountInput("").cents).toBeNull();
    expect(parseAmountInput("   ").error).not.toBeNull();
  });
  it("rejects garbage", () => {
    expect(parseAmountInput("abc").cents).toBeNull();
    expect(parseAmountInput("€").cents).toBeNull();
  });
  it("rejects negatives by default, accepts with allowNegative", () => {
    expect(parseAmountInput("-100").cents).toBeNull();
    expect(parseAmountInput("-100", { allowNegative: true }).cents).toBe(-10000);
  });
  it("handles accounting parentheses as negative", () => {
    expect(parseAmountInput("(1.234,56)", { allowNegative: true }).cents).toBe(
      -123456
    );
    expect(parseAmountInput("(1.234,56)").cents).toBeNull(); // negative rejected by default
  });
  it("rejects oversized values", () => {
    expect(parseAmountInput("99999999999999").cents).toBeNull();
  });
  it("never returns NaN, Infinity, or -0", () => {
    for (const input of ["", "abc", "-0", "0,00", "1e10", "NaN", "1.2.3,4"]) {
      const { cents } = parseAmountInput(input, { allowNegative: true });
      if (cents !== null) {
        expect(Number.isFinite(cents)).toBe(true);
        expect(Object.is(cents, -0)).toBe(false);
      }
    }
  });
});

describe("parsePercentInput", () => {
  it("parses plain and comma percentages", () => {
    expect(parsePercentInput("30").value).toBe(30);
    expect(parsePercentInput("30,5").value).toBe(30.5);
    expect(parsePercentInput("30%").value).toBe(30);
  });
  it("rejects out of range", () => {
    expect(parsePercentInput("-1").value).toBeNull();
    expect(parsePercentInput("101").value).toBeNull();
  });
  it("rejects blank and garbage", () => {
    expect(parsePercentInput("").value).toBeNull();
    expect(parsePercentInput("abc").value).toBeNull();
  });
});
