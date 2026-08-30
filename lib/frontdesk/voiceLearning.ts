/**
 * Voice learning proposals (master spec §6.6): derived at read time from the
 * freelancer's own edits — a draft whose outcome is `edited` carries both the
 * generated body and the final body, and the difference is evidence.
 *
 * Deterministic on purpose: every signal is a plain comparison the freelancer
 * can verify by looking at their own sent replies. No proposal from a single
 * edit; learning can be paused; a decision (accept or reject) persists under
 * a stable key so a rejected proposal never resurfaces for the same value.
 */
import type { VoiceProfile } from "@/lib/frontdesk/prompts";

export interface EditedDraft {
  body: string;
  final_body: string;
}

export interface VoiceProposal {
  /** Stable identity: `${dimension}:${value}` — the decision key. */
  key: string;
  dimension: "sign_off" | "emoji" | "sentence_length";
  /** The value the evidence points at, ready to apply. */
  value: string;
  /** How many edited drafts exhibit the signal. Always >= 2. */
  evidenceCount: number;
}

export type ProposalDecisions = Record<string, "accepted" | "rejected">;

const MIN_EVIDENCE = 2;
const EMOJI = /\p{Extended_Pictographic}/u;
const SHORTENED_BY = 0.3;

function lastLine(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines[lines.length - 1] ?? "";
}

export function deriveVoiceProposals(
  profile: VoiceProfile,
  edits: readonly EditedDraft[],
  decisions: ProposalDecisions,
  paused: boolean
): VoiceProposal[] {
  if (paused) return [];
  const proposals: VoiceProposal[] = [];

  // Sign-off: the freelancer keeps replacing the closing line with the same
  // other one. The profile is stored jsonb, so a dimension can be absent —
  // treat missing fields as "no signal", never as a crash.
  const configured = (profile.sign_off ?? "").trim().toLowerCase();
  const replacements = new Map<string, number>();
  for (const e of edits) {
    const final = lastLine(e.final_body);
    if (!final || final.length > 60) continue;
    if (final.toLowerCase() === configured) continue;
    // Only count when the edit actually changed the closing.
    if (lastLine(e.body).toLowerCase() === final.toLowerCase()) continue;
    replacements.set(final, (replacements.get(final) ?? 0) + 1);
  }
  for (const [value, count] of replacements) {
    if (count >= MIN_EVIDENCE) {
      proposals.push({ key: `sign_off:${value}`, dimension: "sign_off", value, evidenceCount: count });
    }
  }

  // Emoji: edits keep adding emoji to a never-emoji profile, or keep
  // stripping every emoji from drafts that had them.
  const added = edits.filter((e) => !EMOJI.test(e.body) && EMOJI.test(e.final_body)).length;
  const removed = edits.filter((e) => EMOJI.test(e.body) && !EMOJI.test(e.final_body)).length;
  if (profile.emoji === "never" && added >= MIN_EVIDENCE) {
    proposals.push({ key: "emoji:rare", dimension: "emoji", value: "rare", evidenceCount: added });
  }
  if (profile.emoji !== "never" && removed >= MIN_EVIDENCE) {
    proposals.push({ key: "emoji:never", dimension: "emoji", value: "never", evidenceCount: removed });
  }

  // Length: edits keep cutting the draft down substantially.
  const shorterStep: Record<VoiceProfile["sentence_length"], string | null> = {
    long: "medium",
    medium: "short",
    short: null,
  };
  const target = profile.sentence_length ? shorterStep[profile.sentence_length] : null;
  if (target) {
    const shortened = edits.filter(
      (e) =>
        e.body.length > 0 &&
        e.final_body.length > 0 &&
        e.final_body.length < e.body.length * (1 - SHORTENED_BY)
    ).length;
    if (shortened >= MIN_EVIDENCE) {
      proposals.push({
        key: `sentence_length:${target}`,
        dimension: "sentence_length",
        value: target,
        evidenceCount: shortened,
      });
    }
  }

  return proposals.filter((p) => !(p.key in decisions));
}
