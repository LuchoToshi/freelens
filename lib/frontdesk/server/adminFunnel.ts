/**
 * First-draft edit rate, the founder's primary quality metric.
 *
 * Definition agreed in issue #32, pure and DB-shape-independent so the admin
 * funnel and any other reader of the same data classify identically:
 *   - only drafts where kind = "reply" count; a nudge's outcome is a
 *     different measurement and must never bleed into reply quality.
 *   - only the EARLIEST reply draft per inquiry counts as "the first draft".
 *     A freelancer who discarded it and sent a later one is not a zero-edit
 *     success on the first draft; that is exactly the blind spot this closes.
 *   - `regenerated`: the earliest reply draft has no terminal outcome, but a
 *     later reply draft on the same inquiry does. Derived, not stored -
 *     there is no `regenerated` value in the `outcome` CHECK constraint
 *     (0003_frontdesk.sql:71) and none is proposed. Per the founder-strategy
 *     ruling (2026-08-19): counts toward neither "sent as-is" nor "skipped",
 *     reported on its own line, no threshold set.
 */
export interface FunnelDraftRow {
  kind: string;
  outcome: string | null;
  created_at: string;
}

export type FirstDraftBucket = "sent_as_is" | "edited" | "skipped" | "regenerated";

const TERMINAL_OUTCOMES: ReadonlySet<string> = new Set(["sent_as_is", "edited", "skipped"]);

/** Null when the inquiry has no reply draft yet, or its first is still pending. */
export function firstDraftBucket(drafts: readonly FunnelDraftRow[]): FirstDraftBucket | null {
  const replies = drafts
    .filter((d) => d.kind === "reply")
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (replies.length === 0) return null;

  const [first, ...later] = replies;
  if (first.outcome && TERMINAL_OUTCOMES.has(first.outcome)) {
    return first.outcome as FirstDraftBucket;
  }
  const discardedAndReplaced = later.some((d) => d.outcome && TERMINAL_OUTCOMES.has(d.outcome));
  return discardedAndReplaced ? "regenerated" : null;
}

export interface FirstDraftFunnelCounts {
  sent_as_is: number;
  edited: number;
  skipped: number;
  regenerated: number;
}

/** One inquiry contributes at most one bucket: its own first-draft outcome. */
export function tallyFirstDraftBuckets(
  inquiries: readonly (readonly FunnelDraftRow[])[]
): FirstDraftFunnelCounts {
  const counts: FirstDraftFunnelCounts = { sent_as_is: 0, edited: 0, skipped: 0, regenerated: 0 };
  for (const drafts of inquiries) {
    const bucket = firstDraftBucket(drafts);
    if (bucket) counts[bucket]++;
  }
  return counts;
}
