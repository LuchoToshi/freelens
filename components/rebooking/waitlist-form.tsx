"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { primaryButtonClass } from "@/components/app/styles";
import { CRAFTS, type Craft } from "@/lib/server/waitlist";
import { track } from "@/lib/analytics";
import { useLocale, useT } from "@/components/i18n/locale-provider";

/**
 * The waitlist form. Double opt-in: this only ever produces a pending signup,
 * and the confirmation link in the mail does the rest.
 *
 * The hidden "website" field is the honeypot: visually and programmatically
 * removed from humans (aria-hidden, tabIndex -1), filled only by bots that
 * complete every field they can find. The server answers a filled honeypot
 * with the same success as everything else.
 */
export function WaitlistForm() {
  const t = useT();
  const w = t.home.rebooking.waitlist;
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
        body: JSON.stringify({ name, email, craft, website, locale }),
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
      <p className="flex max-w-xl items-start gap-2 text-base font-medium leading-relaxed text-[var(--fl-ink)]">
        <Check className="mt-1 size-4 shrink-0 text-[var(--fl-payout-text)]" aria-hidden="true" />
        {w.done}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wl-name" className="text-sm font-medium text-[var(--fl-ink)]">
            {w.nameLabel}
          </Label>
          <Input
            id="wl-name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={w.namePlaceholder}
            className="rounded-lg border border-[var(--fl-line-control)] bg-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wl-email" className="text-sm font-medium text-[var(--fl-ink)]">
            {w.emailLabel}
          </Label>
          <Input
            id="wl-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={w.emailPlaceholder}
            className="rounded-lg border border-[var(--fl-line-control)] bg-white"
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-[var(--fl-ink)]">{w.craftLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {CRAFTS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={craft === c}
              onClick={() => setCraft(c)}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
                craft === c
                  ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                  : "border-[var(--fl-line-control)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
              }`}
            >
              {w.crafts[c]}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Honeypot — humans never see or reach this field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="wl-website">Website</label>
        <input
          id="wl-website"
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
        className={`${primaryButtonClass} w-fit disabled:opacity-60`}
      >
        {state === "sending" ? w.sending : w.submit}
      </button>

      {state === "error" && (
        <p role="alert" className="text-sm text-[var(--fl-short-text)]">
          {w.error}
        </p>
      )}

      <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
        {w.privacyNote}{" "}
        <Link
          href="/privacy"
          className="font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
        >
          {t.common.nav.privacy}
        </Link>
      </p>
    </form>
  );
}
