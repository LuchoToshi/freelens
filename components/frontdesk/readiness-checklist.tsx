"use client";

import { useState } from "react";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { deriveReadiness } from "@/lib/frontdesk/readiness";
import { detectPackageGaps, type GapPackage } from "@/lib/frontdesk/packageGaps";
import {
  deriveVoiceProposals,
  type ProposalDecisions,
  type VoiceProposal,
} from "@/lib/frontdesk/voiceLearning";
import type { ConnectionHealth } from "@/lib/frontdesk/connectionHealth";
import type { VoiceProfile } from "@/lib/frontdesk/prompts";
import type { FreelancerRow } from "@/components/frontdesk/auth-gate";
import { shareLinks } from "@/lib/frontdesk/shareLinks";

/**
 * The readiness surface (master spec §14): named requirements in two bands,
 * required gating go-live and optional improving quality — never a
 * percentage. Package gaps (§6.5) ride along as observations. Everything is
 * derived from rows the inbox already loads, so progress "survives leaving"
 * by construction.
 */

function Mark({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
        done
          ? "border-[#16a34a] bg-[#16a34a] text-white"
          : "border-[var(--fd-line-control)] bg-white text-transparent"
      }`}
    >
      ✓
    </span>
  );
}

const smallButtonClass =
  "inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] px-3 text-xs font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]";

export function ReadinessCard({
  freelancer,
  inquiries,
  allDrafts,
  packages,
  bioConfirmedAt,
  onBioConfirmed,
  gmailAvailable,
  gmailConnected,
}: {
  freelancer: FreelancerRow;
  inquiries: { id: string; source: string; src_channel: string | null; event_type: string }[];
  allDrafts: { outcome: string | null }[];
  packages: GapPackage[];
  bioConfirmedAt: string | null;
  onBioConfirmed: () => Promise<void>;
  gmailAvailable: boolean;
  gmailConnected: boolean;
}) {
  const dict = fdDict(freelancer.locale);
  const r = dict.inbox.readiness;
  const share = dict.setup.share;
  const [copied, setCopied] = useState<string | null>(null);

  const readiness = deriveReadiness({
    packages,
    voiceProfile: freelancer.voice_profile,
    linkConfirmedAt: bioConfirmedAt,
    inquiries,
    drafts: allDrafts,
    gmailAvailable,
    gmailConnected,
  });
  const gaps = detectPackageGaps(packages, inquiries);

  const allDone =
    readiness.readyToGoLive &&
    readiness.optional.every((i) => i.done) &&
    gaps.length === 0;
  if (allDone) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { variants } = shareLinks(origin, freelancer.handle);

  async function copyLink(url: string, tag: string) {
    await navigator.clipboard.writeText(url);
    setCopied(tag);
    setTimeout(() => setCopied(null), 2000);
  }

  function itemRow(item: { key: string; done: boolean }) {
    const copy = r.items[item.key as keyof typeof r.items];
    return (
      <div key={item.key} className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Mark done={item.done} />
          <span className="text-sm font-medium text-[var(--fd-ink)]">{copy.label}</span>
          {item.key === "link" && !item.done && (
            <button type="button" onClick={() => void onBioConfirmed()} className={smallButtonClass}>
              {r.linkDone}
            </button>
          )}
          {item.key === "testInquiry" && !item.done && (
            <a
              href={`/${freelancer.handle}`}
              target="_blank"
              rel="noreferrer"
              className={smallButtonClass}
            >
              {r.openPage}
            </a>
          )}
        </div>
        {!item.done && (
          <p className="pl-7 text-xs leading-relaxed text-[var(--fd-slate)]">{copy.why}</p>
        )}
        {item.key === "link" && !item.done && (
          <div className="flex flex-wrap gap-2 pl-7">
            {variants.map(({ tag, url }) => (
              <button
                key={tag}
                type="button"
                onClick={() => void copyLink(url, tag)}
                className="inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] px-3 text-xs font-medium text-[var(--fd-slate)] transition hover:border-[var(--fd-ink)] hover:text-[var(--fd-ink)]"
              >
                {copied === tag ? share.copied : share.variants[tag]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--fd-ink)] bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fd-ink)]">
        {r.heading}
      </h2>

      {!readiness.readyToGoLive && (
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{r.requiredHint}</p>
      )}
      {readiness.required.map(itemRow)}

      {readiness.optional.some((i) => !i.done) && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
            {r.optionalHeading}
          </h3>
          {readiness.optional.map(itemRow)}
        </>
      )}

      {gaps.length > 0 && (
        <div className="flex flex-col gap-1 rounded-xl bg-[var(--fd-paper)] p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
            {r.gaps.heading}
          </h3>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {gaps.map((g, i) => (
              <li key={i} className="text-xs leading-relaxed text-[var(--fd-slate)]">
                {g.key === "noPackages" && r.gaps.noPackages}
                {g.key === "unpricedPackage" && r.gaps.unpricedPackage.replace("{label}", g.detail ?? "")}
                {g.key === "uncoveredType" &&
                  (g.count
                    ? r.gaps.uncoveredTypeCounted
                        .replace("{n}", String(g.count))
                        .replace(
                          "{type}",
                          dict.public.form.types[g.detail as keyof typeof dict.public.form.types] ?? g.detail ?? ""
                        )
                    : r.gaps.uncoveredType.replace(
                        "{type}",
                        dict.public.form.types[g.detail as keyof typeof dict.public.form.types] ?? g.detail ?? ""
                      ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/**
 * Voice learning (§6.6): proposals derived from the freelancer's own edits,
 * shown with their evidence count. Accept applies the change to the profile;
 * reject records the decision so the proposal never resurfaces; pause stops
 * learning entirely and is reversible right here.
 */
export function VoiceLearningCard({
  freelancer,
  edits,
  onApply,
}: {
  freelancer: FreelancerRow;
  edits: { body: string; final_body: string }[];
  onApply: (change: {
    profile?: VoiceProfile;
    decisions?: ProposalDecisions;
    paused?: boolean;
  }) => Promise<void>;
}) {
  const dict = fdDict(freelancer.locale);
  const v = dict.inbox.voiceLearning;
  const [busy, setBusy] = useState(false);

  const profile = freelancer.voice_profile as VoiceProfile | null;
  if (!profile) return null;
  const decisions = (freelancer.voice_proposal_decisions ?? {}) as ProposalDecisions;
  const paused = freelancer.voice_learning_paused ?? false;

  const proposals = deriveVoiceProposals(profile, edits, decisions, paused);
  if (proposals.length === 0 && !paused) return null;

  function label(p: VoiceProposal): string {
    if (p.dimension === "sign_off") return v.proposeSignOff.replace("{value}", p.value);
    if (p.dimension === "emoji") return p.value === "never" ? v.proposeNoEmoji : v.proposeRareEmoji;
    return v.proposeShorter;
  }

  async function decide(p: VoiceProposal, accepted: boolean) {
    setBusy(true);
    // §12.6: retain the prior value so an acceptance is reversible from the
    // memory list; keep the evidence count for its "why".
    const prior = profile![p.dimension];
    const nextDecisions: ProposalDecisions = {
      ...decisions,
      [p.key]: {
        decision: accepted ? "accepted" : "rejected",
        prev: typeof prior === "string" ? prior : undefined,
        evidenceCount: p.evidenceCount,
        at: new Date().toISOString(),
      },
    };
    const nextProfile = accepted ? { ...profile!, [p.dimension]: p.value } : undefined;
    await onApply({ profile: nextProfile as VoiceProfile | undefined, decisions: nextDecisions });
    setBusy(false);
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fd-line)] bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fd-ink)]">
        {v.heading}
      </h2>

      {paused ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{v.pausedNote}</p>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onApply({ paused: false });
              setBusy(false);
            }}
            className={smallButtonClass}
          >
            {v.resume}
          </button>
        </div>
      ) : (
        <>
          {proposals.map((p) => (
            <div key={p.key} className="flex flex-col gap-2 rounded-xl bg-[var(--fd-paper)] p-3">
              <p className="text-sm leading-relaxed text-[var(--fd-ink)]">{label(p)}</p>
              <p className="text-xs text-[var(--fd-slate)]">
                {v.evidence
                  .replace("{n}", String(p.evidenceCount))
                  .replace("{m}", String(p.windowSize))}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => void decide(p, true)} className={smallButtonClass}>
                  {v.accept}
                </button>
                <button type="button" disabled={busy} onClick={() => void decide(p, false)} className={smallButtonClass}>
                  {v.reject}
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onApply({ paused: true });
              setBusy(false);
            }}
            className="w-fit text-xs font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]"
          >
            {v.pause}
          </button>
        </>
      )}
    </section>
  );
}

/**
 * Connection health (§15): every state names what happened, what was
 * affected, what was NOT affected, the safest next step, and the last
 * successful sync. The caller gates rendering on the integration flag.
 */
export function ConnectionHealthCard({
  locale,
  health,
  connecting,
  onConnect,
}: {
  locale: FrontdeskLocale;
  health: ConnectionHealth;
  connecting: boolean;
  onConnect: () => void;
}) {
  const c = fdDict(locale).inbox.connection;
  const copy = c.states[health.state];
  const showConnect = health.state === "disconnected" || health.state === "revoked" || health.state === "expired";

  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-[var(--fd-line)] bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fd-ink)]">
        {c.heading}
      </h2>
      <p className="text-sm font-medium text-[var(--fd-ink)]">{copy.happened}</p>
      <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
        {copy.affected} {copy.unaffected}
      </p>
      <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{copy.next}</p>
      <p className="text-xs text-[var(--fd-slate)]">
        {health.lastSyncAt
          ? c.lastSync.replace("{date}", health.lastSyncAt.slice(0, 10))
          : c.neverSynced}
      </p>
      {showConnect && (
        <button
          type="button"
          disabled={connecting}
          onClick={onConnect}
          className={`${smallButtonClass} w-fit`}
        >
          {connecting ? c.connecting : c.connect}
        </button>
      )}
    </section>
  );
}
