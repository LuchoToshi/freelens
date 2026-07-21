import { describe, it, expect } from "vitest";
import { toCents } from "./money";
import { calculateRunwayMonths, describeRunwayChange } from "./runway";

describe("calculateRunwayMonths", () => {
  it("computes the brief's worked example (€3200 / €1000 → 3.2)", () => {
    expect(calculateRunwayMonths(toCents(3200), toCents(1000))).toBe(3.2);
  });
  it("returns null (not Infinity) when monthly costs are zero", () => {
    expect(calculateRunwayMonths(toCents(3200), toCents(0))).toBeNull();
  });
  it("returns null when monthly costs are negative", () => {
    expect(calculateRunwayMonths(toCents(3200), toCents(-100))).toBeNull();
  });
  it("floors a negative reserve to 0 months", () => {
    expect(calculateRunwayMonths(toCents(-500), toCents(1000))).toBe(0);
  });
  it("rounds to one decimal", () => {
    expect(calculateRunwayMonths(toCents(3250), toCents(1000))).toBe(3.3);
    expect(calculateRunwayMonths(toCents(3240), toCents(1000))).toBe(3.2);
  });
});

describe("describeRunwayChange", () => {
  it("describes a change between two values", () => {
    expect(describeRunwayChange(3.2, 2.5)).toBe(
      "Your business runway would change from 3.2 months to 2.5 months."
    );
  });
  it("handles both-null", () => {
    expect(describeRunwayChange(null, null)).toContain("can't be estimated");
  });
  it("handles equal before/after", () => {
    expect(describeRunwayChange(3.0, 3.0)).toContain("stay about the same");
  });
  it("handles a single null", () => {
    expect(describeRunwayChange(null, 2.5)).toContain("2.5 months");
    expect(describeRunwayChange(3.2, null)).toContain("3.2 months");
  });
});
