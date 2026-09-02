"use client";

import { useMemo, useState } from "react";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { inferEventType } from "@/lib/frontdesk/packageGaps";
import {
  EVENT_TYPE_OTHER,
  EVENT_TYPE_OTHER_MAX,
  eventTypeLabel,
  INTAKE_EVENT_TYPES,
  UNSPECIFIED_EVENT_TYPE,
  type IntakeEventType,
} from "@/lib/frontdesk/eventTypes";

/**
 * Hybrid intake (addendum §3): essentials first — the message IS the brief;
 * date, type and budget no longer gate submission. Then the desk asks only
 * the gaps the freelancer needs to quote (≤3, each with a why-line and quick
 * chips, every one skippable, "send as is" always visible). Confirmation
 * shows what the freelancer will see with a per-line source. The old full
 * form stays one link away; this surface speaks as "{Name}'s front desk",
 * never as Freelens (ChromeGate promise), and keeps the honeypot.
 */

const BUDGET_BANDS = ["<1000", "1000-2500", "2500+", "unsure"] as const;
const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

interface Answers {
  eventDate: string | null;
  eventType: IntakeEventType | null;
  eventTypeOther: string;
  typeSource: "message" | "answer" | null;
  budget: (typeof BUDGET_BANDS)[number] | null;
}

export function IntakeThread({
  handle,
  displayName,
  locale,
  srcChannel,
  onManualFallback,
}: {
  handle: string;
  displayName: string;
  locale: FrontdeskLocale;
  srcChannel: string | null;
  onManualFallback: () => void;
}) {
  const t = fdDict(locale).public.intake;
  const form = fdDict(locale).public.form;
  const firstName = displayName.split(" ")[0];

  const [step, setStep] = useState<"essentials" | "conversation" | "confirm" | "done" | "error">(
    "essentials"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [answers, setAnswers] = useState<Answers>({
    eventDate: null,
    eventType: null,
    eventTypeOther: "",
    typeSource: null,
    budget: null,
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [dateInput, setDateInput] = useState("");
  const [sending, setSending] = useState(false);

  // The gaps worth asking about, decided ONCE from the essentials. A type
  // named in the client's own message is never asked again.
  const questions = useMemo(() => {
    const inferred = inferEventType(message) as Answers["eventType"] | null;
    const list: ("date" | "type" | "budget")[] = ["date"];
    if (!inferred) list.push("type");
    list.push("budget");
    return { list, inferred };
  }, [message]);

  function beginConversation(e: React.FormEvent) {
    e.preventDefault();
    if (questions.inferred) {
      setAnswers((a) => ({ ...a, eventType: questions.inferred, typeSource: "message" }));
    }
    setStep("conversation");
    setQuestionIndex(0);
  }

  function advance() {
    if (questionIndex + 1 >= questions.list.length) setStep("confirm");
    else setQuestionIndex(questionIndex + 1);
  }

  async function submit() {
    if (sending) return;
    const settledType =
      answers.eventType === EVENT_TYPE_OTHER && !answers.eventTypeOther.trim()
        ? UNSPECIFIED_EVENT_TYPE
        : (answers.eventType ?? UNSPECIFIED_EVENT_TYPE);
    setSending(true);
    try {
      const response = await fetch("/api/frontdesk/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          srcChannel,
          website,
          clientName: name,
          clientEmail: email,
          eventDate: answers.eventDate ?? "",
          // No answer means no answer: the desk stores that the client never
          // said, rather than filing it as "Something else". The same applies
          // to "Something else" abandoned before the follow-up was answered,
          // which is reachable by skipping the question.
          eventType: settledType,
          eventTypeOther:
            settledType === EVENT_TYPE_OTHER ? answers.eventTypeOther.trim() : null,
          budgetBand: answers.budget ?? "unsure",
          message,
        }),
      });
      const payload = (await response.json()) as { ok: boolean };
      setStep(payload.ok ? "done" : "error");
    } catch {
      setStep("error");
    }
    setSending(false);
  }

  const inputClass =
    "min-h-12 w-full rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-base transition focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none";
  const chipClass =
    "inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-sm font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]";
  const primaryClass =
    "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-6 text-base font-medium text-white disabled:opacity-50";
  const ghostClass =
    "w-fit text-sm font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]";

  if (step === "done") {
    return (
      <p role="status" className="rounded-2xl border border-[var(--fd-line)] bg-white p-6 text-base leading-relaxed text-[var(--fd-ink)]">
        {t.done.replace("{name}", firstName)}
      </p>
    );
  }
  if (step === "error") {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="rounded-2xl border border-[var(--fd-error-text)]/40 bg-white p-6 text-base leading-relaxed text-[var(--fd-ink)]">
          {t.error}
        </p>
        <button type="button" onClick={() => setStep("confirm")} className={ghostClass}>
          {t.tryAgain}
        </button>
      </div>
    );
  }

  if (step === "essentials") {
    return (
      <form onSubmit={beginConversation} className="flex flex-col gap-4">
        {/* A visitor may never have heard of Freelens or seen this page
            before: say who they are writing to, what to write, and what
            happens next, before asking for anything. */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fd-slate)]">
            {t.stepOf.replace("{n}", "1")}
          </p>
          <h2 className="font-serif text-xl font-medium text-[var(--fd-ink)]">
            {t.heading.replace("{name}", firstName)}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--fd-slate)]">
            {t.intro.replace(/\{name\}/g, firstName)}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="it-name" className="text-sm font-medium text-[var(--fd-ink)]">
            {form.nameLabel}
          </label>
          <input id="it-name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} aria-describedby="it-name-why" className={inputClass} />
          <span id="it-name-why" className="text-xs leading-relaxed text-[var(--fd-slate)]">
            {t.nameWhy.replace("{name}", firstName)}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="it-email" className="text-sm font-medium text-[var(--fd-ink)]">
            {form.emailLabel}
          </label>
          <input id="it-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          <span className="text-xs leading-relaxed text-[var(--fd-slate)]">
            {t.emailWhy.replace("{name}", firstName)}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="it-message" className="text-sm font-medium text-[var(--fd-ink)]">
            {t.planningLabel.replace("{name}", firstName)}
          </label>
          <textarea id="it-message" required rows={5} maxLength={5000} value={message} onChange={(e) => setMessage(e.target.value)} aria-describedby="it-message-help" className={`${inputClass} min-h-28 py-2 leading-relaxed`} />
          <span id="it-message-help" className="text-xs leading-relaxed text-[var(--fd-slate)]">
            {t.planningHelp.replace("{name}", firstName)}
          </span>
        </div>
        {/* Honeypot, unchanged from the classic form. */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label htmlFor="it-website">website</label>
          <input id="it-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <button type="submit" className={primaryClass}>
          {t.continueButton}
        </button>
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
          {t.privacy.replace("{name}", firstName)}
        </p>
        <button type="button" onClick={onManualFallback} className={ghostClass}>
          {t.manualFallback}
        </button>
      </form>
    );
  }

  if (step === "conversation") {
    const current = questions.list[questionIndex];
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-[var(--fd-slate)]">
          {t.conversationIntro.replace("{name}", firstName)}
        </p>
        <div className="flex flex-col gap-2 rounded-2xl border border-[var(--fd-line)] bg-white p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
            {t.deskName.replace("{name}", firstName)}
          </span>
          <p className="text-base leading-relaxed text-[var(--fd-ink)]">
            {current === "date" && t.dateQuestion}
            {current === "type" && t.typeQuestion}
            {current === "budget" && t.budgetQuestion}
          </p>
          <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
            {current === "date" && t.dateWhy.replace("{name}", firstName)}
            {current === "type" && t.typeWhy}
            {current === "budget" && t.budgetWhy}
          </p>

          {current === "date" && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="date"
                aria-label={form.dateLabel}
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className={`${inputClass} w-auto`}
              />
              <button
                type="button"
                disabled={!DATE_SHAPE.test(dateInput)}
                onClick={() => {
                  setAnswers((a) => ({ ...a, eventDate: dateInput }));
                  advance();
                }}
                className={`${chipClass} disabled:opacity-50`}
              >
                {t.dateConfirm}
              </button>
              <button type="button" onClick={advance} className={chipClass}>
                {t.dateUnknown}
              </button>
            </div>
          )}

          {current === "type" && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex flex-wrap gap-2">
                {INTAKE_EVENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={answers.eventType === type}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, eventType: type, typeSource: "answer" }));
                      // "Something else" is the one chip that asks a follow-up,
                      // so it stays on this question until it is answered.
                      if (type !== EVENT_TYPE_OTHER) advance();
                    }}
                    className={`${chipClass} ${
                      answers.eventType === type ? "border-[var(--fd-ink)]" : ""
                    }`}
                  >
                    {form.types[type]}
                  </button>
                ))}
              </div>
              {answers.eventType === EVENT_TYPE_OTHER && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="it-type-other" className="text-sm text-[var(--fd-ink)]">
                    {form.typeOtherLabel}
                  </label>
                  <input
                    id="it-type-other"
                    autoFocus
                    value={answers.eventTypeOther}
                    maxLength={EVENT_TYPE_OTHER_MAX}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, eventTypeOther: e.target.value }))
                    }
                    className={inputClass}
                  />
                  <button
                    type="button"
                    disabled={!answers.eventTypeOther.trim()}
                    onClick={advance}
                    className={`${primaryClass} w-fit`}
                  >
                    {t.dateConfirm}
                  </button>
                </div>
              )}
            </div>
          )}

          {current === "budget" && (
            <div className="flex flex-wrap gap-2 pt-1">
              {BUDGET_BANDS.filter((b) => b !== "unsure").map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, budget: band }));
                    advance();
                  }}
                  className={chipClass}
                >
                  {band === "<1000" ? form.budgets.under : band === "1000-2500" ? form.budgets.mid : form.budgets.plus}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAnswers((a) => ({ ...a, budget: "unsure" }));
                  advance();
                }}
                className={chipClass}
              >
                {t.budgetUnsettled}
              </button>
            </div>
          )}

          <button type="button" onClick={advance} className={`${ghostClass} pt-1`}>
            {t.skipQuestion}
          </button>
        </div>
        <button type="button" onClick={() => setStep("confirm")} className={ghostClass}>
          {t.sendAsIs}
        </button>
      </div>
    );
  }

  // confirm
  const lines: { label: string; value: string; source: string }[] = [
    { label: form.nameLabel, value: name, source: t.sourceYou },
    { label: form.emailLabel, value: email, source: t.sourceYou },
    {
      label: form.typeLabel,
      value: answers.eventType
        ? eventTypeLabel(answers.eventType, answers.eventTypeOther, form.types)
        : t.notSettled,
      source:
        answers.typeSource === "message"
          ? t.sourceMessage
          : answers.typeSource === "answer"
            ? t.sourceAnswer
            : t.sourceUnsettled,
    },
    {
      label: form.dateLabel,
      value: answers.eventDate ?? t.notSettled,
      source: answers.eventDate ? t.sourceAnswer : t.sourceUnsettled,
    },
    {
      label: form.budgetLabel,
      value:
        answers.budget && answers.budget !== "unsure"
          ? answers.budget === "<1000"
            ? form.budgets.under
            : answers.budget === "1000-2500"
              ? form.budgets.mid
              : form.budgets.plus
          : t.notSettled,
      source: answers.budget && answers.budget !== "unsure" ? t.sourceAnswer : t.sourceUnsettled,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fd-slate)]">
        {t.stepOf.replace("{n}", "2")}
      </p>
      <p className="text-sm leading-relaxed text-[var(--fd-slate)]">
        {t.confirmIntro.replace("{name}", firstName)}
      </p>
      <dl className="flex flex-col gap-2 rounded-2xl border border-[var(--fd-line)] bg-white p-5">
        {lines.map((line) => (
          <div key={line.label} className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <dt className="min-w-28 text-[var(--fd-slate)]">{line.label}</dt>
            <dd className="text-[var(--fd-ink)]">{line.value}</dd>
            <dd className="text-xs text-[var(--fd-slate)]">({line.source})</dd>
          </div>
        ))}
        <div className="flex flex-col gap-1 border-t border-[var(--fd-line)] pt-2 text-sm">
          <span className="text-[var(--fd-slate)]">{t.planningLabel.replace("{name}", firstName)}</span>
          <p className="whitespace-pre-line break-words leading-relaxed text-[var(--fd-ink)]">{message}</p>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={sending} onClick={() => void submit()} className={primaryClass}>
          {sending ? t.sending : t.send}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("conversation");
            setQuestionIndex(0);
          }}
          className={ghostClass}
        >
          {t.editAnswers}
        </button>
      </div>
      <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
        {t.privacy.replace("{name}", firstName)}
      </p>
    </div>
  );
}
