/**
 * Reply detection, run inline on each admin list load rather than on a
 * schedule — a dedicated cron would be a 3rd Vercel cron job, over the
 * Hobby plan's 2-job cap, for a probe that a human/agent checks by hand
 * anyway. Sync-on-read is simpler and fits the actual usage pattern.
 */
import { listSentAwaitingReply, markReplied, touchSynced } from "./db";
import { threadHasReply } from "./gmail";

export async function syncPendingReplies(): Promise<void> {
  const pending = await listSentAwaitingReply();
  for (const message of pending) {
    if (!message.gmail_thread_id || !message.gmail_message_id) continue;
    try {
      const hasReply = await threadHasReply(message.gmail_thread_id, message.gmail_message_id);
      if (hasReply) {
        await markReplied(message.id);
      } else {
        await touchSynced(message.id);
      }
    } catch {
      // Gmail not configured yet, or a transient API failure — the list
      // still renders with last-known status; next load retries.
    }
  }
}
