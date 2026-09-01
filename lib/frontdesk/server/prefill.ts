/**
 * Agent-prefilled setup (addendum §4): point Freelens at a public page or
 * paste your own text, and the profile and packages arrive filled and
 * provenance-labeled for review. Nothing is saved until the freelancer
 * confirms — this module only READS and proposes.
 *
 * Prices keep the product's hardest rule: an extracted price is a PROPOSAL
 * the freelancer confirms, and only confirmed packages ever reach the draft
 * guards' allowed set. An unreadable field comes back null ("Not found"),
 * never guessed (§9, §8.1).
 */
const MODEL = process.env.FRONTDESK_DRAFT_MODEL ?? "claude-sonnet-5";
const MAX_SOURCE_CHARS = 12_000;
const FETCH_TIMEOUT_MS = 10_000;

export interface PrefillPackage {
  label: string | null;
  price_from_eur: number | null;
  unit: string | null;
  notes: string | null;
  confidence: number;
}

export interface PrefillResult {
  display_name: string | null;
  professions: string[];
  location: string | null;
  sign_off: string | null;
  packages: PrefillPackage[];
  /** 0–1 per field, for the provenance chips. */
  confidence: Record<string, number>;
  source: "url" | "text";
}

const SYSTEM = `You read a freelance creative's own public page or pasted notes and extract only what is literally there. You never invent, round, or infer a price.

Respond with ONLY a JSON object, no fences:
{"display_name": string|null,
 "professions": ["photographer"|"videographer"|"designer"|"illustrator"|"other"],
 "location": string|null,
 "sign_off": string|null,
 "packages": [{"label": string, "price_from_eur": number|null, "unit": string|null, "notes": string|null, "confidence": 0-1}],
 "confidence": {"display_name": 0-1, "professions": 0-1, "location": 0-1, "sign_off": 0-1}}

Rules:
- A field that is not stated in the source is null. Never guess.
- price_from_eur is a plain number of euros, only when a price is literally written. If a package is named without a price, price_from_eur is null.
- confidence is your honest read: 1 means the text says it outright.`;

/** Strips tags and collapses whitespace; we only need the words. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SOURCE_CHARS);
}

/** Only public http(s) pages, and never an internal address (SSRF guard). */
export function isFetchableUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return false;
  }
  return true;
}

export async function fetchSourceText(url: string): Promise<string | null> {
  if (!isFetchableUrl(url)) return null;
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "user-agent": "FreelensSetupReader/1.0" },
    });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("text/html") && !type.includes("text/plain")) return null;
    return htmlToText(await response.text());
  } catch {
    return null;
  }
}

const PROFESSIONS = ["photographer", "videographer", "designer", "illustrator", "other"];

export function parsePrefill(text: string, source: "url" | "text"): PrefillResult | null {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text.replace(/^```(?:json)?/m, "").replace(/```\s*$/m, "").trim());
  } catch {
    return null;
  }
  const str = (v: unknown, max = 200) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
  const conf = (v: unknown) =>
    typeof v === "number" && v >= 0 && v <= 1 ? v : 0.5;

  const rawConfidence = (raw.confidence ?? {}) as Record<string, unknown>;
  const packages = (Array.isArray(raw.packages) ? raw.packages : [])
    .slice(0, 8)
    .map((p: Record<string, unknown>) => ({
      label: str(p.label, 120),
      price_from_eur:
        typeof p.price_from_eur === "number" && p.price_from_eur > 0
          ? Math.round(p.price_from_eur)
          : null,
      unit: str(p.unit, 40),
      notes: str(p.notes, 500),
      confidence: conf(p.confidence),
    }))
    .filter((p) => p.label !== null);

  return {
    display_name: str(raw.display_name, 120),
    professions: (Array.isArray(raw.professions) ? raw.professions : [])
      .filter((p: unknown): p is string => typeof p === "string" && PROFESSIONS.includes(p))
      .slice(0, 3),
    location: str(raw.location, 120),
    sign_off: str(raw.sign_off, 60),
    packages,
    confidence: {
      display_name: conf(rawConfidence.display_name),
      professions: conf(rawConfidence.professions),
      location: conf(rawConfidence.location),
      sign_off: conf(rawConfidence.sign_off),
    },
    source,
  };
}

export async function extractPrefill(
  sourceText: string,
  source: "url" | "text"
): Promise<PrefillResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !sourceText.trim()) return null;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: "user", content: sourceText.slice(0, MAX_SOURCE_CHARS) }],
    }),
  });
  if (!response.ok) {
    console.error("frontdesk/prefill: provider returned", response.status);
    return null;
  }
  const payload = (await response.json()) as { content?: { type: string; text?: string }[] };
  return parsePrefill(payload.content?.find((c) => c.type === "text")?.text ?? "", source);
}
