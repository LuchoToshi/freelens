import { asUserClient } from "@/lib/frontdesk/server/clients";
import { generateAndStoreDraft } from "@/lib/frontdesk/server/draftPipeline";

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

  let body: { inquiryId?: string; kind?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (!body.inquiryId) return Response.json({ ok: false }, { status: 400 });
  const kind = body.kind === "nudge" ? "nudge" : "reply";

  // RLS answers the ownership question: a foreign inquiry reads as absent.
  const { data: inquiry } = await asUser
    .from("inquiries")
    .select("id")
    .eq("id", body.inquiryId)
    .maybeSingle();
  if (!inquiry) return Response.json({ ok: false }, { status: 404 });

  const outcome = await generateAndStoreDraft(inquiry.id, kind);
  console.log(`frontdesk/regenerate: ${outcome}`);
  return outcome === "stored"
    ? Response.json({ ok: true })
    : Response.json({ ok: false, reason: outcome }, { status: 502 });
}
