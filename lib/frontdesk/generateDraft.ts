/**
 * FrontDesk's model callers: draft generation and voice-profile extraction.
 *
 * The retry-loop structure is copied from the rebooking generator (that
 * module is rebooking-owned and stays untouched): call, validate
 * deterministically, feed a named rejection back, give up after MAX_ATTEMPTS
 * with an error the caller persists as a pending state. Worst case stays
 * around 40 seconds, comfortably inside any plan's function ceiling.
 *
 * Model default is claude-sonnet-5 — verified against the live /v1/models
 * list, and the same string every rebooking draft has shipped on.
 */
import {
  buildDraftPrompt,
  buildVoicePrompt,
  isUsableVoiceProfile,
  type DraftPromptInput,
  type VoiceProfile,
} from "@/lib/frontdesk/prompts";
import { validateFrontdeskDraft } from "@/lib/frontdesk/draftGuards";

const MODEL = process.env.FRONTDESK_DRAFT_MODEL ?? "claude-sonnet-5";
export const MAX_ATTEMPTS = 3;

export class FrontdeskGenerationError extends Error {
  constructor(
    message: string,
    readonly attempts: number
  ) {
    super(message);
  }
}

async function callModel(system: string, user: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new FrontdeskGenerationError("ANTHROPIC_API_KEY is not set", 0);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!response.ok) {
    // Provider errors carry no user data worth logging; the status is enough.
    console.error("frontdesk/generate: provider returned", response.status);
    return "";
  }
  const payload = (await response.json()) as { content?: { type: string; text?: string }[] };
  return payload.content?.find((c) => c.type === "text")?.text ?? "";
}

export interface FrontdeskDraftResult {
  body: string;
  attempts: number;
}

export async function generateFrontdeskDraft(
  input: DraftPromptInput
): Promise<FrontdeskDraftResult> {
  const { system, user } = buildDraftPrompt(input);
  let lastReason = "unknown";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const retryNote =
      attempt === 1
        ? ""
        : `\n\nYour previous answer was rejected (${lastReason}). Follow every hard rule exactly this time.`;
    const text = (await callModel(system, user + retryNote, 500)).trim();
    if (!text) {
      lastReason = "empty-response";
      continue;
    }
    const verdict = validateFrontdeskDraft(text, {
      kind: input.kind,
      packages: input.packages,
    });
    if (verdict.ok) return { body: text, attempts: attempt };
    lastReason = verdict.reason ?? "invalid";
  }

  throw new FrontdeskGenerationError(
    `no valid draft after ${MAX_ATTEMPTS} attempts (${lastReason})`,
    MAX_ATTEMPTS
  );
}

/** Strict-shape parse of the voice-profile JSON; null when unusable. */
export function parseVoiceProfile(text: string): VoiceProfile | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    if (!isUsableVoiceProfile(parsed)) return null;
    return {
      tone: String(parsed.tone),
      formality: (["informal", "neutral", "formal"].includes(parsed.formality as string)
        ? parsed.formality
        : "neutral") as VoiceProfile["formality"],
      sentence_length: (["short", "medium", "long"].includes(parsed.sentence_length as string)
        ? parsed.sentence_length
        : "medium") as VoiceProfile["sentence_length"],
      emoji: (["never", "rare", "frequent"].includes(parsed.emoji as string)
        ? parsed.emoji
        : "rare") as VoiceProfile["emoji"],
      greeting_style: String(parsed.greeting_style ?? ""),
      closing_habit: String(parsed.closing_habit ?? ""),
      sign_off: String(parsed.sign_off ?? ""),
      language_notes: String(parsed.language_notes ?? ""),
      quirks: Array.isArray(parsed.quirks) ? parsed.quirks.slice(0, 3).map(String) : [],
    };
  } catch {
    return null;
  }
}

export async function extractVoiceProfile(
  samples: string,
  locale: "nl" | "en"
): Promise<VoiceProfile> {
  const { system, user } = buildVoicePrompt(samples, locale);
  for (let attempt = 1; attempt <= 2; attempt++) {
    const text = await callModel(
      system,
      attempt === 1 ? user : `${user}\n\nRespond ONLY with the JSON object, nothing else.`,
      800
    );
    const profile = parseVoiceProfile(text);
    if (profile) return profile;
  }
  throw new FrontdeskGenerationError("voice profile extraction failed", 2);
}
