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
  it("DEC-7: a sign-off replaced 3 times in the window becomes a proposal", () => {
    const proposals = deriveVoiceProposals(PROFILE, [SIGNOFF_EDIT, SIGNOFF_EDIT, SIGNOFF_EDIT], {}, false);
    expect(proposals).toEqual([
      { key: "sign_off:Liefs, Em", dimension: "sign_off", value: "Liefs, Em", evidenceCount: 3, windowSize: 3 },
    ]);
  });

  it("one or two edits are never a proposal (§12.4)", () => {
    expect(deriveVoiceProposals(PROFILE, [SIGNOFF_EDIT], {}, false)).toEqual([]);
    expect(deriveVoiceProposals(PROFILE, [SIGNOFF_EDIT, SIGNOFF_EDIT], {}, false)).toEqual([]);
  });

  it("DEC-7: only the last 5 comparable drafts count", () => {
    const other = edit("Hi,\n\nTekst.\n\nGroetjes, Emma", "Hi,\n\nAndere tekst.\n\nGroetjes, Emma");
    // three matching edits exist, but two sit outside the 5-draft window
    const history = [SIGNOFF_EDIT, other, other, other, other, SIGNOFF_EDIT, SIGNOFF_EDIT];
    expect(deriveVoiceProposals(PROFILE, history, {}, false)).toEqual([]);
  });

  it("never-learn on a dimension blocks every proposal for it (§12.5)", () => {
    expect(
      deriveVoiceProposals(PROFILE, [SIGNOFF_EDIT, SIGNOFF_EDIT, SIGNOFF_EDIT], { "never:sign_off": { decision: "rejected" } }, false)
    ).toEqual([]);
  });

  it("paused learning proposes nothing regardless of evidence", () => {
    expect(deriveVoiceProposals(PROFILE, [SIGNOFF_EDIT, SIGNOFF_EDIT, SIGNOFF_EDIT], {}, true)).toEqual([]);
  });

  it("a rejected proposal never resurfaces, in either decision shape", () => {
    const edits = [SIGNOFF_EDIT, SIGNOFF_EDIT, SIGNOFF_EDIT];
    expect(
      deriveVoiceProposals(PROFILE, edits, { "sign_off:Liefs, Em": "rejected" }, false)
    ).toEqual([]);
    expect(
      deriveVoiceProposals(PROFILE, edits, { "sign_off:Liefs, Em": { decision: "rejected", at: "2026-08-30" } }, false)
    ).toEqual([]);
  });

  it("emoji added 3 times to a never-emoji profile proposes rare", () => {
    const e = edit("Hi!\n\nTot snel.\n\nGroetjes, Emma", "Hi!\n\nTot snel. ✨\n\nGroetjes, Emma");
    const proposals = deriveVoiceProposals(PROFILE, [e, e, e], {}, false);
    expect(proposals).toEqual([
      { key: "emoji:rare", dimension: "emoji", value: "rare", evidenceCount: 3, windowSize: 3 },
    ]);
  });

  it("substantial shortening 3 times proposes one step shorter, never past short", () => {
    const long = "x".repeat(400);
    const e = edit(`${long}\n\nGroetjes, Emma`, "Kort antwoord.\n\nGroetjes, Emma");
    expect(deriveVoiceProposals(PROFILE, [e, e, e], {}, false)).toEqual([
      { key: "sentence_length:short", dimension: "sentence_length", value: "short", evidenceCount: 3, windowSize: 3 },
    ]);
    expect(
      deriveVoiceProposals({ ...PROFILE, sentence_length: "short" }, [e, e, e], {}, false)
    ).toEqual([]);
  });

  it("a profile missing dimensions signals nothing instead of crashing", () => {
    const partial = { tone: "warm" } as unknown as VoiceProfile;
    expect(deriveVoiceProposals(partial, [SIGNOFF_EDIT, SIGNOFF_EDIT, SIGNOFF_EDIT], {}, false)).toEqual([
      { key: "sign_off:Liefs, Em", dimension: "sign_off", value: "Liefs, Em", evidenceCount: 3, windowSize: 3 },
    ]);
  });

  it("an unchanged closing is not sign-off evidence", () => {
    const same = edit("Hi,\n\nTekst hier.\n\nGroetjes, Emma", "Hi,\n\nAndere tekst.\n\nGroetjes, Emma");
    expect(deriveVoiceProposals(PROFILE, [same, same], {}, false)).toEqual([]);
  });
});
