import { asUserClient } from "@/lib/frontdesk/server/clients";
import { generateAndStoreDraft } from "@/lib/frontdesk/server/draftPipeline";
import { fdDict } from "@/lib/frontdesk/i18n";

/**
 * The seeded practice inquiry. Idempotent: one sample per freelancer, ever —
 * calling again returns the existing one with its latest draft.
 *
 * The sample's client_email is the freelancer's OWN auth email, so the
 * regular Send flow can only ever mail themselves. The draft goes through
 * the exact production pipeline — same guards, same retries; if generation
 * fails the response carries draft:null and the caller shows the pending
 * state, never a canned fake.
 */
export const maxDuration = 300;

/** Roughly four months out, on the 15th: a plausible wedding-planning horizon. */
function sampleEventDate(): string {
  const d = new Date();
  const target = new Date(d.getFullYear(), d.getMonth() + 4, 15);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-15`;
}

export async function POST(request: Request) {
  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 401 });

  const asUser = asUserClient(jwt);
  const { data: userData, error: userError } = await asUser.auth.getUser(jwt);
  if (userError || !userData?.user?.email) return Response.json({ ok: false }, { status: 401 });

  const { data: freelancer } = await asUser
    .from("freelancers")
    .select("id, locale")
    .maybeSingle();
  if (!freelancer) return Response.json({ ok: false }, { status: 404 });

  async function respondWith(inquiryId: string) {
    const { data: inquiry } = await asUser
      .from("inquiries")
      .select("id, client_name, client_email, event_date, event_type, budget_band, message, status, source")
      .eq("id", inquiryId)
      .single();
    const { data: drafts } = await asUser
      .from("drafts")
      .select("id, body, kind, language")
      .eq("inquiry_id", inquiryId)
      .order("created_at", { ascending: false })
      .limit(1);
    return Response.json({ ok: true, inquiry, draft: drafts?.[0] ?? null });
  }

  // Idempotence: the sample exists once.
  const { data: existing } = await asUser
    .from("inquiries")
    .select("id")
    .eq("freelancer_id", freelancer.id)
    .eq("source", "sample")
    .maybeSingle();
  if (existing) return respondWith(existing.id);

  const t = fdDict(freelancer.locale).sample;
  const { data: created, error: insertError } = await asUser
    .from("inquiries")
    .insert({
      freelancer_id: freelancer.id,
      source: "sample",
      client_name: t.clientName,
      client_email: userData.user.email,
      event_date: sampleEventDate(),
      event_type: "wedding",
      budget_band: "1000-2500",
      message: t.message,
      status: "new",
    })
    .select("id")
    .single();
  if (insertError || !created) {
    console.error("frontdesk/sample: insert_failed");
    return Response.json({ ok: false }, { status: 500 });
  }

  // Synchronous by design: the reveal step is waiting on this draft.
  const outcome = await generateAndStoreDraft(created.id, "reply");
  console.log(`frontdesk/sample: created draft:${outcome}`);
  return respondWith(created.id);
}
