import { describe, expect, it } from "vitest";
import { deriveVoiceProposals, type EditedDraft } from "@/lib/frontdesk/voiceLearning";
import type { VoiceProfile } from "@/lib/frontdesk/prompts";

const PROFILE: VoiceProfile = {
  tone: "warm",
  formality: "informal",
  sentence_length: "medium",
  emoji: "never",
  greeting_style: "Hi {name},",
  closing_habit: "suggests a call",
  sign_off: "Groetjes, Emma",
  language_notes: "",
  quirks: [],
};

function edit(body: string, final: string): EditedDraft {
  return { body, final_body: final };
}

const SIGNOFF_EDIT = edit(
  "Hi Lisa,\n\nLeuk bericht!\n\nGroetjes, Emma",
  "Hi Lisa,\n\nLeuk bericht!\n\nLiefs, Em"
);

describe("voice learning proposals (§6.6): deterministic, paused-able, never from one edit", () => {
  it("a sign-off replaced the same way twice becomes a proposal with its evidence count", () => {
    const proposals = deriveVoiceProposals(PROFILE, [SIGNOFF_EDIT, SIGNOFF_EDIT], {}, false);
    expect(proposals).toEqual([
      { key: "sign_off:Liefs, Em", dimension: "sign_off", value: "Liefs, Em", evidenceCount: 2 },
    ]);
  });

  it("one edit is never a proposal", () => {
    expect(deriveVoiceProposals(PROFILE, [SIGNOFF_EDIT], {}, false)).toEqual([]);
  });

  it("paused learning proposes nothing regardless of evidence", () => {
    expect(deriveVoiceProposals(PROFILE, [SIGNOFF_EDIT, SIGNOFF_EDIT], {}, true)).toEqual([]);
  });

  it("a rejected proposal never resurfaces for the same value", () => {
    expect(
      deriveVoiceProposals(PROFILE, [SIGNOFF_EDIT, SIGNOFF_EDIT], { "sign_off:Liefs, Em": "rejected" }, false)
    ).toEqual([]);
  });

  it("emoji added twice to a never-emoji profile proposes rare", () => {
    const e = edit("Hi!\n\nTot snel.\n\nGroetjes, Emma", "Hi!\n\nTot snel. ✨\n\nGroetjes, Emma");
    const proposals = deriveVoiceProposals(PROFILE, [e, e], {}, false);
    expect(proposals).toEqual([
      { key: "emoji:rare", dimension: "emoji", value: "rare", evidenceCount: 2 },
    ]);
  });

  it("substantial shortening twice proposes one step shorter, never past short", () => {
    const long = "x".repeat(400);
    const e = edit(`${long}\n\nGroetjes, Emma`, "Kort antwoord.\n\nGroetjes, Emma");
    expect(deriveVoiceProposals(PROFILE, [e, e], {}, false)).toEqual([
      { key: "sentence_length:short", dimension: "sentence_length", value: "short", evidenceCount: 2 },
    ]);
    expect(
      deriveVoiceProposals({ ...PROFILE, sentence_length: "short" }, [e, e], {}, false)
    ).toEqual([]);
  });

  it("an unchanged closing is not sign-off evidence", () => {
    const same = edit("Hi,\n\nTekst hier.\n\nGroetjes, Emma", "Hi,\n\nAndere tekst.\n\nGroetjes, Emma");
    expect(deriveVoiceProposals(PROFILE, [same, same], {}, false)).toEqual([]);
  });
});
