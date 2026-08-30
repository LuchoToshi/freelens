/**
 * The user-visible activity log (master spec §28, DS `ActivityLog`): plain
 * language, per-account, filterable — and stored nowhere. Every entry is
 * derived at read time from rows that already exist, which makes the §28.3
 * hard rule structural: no message bodies, no email addresses, no draft
 * content, no prices ever appear because none are ever put in.
 *
 * Only events with a real timestamp are emitted; a state change nothing
 * recorded a time for is not narrated with an invented one.
 */

export type ActivityType =
  | "inquiry.received"
  | "draft.ready"
  | "draft.approved"
  | "draft.dismissed"
  | "followup.proposed";

export interface ActivityEntry {
  type: ActivityType;
  at: string;
  inquiryId: string;
  clientName: string;
  /** Dismiss reason code, for draft.dismissed. */
  reason?: string;
}

export interface ActivityInquiry {
  id: string;
  client_name: string;
  created_at: string;
}

export interface ActivityDraft {
  inquiry_id: string;
  kind: "reply" | "nudge";
  created_at: string;
  outcome: string | null;
  outcome_at?: string | null;
  dismiss_reason?: string | null;
  body: string;
}

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  "inquiry.received",
  "draft.ready",
  "draft.approved",
  "draft.dismissed",
  "followup.proposed",
];

export function deriveActivity(
  inquiries: readonly ActivityInquiry[],
  drafts: readonly ActivityDraft[]
): ActivityEntry[] {
  const byId = new Map(inquiries.map((i) => [i.id, i]));
  const entries: ActivityEntry[] = [];

  for (const inquiry of inquiries) {
    entries.push({
      type: "inquiry.received",
      at: inquiry.created_at,
      inquiryId: inquiry.id,
      clientName: inquiry.client_name,
    });
  }

  for (const draft of drafts) {
    const inquiry = byId.get(draft.inquiry_id);
    if (!inquiry) continue;
    const base = { inquiryId: inquiry.id, clientName: inquiry.client_name };
    // An empty body is a failed generation, not a prepared draft.
    if (draft.body) {
      entries.push({
        type: draft.kind === "nudge" ? "followup.proposed" : "draft.ready",
        at: draft.created_at,
        ...base,
      });
    }
    if (draft.outcome_at) {
      if (draft.outcome === "sent_as_is" || draft.outcome === "edited") {
        entries.push({ type: "draft.approved", at: draft.outcome_at, ...base });
      } else if (draft.outcome === "skipped") {
        entries.push({
          type: "draft.dismissed",
          at: draft.outcome_at,
          reason: draft.dismiss_reason ?? undefined,
          ...base,
        });
      }
    }
  }

  return entries.sort((a, b) => (a.at < b.at ? 1 : -1));
}
