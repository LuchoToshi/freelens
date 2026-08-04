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

  /**
   * Two domains, and only two.
   *
   * belastingdienst.nl is where the figures come from. wetten.overheid.nl is
   * the government's legislation database, which the Belastingdienst pages
   * paraphrase; it is admitted only where a figure is defined in statute and
   * the Belastingdienst does not restate the definition. That is exactly one
   * case today: the Zvw contribution base, which their pages leave as the bare
   * phrase "winst uit onderneming".
   *
   * The point of this test is to keep aggregators, accountancy summaries, bank
   * knowledge bases and blogs out of the provenance. Widening it past these two
   * defeats the config.
   */
  const OFFICIAL_SOURCES = /^https:\/\/(www\.)?(belastingdienst\.nl|wetten\.overheid\.nl)\//;

  it("records a source and a retrieval date for every figure", () => {
    expect(base.provenance.length).toBeGreaterThan(0);
    for (const entry of base.provenance) {
      expect(entry.sourceUrl).toMatch(OFFICIAL_SOURCES);
      expect(entry.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("cites the statute for the Zvw base rather than asserting it", () => {
    const zvw = base.socialContributions.find((c) => c.id === "zvw")!;
    expect(zvw.baseVerified).toBe(true);
    expect(zvw.base).toBe("profitAfterDeductions");

    // Zvw art. 43(2)(b) points at afdeling 3.2 Wet IB 2001, and art. 3.2 there
    // defines belastbare winst as profit less the ondernemersaftrek and the
    // MKB-winstvrijstelling. Both hops have to stay recorded: the first alone
    // does not tell you what the base is.
    const note = base.provenance.find((p) => p.field === "socialContributions.zvw.base")!.note!;
    expect(note).toContain("art. 43");
    expect(note).toContain("art. 3.2");
    expect(base.assumptions.some((a) => a.includes("Zorgverzekeringswet"))).toBe(true);
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
