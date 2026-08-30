/**
 * The fixed queue-priority model (master spec §7.2): order IS the priority,
 * no score ever reorders it. Pure and deterministic — `now` is always
 * injected (D23), overdue is derived at read time and never stored (D22),
 * and every item carries a plain-language reason and next action, because a
 * bare score is forbidden.
 *
 * Day arithmetic is done in the freelancer's timezone (DEC-4): "overdue by
 * 1 day" must flip at their midnight, not UTC's.
 */

export type QueueKey =
  | "decision"
  | "review"
  | "missing"
  | "followup"
  | "waiting"
  | "monitoring"
  | "done";

/** Display order and priority, §7.2. Index = rank. */
export const QUEUE_ORDER: readonly QueueKey[] = [
  "decision",
  "review",
  "missing",
  "followup",
  "waiting",
  "monitoring",
  "done",
];

export interface QueueInquiry {
  status: "new" | "replied" | "nudge_due" | "booked" | "lost";
  created_at: string;
  replied_at?: string | null;
  client_email: string | null;
  snoozed_until?: string | null;
}

export interface QueueDraft {
  kind: "reply" | "nudge";
  outcome: string | null;
  validation_status?: string | null;
  validation_failures?: string[] | null;
  created_at: string;
}

export interface DueInfo {
  kind: "due_today" | "due_tomorrow" | "due_in_days" | "overdue" | "snoozed";
  days: number;
  /** ISO date the wording refers to — always shown next to the relative label. */
  date: string;
}

export interface QueuePlacement {
  queue: QueueKey;
  /** i18n key under inbox.queues.reasons — why this item appears here. */
  reasonKey: string;
  /** i18n key under inbox.queues.actions — the row's next-action headline. */
  actionKey: string;
  due?: DueInfo;
  /** Validation failure codes, when they are the evidence for the placement. */
  failures?: string[];
}

/** The nudge cron's deterministic rule: eligible 3 quiet days after a reply. */
export const FOLLOW_UP_QUIET_DAYS = 3;
const GENERATING_GRACE_MINUTES = 10;

/** Calendar-day difference from `from` to `to` in a timezone: to - from. */
export function dayDiff(from: Date, to: Date, timeZone: string): number {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, dateStyle: "short" });
  const asUtcDay = (d: Date) => Date.parse(`${fmt.format(d)}T00:00:00Z`);
  return Math.round((asUtcDay(to) - asUtcDay(from)) / 86_400_000);
}

function isoDatePlusDays(from: Date, days: number, timeZone: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, dateStyle: "short" });
  return fmt.format(new Date(from.getTime() + days * 86_400_000));
}

function dueFromDayDelta(delta: number, date: string): DueInfo {
  if (delta < 0) return { kind: "overdue", days: -delta, date };
  if (delta === 0) return { kind: "due_today", days: 0, date };
  if (delta === 1) return { kind: "due_tomorrow", days: 1, date };
  return { kind: "due_in_days", days: delta, date };
}

/**
 * Place one inquiry, given its latest reply draft. Deterministic mapping
 * from the data that exists today; queues with no producing state yet
 * (monitoring outside the generating window) simply stay empty — an honest
 * empty state beats an invented occupant.
 */
export function placeInquiry(
  inquiry: QueueInquiry,
  latestReplyDraft: QueueDraft | null,
  now: Date,
  timeZone: string
): QueuePlacement {
  if (inquiry.status === "booked" || inquiry.status === "lost") {
    return { queue: "done", reasonKey: "outcomeRecorded", actionKey: "noAction" };
  }

  const snoozedUntil = inquiry.snoozed_until ? new Date(inquiry.snoozed_until) : null;
  if (snoozedUntil && snoozedUntil.getTime() > now.getTime()) {
    return {
      queue: "followup",
      reasonKey: "snoozed",
      actionKey: "snoozedUntil",
      due: {
        kind: "snoozed",
        days: Math.max(0, dayDiff(now, snoozedUntil, timeZone)),
        date: snoozedUntil.toISOString().slice(0, 10),
      },
    };
  }

  if (inquiry.status === "nudge_due") {
    const repliedAt = inquiry.replied_at ? new Date(inquiry.replied_at) : null;
    const base = repliedAt ?? new Date(inquiry.created_at);
    const dueDate = isoDatePlusDays(base, FOLLOW_UP_QUIET_DAYS, timeZone);
    const delta = FOLLOW_UP_QUIET_DAYS - dayDiff(base, now, timeZone);
    return {
      queue: "followup",
      reasonKey: "followupDue",
      actionKey: "followUp",
      due: dueFromDayDelta(delta, dueDate),
    };
  }

  if (inquiry.status === "replied") {
    return { queue: "waiting", reasonKey: "waitingOnClient", actionKey: "waiting" };
  }

  // status === "new" from here.
  if (latestReplyDraft?.outcome) {
    // An outcome was recorded but the status write did not land; show the
    // truth of the data rather than pretending there is work to do.
    return { queue: "waiting", reasonKey: "waitingOnClient", actionKey: "waiting" };
  }

  const vs = latestReplyDraft?.validation_status ?? null;
  if (vs === "needs_review") {
    return {
      queue: "decision",
      reasonKey: "needsDecision",
      actionKey: "resolveAndReview",
      failures: latestReplyDraft?.validation_failures ?? [],
    };
  }
  if (vs === "failed") {
    return {
      queue: "missing",
      reasonKey: "draftingStopped",
      actionKey: "fixAndRegenerate",
      failures: latestReplyDraft?.validation_failures ?? [],
    };
  }
  if (latestReplyDraft) {
    return { queue: "review", reasonKey: "draftReady", actionKey: "reviewDraft" };
  }

  // No draft at all: freshly submitted (generation in flight) or stopped
  // before a draft existed (typically no voice profile).
  const ageMinutes = (now.getTime() - new Date(inquiry.created_at).getTime()) / 60_000;
  if (ageMinutes < GENERATING_GRACE_MINUTES) {
    return { queue: "monitoring", reasonKey: "draftPreparing", actionKey: "noAction" };
  }
  return { queue: "missing", reasonKey: "noDraftYet", actionKey: "completeSetup" };
}
