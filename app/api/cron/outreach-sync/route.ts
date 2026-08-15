import { listSentAwaitingReply, markReplied, touchSynced } from "@/lib/server/outreach/db";
import { threadHasReply } from "@/lib/server/outreach/gmail";

/**
 * Polls the dedicated outreach account for replies on threads it started.
 * No Pub/Sub push — at probe volume (single digits of messages) a periodic
 * poll is simpler and needs no GCP project. Same CRON_SECRET gate as the
 * existing weekly cron.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const pending = await listSentAwaitingReply();
  let replied = 0;
  for (const message of pending) {
    if (!message.gmail_thread_id || !message.gmail_message_id) continue;
    const hasReply = await threadHasReply(message.gmail_thread_id, message.gmail_message_id);
    if (hasReply) {
      await markReplied(message.id);
      replied += 1;
    } else {
      await touchSynced(message.id);
    }
  }

  return Response.json({ ok: true, checked: pending.length, replied });
}
