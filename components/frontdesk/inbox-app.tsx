"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { fdDict } from "@/lib/frontdesk/i18n";
import type { FreelancerRow } from "@/components/frontdesk/auth-gate";

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
  replied: "bg-[var(--fl-line-control)]",
  nudge_due: "bg-[#f59e0b]",
  booked: "bg-[#22c55e]",
  lost: "bg-[#9ca3af]",
};

function mailtoHref(email: string, subject: string, body: string): string {
  const crlf = body.replace(/\n/g, "\r\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlf)}`;
}

const primaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fl-ink)] px-5 text-base font-medium text-white transition hover:bg-[var(--fl-ink-hover)] disabled:pointer-events-none disabled:opacity-50";
const secondaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--fl-line-control)] bg-white px-5 text-base font-medium text-[var(--fl-ink)] transition hover:border-[var(--fl-ink)]";
const linkClass =
  "w-fit text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]";

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
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [editedBody, setEditedBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const sb = supabaseBrowser();

  const load = useCallback(async () => {
    const { data: rows } = await sb
      .from("inquiries")
      .select("id, client_name, client_email, event_date, event_type, budget_band, message, status, created_at")
      .order("created_at", { ascending: false });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sb is a singleton
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = openId ? inquiries?.find((i) => i.id === openId) : null;
  const openDraft = openId ? drafts[openId] : null;

  function openDetail(inquiry: InquiryRow) {
    setOpenId(inquiry.id);
    setEditedBody(drafts[inquiry.id]?.body ?? "");
    setCopied(false);
  }

  async function recordOutcome(kind: "send" | "skip") {
    if (!open || !openDraft) return;
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
    setRegenerating(false);
    await load();
    setEditedBody("");
  }

  if (inquiries === null) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="text-sm text-[var(--fl-slate)]">{t.loading}</p>
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
          <h1 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            {open.client_name}
          </h1>
          <p className="text-sm text-[var(--fl-slate)]">
            {typeLabel}
            {open.event_date ? ` · ${d.date}: ${open.event_date}` : ""} · {d.budget}: {open.budget_band}
          </p>
        </header>

        {open.message && (
          <div className="flex flex-col gap-1 rounded-2xl border border-[var(--fl-line)] bg-white p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
              {d.message}
            </span>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--fl-ink)]">
              {open.message}
            </p>
          </div>
        )}

        {openDraft ? (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
              {openDraft.kind === "nudge" ? d.draftNudge : d.draftReply}
            </span>
            <textarea
              aria-label={openDraft.kind === "nudge" ? d.draftNudge : d.draftReply}
              rows={10}
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="min-h-56 w-full rounded-2xl border border-[var(--fl-line-control)] bg-white px-4 py-3 text-sm leading-relaxed focus-visible:border-[var(--fl-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fl-focus-ring)]/25 focus-visible:outline-none"
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
            <p className="text-xs leading-relaxed text-[var(--fl-slate)]">{d.copyHint}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--fl-line)] p-5">
            <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{d.draftPending}</p>
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

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--fl-line)] pt-4">
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
      <h1 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">{t.heading}</h1>

      {inquiries.length === 0 ? (
        <p className="rounded-2xl border border-[var(--fl-line)] bg-white p-5 text-sm leading-relaxed text-[var(--fl-slate)]">
          {t.empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <button
                type="button"
                onClick={() => openDetail(inquiry)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-4 text-left transition hover:border-[var(--fl-ink)]"
              >
                <span
                  aria-hidden="true"
                  className={`size-2.5 shrink-0 rounded-full ${STATUS_DOT[inquiry.status]}`}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-[var(--fl-ink)]">
                    {inquiry.client_name}
                  </span>
                  <span className="truncate text-xs text-[var(--fl-slate)]">
                    {dict.public.form.types[inquiry.event_type]}
                    {inquiry.event_date ? ` · ${inquiry.event_date}` : ""} · {inquiry.budget_band}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-xs font-medium text-[var(--fl-slate)]">
                    {t.status[inquiry.status]}
                  </span>
                  <span className="text-xs text-[var(--fl-slate)]">
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
