"use client";

import { useState } from "react";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import {
  deriveMemoryItems,
  resetLearned,
  revertLearned,
} from "@/lib/frontdesk/memory";
import type { ProposalDecisions } from "@/lib/frontdesk/voiceLearning";
import type { VoiceProfile } from "@/lib/frontdesk/prompts";
import {
  MAX_NUDGES,
  MAX_QUIET_DAYS,
  MIN_QUIET_DAYS,
  type FollowupTimeline,
} from "@/lib/frontdesk/followups";
import type { FreelancerRow } from "@/components/frontdesk/auth-gate";

/**
 * Phase 5 surfaces (master spec §11, §12): the memory list keeping typed
 * settings and learned preferences visually distinct, the per-inquiry
 * follow-up schedule, and the global follow-up settings (cadence + pause).
 */

const smallButtonClass =
  "inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] px-3 text-xs font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]";
const smallLinkClass =
  "w-fit text-xs font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]";

export function MemoryListCard({
  freelancer,
  onApply,
}: {
  freelancer: FreelancerRow;
  onApply: (change: {
    profile?: VoiceProfile;
    decisions?: ProposalDecisions;
    paused?: boolean;
  }) => Promise<void>;
}) {
  const m = fdDict(freelancer.locale).inbox.memory;
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const profile = freelancer.voice_profile as VoiceProfile | null;
  if (!profile) return null;
  const decisions = (freelancer.voice_proposal_decisions ?? {}) as ProposalDecisions;
  const paused = freelancer.voice_learning_paused ?? false;
  const items = deriveMemoryItems(profile, decisions);
  const hasLearned = items.some((i) => i.source === "learned");

  async function apply(change: Parameters<typeof onApply>[0]) {
    setBusy(true);
    await onApply(change);
    setBusy(false);
  }

  return (
    <details className="rounded-2xl border border-[var(--fd-line)] bg-white px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--fd-ink)]">
        {m.heading}
      </summary>
      <div className="flex flex-col gap-3 pt-3">
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{m.intro}</p>

        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.dimension} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="text-[var(--fd-slate)]">
                  {m.dimensions[item.dimension as keyof typeof m.dimensions] ?? item.dimension}
                </span>
                <span className="text-[var(--fd-ink)]">{item.value}</span>
                <span
                  className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${
                    item.source === "learned"
                      ? "border-[var(--fd-ink)] text-[var(--fd-ink)]"
                      : "border-[var(--fd-line)] text-[var(--fd-slate)]"
                  }`}
                >
                  {item.source === "learned" ? m.learnedBadge : m.settingBadge}
                </span>
              </div>
              {item.source === "learned" && (
                <div className="flex flex-wrap items-center gap-3 pl-2">
                  {item.evidenceCount !== undefined && (
                    <span className="text-xs text-[var(--fd-slate)]">
                      {m.learnedWhy.replace("{n}", String(item.evidenceCount))}
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void apply(revertLearned(item.decisionKey!, profile, decisions))
                    }
                    className={smallLinkClass}
                  >
                    {m.revert}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void apply({
                        decisions: {
                          ...decisions,
                          [`never:${item.dimension}`]: { decision: "rejected" },
                        },
                      })
                    }
                    className={smallLinkClass}
                  >
                    {m.neverLearn}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{m.editHint}</p>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--fd-line)] pt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void apply({ paused: !paused })}
            className={smallLinkClass}
          >
            {paused ? m.resume : m.pause}
          </button>
          {hasLearned &&
            (confirmReset ? (
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--fd-slate)]">{m.resetConfirm}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setConfirmReset(false);
                    void apply(resetLearned(profile, decisions));
                  }}
                  className={smallButtonClass}
                >
                  {m.resetYes}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className={smallLinkClass}
                >
                  {m.resetNo}
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className={smallLinkClass}>
                {m.reset}
              </button>
            ))}
        </div>
      </div>
    </details>
  );
}

/** DS `FollowUpSchedule`, per inquiry: cap, state, and the standing brakes. */
export function FollowupScheduleCard({
  locale,
  timeline,
  quietDays,
}: {
  locale: FrontdeskLocale;
  timeline: FollowupTimeline;
  quietDays: number;
}) {
  const f = fdDict(locale).inbox.followupSchedule;
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[var(--fd-paper)] px-4 py-3 text-xs leading-relaxed text-[var(--fd-slate)]">
      <p className="font-medium text-[var(--fd-ink)]">
        {f.capLine
          .replace("{used}", String(timeline.used))
          .replace("{cap}", String(timeline.cap))}{" "}
        · {f.states[timeline.stateKey]}
      </p>
      <p>{f.why.replace("{days}", String(quietDays))}</p>
      <p>{f.brakes}</p>
    </div>
  );
}

/** Global cadence and pause (§11.3, §11.4). */
export function FollowupSettingsCard({
  freelancer,
  quietDays,
  onChange,
}: {
  freelancer: FreelancerRow;
  quietDays: number;
  onChange: (change: { quietDays?: number; paused?: boolean }) => Promise<void>;
}) {
  const f = fdDict(freelancer.locale).inbox.followupSettings;
  const [busy, setBusy] = useState(false);
  const paused = freelancer.followups_paused ?? false;

  return (
    <details className="rounded-2xl border border-[var(--fd-line)] bg-white px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--fd-ink)]">
        {f.heading}
      </summary>
      <div className="flex flex-col gap-3 pt-3">
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{f.intro.replace("{cap}", String(MAX_NUDGES))}</p>
        <label className="flex w-fit flex-col gap-1 text-xs font-medium text-[var(--fd-slate)]">
          {f.cadenceLabel}
          <select
            value={quietDays}
            disabled={busy || paused}
            onChange={(e) => {
              setBusy(true);
              void onChange({ quietDays: Number(e.target.value) }).then(() => setBusy(false));
            }}
            className="min-h-9 rounded-lg border border-[var(--fd-line-control)] bg-white px-2 text-xs text-[var(--fd-ink)]"
          >
            {Array.from(
              { length: MAX_QUIET_DAYS - MIN_QUIET_DAYS + 1 },
              (_, i) => i + MIN_QUIET_DAYS
            ).map((d) => (
              <option key={d} value={d}>
                {f.cadenceOption.replace("{days}", String(d))}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void onChange({ paused: !paused }).then(() => setBusy(false));
            }}
            className={smallButtonClass}
          >
            {paused ? f.resume : f.pause}
          </button>
          {paused && <span className="text-xs text-[var(--fd-slate)]">{f.pausedNote}</span>}
        </div>
      </div>
    </details>
  );
}
