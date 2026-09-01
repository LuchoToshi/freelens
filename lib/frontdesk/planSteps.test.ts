import { describe, expect, it } from "vitest";
import { matchedPackage, planSteps } from "@/lib/frontdesk/planSteps";

const PACKAGES = [
  { label: "Full day wedding", price_from_eur: 1950 },
  { label: "Half day wedding", price_from_eur: 1100 },
];

const WITH_PRICE = "Hi Lisa,\n\nMy full day is € 1.950.\n\nEmma";
const WITHOUT_PRICE = "Hi Lisa,\n\nTell me more and I will come back with a number.\n\nEmma";

function detail(steps: ReturnType<typeof planSteps>, key: string) {
  return steps.find((s) => s.key === key)!.detailKey;
}

describe("the plan says what happened, including when nothing did (handoff §8.8)", () => {
  it("names the package whose price the draft quotes", () => {
    expect(matchedPackage(WITH_PRICE, PACKAGES)).toEqual({
      label: "Full day wedding",
      asWritten: "€ 1.950",
    });
  });

  it("matches nothing when the draft quotes no number", () => {
    expect(matchedPackage(WITHOUT_PRICE, PACKAGES)).toBeNull();
  });

  it("matches nothing when the amount is not one of the freelancer's prices", () => {
    expect(matchedPackage("My day is € 2.400.", PACKAGES)).toBeNull();
  });

  it("distinguishes no packages set from a draft that named no number", () => {
    const steps = planSteps({ body: WITHOUT_PRICE, packages: [], eventType: "wedding", eventDate: null });
    expect(detail(steps, "matched")).toBe("matchedNoPackages");
    const withPackages = planSteps({
      body: WITHOUT_PRICE,
      packages: PACKAGES,
      eventType: "wedding",
      eventDate: null,
    });
    expect(detail(withPackages, "matched")).toBe("matchedNoNumber");
  });

  it("never claims a date was verified, in either branch", () => {
    const dated = planSteps({
      body: WITH_PRICE,
      packages: PACKAGES,
      eventType: "wedding",
      eventDate: "2026-06-13",
    });
    expect(detail(dated, "date")).toBe("dateNoCalendar");
    const undated = planSteps({
      body: WITH_PRICE,
      packages: PACKAGES,
      eventType: "wedding",
      eventDate: null,
    });
    expect(detail(undated, "date")).toBe("dateNone");
  });

  it("always reports the same four steps, in order", () => {
    const steps = planSteps({ body: WITH_PRICE, packages: PACKAGES, eventType: "wedding", eventDate: null });
    expect(steps.map((s) => s.key)).toEqual(["read", "matched", "date", "drafted"]);
  });
});
