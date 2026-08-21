"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { track } from "@/lib/analytics";
import { fdDict } from "@/lib/frontdesk/i18n";
import type { FreelancerRow } from "@/components/frontdesk/auth-gate";
import { shareLinks } from "@/lib/frontdesk/shareLinks";

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
}

interface DraftRow {
  id: string;
  inquiry_id: string;
  kind: "reply" | "nudge";
  body: string;
  outcome: string | null;
}

const STATUS_DOT: Record<InquiryRow["status"], string> = {
  new: "bg-[#3b82f6]",
  replied: "bg-[var(--fd-line-control)]",
  nudge_due: "bg-[#f59e0b]",
  booked: "bg-[#22c55e]",
  lost: "bg-[#9ca3af]",
};

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
  const [gmailStatus, setGmailStatus] = useState<"connected" | "error" | null>(null);
  const [connectingGmail, setConnectingGmail] = useState(false);

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
      .select("id, source, src_channel, client_name, client_email, event_date, event_type, budget_band, message, status, created_at")
      .order("created_at", { ascending: false });
    if (inquiriesError) {
      setLoadError(true);
      return;
    }
    setLoadError(false);
    setInquiries((rows as InquiryRow[] | null) ?? []);
    const { data: draftRows } = await sb
      .from("drafts")
      .select("id, inquiry_id, kind, body, outcome")
      .order("created_at", { ascending: false });
    const latest: Record<string, DraftRow> = {};
    for (const d of (draftRows as DraftRow[] | null) ?? []) {
      if (!latest[d.inquiry_id]) latest[d.inquiry_id] = d;
    }
    setDrafts(latest);
    setAllDrafts((draftRows as DraftRow[] | null) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sb is a singleton
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch; load() only calls setState after awaited network responses, never synchronously in the effect body
    void load();
  }, [load]);

  const sorted = inquiries
    ? [...inquiries.filter((i) => i.source !== "sample"), ...inquiries.filter((i) => i.source === "sample")]
    : null;

  const open = openId ? inquiries?.find((i) => i.id === openId) : null;
  const openDraft = openId ? drafts[openId] : null;

  function openDetail(inquiry: InquiryRow) {
    setOpenId(inquiry.id);
    setEditedBody(drafts[inquiry.id]?.body ?? "");
    setCopied(false);
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

  if (loadError) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <p role="alert" className="rounded-2xl border border-[var(--fd-error-text)] bg-white p-5 text-sm leading-relaxed text-[var(--fd-error-text)]">
          {t.loadError}
        </p>
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

  // ------------------------------------------------------------ detail view
  if (open) {
    const d = t.detail;
    const typeLabel = dict.public.form.types[open.event_type];
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
        <button type="button" onClick={() => setOpenId(null)} className={linkClass}>
          ← {d.back}
        </button>

        <header className="flex flex-col gap-1">
          <h1 className="flex items-center gap-2 font-serif text-2xl font-medium text-[var(--fd-ink)]">
            {open.client_name}
            {open.source === "sample" && (
              <span className="rounded-full border border-[var(--fd-line-control)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
                {t.sampleBadge}
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--fd-slate)]">
            {typeLabel}
            {open.event_date ? ` · ${d.date}: ${open.event_date}` : ""} · {d.budget}: {open.budget_band}
          </p>
        </header>

        {open.message && (
          <div className="flex flex-col gap-1 rounded-2xl border border-[var(--fd-line)] bg-white p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
              {d.message}
            </span>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--fd-ink)]">
              {open.message}
            </p>
          </div>
        )}

        {openDraft ? (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
              {openDraft.kind === "nudge" ? d.draftNudge : d.draftReply}
            </span>
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

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--fd-line)] pt-4">
          <button type="button" onClick={() => void setStatus("booked")} className={secondaryClass}>
            {d.markBooked}
          </button>
          <button type="button" onClick={() => void setStatus("lost")} className={secondaryClass}>
            {d.markLost}
          </button>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------- list view
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">{t.heading}</h1>

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
        <button type="button" disabled={connectingGmail} onClick={connectGmail} className={`${secondaryClass} w-fit`}>
          {connectingGmail ? t.gmail.connecting : t.gmail.connect}
        </button>
      )}

      <ChecklistCard
        freelancer={freelancer}
        inquiries={inquiries}
        allDrafts={allDrafts}
        bioConfirmedAt={bioConfirmedAt}
        onBioConfirmed={async () => {
          const now = new Date().toISOString();
          setBioConfirmedAt(now);
          await sb
            .from("freelancers")
            .update({ link_in_bio_confirmed_at: now })
            .eq("auth_user_id", session.user.id);
        }}
      />

      {inquiries.length === 0 ? (
        <p className="rounded-2xl border border-[var(--fd-line)] bg-white p-5 text-sm leading-relaxed text-[var(--fd-slate)]">
          {t.empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {(sorted ?? []).map((inquiry) => (
            <li key={inquiry.id}>
              <button
                type="button"
                onClick={() => openDetail(inquiry)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[var(--fd-line)] bg-white p-4 text-left transition hover:border-[var(--fd-ink)]"
              >
                <span
                  aria-hidden="true"
                  className={`size-2.5 shrink-0 rounded-full ${STATUS_DOT[inquiry.status]}`}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--fd-ink)]">
                      {inquiry.client_name}
                    </span>
                    {inquiry.source === "sample" && (
                      <span className="shrink-0 rounded-full border border-[var(--fd-line-control)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
                        {t.sampleBadge}
                      </span>
                    )}
                  </span>
                  <span className="truncate text-xs text-[var(--fd-slate)]">
                    {dict.public.form.types[inquiry.event_type]}
                    {inquiry.event_date ? ` · ${inquiry.event_date}` : ""} · {inquiry.budget_band}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-xs font-medium text-[var(--fd-slate)]">
                    {t.status[inquiry.status]}
                  </span>
                  <span className="text-xs text-[var(--fd-slate)]">
                    {inquiry.created_at.slice(0, 10)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/**
 * The "Go live" card: three derived checkmarks, gone forever once all three
 * are true. Item 1 is manual-or-auto: the freelancer ticks it, or any
 * inquiry arriving with a ?src= tag proves the link works and completes it
 * without them.
 */
function Mark({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
        done
          ? "border-[#22c55e] bg-[#22c55e] text-white"
          : "border-[var(--fd-line-control)] text-transparent"
      }`}
    >
      ✓
    </span>
  );
}

function ChecklistCard({
  freelancer,
  inquiries,
  allDrafts,
  bioConfirmedAt,
  onBioConfirmed,
}: {
  freelancer: FreelancerRow;
  inquiries: { id: string; source: string; src_channel: string | null }[];
  allDrafts: { inquiry_id: string; outcome: string | null }[];
  bioConfirmedAt: string | null;
  onBioConfirmed: () => Promise<void>;
}) {
  const dict = fdDict(freelancer.locale);
  const c = dict.inbox.checklist;
  const share = dict.setup.share;
  const [copied, setCopied] = useState<string | null>(null);

  const bioDone =
    bioConfirmedAt !== null || inquiries.some((i) => i.src_channel !== null);
  const formIds = new Set(inquiries.filter((i) => i.source === "form").map((i) => i.id));
  const testDone = formIds.size > 0;
  const replyDone = allDrafts.some(
    (d) => formIds.has(d.inquiry_id) && (d.outcome === "sent_as_is" || d.outcome === "edited")
  );

  if (bioDone && testDone && replyDone) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { variants } = shareLinks(origin, freelancer.handle);

  async function copyLink(url: string, tag: string) {
    await navigator.clipboard.writeText(url);
    setCopied(tag);
    setTimeout(() => setCopied(null), 2000);
  }

  const itemClass = "flex flex-col gap-2";
  const rowClass = "flex flex-wrap items-center gap-2";

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--fd-ink)] bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fd-ink)]">
        {c.heading}
      </h2>

      <div className={itemClass}>
        <div className={rowClass}>
          <Mark done={bioDone} />
          <span className="text-sm font-medium text-[var(--fd-ink)]">{c.bio}</span>
          {!bioDone && (
            <button
              type="button"
              onClick={() => void onBioConfirmed()}
              className="rounded-lg border border-[var(--fd-line-control)] px-2.5 py-1 text-xs font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]"
            >
              {c.bioDone}
            </button>
          )}
        </div>
        {!bioDone && (
          <div className="flex flex-wrap gap-2 pl-7">
            {variants.map(({ tag, url }) => (
              <button
                key={tag}
                type="button"
                onClick={() => void copyLink(url, tag)}
                className="rounded-lg border border-[var(--fd-line-control)] px-2.5 py-1 text-xs font-medium text-[var(--fd-slate)] transition hover:border-[var(--fd-ink)] hover:text-[var(--fd-ink)]"
              >
                {copied === tag ? share.copied : share.variants[tag]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={itemClass}>
        <div className={rowClass}>
          <Mark done={testDone} />
          <span className="text-sm font-medium text-[var(--fd-ink)]">{c.test}</span>
          {!testDone && (
            <a
              href={`/${freelancer.handle}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[var(--fd-line-control)] px-2.5 py-1 text-xs font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]"
            >
              {c.openPage}
            </a>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <Mark done={replyDone} />
        <span className="text-sm font-medium text-[var(--fd-ink)]">{c.reply}</span>
      </div>
    </section>
  );
}

