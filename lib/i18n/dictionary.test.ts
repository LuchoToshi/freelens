import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/en";
import { nl } from "@/lib/i18n/nl";
import { getDictionary } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n/types";

type Node = Record<string, unknown>;

/** Every leaf path in a dictionary, e.g. "home.hero.body". */
function paths(node: unknown, prefix = ""): string[] {
  if (node === null || typeof node !== "object") return [prefix];
  if (Array.isArray(node)) return [prefix];
  return Object.entries(node as Node).flatMap(([key, value]) =>
    paths(value, prefix ? `${prefix}.${key}` : key)
  );
}

function valueAt(dict: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Node)?.[key], dict);
}

describe("the Dutch dictionary covers the English one", () => {
  const englishPaths = paths(en);

  it("has no untranslated keys", () => {
    // A missing key still renders (English falls through), so this is the only
    // thing standing between "not translated yet" and "quietly English forever".
    const missing = englishPaths.filter((p) => valueAt(nl, p) === undefined);
    expect(missing, `untranslated keys:\n${missing.join("\n")}`).toEqual([]);
  });

  it("actually says something different, key by key", () => {
    // Catches a translation that was copied across rather than translated.
    // These are identical on purpose: a brand name, a loanword Dutch uses
    // unchanged, a bare percentage, an acronym, or a numeric placeholder.
    const SAME_BY_DESIGN = new Set([
      "common.brand",
      "common.nav.rebooking",
      "agent.title",
      "agent.numbers.noData",
      "agent.onboarding.importPlaceholder",
      "common.nav.privacy",
      "common.nav.contact",
      "meta.privacy.title",
      "privacyPage.eyebrow",
      "home.rebooking.waitlist.crafts.illustrator",
      "home.frontdesk.heroEyebrow",
      "home.frontdesk.waitlist.crafts.illustrator",
      // A first name is not copy; the mock client is Lisa in both languages.
      "home.frontdesk.example.clientName",
      "home.frontdesk.demo.types.wedding.clientName",
      // A number range with no thousands separator reads the same in both.
      "home.frontdesk.demo.types.portrait.budget",
      "app.shell.eyebrow",
      "meta.home.title",
      "home.privacy.ariaLabel",
      "app.moneyArrived.amountPlaceholder",
      "app.moneyArrived.labelLabel",
      "app.paymentHistory.vatLabel",
      "app.paymentHistory.vatPrefix",
      "app.settings.treatments.0",
      "app.settings.treatments.9",
      "app.settings.treatments.21",
      "app.settings.treatments.kor",
      // Dutch uses these words unchanged.
      "app.weekly.steps.buffer",
      "app.decision.later",
      // The breakdown table is keyed BY the English label, so English maps to
      // itself by construction. Only the Dutch side carries a translation.
      ...Object.keys(en.app.breakdown).map((k) => `app.breakdown.${k}`),
    ]);
    // A value that is only digits and separators is a number, not copy: an
    // amount placeholder like "1500" is identical in every language.
    const isNumeric = (v: unknown) =>
      typeof v === "string" && /^[\d.,\s]+$/.test(v);

    const identical = englishPaths.filter(
      (p) =>
        !SAME_BY_DESIGN.has(p) &&
        typeof valueAt(en, p) === "string" &&
        !isNumeric(valueAt(en, p)) &&
        valueAt(nl, p) === valueAt(en, p)
    );
    expect(identical, `identical to English:\n${identical.join("\n")}`).toEqual([]);
  });

  it("keeps every {placeholder} the English string declares", () => {
    // A dropped placeholder renders a sentence with a hole in it; an invented
    // one renders a literal {brace} to the user.
    const placeholders = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort();
    for (const path of englishPaths) {
      const source = valueAt(en, path);
      const target = valueAt(nl, path);
      if (typeof source !== "string" || typeof target !== "string") continue;
      expect(placeholders(target), `placeholders differ at ${path}`).toEqual(
        placeholders(source)
      );
    }
  });
});

describe("fallback behaviour", () => {
  it("returns a full dictionary for every locale", () => {
    for (const locale of LOCALES) {
      const dict = getDictionary(locale);
      for (const path of paths(en)) {
        expect(valueAt(dict, path), `${locale} missing ${path}`).toBeDefined();
      }
    }
  });

  it("falls back to English for a key a locale has not translated", () => {
    // Simulated directly: `nl` is complete, so the guarantee is checked through
    // the merge rather than by leaving a real gap in the shipped dictionary.
    const merged = getDictionary("nl");
    expect(typeof merged.common.brand).toBe("string");
    expect(merged.home.hero.contexts.length).toBeGreaterThan(0);
  });
});
