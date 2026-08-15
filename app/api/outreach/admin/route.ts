import {
  listDrafts,
  getMessage,
  markApprovedAndSent,
  markRejected,
  createDraft,
} from "@/lib/server/outreach/db";
import { sendOutreachMessage } from "@/lib/server/outreach/gmail";
import { syncWaitlistCandidates } from "@/lib/server/outreach/waitlistSource";
import { syncPendingReplies } from "@/lib/server/outreach/sync";

const APPROVERS = ["product-manager", "researcher"] as const;
type Approver = (typeof APPROVERS)[number];

/**
 * Approve/reject surface for the outreach tool. Approvers are agents (PM or
 * Researcher), not a browser-authenticated founder, so this does not reuse
 * the FrontDesk ADMIN_EMAILS/Supabase-JWT pattern — there is no login flow
 * for an agent to hold a session in. Gate is a shared secret, same shape as
 * CRON_SECRET; the approver's identity is a self-declared field in the body,
 * recorded for the audit trail but not independently verified. Acceptable at
 * this trust level: both agents already have direct write access to this
 * repo and its production data.
 *
 * Scoped approval, per Shrf: this trust model holds for *this* tool at *this*
 * volume — a handful of recruiting emails from a Freelens-owned account, no
 * customer data, no money. If this ever sends to customers, at higher
 * volume, or touches anything sensitive, self-declared identity stops being
 * good enough and this needs real per-approver auth. Don't let it drift into
 * the permanent pattern by default.
 *
 * GET lists every draft/sent/replied message. POST approves (sends via Gmail)
 * or rejects one. There is no bulk-send path on purpose — every message goes
 * out one at a time, one explicit call.
 */
function requireSecret(request: Request): boolean {
  const secret = process.env.OUTREACH_ADMIN_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  return Boolean(secret) && auth === `Bearer ${secret}`;
}

function asApprover(value: unknown): Approver | null {
  return typeof value === "string" && (APPROVERS as readonly string[]).includes(value)
    ? (value as Approver)
    : null;
}

export async function GET(request: Request) {
  if (!requireSecret(request)) return Response.json({ ok: false }, { status: 404 });
  await syncPendingReplies();
  const drafts = await listDrafts();
  return Response.json({ ok: true, messages: drafts });
}

export async function POST(request: Request) {
  if (!requireSecret(request)) return Response.json({ ok: false }, { status: 404 });

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "sync-waitlist") {
    const result = await syncWaitlistCandidates();
    return Response.json({ ok: true, ...result });
  }

  if (action === "create-draft") {
    const contactId = typeof body?.contactId === "string" ? body.contactId : null;
    const subject = typeof body?.subject === "string" ? body.subject : null;
    const draftBody = typeof body?.body === "string" ? body.body : null;
    if (!contactId || !subject || !draftBody) {
      return Response.json({ ok: false, error: "invalid request" }, { status: 400 });
    }
    await createDraft({ contactId, subject, body: draftBody });
    return Response.json({ ok: true });
  }

  const id = typeof body?.id === "string" ? body.id : null;
  const approver = asApprover(body?.approvedBy);
  if (!id || !approver || (action !== "approve" && action !== "reject")) {
    return Response.json({ ok: false, error: "invalid request" }, { status: 400 });
  }

  const message = await getMessage(id);
  if (!message) return Response.json({ ok: false, error: "not found" }, { status: 404 });
  if (message.status !== "draft") {
    return Response.json({ ok: false, error: `already ${message.status}` }, { status: 409 });
  }

  if (action === "reject") {
    await markRejected(id, approver);
    return Response.json({ ok: true, status: "rejected" });
  }

  const contact = message.contact;
  if (!contact) return Response.json({ ok: false, error: "message has no contact" }, { status: 500 });

  // Left in `draft` on failure — an unset Gmail credential must never look
  // like a successful send. The caller gets back why, not a bare 500.
  let sent: Awaited<ReturnType<typeof sendOutreachMessage>>;
  try {
    sent = await sendOutreachMessage({
      to: contact.email,
      subject: message.subject,
      body: message.body,
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "send failed" },
      { status: 502 }
    );
  }
  await markApprovedAndSent(id, approver, sent);
  return Response.json({ ok: true, status: "sent" });
}
