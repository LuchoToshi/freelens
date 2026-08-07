"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Check, Copy, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { container } from "@/components/container";
import {
  hintClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/app/styles";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { OutcomesAndNumbers } from "@/components/agent/outcomes-numbers";
import { deriveVoice } from "@/lib/agent/voiceProfile";
import { parseImport, type ParsedRow } from "@/lib/agent/importParse";
import { rankQueue, type RankedTouchSuggestion } from "@/lib/rebooking/ranking";
import { SEASONALITY_NL_V1 } from "@/lib/rebooking/seasonality";
import { reasonTextFor } from "@/lib/rebooking/reasonText";
import {
  findPlaceholders,
  validateDraft,
} from "@/lib/rebooking/draftGuards";
import type { Craft, Relationship } from "@/lib/rebooking/types";
import { CRAFTS } from "@/lib/server/waitlist";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

/** Free tier: everything works, up to this many relationships. */
const FREE_LIMIT = 5;

type Stage = "loading" | "login" | "onboarding" | "queue" | "error";

/**
 * The Rebooking app, v1: login → 15-minute onboarding → the weekly queue.
 *
 * All data access runs in the browser under RLS. The one server round-trip is
 * draft generation, which needs the model key. Copy and Mailto stay locked
 * while a draft has unresolved [vul in: …] placeholders, so an invented fact
 * can never leave by accident — the user must put something real there first.
 */
export function AgentApp() {
  const t = useT();
  const a = t.agent;
  const sb = useMemo(() => supabaseBrowser(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [craft, setCraft] = useState<Craft | null>(null);

  const load = useCallback(async () => {
    // A failed load must land somewhere a user can act on, not an eternal
    // "One moment.": that was findable by pulling the network cable once.
    try {
      const [{ data: voice, error: e1 }, { data: rows, error: e2 }] = await Promise.all([
        sb.from("voice_profiles").select("craft").maybeSingle(),
        sb.from("relationships").select("*").order("created_at", { ascending: true }),
      ]);
      if (e1 || e2) throw e1 ?? e2;
      const mapped = (rows ?? []).map(mapRow);
      setRelationships(mapped);
      setCraft((voice?.craft as Craft) ?? null);
      setStage(voice && mapped.length > 0 ? "queue" : "onboarding");
    } catch {
      setStage("error");
    }
  }, [sb]);

  useEffect(() => {
    // Async resolution only: both paths land in the same callback, and the
    // lint rule against synchronous setState in effects stays satisfied.
    let cancelled = false;
    const apply = (next: Session | null) => {
      if (cancelled) return;
      setSession(next);
      if (!next) setStage("login");
    };
    void sb.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => apply(next));
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [sb]);

  useEffect(() => {
    // `load` only touches state after its awaits resolve; the rule cannot see
    // through the async boundary. Same pattern as use-year-position.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (session && (stage === "loading" || stage === "login")) void load();
  }, [session, stage, load]);

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className={`${container} flex flex-col gap-8 py-12`}>
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--fl-ink)]">
            {a.title}
          </h1>
          {session && (
            <button
              type="button"
              onClick={() => void sb.auth.signOut()}
              className={linkButtonClass}
            >
              {a.signOut}
            </button>
          )}
        </header>

        {stage === "loading" && <p className={hintClass}>{a.loading}</p>}
        {stage === "error" && (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-sm text-[var(--fl-short-text)]">{a.loadError}</p>
            <button type="button" onClick={() => void load()} className={secondaryButtonClass}>
              {a.retry}
            </button>
          </div>
        )}
        {stage === "login" && <Login />}
        {stage === "onboarding" && session && (
          <Onboarding
            existingCraft={craft}
            onDone={() => void load()}
          />
        )}
        {stage === "queue" && session && craft && (
          <>
            <Queue
              relationships={relationships}
              craft={craft}
              session={session}
              onChanged={() => {
                void load();
                setRefreshKey((k) => k + 1);
              }}
            />
            <OutcomesAndNumbers refreshKey={refreshKey} />
            <AccountSection session={session} />
          </>
        )}
      </div>
    </main>
  );
}

function mapRow(row: Record<string, unknown>): Relationship {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    clientName: row.client_name as string,
    clientEmail: (row.client_email as string) ?? undefined,
    company: (row.company as string) ?? undefined,
    lastProjectTitle: (row.last_project_title as string) ?? undefined,
    lastProjectDate: (row.last_project_date as string) ?? undefined,
    approxValueCents: (row.approx_value_cents as number) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    temperature: (row.temperature as Relationship["temperature"]) ?? "cold",
    snoozedUntil: (row.snoozed_until as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function Login() {
  const t = useT();
  const a = t.agent.login;
  const sb = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });
    setState(error ? "error" : "sent");
  };

  if (state === "sent") {
    return (
      <p className="flex max-w-xl items-start gap-2 text-base font-medium leading-relaxed text-[var(--fl-ink)]">
        <Check className="mt-1 size-4 shrink-0 text-[var(--fl-payout-text)]" aria-hidden="true" />
        {a.sent}
      </p>
    );
  }
  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-4">
      <p className="text-base leading-relaxed text-[var(--fl-slate)]">{a.intro}</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="agent-email" className={labelClass}>
          {a.emailLabel}
        </Label>
        <Input
          id="agent-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={state === "sending"} className={`${primaryButtonClass} w-fit disabled:opacity-60`}>
        {state === "sending" ? a.sending : a.cta}
      </button>
      {state === "error" && (
        <p role="alert" className="text-sm text-[var(--fl-short-text)]">{a.error}</p>
      )}
    </form>
  );
}

function Onboarding({
  existingCraft,
  onDone,
}: {
  existingCraft: Craft | null;
  onDone: () => void;
}) {
  const t = useT();
  const a = t.agent.onboarding;
  const w = t.home.rebooking.waitlist;
  const sb = supabaseBrowser();

  const [step, setStep] = useState(existingCraft ? 1 : 0);
  // Focus follows the step, same pattern as every other wizard on the site,
  // so keyboard and screen-reader users land on the new question rather than
  // at the bottom of the old one. Skipped on first paint.
  const stepRef = useRef<HTMLParagraphElement>(null);
  const firstPaint = useRef(true);
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    stepRef.current?.focus();
  }, [step]);
  const [craft, setCraft] = useState<Craft | null>(existingCraft);
  const [voiceText, setVoiceText] = useState("");
  const [importText, setImportText] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const saveAll = async () => {
    if (!craft) return;
    setSaving(true);
    setError(false);
    const { data: userData } = await sb.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      // Session lapsed during a 15-minute onboarding: say so, stay clickable.
      setSaving(false);
      setError(true);
      return;
    }

    // The raw voice text stays in this browser; only the derivation is saved.
    const voice = deriveVoice([voiceText]);
    const { error: voiceError } = await sb.from("voice_profiles").upsert({
      user_id: userId,
      craft,
      greeting: voice.greeting ?? null,
      signoff: voice.signoff ?? null,
      formality: voice.formality ?? null,
      style_notes: voice.styleNotes ?? null,
    });

    const confirmed = rows.filter((r) => r.clientName.trim());
    const { error: rowsError } =
      confirmed.length > 0
        ? await sb.from("relationships").insert(
            confirmed.slice(0, FREE_LIMIT).map((r) => ({
              user_id: userId,
              client_name: r.clientName.trim().slice(0, 120),
              client_email: r.clientEmail ?? null,
              last_project_title: r.lastProjectTitle ?? null,
              last_project_date: r.lastProjectDate ?? null,
              approx_value_cents: r.approxValueCents ?? null,
            }))
          )
        : { error: null };

    setSaving(false);
    if (voiceError || rowsError) {
      setError(true);
      return;
    }
    setVoiceText("");
    onDone();
  };

  const steps = [a.stepCraft, a.stepVoice, a.stepImport, a.stepConfirm];

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <p ref={stepRef} tabIndex={-1} className={`${hintClass} outline-none`}>
        {fill(a.progress, { n: step + 1, total: steps.length, name: steps[step] })}
      </p>

      {step === 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-base font-medium text-[var(--fl-ink)]">{a.craftQuestion}</legend>
          <div role="radiogroup" aria-label={a.craftQuestion} className="flex flex-wrap gap-2">
            {CRAFTS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={craft === c}
                onClick={() => setCraft(c)}
                className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${
                  craft === c
                    ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                    : "border-[var(--fl-line-control)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
                }`}
              >
                {w.crafts[c]}
              </button>
            ))}
          </div>
          <button type="button" disabled={!craft} onClick={() => setStep(1)} className={`${primaryButtonClass} w-fit disabled:opacity-60`}>
            {a.next}
          </button>
        </fieldset>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-3">
          <Label htmlFor="voice" className="text-base font-medium text-[var(--fl-ink)]">
            {a.voiceQuestion}
          </Label>
          <p className={hintClass}>{a.voiceHint}</p>
          <textarea
            id="voice"
            rows={8}
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            className={`${inputClass} rounded-lg border p-3 font-mono text-sm`}
          />
          <p className={hintClass}>{a.voicePrivacy}</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className={primaryButtonClass}>
              {a.next}
            </button>
            <button type="button" onClick={() => { setVoiceText(""); setStep(2); }} className={linkButtonClass}>
              {a.skip}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3">
          <Label htmlFor="import" className="text-base font-medium text-[var(--fl-ink)]">
            {a.importQuestion}
          </Label>
          <p className={hintClass}>{a.importHint}</p>
          <textarea
            id="import"
            rows={8}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={a.importPlaceholder}
            className={`${inputClass} rounded-lg border p-3 font-mono text-sm`}
          />
          <button
            type="button"
            onClick={() => { setRows(parseImport(importText)); setStep(3); }}
            className={`${primaryButtonClass} w-fit`}
          >
            {a.parse}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-base font-medium text-[var(--fl-ink)]">{a.confirmTitle}</p>
          <p className={hintClass}>{a.confirmHint}</p>
          {rows.length === 0 && <p className={hintClass}>{a.confirmEmpty}</p>}
          <ul className="flex flex-col gap-3">
            {rows.map((row, i) => (
              <li key={i} className="grid gap-2 rounded-xl border border-[var(--fl-line)] bg-white p-4 sm:grid-cols-2">
                {(
                  [
                    ["clientName", a.fields.name],
                    ["clientEmail", a.fields.email],
                    ["lastProjectTitle", a.fields.project],
                    ["lastProjectDate", a.fields.date],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field} className="flex flex-col gap-1 text-xs text-[var(--fl-slate)]">
                    {label}
                    <input
                      type="text"
                      value={(row[field] as string) ?? ""}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r, j) => (j === i ? { ...r, [field]: e.target.value || undefined } : r))
                        )
                      }
                      className={`${inputClass} rounded-lg border px-2 py-1.5 text-sm`}
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                  className={`${linkButtonClass} w-fit text-xs`}
                >
                  {t.common.actions.delete}
                </button>
              </li>
            ))}
          </ul>
          {rows.length > FREE_LIMIT && (
            <p role="alert" className="text-sm font-medium text-[var(--fl-vat-text)]">
              {fill(a.freeLimitNote, { limit: FREE_LIMIT, dropped: rows.length - FREE_LIMIT })}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep(2)} className={secondaryButtonClass}>
              {a.back}
            </button>
            <button type="button" disabled={saving} onClick={() => void saveAll()} className={`${primaryButtonClass} disabled:opacity-60`}>
              {saving ? a.saving : a.finish}
            </button>
          </div>
          {error && <p role="alert" className="text-sm text-[var(--fl-short-text)]">{a.saveError}</p>}
        </div>
      )}
    </div>
  );
}

function Queue({
  relationships,
  craft,
  session,
  onChanged,
}: {
  relationships: Relationship[];
  craft: Craft;
  session: Session;
  onChanged: () => void;
}) {
  const t = useT();
  const a = t.agent.queue;
  const { locale } = useLocale();
  const sb = supabaseBrowser();
  const today = new Date().toISOString().slice(0, 10);

  const suggestions = useMemo(
    () => rankQueue({ relationships, craft, config: SEASONALITY_NL_V1, today }),
    [relationships, craft, today]
  );
  const byId = useMemo(
    () => new Map(relationships.map((r) => [r.id, r])),
    [relationships]
  );

  const [lastSnooze, setLastSnooze] = useState<{ id: string; name: string } | null>(null);

  const snooze = async (relationshipId: string, months: number) => {
    const until = new Date();
    until.setMonth(until.getMonth() + months);
    await sb
      .from("relationships")
      .update({ snoozed_until: until.toISOString().slice(0, 10) })
      .eq("id", relationshipId);
    setLastSnooze({ id: relationshipId, name: byId.get(relationshipId)?.clientName ?? "" });
    onChanged();
  };

  const undoSnooze = async () => {
    if (!lastSnooze) return;
    await sb.from("relationships").update({ snoozed_until: null }).eq("id", lastSnooze.id);
    setLastSnooze(null);
    onChanged();
  };

  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
        {a.heading}
      </h2>
      {lastSnooze && (
        <p role="status" className="flex items-center gap-3 text-sm text-[var(--fl-ink)]">
          {fill(a.snoozed, { name: lastSnooze.name })}
          <button type="button" onClick={() => void undoSnooze()} className={linkButtonClass}>
            {a.undo}
          </button>
        </p>
      )}
      {suggestions.length === 0 && (
        <p className="max-w-xl text-base leading-relaxed text-[var(--fl-slate)]">{a.empty}</p>
      )}
      <ul className="flex flex-col gap-4">
        {suggestions.map((s) => {
          const r = byId.get(s.relationshipId);
          return r ? (
            <QueueItem
              key={s.relationshipId}
              suggestion={s}
              relationship={r}
              reason={reasonTextFor(s, r, locale)}
              token={session.access_token}
              onSnooze={snooze}
            />
          ) : null;
        })}
      </ul>
      <p className={hintClass}>
        {fill(a.tracking, { count: relationships.length, limit: FREE_LIMIT })}
      </p>
    </section>
  );
}

function QueueItem({
  suggestion,
  relationship,
  reason,
  token,
  onSnooze,
}: {
  suggestion: RankedTouchSuggestion;
  relationship: Relationship;
  reason: string;
  token: string;
  onSnooze: (relationshipId: string, months: number) => void;
}) {
  const t = useT();
  const a = t.agent.queue;
  const { locale } = useLocale();
  const sb = supabaseBrowser();

  const [state, setState] = useState<"idle" | "drafting" | "ready" | "error">("idle");
  const [touchId, setTouchId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sentMarked, setSentMarked] = useState(false);

  const placeholders = findPlaceholders(subject).concat(findPlaceholders(body));
  const valid = validateDraft({ subject, body }).ok && placeholders.length === 0;

  const draft = async () => {
    setState("drafting");
    try {
      const response = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ relationshipId: relationship.id, locale }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error();
      setTouchId(data.touchId);
      setSubject(data.subject);
      setBody(data.body);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const markSent = async () => {
    if (touchId) {
      await sb
        .from("touches")
        .update({ status: "sent_by_user", status_at: new Date().toISOString() })
        .eq("id", touchId);
    }
    setSentMarked(true);
  };

  const mailto = () => {
    const to = relationship.clientEmail ?? "";
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-base font-medium text-[var(--fl-ink)]">{relationship.clientName}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
          {a.reasons[suggestion.reasonCode]}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{reason}</p>

      {state === "idle" && (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void draft()} className={primaryButtonClass}>
            {a.writeDraft}
          </button>
          {[1, 3, 6].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSnooze(relationship.id, m)}
              className={linkButtonClass}
            >
              {fill(a.snooze, { months: m })}
            </button>
          ))}
        </div>
      )}
      {state === "drafting" && <p role="status" className={hintClass}>{a.drafting}</p>}
      {state === "error" && (
        <p role="alert" className="text-sm text-[var(--fl-short-text)]">{a.draftError}</p>
      )}

      {state === "ready" && (
        <div className="flex flex-col gap-3 border-t border-[var(--fl-line)] pt-3">
          <label className="flex flex-col gap-1 text-xs text-[var(--fl-slate)]">
            {a.subjectLabel}
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`${inputClass} rounded-lg border px-2 py-1.5 text-sm`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--fl-slate)]">
            {a.bodyLabel}
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`${inputClass} rounded-lg border p-3 text-sm`}
            />
          </label>
          {placeholders.length > 0 && (
            <p className="text-sm text-[var(--fl-vat-text)]">
              {fill(a.placeholdersOpen, { list: placeholders.join(" · ") })}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!valid}
              onClick={() => void navigator.clipboard.writeText(`${subject}\n\n${body}`)}
              className={`${secondaryButtonClass} disabled:opacity-50`}
            >
              <Copy className="size-4" aria-hidden="true" />
              {a.copy}
            </button>
            <button
              type="button"
              disabled={!valid}
              onClick={mailto}
              className={`${secondaryButtonClass} disabled:opacity-50`}
            >
              <Mail className="size-4" aria-hidden="true" />
              {a.openMail}
            </button>
            {!sentMarked ? (
              <button type="button" onClick={() => void markSent()} className={linkButtonClass}>
                {a.markSent}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--fl-payout-text)]">
                <Check className="size-4" aria-hidden="true" />
                {a.sentNoted}
              </span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function AccountSection({ session }: { session: Session }) {
  const t = useT();
  const a = t.agent.account;
  const sb = supabaseBrowser();
  const [confirming, setConfirming] = useState(false);

  const exportAll = async () => {
    const [rel, tou, out] = await Promise.all([
      sb.from("relationships").select("*"),
      sb.from("touches").select("*"),
      sb.from("outcomes").select("*"),
    ]);
    const blob = new Blob(
      [JSON.stringify({ relationships: rel.data, touches: tou.data, outcomes: out.data }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "freelens-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (response.ok) await sb.auth.signOut();
  };

  return (
    <section className="flex flex-col gap-3 border-t border-[var(--fl-line)] pt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
        {a.heading}
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void exportAll()} className={secondaryButtonClass}>
          {a.export}
        </button>
        {!confirming ? (
          <button type="button" onClick={() => setConfirming(true)} className={linkButtonClass}>
            {a.delete}
          </button>
        ) : (
          <>
            <span className="text-sm text-[var(--fl-short-text)]">{a.deleteWarning}</span>
            <button type="button" onClick={() => void deleteAccount()} className={secondaryButtonClass}>
              {a.deleteConfirm}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={linkButtonClass}>
              {t.common.actions.cancel}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
