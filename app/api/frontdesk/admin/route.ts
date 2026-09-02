import { asUserClient, serviceClient } from "@/lib/frontdesk/server/clients";
import { tallyFirstDraftBuckets, type FunnelDraftRow } from "@/lib/frontdesk/server/adminFunnel";

/**
 * The founder's learning instrument, read-only. The gate is this route, not
 * the page: a valid JWT whose email is not in ADMIN_EMAILS gets a 404 — the
 * same answer as a route that does not exist, so /admin confirms nothing.
 *
 * Deliberately no client PII in the response: the spec's admin table is
 * freelancer / channel / status / outcome / timestamps. Names and email
 * addresses stay out of the founder view entirely.
 */
export async function GET(request: Request) {
  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 404 });

  const asUser = asUserClient(jwt);
  const { data: userData, error } = await asUser.auth.getUser(jwt);
  if (error || !userData?.user) return Response.json({ ok: false }, { status: 404 });

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = userData.user.email?.toLowerCase() ?? "";
  if (!allowed.includes(email)) return Response.json({ ok: false }, { status: 404 });

  const db = serviceClient();

  const { data: inquiries } = await db
    .from("inquiries")
    .select(
      "id, freelancer_id, source, src_channel, status, created_at, replied_at, freelancers(handle, is_test_account), drafts(kind, outcome, created_at)"
    )
    // Practice data is not signal: samples never reach the founder's numbers.
    .neq("source", "sample")
    .order("created_at", { ascending: false })
    .limit(200);

  type Row = NonNullable<typeof inquiries>[number];
  // Our own QA accounts are not customers. They are excluded here rather than
  // filtered in the page, so no number computed downstream can include them.
  const realInquiries = (inquiries ?? []).filter(
    (i: Row) =>
      (i.freelancers as unknown as { is_test_account?: boolean } | null)?.is_test_account !== true,
  );
  const rows = realInquiries.map((i: Row) => {
    const drafts = (i.drafts ?? []) as FunnelDraftRow[];
    const latest = [...drafts].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    return {
      handle: (i.freelancers as unknown as { handle: string } | null)?.handle ?? "?",
      srcChannel: i.src_channel,
      status: i.status,
      draftOutcome: latest?.outcome ?? (latest ? "pending" : "none"),
      // Kept per-inquiry (not flattened) so the funnel tally below can apply
      // the first-draft, reply-only definition from issue #32/#33 rather
      // than counting every draft's outcome regardless of kind or order.
      drafts,
      nudges: drafts.filter((d) => d.kind === "nudge").length,
      createdAt: i.created_at,
      repliedAt: i.replied_at,
    };
  });

  const byHandle = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = byHandle.get(row.handle) ?? [];
    list.push(row);
    byHandle.set(row.handle, list);
  }

  const funnels = [...byHandle.entries()].map(([handle, list]) => {
    const replied = list.filter((r) => r.repliedAt).length;
    const booked = list.filter((r) => r.status === "booked").length;
    const outcomes = tallyFirstDraftBuckets(list.map((r) => r.drafts));
    const replyMinutes = list
      .filter((r) => r.repliedAt)
      .map((r) =>
        Math.max(0, (new Date(r.repliedAt!).getTime() - new Date(r.createdAt).getTime()) / 60000)
      )
      .sort((a, b) => a - b);
    const median =
      replyMinutes.length === 0
        ? null
        : replyMinutes[Math.floor((replyMinutes.length - 1) / 2)];
    return {
      handle,
      inquiries: list.length,
      replied,
      booked,
      outcomes,
      medianReplyMinutes: median === null ? null : Math.round(median),
    };
  });

  // Phase 8 monitoring (§30): draft-failure rate, queue depth, integration
  // expiry — derived live, thresholds applied in the page. The daily cron
  // logs the same numbers for log-based alerting.
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [{ count: draftsWeek }, { count: failedWeek }, { count: awaiting }, { count: revoked }] =
    await Promise.all([
      db.from("drafts").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      db
        .from("drafts")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo)
        .eq("validation_status", "failed"),
      db
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "nudge_due"])
        .neq("source", "sample"),
      db
        .from("agent_gmail_connections")
        .select("id", { count: "exact", head: true })
        .not("revoked_at", "is", null),
    ]);
  const monitoring = {
    draftsLast7d: draftsWeek ?? 0,
    failedLast7d: failedWeek ?? 0,
    failureRate: draftsWeek ? Math.round(((failedWeek ?? 0) / draftsWeek) * 100) : 0,
    queueDepth: awaiting ?? 0,
    revokedConnections: revoked ?? 0,
  };

  console.log(
    `frontdesk/admin: served rows:${rows.length} funnels:${funnels.length} failRate:${monitoring.failureRate}% queueDepth:${monitoring.queueDepth} revoked:${monitoring.revokedConnections}`
  );
  return Response.json({ ok: true, rows, funnels, monitoring });
}

/**
 * Founder-issued invites: POST { email } creates one invite code bound to that
 * address. Same 404-style gate as GET.
 *
 * The address is required (owner decision, 2 Sep 2026). An unbound code is a
 * bearer token for an account: whoever holds it can mint one under any address
 * they like, which defeats the point of knowing who is on the platform. Binding
 * also lets the redemption route refuse a mismatch, which it already did.
 */
export async function POST(request: Request) {
  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 404 });
  const asUser = asUserClient(jwt);
  const { data: userData, error } = await asUser.auth.getUser(jwt);
  if (error || !userData?.user) return Response.json({ ok: false }, { status: 404 });
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.includes(userData.user.email?.toLowerCase() ?? "")) {
    return Response.json({ ok: false }, { status: 404 });
  }

  let body: { email?: unknown; isTestAccount?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "email_required" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ ok: false, reason: "email_required" }, { status: 400 });
  }
  // A QA account is labelled at the moment it is invited, not discovered later
  // once its rows are already mixed into the numbers.
  const isTestAccount = body.isTestAccount === true;

  // FRLNS-XXXX, unambiguous alphabet (no 0/O/1/I), 30-day expiry.
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const code = "FRLNS-" + [...bytes].map((b) => alphabet[b % alphabet.length]).join("");

  const db = serviceClient();
  const { error: insertError } = await db.from("invites").insert({
    code,
    issued_to_email: email,
    issued_by: userData.user.id,
    is_test_account: isTestAccount,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (insertError) {
    console.error("frontdesk/admin: invite_insert_failed");
    return Response.json({ ok: false }, { status: 500 });
  }
  console.log("frontdesk/admin: invite_issued");
  return Response.json({ ok: true, code });
}
