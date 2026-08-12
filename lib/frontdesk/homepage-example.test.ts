import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/en";
import { nl } from "@/lib/i18n/nl";
import { validateFrontdeskDraft } from "./draftGuards";

describe("homepage worked example obeys the product's own guards", () => {
  const packages = [
    { label: "Bruiloft (hele dag)", priceFromEur: 1950, unit: null, notes: null },
  ];
  it.each([
    ["nl", nl.home?.frontdesk?.example?.draft],
    ["en", en.home.frontdesk.example.draft],
  ] as const)("%s marketing draft passes availability + price guards", (_l, draft) => {
    expect(draft).toBeTruthy();
    const result = validateFrontdeskDraft(draft ?? "", { kind: "reply", packages });
    expect(result.ok, JSON.stringify(result)).toBe(true);
  });
});
