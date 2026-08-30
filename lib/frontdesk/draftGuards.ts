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
  const add = (price: number) => {
    digits.add(String(Math.trunc(price)));
    digits.add(String(price).replace(/\D/g, ""));
  };
  for (const p of packages) {
    add(p.priceFromEur);
    for (const addon of p.addons ?? []) add(addon.priceEur);
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

// eslint-disable-next-line no-restricted-syntax -- this is the detector, not content
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
  /** ISO event date from the inquiry, when given. Enables the date-consistency check. */
  eventDate?: string | null;
  /** The freelancer's configured sign-off, when set. Loosens nothing; a generic closing also passes. */
  signOff?: string | null;
}

/** Structured verdict (master spec §10.5): every failed check, not just the first. */
export interface DraftValidationResult {
  ok: boolean;
  failures: string[];
}

// Greetings and closings, both languages. Deterministic and unit-testable,
// like every other guard: the prompt states these rules, this enforces them.
const GREETING_LINE = /^(hi|hey|hello|dear|hoi|hallo|ha|beste|dag|goedemorgen|goedemiddag|goedenavond)\b/i;
const CLOSING_LINE =
  /\b(groetjes|groet(en)?|gr\.?|met vriendelijke groet(en)?|mvg|liefs|hartelijke groet(en)?|warme groet(en)?|tot (snel|dan|gauw)|best( regards| wishes)?|kind regards|warm(ly| regards)?|regards|cheers|thanks|thank you|talk soon|sincerely|ciao)\b/i;
const PLACEHOLDER_SHAPES: RegExp[] = [
  /\{\{[^}]*\}\}/, // {{client_name}}
  /\[[^\]\n]{1,40}\]/, // [X], [vul in: datum]
  /\bTODO\b/,
];
const YEAR_MENTION = /\b(19|20)\d{2}\b/g;

/**
 * A line that reads as a sign-off: the configured one, a closing formula, or
 * a bare name ("Emma") — short, no digits, not a sentence or question.
 */
function isSignoffLine(line: string, configured?: string | null): boolean {
  const l = line.trim();
  if (!l) return false;
  if (configured && l.toLowerCase().includes(configured.toLowerCase())) return true;
  const words = l.split(/\s+/);
  // A closing formula counts only on a line short enough to BE a closing.
  // "Weddings are what I do best." contains "best" and is prose, not a
  // sign-off; gating on length keeps content lines out of the stripper.
  if (words.length <= 6 && l.length <= 60 && CLOSING_LINE.test(l)) return true;
  return words.length <= 4 && l.length <= 40 && !/\d/.test(l) && !/[?!.:]$/.test(l);
}

function lines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * The full deterministic check set. Collects every failure so the stored
 * verdict can name all of them at once (§10.7) instead of surfacing one per
 * regeneration round-trip.
 */
export function validateFrontdeskDraftFull(
  body: string,
  ctx: DraftContext
): DraftValidationResult {
  const failures: string[] = [];
  const text = body.trim();
  if (!text) return { ok: false, failures: ["empty"] };
  if (text.length > 2500) failures.push("too-long");

  const words = text.split(/\s+/).length;
  if (ctx.kind === "reply" && (words < 40 || words > 160)) {
    failures.push(`reply-length-${words}-words-outside-60-120-target`);
  }
  if (ctx.kind === "nudge" && (words < 15 || words > 90)) {
    failures.push(`nudge-length-${words}-words-outside-30-60-target`);
  }

  for (const pattern of AVAILABILITY_PATTERNS) {
    if (pattern.test(text)) {
      failures.push(`availability-claim:${pattern.source}`);
      break; // one named pattern is enough to act on
    }
  }

  if (containsEmDash(text)) failures.push("em-dash");

  const allowed = packagePriceDigits(ctx.packages);
  for (const amount of findPriceLikeAmounts(text)) {
    if (!allowed.has(amount)) {
      failures.push(`price-not-in-packages:${amount}`);
      break;
    }
  }

  for (const shape of PLACEHOLDER_SHAPES) {
    if (shape.test(text)) {
      failures.push("unresolved-placeholder");
      break;
    }
  }

  const rows = lines(text);
  const greetingOk = rows.length > 0 && GREETING_LINE.test(rows[0]);
  if (!greetingOk) failures.push("greeting-missing");

  // Sign-off: replies are expected to close. The freelancer's configured
  // sign-off counts, and so does any recognizable closing formula.
  if (ctx.kind === "reply") {
    const signOffOk = rows.slice(-2).some((row) => isSignoffLine(row, ctx.signOff));
    if (!signOffOk) failures.push("signoff-missing");
  }

  // Minimum usefulness (DEC-13, safe default): after the greeting phrase and
  // any closing lines, something of substance must remain. A greeting plus a
  // sign-off is not a reply. Phrase, not line: "Hoi Sanne! Nog even over
  // jullie bruiloft..." is a one-line nudge whose greeting is two words, not
  // the whole line.
  let substanceRows = [...rows];
  while (
    substanceRows.length > 0 &&
    isSignoffLine(substanceRows[substanceRows.length - 1], ctx.signOff)
  ) {
    substanceRows = substanceRows.slice(0, -1);
  }
  let substance = substanceRows.join(" ");
  if (greetingOk) {
    // Drop the greeting phrase: from the greeting word up to its first
    // sentence-ending punctuation (or comma), at most a short name's worth.
    substance = substance.replace(/^[^.!?,\n]{0,40}[.!?,]\s*/, "");
  }
  const middleWords = substance.split(/\s+/).filter(Boolean).length;
  if (middleWords < (ctx.kind === "reply" ? 12 : 8)) failures.push("body-only-greeting");

  // Date consistency: when the inquiry names an event date, any year the
  // draft mentions must be that event's year. Never silently repaired — a
  // wrong year fails the draft and the retry rewrites it.
  if (ctx.eventDate) {
    const eventYear = ctx.eventDate.slice(0, 4);
    for (const m of text.matchAll(YEAR_MENTION)) {
      // The mirror of the price guard's year exclusion: a number that IS a
      // configured package price ("1950 euro") is a price mention here, not
      // a year, and must not trip the date check.
      if (allowed.has(m[0])) continue;
      if (m[0] !== eventYear) {
        failures.push(`date-mismatch:${m[0]}`);
        break;
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

/**
 * Single-reason wrapper kept for the retry loop's feedback message. Runs the
 * full check set, so the loop now also corrects greetings, sign-offs,
 * placeholders and date mismatches — not only the original three rules.
 */
export function validateFrontdeskDraft(
  body: string,
  ctx: DraftContext
): { ok: boolean; reason?: string } {
  const { ok, failures } = validateFrontdeskDraftFull(body, ctx);
  return ok ? { ok } : { ok, reason: failures.join("; ") };
}

// -------------------------------------------------- stored validation status

export type DraftValidationStatus = "pending" | "ready_for_review" | "needs_review" | "failed";

/** Failures a freelancer resolves outside the draft body (nothing for the model to retry). */
const SOFT_FAILURES = new Set(["recipient-missing"]);

export function deriveValidationStatus(failures: readonly string[]): DraftValidationStatus {
  if (failures.length === 0) return "ready_for_review";
  return failures.every((f) => SOFT_FAILURES.has(f)) ? "needs_review" : "failed";
}
