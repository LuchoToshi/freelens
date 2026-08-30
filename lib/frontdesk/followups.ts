/**
 * The follow-up engine's deterministic core (master spec §11). The cron
 * queries candidates; every decision about WHO gets a nudge and WHY lives
 * here, pure and tested — including every stop condition that is expressible
 * from the data we hold:
 *
 *   - the freelancer closed the lead (status booked/lost) or already replied
 *     state moved on (anything but `replied` is out — which is also the
 *     idempotency guard: a stored nudge flips status to nudge_due, so a
 *     re-run can never double-fire)
 *   - the freelancer paused follow-ups, globally or per inquiry (snooze)
 *   - the cap is reached (MAX_NUDGES, ever)
 *   - practice data (source sample) never nudges anyone
 *
 * "The client replies" and "the client declines" need Gmail (§11.6, CASA)
 * and NLP (§11.4, [PROPOSED]); until then the cap and manual approval are
 * the safety net, as the spec instructs.
 */

export const DEFAULT_QUIET_DAYS = 3;
export const MIN_QUIET_DAYS = 1;
export const MAX_QUIET_DAYS = 14;
export const MAX_NUDGES = 2;

export interface FollowupCandidate {
  status: string;
  source: string;
  replied_at: string | null;
  snoozed_until: string | null;
  /** Nudge drafts that already exist for this inquiry. */
  nudgeCount: number;
  /** The freelancer's global pause switch. */
  followupsPaused: boolean;
  /** The freelancer's cadence, null = product default. */
  quietDays: number | null;
}

export type FollowupVerdict =
  | { eligible: true; quietDays: number }
  | {
      eligible: false;
      stop:
        | "not_awaiting_client"
        | "sample"
        | "paused_globally"
        | "snoozed"
        | "cap_reached"
        | "not_quiet_long_enough";
    };

/** Clamp a stored cadence to the sane window; anything else is the default. */
export function resolveQuietDays(stored: number | null | undefined): number {
  if (
    typeof stored === "number" &&
    Number.isInteger(stored) &&
    stored >= MIN_QUIET_DAYS &&
    stored <= MAX_QUIET_DAYS
  ) {
    return stored;
  }
  return DEFAULT_QUIET_DAYS;
}

export function nudgeVerdict(candidate: FollowupCandidate, now: Date): FollowupVerdict {
  if (candidate.source === "sample") return { eligible: false, stop: "sample" };
  if (candidate.status !== "replied") {
    return { eligible: false, stop: "not_awaiting_client" };
  }
  if (candidate.followupsPaused) return { eligible: false, stop: "paused_globally" };
  if (candidate.snoozed_until && new Date(candidate.snoozed_until).getTime() > now.getTime()) {
    return { eligible: false, stop: "snoozed" };
  }
  if (candidate.nudgeCount >= MAX_NUDGES) return { eligible: false, stop: "cap_reached" };
  const quietDays = resolveQuietDays(candidate.quietDays);
  const quietMs = quietDays * 24 * 60 * 60 * 1000;
  if (!candidate.replied_at || now.getTime() - new Date(candidate.replied_at).getTime() < quietMs) {
    return { eligible: false, stop: "not_quiet_long_enough" };
  }
  return { eligible: true, quietDays };
}

/** DS `FollowUpSchedule`: the visible timeline for one inquiry (§11.7). */
export interface FollowupTimeline {
  /** Nudges used out of the cap. */
  used: number;
  cap: number;
  /** i18n key under inbox.followupSchedule.states. */
  stateKey:
    | "awaiting"
    | "proposed"
    | "sent"
    | "paused"
    | "cancelled"
    | "failed"
    | "capReached";
}

export function deriveFollowupTimeline(
  inquiry: {
    status: string;
    snoozed_until: string | null;
  },
  nudgeDrafts: readonly { outcome: string | null; body: string }[],
  now: Date
): FollowupTimeline {
  const used = nudgeDrafts.length;
  const base = { used, cap: MAX_NUDGES };
  if (inquiry.status === "booked" || inquiry.status === "lost") {
    return { ...base, stateKey: "cancelled" };
  }
  if (inquiry.snoozed_until && new Date(inquiry.snoozed_until).getTime() > now.getTime()) {
    return { ...base, stateKey: "paused" };
  }
  const latest = nudgeDrafts[0];
  if (inquiry.status === "nudge_due" && latest) {
    if (!latest.body) return { ...base, stateKey: "failed" };
    if (latest.outcome === "sent_as_is" || latest.outcome === "edited") {
      return { ...base, stateKey: "sent" };
    }
    return { ...base, stateKey: "proposed" };
  }
  if (used >= MAX_NUDGES) return { ...base, stateKey: "capReached" };
  return { ...base, stateKey: "awaiting" };
}
