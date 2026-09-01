"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { track } from "@/lib/analytics";
import { fdDict } from "@/lib/frontdesk/i18n";
import {
  placeInquiry,
  QUEUE_ORDER,
  type QueueKey,
  type QueuePlacement,
} from "@/lib/frontdesk/queue";
import type { FreelancerRow } from "@/components/frontdesk/auth-gate";
import {
  ReadinessCard,
  VoiceLearningCard,
  ConnectionHealthCard,
} from "@/components/frontdesk/readiness-checklist";
import { deriveGmailHealth, type GmailConnectionRow } from "@/lib/frontdesk/connectionHealth";
import type { GapPackage } from "@/lib/frontdesk/packageGaps";
import { buildTestFixture, testRegeneratedBody } from "@/lib/frontdesk/testFixture";
import {
  ActivityLogCard,
  AgentProgress,
  ApprovalContract,
  EvidenceList,
  PermissionMatrixCard,
} from "@/components/frontdesk/agent-surfaces";
import { deriveInquiryEvidence } from "@/lib/frontdesk/provenance";
import { deriveActivity } from "@/lib/frontdesk/activity";
import { GuardFailedPanel, GuardPanel } from "@/components/frontdesk/guard-panel";
import { PlanRail } from "@/components/frontdesk/plan-rail";
import { matchedPackage } from "@/lib/frontdesk/planSteps";
import { SourceChip } from "@/components/frontdesk/source-chip";
import { eventTypeLabel } from "@/lib/frontdesk/eventTypes";
import { mailtoHref } from "@/lib/frontdesk/draftBody";
import { AutomationRulesCard } from "@/components/frontdesk/automation-rules";
import { afterRun, type ApprovalSignal, type RuleRow } from "@/lib/frontdesk/rules";
import { deriveFollowupTimeline, resolveQuietDays } from "@/lib/frontdesk/followups";
import { FollowupScheduleCard, FollowupSettingsCard, MemoryListCard } from "@/components/frontdesk/memory-followups";
import { nextFollowupDate } from "@/lib/frontdesk/followups";

/**
 * One inbox. Every read and write here goes through the browser client under
 * RLS — the freelancer can only ever see and touch their own rows, proven by
 * execution in scripts/verify-frontdesk-rls.mjs.
 *
 * Outcome recording is the product's learning instrument: send-untouched is
 * 'sent_as_is', any edit before sending is 'edited' with the final body,
 * 'skipped' means the freelancer went their own way. The mailto is assembled
 * client-side; the client's address never travels anywhere else.
 */
interface InquiryRow {
  id: string;
  source: "form" | "email" | "sample";
  src_channel: string | null;
  client_name: string;
  client_email: string | null;
  event_date: string | null;
  event_type: string;
  event_type_other: string | null;
  budget_band: string;
  message: string | null;
  status: "new" | "replied" | "nudge_due" | "booked" | "lost";
  created_at: string;
  replied_at: string | null;
  snoozed_until: string | null;
}

interface DraftRow {
  id: string;
  created_at: string;
  language: string | null;
  inquiry_id: string;
  kind: "reply" | "nudge";
  body: string;
  final_body?: string | null;
  outcome: string | null;
  outcome_at?: string | null;
  dismiss_reason?: string | null;
  rule_id?: string | null;
  validation_status?: string | null;
  validation_failures?: string[] | null;
}

const primaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-5 text-base font-medium text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50";
const secondaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--fd-line-control)] bg-white px-5 text-base font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]";
const linkClass =
  "w-fit text-sm font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4 hover:decoration-[var(--fd-ink)]";

// Track B (Gmail) is off the handover path pending Google CASA verification.
// Flip back once that clears — see issue #34 / FS 2026-08-20.
const GMAIL_CONNECT_ENABLED = false;

export function InboxApp({
  session,
  freelancer,
}: {
  session: Session;
  freelancer: FreelancerRow;
}) {
  const dict = fdDict(freelancer.locale);
  const t = dict.inbox;
  const [inquiries, setInquiries] = useState<InquiryRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});
  const [allDrafts, setAllDrafts] = useState<DraftRow[]>([]);
  const [bioConfirmedAt, setBioConfirmedAt] = useState<string | null>(
    freelancer.link_in_bio_confirmed_at
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [editedBody, setEditedBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, DraftRow>>({});
  const [now, setNow] = useState(() => new Date());
  const [activeQueue, setActiveQueue] = useState<QueueKey>("review");
  const [queueChosen, setQueueChosen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"urgency" | "newest" | "eventDate" | "value">("urgency");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [confirmOutcome, setConfirmOutcome] = useState<"booked" | "lost" | null>(null);
  const [skipReasonOpen, setSkipReasonOpen] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<"connected" | "error" | null>(null);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [packages, setPackages] = useState<GapPackage[]>([]);
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [gmailConnection, setGmailConnection] = useState<GmailConnectionRow | null>(null);
  const [freelancerState, setFreelancerState] = useState(freelancer);
  // Test mode (§14.4): fictional data, zero writes. Derived from the URL so a
  // reload keeps the mode and leaving is a plain link back to /inbox.
  const [testMode, setTestMode] = useState(false);
  const [authBannerDismissed, setAuthBannerDismissed] = useState(true);

  const sb = supabaseBrowser();

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const status = params.get("gmail");
    if (status !== "connected" && status !== "error") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the OAuth callback's redirect param, not derivable from render since window.location isn't available server-side
    setGmailStatus(status);
    const url = new URL(window.location.href);
    url.searchParams.delete("gmail");
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Deep link (DEC-6, safe default): /inbox?i=<id> selects an inquiry,
  // /inbox?queue=<key> selects a queue. Read once on mount; kept in the URL
  // on open/close so a selection is shareable and survives a reload.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a per-device dismissal flag, unavailable during SSR
    setAuthBannerDismissed(localStorage.getItem("fd-auth-banner-dismissed") === "1");
    const params = new URL(window.location.href).searchParams;
    if (params.get("test") === "1") {
       
      setTestMode(true);
    }
    const q = params.get("queue") as QueueKey | null;
    if (q && QUEUE_ORDER.includes(q)) {
      setActiveQueue(q);
      setQueueChosen(true);
    }
    const i = params.get("i");
     
    if (i) setOpenId(i);
  }, []);

  function setTestModeAndReload(on: boolean) {
    const url = new URL(window.location.href);
    if (on) url.searchParams.set("test", "1");
    else url.searchParams.delete("test");
    url.searchParams.delete("i");
    window.history.replaceState({}, "", url.toString());
    setTestMode(on);
    setOpenId(null);
    void load();
  }

  function syncUrl(id: string | null) {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("i", id);
    else url.searchParams.delete("i");
    window.history.replaceState({}, "", url.toString());
  }

  async function connectGmail() {
    setConnectingGmail(true);
    try {
      const res = await fetch("/api/auth/google/connect", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (json.ok && json.url) {
        window.location.href = json.url;
        return;
      }
    } catch {
      // fall through, reset below
    }
    setConnectingGmail(false);
  }

  const load = useCallback(async () => {
    if (new URL(window.location.href).searchParams.get("test") === "1") {
      const nowTs = new Date();
      const fixture = buildTestFixture(nowTs, freelancer.locale);
      setInquiries(fixture.inquiries as InquiryRow[]);
      const latestFix: Record<string, DraftRow> = {};
      for (const d of fixture.drafts as DraftRow[]) {
        if (!latestFix[d.inquiry_id]) latestFix[d.inquiry_id] = d;
      }
      setDrafts(latestFix);
      setReplyDrafts(latestFix);
      setAllDrafts(fixture.drafts as DraftRow[]);
      setPackages([]);
      setLoadError(false);
      setNow(nowTs);
      return;
    }
    const { data: rows, error: inquiriesError } = await sb
      .from("inquiries")
      .select(
        "id, source, src_channel, client_name, client_email, event_date, event_type, event_type_other, budget_band, message, status, created_at, replied_at, snoozed_until",
      )
      .order("created_at", { ascending: false });
    if (inquiriesError) {
      setLoadError(true);
      return;
    }
    setInquiries((rows as InquiryRow[] | null) ?? []);
    const { data: draftRows, error: draftsError } = await sb
      .from("drafts")
      .select("id, inquiry_id, kind, body, final_body, outcome, outcome_at, dismiss_reason, rule_id, created_at, language, validation_status, validation_failures")
      .order("created_at", { ascending: false });
    if (draftsError) {
      setLoadError(true);
      return;
    }
    setLoadError(false);
    const latest: Record<string, DraftRow> = {};
    const latestReply: Record<string, DraftRow> = {};
    for (const d of (draftRows as DraftRow[] | null) ?? []) {
      if (!latest[d.inquiry_id]) latest[d.inquiry_id] = d;
      if (d.kind === "reply" && !latestReply[d.inquiry_id]) latestReply[d.inquiry_id] = d;
    }
    setDrafts(latest);
    setReplyDrafts(latestReply);
    setAllDrafts((draftRows as DraftRow[] | null) ?? []);
    const { data: packageRows } = await sb
      .from("packages")
      .select("label, price_from_eur, notes")
      .order("position");
    setPackages((packageRows as GapPackage[] | null) ?? []);
    const { data: ruleRows } = await sb
      .from("agent_rules")
      .select("id, trigger, action, status, trial_runs_left, ran_count, edited_count")
      .order("created_at", { ascending: false });
    setRules((ruleRows as RuleRow[] | null) ?? []);
    if (GMAIL_CONNECT_ENABLED) {
      const { data: gmailRow } = await sb
        .from("agent_gmail_connections")
        .select("connected_at, revoked_at, last_used_at")
        .maybeSingle();
      setGmailConnection((gmailRow as GmailConnectionRow | null) ?? null);
    }
    setNow(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sb is a singleton
  }, []);

  useEffect(() => {
     
    void load();
  }, [load]);

  // Master–detail focus management: on mobile the panes swap wholesale, on
  // desktop the detail fills in beside the list. Either way, moving focus to
  // the pane's heading tells assistive tech what just happened and keeps
  // keyboard users out of a hidden subtree. Skipped on first mount so page
  // load never steals focus.
  const listHeadingRef = useRef<HTMLHeadingElement>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (openId) detailHeadingRef.current?.focus();
    else listHeadingRef.current?.focus();
  }, [openId]);

  const timeZone = freelancer.timezone || "Europe/Amsterdam";
  const quietDays = resolveQuietDays(freelancerState.followup_quiet_days);
  const placements = useMemo(() => {
    const map: Record<string, QueuePlacement> = {};
    for (const inquiry of inquiries ?? []) {
      map[inquiry.id] = placeInquiry(
        inquiry,
        replyDrafts[inquiry.id] ?? null,
        now,
        timeZone,
        quietDays
      );
    }
    return map;
  }, [inquiries, replyDrafts, now, timeZone, quietDays]);

  const queueCounts = useMemo(() => {
    const counts = Object.fromEntries(QUEUE_ORDER.map((q) => [q, 0])) as Record<QueueKey, number>;
    for (const inquiry of inquiries ?? []) counts[placements[inquiry.id].queue] += 1;
    return counts;
  }, [inquiries, placements]);

  // Default tab: the highest-priority non-empty queue — "what next" answers
  // itself. Once the user picks a tab (or a deep link does), it sticks.
  useEffect(() => {
    if (queueChosen || !inquiries?.length) return;
    const first = QUEUE_ORDER.find((q) => queueCounts[q] > 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived initial tab; runs until the user or a deep link chooses
    if (first) setActiveQueue(first);
  }, [queueChosen, inquiries, queueCounts]);

  const BAND_RANK: Record<string, number> = { "2500+": 3, "1000-2500": 2, "<1000": 1, unsure: 0 };
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const rows = (inquiries ?? []).filter((inquiry) => {
      if (placements[inquiry.id].queue !== activeQueue) return false;
      if (typeFilter !== "all" && inquiry.event_type !== typeFilter) return false;
      if (!needle) return true;
      const hay = `${inquiry.client_name} ${inquiry.message ?? ""} ${
        eventTypeLabel(inquiry.event_type, inquiry.event_type_other, dict.public.form.types)
      }`.toLowerCase();
      return hay.includes(needle);
    });
    const byUrgency = (a: InquiryRow, b: InquiryRow) => {
      const da = placements[a.id].due;
      const db = placements[b.id].due;
      const oa = da?.kind === "overdue" ? da.days : -1;
      const ob = db?.kind === "overdue" ? db.days : -1;
      if (oa !== ob) return ob - oa;
      return a.created_at < b.created_at ? -1 : 1; // oldest first: longest waiting
    };
    const sorters: Record<string, (a: InquiryRow, b: InquiryRow) => number> = {
      urgency: byUrgency,
      newest: (a, b) => (a.created_at > b.created_at ? -1 : 1),
      eventDate: (a, b) => (a.event_date ?? "9999") < (b.event_date ?? "9999") ? -1 : 1,
      value: (a, b) => (BAND_RANK[b.budget_band] ?? 0) - (BAND_RANK[a.budget_band] ?? 0),
    };
    rows.sort(sorters[sortBy]);
    return [
      ...rows.filter((i) => i.source !== "sample"),
      ...rows.filter((i) => i.source === "sample"),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- BAND_RANK and dict are render-stable
  }, [inquiries, placements, activeQueue, typeFilter, search, sortBy]);

  const filtersActive = search.trim() !== "" || typeFilter !== "all";

  function dueLabel(placement: QueuePlacement): string | null {
    const due = placement.due;
    if (!due) return null;
    const q = t.queues.due;
    const withDate = (rel: string) => `${rel} (${due.date})`;
    if (due.kind === "overdue") return withDate(q.overdueBy.replace("{n}", String(due.days)));
    if (due.kind === "due_today") return withDate(q.dueToday);
    if (due.kind === "due_tomorrow") return withDate(q.dueTomorrow);
    if (due.kind === "snoozed") return q.snoozedUntil.replace("{date}", due.date);
    return withDate(q.dueInDays.replace("{n}", String(due.days)));
  }

  const open = openId ? inquiries?.find((i) => i.id === openId) : null;
  const openDraft = openId ? drafts[openId] : null;

  // A deep-linked open (?i=) sets openId before the drafts arrive and never
  // passes through openDetail — without this, copy/send would act on an
  // empty textarea. One initialization per opened inquiry; edits then win.
  const editedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!openId || !drafts[openId]) return;
    if (editedForRef.current === openId) return;
    editedForRef.current = openId;
     
    setEditedBody(drafts[openId].body ?? "");
  }, [openId, drafts]);

  function openDetail(inquiry: InquiryRow) {
    setOpenId(inquiry.id);
    editedForRef.current = inquiry.id;
    setEditedBody(drafts[inquiry.id]?.body ?? "");
    setCopied(false);
    setConfirmOutcome(null);
    setSkipReasonOpen(false);
    syncUrl(inquiry.id);
  }

  // Test-mode mutations happen in local state only; nothing leaves the tab.
  function patchLocalInquiry(id: string, patch: Partial<InquiryRow>) {
    setInquiries((prev) => prev?.map((i) => (i.id === id ? { ...i, ...patch } : i)) ?? prev);
  }
  function patchLocalDraft(id: string, patch: Partial<DraftRow>) {
    const apply = (d: DraftRow) => (d.id === id ? { ...d, ...patch } : d);
    setDrafts((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, apply(v)])));
    setReplyDrafts((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, apply(v)])));
    setAllDrafts((prev) => prev.map(apply));
  }

  async function recordOutcome(kind: "send" | "skip", dismissReason?: string) {
    if (!open || !openDraft) return;
    // §8.5: dismissal always carries a reason; the UI cannot reach this
    // branch without one.
    if (kind === "skip" && !dismissReason) return;
    track(kind === "skip" ? "draft_skipped" : "draft_sent");
    setSkipReasonOpen(false);
    if (testMode) {
      if (kind === "skip") {
        patchLocalDraft(openDraft.id, { outcome: "skipped", dismiss_reason: dismissReason });
      } else {
        const untouched = editedBody === openDraft.body;
        patchLocalDraft(openDraft.id, {
          outcome: untouched ? "sent_as_is" : "edited",
          final_body: untouched ? null : editedBody,
        });
        patchLocalInquiry(open.id, { status: "replied", replied_at: new Date().toISOString() });
      }
      setNow(new Date());
      return;
    }
    // A rule that produced this draft learns from the outcome (§6): an
    // unedited approval spends a trial run, an edit resets the trial and is
    // counted so drift stays visible.
    const producingRule = openDraft.rule_id
      ? rules.find((r) => r.id === openDraft.rule_id)
      : undefined;
    async function recordRuleRun(outcome: "sent_as_is" | "edited" | "skipped") {
      if (!producingRule) return;
      const next = afterRun(producingRule, outcome);
      await sb
        .from("agent_rules")
        .update({
          status: next.status,
          trial_runs_left: next.trial_runs_left,
          ran_count: next.ran_count,
          edited_count: next.edited_count,
          updated_at: new Date().toISOString(),
        })
        .eq("id", producingRule.id);
    }

    if (kind === "skip") {
      await recordRuleRun("skipped");
      await sb
        .from("drafts")
        .update({
          outcome: "skipped",
          dismiss_reason: dismissReason,
          outcome_at: new Date().toISOString(),
        })
        .eq("id", openDraft.id);
    } else {
      const untouched = editedBody === openDraft.body;
      await recordRuleRun(untouched ? "sent_as_is" : "edited");
      await sb
        .from("drafts")
        .update({
          outcome: untouched ? "sent_as_is" : "edited",
          final_body: untouched ? null : editedBody,
          outcome_at: new Date().toISOString(),
        })
        .eq("id", openDraft.id);
      await sb
        .from("inquiries")
        .update({ status: "replied", replied_at: new Date().toISOString() })
        .eq("id", open.id);
    }
    await load();
  }

  async function snooze(days: number | null) {
    if (!open) return;
    const until = days ? new Date(now.getTime() + days * 86_400_000).toISOString() : null;
    if (testMode) {
      patchLocalInquiry(open.id, { snoozed_until: until });
      setNow(new Date());
      return;
    }
    await sb.from("inquiries").update({ snoozed_until: until }).eq("id", open.id);
    await load();
  }

  async function setStatus(status: "booked" | "lost") {
    if (!open) return;
    if (testMode) {
      patchLocalInquiry(open.id, { status });
      setNow(new Date());
      return;
    }
    await sb.from("inquiries").update({ status }).eq("id", open.id);
    await load();
  }

  async function copyReply() {
    await navigator.clipboard.writeText(editedBody);
    track("draft_copied");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    await recordOutcome("send");
  }

  async function regenerate() {
    if (!open) return;
    if (testMode) {
      const draftId = drafts[open.id]?.id;
      if (draftId) {
        patchLocalDraft(draftId, {
          body: testRegeneratedBody(freelancer.locale, open.client_name),
          validation_status: "ready_for_review",
          validation_failures: [],
        });
        setEditedBody("");
        setNow(new Date());
      }
      return;
    }
    setRegenerating(true);
    await fetch("/api/frontdesk/drafts/regenerate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ inquiryId: open.id }),
    }).catch(() => null);
    track("draft_regenerated");
    setRegenerating(false);
    await load();
    setEditedBody("");
  }

  // Only the initial load has nothing on screen to preserve. A refresh that
  // fails after a write has already landed (e.g. recordOutcome, setStatus)
  // must not replace a successful action with a full-screen error — it reads
  // as "that didn't work" when it did. Surface those as an inline banner
  // instead, below, and keep whatever was already loaded.
  if (loadError && inquiries === null) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-10">
        <p role="alert" className="rounded-2xl border border-[var(--fd-error-text)] bg-white p-5 text-sm leading-relaxed text-[var(--fd-error-text)]">
          {t.loadError}
        </p>
        <button type="button" onClick={() => void load()} className={secondaryClass}>
          {t.retry}
        </button>
      </main>
    );
  }

  if (inquiries === null) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="text-sm text-[var(--fd-slate)]">{t.loading}</p>
      </main>
    );
  }

  const errorBanner = loadError ? (
    <p role="alert" className="rounded-2xl border border-[var(--fd-error-text)] bg-white p-4 text-sm leading-relaxed text-[var(--fd-error-text)]">
      {t.loadError}{" "}
      <button type="button" onClick={() => void load()} className="font-medium underline underline-offset-4">
        {t.retry}
      </button>
    </p>
  ) : null;

  // ----------------------------------------------------------- detail pane
  // On mobile this pane replaces the list, exactly as before; from lg up the
  // list stays put on the left and this fills the right column, so triaging
  // several inquiries no longer round-trips through "back to the list".
  const d = t.detail;
  const detailPane = open ? (
    <>
      <button
        type="button"
        onClick={() => (setOpenId(null), syncUrl(null))}
        className={`${linkClass} lg:hidden`}
      >
        ← {d.back}
      </button>

      <header className="flex flex-col gap-1">
        {/* h2, not h1: on desktop it renders beside the list's h1, and on
            mobile the list h1 is only display-hidden, so the outline keeps
            one h1 either way. Focus lands here when an inquiry is opened. */}
        <h2
          ref={detailHeadingRef}
          tabIndex={-1}
          className="flex items-center gap-2 font-serif text-2xl font-medium text-[var(--fd-ink)] outline-none"
        >
          {open.client_name}
          {open.source === "sample" && (
            <span className="rounded-full border border-[var(--fd-line-control)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
              {t.sampleBadge}
            </span>
          )}
        </h2>
        <p className="text-sm text-[var(--fd-slate)]">
          {eventTypeLabel(open.event_type, open.event_type_other, dict.public.form.types)}
          {open.event_date ? ` · ${d.date}: ${open.event_date}` : ""} · {d.budget}: {open.budget_band}
        </p>
      </header>

      {open.message && (
        <div className="flex flex-col gap-1 rounded-2xl border border-[var(--fd-line)] bg-white p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
            {d.message}
          </span>
          <p className="break-words whitespace-pre-line text-sm leading-relaxed text-[var(--fd-ink)]">
            {open.message}
          </p>
        </div>
      )}

      <EvidenceList locale={freelancer.locale} items={deriveInquiryEvidence(open)} />

        {openDraft?.rule_id && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[var(--fd-paper)] px-4 py-3">
            <span className="text-xs leading-relaxed text-[var(--fd-slate)]">
              {t.rules.producedBy.replace(
                "{rule}",
                (() => {
                  const rule = rules.find((r) => r.id === openDraft.rule_id);
                  if (!rule) return t.rules.producedByUnknown;
                  const shape = rule.trigger.event_type
                    ? (dict.public.form.types[
                        rule.trigger.event_type as keyof typeof dict.public.form.types
                      ] ?? rule.trigger.event_type)
                    : t.rules.anyInquiry;
                  return t.rules.sentence
                    .replace("{trigger}", shape)
                    .replace(
                      "{action}",
                      rule.action === "prepare_followup" ? t.rules.actionFollowup : t.rules.actionReply
                    );
                })()
              )}
            </span>
            <button
              type="button"
              onClick={async () => {
                if (!openDraft.rule_id) return;
                await sb.from("agent_rules").update({ status: "paused" }).eq("id", openDraft.rule_id);
                await load();
              }}
              className="text-xs font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4"
            >
              {t.rules.pause}
            </button>
          </div>
        )}

      {openDraft && openDraft.validation_status === "failed" ? (
        <GuardFailedPanel locale={freelancer.locale} failures={openDraft.validation_failures}>
          <AgentProgress
            locale={freelancer.locale}
            states={{ received: "done", drafting: "done", checks: "failed", ready: "pending" }}
          />
          <button
            type="button"
            disabled={regenerating}
            onClick={regenerate}
            className={`${secondaryClass} w-fit`}
          >
            {regenerating ? d.regenerating : d.regenerate}
          </button>
        </GuardFailedPanel>
      ) : openDraft ? (
        <div className="flex flex-col gap-3">
          <PlanRail
            locale={freelancer.locale}
            body={editedBody}
            packages={packages}
            eventType={eventTypeLabel(open.event_type, open.event_type_other, dict.public.form.types)}
            eventDate={open.event_date}
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
            {openDraft.kind === "nudge" ? d.draftNudge : d.draftReply}
          </span>
          <GuardPanel
            locale={freelancer.locale}
            status={openDraft.validation_status as never}
            failures={openDraft.validation_failures}
            body={editedBody}
            eventDate={open.event_date}
          />
          <textarea
            aria-label={openDraft.kind === "nudge" ? d.draftNudge : d.draftReply}
            rows={10}
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            className="min-h-56 w-full rounded-2xl border border-[var(--fd-line-control)] bg-white px-4 py-3 text-base leading-relaxed focus-visible:border-[var(--fd-focus-ring)] sm:text-sm focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none"
          />
          {(() => {
            // The price sentence's source note (§8.8). Rendered under the
            // draft, never inside it: validation language abutting the email
            // text is what made an earlier version read as part of the reply.
            const match = matchedPackage(editedBody, packages);
            if (!match) return null;
            return (
              <p className="flex flex-wrap items-center gap-1.5 text-xs leading-relaxed text-[var(--fd-slate)]">
                <SourceChip locale={freelancer.locale} kind="yours" />
                {t.plan.priceNote
                  .replace("{price}", match.asWritten)
                  .replace("{package}", match.label)}
              </p>
            );
          })()}
          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
            {open.client_email && (
              <a
                href={mailtoHref(open.client_email, d.subject, editedBody)}
                onClick={() => void recordOutcome("send")}
                className={`${primaryClass} min-h-[52px] w-full lg:min-h-12 lg:w-auto`}
              >
                {d.send}
              </a>
            )}
            <button
              type="button"
              onClick={copyReply}
              className={`${open.client_email ? secondaryClass : primaryClass} min-h-[52px] w-full lg:min-h-12 lg:w-auto`}
            >
              {copied ? d.copied : d.copy}
            </button>
            <button
              type="button"
              aria-expanded={skipReasonOpen}
              onClick={() => setSkipReasonOpen((v) => !v)}
              className={`${secondaryClass} min-h-[52px] w-full lg:hidden`}
            >
              {d.skip}
            </button>
            <button
              type="button"
              aria-expanded={skipReasonOpen}
              onClick={() => setSkipReasonOpen((v) => !v)}
              className={`${linkClass} hidden lg:inline`}
            >
              {d.skip}
            </button>
            <button
              type="button"
              onClick={() => (setOpenId(null), syncUrl(null))}
              className={`${secondaryClass} min-h-[52px] w-full lg:hidden`}
            >
              {d.decideLater}
            </button>
          </div>
          {skipReasonOpen && (
            <div
              role="group"
              aria-label={d.dismiss.prompt}
              className="flex flex-col gap-2 rounded-xl border border-[var(--fd-line)] bg-[var(--fd-paper)] p-3"
            >
              <p className="text-sm font-medium text-[var(--fd-ink)]">{d.dismiss.prompt}</p>
              <div className="flex flex-wrap gap-2">
                {(["wrong_client", "wrong_timing", "wrong_read", "not_interested"] as const).map(
                  (reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => void recordOutcome("skip", reason)}
                      className="inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-xs font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]"
                    >
                      {d.dismiss.reasons[reason]}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setSkipReasonOpen(false)}
                  className="inline-flex min-h-11 items-center px-2 text-xs font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]"
                >
                  {d.dismiss.keep}
                </button>
              </div>
            </div>
          )}
          <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{d.copyHint}</p>
          <ApprovalContract locale={freelancer.locale} hasRecipient={Boolean(open.client_email)} />
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--fd-line)] p-5">
          <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{d.draftPending}</p>
          <AgentProgress
            locale={freelancer.locale}
            states={{ received: "done", drafting: "active", checks: "pending", ready: "pending" }}
          />
          <button
            type="button"
            disabled={regenerating}
            onClick={regenerate}
            className={`${secondaryClass} w-fit`}
          >
            {regenerating ? d.regenerating : d.regenerate}
          </button>
        </div>
      )}

      {openDraft && openDraft.body && (
        <details className="rounded-2xl border border-[var(--fd-line)] bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--fd-ink)]">
            {t.why.heading}
          </summary>
          <div className="flex flex-col gap-2 pt-2 text-sm leading-relaxed text-[var(--fd-slate)]">
            <p>{t.why.language.replace("{lang}", openDraft.language === "nl" ? "Nederlands" : "English")}</p>
            <p>{t.why.checks}</p>
            <p>{t.why.prices}</p>
          </div>
        </details>
      )}

      {(open.status === "nudge_due" || open.status === "replied") && (
        <FollowupScheduleCard
          locale={freelancer.locale}
          timeline={deriveFollowupTimeline(
            open,
            allDrafts
              .filter((d) => d.inquiry_id === open.id && d.kind === "nudge")
              .map((d) => ({ outcome: d.outcome, body: d.body })),
            now
          )}
          nextDate={nextFollowupDate(
            open.replied_at,
            quietDays,
            freelancer.timezone || "Europe/Amsterdam",
          )}
          quietDays={quietDays}
        />
      )}

      <div
        role="group"
        aria-label={t.schedule.group}
        className="flex flex-wrap items-center gap-3 border-t border-[var(--fd-line)] pt-4"
      >
        {open.snoozed_until && new Date(open.snoozed_until) > now ? (
          <button type="button" onClick={() => void snooze(null)} className={secondaryClass}>
            {t.schedule.unsnooze}
          </button>
        ) : (
          <button type="button" onClick={() => void snooze(3)} className={secondaryClass}>
            {t.schedule.snooze3}
          </button>
        )}
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.schedule.snoozedNote}</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--fd-line)] pt-4">
        {confirmOutcome ? (
          <div
            role="group"
            aria-label={t.confirmOutcome[confirmOutcome]}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--fd-line-control)] bg-[var(--fd-paper)] p-4"
          >
            <p className="text-sm font-semibold text-[var(--fd-ink)]">
              {t.confirmOutcome[confirmOutcome]}
            </p>
            <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.confirmOutcome.note}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const outcome = confirmOutcome;
                  setConfirmOutcome(null);
                  void setStatus(outcome);
                }}
                className={primaryClass}
              >
                {t.confirmOutcome.confirm}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOutcome(null)}
                className={secondaryClass}
              >
                {t.confirmOutcome.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmOutcome("booked")}
              className={secondaryClass}
            >
              {d.markBooked}
            </button>
            <button
              type="button"
              onClick={() => setConfirmOutcome("lost")}
              className={secondaryClass}
            >
              {d.markLost}
            </button>
          </div>
        )}
      </div>
    </>
  ) : (
    <p className="rounded-2xl border border-dashed border-[var(--fd-line)] p-8 text-sm leading-relaxed text-[var(--fd-slate)]">
      {t.selectPrompt}
    </p>
  );

  // ------------------------------------------------- master–detail layout
  // One DOM, two shapes: a single column that swaps panes below lg (the
  // original behavior), a 24rem list beside a fluid detail pane from lg up.
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 lg:grid lg:h-dvh lg:min-h-0 lg:max-w-6xl lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-stretch lg:gap-x-10 lg:overflow-hidden lg:py-8">
      {errorBanner && <div className="lg:col-span-2">{errorBanner}</div>}

      <div className={`${open ? "hidden lg:flex" : "flex"} min-h-0 flex-col gap-6 lg:overflow-y-auto lg:pr-1`}>
        <h1
          ref={listHeadingRef}
          tabIndex={-1}
          className="font-serif text-2xl font-medium text-[var(--fd-ink)] outline-none"
        >
          {t.heading}
        </h1>

        {!authBannerDismissed && !testMode && (
          <div role="status" className="flex flex-col gap-2 rounded-2xl border border-[var(--fd-line)] bg-white p-4">
            <p className="text-sm font-medium text-[var(--fd-ink)]">{dict.auth.stricterBanner}</p>
            <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{dict.auth.stricterBannerBody}</p>
            <button
              type="button"
              onClick={() => {
                setAuthBannerDismissed(true);
                localStorage.setItem("fd-auth-banner-dismissed", "1");
              }}
              className="w-fit text-xs font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4 hover:decoration-[var(--fd-ink)]"
            >
              {dict.auth.stricterBannerDismiss}
            </button>
          </div>
        )}

        {testMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[var(--fd-ink)] bg-[var(--fd-paper)] p-4">
            <p className="text-sm leading-relaxed text-[var(--fd-ink)]">{t.testMode.banner}</p>
            <button
              type="button"
              onClick={() => setTestModeAndReload(false)}
              className="text-sm font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4 hover:decoration-[var(--fd-ink)]"
            >
              {t.testMode.exit}
            </button>
          </div>
        )}

        {!testMode && GMAIL_CONNECT_ENABLED && gmailStatus === "connected" && (
          <p role="status" className="rounded-2xl border border-[#22c55e] bg-white p-4 text-sm text-[var(--fd-ink)]">
            {t.gmail.connected}
          </p>
        )}
        {!testMode && GMAIL_CONNECT_ENABLED && gmailStatus === "error" && (
          <p role="alert" className="rounded-2xl border border-[var(--fd-error-text)] bg-white p-4 text-sm text-[var(--fd-error-text)]">
            {t.gmail.error}
          </p>
        )}
        {!testMode && GMAIL_CONNECT_ENABLED && (
          <ConnectionHealthCard
            locale={freelancer.locale}
            health={deriveGmailHealth(gmailConnection, now)}
            connecting={connectingGmail}
            onConnect={() => void connectGmail()}
          />
        )}

        {!testMode && (
        <ReadinessCard
          freelancer={freelancerState}
          inquiries={inquiries}
          allDrafts={allDrafts}
          packages={packages}
          bioConfirmedAt={bioConfirmedAt}
          onBioConfirmed={async () => {
            const now = new Date().toISOString();
            setBioConfirmedAt(now);
            await sb
              .from("freelancers")
              .update({ link_in_bio_confirmed_at: now })
              .eq("auth_user_id", session.user.id);
          }}
          gmailAvailable={GMAIL_CONNECT_ENABLED}
          gmailConnected={gmailConnection !== null && gmailConnection.revoked_at === null}
        />
        )}

        {!testMode && (
        <VoiceLearningCard
          freelancer={freelancerState}
          edits={allDrafts
            .filter((d) => d.outcome === "edited" && d.final_body)
            .map((d) => ({ body: d.body, final_body: d.final_body as string }))}
          onApply={async (change) => {
            const update: Record<string, unknown> = {};
            if (change.profile) update.voice_profile = change.profile;
            if (change.decisions) update.voice_proposal_decisions = change.decisions;
            if (change.paused !== undefined) update.voice_learning_paused = change.paused;
            setFreelancerState((f) => ({
              ...f,
              voice_profile: (change.profile ?? f.voice_profile) as Record<string, unknown> | null,
              voice_proposal_decisions: change.decisions ?? f.voice_proposal_decisions,
              voice_learning_paused: change.paused ?? f.voice_learning_paused,
            }));
            await sb.from("freelancers").update(update).eq("auth_user_id", session.user.id);
          }}
        />
        )}

        {inquiries.length > 0 && (
          <ActivityLogCard
            locale={freelancer.locale}
            entries={deriveActivity(inquiries, allDrafts)}
            onOpenInquiry={(id) => {
              const inquiry = inquiries.find((i) => i.id === id);
              if (inquiry) openDetail(inquiry);
            }}
          />
        )}

        {!testMode && (
          <PermissionMatrixCard
            locale={freelancer.locale}
            stored={freelancerState.permission_levels}
            onChange={async (levels) => {
              setFreelancerState((f) => ({ ...f, permission_levels: levels }));
              await sb
                .from("freelancers")
                .update({ permission_levels: levels })
                .eq("auth_user_id", session.user.id);
            }}
          />
        )}

        {!testMode && (
          <MemoryListCard
            freelancer={freelancerState}
            onApply={async (change) => {
              const update: Record<string, unknown> = {};
              if (change.profile) update.voice_profile = change.profile;
              if (change.decisions) update.voice_proposal_decisions = change.decisions;
              if (change.paused !== undefined) update.voice_learning_paused = change.paused;
              setFreelancerState((f) => ({
                ...f,
                voice_profile: (change.profile ?? f.voice_profile) as Record<string, unknown> | null,
                voice_proposal_decisions: change.decisions ?? f.voice_proposal_decisions,
                voice_learning_paused: change.paused ?? f.voice_learning_paused,
              }));
              await sb.from("freelancers").update(update).eq("auth_user_id", session.user.id);
            }}
          />
        )}

        {!testMode && (
          <AutomationRulesCard
            freelancer={freelancerState}
            rules={rules}
            approvals={allDrafts
              .filter((d) => d.outcome)
              .map((d) => {
                const inquiry = inquiries.find((i) => i.id === d.inquiry_id);
                return {
                  kind: d.kind,
                  event_type: inquiry?.event_type ?? "other",
                  budget_band: inquiry?.budget_band ?? "unsure",
                  outcome: d.outcome,
                } satisfies ApprovalSignal;
              })}
            onCreate={async (proposal) => {
              // evidenceCount -1 is the "don't suggest again" path: the rule
              // is stored declined so the shape never proposes itself again.
              await sb.from("agent_rules").insert({
                freelancer_id: freelancerState.id,
                trigger: proposal.trigger,
                action: proposal.action,
                status: proposal.evidenceCount === -1 ? "declined" : "trial",
              });
              await load();
            }}
            onUpdate={async (id, patch) => {
              await sb.from("agent_rules").update(patch).eq("id", id);
              await load();
            }}
            onDelete={async (id) => {
              await sb.from("agent_rules").delete().eq("id", id);
              await load();
            }}
            onPauseAll={async (paused) => {
              setFreelancerState((f) => ({ ...f, rules_paused: paused }));
              await sb
                .from("freelancers")
                .update({ rules_paused: paused })
                .eq("auth_user_id", session.user.id);
            }}
          />
        )}

        {!testMode && (
          <FollowupSettingsCard
            freelancer={freelancerState}
            quietDays={quietDays}
            onChange={async (change) => {
              const update: Record<string, unknown> = {};
              if (change.quietDays !== undefined) update.followup_quiet_days = change.quietDays;
              if (change.paused !== undefined) update.followups_paused = change.paused;
              setFreelancerState((f) => ({
                ...f,
                followup_quiet_days: change.quietDays ?? f.followup_quiet_days,
                followups_paused: change.paused ?? f.followups_paused,
              }));
              await sb.from("freelancers").update(update).eq("auth_user_id", session.user.id);
            }}
          />
        )}

        {inquiries.length === 0 ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fd-line)] bg-white p-5">
            <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.empty}</p>
            <button
              type="button"
              onClick={() => setTestModeAndReload(true)}
              className="w-fit text-left text-sm font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4 hover:decoration-[var(--fd-ink)]"
            >
              {t.testMode.enter}
            </button>
          </div>
        ) : (
          <>
            <div role="tablist" aria-label={t.heading} className="flex flex-wrap gap-1.5">
              {QUEUE_ORDER.map((q) => (
                <button
                  key={q}
                  type="button"
                  role="tab"
                  aria-selected={activeQueue === q}
                  onClick={() => {
                    setActiveQueue(q);
                    setQueueChosen(true);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    activeQueue === q
                      ? "border-[var(--fd-ink)] bg-[var(--fd-ink)] text-white"
                      : "border-[var(--fd-line-control)] bg-white text-[var(--fd-slate)] hover:border-[var(--fd-ink)] hover:text-[var(--fd-ink)]"
                  } focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)] focus-visible:outline-none`}
                >
                  {t.queues[q]} ({queueCounts[q]})
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-[var(--fd-slate)]">
                {t.toolbar.searchLabel}
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.toolbar.searchPlaceholder}
                  className="min-h-11 rounded-xl border border-[var(--fd-line-control)] bg-white px-3 text-base text-[var(--fd-ink)] focus-visible:border-[var(--fd-focus-ring)] sm:text-sm focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--fd-slate)]">
                {t.toolbar.sortLabel}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="min-h-11 rounded-xl border border-[var(--fd-line-control)] bg-white px-2 text-base text-[var(--fd-ink)] sm:text-sm"
                >
                  <option value="urgency">{t.toolbar.sortUrgency}</option>
                  <option value="newest">{t.toolbar.sortNewest}</option>
                  <option value="eventDate">{t.toolbar.sortEventDate}</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--fd-slate)]">
                {t.toolbar.typeLabel}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="min-h-11 rounded-xl border border-[var(--fd-line-control)] bg-white px-2 text-base text-[var(--fd-ink)] sm:text-sm"
                >
                  <option value="all">{t.toolbar.typeAll}</option>
                  {Object.entries(dict.public.form.types).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {filtersActive && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setTypeFilter("all");
                    setSortBy("urgency");
                  }}
                  className={`${linkClass} min-h-11`}
                >
                  {t.toolbar.reset}
                </button>
              )}
            </div>

            {visible.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--fd-line)] bg-white p-5">
                <p className="text-sm leading-relaxed text-[var(--fd-slate)]">
                  {filtersActive ? t.queues.empty.filtered : t.queues.empty[activeQueue]}
                </p>
                {filtersActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setTypeFilter("all");
                    }}
                    className={linkClass}
                  >
                    {t.queues.empty.resetFilters}
                  </button>
                )}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {visible.map((inquiry) => {
                  const placement = placements[inquiry.id];
                  const due = dueLabel(placement);
                  return (
                    <li key={inquiry.id}>
                      <button
                        type="button"
                        onClick={() => openDetail(inquiry)}
                        aria-current={inquiry.id === openId ? "true" : undefined}
                        className={`flex w-full flex-col gap-1 rounded-2xl border p-4 text-left transition hover:border-[var(--fd-ink)] ${
                          inquiry.id === openId
                            ? "border-[var(--fd-ink)] bg-[var(--fd-paper-dim)]"
                            : "border-[var(--fd-line)] bg-white"
                        }`}
                      >
                        <span className="flex w-full items-baseline justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-sm font-semibold text-[var(--fd-ink)]">
                              {inquiry.client_name}
                            </span>
                            {inquiry.source === "sample" && (
                              <span className="shrink-0 rounded-full border border-[var(--fd-line-control)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
                                {t.sampleBadge}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-[var(--fd-ink)]">
                            {t.queues.actions[placement.actionKey]}
                          </span>
                        </span>
                        <span className="flex w-full items-baseline justify-between gap-2">
                          <span className="truncate text-xs text-[var(--fd-slate)]">
                            {eventTypeLabel(inquiry.event_type, inquiry.event_type_other, dict.public.form.types)}
                            {inquiry.event_date ? ` · ${inquiry.event_date}` : ""} · {inquiry.budget_band}
                          </span>
                          <span className="shrink-0 text-xs text-[var(--fd-slate)]">
                            {due ?? inquiry.created_at.slice(0, 10)}
                          </span>
                        </span>
                        <span className="text-xs leading-relaxed text-[var(--fd-slate)]">
                          {t.queues.reasons[placement.reasonKey]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      <div className={`${open ? "flex" : "hidden lg:flex"} min-h-0 flex-col gap-6 lg:overflow-y-auto lg:pr-1`}>
        {detailPane}
      </div>
    </main>
  );
}


