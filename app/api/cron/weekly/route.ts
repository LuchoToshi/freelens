import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { rankQueue } from "@/lib/rebooking/ranking";
import { SEASONALITY_NL_V1 } from "@/lib/rebooking/seasonality";
import { reasonTextFor } from "@/lib/rebooking/reasonText";
import { sendEmail } from "@/lib/server/sendEmail";
import type { Craft, Relationship } from "@/lib/rebooking/types";

/**
 * The weekly loop, per B5: one email per user per week, only when the queue is
 * non-empty. No email when there is nothing to say; no streaks, no mechanics.
 * Cadence is enforced by the cron schedule itself (Mondays 08:00 UTC), and
 * Vercel crons run on production only.
 *
 * This is the one place the service key iterates users — a cron has no user
 * token to act under, so it reads with service scope and sends each user only
 * their own rows. v1 sends Dutch; a stored locale preference can widen that.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  let sent = 0;
  let page = 1;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error || !data?.users?.length) break;

    for (const user of data.users) {
      if (!user.email) continue;

      const { data: voice } = await admin
        .from("voice_profiles")
        .select("craft, weekly_email")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!voice || voice.weekly_email === false) continue;

      const { data: rows } = await admin
        .from("relationships")
        .select("*")
        .eq("user_id", user.id);
      const { data: recent } = await admin
        .from("touches")
        .select("relationship_id")
        .eq("user_id", user.id)
        .gte("suggested_at", weekAgo);

      const relationships: Relationship[] = (rows ?? []).map((r) => ({
        id: r.id,
        userId: r.user_id,
        clientName: r.client_name,
        clientEmail: r.client_email ?? undefined,
        lastProjectTitle: r.last_project_title ?? undefined,
        lastProjectDate: r.last_project_date ?? undefined,
        approxValueCents: r.approx_value_cents ?? undefined,
        notes: r.notes ?? undefined,
        temperature: r.temperature,
        snoozedUntil: r.snoozed_until ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      const queue = rankQueue({
        relationships,
        craft: voice.craft as Craft,
        config: SEASONALITY_NL_V1,
        today,
        recentlyTouchedIds: (recent ?? []).map((t) => t.relationship_id),
      });
      if (queue.length === 0) continue;

      const origin = new URL(request.url).origin;
      const optOut = `${origin}/api/weekly/optout?token=${optOutToken(user.id)}`;
      const items = queue
        .map((s) => {
          const r = relationships.find((x) => x.id === s.relationshipId)!;
          return `<li><strong>${escapeHtml(r.clientName)}</strong>: ${escapeHtml(
            reasonTextFor(s, r, "nl")
          )}</li>`;
        })
        .join("");

      const delivered = await sendEmail({
        to: user.email,
        subject: `Deze week: ${queue.length} ${queue.length === 1 ? "iemand" : "mensen"} die een berichtje waard ${queue.length === 1 ? "is" : "zijn"}`,
        html: `<p>Hoi,</p><ul>${items}</ul><p><a href="${origin}/app">Open Freelens en bekijk de concepten</a>. Jij verstuurt altijd zelf.</p><p style="color:#888;font-size:12px">Liever geen wekelijkse mail? <a href="${optOut}">Eén klik en hij stopt.</a></p>`,
      });
      if (delivered) sent += 1;
    }

    if (data.users.length < 100) break;
    page += 1;
  }

  console.log("cron weekly: emails sent", sent);
  return Response.json({ ok: true, sent });
}

function optOutToken(userId: string): string {
  const mac = createHmac("sha256", process.env.WAITLIST_SECRET ?? "")
    .update(`optout:${userId}`)
    .digest("hex")
    .slice(0, 32);
  return `${userId}.${mac}`;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
