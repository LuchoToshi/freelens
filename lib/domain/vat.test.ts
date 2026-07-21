import { describe, it, expect } from "vitest";
import { toCents, type Cents } from "./money";
import {
  extractVatInclusive,
  addVatExclusive,
  describeNonNumericVatTreatment,
  resolvePaymentVat,
  VAT_EXPLANATIONS,
} from "./vat";

describe("extractVatInclusive", () => {
  it("splits 21% inclusive correctly (€1210 → €210 VAT / €1000 net)", () => {
    const { vatCents, netCents } = extractVatInclusive(toCents(1210), 21);
    expect(vatCents).toBe(toCents(210));
    expect(netCents).toBe(toCents(1000));
  });
  it("splits 9% inclusive correctly (€109 → €9 VAT / €100 net)", () => {
    const { vatCents, netCents } = extractVatInclusive(toCents(109), 9);
    expect(vatCents).toBe(toCents(9));
    expect(netCents).toBe(toCents(100));
  });
  it("keeps vat + net === gross exactly across a range (rounding to net)", () => {
    for (let g = 1; g <= 5000; g += 7) {
      const gross = toCents(g + 0.37) as Cents;
      for (const rate of [21, 9] as const) {
        const { vatCents, netCents } = extractVatInclusive(gross, rate);
        expect(vatCents + netCents).toBe(gross);
      }
    }
  });
});

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

describe("non-numeric treatments", () => {
  it("returns exact brief copy for reverse-charged, kor, exempt", () => {
    expect(VAT_EXPLANATIONS["reverse-charged"]).toBe(
      "VAT is not charged to this customer under the selected treatment. Confirm the transaction in your bookkeeping."
    );
    expect(VAT_EXPLANATIONS.kor).toBe(
      "No VAT is added under the selected KOR treatment. Input VAT is generally not deductible while participating."
    );
    expect(VAT_EXPLANATIONS.exempt).toBe(
      "No VAT is charged under the selected exempt treatment. The consequences for input VAT can vary."
    );
  });
  it("never yields a VAT amount for non-numeric treatments", () => {
    for (const t of ["0", "exempt", "reverse-charged", "kor", "mixed-unsure"] as const) {
      const r = describeNonNumericVatTreatment(t);
      expect(r.vatCents).toBeNull();
      expect(r.requiresBookkeepingConfirmation).toBe(true);
      expect(r.explanation.length).toBeGreaterThan(0);
    }
  });
});

describe("resolvePaymentVat", () => {
  it("resolves numeric inclusive", () => {
    const r = resolvePaymentVat(toCents(1210), "21", true);
    expect(r.vatCents).toBe(toCents(210));
    expect(r.netCents).toBe(toCents(1000));
    expect(r.explanation).toBeNull();
  });
  it("resolves numeric exclusive (entered amount is the net)", () => {
    const r = resolvePaymentVat(toCents(1000), "21", false);
    expect(r.vatCents).toBe(toCents(210));
    expect(r.netCents).toBe(toCents(1000));
  });
  it("reverse-charged leaves net === gross with no VAT and an explanation", () => {
    const r = resolvePaymentVat(toCents(2000), "reverse-charged", true);
    expect(r.vatCents).toBeNull();
    expect(r.netCents).toBe(toCents(2000));
    expect(r.explanation).toContain("not charged");
    expect(r.requiresBookkeepingConfirmation).toBe(true);
  });
  it("KOR leaves net === gross with no VAT", () => {
    const r = resolvePaymentVat(toCents(2000), "kor", true);
    expect(r.vatCents).toBeNull();
    expect(r.netCents).toBe(toCents(2000));
  });
});
