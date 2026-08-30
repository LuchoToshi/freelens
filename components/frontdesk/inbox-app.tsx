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
  event_type: "wedding" | "party" | "business" | "portrait" | "other";
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
  validation_status?: string | null;
  validation_failures?: string[] | null;
}

/** Plain-language line for a stored validation failure code (§10.7). Codes
 * may carry a suffix (price-not-in-packages:1950, date-mismatch:2027); the
 * prefix picks the copy and unknown codes fall back to the raw code, which
 * is still text-first and honest. */
function validationReason(code: string, d: { validation: { reasons: Record<string, string> } }): string {
  const base = code.split(":")[0];
  const key = base.startsWith("reply-length") || base.startsWith("nudge-length") ? "length" : base;
  return d.validation.reasons[key] ?? code;
}

function mailtoHref(email: string, subject: string, body: string): string {
  const crlf = body.replace(/\n/g, "\r\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlf)}`;
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
  const [gmailStatus, setGmailStatus] = useState<"connected" | "error" | null>(null);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [packages, setPackages] = useState<GapPackage[]>([]);
  const [gmailConnection, setGmailConnection] = useState<GmailConnectionRow | null>(null);
  const [freelancerState, setFreelancerState] = useState(freelancer);

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
    const params = new URL(window.location.href).searchParams;
    const q = params.get("queue") as QueueKey | null;
    if (q && QUEUE_ORDER.includes(q)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a URL param, unavailable during SSR
      setActiveQueue(q);
      setQueueChosen(true);
    }
    const i = params.get("i");
     
    if (i) setOpenId(i);
  }, []);

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
    const { data: rows, error: inquiriesError } = await sb
      .from("inquiries")
      .select("id, source, src_channel, client_name, client_email, event_date, event_type, budget_band, message, status, created_at, replied_at, snoozed_until")
      .order("created_at", { ascending: false });
    if (inquiriesError) {
      setLoadError(true);
      return;
    }
    setInquiries((rows as InquiryRow[] | null) ?? []);
    const { data: draftRows, error: draftsError } = await sb
      .from("drafts")
      .select("id, inquiry_id, kind, body, final_body, outcome, created_at, language, validation_status, validation_failures")
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch; load() only calls setState after awaited network responses, never synchronously in the effect body
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
  const placements = useMemo(() => {
    const map: Record<string, QueuePlacement> = {};
    for (const inquiry of inquiries ?? []) {
      map[inquiry.id] = placeInquiry(inquiry, replyDrafts[inquiry.id] ?? null, now, timeZone);
    }
    return map;
  }, [inquiries, replyDrafts, now, timeZone]);

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
        dict.public.form.types[inquiry.event_type]
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

  function openDetail(inquiry: InquiryRow) {
    setOpenId(inquiry.id);
    setEditedBody(drafts[inquiry.id]?.body ?? "");
    setCopied(false);
    setConfirmOutcome(null);
    syncUrl(inquiry.id);
  }

  async function recordOutcome(kind: "send" | "skip") {
    if (!open || !openDraft) return;
    track(kind === "skip" ? "draft_skipped" : "draft_sent");
    if (kind === "skip") {
      await sb
        .from("drafts")
        .update({ outcome: "skipped", outcome_at: new Date().toISOString() })
        .eq("id", openDraft.id);
    } else {
      const untouched = editedBody === openDraft.body;
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
    await sb.from("inquiries").update({ snoozed_until: until }).eq("id", open.id);
    await load();
  }

  async function setStatus(status: "booked" | "lost") {
    if (!open) return;
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
          {dict.public.form.types[open.event_type]}
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

      {openDraft && openDraft.validation_status === "failed" ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-[var(--fd-error-text)]/40 bg-white p-5"
        >
          <span className="text-sm font-semibold text-[var(--fd-ink)]">
            {d.validation.failedHeading}
          </span>
          <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{d.validation.failedIntro}</p>
          <ul className="list-disc pl-5 text-sm leading-relaxed text-[var(--fd-slate)]">
            {(openDraft.validation_failures ?? []).map((code) => (
              <li key={code}>{validationReason(code, d)}</li>
            ))}
          </ul>
          <button
            type="button"
            disabled={regenerating}
            onClick={regenerate}
            className={`${secondaryClass} w-fit`}
          >
            {regenerating ? d.regenerating : d.regenerate}
          </button>
        </div>
      ) : openDraft ? (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
            {openDraft.kind === "nudge" ? d.draftNudge : d.draftReply}
          </span>
          {openDraft.validation_status === "needs_review" &&
            (openDraft.validation_failures ?? []).length > 0 && (
              <div
                role="status"
                className="rounded-xl border border-[var(--fd-line)] bg-[var(--fd-paper)] px-4 py-3 text-sm leading-relaxed text-[var(--fd-slate)]"
              >
                <p className="font-medium text-[var(--fd-ink)]">{d.validation.needsReview}</p>
                <ul className="list-disc pl-5">
                  {(openDraft.validation_failures ?? []).map((code) => (
                    <li key={code}>{validationReason(code, d)}</li>
                  ))}
                </ul>
              </div>
            )}
          {openDraft.validation_status === "ready_for_review" && (
            <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
              {d.validation.checksPassed}
            </p>
          )}
          <textarea
            aria-label={openDraft.kind === "nudge" ? d.draftNudge : d.draftReply}
            rows={10}
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            className="min-h-56 w-full rounded-2xl border border-[var(--fd-line-control)] bg-white px-4 py-3 text-sm leading-relaxed focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            {open.client_email && (
              <a
                href={mailtoHref(open.client_email, d.subject, editedBody)}
                onClick={() => void recordOutcome("send")}
                className={primaryClass}
              >
                {d.send}
              </a>
            )}
            <button
              type="button"
              onClick={copyReply}
              className={open.client_email ? secondaryClass : primaryClass}
            >
              {copied ? d.copied : d.copy}
            </button>
            <button type="button" onClick={() => void recordOutcome("skip")} className={linkClass}>
              {d.skip}
            </button>
          </div>
          <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{d.copyHint}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--fd-line)] p-5">
          <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{d.draftPending}</p>
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

        {GMAIL_CONNECT_ENABLED && gmailStatus === "connected" && (
          <p role="status" className="rounded-2xl border border-[#22c55e] bg-white p-4 text-sm text-[var(--fd-ink)]">
            {t.gmail.connected}
          </p>
        )}
        {GMAIL_CONNECT_ENABLED && gmailStatus === "error" && (
          <p role="alert" className="rounded-2xl border border-[var(--fd-error-text)] bg-white p-4 text-sm text-[var(--fd-error-text)]">
            {t.gmail.error}
          </p>
        )}
        {GMAIL_CONNECT_ENABLED && (
          <ConnectionHealthCard
            locale={freelancer.locale}
            health={deriveGmailHealth(gmailConnection, now)}
            connecting={connectingGmail}
            onConnect={() => void connectGmail()}
          />
        )}

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

        {inquiries.length === 0 ? (
          <p className="rounded-2xl border border-[var(--fd-line)] bg-white p-5 text-sm leading-relaxed text-[var(--fd-slate)]">
            {t.empty}
          </p>
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
                  className="min-h-11 rounded-xl border border-[var(--fd-line-control)] bg-white px-3 text-sm text-[var(--fd-ink)] focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--fd-slate)]">
                {t.toolbar.sortLabel}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="min-h-11 rounded-xl border border-[var(--fd-line-control)] bg-white px-2 text-sm text-[var(--fd-ink)]"
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
                  className="min-h-11 rounded-xl border border-[var(--fd-line-control)] bg-white px-2 text-sm text-[var(--fd-ink)]"
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
                            {dict.public.form.types[inquiry.event_type]}
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


