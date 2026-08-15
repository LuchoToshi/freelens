/**
 * Data access for the outreach tool. Service-role only — there is no user
 * JWT in this flow, only the ADMIN_EMAILS-gated founder/agent session and
 * the sync cron.
 */
import { serviceClient } from "@/lib/frontdesk/server/clients";

export interface OutreachContact {
  id: string;
  email: string;
  name: string | null;
  source: "waitlist" | "manual";
  status: "candidate" | "contacted" | "declined" | "unreachable";
}

export interface OutreachMessage {
  id: string;
  contact_id: string;
  subject: string;
  body: string;
  status: "draft" | "approved" | "sent" | "replied" | "rejected";
  approved_by: string | null;
  gmail_thread_id: string | null;
  gmail_message_id: string | null;
  sent_at: string | null;
  contact?: OutreachContact;
}

export async function listDrafts(): Promise<OutreachMessage[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("outreach_messages")
    .select("*, contact:outreach_contacts(*)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as OutreachMessage[];
}

export async function getMessage(id: string): Promise<OutreachMessage | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("outreach_messages")
    .select("*, contact:outreach_contacts(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as OutreachMessage | null;
}

export async function markApprovedAndSent(
  id: string,
  approvedBy: string,
  sent: { gmailMessageId: string; gmailThreadId: string }
): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("outreach_messages")
    .update({
      status: "sent",
      approved_by: approvedBy,
      gmail_message_id: sent.gmailMessageId,
      gmail_thread_id: sent.gmailThreadId,
      sent_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function markRejected(id: string, approvedBy: string): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("outreach_messages")
    .update({ status: "rejected", approved_by: approvedBy })
    .eq("id", id);
  if (error) throw error;
}

export async function listSentAwaitingReply(): Promise<OutreachMessage[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("outreach_messages")
    .select("*")
    .eq("status", "sent")
    .not("gmail_thread_id", "is", null);
  if (error) throw error;
  return (data ?? []) as OutreachMessage[];
}

export async function markReplied(id: string): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("outreach_messages")
    .update({ status: "replied", last_synced_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function touchSynced(id: string): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("outreach_messages")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Upserts by email; a contact who already exists is left as-is. */
export async function addCandidateContact(input: {
  email: string;
  name: string | null;
  source: "waitlist" | "manual";
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("outreach_contacts")
    .upsert(
      { email: input.email.trim().toLowerCase(), name: input.name, source: input.source },
      { onConflict: "email", ignoreDuplicates: true }
    );
  if (error) throw error;
}

export async function createDraft(input: {
  contactId: string;
  subject: string;
  body: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db.from("outreach_messages").insert({
    contact_id: input.contactId,
    subject: input.subject,
    body: input.body,
  });
  if (error) throw error;
}
