import { describe, expect, it } from "vitest";
import { SOURCE_REGISTRY } from "@/lib/domain/sourceRegistry";
import { en } from "@/lib/i18n/en";
import { nl } from "@/lib/i18n/nl";

/**
 * The registry is data, but its `notes` are our own prose and get rendered on
 * /accuracy. They live in the dictionary keyed by entry id, so this checks the
 * two cannot drift: a new source without a note would fall back to English on
 * a Dutch page, and a stale key would sit there translating nothing.
 */
describe("every source entry has a translated note", () => {
  const ids = SOURCE_REGISTRY.map((s) => s.id);

  it("covers every registry entry in both locales", () => {
    for (const id of ids) {
      expect(en.accuracyPage.sourceNotes[id as never], `en ${id}`).toBeDefined();
      expect(nl.accuracyPage?.sourceNotes?.[id as never], `nl ${id}`).toBeDefined();
    }
  });

  it("has no keys for sources that no longer exist", () => {
    const stale = Object.keys(en.accuracyPage.sourceNotes).filter(
      (k) => !ids.includes(k)
    );
    expect(stale, `stale note keys:\n${stale.join("\n")}`).toEqual([]);
  });

  it("keeps the English note in step with the registry", () => {
    // The registry text is what a reader sees if the dictionary lookup ever
    // misses, so the two must say the same thing.
    for (const entry of SOURCE_REGISTRY) {
      expect(
        en.accuracyPage.sourceNotes[entry.id as never],
        `drifted: ${entry.id}`
      ).toBe(entry.notes);
    }
  });
});
