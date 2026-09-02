import { describe, expect, it } from "vitest";
import {
  craftForProfession,
  isKnownProfession,
  normalizeTypedProfession,
  PROFESSION_CATALOGUE,
  professionLabel,
  searchProfessions,
} from "@/lib/frontdesk/professions";

describe("professions are the freelancer's own words", () => {
  it("labels every catalogue entry in both languages", () => {
    for (const p of PROFESSION_CATALOGUE) {
      expect(p.en.trim(), p.value).toBeTruthy();
      expect(p.nl.trim(), p.value).toBeTruthy();
    }
  });

  it("has no duplicate values", () => {
    const values = PROFESSION_CATALOGUE.map((p) => p.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("covers trades beyond the original five, including the ones asked for", () => {
    for (const value of ["dj", "hairdresser", "barber", "makeup_artist", "chef", "florist"]) {
      expect(isKnownProfession(value), value).toBe(true);
    }
  });

  it("shows a typed profession back exactly as it was written", () => {
    expect(professionLabel("Falconer", "en")).toBe("Falconer");
    expect(professionLabel("Valkenier", "nl")).toBe("Valkenier");
  });

  it("stores a typed profession that matches a known label as that entry", () => {
    expect(normalizeTypedProfession("Hairdresser", "en")).toBe("hairdresser");
    expect(normalizeTypedProfession("kapper", "nl")).toBe("hairdresser");
    expect(normalizeTypedProfession("Falconer", "en")).toBe("Falconer");
    expect(normalizeTypedProfession("   ", "en")).toBeNull();
  });

  it("maps anything outside the five stored crafts to other, and never invents one", () => {
    expect(craftForProfession("photographer")).toBe("photographer");
    expect(craftForProfession("dj")).toBe("other");
    expect(craftForProfession("Falconer")).toBe("other");
    for (const p of PROFESSION_CATALOGUE) {
      expect(
        ["photographer", "videographer", "designer", "illustrator", "other"],
        p.value,
      ).toContain(p.craft);
    }
  });

  it("searches on what the freelancer would type, in their language", () => {
    expect(searchProfessions("kap", "nl").map((p) => p.value)).toContain("hairdresser");
    expect(searchProfessions("photo", "en").map((p) => p.value)).toContain("photographer");
    expect(searchProfessions("zzzz", "en")).toEqual([]);
    expect(searchProfessions("", "en").length).toBe(PROFESSION_CATALOGUE.length);
  });
});
