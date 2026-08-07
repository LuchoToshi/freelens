import { createClient } from "@supabase/supabase-js";
import { rankQueue } from "@/lib/rebooking/ranking";
import { SEASONALITY_NL_V1 } from "@/lib/rebooking/seasonality";
import { reasonTextFor } from "@/lib/rebooking/reasonText";
import { generateDraft, DraftGenerationError } from "@/lib/rebooking/generateDraft";
import { salutationFor } from "@/lib/rebooking/salutation";
import type { Craft, Relationship } from "@/lib/rebooking/types";

/**
 * Draft generation, the only server round-trip in the app.
 *
 * Auth: the caller's Supabase access token, validated by asking the auth
 * server who it belongs to. Data: fetched with a client bound to that same
 * token, so RLS applies to this route exactly as it applies in the browser —
 * the service key is deliberately not used here.
 *
 * The reason is recomputed server-side by the same deterministic engine the
 * queue uses; the client names a relationship, never a reason, so a tampered
 * request cannot make the product claim an anniversary that is not there.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 401 });

  const asUser = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await asUser.auth.getUser(jwt);
  if (userError || !userData?.user) return Response.json({ ok: false }, { status: 401 });

  let body: { relationshipId?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const locale = body.locale === "nl" ? "nl" : "en";
  if (!body.relationshipId) return Response.json({ ok: false }, { status: 400 });

  const { data: row } = await asUser
    .from("relationships")
    .select("*")
    .eq("id", body.relationshipId)
    .maybeSingle();
  if (!row) return Response.json({ ok: false }, { status: 404 });

  const { data: voiceRow } = await asUser
    .from("voice_profiles")
    .select("*")
    .maybeSingle();
  const craft: Craft = (voiceRow?.craft as Craft) ?? "other";

  const relationship: Relationship = {
    id: row.id,
    userId: row.user_id,
    clientName: row.client_name,
    clientEmail: row.client_email ?? undefined,
    company: row.company ?? undefined,
    clientType: row.client_type ?? undefined,
    lastProjectTitle: row.last_project_title ?? undefined,
    lastProjectDate: row.last_project_date ?? undefined,
    approxValueCents: row.approx_value_cents ?? undefined,
    notes: row.notes ?? undefined,
    temperature: row.temperature,
    snoozedUntil: row.snoozed_until ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const today = new Date().toISOString().slice(0, 10);
  const [ranked] = rankQueue({
    relationships: [relationship],
    craft,
    config: SEASONALITY_NL_V1,
    today,
  });
  const suggestion = ranked ?? {
    relationshipId: relationship.id,
    reasonCode: "manual" as const,
    monthsSince: undefined,
    seasonReason: undefined,
    score: 0,
  };
  const reasonText = reasonTextFor(suggestion, relationship, locale);

  try {
    const draft = await generateDraft({
      relationship,
      suggestion: { ...suggestion, reasonCode: suggestion.reasonCode as never },
      reasonText,
      voice: {
        craft,
        greeting: voiceRow?.greeting ?? undefined,
        signoff: voiceRow?.signoff ?? undefined,
        formality: voiceRow?.formality ?? undefined,
        styleNotes: voiceRow?.style_notes ?? undefined,
      },
      salutation: salutationFor({
        clientName: relationship.clientName,
        formality: (voiceRow?.formality as "je" | "u" | undefined) ?? "je",
        locale,
        greetingOverride: voiceRow?.greeting ?? undefined,
      }),
      locale,
    });

    const { data: touch } = await asUser
      .from("touches")
      .insert({
        user_id: userData.user.id,
        relationship_id: relationship.id,
        reason_code: suggestion.reasonCode,
        reason_text: reasonText,
        draft_subject: draft.subject,
        draft_body: draft.body,
        status: "suggested",
      })
      .select("id")
      .single();

    return Response.json({
      ok: true,
      touchId: touch?.id ?? null,
      reasonText,
      subject: draft.subject,
      body: draft.body,
    });
  } catch (error) {
    const attempts = error instanceof DraftGenerationError ? error.attempts : 0;
    console.error("draft: generation failed", attempts);
    return Response.json({ ok: false }, { status: 502 });
  }
}
