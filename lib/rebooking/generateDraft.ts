/**
 * The one function that talks to a model, and the loop that keeps it honest.
 *
 * Generation is a server-side concern behind auth; nothing in the client
 * bundle imports this. The flow per attempt:
 *
 *   buildDraftPrompt  →  Anthropic Messages API  →  parse  →  validateDraft
 *
 * A draft that fails validation (banned opener, empty, oversized) is thrown
 * back with the rejection named, up to MAX_ATTEMPTS. After that the caller
 * gets an error, never a rule-breaking draft: the guard is the contract, the
 * model is just the writer.
 *
 * Model output lands in exactly two string fields. It cannot reach a
 * calculation, a recipient list, or a setting, because nothing here returns
 * anything but {subject, body} text that the UI renders as editable.
 */
import {
  buildDraftPrompt,
  validateDraft,
  MAX_ATTEMPTS,
  type Draft,
  type DraftRequest,
} from "@/lib/rebooking/draftGuards";

/** Strong writing model by default; overridable per environment. */
const MODEL = process.env.REBOOKING_DRAFT_MODEL ?? "claude-sonnet-5";

export class DraftGenerationError extends Error {
  constructor(
    message: string,
    readonly attempts: number
  ) {
    super(message);
  }
}

export async function generateDraft(request: DraftRequest): Promise<Draft> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new DraftGenerationError("ANTHROPIC_API_KEY is not set", 0);

  const prompt = buildDraftPrompt(request);
  let lastReason = "unknown";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const draft = await callModel(apiKey, prompt, attempt, lastReason);
    if (draft === null) {
      lastReason = "unparseable";
      continue;
    }
    const verdict = validateDraft(draft);
    if (verdict.ok) return draft;
    lastReason = verdict.reason ?? "invalid";
  }

  throw new DraftGenerationError(`no valid draft after ${MAX_ATTEMPTS} attempts (${lastReason})`, MAX_ATTEMPTS);
}

async function callModel(
  apiKey: string,
  prompt: string,
  attempt: number,
  lastReason: string
): Promise<Draft | null> {
  const retryNote =
    attempt === 1
      ? ""
      : `\n\nYour previous answer was rejected (${lastReason}). Follow every hard rule exactly this time.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt + retryNote }],
    }),
  });

  if (!response.ok) {
    // Provider errors carry no user data worth logging; the status is enough.
    console.error("generateDraft: provider returned", response.status);
    return null;
  }

  const payload = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = payload.content?.find((c) => c.type === "text")?.text ?? "";
  return parseDraft(text);
}

/** Tolerant of a model wrapping its JSON in prose or fences, strict about shape. */
export function parseDraft(text: string): Draft | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    if (typeof parsed.subject !== "string" || typeof parsed.body !== "string") return null;
    return { subject: parsed.subject.trim(), body: parsed.body.trim() };
  } catch {
    return null;
  }
}
