import { serviceClient } from "@/lib/frontdesk/server/clients";
import { generateAndStoreDraft } from "@/lib/frontdesk/server/draftPipeline";

/**
 * The daily nudge sweep. An inquiry that was replied to 3+ days ago and has
 * gone quiet gets ONE follow-up draft and flips to nudge_due; the freelancer
 * sends it (status back to replied, clock reset) or ignores it. Two nudges
 * per inquiry, ever — the count comes back embedded in the same query that
 * selects candidates, and a nudge_due inquiry is never a candidate, so the
 * sweep cannot double-fire between freelancer actions.
 *
 * Auth and logging follow the weekly cron precedent: exact CRON_SECRET
 * bearer, counts in the logs and nothing else.
 */
export const maxDuration = 300;

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const BATCH_CAP = 25;
const MAX_NUDGES = 2;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const db = serviceClient();
  const threshold = new Date(Date.now() - THREE_DAYS_MS).toISOString();

  const { data: candidates, error } = await db
    .from("inquiries")
    .select("id, drafts(kind)")
    .eq("status", "replied")
    .lt("replied_at", threshold)
    .limit(200);
  if (error) {
    console.error("cron/nudges: query_failed");
    return Response.json({ ok: false }, { status: 500 });
  }

  const due = (candidates ?? [])
    .filter(
      (row) =>
        ((row.drafts as { kind: string }[] | null) ?? []).filter((d) => d.kind === "nudge")
          .length < MAX_NUDGES
    )
    .slice(0, BATCH_CAP);

  let generated = 0;
  let failed = 0;
  for (const inquiry of due) {
    const outcome = await generateAndStoreDraft(inquiry.id, "nudge");
    if (outcome === "stored") {
      await db.from("inquiries").update({ status: "nudge_due" }).eq("id", inquiry.id);
      generated++;
    } else {
      failed++;
    }
  }

  console.log(
    `cron/nudges: candidates:${candidates?.length ?? 0} due:${due.length} generated:${generated} failed:${failed}`
  );
  return Response.json({ ok: true, generated, failed });
}
