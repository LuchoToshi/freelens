"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { primaryButtonClass } from "@/components/app/styles";
import { DEFAULT_COUNTRY, latestProfileYear, loadProfile } from "@/lib/tax/loadProfile";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

/**
 * The one thing the site asks for, with the honest reason attached.
 *
 * Not "subscribe to our newsletter": the offer is specific and checkable. The
 * config version and the date it was verified come from the profile itself,
 * so this section can never claim a check that did not happen. When the rules
 * change, the people here hear about it; that is the entire deal.
 */
export function SignupSection() {
  const t = useT();
  const s = t.home.signup;
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const year = latestProfileYear(DEFAULT_COUNTRY);
  const profile = year !== null ? loadProfile(DEFAULT_COUNTRY, year) : null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      setState(response.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <section
      aria-label={s.ariaLabel}
      className="border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-14 sm:px-8 sm:py-16">
        <h2 className="font-serif text-2xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-3xl">
          {s.heading}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--fl-slate)]">
          {profile
            ? fill(s.body, {
                version: profile.configVersion,
                date: profile.configRetrievedAt,
              })
            : s.bodyFallback}
        </p>

        {state === "done" ? (
          <p className="flex items-center gap-2 text-base font-medium text-[var(--fl-ink)]">
            <Check className="size-4 text-[var(--fl-payout-text)]" aria-hidden="true" />
            {s.done}
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5 sm:max-w-sm">
              <Label htmlFor="signup-email" className="text-sm font-medium text-[var(--fl-ink)]">
                {s.emailLabel}
              </Label>
              <Input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={s.placeholder}
                className="rounded-lg border border-[var(--fl-line)] bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={state === "sending"}
              className={`${primaryButtonClass} disabled:opacity-60`}
            >
              {state === "sending" ? s.sending : s.submit}
            </button>
          </form>
        )}

        {state === "error" && (
          <p role="alert" className="text-sm text-[var(--fl-short-text)]">
            {s.error}
          </p>
        )}

        <p className="text-xs leading-relaxed text-[var(--fl-slate)]">{s.privacyNote}</p>
      </div>
    </section>
  );
}
