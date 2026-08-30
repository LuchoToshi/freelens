/**
 * The memory model (master spec §12.3–§12.6, DS `MemoryList`). A SETTING is
 * something the freelancer typed; a LEARNED preference was inferred from
 * their edits, was explicitly accepted, and always shows its evidence count.
 * The two never blur: a dimension renders as learned only while an accepted
 * decision backs it, and reverting or resetting restores the retained prior
 * value without touching anything the freelancer typed elsewhere.
 */
import type { VoiceProfile } from "@/lib/frontdesk/prompts";
import type {
  ProposalDecision,
  ProposalDecisions,
  VoiceDimension,
} from "@/lib/frontdesk/voiceLearning";

export interface MemoryItem {
  /** The voice dimension this item is about. */
  dimension: string;
  source: "setting" | "learned";
  value: string;
  /** Learned items only. */
  evidenceCount?: number;
  /** The retained prior value a revert restores (§12.6). */
  prev?: string;
  /** The decision key, for revert. */
  decisionKey?: string;
}

const DIMENSIONS: (keyof VoiceProfile)[] = [
  "tone",
  "formality",
  "sentence_length",
  "emoji",
  "greeting_style",
  "closing_habit",
  "sign_off",
  "language_notes",
  "quirks",
];

function asDecision(raw: ProposalDecisions[string]): ProposalDecision {
  return typeof raw === "string" ? { decision: raw } : raw;
}

export function deriveMemoryItems(
  profile: VoiceProfile,
  decisions: ProposalDecisions
): MemoryItem[] {
  // The accepted decision per dimension whose value the profile still holds.
  const learnedByDimension = new Map<string, { key: string; d: ProposalDecision; value: string }>();
  for (const [key, raw] of Object.entries(decisions)) {
    if (key.startsWith("never:")) continue;
    const d = asDecision(raw);
    if (d.decision !== "accepted") continue;
    const [dimension, ...rest] = key.split(":");
    const value = rest.join(":");
    const current = profile[dimension as keyof VoiceProfile];
    if (typeof current === "string" && current === value) {
      learnedByDimension.set(dimension, { key, d, value });
    }
  }

  const items: MemoryItem[] = [];
  for (const dimension of DIMENSIONS) {
    const raw = profile[dimension];
    const value = Array.isArray(raw) ? raw.join(" · ") : (raw ?? "");
    if (!value) continue;
    const learned = learnedByDimension.get(dimension);
    if (learned) {
      items.push({
        dimension,
        source: "learned",
        value,
        evidenceCount: learned.d.evidenceCount,
        prev: learned.d.prev,
        decisionKey: learned.key,
      });
    } else {
      items.push({ dimension, source: "setting", value });
    }
  }
  return items;
}

/**
 * Revert one accepted proposal: the dimension goes back to the retained
 * prior value and the decision is dropped, so the same proposal may return
 * later if the evidence persists.
 */
export function revertLearned(
  key: string,
  profile: VoiceProfile,
  decisions: ProposalDecisions
): { profile: VoiceProfile; decisions: ProposalDecisions } {
  const raw = decisions[key];
  if (!raw) return { profile, decisions };
  const d = asDecision(raw);
  const dimension = key.split(":")[0] as VoiceDimension;
  const nextDecisions = { ...decisions };
  delete nextDecisions[key];
  const nextProfile =
    d.decision === "accepted" && d.prev !== undefined
      ? { ...profile, [dimension]: d.prev }
      : profile;
  return { profile: nextProfile, decisions: nextDecisions };
}

/**
 * §12.5 reset: every accepted proposal is reverted (where a prior value was
 * retained) and forgotten. Rejections and never-learn markers are the
 * freelancer's explicit choices, not learned preferences — they stay.
 */
export function resetLearned(
  profile: VoiceProfile,
  decisions: ProposalDecisions
): { profile: VoiceProfile; decisions: ProposalDecisions } {
  let nextProfile = profile;
  const nextDecisions: ProposalDecisions = {};
  for (const [key, raw] of Object.entries(decisions)) {
    const d = asDecision(raw);
    if (key.startsWith("never:") || d.decision === "rejected") {
      nextDecisions[key] = raw;
      continue;
    }
    const dimension = key.split(":")[0] as keyof VoiceProfile;
    const value = key.split(":").slice(1).join(":");
    if (d.prev !== undefined && nextProfile[dimension] === value) {
      nextProfile = { ...nextProfile, [dimension]: d.prev };
    }
  }
  return { profile: nextProfile, decisions: nextDecisions };
}
