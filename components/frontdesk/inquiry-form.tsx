"use client";

import { useRef, useState } from "react";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import {
  EVENT_TYPE_OTHER,
  EVENT_TYPE_OTHER_MAX,
  INTAKE_EVENT_TYPES,
  needsOtherText,
  type IntakeEventType,
} from "@/lib/frontdesk/eventTypes";

/**
 * The inquiry form. Mobile-first, one screen, under a minute to fill.
 *
 * The `website` field is the honeypot the rest of the repo uses: hidden from
 * humans, filled only by bots, answered generically by the server.
 */
const BUDGET_BANDS = [
  { value: "<1000", key: "under" },
  { value: "1000-2500", key: "mid" },
  { value: "2500+", key: "plus" },
  { value: "unsure", key: "unsure" },
] as const;

function fill(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
}

const inputClass =
  "min-h-12 w-full rounded-lg border border-[var(--fd-line-control)] bg-[var(--fd-surface,#fff)] px-3 text-base transition focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none";
const labelClass = "text-sm font-medium text-[var(--fd-ink)]";

export function InquiryForm({
  handle,
  displayName,
  locale,
  srcChannel,
}: {
  handle: string;
  displayName: string;
  locale: FrontdeskLocale;
  srcChannel: string | null;
}) {
  const t = fdDict(locale).public.form;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState<IntakeEventType>("wedding");
  const [otherText, setOtherText] = useState("");
  const [otherError, setOtherError] = useState(false);
  const otherRef = useRef<HTMLInputElement | null>(null);
  const [budget, setBudget] = useState<(typeof BUDGET_BANDS)[number]["value"]>("unsure");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    // "Something else" with nothing after it leaves the freelancer an inquiry
    // that names no work, so it is refused here and at the API.
    if (needsOtherText(eventType, otherText)) {
      setOtherError(true);
      otherRef.current?.focus();
      return;
    }
    setState("sending");
    try {
      const response = await fetch("/api/frontdesk/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          srcChannel,
          clientName: name,
          clientEmail: email,
          eventDate: eventDate || null,
          eventType,
          eventTypeOther: eventType === EVENT_TYPE_OTHER ? otherText.trim() : null,
          budgetBand: budget,
          message,
          website,
        }),
      });
      setState(response.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p
        role="status"
        className="rounded-2xl border border-[var(--fd-line)] bg-[var(--fd-surface,#fff)] p-6 text-center text-base leading-relaxed text-[var(--fd-ink)]"
      >
        {fill(t.confirmation, { name: displayName })}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fd-name" className={labelClass}>
          {t.nameLabel}
        </label>
        <input
          id="fd-name"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fd-email" className={labelClass}>
          {t.emailLabel}
        </label>
        <input
          id="fd-email"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fd-date" className={labelClass}>
          {t.dateLabel}
        </label>
        <input
          id="fd-date"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fd-type" className={labelClass}>
          {t.typeLabel}
        </label>
        <select
          id="fd-type"
          value={eventType}
          onChange={(e) => {
            const next = e.target.value as IntakeEventType;
            setEventType(next);
            setOtherError(false);
            // Revealing the field is only half of it: without moving focus,
            // a keyboard user tabs past a required question they never saw.
            if (next === EVENT_TYPE_OTHER) requestAnimationFrame(() => otherRef.current?.focus());
          }}
          className={inputClass}
        >
          {INTAKE_EVENT_TYPES.map((value) => (
            <option key={value} value={value}>
              {t.types[value]}
            </option>
          ))}
        </select>
      </div>

      {eventType === EVENT_TYPE_OTHER && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fd-type-other" className={labelClass}>
            {t.typeOtherLabel}
          </label>
          <input
            id="fd-type-other"
            ref={otherRef}
            value={otherText}
            maxLength={EVENT_TYPE_OTHER_MAX}
            aria-invalid={otherError || undefined}
            aria-describedby={otherError ? "fd-type-other-error" : undefined}
            onChange={(e) => {
              setOtherText(e.target.value);
              if (otherError) setOtherError(false);
            }}
            className={inputClass}
          />
          {otherError && (
            <p
              id="fd-type-other-error"
              role="alert"
              className="text-xs font-medium text-[var(--fd-error-text)]"
            >
              {t.typeOtherRequired}
            </p>
          )}
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>{t.budgetLabel}</legend>
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_BANDS.map(({ value, key }) => (
            <button
              key={value}
              type="button"
              aria-pressed={budget === value}
              onClick={() => setBudget(value)}
              className={`min-h-12 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-focus-ring)] ${
                budget === value
                  ? "border-[var(--fd-ink)] bg-[var(--fd-ink)] text-[var(--fd-paper)]"
                  : "border-[var(--fd-line-control)] bg-[var(--fd-surface,#fff)] text-[var(--fd-ink)]"
              }`}
            >
              {t.budgets[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fd-message" className={labelClass}>
          {t.messageLabel}
        </label>
        <textarea
          id="fd-message"
          rows={4}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} min-h-24 py-2 leading-relaxed`}
        />
      </div>

      {/* Honeypot: invisible to humans, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="fd-website">website</label>
        <input
          id="fd-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {state === "error" && (
        <p className="text-sm font-medium text-[var(--fd-error-text)]" role="alert">
          {t.error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        // The one place the freelancer's accent appears, with a text colour
        // derived from it rather than assumed (handoff §11).
        style={{
          backgroundColor: "var(--fl-accent, var(--fd-ink))",
          color: "var(--fl-accent-text, #FFFFFF)",
        }}
        className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 text-base font-medium shadow-sm transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50"
      >
        {state === "sending" ? t.sending : t.submit}
      </button>
    </form>
  );
}
