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
import {
  detectLanguage,
  deriveValidationStatus,
  validateFrontdeskDraftFull,
} from "@/lib/frontdesk/draftGuards";
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
    .select(
      "id, freelancer_id, client_name, client_email, event_type, event_date, budget_band, message"
    )
    .eq("id", inquiryId)
    .maybeSingle();
  if (!inquiry) return "inquiry_not_found";
  // client_email is checked for PRESENCE only (recipient-missing verdict).
  // It is never passed toward the prompt input, which has no field for it.
  const hasRecipient = Boolean(String(inquiry.client_email ?? "").trim());

  const { data: freelancer } = await db
    .from("freelancers")
    .select("id, display_name, sign_off, locale, voice_profile")
    .eq("id", inquiry.freelancer_id)
    .maybeSingle();
  if (!freelancer?.voice_profile) return "no_voice_profile";

  const { data: packageRows } = await db
    .from("packages")
    .select("label, price_from_eur, unit, notes, addons")
    .eq("freelancer_id", freelancer.id)
    .order("position");
  const packages: PromptPackage[] = (packageRows ?? []).map((p) => ({
    label: p.label,
    priceFromEur: Number(p.price_from_eur),
    unit: p.unit,
    notes: p.notes,
    addons: Array.isArray(p.addons)
      ? (p.addons as { label?: unknown; price_eur?: unknown }[])
          .filter((a) => typeof a.label === "string" && typeof a.price_eur === "number")
          .map((a) => ({ label: a.label as string, priceEur: a.price_eur as number }))
      : [],
  }));

  const language = detectLanguage(inquiry.message, freelancer.locale === "en" ? "en" : "nl");

  const startedAt = Date.now();
  try {
    const { body, attempts } = await generateFrontdeskDraft({
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
    const latencyMs = Date.now() - startedAt;

    // Server-side verdict at the write, independent of the generator's own
    // loop: the stored status must reflect the stored body (§10.5), and the
    // recipient check only exists here -- the model cannot fix a missing
    // email address, so it is not part of the retry.
    const verdict = validateFrontdeskDraftFull(body, {
      kind,
      packages,
      eventDate: inquiry.event_date,
      signOff: freelancer.sign_off,
    });
    const failures = [...verdict.failures];
    if (!hasRecipient) failures.push("recipient-missing");

    const { error } = await db.from("drafts").insert({
      inquiry_id: inquiry.id,
      freelancer_id: freelancer.id,
      kind,
      body,
      language,
      prompt_version: DRAFT_PROMPT_VERSION,
      validation_status: deriveValidationStatus(failures),
      validation_failures: failures,
      validated_at: new Date().toISOString(),
    });
    if (error) {
      console.error(
        `frontdesk/pipeline: draft_store_failed latency_ms:${latencyMs} attempts:${attempts}`
      );
      return "generation_failed";
    }
    console.log(`frontdesk/pipeline: stored latency_ms:${latencyMs} attempts:${attempts}`);
    return "stored";
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    if (error instanceof FrontdeskGenerationError) {
      console.error(
        `frontdesk/pipeline: generation_failed latency_ms:${latencyMs} attempts:${error.attempts}`
      );
      // Persist the failure as a first-class state (§10.7): empty body so a
      // never-valid draft is not viewable, named failures so the inbox can
      // say which checks did not pass instead of showing a silent pending box.
      await db.from("drafts").insert({
        inquiry_id: inquiry.id,
        freelancer_id: freelancer.id,
        kind,
        body: "",
        language,
        prompt_version: DRAFT_PROMPT_VERSION,
        validation_status: "failed",
        validation_failures: error.failures.length ? error.failures : ["generation-failed"],
        validated_at: new Date().toISOString(),
      });
    } else {
      console.error(`frontdesk/pipeline: generation_failed latency_ms:${latencyMs} unexpected`);
    }
    return "generation_failed";
  }
}
