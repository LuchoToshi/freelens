"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { CRAFTS, type Craft } from "@/lib/server/waitlist";
import { track } from "@/lib/analytics";
import { useLocale, useT } from "@/components/i18n/locale-provider";

/**
 * The FrontDesk early-access form. Same endpoint and double opt-in as the
 * rebooking waitlist — `product: "frontdesk"` is the only wire difference, so
 * the signup is stored on the right list and the confirmation mail names the
 * right product. The craft picker doubles as the overflow capture: "Something
 * else" is how adjacent crafts tell us what they do.
 *
 * Editorial restyle: underline fields instead of boxes, sharp chips, accent
 * submit. Every id, handler and payload byte is the pre-redesign plumbing.
 */
const underlineField =
  "w-full border-0 border-b border-[var(--fd-ink)]/30 bg-transparent pb-2 text-lg text-[var(--fd-ink)] placeholder:text-[var(--fd-slate)]/60 focus:border-[var(--fd-ink)] focus:outline-none";
const fieldLabel = "text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fd-slate)]";

export function FrontdeskWaitlistForm() {
  const t = useT();
  const w = t.home.frontdesk.waitlist;
  const { locale } = useLocale();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [craft, setCraft] = useState<Craft | "">("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === "sending" || !craft) return;
    setState("sending");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, craft, website, locale, product: "frontdesk" }),
      });
      if (response.ok) {
        setState("done");
        track("waitlist_submitted");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className="flex max-w-xl items-start gap-2 font-serif text-xl font-medium leading-relaxed text-[var(--fd-ink)]">
        <Check className="mt-1.5 size-5 shrink-0 text-[var(--fd-accent)]" aria-hidden="true" />
        {w.done}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-xl flex-col gap-8">
      {/* The email line is the moment: one oversized underline field, the
          name tucked beneath it. Same fields, same ids, same payload. */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2.5">
          <label htmlFor="fd-wl-email" className={fieldLabel}>
            {w.emailLabel}
          </label>
          <input
            id="fd-wl-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={w.emailPlaceholder}
            className={`${underlineField} text-xl sm:text-2xl`}
          />
        </div>
        <div className="flex flex-col gap-2.5 sm:max-w-xs">
          <label htmlFor="fd-wl-name" className={fieldLabel}>
            {w.nameLabel}
          </label>
          <input
            id="fd-wl-name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={w.namePlaceholder}
            className={underlineField}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${fieldLabel} mb-3`}>{w.craftLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {CRAFTS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={craft === c}
              onClick={() => setCraft(c)}
              className={`min-h-11 border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-ink)] ${
                craft === c
                  ? "border-[var(--fd-ink)] bg-[var(--fd-ink)] text-white"
                  : "border-[var(--fd-ink)]/25 bg-transparent text-[var(--fd-ink)] hover:border-[var(--fd-ink)]"
              }`}
            >
              {w.crafts[c]}
            </button>
          ))}
        </div>
        {/* Closes the loop from the overflow line above the form: at 390px the
            name/email fields sit between them, so the chip needs its own hint. */}
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{w.otherHint}</p>
      </fieldset>

      {/* Honeypot — humans never see or reach this field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="fd-wl-website">Website</label>
        <input
          id="fd-wl-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={state === "sending" || !craft}
        className="inline-flex min-h-14 w-fit items-center bg-[var(--fd-accent)] px-8 text-base font-semibold text-[var(--fd-ink)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--fd-ink)]"
      >
        {state === "sending" ? w.sending : w.submit}
      </button>

      {state === "error" && (
        <p role="alert" className="text-sm text-[var(--fl-short-text)]">
          {w.error}
        </p>
      )}

      <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
        {w.privacyNote}{" "}
        <Link
          href="/privacy"
          className="font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-ink)]/30 underline-offset-4 hover:decoration-[var(--fd-ink)]"
        >
          {t.common.nav.privacy}
        </Link>
      </p>
    </form>
  );
}
