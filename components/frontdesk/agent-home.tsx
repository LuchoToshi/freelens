"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { fdDict } from "@/lib/frontdesk/i18n";
import { NEEDS_YOU_QUEUES, placeInquiry } from "@/lib/frontdesk/queue";
import { resolveQuietDays } from "@/lib/frontdesk/followups";
import type { FreelancerRow } from "@/components/frontdesk/auth-gate";
import type { AgentStep } from "@/lib/frontdesk/server/agentRequest";
import { DraftPanel } from "@/components/frontdesk/draft-panel";
import { GuardPanel } from "@/components/frontdesk/guard-panel";
import { SourceChip } from "@/components/frontdesk/source-chip";

/**
 * The agent-led home (addendum §2.1): summary line with literal numbers,
 * the request bar, Needs you, In motion, Recently done, and the agent's
 * scope. Never an empty chatbot — every state shows structured objects.
 * Freelens speaks in first person by name; nothing here sends anything.
 */

interface HomeInquiry {
  id: string;
  source: "form" | "email" | "sample";
  client_name: string;
  status: "new" | "replied" | "nudge_due" | "booked" | "lost";
  created_at: string;
  replied_at: string | null;
  client_email: string | null;
  snoozed_until: string | null;
  event_date: string | null;
}

interface HomeDraft {
  inquiry_id: string;
  kind: "reply" | "nudge";
  outcome: string | null;
  validation_status?: string | null;
  validation_failures?: string[] | null;
  /** The draft verbatim: the decision panel shows what would send (handoff §6). */
  body: string | null;
  created_at: string;
}

interface WorkObjectRow {
  id: string;
  request_text: string;
  read_as: string | null;
  status: "understanding" | "plan" | "working" | "waiting" | "needs_you" | "paused" | "done" | "failed";
  steps: AgentStep[];
  needs: string | null;
  result: { summary?: string } | null;
  created_at: string;
  updated_at: string;
}

export function AgentHome({
  session,
  freelancer,
}: {
  session: Session;
  freelancer: FreelancerRow;
}) {
  const dict = fdDict(freelancer.locale);
  const h = dict.home;
  const dsk = dict.desk;
  const sb = supabaseBrowser();

  const [inquiries, setInquiries] = useState<HomeInquiry[] | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, HomeDraft>>({});
  const [workObjects, setWorkObjects] = useState<WorkObjectRow[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [request, setRequest] = useState("");
  const [requestState, setRequestState] = useState<"idle" | "thinking" | "error">("idle");
  const [busyObject, setBusyObject] = useState<string | null>(null);
  // The desk always has something selected when there is something to decide;
  // a returning user lands on the top item (handoff §5.1 returning state).
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const timeZone = freelancer.timezone || "Europe/Amsterdam";
  const quietDays = resolveQuietDays(freelancer.followup_quiet_days);

  // The greeting names the hour it is actually said in, in the freelancer's own
  // timezone, so someone opening the desk at night is never told it is morning.
  const localHour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone }).format(now),
  );
  const firstName = freelancer.display_name.trim().split(" ")[0] || freelancer.display_name;
  const greetingWord =
    localHour < 12 ? dsk.greetingMorning : localHour < 18 ? dsk.greetingAfternoon : dsk.greetingEvening;
  const greetingText = `${greetingWord}, ${firstName}.`;

  const load = useCallback(async () => {
    const [{ data: rows }, { data: draftRows }, { data: objects }] = await Promise.all([
      sb
        .from("inquiries")
        .select(
          "id, source, client_name, status, created_at, replied_at, client_email, snoozed_until, event_date",
        )
        .order("created_at", { ascending: false }),
      sb
        .from("drafts")
        .select(
          "inquiry_id, kind, outcome, validation_status, validation_failures, body, created_at",
        )
        .order("created_at", { ascending: false }),
      sb
        .from("agent_work_objects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    setInquiries((rows as HomeInquiry[] | null) ?? []);
    const latestReply: Record<string, HomeDraft> = {};
    for (const d of (draftRows as HomeDraft[] | null) ?? []) {
      if (d.kind === "reply" && !latestReply[d.inquiry_id]) latestReply[d.inquiry_id] = d;
    }
    setReplyDrafts(latestReply);
    setWorkObjects((objects as WorkObjectRow[] | null) ?? []);
    setNow(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sb is a singleton
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch; setState only after awaited responses
    void load();
  }, [load]);

  const placements = useMemo(() => {
    const map: Record<string, ReturnType<typeof placeInquiry>> = {};
    for (const inquiry of inquiries ?? []) {
      map[inquiry.id] = placeInquiry(inquiry, replyDrafts[inquiry.id] ?? null, now, timeZone, quietDays);
    }
    return map;
  }, [inquiries, replyDrafts, now, timeZone, quietDays]);

  const needsYou = useMemo(
    () =>
      (inquiries ?? [])
        .filter((i) => NEEDS_YOU_QUEUES.includes(placements[i.id]?.queue))
        .sort(
          (a, b) =>
            NEEDS_YOU_QUEUES.indexOf(placements[a.id].queue) -
            NEEDS_YOU_QUEUES.indexOf(placements[b.id].queue)
        )
        .slice(0, 5),
    [inquiries, placements]
  );

  const runningCount = useMemo(() => {
    const watching = (inquiries ?? []).filter((i) =>
      ["followup", "waiting", "monitoring"].includes(placements[i.id]?.queue)
    ).length;
    const active = workObjects.filter((w) => ["working", "waiting", "plan"].includes(w.status)).length;
    return watching + active;
  }, [inquiries, placements, workObjects]);

  const inMotion = workObjects.filter((w) =>
    ["plan", "working", "waiting", "paused", "needs_you"].includes(w.status)
  );
  const recentlyDone = workObjects.filter((w) => w.status === "done" || w.status === "failed").slice(0, 5);

  // Plain computation: the React Compiler memoizes this, and a manual useMemo
  // here is the one thing it cannot preserve across the dictionary reads below.
  const suggestions: string[] = [];
  {
    const quiet = (inquiries ?? []).filter((i) => placements[i.id]?.queue === "followup").length;
    if (quiet > 0) suggestions.push(h.suggestQuiet.replace("{n}", String(quiet)));
    const missing = (inquiries ?? []).find((i) => placements[i.id]?.queue === "missing");
    if (missing) suggestions.push(h.suggestMissing.replace("{name}", missing.client_name.split(" ")[0]));
    if (suggestions.length === 0) suggestions.push(h.suggestFirst);
  }

  async function submitRequest(text: string) {
    const trimmed = text.trim();
    if (!trimmed || requestState === "thinking") return;
    setRequestState("thinking");
    try {
      const res = await fetch("/api/frontdesk/agent/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text: trimmed }),
      });
      const payload = (await res.json()) as { ok: boolean; workObject?: WorkObjectRow };
      if (payload.ok && payload.workObject) {
        setWorkObjects((prev) => [payload.workObject!, ...prev]);
        setRequest("");
        setRequestState("idle");
        return;
      }
      setRequestState("error");
    } catch {
      setRequestState("error");
    }
  }

  async function act(id: string, action: "approve" | "pause" | "resume" | "cancel") {
    setBusyObject(id);
    try {
      await fetch("/api/frontdesk/agent/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, action }),
      });
      await load();
    } finally {
      setBusyObject(null);
    }
  }

  if (inquiries === null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-sm text-[var(--fd-slate)]">{dict.auth.loading}</p>
      </main>
    );
  }

  const needsCount = needsYou.length;
  const selected =
    needsYou.find((i) => i.id === selectedId) ?? needsYou[0] ?? null;
  const selectedDraft = selected ? replyDrafts[selected.id] ?? null : null;
  const selectedPlacement = selected ? placements[selected.id] : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">
          {greetingText}
        </h1>
        <p className="text-base leading-relaxed text-[var(--fd-slate)]">
          {needsCount === 0
            ? dsk.summaryClear
            : needsCount === 1
              ? dsk.summaryOne
              : dsk.summaryMany.replace("{n}", String(needsCount))}{" "}
          {runningCount === 1
            ? dsk.watchingOne
            : runningCount > 1
              ? dsk.watchingMany.replace("{m}", String(runningCount))
              : ""}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitRequest(request);
          }}
          className="flex flex-col gap-2"
        >
          <label htmlFor="fd-request" className="sr-only">
            {h.requestLabel}
          </label>
          <div className="flex gap-2">
            <input
              id="fd-request"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder={h.requestPlaceholder}
              className="min-h-12 w-full rounded-xl border border-[var(--fd-line-control)] bg-white px-4 text-base focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none sm:text-sm"
            />
            <button
              type="submit"
              disabled={requestState === "thinking" || !request.trim()}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-5 text-base font-medium text-white disabled:opacity-50"
            >
              {requestState === "thinking" ? h.thinking : h.requestSubmit}
            </button>
          </div>
        </form>
        {requestState === "thinking" && (
          <p role="status" className="text-sm text-[var(--fd-slate)] motion-safe:animate-pulse">
            {h.understanding}
          </p>
        )}
        {requestState === "error" && (
          <p role="alert" className="text-sm font-medium text-[var(--fd-error-text)]">
            {h.requestError}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 3).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void submitRequest(s)}
              disabled={requestState === "thinking"}
              className="inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-xs font-medium text-[var(--fd-slate)] transition hover:border-[var(--fd-ink)] hover:text-[var(--fd-ink)]"
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{h.understandingSafe}</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start">
        {/* Left: what needs a decision, then what is running on its own. */}
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
                {dsk.needsYou} · {needsCount}
              </h2>
              <p className="text-xs text-[var(--fd-slate)]">{dsk.needsYouSub}</p>
            </div>
            {needsYou.length === 0 ? (
              <p className="rounded-2xl border border-[var(--fd-line)] bg-white p-4 text-sm leading-relaxed text-[var(--fd-slate)]">
                {h.needsYouEmpty}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {needsYou.map((inquiry) => {
                  const placement = placements[inquiry.id];
                  const isSelected = selected?.id === inquiry.id;
                  return (
                    <li key={inquiry.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(inquiry.id)}
                        aria-current={isSelected ? "true" : undefined}
                        className={`flex w-full flex-col gap-1 rounded-2xl border p-4 text-left transition hover:border-[var(--fd-ink)] ${
                          isSelected
                            ? "border-l-[3px] border-[var(--fd-ink)] bg-[var(--fd-paper-dim)]"
                            : "border-[var(--fd-line)] bg-white"
                        }`}
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-[var(--fd-ink)]">
                            {inquiry.client_name}
                          </span>
                          <span className="shrink-0 text-xs text-[var(--fd-slate)]">
                            {inquiry.created_at.slice(0, 10)}
                          </span>
                        </span>
                        <span className="text-xs leading-relaxed text-[var(--fd-slate)]">
                          {dict.inbox.queues.reasons[placement.reasonKey]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {inMotion.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
                {dsk.inMotion} · {inMotion.length}
              </h2>
              {inMotion.map((w) => (
                <WorkObjectCard
                  key={w.id}
                  workObject={w}
                  locale={freelancer.locale}
                  busy={busyObject === w.id}
                  onAct={(action) => void act(w.id, action)}
                />
              ))}
            </section>
          )}

          {recentlyDone.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
                {dsk.recentlyDone}
              </h2>
              <ul className="flex flex-col gap-2">
                {recentlyDone.map((w) => (
                  <li
                    key={w.id}
                    className="flex flex-col gap-1 rounded-2xl border border-[var(--fd-line)] bg-white p-3"
                  >
                    <span className="text-sm text-[var(--fd-ink)]">{w.request_text}</span>
                    {w.result?.summary && (
                      <span className="text-xs leading-relaxed text-[var(--fd-slate)]">
                        {w.status === "failed" ? h.objectFailed : w.result.summary}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right: the selected decision, its evidence, and the draft verbatim. */}
        <div className="flex flex-col gap-4">
          {!selected ? (
            <p className="rounded-2xl border border-dashed border-[var(--fd-line)] p-8 text-sm leading-relaxed text-[var(--fd-slate)]">
              {dsk.selectPrompt}
            </p>
          ) : (
            <>
              <header className="flex flex-col gap-1">
                <h2 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">
                  {selectedPlacement
                    ? dict.inbox.queues.actions[selectedPlacement.actionKey]
                    : selected.client_name}
                </h2>
                <p className="text-sm text-[var(--fd-slate)]">
                  {selected.client_name}
                  {selected.event_date ? ` · ${selected.event_date}` : ""}
                </p>
              </header>

              <div className="flex flex-col gap-1 rounded-2xl bg-[var(--fd-paper-dim)] px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
                  {dsk.why}
                </span>
                <p className="text-sm leading-relaxed text-[var(--fd-ink)]">
                  {selectedPlacement ? dict.inbox.queues.reasons[selectedPlacement.reasonKey] : ""}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
                  {dsk.sources}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--fd-slate)]">
                  <span className="inline-flex items-center gap-1.5">
                    {dsk.sourceMessage} <SourceChip locale={freelancer.locale} kind="inquiry" />
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {dsk.sourcePrice} <SourceChip locale={freelancer.locale} kind="yours" />
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {dsk.sourceVoice} <SourceChip locale={freelancer.locale} kind="yours" />
                  </span>
                </div>
              </div>

              {selectedDraft && (
                <>
                  <GuardPanel
                    locale={freelancer.locale}
                    status={selectedDraft.validation_status as never}
                    failures={selectedDraft.validation_failures}
                  />
                  {selectedDraft.body && (
                    <DraftPanel
                      locale={freelancer.locale}
                      kind={selectedDraft.kind}
                      body={selectedDraft.body}
                    />
                  )}
                </>
              )}

              <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
                {selected.client_email ? dsk.consequence : dsk.consequenceCopy}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/inbox?i=${selected.id}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-5 text-base font-medium text-white"
                >
                  {dsk.reviewAndSend}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-1 border-t border-[var(--fd-line)] pt-4 text-xs leading-relaxed text-[var(--fd-slate)]">
        <p>{dsk.capabilityReads}</p>
        <p>{dsk.capabilityMay}</p>
        <p>{dsk.capabilityNever}</p>
        <Link
          href="/control"
          className="w-fit font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4"
        >
          {dsk.capabilityLink}
        </Link>
      </section>

    </main>
  );
}

function WorkObjectCard({
  workObject,
  locale,
  busy,
  onAct,
}: {
  workObject: WorkObjectRow;
  locale: FreelancerRow["locale"];
  busy: boolean;
  onAct: (action: "approve" | "pause" | "resume" | "cancel") => void;
}) {
  const h = fdDict(locale).home;
  const mark: Record<AgentStep["state"], string> = {
    pending: "·",
    done: "✓",
    failed: "✕",
    skipped: "–",
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fd-line)] bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[var(--fd-ink)]">{workObject.request_text}</span>
        <span className="rounded-md border border-[var(--fd-line)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--fd-slate)]">
          {h.status[workObject.status]}
        </span>
      </div>
      {workObject.read_as && (
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
          {h.readAs.replace("{text}", workObject.read_as)}
        </p>
      )}
      {workObject.steps.length > 0 && (
        <ol className="flex flex-col gap-1">
          {workObject.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span aria-hidden="true" className="mt-0.5 font-mono text-xs text-[var(--fd-slate)]">
                {mark[step.state]}
              </span>
              <span className={step.state === "pending" ? "text-[var(--fd-slate)]" : "text-[var(--fd-ink)]"}>
                {step.label}
                {step.state !== "pending" && ` (${h.stepStates[step.state]})`}
              </span>
            </li>
          ))}
        </ol>
      )}
      {workObject.needs && (
        <p className="rounded-xl bg-[var(--fd-paper)] px-3 py-2 text-sm leading-relaxed text-[var(--fd-ink)]">
          {workObject.needs}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {workObject.status === "plan" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAct("approve")}
            className="inline-flex min-h-11 items-center rounded-lg bg-[var(--fd-ink)] px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? h.working : h.approvePlan}
          </button>
        )}
        {workObject.status === "plan" && (
          <button type="button" disabled={busy} onClick={() => onAct("pause")} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] px-4 text-sm font-medium text-[var(--fd-ink)] disabled:opacity-50">
            {h.pause}
          </button>
        )}
        {workObject.status === "paused" && (
          <button type="button" disabled={busy} onClick={() => onAct("resume")} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] px-4 text-sm font-medium text-[var(--fd-ink)] disabled:opacity-50">
            {h.resume}
          </button>
        )}
        {workObject.status === "needs_you" && (
          <Link href="/inbox" className="inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] px-4 text-sm font-medium text-[var(--fd-ink)]">
            {h.openNeedsYou}
          </Link>
        )}
        {["plan", "paused", "working", "waiting", "needs_you"].includes(workObject.status) && (
          <button type="button" disabled={busy} onClick={() => onAct("cancel")} className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)] disabled:opacity-50">
            {h.cancel}
          </button>
        )}
      </div>
    </div>
  );
}
