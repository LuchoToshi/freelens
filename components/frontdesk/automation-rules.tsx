"use client";

import { useState } from "react";
import { fdDict } from "@/lib/frontdesk/i18n";
import {
  proposeRule,
  TRIAL_RUNS,
  type ApprovalSignal,
  type RuleProposal,
  type RuleRow,
} from "@/lib/frontdesk/rules";
import type { FreelancerRow } from "@/components/frontdesk/auth-gate";

/**
 * Automation rules (addendum §6): one proposal born from repeated approvals,
 * stated as a single sentence with the ceiling visibly non-editable, and a
 * management list with per-rule pause/delete plus a global brake. Every rule
 * starts as a trial: its runs still ask until it graduates.
 */
export function AutomationRulesCard({
  freelancer,
  rules,
  approvals,
  onCreate,
  onUpdate,
  onDelete,
  onPauseAll,
}: {
  freelancer: FreelancerRow;
  rules: RuleRow[];
  approvals: ApprovalSignal[];
  onCreate: (proposal: RuleProposal) => Promise<void>;
  onUpdate: (id: string, patch: { status: RuleRow["status"] }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPauseAll: (paused: boolean) => Promise<void>;
}) {
  const dict = fdDict(freelancer.locale);
  const r = dict.inbox.rules;
  const types = dict.public.form.types as Record<string, string>;
  const [busy, setBusy] = useState(false);

  const proposal = proposeRule(approvals, rules);
  const active = rules.filter((rule) => rule.status !== "declined");
  const paused = freelancer.rules_paused ?? false;
  if (!proposal && active.length === 0) return null;

  function sentence(trigger: RuleRow["trigger"], action: RuleRow["action"]) {
    const shape = trigger.event_type ? (types[trigger.event_type] ?? trigger.event_type) : r.anyInquiry;
    return r.sentence
      .replace("{trigger}", shape)
      .replace("{action}", action === "prepare_followup" ? r.actionFollowup : r.actionReply);
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    await fn();
    setBusy(false);
  }

  const linkClass =
    "w-fit text-xs font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)] disabled:opacity-50";

  return (
    <details className="rounded-2xl border border-[var(--fd-line)] bg-white px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--fd-ink)]">
        {r.heading}
      </summary>
      <div className="flex flex-col gap-3 pt-3">
        {proposal && (
          <div className="flex flex-col gap-2 rounded-xl bg-[var(--fd-paper)] p-3">
            <p className="text-sm leading-relaxed text-[var(--fd-ink)]">
              {sentence(proposal.trigger, proposal.action)}
            </p>
            <p className="text-xs text-[var(--fd-slate)]">
              {r.evidence.replace("{n}", String(proposal.evidenceCount))}
            </p>
            <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
              {r.trialNote.replace("{n}", String(TRIAL_RUNS))}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => onCreate(proposal))}
                className="inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-xs font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)] disabled:opacity-50"
              >
                {r.tryIt}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => onCreate({ ...proposal, evidenceCount: -1 }))}
                className={linkClass}
              >
                {r.dontSuggest}
              </button>
            </div>
          </div>
        )}

        {active.map((rule) => (
          <div key={rule.id} className="flex flex-col gap-1 border-t border-[var(--fd-line)] pt-3 first:border-0 first:pt-0">
            <p className="text-sm leading-relaxed text-[var(--fd-ink)]">
              {sentence(rule.trigger, rule.action)}
            </p>
            <p className="text-xs text-[var(--fd-slate)]">
              {rule.status === "trial"
                ? r.statusTrial.replace("{n}", String(rule.trial_runs_left))
                : rule.status === "paused"
                  ? r.statusPaused
                  : r.statusOn}
              {" · "}
              {r.counts
                .replace("{ran}", String(rule.ran_count))
                .replace("{edited}", String(rule.edited_count))}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(() =>
                    onUpdate(rule.id, { status: rule.status === "paused" ? "trial" : "paused" })
                  )
                }
                className={linkClass}
              >
                {rule.status === "paused" ? r.resume : r.pause}
              </button>
              <button type="button" disabled={busy} onClick={() => void run(() => onDelete(rule.id))} className={linkClass}>
                {r.delete}
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--fd-line)] pt-3">
          <button type="button" disabled={busy} onClick={() => void run(() => onPauseAll(!paused))} className={linkClass}>
            {paused ? r.resumeAll : r.pauseAll}
          </button>
          <span className="text-xs leading-relaxed text-[var(--fd-slate)]">{r.ceilingNote}</span>
        </div>
      </div>
    </details>
  );
}
