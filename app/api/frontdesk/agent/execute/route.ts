import { asUserClient, serviceClient } from "@/lib/frontdesk/server/clients";
import { isPermitted } from "@/lib/frontdesk/permissions";
import { generateAndStoreDraft } from "@/lib/frontdesk/server/draftPipeline";
import type { AgentStep } from "@/lib/frontdesk/server/agentRequest";

/**
 * Approve-plan execution (addendum §2.3). Runs a work object's steps within
 * permissions: every step re-checks `isPermitted` here, server-side, so the
 * ceilings hold no matter what the stored plan claims (§2.2). Drafts land in
 * Needs you (the inbox queues); the work object records per-step outcomes.
 * Also handles pause / resume / cancel — cancel never deletes the record.
 */
export const maxDuration = 300;

export async function POST(request: Request) {
  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 401 });
  const asUser = asUserClient(jwt);
  const { data: userData, error: userError } = await asUser.auth.getUser(jwt);
  if (userError || !userData?.user) return Response.json({ ok: false }, { status: 401 });

  let body: { id?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const id = String(body.id ?? "");
  const action = String(body.action ?? "");
  if (!id || !["approve", "pause", "resume", "cancel"].includes(action)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  // RLS answers ownership; a foreign work object reads as absent.
  const { data: workObject } = await asUser
    .from("agent_work_objects")
    .select("id, freelancer_id, status, steps")
    .eq("id", id)
    .maybeSingle();
  if (!workObject) return Response.json({ ok: false }, { status: 404 });

  const db = serviceClient();

  if (action === "pause" || action === "resume" || action === "cancel") {
    const next =
      action === "pause" ? "paused" : action === "resume" ? "plan" : "failed";
    const patch: Record<string, unknown> = { status: next, updated_at: new Date().toISOString() };
    if (action === "cancel") {
      patch.result = { summary: "cancelled", sources: [] };
    }
    await db.from("agent_work_objects").update(patch).eq("id", workObject.id);
    console.log(`frontdesk/agent-execute: ${action}`);
    return Response.json({ ok: true });
  }

  if (workObject.status !== "plan") {
    return Response.json({ ok: false, reason: "not_approvable" }, { status: 409 });
  }

  const { data: freelancer } = await db
    .from("freelancers")
    .select("permission_levels")
    .eq("id", workObject.freelancer_id)
    .maybeSingle();
  const levels = (freelancer?.permission_levels ?? null) as Record<string, unknown> | null;

  await db
    .from("agent_work_objects")
    .update({ status: "working", updated_at: new Date().toISOString() })
    .eq("id", workObject.id);

  const steps = (workObject.steps as AgentStep[]) ?? [];
  let prepared = 0;
  for (const step of steps) {
    const permAction = step.action === "prepare_followup" ? "prepare_followup" : "prepare_reply";
    if (!isPermitted(permAction, 3, levels)) {
      step.state = "skipped";
      step.note = "not_permitted";
      continue;
    }
    const outcome = await generateAndStoreDraft(
      step.inquiry_id,
      step.action === "prepare_followup" ? "nudge" : "reply"
    );
    if (outcome === "stored") {
      step.state = "done";
      prepared++;
    } else {
      step.state = "failed";
      step.note = outcome;
    }
  }

  const allFailed = steps.length > 0 && steps.every((s) => s.state === "failed" || s.state === "skipped");
  await db
    .from("agent_work_objects")
    .update({
      status: allFailed ? "failed" : "needs_you",
      steps,
      result: { summary: `prepared:${prepared}`, sources: ["drafts"] },
      updated_at: new Date().toISOString(),
    })
    .eq("id", workObject.id);

  console.log(`frontdesk/agent-execute: approved prepared:${prepared} of:${steps.length}`);
  return Response.json({ ok: true, prepared, total: steps.length });
}
