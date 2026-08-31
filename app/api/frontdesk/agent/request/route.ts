import { asUserClient, serviceClient } from "@/lib/frontdesk/server/clients";
import { understandRequest } from "@/lib/frontdesk/server/agentRequest";

/**
 * RequestBar → work object (addendum §2.3). Understanding is always safe:
 * this route reads, classifies, and stores — it executes nothing. A plan
 * waits in status `plan` for the explicit approve call; answers, clarifying
 * questions and honest can't-do land as `done`/`needs_you` immediately.
 */
export const maxDuration = 300;

export async function POST(request: Request) {
  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 401 });
  const asUser = asUserClient(jwt);
  const { data: userData, error: userError } = await asUser.auth.getUser(jwt);
  if (userError || !userData?.user) return Response.json({ ok: false }, { status: 401 });

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const text = String(body.text ?? "").trim();
  if (!text || text.length > 2000) return Response.json({ ok: false }, { status: 400 });

  const { data: freelancer } = await asUser
    .from("freelancers")
    .select("id, locale")
    .maybeSingle();
  if (!freelancer) return Response.json({ ok: false }, { status: 404 });

  const understanding = await understandRequest(
    freelancer.id,
    text,
    freelancer.locale === "nl" ? "nl" : "en"
  );
  if (!understanding) {
    console.log("frontdesk/agent-request: understanding_failed");
    return Response.json({ ok: false, reason: "understanding_failed" }, { status: 502 });
  }

  const db = serviceClient();
  const status =
    understanding.kind === "plan"
      ? "plan"
      : understanding.kind === "answer"
        ? "done"
        : "needs_you";
  const { data: workObject, error } = await db
    .from("agent_work_objects")
    .insert({
      freelancer_id: freelancer.id,
      request_text: text,
      read_as: understanding.read_as,
      status,
      steps: understanding.steps ?? [],
      needs: understanding.clarify_question ?? understanding.cannot_reason ?? null,
      result:
        understanding.kind === "answer"
          ? { summary: understanding.answer, sources: ["account"] }
          : null,
    })
    .select("*")
    .single();
  if (error || !workObject) {
    console.error("frontdesk/agent-request: insert_failed");
    return Response.json({ ok: false }, { status: 500 });
  }

  console.log(`frontdesk/agent-request: ${understanding.kind}`);
  return Response.json({ ok: true, workObject });
}
