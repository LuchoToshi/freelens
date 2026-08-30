import { serviceClient } from "@/lib/frontdesk/server/clients";
import { generateAndStoreDraft } from "@/lib/frontdesk/server/draftPipeline";
import { nudgeVerdict, type FollowupCandidate } from "@/lib/frontdesk/followups";

/**
 * The daily nudge sweep. Candidates come from one query; every eligibility
 * decision — quiet window (per-freelancer cadence), the 2-nudge cap, the
 * global pause, the per-inquiry snooze, sample exclusion — lives in
 * lib/frontdesk/followups.ts, pure and tested. Idempotency is structural: a
 * stored nudge flips status to nudge_due, which is no longer a candidate.
 *
 * Auth and logging follow the weekly cron precedent: exact CRON_SECRET
 * bearer, counts in the logs and nothing else.
 */
export const maxDuration = 300;

const BATCH_CAP = 25;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const db = serviceClient();
  const now = new Date();

  // Anything quiet at least MIN_QUIET_DAYS is a candidate; the exact
  // per-freelancer window is applied by the verdict below.
  const { data: candidates, error } = await db
    .from("inquiries")
    .select(
      "id, status, source, replied_at, snoozed_until, drafts(kind), freelancers!inner(followups_paused, followup_quiet_days)"
    )
    .eq("status", "replied")
    .neq("source", "sample")
    .lt("replied_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
    .limit(200);
  if (error) {
    console.error("cron/nudges: query_failed");
    return Response.json({ ok: false }, { status: 500 });
  }

  const due = (candidates ?? [])
    .filter((row) => {
      const freelancer = row.freelancers as unknown as {
        followups_paused: boolean;
        followup_quiet_days: number | null;
      };
      const candidate: FollowupCandidate = {
        status: row.status,
        source: row.source,
        replied_at: row.replied_at,
        snoozed_until: row.snoozed_until,
        nudgeCount: ((row.drafts as { kind: string }[] | null) ?? []).filter(
          (d) => d.kind === "nudge"
        ).length,
        followupsPaused: freelancer.followups_paused,
        quietDays: freelancer.followup_quiet_days,
      };
      return nudgeVerdict(candidate, now).eligible;
    })
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
