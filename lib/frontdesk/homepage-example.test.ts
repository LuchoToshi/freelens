import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/en";
import { nl } from "@/lib/i18n/nl";
import { validateFrontdeskDraft } from "./draftGuards";

describe("homepage worked example obeys the product's own guards", () => {
  // The demo freelancer's package set: the whitelist every demo draft's
  // prices are checked against. Wedding names €1.950 and portrait €350
  // because these exist; party and business name none.
  const packages = [
    { label: "Bruiloft (hele dag)", priceFromEur: 1950, unit: null, notes: null },
    { label: "Portretsessie", priceFromEur: 350, unit: null, notes: null },
  ];

  it.each([
    ["nl", nl.home?.frontdesk?.example?.draft],
    ["en", en.home.frontdesk.example.draft],
  ] as const)("%s marketing draft passes availability + price guards", (_l, draft) => {
    expect(draft).toBeTruthy();
    const result = validateFrontdeskDraft(draft ?? "", { kind: "reply", packages });
    expect(result.ok, JSON.stringify(result)).toBe(true);
  });

  const TYPES = ["wedding", "party", "business", "portrait"] as const;
  it.each(
    TYPES.flatMap((t) => [
      [`nl ${t}`, nl.home?.frontdesk?.demo?.types?.[t]?.draft],
      [`en ${t}`, en.home.frontdesk.demo.types[t].draft],
    ]) as [string, string | undefined][]
  )("demo draft %s passes availability + price guards", (_label, draft) => {
    expect(draft).toBeTruthy();
    const result = validateFrontdeskDraft(draft ?? "", { kind: "reply", packages });
    expect(result.ok, JSON.stringify(result)).toBe(true);
  });

  it("wedding names its package price; party and business name none", () => {
    for (const dict of [nl.home!.frontdesk!.demo!, en.home.frontdesk.demo]) {
      expect(dict.types!.wedding!.draft).toMatch(/1[.,]950/);
      expect(dict.types!.portrait!.draft).toMatch(/350/);
      expect(dict.types!.party!.draft).not.toMatch(/€\s?\d/);
      expect(dict.types!.business!.draft).not.toMatch(/€\s?\d/);
    }
  });
});
