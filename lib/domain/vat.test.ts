import { describe, it, expect } from "vitest";
import { toCents } from "./money";
import { addVatExclusive } from "./vat";

describe("addVatExclusive", () => {
  it("adds 21% onto net (€1000 → €210 VAT / €1210 gross)", () => {
    const { vatCents, grossCents } = addVatExclusive(toCents(1000), 21);
    expect(vatCents).toBe(toCents(210));
    expect(grossCents).toBe(toCents(1210));
  });
  it("adds 9% onto net (€100 → €9 VAT / €109 gross)", () => {
    const { vatCents, grossCents } = addVatExclusive(toCents(100), 9);
    expect(vatCents).toBe(toCents(9));
    expect(grossCents).toBe(toCents(109));
  });
});
