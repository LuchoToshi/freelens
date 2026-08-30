"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * Supabase puts auth-callback errors (e.g. an expired magic link) in the URL
 * hash, not the query string. Its own client strips that hash as soon as it
 * initializes (detectSessionInUrl), which races the login form's own effect.
 * Captured here at module-evaluation time — before any component mounts and
 * before `supabaseBrowser()` is ever called — so the value can't be clobbered.
 */
const capturedAuthHash = typeof window !== "undefined" ? window.location.hash : "";

interface EmailProvider {
  name: string;
  url: string;
}

const GMAIL_PROVIDER: EmailProvider = {
  name: "Gmail",
  url: "https://mail.google.com/mail/u/0/#search/from%3Anoreply%40send.frlns.com+newer_than%3A1h",
};
const OUTLOOK_PROVIDER: EmailProvider = { name: "Outlook.com", url: "https://outlook.live.com/mail/0/inbox" };
const ICLOUD_PROVIDER: EmailProvider = { name: "iCloud Mail", url: "https://www.icloud.com/mail" };
const YAHOO_PROVIDER: EmailProvider = { name: "Yahoo Mail", url: "https://mail.yahoo.com/" };
const PROTON_PROVIDER: EmailProvider = { name: "Proton Mail", url: "https://mail.proton.me/u/0/inbox" };

/**
 * One button when the typed address maps to a known webmail provider, so the
 * tester lands straight on the mail that matters (Gmail gets a search deep
 * link scoped to our sender + the last hour, burying stale prior links)
 * instead of hunting through a generic inbox. Unknown/custom domains — most
 * work email — fall back to the two providers that cover nearly all of them.
 */
function providersForEmail(email: string): EmailProvider[] {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain === "gmail.com" || domain === "googlemail.com") return [GMAIL_PROVIDER];
  if (/^(outlook|hotmail|live|msn)\./.test(domain)) return [OUTLOOK_PROVIDER];
  if (/^(icloud|me|mac)\./.test(domain)) return [ICLOUD_PROVIDER];
  if (domain.startsWith("yahoo.")) return [YAHOO_PROVIDER];
  if (domain.startsWith("proton.") || domain === "protonmail.com" || domain === "pm.me") return [PROTON_PROVIDER];
  return [GMAIL_PROVIDER, OUTLOOK_PROVIDER];
}

/**
 * FrontDesk's magic-link gate, copied from the /app pattern (agent-app.tsx),
 * not imported — the original stays untouched.
 *
 * Deliberate coupling, documented: `supabaseBrowser()` is the shared session
 * singleton, so a FrontDesk sign-in is also a /app sign-in on this device
 * (same auth project). Accepted for v1. The guard that matters: FrontDesk
 * navigation stays inside FrontDesk — nothing here links to /app or the rest
 * of the site, so testers are never led out of the flow mid-test.
 */
export interface FreelancerRow {
  id: string;
  handle: string;
  display_name: string;
  craft: "photographer" | "videographer" | "designer" | "illustrator" | "other";
  city: string | null;
  professions: string[] | null;
  location: string | null;
  photo_url: string | null;
  locale: FrontdeskLocale;
  sign_off: string | null;
  timezone: string | null;
  voice_profile: Record<string, unknown> | null;
  link_in_bio_confirmed_at: string | null;
}

type GateState =
  | { stage: "loading" }
  | { stage: "login" }
  | { stage: "ready"; session: Session; freelancer: FreelancerRow | null };

export function AuthGate({
  locale = "en",
  children,
}: {
  locale?: FrontdeskLocale;
  children: (session: Session, freelancer: FreelancerRow | null, reload: () => void) => React.ReactNode;
}) {
  const t = fdDict(locale).auth;
  const [state, setState] = useState<GateState>({ stage: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const sb = supabaseBrowser();
    let cancelled = false;

    async function apply(session: Session | null) {
      if (cancelled) return;
      if (!session) {
        setState({ stage: "login" });
        return;
      }
      const { data } = await sb
        .from("freelancers")
        .select(
          "id, handle, display_name, craft, city, professions, location, photo_url, locale, sign_off, timezone, voice_profile, link_in_bio_confirmed_at"
        )
        .maybeSingle();
      if (cancelled) return;
      setState({ stage: "ready", session, freelancer: (data as FreelancerRow | null) ?? null });
    }

    sb.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      void apply(session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [reloadKey]);

  if (state.stage === "loading") {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <p className="text-sm text-[var(--fd-slate)]">{t.loading}</p>
      </main>
    );
  }

  if (state.stage === "login") {
    return <Login locale={locale} />;
  }

  return <>{children(state.session, state.freelancer, () => setReloadKey((k) => k + 1))}</>;
}

function Login({ locale }: { locale: FrontdeskLocale }) {
  const t = fdDict(locale).auth;
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [redirectError, setRedirectError] = useState<"expired" | "generic" | null>(null);
  const [code, setCode] = useState("");
  const [codePhase, setCodePhase] = useState<"idle" | "verifying" | "error">("idle");

  useEffect(() => {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(capturedAuthHash.replace(/^#/, ""));
    const error = url.searchParams.get("error") ?? hashParams.get("error");
    if (!error) return;
    const errorCode = url.searchParams.get("error_code") ?? hashParams.get("error_code");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the auth callback's error redirect, not derivable from render since window.location isn't available server-side
    setRedirectError(errorCode === "otp_expired" ? "expired" : "generic");
    // Supabase's own error code/description, never shown to the user directly.
    console.error(
      "Sign-in redirect error:",
      errorCode,
      url.searchParams.get("error_description") ?? hashParams.get("error_description")
    );
    url.searchParams.delete("error");
    url.searchParams.delete("error_code");
    url.searchParams.delete("error_description");
    url.hash = "";
    window.history.replaceState({}, "", url.toString());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPhase("sending");
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/inbox` },
    });
    setPhase(error ? "error" : "sent");
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setCodePhase("verifying");
    const sb = supabaseBrowser();
    const { error } = await sb.auth.verifyOtp({ email, token: code, type: "email" });
    // On success, AuthGate's onAuthStateChange picks up the new session and
    // unmounts Login entirely — no local success state to set here.
    if (error) setCodePhase("error");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">{t.heading}</h1>
        <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.intro}</p>
      </div>
      {redirectError && (
        <div role="alert" className="rounded-2xl border border-[var(--fd-error-text)] bg-white p-4 text-sm leading-relaxed text-[var(--fd-ink)]">
          <p className="font-medium">
            {redirectError === "expired" ? t.expiredHeading : t.redirectErrorHeading}
          </p>
          <p className="mt-1">{redirectError === "expired" ? t.expiredBody : t.redirectErrorBody}</p>
          <button
            type="button"
            onClick={() => setRedirectError(null)}
            className="mt-2 text-sm font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4"
          >
            {t.backToSignIn}
          </button>
        </div>
      )}
      {phase === "sent" ? (
        <div className="flex flex-col gap-5">
          <p role="status" className="rounded-2xl border border-[var(--fd-line)] bg-white p-5 text-sm leading-relaxed text-[var(--fd-ink)]">
            {t.sent}
          </p>
          <form onSubmit={submitCode} className="flex flex-col gap-3">
            <label htmlFor="fd-auth-code" className="text-sm font-medium text-[var(--fd-ink)]">
              {t.codeLabel}
            </label>
            <input
              id="fd-auth-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="min-h-12 w-full rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-center text-lg tracking-[0.3em] focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none"
            />
            {codePhase === "error" && (
              <p className="text-sm font-medium text-[var(--fd-error-text)]" role="alert">
                {t.codeError}
              </p>
            )}
            <button
              type="submit"
              disabled={codePhase === "verifying" || code.length !== 6}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-6 text-base font-medium text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:opacity-50"
            >
              {codePhase === "verifying" ? t.sending : t.codeSubmit}
            </button>
          </form>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[var(--fd-slate)]">{t.openInboxHint}</p>
            <div className="flex flex-wrap gap-2">
              {providersForEmail(email).map((provider) => (
                <a
                  key={provider.name}
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--fd-line-control)] bg-white px-5 text-base font-medium text-[var(--fd-ink)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
                >
                  {t.openProvider.replace("{provider}", provider.name)}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label htmlFor="fd-auth-email" className="text-sm font-medium text-[var(--fd-ink)]">
            {t.emailLabel}
          </label>
          <input
            id="fd-auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-base focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none"
          />
          {phase === "error" && (
            <p className="text-sm font-medium text-[var(--fd-error-text)]" role="alert">
              {t.error}
            </p>
          )}
          <button
            type="submit"
            disabled={phase === "sending"}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-6 text-base font-medium text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:opacity-50"
          >
            {phase === "sending" ? t.sending : t.send}
          </button>
        </form>
      )}
    </main>
  );
}
