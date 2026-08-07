"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useDocumentTitle, useLocale } from "@/components/i18n/locale-provider";
import { rankQueue, type RankedTouchSuggestion } from "@/lib/rebooking/ranking";
import { SEASONALITY_NL_V1 } from "@/lib/rebooking/seasonality";
import { reasonTextFor } from "@/lib/rebooking/reasonText";
import type { Craft, Relationship } from "@/lib/rebooking/types";
import { fill } from "@/lib/i18n";
import { OFFER } from "@/lib/offer";
import {
  cardClass,
  hintClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
  errorClass,
} from "@/components/app/styles";

/**
 * The anonymous trial: one week of the product, no account, no storage.
 *
 * Everything deterministic runs right here in the browser — the ranking is the
 * same `rankQueue` the real app uses, so the trial IS the product for one
 * cycle. The only server round-trip is the single draft call, which sends one
 * record (name, project, month) and stores nothing.
 */
type ClientRow = { name: string; project: string; month: string };
type Stage = "clients" | "voice" | "queue";
type DraftState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "limit" }
  | { kind: "done"; subject: string; body: string };

const CRAFT_IDS: Craft[] = [
  "photographer",
  "videographer",
  "designer",
  "illustrator",
  "other",
];

const EMPTY_ROWS: ClientRow[] = [
  { name: "", project: "", month: "" },
  { name: "", project: "", month: "" },
  { name: "", project: "", month: "" },
];

function monthsAgo(n: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 7);
}

function sampleRows(locale: "en" | "nl"): ClientRow[] {
  const projects =
    locale === "nl"
      ? ["Merkcampagne", "Productfoto's", "Bruiloft"]
      : ["Brand campaign", "Product photos", "Wedding"];
  return [
    { name: "Studio Vondel", project: projects[0], month: monthsAgo(12) },
    { name: "Bakkerij De Groot", project: projects[1], month: monthsAgo(8) },
    { name: "Marieke Jansen", project: projects[2], month: monthsAgo(3) },
  ];
}

const PLACEHOLDER = /\[(fill in|vul in):/i;

export function TryApp() {
  const { locale, t } = useLocale();
  const p = t.tryPage;
  useDocumentTitle(t.meta.try.title, t.meta.try.description);

  const [stage, setStage] = useState<Stage>("clients");
  const [rows, setRows] = useState<ClientRow[]>(EMPTY_ROWS);
  const [craft, setCraft] = useState<Craft>("photographer");
  const [formality, setFormality] = useState<"je" | "u">("je");
  const [greeting, setGreeting] = useState("");
  const [signoff, setSignoff] = useState("");
  const [draftFor, setDraftFor] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);

  const filled = rows.filter((r) => r.name.trim() && r.month);
  const canRank = filled.length >= 1 && rows.every((r) => !r.month || r.month <= thisMonth);

  const relationships: Relationship[] = filled.map((r, i) => ({
    id: `trial-${i}`,
    userId: "trial",
    clientName: r.name.trim(),
    lastProjectTitle: r.project.trim() || undefined,
    lastProjectDate: `${r.month}-01`,
    temperature: "cold",
    createdAt: today,
    updatedAt: today,
  }));

  const ranked: RankedTouchSuggestion[] =
    stage === "queue"
      ? rankQueue({ relationships, craft, config: SEASONALITY_NL_V1, today })
      : [];
  const rankedIds = new Set(ranked.map((s) => s.relationshipId));
  const notRanked = relationships.filter((r) => !rankedIds.has(r.id));

  function goTo(next: Stage) {
    setStage(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function setRow(i: number, patch: Partial<ClientRow>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function reset() {
    setRows(EMPTY_ROWS);
    setDraft({ kind: "idle" });
    setDraftFor(null);
    setCopied(false);
    goTo("clients");
  }

  async function requestDraft(rel: Relationship) {
    setDraftFor(rel.id);
    setDraft({ kind: "loading" });
    try {
      const response = await fetch("/api/try/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rel.clientName,
          project: rel.lastProjectTitle ?? "",
          month: rel.lastProjectDate?.slice(0, 7),
          craft,
          formality,
          greeting,
          signoff,
          locale,
        }),
      });
      if (response.status === 429) {
        setDraft({ kind: "limit" });
        return;
      }
      const payload = (await response.json()) as {
        ok: boolean;
        subject?: string;
        body?: string;
      };
      if (!payload.ok || !payload.subject || !payload.body) {
        setDraft({ kind: "error" });
        return;
      }
      setDraft({ kind: "done", subject: payload.subject, body: payload.body });
    } catch {
      setDraft({ kind: "error" });
    }
  }

  const locked =
    draft.kind === "done" && PLACEHOLDER.test(draft.subject + draft.body);

  async function copyDraft() {
    if (draft.kind !== "done" || locked) return;
    await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--fl-slate)]">
          {p.eyebrow}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-serif text-3xl font-medium text-[var(--fl-ink)] focus-visible:outline-none"
        >
          {p.heading}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-[var(--fl-slate)]">
          {p.intro}
        </p>
      </header>

      {stage === "clients" && (
        <section className={`${cardClass} flex flex-col gap-5 p-6`}>
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
              {p.clients.heading}
            </h2>
            <p className={hintClass}>{p.clients.hint}</p>
          </div>
          <div className="flex flex-col gap-4">
            {rows.map((row, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`try-name-${i}`} className={labelClass}>
                    {p.clients.nameLabel} {i + 1}
                  </label>
                  <input
                    id={`try-name-${i}`}
                    value={row.name}
                    maxLength={120}
                    onChange={(e) => setRow(i, { name: e.target.value })}
                    className={`${inputClass} min-h-11 px-3 text-sm`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`try-project-${i}`} className={labelClass}>
                    {p.clients.projectLabel}
                  </label>
                  <input
                    id={`try-project-${i}`}
                    value={row.project}
                    maxLength={200}
                    onChange={(e) => setRow(i, { project: e.target.value })}
                    className={`${inputClass} min-h-11 px-3 text-sm`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`try-month-${i}`} className={labelClass}>
                    {p.clients.monthLabel}
                  </label>
                  <input
                    id={`try-month-${i}`}
                    type="month"
                    value={row.month}
                    max={thisMonth}
                    onChange={(e) => setRow(i, { month: e.target.value })}
                    className={`${inputClass} min-h-11 px-3 text-sm`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={!canRank}
              onClick={() => goTo("voice")}
              className={primaryButtonClass}
            >
              {p.clients.next}
            </button>
            <button
              type="button"
              onClick={() => setRows(sampleRows(locale))}
              className={linkButtonClass}
            >
              {p.clients.sample}
            </button>
          </div>
        </section>
      )}

      {stage === "voice" && (
        <section className={`${cardClass} flex flex-col gap-5 p-6`}>
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
              {p.voice.heading}
            </h2>
            <p className={hintClass}>{p.voice.hint}</p>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className={labelClass}>{p.voice.craftLabel}</legend>
            <div className="flex flex-wrap gap-2">
              {CRAFT_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={craft === id}
                  onClick={() => setCraft(id)}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
                    craft === id
                      ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                      : "border-[var(--fl-line-control)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
                  }`}
                >
                  {t.home.rebooking.waitlist.crafts[id]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className={labelClass}>{p.voice.toneLabel}</legend>
            <div className="flex gap-2">
              {(["je", "u"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={formality === f}
                  onClick={() => setFormality(f)}
                  className={`min-h-11 rounded-lg border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
                    formality === f
                      ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                      : "border-[var(--fl-line-control)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
                  }`}
                >
                  {f === "je" ? p.voice.toneInformal : p.voice.toneFormal}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="try-greeting" className={labelClass}>
                {p.voice.greetingLabel}
              </label>
              <input
                id="try-greeting"
                value={greeting}
                maxLength={40}
                placeholder={p.voice.greetingPlaceholder}
                onChange={(e) => setGreeting(e.target.value)}
                className={`${inputClass} min-h-11 px-3 text-sm`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="try-signoff" className={labelClass}>
                {p.voice.signoffLabel}
              </label>
              <input
                id="try-signoff"
                value={signoff}
                maxLength={40}
                placeholder={p.voice.signoffPlaceholder}
                onChange={(e) => setSignoff(e.target.value)}
                className={`${inputClass} min-h-11 px-3 text-sm`}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => goTo("queue")}
              className={primaryButtonClass}
            >
              {p.voice.submit}
            </button>
            <button
              type="button"
              onClick={() => goTo("clients")}
              className={linkButtonClass}
            >
              {p.voice.back}
            </button>
          </div>
        </section>
      )}

      {stage === "queue" && (
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
              {p.queue.heading}
            </h2>
            <p className={hintClass}>{p.queue.hint}</p>
          </div>

          {ranked.length === 0 && (
            <div className={`${cardClass} flex flex-col gap-3 p-6`}>
              <h3 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
                {p.queue.empty.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
                {p.queue.empty.body}
              </p>
              <button
                type="button"
                onClick={() => goTo("clients")}
                className={`${secondaryButtonClass} w-fit`}
              >
                {p.queue.empty.edit}
              </button>
            </div>
          )}

          {ranked.map((s) => {
            const rel = relationships.find((r) => r.id === s.relationshipId)!;
            const mine = draftFor === rel.id;
            return (
              <article key={s.relationshipId} className={`${cardClass} flex flex-col gap-3 p-6`}>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-semibold text-[var(--fl-ink)]">
                    {rel.clientName}
                  </h3>
                  {rel.lastProjectTitle && (
                    <p className={hintClass}>
                      {rel.lastProjectTitle} · {rel.lastProjectDate?.slice(0, 7)}
                    </p>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-[var(--fl-ink)]">
                  {reasonTextFor(s, rel, locale)}
                </p>

                {draftFor === null && (
                  <button
                    type="button"
                    onClick={() => requestDraft(rel)}
                    className={`${primaryButtonClass} w-fit`}
                  >
                    {p.queue.draftCta}
                  </button>
                )}
                {mine && draft.kind === "loading" && (
                  <p className={hintClass} role="status">
                    {p.queue.drafting}
                  </p>
                )}
                {mine && draft.kind === "error" && (
                  <div className="flex flex-col gap-2">
                    <p className={errorClass}>{p.draft.error}</p>
                    <button
                      type="button"
                      onClick={() => requestDraft(rel)}
                      className={`${secondaryButtonClass} w-fit`}
                    >
                      {p.queue.draftCta}
                    </button>
                  </div>
                )}
                {mine && draft.kind === "limit" && (
                  <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
                    {p.draft.limit}
                  </p>
                )}
                {mine && draft.kind === "done" && (
                  <div className="flex flex-col gap-3 rounded-xl border border-[var(--fl-line)] bg-[var(--fl-paper,#faf9f7)] p-4">
                    <h4 className={labelClass}>{p.draft.heading}</h4>
                    <input
                      aria-label={p.draft.heading}
                      value={draft.subject}
                      onChange={(e) =>
                        setDraft({ ...draft, subject: e.target.value })
                      }
                      className={`${inputClass} min-h-11 px-3 text-sm font-medium`}
                    />
                    <textarea
                      aria-label={p.draft.heading}
                      value={draft.body}
                      rows={9}
                      onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                      className={`${inputClass} px-3 py-2 text-sm leading-relaxed`}
                    />
                    {locked && <p className={hintClass}>{p.draft.locked}</p>}
                    <button
                      type="button"
                      disabled={locked}
                      onClick={copyDraft}
                      className={`${primaryButtonClass} w-fit`}
                    >
                      {copied ? p.draft.copied : p.draft.copy}
                    </button>
                  </div>
                )}
              </article>
            );
          })}

          {ranked.length > 0 && notRanked.length > 0 && (
            <p className={hintClass}>
              {p.queue.notThisWeek} {notRanked.map((r) => r.clientName).join(", ")}
            </p>
          )}

          {(draft.kind === "done" || draft.kind === "limit") && (
            <div className={`${cardClass} flex flex-col gap-3 border-[var(--fl-ink)] p-6`}>
              <h3 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
                {p.gate.heading}
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-[var(--fl-slate)]">
                {fill(p.gate.body, { spots: OFFER.spots, founding: OFFER.founding, yearly: OFFER.standardYear, monthly: OFFER.standardMonth })}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/#waitlist" className={primaryButtonClass}>
                  {p.gate.cta}
                </Link>
                <button type="button" onClick={reset} className={linkButtonClass}>
                  {p.gate.again}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <p className={hintClass}>{p.privacyNote}</p>
    </main>
  );
}
