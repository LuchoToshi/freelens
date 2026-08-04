/**
 * What the pipeline has to say, if anything.
 *
 * Signals come from the jobs themselves crossing a threshold, never from a
 * calendar. "Time for your weekly check-in" is noise: nothing happened, the
 * product just wanted attention. "This payment has been open 47 days" is
 * information, because it is true, specific, and there is something to do
 * about it.
 *
 * Three rules hold everything here together:
 *
 *   1. Silence is the default. No jobs, or nothing past a threshold, returns
 *      an empty list. A calm pipeline should look calm.
 *   2. One signal per subject. A job that is both old and overdue produces the
 *      strongest single line, not two.
 *   3. Every signal carries a stable `key`. Dismissal is stored against it, so
 *      the same line cannot come back tomorrow having changed nothing. The key
 *      includes the threshold it fired at, so crossing the NEXT threshold is
 *      allowed to speak again.
 *
 * Pure: `today` is passed in.
 */
import type { Cents } from "@/lib/domain/money";
import {
  daysInStatus,
  isOverdue,
  OUTSTANDING_STATUS,
  type JobRecord,
} from "@/lib/domain/jobs";

export type SignalTone = "neutral" | "attention";

export interface JobSignal {
  /** Stable across renders and days, so a dismissal sticks. */
  key: string;
  kind:
    | "quote-waiting"
    | "payment-waiting"
    | "payment-overdue"
    | "outstanding-total"
    | "recently-paid";
  tone: SignalTone;
  /** The job this is about, when it is about one job. */
  jobId?: string;
  /** Numbers for the sentence. The wording lives in the dictionary. */
  days?: number;
  count?: number;
  amountCents?: Cents;
}

/**
 * Days after which an unanswered quote is worth mentioning.
 *
 * Two weeks: long enough that a client who meant to reply has forgotten, short
 * enough that following up is still natural rather than awkward.
 */
export const QUOTE_WAITING_DAYS = 14;

/**
 * Ladder for an unpaid invoice. 30 is the common Dutch payment term, 60 is
 * where it stops being a delay and starts being a problem.
 *
 * A ladder rather than a single threshold so a genuinely old debt can speak
 * twice without repeating itself: the key carries the rung.
 */
export const PAYMENT_WAITING_LADDER = [30, 60] as const;

/** Days a payment stays worth celebrating. */
export const RECENTLY_PAID_DAYS = 7;

/** Below this, an outstanding total is not worth a line of its own. */
export const OUTSTANDING_TOTAL_FLOOR = 50_000; // €500

export interface SignalInput {
  jobs: readonly JobRecord[];
  today: string;
  /** Keys the user has already dismissed. */
  dismissed?: readonly string[];
}

export function jobSignals({ jobs, today, dismissed = [] }: SignalInput): JobSignal[] {
  const seen = new Set(dismissed);
  const signals: JobSignal[] = [];

  let outstandingTotal = 0;
  let outstandingOldCount = 0;

  for (const job of jobs) {
    if (job.status === "archived") continue;

    const days = daysInStatus(job, today);

    if (job.status === "paid") {
      if (days <= RECENTLY_PAID_DAYS) {
        signals.push({
          key: `paid:${job.id}`,
          kind: "recently-paid",
          tone: "neutral",
          jobId: job.id,
          days,
          amountCents: job.paidAmountExVatCents ?? job.feeExVatCents,
        });
      }
      continue;
    }

    if (job.status === OUTSTANDING_STATUS) {
      outstandingTotal += job.feeExVatCents;

      // A real due date that has passed outranks the day count: it is a
      // stronger and more specific statement, and it is the only case where
      // the word "overdue" is honest.
      if (isOverdue(job, today)) {
        signals.push({
          key: `overdue:${job.id}:${job.dueDate}`,
          kind: "payment-overdue",
          tone: "attention",
          jobId: job.id,
          days,
          amountCents: job.feeExVatCents,
        });
        outstandingOldCount += 1;
        continue;
      }

      const rung = highestRungReached(days, PAYMENT_WAITING_LADDER);
      if (rung !== null) {
        signals.push({
          key: `waiting:${job.id}:${rung}`,
          kind: "payment-waiting",
          tone: "attention",
          jobId: job.id,
          days,
          amountCents: job.feeExVatCents,
        });
        outstandingOldCount += 1;
      }
      continue;
    }

    // quoted or accepted: no money is owed, so this can only ever be a nudge
    // to ask for an answer.
    if (job.status === "quoted" && days >= QUOTE_WAITING_DAYS) {
      signals.push({
        key: `quote:${job.id}:${QUOTE_WAITING_DAYS}`,
        kind: "quote-waiting",
        tone: "neutral",
        jobId: job.id,
        days,
        amountCents: job.feeExVatCents,
      });
    }
  }

  // A single summary line, and only when it adds something the per-job lines
  // do not: more than one old item, or a total large enough to matter.
  if (outstandingTotal >= OUTSTANDING_TOTAL_FLOOR && outstandingOldCount > 1) {
    signals.push({
      key: `total:${outstandingOldCount}:${outstandingTotal}`,
      kind: "outstanding-total",
      tone: "attention",
      count: outstandingOldCount,
      amountCents: outstandingTotal as Cents,
    });
  }

  return signals.filter((s) => !seen.has(s.key));
}

function highestRungReached(
  days: number,
  ladder: readonly number[]
): number | null {
  let reached: number | null = null;
  for (const rung of ladder) {
    if (days >= rung) reached = rung;
  }
  return reached;
}
