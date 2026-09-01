/**
 * One-off steers for a single draft.
 *
 * This is not voice learning. The voice profile is what the freelancer taught
 * Freelens about how they write, and it changes only when they say so. An
 * adjustment here rewrites this one reply, for this one client, and is
 * forgotten afterwards. Keeping the two apart is what stops a bad afternoon
 * ("make it shorter") from quietly becoming a permanent instruction.
 *
 * The list is closed, plus a free-text option, and the instruction the model
 * receives is written here rather than typed by the freelancer for the fixed
 * choices, so a steer can never turn into an instruction that contradicts the
 * guards. The guards run on the result either way.
 */
export const TONE_ADJUSTMENTS = [
  "casual",
  "professional",
  "shorter",
  "warmer",
  "direct",
  "simpler",
] as const;

export type ToneAdjustment = (typeof TONE_ADJUSTMENTS)[number];

const INSTRUCTIONS: Record<ToneAdjustment, string> = {
  casual: "Make this reply more casual and relaxed, without becoming sloppy.",
  professional: "Make this reply more professional and businesslike, without becoming stiff.",
  shorter: "Make this reply noticeably shorter. Keep every fact, drop the padding.",
  warmer: "Make this reply warmer and more personal.",
  direct: "Make this reply more direct. Lead with the answer and cut hedging.",
  simpler: "Use simpler, plainer language. Short sentences, everyday words.",
};

export const CUSTOM_ADJUSTMENT_MAX = 200;

export function isToneAdjustment(value: string): value is ToneAdjustment {
  return (TONE_ADJUSTMENTS as readonly string[]).includes(value);
}

/**
 * The instruction line appended to the draft prompt. A fixed choice resolves
 * to copy written here; free text is passed through, trimmed and capped, and
 * framed as a request about wording so it reads as a style note rather than
 * as authority over the rules the draft must still pass.
 */
export function adjustmentInstruction(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isToneAdjustment(trimmed)) return INSTRUCTIONS[trimmed];
  return `Rewrite the reply following this note about wording: ${trimmed.slice(0, CUSTOM_ADJUSTMENT_MAX)}`;
}
