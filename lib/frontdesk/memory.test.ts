import { describe, expect, it } from "vitest";
import { deriveMemoryItems, resetLearned, revertLearned } from "@/lib/frontdesk/memory";
import type { VoiceProfile } from "@/lib/frontdesk/prompts";

const PROFILE: VoiceProfile = {
  tone: "warm",
  formality: "informal",
  sentence_length: "medium",
  emoji: "never",
  greeting_style: "Hi {name},",
  closing_habit: "suggests a call",
  sign_off: "Liefs, Em",
  language_notes: "",
  quirks: [],
};

const ACCEPTED = {
  "sign_off:Liefs, Em": {
    decision: "accepted" as const,
    prev: "Groetjes, Emma",
    evidenceCount: 3,
    at: "2026-08-30T10:00:00Z",
  },
};

describe("the memory model (§12.3–§12.6): settings and learned stay distinct", () => {
  it("an accepted proposal renders as learned with its evidence count; the rest are settings", () => {
    const items = deriveMemoryItems(PROFILE, ACCEPTED);
    const signOff = items.find((i) => i.dimension === "sign_off");
    expect(signOff).toMatchObject({ source: "learned", value: "Liefs, Em", evidenceCount: 3 });
    expect(items.find((i) => i.dimension === "tone")?.source).toBe("setting");
  });

  it("a learned value the freelancer later hand-edited is a setting again", () => {
    const edited = { ...PROFILE, sign_off: "Warm regards, Em" };
    expect(deriveMemoryItems(edited, ACCEPTED).find((i) => i.dimension === "sign_off")?.source).toBe(
      "setting"
    );
  });

  it("revert restores the retained prior value and forgets the decision (§12.6)", () => {
    const { profile, decisions } = revertLearned("sign_off:Liefs, Em", PROFILE, ACCEPTED);
    expect(profile.sign_off).toBe("Groetjes, Emma");
    expect(decisions).toEqual({});
  });

  it("reset reverts everything learned but keeps rejections, never-learn, and typed settings", () => {
    const decisions = {
      ...ACCEPTED,
      "emoji:rare": "rejected" as const,
      "never:sentence_length": { decision: "rejected" as const },
    };
    const { profile, decisions: next } = resetLearned(PROFILE, decisions);
    expect(profile.sign_off).toBe("Groetjes, Emma");
    expect(profile.tone).toBe("warm");
    expect(Object.keys(next).sort()).toEqual(["emoji:rare", "never:sentence_length"]);
  });
});
