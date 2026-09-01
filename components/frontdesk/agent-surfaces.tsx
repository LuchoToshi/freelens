"use client";

import { useState } from "react";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import {
  confidencePercent,
  type EvidenceItem,
  type ProvenanceKind,
} from "@/lib/frontdesk/provenance";
import {
  ACTION_ORDER,
  ACTION_RULES,
  effectiveLevel,
  type ActionKey,
  type AutomationLevel,
  type StoredLevels,
} from "@/lib/frontdesk/permissions";
import {
  ACTIVITY_TYPES,
  type ActivityEntry,
  type ActivityType,
} from "@/lib/frontdesk/activity";

/**
 * The Phase 4 agent surfaces (master spec §8, §9, §28): provenance chips and
 * the evidence list, the §8.5 approval contract, real work stages, the
 * permission matrix (display of the unbreakable ceilings; enforcement lives
 * in lib/frontdesk/permissions.ts and the server pipeline), and the derived
 * activity log.
 */

/** §9.2: text label + monospace glyph + aria; never colour alone. */
const KIND_GLYPH: Record<ProvenanceKind, string> = {
  fact: "=",
  you: "✎",
  inquiry: "❝",
  connected: "⇄",
  interpretation: "≈",
  suggestion: "→",
  missing: "∅",
  conflict: "≠",
};

export function ProvenanceChip({
  locale,
  kind,
}: {
  locale: FrontdeskLocale;
  kind: ProvenanceKind;
}) {
  const e = fdDict(locale).inbox.evidence;
  return (
    <span
      aria-label={e.kindAria.replace("{kind}", e.kinds[kind])}
      className="inline-flex items-center gap-1 rounded-md border border-[var(--fd-line)] bg-[var(--fd-paper)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--fd-slate)]"
    >
      <span aria-hidden="true" className="font-mono">
        {KIND_GLYPH[kind]}
      </span>
      {e.kinds[kind]}
    </span>
  );
}

export function EvidenceList({
  locale,
  items,
}: {
  locale: FrontdeskLocale;
  items: EvidenceItem[];
}) {
  const dict = fdDict(locale);
  const e = dict.inbox.evidence;
  const typeLabels = dict.public.form.types as Record<string, string>;
  const display = (item: EvidenceItem) =>
    item.field === "eventType" && item.value !== null
      ? (typeLabels[item.value] ?? item.value)
      : item.value;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[var(--fd-line)] bg-white p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
        {e.heading}
      </span>
      <dl className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.field} className="flex flex-wrap items-center gap-2 text-sm">
            <dt className="min-w-24 text-[var(--fd-slate)]">
              {e.fields[item.field as keyof typeof e.fields] ?? item.field}
            </dt>
            <dd className="flex flex-wrap items-center gap-2 text-[var(--fd-ink)]">
              {item.value === null ? (
                <span className="italic text-[var(--fd-slate)]">{e.notStated}</span>
              ) : (
                <span>{display(item)}</span>
              )}
              <ProvenanceChip locale={locale} kind={item.kind} />
              {item.confidence !== undefined && item.kind !== "missing" && (
                <span className="text-xs text-[var(--fd-slate)]">
                  {e.sure.replace("{n}", String(confidencePercent(item.confidence)))}
                </span>
              )}
              {item.kind === "conflict" && item.conflictWith && (
                <span className="text-xs text-[var(--fd-slate)]">
                  {e.conflictWith.replace("{value}", item.conflictWith)}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * §8.5: every proposed action shows the action, the reason, the sources,
 * what happens on approval, what stays with the user, and reversibility —
 * stated BEFORE the buttons, in words, with nothing pre-selected.
 */
export function ApprovalContract({
  locale,
  hasRecipient,
}: {
  locale: FrontdeskLocale;
  hasRecipient: boolean;
}) {
  const a = fdDict(locale).inbox.approval;
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[var(--fd-paper)] px-4 py-3 text-xs leading-relaxed text-[var(--fd-slate)]">
      <p>
        <span className="font-semibold text-[var(--fd-ink)]">{a.afterApprovalLabel}</span>{" "}
        {hasRecipient ? a.afterApprovalMail : a.afterApprovalCopy}
      </p>
      <p>
        <span className="font-semibold text-[var(--fd-ink)]">{a.userKeepsLabel}</span> {a.userKeeps}
      </p>
      <p>
        <span className="font-semibold text-[var(--fd-ink)]">{a.reversibleLabel}</span> {a.reversible}
      </p>
    </div>
  );
}

export type ProgressStage = "received" | "drafting" | "checks" | "ready";
export type StageState = "done" | "active" | "pending" | "failed";

/** DS `AgentProgress`: named real stages, never an endless spinner. */
export function AgentProgress({
  locale,
  states,
}: {
  locale: FrontdeskLocale;
  states: Record<ProgressStage, StageState>;
}) {
  const p = fdDict(locale).inbox.progress;
  const STAGES: ProgressStage[] = ["received", "drafting", "checks", "ready"];
  const mark: Record<StageState, string> = { done: "✓", active: "…", pending: "·", failed: "✕" };
  return (
    <ol aria-label={p.heading} className="flex flex-col gap-1">
      {STAGES.map((stage) => {
        const state = states[stage];
        return (
          <li key={stage} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[11px] ${
                state === "failed"
                  ? "border-[var(--fd-error-text)] text-[var(--fd-error-text)]"
                  : state === "done"
                    ? "border-[#16a34a] text-[#16a34a]"
                    : "border-[var(--fd-line-control)] text-[var(--fd-slate)]"
              }`}
            >
              {mark[state]}
            </span>
            <span
              className={
                state === "pending" ? "text-[var(--fd-slate)]" : "text-[var(--fd-ink)]"
              }
            >
              {p.stages[stage]}
              {state === "failed" && ` ${p.failedSuffix}`}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * DS `PermissionMatrix`: per-action levels with the hard ceiling named and
 * not raisable — the select simply has no options above it. What the agent
 * may do today only reaches "prepare for review"; the matrix still shows
 * every action so the promises (never send, never price, never confirm a
 * date) are visible as product facts.
 */
export function PermissionMatrixCard({
  locale,
  stored,
  onChange,
}: {
  locale: FrontdeskLocale;
  stored: StoredLevels;
  onChange: (levels: Record<string, number>) => Promise<void>;
}) {
  const m = fdDict(locale).inbox.permissions;
  const [busy, setBusy] = useState(false);

  // Only two actions are genuinely switchable today: preparing a reply draft
  // and preparing a follow-up draft. Everything else the agent might one day
  // do either has no code path or is capped at "you do it", so it is stated
  // as a fixed fact rather than offered as a control (handoff decisions 11,
  // 12, 13). Levels above "prepare for review" are gone from the UI: the
  // pipeline only ever asks isPermitted(..., 3, ...), so 4 and 5 changed
  // nothing while implying autonomy that does not exist.
  const TOGGLEABLE: ActionKey[] = ["prepare_reply", "prepare_followup"];
  const ON: AutomationLevel = 3;
  const OFF: AutomationLevel = 1;

  async function setEnabled(action: ActionKey, enabled: boolean) {
    setBusy(true);
    const next: Record<string, number> = {};
    for (const key of ACTION_ORDER) next[key] = effectiveLevel(key, stored);
    next[action] = Math.min(enabled ? ON : OFF, ACTION_RULES[action].ceiling);
    await onChange(next);
    setBusy(false);
  }

  return (
    <details className="rounded-2xl border border-[var(--fd-line)] bg-white px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--fd-ink)]">
        {m.heading}
      </summary>
      <div className="flex flex-col gap-3 pt-3">
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{m.intro}</p>

        {TOGGLEABLE.map((action) => {
          const enabled = effectiveLevel(action, stored) >= ON;
          return (
            <div key={action} className="flex flex-col gap-1">
              <label className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-[var(--fd-ink)]">{m.actions[action]}</span>
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={busy}
                    onChange={(e) => void setEnabled(action, e.target.checked)}
                    className="h-4 w-4 accent-[var(--fd-ink)]"
                  />
                  <span className="text-xs text-[var(--fd-slate)]">
                    {enabled ? m.on : m.off}
                  </span>
                </span>
              </label>
              <p className="text-[11px] leading-relaxed text-[var(--fd-slate)]">
                {(m.ceilingWhy as Record<string, string>)[action] ?? ""}
              </p>
            </div>
          );
        })}

        <div className="flex flex-col gap-2 border-t border-[var(--fd-line)] pt-3">
          {(["send_message", "confirm_date", "state_price"] as const).map((action) => (
            <p key={action} className="text-xs leading-relaxed text-[var(--fd-slate)]">
              <span className="font-medium text-[var(--fd-ink)]">{m.actions[action]}</span>{" "}
              {m.fixed[action]}
            </p>
          ))}
        </div>

        <p className="text-[11px] leading-relaxed text-[var(--fd-slate)]">{m.onlyToday}</p>
      </div>
    </details>
  );
}

/** DS `ActivityLog`: plain-language entries, filterable, derived. */
export function ActivityLogCard({
  locale,
  entries,
  onOpenInquiry,
}: {
  locale: FrontdeskLocale;
  entries: ActivityEntry[];
  onOpenInquiry: (id: string) => void;
}) {
  const a = fdDict(locale).inbox.activity;
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const visible = entries.filter((e) => filter === "all" || e.type === filter).slice(0, 30);

  return (
    <details className="rounded-2xl border border-[var(--fd-line)] bg-white px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--fd-ink)]">
        {a.heading}
      </summary>
      <div className="flex flex-col gap-3 pt-3">
        <label className="flex w-fit flex-col gap-1 text-xs font-medium text-[var(--fd-slate)]">
          {a.filterLabel}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActivityType | "all")}
            className="min-h-9 rounded-lg border border-[var(--fd-line-control)] bg-white px-2 text-xs text-[var(--fd-ink)]"
          >
            <option value="all">{a.filterAll}</option>
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {a.types[type.replace(".", "_") as keyof typeof a.types]}
              </option>
            ))}
          </select>
        </label>
        {visible.length === 0 ? (
          <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{a.empty}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {visible.map((entry, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="font-mono text-[11px] text-[var(--fd-slate)]">
                  {entry.at.slice(0, 10)}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenInquiry(entry.inquiryId)}
                  className="text-left text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4 hover:decoration-[var(--fd-ink)]"
                >
                  {a.texts[entry.type.replace(".", "_") as keyof typeof a.texts].replace("{name}", entry.clientName)}
                </button>
                {entry.reason && (
                  <span className="text-xs text-[var(--fd-slate)]">
                    ({a.reasons[entry.reason as keyof typeof a.reasons] ?? entry.reason})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
