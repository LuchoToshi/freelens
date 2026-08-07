/**
 * The salutation, decided by rules, not by the model.
 *
 * The teardown found drafts opening with "Hoi Studio Vondel," — a company
 * addressed as a person. The fix is deterministic: this function computes the
 * exact opening line before generation, and the prompt orders the model to use
 * it verbatim. A company name never reaches a greeting again.
 */
export const BUSINESS_KEYWORDS = [
  "studio",
  "bakkerij",
  "bureau",
  "agency",
  "bv",
  "b.v.",
  "shop",
  "winkel",
  "atelier",
  "salon",
  "groep",
  "media",
];

export interface SalutationInput {
  clientName: string;
  /** First name of the contact person, when known. Wins over everything. */
  contactName?: string;
  formality: "je" | "u";
  locale: "en" | "nl";
  /** The user's own greeting word ("Hey", "Hoi"), overriding the default. */
  greetingOverride?: string;
}

function greetingWord(input: SalutationInput): string {
  const override = input.greetingOverride?.trim().replace(/,$/, "");
  if (override) return override;
  if (input.locale === "nl") return input.formality === "u" ? "Beste" : "Hoi";
  return input.formality === "u" ? "Dear" : "Hi";
}

function looksLikeBusiness(name: string): boolean {
  const words = name.toLowerCase().split(/\s+/);
  return words.some((w) => BUSINESS_KEYWORDS.includes(w.replace(/[.,]+$/, "") ) || BUSINESS_KEYWORDS.includes(w));
}

/**
 * Rules, in order: a given contact first name; else the first word of a one-
 * or two-word client name with no business keyword; else no name at all.
 */
export function salutationFor(input: SalutationInput): string {
  const word = greetingWord(input);
  const contact = input.contactName?.trim().split(/\s+/)[0];
  if (contact) return `${word} ${contact},`;

  const name = input.clientName.trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 1 && parts.length <= 2 && !looksLikeBusiness(name)) {
    return `${word} ${parts[0]},`;
  }
  return `${word},`;
}
