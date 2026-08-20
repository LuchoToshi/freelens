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
          "id, handle, display_name, craft, city, professions, location, photo_url, locale, sign_off, voice_profile, link_in_bio_confirmed_at"
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
        <p role="status" className="rounded-2xl border border-[var(--fd-line)] bg-white p-5 text-sm leading-relaxed text-[var(--fd-ink)]">
          {t.sent}
        </p>
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
