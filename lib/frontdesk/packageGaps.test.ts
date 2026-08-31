import { describe, expect, it } from "vitest";
import { detectPackageGaps, inferEventType } from "@/lib/frontdesk/packageGaps";

const WEDDING_PKG = { label: "Wedding full day", price_from_eur: 1950, notes: null };

describe("package gap detection (§6.5): deterministic, informative, never blocking", () => {
  it("no packages at all is the only gap that matters then", () => {
    expect(detectPackageGaps([], [])).toEqual([{ key: "noPackages" }]);
  });

  it("an unpriced package is named by label", () => {
    const gaps = detectPackageGaps(
      [WEDDING_PKG, { label: "Custom work", price_from_eur: null, notes: null }],
      []
    );
    expect(gaps).toEqual([{ key: "unpricedPackage", detail: "Custom work" }]);
  });

  it("repeated inquiries of a type no package covers become a named gap", () => {
    const gaps = detectPackageGaps(
      [WEDDING_PKG],
      [
        { event_type: "portrait", source: "form" },
        { event_type: "portrait", source: "form" },
      ]
    );
    expect(gaps).toEqual([{ key: "uncoveredType", detail: "portrait" }]);
  });

  it("one inquiry is not a pattern, and sample inquiries never count", () => {
    expect(
      detectPackageGaps([WEDDING_PKG], [{ event_type: "portrait", source: "form" }])
    ).toEqual([]);
    expect(
      detectPackageGaps([WEDDING_PKG], [
        { event_type: "portrait", source: "sample" },
        { event_type: "portrait", source: "sample" },
      ])
    ).toEqual([]);
  });

  it("Dutch package labels cover the matching type", () => {
    const gaps = detectPackageGaps(
      [{ label: "Bruiloft hele dag", price_from_eur: 1800, notes: null }],
      [
        { event_type: "wedding", source: "form" },
        { event_type: "wedding", source: "form" },
      ]
    );
    expect(gaps).toEqual([]);
  });

  it("notes count toward coverage", () => {
    const gaps = detectPackageGaps(
      [{ label: "Full day", price_from_eur: 900, notes: "great for business offsites" }],
      [
        { event_type: "business", source: "form" },
        { event_type: "business", source: "form" },
      ]
    );
    expect(gaps).toEqual([]);
  });
});

describe("occasion inference (§3): only from the client's own words", () => {
  it("finds the type in either language, and never guesses", () => {
    expect(inferEventType("We trouwen in juni op het strand")).toBe("wedding");
    expect(inferEventType("We are getting married next summer")).toBe("wedding");
    expect(inferEventType("Need headshots for the team")).toBe("portrait");
    expect(inferEventType("Hi, love your work, call me")).toBeNull();
    expect(inferEventType(null)).toBeNull();
  });
});
