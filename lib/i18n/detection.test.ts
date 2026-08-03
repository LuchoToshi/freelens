import { describe, expect, it } from "vitest";
import { resolveInitialLocale } from "@/components/i18n/locale-provider";

/**
 * The rule for a visitor's first language, in priority order:
 *   1. what they chose here before
 *   2. the browser's primary language, if it is Dutch
 *   3. English
 */
describe("choosing a locale for a visitor", () => {
  it("prefers a stored choice over anything the browser says", () => {
    expect(resolveInitialLocale("en", "nl-NL")).toBe("en");
    expect(resolveInitialLocale("nl", "en-GB")).toBe("nl");
  });

  it("falls back to Dutch for a Dutch browser on a first visit", () => {
    for (const language of ["nl", "nl-NL", "nl-BE", "NL-nl"]) {
      expect(resolveInitialLocale(null, language), language).toBe("nl");
    }
  });

  it("falls back to English for anything else", () => {
    for (const language of ["en-US", "de-DE", "fr", "", "nlx", "en-NL"]) {
      expect(resolveInitialLocale(null, language), language).toBe("en");
    }
  });

  it("ignores a stored value that is not a locale", () => {
    // A stale or tampered key must not be able to select a language that does
    // not exist, which would render an empty dictionary.
    expect(resolveInitialLocale("de", "en-US")).toBe("en");
    expect(resolveInitialLocale("", "nl-NL")).toBe("nl");
    expect(resolveInitialLocale("nl-NL", "en-US")).toBe("en");
  });
});
