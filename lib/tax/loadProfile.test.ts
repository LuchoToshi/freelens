import { describe, expect, it } from "vitest";
import {
  availableProfiles,
  loadProfile,
  TaxProfileError,
  validateProfile,
} from "@/lib/tax/loadProfile";
import type { CountryProfile } from "@/lib/tax/types";

const base = loadProfile("NL", 2026);
const clone = (): CountryProfile => JSON.parse(JSON.stringify(base)) as CountryProfile;

describe("loadProfile", () => {
  it("loads the Dutch 2026 profile", () => {
    expect(base.country).toBe("NL");
    expect(base.taxYear).toBe(2026);
    expect(base.configVersion).toBe("nl-2026.1");
    expect(base.configRetrievedAt).toBe("2026-08-03");
    expect(availableProfiles()).toContain("NL-2026");
  });

  it("refuses an unknown year instead of falling back to another one", () => {
    // Silently applying last year's figures is the exact failure this prevents.
    expect(() => loadProfile("NL", 2027)).toThrow(TaxProfileError);
    expect(() => loadProfile("BE", 2026)).toThrow(/No verified tax profile/);
  });

  it("records a source and a retrieval date for every figure", () => {
    expect(base.provenance.length).toBeGreaterThan(0);
    for (const entry of base.provenance) {
      expect(entry.sourceUrl).toMatch(/^https:\/\/(www\.)?belastingdienst\.nl\//);
      expect(entry.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("flags the Zvw base as unverified so the engine says so out loud", () => {
    const zvw = base.socialContributions.find((c) => c.id === "zvw")!;
    expect(zvw.baseVerified).toBe(false);
    expect(base.assumptions.some((a) => a.includes("Zvw base"))).toBe(true);
  });
});

describe("validateProfile", () => {
  it("rejects a null figure rather than calculating around it", () => {
    const profile = clone();
    // A null is what an unverified figure looks like. Better no answer than a
    // wrong one.
    (profile.socialContributions[0] as { rate: number | null }).rate = null;
    expect(() => validateProfile(profile)).toThrow(/NEEDS_VERIFICATION/);
  });

  it("rejects brackets that do not ascend", () => {
    const profile = clone();
    profile.brackets[1].upTo = 100;
    expect(() => validateProfile(profile)).toThrow(/must ascend/);
  });

  it("rejects a bracket table with no open top bracket", () => {
    const profile = clone();
    profile.brackets[profile.brackets.length - 1].upTo = 200_000;
    expect(() => validateProfile(profile)).toThrow(/"upTo": null/);
  });

  it("rejects credit segments with a gap between them", () => {
    const profile = clone();
    profile.credits[0].segments[0].to = 20_000;
    expect(() => validateProfile(profile)).toThrow(/gap or overlap/);
  });

  it("rejects a deduction that depends on one declared later", () => {
    const profile = clone();
    profile.deductions[0].appliesAfter = ["mkb-winstvrijstelling"];
    expect(() => validateProfile(profile)).toThrow(/must appear earlier/);
  });

  it("rejects a cap waiver naming a deduction that does not exist", () => {
    const profile = clone();
    profile.deductions[0].capWaivedBy = ["does-not-exist"];
    expect(() => validateProfile(profile)).toThrow(/not a known deduction/);
  });

  it("rejects a profile with no provenance", () => {
    const profile = clone();
    profile.provenance = [];
    expect(() => validateProfile(profile)).toThrow(/where its figures came from/);
  });
});
