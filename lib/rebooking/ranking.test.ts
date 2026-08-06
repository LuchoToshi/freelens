import { describe, expect, it } from "vitest";
import {
  deriveTemperature,
  isSnoozed,
  rankQueue,
  wholeMonthsBetween,
  WEEKLY_MAX,
} from "@/lib/rebooking/ranking";
import { SEASONALITY_NL_V1, seasonWindowFor } from "@/lib/rebooking/seasonality";
import { reasonTextFor } from "@/lib/rebooking/reasonText";
import type { Relationship } from "@/lib/rebooking/types";

const TODAY = "2026-08-06"; // August: autumn-campaign window for photographers.

function rel(overrides: Partial<Relationship> = {}): Relationship {
  return {
    id: overrides.id ?? "r-1",
    userId: "u-1",
    clientName: "Studio Noord",
    temperature: "cold",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("wholeMonthsBetween", () => {
  it("counts calendar months, day-aware", () => {
    expect(wholeMonthsBetween("2025-08-06", "2026-08-06")).toBe(12);
    expect(wholeMonthsBetween("2025-08-07", "2026-08-06")).toBe(11);
    expect(wholeMonthsBetween("2026-09-01", "2026-08-06")).toBeLessThan(0);
  });
});

describe("temperature", () => {
  it("warm inside 9 months, cooling to 18, cold beyond or unknown", () => {
    expect(deriveTemperature("2026-02-06", TODAY)).toBe("warm");
    expect(deriveTemperature("2025-08-06", TODAY)).toBe("cooling");
    expect(deriveTemperature("2024-08-06", TODAY)).toBe("cold");
    expect(deriveTemperature(undefined, TODAY)).toBe("cold");
  });
});

describe("rankQueue", () => {
  it("anniversary outranks season outranks gap", () => {
    const queue = rankQueue({
      relationships: [
        rel({ id: "anniv", lastProjectDate: "2025-08-01" }), // 12 months
        rel({ id: "season", lastProjectDate: "2026-04-01" }), // 4 months, in window
        rel({ id: "gap", lastProjectDate: "2025-01-06" }), // 19 months... also anniversary? no: 19
      ],
      craft: "photographer",
      config: SEASONALITY_NL_V1,
      today: TODAY,
    });
    expect(queue[0].relationshipId).toBe("anniv");
    expect(queue[0].reasonCode).toBe("anniversary");
    // 19 months in August: photographers are in a season window, so the
    // reason is the season, boosted by the gap.
    const second = queue.find((q) => q.relationshipId === "gap");
    expect(second?.reasonCode).toBe("season");
  });

  it("a snoozed relationship never surfaces, and wakes after the date", () => {
    const snoozed = rel({ id: "s", lastProjectDate: "2025-08-01", snoozedUntil: "2026-12-01" });
    expect(isSnoozed(snoozed, TODAY)).toBe(true);
    const queue = rankQueue({
      relationships: [snoozed],
      craft: "photographer",
      config: SEASONALITY_NL_V1,
      today: TODAY,
    });
    expect(queue).toHaveLength(0);
    const awake = rankQueue({
      relationships: [snoozed],
      craft: "photographer",
      config: SEASONALITY_NL_V1,
      today: "2026-12-02",
    });
    expect(awake).toHaveLength(1);
  });

  it("caps the week at four, keeps the strongest, orders deterministically", () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      rel({ id: `r-${i}`, lastProjectDate: "2025-08-01", approxValueCents: (i + 1) * 50_000 })
    );
    const queue = rankQueue({
      relationships: many,
      craft: "photographer",
      config: SEASONALITY_NL_V1,
      today: TODAY,
    });
    expect(queue).toHaveLength(WEEKLY_MAX);
    // Higher value first at equal reason; ties broken by id, so the order is
    // reproducible run to run.
    expect(queue[0].relationshipId).toBe("r-7");
  });

  it("skips recently touched relationships", () => {
    const queue = rankQueue({
      relationships: [rel({ id: "a", lastProjectDate: "2025-08-01" })],
      craft: "photographer",
      config: SEASONALITY_NL_V1,
      today: TODAY,
      recentlyTouchedIds: ["a"],
    });
    expect(queue).toHaveLength(0);
  });

  it("no date and no season window means silence, not a guess", () => {
    const queue = rankQueue({
      relationships: [rel({ id: "n" })],
      craft: "designer", // no designer window in June
      config: SEASONALITY_NL_V1,
      today: "2026-06-15",
    });
    expect(queue).toHaveLength(0);
  });

  it("a future project date cannot rank", () => {
    const queue = rankQueue({
      relationships: [rel({ id: "f", lastProjectDate: "2026-12-01" })],
      craft: "photographer",
      config: SEASONALITY_NL_V1,
      today: TODAY,
    });
    expect(queue).toHaveLength(0);
  });

  it("value nudges but cannot conjure a reason", () => {
    const queue = rankQueue({
      relationships: [
        rel({ id: "rich-no-reason", approxValueCents: 10_000_00 }), // no date, designer, June
      ],
      craft: "designer",
      config: SEASONALITY_NL_V1,
      today: "2026-06-15",
    });
    expect(queue).toHaveLength(0);
  });
});

describe("seasonality config", () => {
  it("photographers have an autumn window in August, designers too", () => {
    expect(seasonWindowFor(SEASONALITY_NL_V1, "photographer", 8)?.reason).toBe(
      "autumn-campaign-briefing"
    );
    expect(seasonWindowFor(SEASONALITY_NL_V1, "designer", 6)).toBeNull();
  });

  it("illustrators are rolling all year", () => {
    for (let m = 1; m <= 12; m++) {
      expect(seasonWindowFor(SEASONALITY_NL_V1, "illustrator", m)?.reason).toBe(
        "editorial-rolling"
      );
    }
  });
});

describe("reasonText", () => {
  it("names the project on an anniversary, in both locales", () => {
    const suggestion = rankQueue({
      relationships: [
        rel({ id: "a", lastProjectDate: "2025-08-01", lastProjectTitle: "de campagneshoot" }),
      ],
      craft: "photographer",
      config: SEASONALITY_NL_V1,
      today: TODAY,
    })[0];
    const r = rel({ id: "a", lastProjectTitle: "de campagneshoot" });
    expect(reasonTextFor(suggestion, r, "nl")).toContain("de campagneshoot");
    expect(reasonTextFor(suggestion, r, "en")).toContain("Almost a year");
  });
});
