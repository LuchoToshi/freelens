import { asUserClient } from "@/lib/frontdesk/server/clients";
import { generateAndStoreDraft } from "@/lib/frontdesk/server/draftPipeline";
import { CUSTOM_ADJUSTMENT_MAX } from "@/lib/frontdesk/toneAdjustments";

/**
 * The manual recovery path when after() generation failed (or the freelancer
 * wants a fresh reply draft). Bearer-JWT pattern: ownership is proven by an
 * RLS-scoped read — if the caller can see the inquiry, it is theirs.
 */
export const maxDuration = 300;

export async function POST(request: Request) {
  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 401 });

  const asUser = asUserClient(jwt);
  const { data: userData, error: userError } = await asUser.auth.getUser(jwt);
  if (userError || !userData?.user) return Response.json({ ok: false }, { status: 401 });

  let body: { inquiryId?: string; kind?: string; adjustment?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (!body.inquiryId) return Response.json({ ok: false }, { status: 400 });
  const kind = body.kind === "nudge" ? "nudge" : "reply";
  // A steer is either one of the fixed choices or the freelancer's own note,
  // capped. It reaches the prompt as a request about wording; the guards run
  // on whatever comes back, so it cannot buy a draft past them.
  const adjustment =
    typeof body.adjustment === "string" && body.adjustment.trim()
      ? body.adjustment.trim().slice(0, CUSTOM_ADJUSTMENT_MAX)
      : null;

  // RLS answers the ownership question: a foreign inquiry reads as absent.
  const { data: inquiry } = await asUser
    .from("inquiries")
    .select("id")
    .eq("id", body.inquiryId)
    .maybeSingle();
  if (!inquiry) return Response.json({ ok: false }, { status: 404 });

  const outcome = await generateAndStoreDraft(inquiry.id, kind, adjustment);
  console.log(`frontdesk/regenerate: ${outcome}`);
  return outcome === "stored"
    ? Response.json({ ok: true })
    : Response.json({ ok: false, reason: outcome }, { status: 502 });
}
