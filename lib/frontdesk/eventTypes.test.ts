import { describe, expect, it } from "vitest";
import {
  INTAKE_EVENT_TYPES,
  isIntakeEventType,
  LEGACY_EVENT_TYPES,
  needsOtherText,
  STORED_EVENT_TYPES,
} from "@/lib/frontdesk/eventTypes";
import { fdDict } from "@/lib/frontdesk/i18n";

describe("the intake vocabulary (handoff §9)", () => {
  it("offers the seven current options and no legacy ones", () => {
    expect([...INTAKE_EVENT_TYPES]).toEqual([
      "wedding",
      "event",
      "brand_film",
      "music_video",
      "real_estate",
      "social_content",
      "other",
    ]);
    for (const legacy of LEGACY_EVENT_TYPES) {
      expect(isIntakeEventType(legacy)).toBe(false);
    }
  });

  it("still renders every value an old row can hold", () => {
    for (const type of STORED_EVENT_TYPES) {
      expect(fdDict("en").public.form.types[type], `en ${type}`).toBeTruthy();
      expect(fdDict("nl").public.form.types[type], `nl ${type}`).toBeTruthy();
    }
  });

  it("requires a word about the project when the client picks Something else", () => {
    expect(needsOtherText("other", "")).toBe(true);
    expect(needsOtherText("other", "   ")).toBe(true);
    expect(needsOtherText("other", "album cover shoot")).toBe(false);
    expect(needsOtherText("wedding", "")).toBe(false);
  });
});
