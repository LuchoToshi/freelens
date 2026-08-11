import { asUserClient, serviceClient } from "@/lib/frontdesk/server/clients";

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
      "id, freelancer_id, source, src_channel, status, created_at, replied_at, freelancers(handle), drafts(kind, outcome, created_at)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  type Row = NonNullable<typeof inquiries>[number];
  const rows = (inquiries ?? []).map((i: Row) => {
    const drafts = (i.drafts ?? []) as { kind: string; outcome: string | null; created_at: string }[];
    const latest = [...drafts].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    return {
      handle: (i.freelancers as unknown as { handle: string } | null)?.handle ?? "?",
      srcChannel: i.src_channel,
      status: i.status,
      draftOutcome: latest?.outcome ?? (latest ? "pending" : "none"),
      // The funnel counts every draft's recorded outcome, not just the
      // latest: an edited reply is not erased by a later pending nudge.
      allOutcomes: drafts.map((d) => d.outcome).filter((o): o is string => o !== null),
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
    const outcomes = { sent_as_is: 0, edited: 0, skipped: 0 };
    for (const r of list) {
      for (const o of r.allOutcomes) {
        if (o in outcomes) outcomes[o as keyof typeof outcomes]++;
      }
    }
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

  console.log(`frontdesk/admin: served rows:${rows.length} funnels:${funnels.length}`);
  return Response.json({ ok: true, rows, funnels });
}
