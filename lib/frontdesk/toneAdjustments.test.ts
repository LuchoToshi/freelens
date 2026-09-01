import { describe, expect, it } from "vitest";
import { adjustmentInstruction, isToneAdjustment, TONE_ADJUSTMENTS } from "@/lib/frontdesk/toneAdjustments";
import { buildDraftPrompt, type DraftPromptInput } from "@/lib/frontdesk/prompts";

const INPUT: DraftPromptInput = {
  kind: "reply" as const,
  voiceProfile: {
    tone: "warm",
    formality: "neutral",
    sentence_length: "medium",
    emoji: "rare",
    greeting_style: "Hi {first name}",
    closing_habit: "",
    sign_off: "Emma",
    language_notes: "",
    quirks: [],
  },
  packages: [{ label: "Full day", priceFromEur: 1950, unit: null, notes: null }],
  inquiry: {
    clientFirstName: "Lisa",
    eventType: "wedding",
    eventDate: "2026-06-13",
    budgetBand: "1000-2500",
    message: "Are you free?",
  },
  displayName: "Emma",
  signOff: "Emma",
  targetLanguage: "en" as const,
};

describe("a steer changes wording, not the rules", () => {
  it("turns each fixed choice into an instruction", () => {
    for (const value of TONE_ADJUSTMENTS) {
      expect(adjustmentInstruction(value), value).toBeTruthy();
      expect(isToneAdjustment(value)).toBe(true);
    }
  });

  it("passes the freelancer's own note through, framed as a note about wording", () => {
    const out = adjustmentInstruction("mention that I shoot on film");
    expect(out).toContain("mention that I shoot on film");
    expect(out).toContain("wording");
  });

  it("caps a very long note", () => {
    const out = adjustmentInstruction("x".repeat(500))!;
    expect(out.length).toBeLessThan(300);
  });

  it("treats an empty note as no steer at all", () => {
    expect(adjustmentInstruction("   ")).toBeNull();
  });

  it("is absent from the prompt when nothing was asked for", () => {
    const { user } = buildDraftPrompt(INPUT);
    expect(user).not.toContain("asked for one change");
  });

  it("restates the rules after the steer, so a steer cannot loosen them", () => {
    const { user } = buildDraftPrompt({ ...INPUT, adjustment: "shorter" });
    expect(user).toContain("asked for one change");
    expect(user).toContain("no price that is not in the packages block");
    expect(user).toContain("the sign-off exactly as given");
  });

  it("puts a freelancer's own note after the data blocks, never inside them", () => {
    const { user } = buildDraftPrompt({ ...INPUT, adjustment: "be blunt" });
    expect(user.indexOf("be blunt")).toBeGreaterThan(user.indexOf("inquiry>>>"));
  });
});
