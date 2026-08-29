import type { FrontdeskLocale } from "@/lib/frontdesk/i18n";
import type { PromptPackage, VoiceProfile } from "@/lib/frontdesk/prompts";

/**
 * The demo's one hardcoded persona. Feeds `generateFrontdeskDraft` the exact
 * same shape a real freelancer's own voice profile and packages would, so
 * the demo output reads like the product, not a mockup with placeholder text.
 *
 * Nothing here is configurable or user-supplied — the demo has one fixed
 * inquiry and one fixed voice, by design (spec §3): the point is showing the
 * loop, not letting a visitor drive arbitrary prompt input through a public,
 * no-auth endpoint.
 *
 * Voice profile and packages are locale-keyed: they're fed to the model as
 * literal exemplar text (greeting, closing habit, package copy), so an
 * English fixture bleeds English words into an otherwise-Dutch draft.
 */
export const DEMO_DISPLAY_NAME = "Sam";
export const DEMO_SIGN_OFF = "Sam";
export const DEMO_CLIENT_FIRST_NAME = "Lisa";
export const DEMO_EVENT_TYPE = "wedding";
export const DEMO_BUDGET_BAND = "1000-2500";

const DEMO_VOICE_PROFILES: Record<FrontdeskLocale, VoiceProfile> = {
  en: {
    tone: "warm and professional",
    formality: "neutral",
    sentence_length: "medium",
    emoji: "rare",
    greeting_style: "Hi {first name}!",
    closing_habit: "always suggests a short call to talk through the day",
    sign_off: DEMO_SIGN_OFF,
    language_notes: "",
    quirks: [],
  },
  nl: {
    tone: "warm en professioneel",
    formality: "neutral",
    sentence_length: "medium",
    emoji: "rare",
    greeting_style: "Hoi {first name}!",
    closing_habit: "stelt altijd een kort belletje voor om de dag door te nemen",
    sign_off: DEMO_SIGN_OFF,
    language_notes: "",
    quirks: [],
  },
};

const DEMO_PACKAGES_BY_LOCALE: Record<FrontdeskLocale, PromptPackage[]> = {
  en: [
    { label: "Full day wedding", priceFromEur: 1800, unit: null, notes: "8 hours coverage, edited gallery" },
    { label: "Half day wedding", priceFromEur: 1100, unit: null, notes: "4 hours coverage, edited gallery" },
  ],
  nl: [
    { label: "Hele dag bruiloft", priceFromEur: 1800, unit: null, notes: "8 uur aanwezig, bewerkte galerij" },
    { label: "Halve dag bruiloft", priceFromEur: 1100, unit: null, notes: "4 uur aanwezig, bewerkte galerij" },
  ],
};

export function demoVoiceProfile(locale: FrontdeskLocale): VoiceProfile {
  return DEMO_VOICE_PROFILES[locale];
}

export function demoPackages(locale: FrontdeskLocale): PromptPackage[] {
  return DEMO_PACKAGES_BY_LOCALE[locale];
}

/** Roughly four months out, on the 15th — mirrors the onboarding sample route's horizon. */
export function demoEventDate(): string {
  const d = new Date();
  const target = new Date(d.getFullYear(), d.getMonth() + 4, 15);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-15`;
}
