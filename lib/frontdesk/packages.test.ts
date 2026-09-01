import { describe, expect, it } from "vitest";
import { describePackage, packagePromptLine } from "@/lib/frontdesk/packages";

const base = { label: "Brand consultation", price: "75", chargeBy: "hour" as const, priceIsFrom: false };

describe("a package describes itself before anyone else reads it", () => {
  it("says the price and how it is charged", () => {
    expect(describePackage(base, "en")).toBe("Brand consultation, € 75 per hour");
    expect(describePackage({ ...base, label: "Merkgesprek" }, "nl")).toBe(
      "Merkgesprek, € 75 per uur",
    );
  });

  it("only says 'from' when the amount really is a starting price", () => {
    expect(describePackage({ ...base, priceIsFrom: true }, "en")).toBe(
      "Brand consultation, from € 75 per hour",
    );
    expect(describePackage({ ...base, priceIsFrom: true }, "nl")).toBe(
      "Brand consultation, vanaf € 75 per uur",
    );
  });

  it("drops the per-line for a fixed package, which is charged once", () => {
    expect(
      describePackage({ label: "Brand photoshoot", price: "950", chargeBy: "fixed", priceIsFrom: false }, "en"),
    ).toBe("Brand photoshoot, € 950");
  });

  it("formats thousands the way each language writes them", () => {
    const pkg = { label: "Full day", price: "1950", chargeBy: "day" as const, priceIsFrom: false };
    expect(describePackage(pkg, "en")).toBe("Full day, € 1,950 per day");
    expect(describePackage(pkg, "nl")).toBe("Full day, € 1.950 per dag");
  });

  it("says nothing rather than half a sentence while the row is empty", () => {
    expect(describePackage({ label: "", price: "", chargeBy: null, priceIsFrom: false }, "en")).toBeNull();
    expect(describePackage({ label: "Day rate", price: "", chargeBy: null, priceIsFrom: false }, "en")).toBe(
      "Day rate",
    );
  });

  it("still reads a package written before charge_by existed", () => {
    expect(
      describePackage(
        { label: "Half day", price: "1100", chargeBy: null, priceIsFrom: true, unit: "per dagdeel" },
        "nl",
      ),
    ).toBe("Half day, vanaf € 1.100 per dagdeel");
  });

  it("gives the prompt the terms without the formatting", () => {
    expect(
      packagePromptLine({ label: "Full day wedding", priceFromEur: 1950, chargeBy: "day", priceIsFrom: false }),
    ).toBe("Full day wedding: € 1950 per day");
    expect(
      packagePromptLine({ label: "Portraits", priceFromEur: 350, chargeBy: "session", priceIsFrom: true, notes: "edited gallery" }),
    ).toBe("Portraits: from € 350 per session, edited gallery");
  });
});
