/**
 * Reusable automations (addendum §6). Rules are born ONLY from repeated
 * approvals: five identical unedited approvals of the same shape propose one.
 * A proposal states one plain sentence — When [trigger], Freelens [action].
 * You keep: [ceiling] — and starts as a TRIAL: the next three runs still ask,
 * an unedited approval graduates it, an edit keeps it in trial.
 *
 * Ceilings are not part of the sentence's editable half: a rule can only ever
 * carry the two prepare-actions, and rule output still lands for review, so a
 * rule can never send, price, confirm a date, or close a lead.
 */

export const PROPOSE_AFTER = 5;
export const TRIAL_RUNS = 3;

export type RuleAction = "prepare_reply" | "prepare_followup";
export type RuleStatus = "proposed" | "trial" | "on" | "paused" | "declined";

export interface RuleTrigger {
  /** The inquiry shape this rule reacts to. */
  event_type: string | null;
  budget_band: string | null;
}

export interface RuleRow {
  id: string;
  trigger: RuleTrigger;
  action: RuleAction;
  status: RuleStatus;
  trial_runs_left: number;
  ran_count: number;
  edited_count: number;
}

export interface ApprovalSignal {
  /** The approved draft's kind decides the action. */
  kind: "reply" | "nudge";
  event_type: string;
  budget_band: string;
  /** `sent_as_is` is unedited; `edited` never counts toward a proposal. */
  outcome: string | null;
}

export interface RuleProposal {
  trigger: RuleTrigger;
  action: RuleAction;
  evidenceCount: number;
}

function signalKey(signal: ApprovalSignal): string {
  const action = signal.kind === "nudge" ? "prepare_followup" : "prepare_reply";
  return `${action}|${signal.event_type}|${signal.budget_band}`;
}

/**
 * A proposal, or null. Only unedited approvals count (§6: an edit means the
 * draft wasn't right as written, which is the opposite of evidence), and an
 * existing or declined rule for the same shape suppresses the proposal.
 */
export function proposeRule(
  approvals: readonly ApprovalSignal[],
  existing: readonly RuleRow[]
): RuleProposal | null {
  const counts = new Map<string, number>();
  for (const signal of approvals) {
    if (signal.outcome !== "sent_as_is") continue;
    const key = signalKey(signal);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const taken = new Set(
    existing.map((r) => `${r.action}|${r.trigger.event_type}|${r.trigger.budget_band}`)
  );
  for (const [key, count] of counts) {
    if (count < PROPOSE_AFTER || taken.has(key)) continue;
    const [action, eventType, budgetBand] = key.split("|");
    return {
      trigger: { event_type: eventType, budget_band: budgetBand },
      action: action as RuleAction,
      evidenceCount: count,
    };
  }
  return null;
}

/**
 * Does this rule act on this inquiry right now? A paused rule, a paused
 * account, and a declined rule all answer no; a trial rule answers yes but
 * its output still asks (the caller keeps the review step either way).
 */
export function ruleApplies(
  rule: RuleRow,
  inquiry: { event_type: string; budget_band: string },
  rulesPaused: boolean
): boolean {
  if (rulesPaused) return false;
  if (rule.status !== "on" && rule.status !== "trial") return false;
  if (rule.trigger.event_type && rule.trigger.event_type !== inquiry.event_type) return false;
  if (rule.trigger.budget_band && rule.trigger.budget_band !== inquiry.budget_band) return false;
  return true;
}

/**
 * One run's effect on a trial rule: an unedited approval spends a trial run
 * and graduates at zero; an edit resets the trial (§6: "an edit keeps it in
 * trial") and is counted so drift stays visible.
 */
export function afterRun(rule: RuleRow, outcome: "sent_as_is" | "edited" | "skipped"): RuleRow {
  const next: RuleRow = { ...rule, ran_count: rule.ran_count + 1 };
  if (outcome === "edited") {
    next.edited_count = rule.edited_count + 1;
    if (rule.status === "trial") next.trial_runs_left = TRIAL_RUNS;
    return next;
  }
  if (outcome === "skipped") return next;
  if (rule.status === "trial") {
    next.trial_runs_left = Math.max(0, rule.trial_runs_left - 1);
    if (next.trial_runs_left === 0) next.status = "on";
  }
  return next;
}
