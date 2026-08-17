/**
 * Deterministic guards on generated FrontDesk drafts, mirroring the repo's
 * validate-and-retry discipline: the prompt states the rules, this module
 * enforces them, and a draft that breaks one is rejected with a named reason
 * the retry loop feeds back.
 *
 * Three hard product rules live here:
 *   - never an invented price: any euro amount in a draft must literally be a
 *     configured package price
 *   - never an availability claim
 *   - never an em dash
 * Plus the reply-language rule: Dutch inquiry → Dutch draft, detected
 * deterministically so it is unit-testable.
 */
import type { PromptPackage } from "@/lib/frontdesk/prompts";

// ------------------------------------------------------------- language

const NL_STOPWORDS = new Set([
  "de", "het", "een", "en", "ik", "je", "jij", "jullie", "wij", "we", "niet",
  "voor", "van", "met", "dat", "dit", "ook", "graag", "naar", "bij", "onze",
  "zijn", "wordt", "hoi", "hallo", "bedankt", "alvast", "vraag", "trouwen",
]);
const EN_STOPWORDS = new Set([
  "the", "a", "an", "and", "i", "you", "we", "not", "for", "with", "that",
  "this", "also", "to", "at", "our", "are", "is", "would", "hi", "hello",
  "thanks", "please", "wedding", "looking",
]);

export function detectLanguage(message: string | null | undefined, fallback: "nl" | "en"): "nl" | "en" {
  if (!message || !message.trim()) return fallback;
  const words = message.toLowerCase().split(/[^a-zà-ü']+/).filter(Boolean);
  if (words.length < 3) return fallback;
  let nl = 0;
  let en = 0;
  for (const w of words) {
    if (NL_STOPWORDS.has(w)) nl++;
    if (EN_STOPWORDS.has(w)) en++;
  }
  if (nl === en) return fallback;
  return nl > en ? "nl" : "en";
}

// ------------------------------------------------------------- price guard

/**
 * Every digit-normalized form a configured price may appear as. "1950" covers
 * "€ 1.950", "1950", "€1,950", "1950,-" — the digits are the identity.
 */
export function packagePriceDigits(packages: readonly PromptPackage[]): Set<string> {
  const digits = new Set<string>();
  for (const p of packages) {
    const whole = String(Math.trunc(p.priceFromEur));
    digits.add(whole);
    digits.add(String(p.priceFromEur).replace(/\D/g, ""));
  }
  return digits;
}

const EURO_MARKED = /(?:€\s?[\d.,]+|\b[\d.,]+\s?(?:euro|eur)\b)/gi;
const BARE_NUMBER = /\b\d{3,}\b/g;
const YEAR_SHAPE = /^(19|20)\d{2}$/;

/** Amounts found in a draft, normalized to bare digit strings. */
export function findPriceLikeAmounts(text: string): string[] {
  const found: string[] = [];
  // Euro-marked amounts first; strip them from the text so the bare-number
  // scan cannot re-match fragments of a dotted-thousands amount ("1.950"
  // must not surface again as "950").
  let rest = text;
  for (const m of text.matchAll(EURO_MARKED)) {
    const digits = m[0].replace(/\D/g, "");
    if (digits) found.push(digits);
    rest = rest.replace(m[0], " ");
  }
  for (const m of rest.matchAll(BARE_NUMBER)) {
    const raw = m[0];
    if (YEAR_SHAPE.test(raw)) continue; // years echo dates, not prices
    found.push(raw);
  }
  return found;
}

// ---------------------------------------------------------------- style guard

const EM_DASH = "—";

/** The product's punctuation rule: commas, periods, parentheses, colons only. */
export function containsEmDash(text: string): boolean {
  return text.includes(EM_DASH);
}

// ------------------------------------------------------- availability guard

/**
 * Phrases that read as an availability claim, both languages. Word-bounded
 * where a substring would over-match ("vrijblijvend" is fine; "nog vrij" is
 * not).
 */
export const AVAILABILITY_PATTERNS: RegExp[] = [
  /beschikbaar/i,
  /\bvrij\b/i,
  /\bnog vrije?\b/i,
  /\bavailable\b/i,
  /\bavailability\b/i,
  /open in my calendar/i,
  /\bdate is (still )?open\b/i,
  /\bnog open\b/i,
  /\bhave an opening\b/i,
];

// ------------------------------------------------------------- validation

export interface DraftContext {
  kind: "reply" | "nudge";
  packages: readonly PromptPackage[];
}

export function validateFrontdeskDraft(
  body: string,
  ctx: DraftContext
): { ok: boolean; reason?: string } {
  const text = body.trim();
  if (!text) return { ok: false, reason: "empty" };
  if (text.length > 2500) return { ok: false, reason: "too-long" };

  const words = text.split(/\s+/).length;
  if (ctx.kind === "reply" && (words < 40 || words > 160)) {
    return { ok: false, reason: `reply-length-${words}-words-outside-60-120-target` };
  }
  if (ctx.kind === "nudge" && (words < 15 || words > 90)) {
    return { ok: false, reason: `nudge-length-${words}-words-outside-30-60-target` };
  }

  for (const pattern of AVAILABILITY_PATTERNS) {
    if (pattern.test(text)) {
      return { ok: false, reason: `availability-claim:${pattern.source}` };
    }
  }

  if (containsEmDash(text)) {
    return { ok: false, reason: "em-dash" };
  }

  const allowed = packagePriceDigits(ctx.packages);
  for (const amount of findPriceLikeAmounts(text)) {
    if (!allowed.has(amount)) {
      return { ok: false, reason: `price-not-in-packages:${amount}` };
    }
  }

  return { ok: true };
}
