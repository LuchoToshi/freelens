/**
 * Inquiry → stored draft, in one place. Called from after() on submit, from
 * the authed regenerate route, and from the nudge cron — all three go through
 * this exact path, so the rules hold everywhere:
 *
 *   - refuses to run without a usable voice profile (no profile, no draft —
 *     the inbox shows a pending state instead of a generic robot reply)
 *   - the client's email address is read from the row but NEVER passed on;
 *     the prompt input has no field for it
 *   - reply language = the inquiry message's language, freelancer locale
 *     as fallback
 *   - logs outcome codes only
 */
import { serviceClient } from "@/lib/frontdesk/server/clients";
import { detectLanguage } from "@/lib/frontdesk/draftGuards";
import { DRAFT_PROMPT_VERSION, type PromptPackage } from "@/lib/frontdesk/prompts";
import {
  FrontdeskGenerationError,
  generateFrontdeskDraft,
} from "@/lib/frontdesk/generateDraft";

export type PipelineOutcome =
  | "stored"
  | "no_voice_profile"
  | "inquiry_not_found"
  | "generation_failed";

export async function generateAndStoreDraft(
  inquiryId: string,
  kind: "reply" | "nudge"
): Promise<PipelineOutcome> {
  const db = serviceClient();

  const { data: inquiry } = await db
    .from("inquiries")
    .select("id, freelancer_id, client_name, event_type, event_date, budget_band, message")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!inquiry) return "inquiry_not_found";

  const { data: freelancer } = await db
    .from("freelancers")
    .select("id, display_name, sign_off, locale, voice_profile")
    .eq("id", inquiry.freelancer_id)
    .maybeSingle();
  if (!freelancer?.voice_profile) return "no_voice_profile";

  const { data: packageRows } = await db
    .from("packages")
    .select("label, price_from_eur, unit, notes")
    .eq("freelancer_id", freelancer.id)
    .order("position");
  const packages: PromptPackage[] = (packageRows ?? []).map((p) => ({
    label: p.label,
    priceFromEur: Number(p.price_from_eur),
    unit: p.unit,
    notes: p.notes,
  }));

  const language = detectLanguage(inquiry.message, freelancer.locale === "en" ? "en" : "nl");

  try {
    const body = await generateFrontdeskDraft({
      kind,
      voiceProfile: freelancer.voice_profile,
      packages,
      inquiry: {
        clientFirstName: String(inquiry.client_name).trim().split(/\s+/)[0] ?? "",
        eventType: inquiry.event_type,
        eventDate: inquiry.event_date,
        budgetBand: inquiry.budget_band,
        message: inquiry.message,
      },
      displayName: freelancer.display_name,
      signOff: freelancer.sign_off,
      targetLanguage: language,
    });

    const { error } = await db.from("drafts").insert({
      inquiry_id: inquiry.id,
      freelancer_id: freelancer.id,
      kind,
      body,
      language,
      prompt_version: DRAFT_PROMPT_VERSION,
    });
    if (error) {
      console.error("frontdesk/pipeline: draft_store_failed");
      return "generation_failed";
    }
    return "stored";
  } catch (error) {
    if (error instanceof FrontdeskGenerationError) {
      console.error(`frontdesk/pipeline: generation_failed attempts:${error.attempts}`);
    } else {
      console.error("frontdesk/pipeline: generation_failed unexpected");
    }
    return "generation_failed";
  }
}
