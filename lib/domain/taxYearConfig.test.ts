import { describe, it, expect } from "vitest";
import { toCents } from "./money";
import {
  getActiveTaxYearConfig,
  isVerifiedTaxYearConfig,
} from "./taxYearConfig";

describe("getActiveTaxYearConfig", () => {
  it("returns verified 2026 config with exact values", () => {
    const config = getActiveTaxYearConfig(2026);
    expect(isVerifiedTaxYearConfig(config)).toBe(true);
    if (!isVerifiedTaxYearConfig(config)) return;
    expect(config.guidedEstimateFlatReservePercentage.value).toBe(30);
    expect(config.zvw.ratePercentage.value).toBe(4.85);
    expect(config.zvw.maxContributionIncomeCents.value).toBe(toCents(79409));
    expect(config.vat.standardRatePercentage.value).toBe(21);
    expect(config.vat.reducedRatePercentage.value).toBe(9);
    expect(config.zelfstandigenaftrek.value).toBe(toCents(1200));
    expect(config.mkbWinstvrijstellingPercentage.value).toBe(12.7);
  });

  it("marks zelfstandigenaftrek and MKB exemption informational, not active", () => {
    const config = getActiveTaxYearConfig(2026);
    if (!isVerifiedTaxYearConfig(config)) throw new Error("expected verified");
    expect(config.zelfstandigenaftrek.status).toBe("informational");
    expect(config.mkbWinstvrijstellingPercentage.status).toBe("informational");
    expect(config.guidedEstimateFlatReservePercentage.status).toBe("active");
    expect(config.zvw.ratePercentage.status).toBe("active");
  });

  it("returns unverified for an unconfigured year, never a silent fallback", () => {
    const config = getActiveTaxYearConfig(2031);
    expect(config.verified).toBe(false);
    expect(config.taxYear).toBe(2031);
    expect(isVerifiedTaxYearConfig(config)).toBe(false);
  });

  it("lists all five non-numeric VAT treatments", () => {
    const config = getActiveTaxYearConfig(2026);
    if (!isVerifiedTaxYearConfig(config)) throw new Error("expected verified");
    const treatments = config.vat.nonNumericTreatments.map((t) => t.treatment);
    expect(treatments).toEqual([
      "0",
      "exempt",
      "reverse-charged",
      "kor",
      "mixed-unsure",
    ]);
  });
});
