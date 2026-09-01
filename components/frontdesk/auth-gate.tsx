"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import Link from "next/link";
import { CodeInput, type CodeStatus } from "@/components/auth/code-input";

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

/** The sign-in service refuses a second email to the same address inside 60s. */
const RESEND_COOLDOWN_SECONDS = 60;

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
  voice_learning_paused: boolean | null;
  voice_proposal_decisions: import("@/lib/frontdesk/voiceLearning").ProposalDecisions | null;
  permission_levels: Record<string, unknown> | null;
  followup_quiet_days: number | null;
  followups_paused: boolean | null;
  rules_paused: boolean | null;
  link_in_bio_confirmed_at: string | null;
  /** Page appearance; validated by lib/frontdesk/appearance.ts on read. */
  appearance: unknown;
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
          "id, handle, display_name, craft, city, professions, location, photo_url, locale, sign_off, timezone, voice_profile, voice_learning_paused, voice_proposal_decisions, permission_levels, followup_quiet_days, followups_paused, rules_paused, link_in_bio_confirmed_at, appearance"
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
  const [mode, setMode] = useState<"email" | "code" | "invite">("email");
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "noAccount" | "tooSoon" | "error">("idle");
  const [redirectError, setRedirectError] = useState<"expired" | "generic" | null>(null);
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<CodeStatus>("idle");
  const [attempts, setAttempts] = useState(0);
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteState, setInviteState] = useState<"idle" | "checking" | "used" | "invalid">("idle");

  useEffect(() => {
    const url = new URL(window.location.href);
    // Invite deep link: ?invite=FRLNS-XXXX opens sign-up with the code filled.
    const invite = url.searchParams.get("invite");
    if (invite) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a URL param, unavailable during SSR
      setInviteCode(invite.toUpperCase());
      setMode("invite");
      url.searchParams.delete("invite");
      window.history.replaceState({}, "", url.toString());
    }
    const hashParams = new URLSearchParams(capturedAuthHash.replace(/^#/, ""));
    const error = url.searchParams.get("error") ?? hashParams.get("error");
    if (!error) return;
    const errorCode = url.searchParams.get("error_code") ?? hashParams.get("error_code");
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

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(
      () => setCooldown((c) => (c > 0 ? c - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, [cooldown]);

  async function sendCode(): Promise<boolean> {
    const sb = supabaseBrowser();
    // No emailRedirectTo, ever: the email carries a code, not a link, so no
    // session-granting URL exists to forward or intercept (addendum §1.1).
    // shouldCreateUser: false — accounts are only born in the invite route.
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      const message = error.message.toLowerCase();
      // The service refuses a second email to the same address inside a minute
      // and says how long is left. Reporting that as a generic failure sends
      // the reader off to inspect an address that was never the problem, which
      // is the single worst thing this screen can do: the account is fine, the
      // request was simply early.
      const tooSoon = message.match(/after (\d+) seconds?/);
      if (tooSoon) {
        setCooldown(Number(tooSoon[1]));
        setPhase("tooSoon");
        return false;
      }
      setPhase(message.includes("signup") || message.includes("not allowed") ? "noAccount" : "error");
      return false;
    }
    setCode("");
    setCodeStatus("idle");
    setAttempts(0);
    setSentAt(Date.now());
    // Matches the sign-in service's own minimum gap between two emails to the
    // same address (smtp_max_frequency, 60s). A shorter cooldown here re-enables
    // the button before the server will accept the request, and the refusal
    // comes back as the generic "that did not work", which reads as a problem
    // with the address rather than as "too soon".
    setCooldown(RESEND_COOLDOWN_SECONDS);
    return true;
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setPhase("sending");
    if (await sendCode()) {
      setPhase("idle");
      setMode("code");
    }
  }

  async function verify(token: string) {
    if (codeStatus === "locked" || codeStatus === "verifying") return;
    setCodeStatus("verifying");
    const sb = supabaseBrowser();
    const { error } = await sb.auth.verifyOtp({ email, token, type: "email" });
    // On success, AuthGate's onAuthStateChange picks up the new session and
    // unmounts Login entirely — no local success state to set here.
    if (!error) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setCode("");
    if (nextAttempts >= 5) setCodeStatus("locked");
    else if (sentAt && Date.now() - sentAt > 10 * 60_000) setCodeStatus("expired");
    else setCodeStatus("error");
  }

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteState("checking");
    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode, email }),
      });
      const payload = (await res.json()) as { ok: boolean; reason?: string };
      if (payload.ok) {
        setInviteState("idle");
        if (await sendCode()) setMode("code");
        return;
      }
      setInviteState(payload.reason === "used" ? "used" : "invalid");
    } catch {
      setInviteState("invalid");
    }
  }

  const codeError =
    codeStatus === "error"
      ? t.codeWrong.replace("{n}", String(Math.max(0, 5 - attempts)))
      : codeStatus === "expired"
        ? t.codeExpired
        : codeStatus === "locked"
          ? t.codeLocked
          : undefined;

  const inputClass =
    "min-h-12 w-full rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-base focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none";
  const primaryClass =
    "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-6 text-base font-medium text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:opacity-50";
  const ghostClass =
    "w-fit text-sm font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4 hover:decoration-[var(--fd-ink)] disabled:no-underline disabled:text-[var(--fd-slate)]";

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      {redirectError && (
        <div role="alert" className="rounded-2xl border border-[var(--fd-error-text)] bg-white p-4 text-sm leading-relaxed text-[var(--fd-ink)]">
          <p className="font-medium">
            {redirectError === "expired" ? t.expiredHeading : t.redirectErrorHeading}
          </p>
          <p className="mt-1">{redirectError === "expired" ? t.expiredBody : t.redirectErrorBody}</p>
          <button type="button" onClick={() => setRedirectError(null)} className={`mt-2 ${ghostClass}`}>
            {t.backToSignIn}
          </button>
        </div>
      )}

      {mode === "email" && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">{t.heading}</h1>
            <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.codeIntro}</p>
          </div>
          <form onSubmit={submitEmail} className="flex flex-col gap-3">
            <label htmlFor="fd-auth-email" className="text-sm font-medium text-[var(--fd-ink)]">
              {t.emailLabel}
            </label>
            <input
              id="fd-auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            {phase === "noAccount" && (
              <p className="text-sm font-medium text-[var(--fd-error-text)]" role="alert">
                {t.noAccount}
              </p>
            )}
            {phase === "tooSoon" && (
              <p className="text-sm font-medium text-[var(--fd-slate)]" role="status">
                {t.tooSoon.replace("{s}", String(cooldown))}
              </p>
            )}
            {phase === "error" && (
              <p className="text-sm font-medium text-[var(--fd-error-text)]" role="alert">
                {t.error}
              </p>
            )}
            <button
              type="submit"
              disabled={phase === "sending" || cooldown > 0}
              className={primaryClass}
            >
              {phase === "sending"
                ? t.sending
                : cooldown > 0
                  ? t.resendIn.replace("{s}", String(cooldown))
                  : t.sendCode}
            </button>
          </form>
          <button type="button" onClick={() => setMode("invite")} className={ghostClass}>
            {t.haveInvite}
          </button>
          <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.trustLine}</p>
        </>
      )}

      {mode === "code" && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">{t.codeHeading}</h1>
            <p role="status" className="text-sm leading-relaxed text-[var(--fd-slate)]">
              {t.codeSentTo.replace("{email}", email)}
            </p>
          </div>
          <CodeInput
            value={code}
            onChange={(next) => {
              setCode(next);
              if (codeStatus === "error" || codeStatus === "expired") setCodeStatus("idle");
            }}
            onComplete={(token) => void verify(token)}
            status={codeStatus}
            errorText={codeError}
            label={t.codeLabel}
            checkingText={t.codeChecking}
          />
          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={cooldown > 0 || codeStatus === "verifying"}
              onClick={() => void sendCode()}
              className={ghostClass}
            >
              {cooldown > 0 ? t.resendIn.replace("{s}", String(cooldown)) : t.resend}
            </button>
            <div className="flex flex-wrap items-center gap-3">
              {providersForEmail(email).map((provider) => (
                <a
                  key={provider.name}
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] bg-white px-4 text-sm font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]"
                >
                  {t.openProvider.replace("{provider}", provider.name)}
                </a>
              ))}
              <button type="button" onClick={() => setMode("email")} className={ghostClass}>
                {t.wrongAddress}
              </button>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.unsolicited}</p>
        </>
      )}

      {mode === "invite" && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">{t.inviteHeading}</h1>
            <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.inviteIntro}</p>
          </div>
          <form onSubmit={submitInvite} className="flex flex-col gap-3">
            <label htmlFor="fd-auth-invite" className="text-sm font-medium text-[var(--fd-ink)]">
              {t.inviteLabel}
            </label>
            <input
              id="fd-auth-invite"
              required
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                if (inviteState !== "idle") setInviteState("idle");
              }}
              className={`${inputClass} font-mono tracking-[0.08em]`}
            />
            <label htmlFor="fd-auth-invite-email" className="text-sm font-medium text-[var(--fd-ink)]">
              {t.inviteEmailLabel}
            </label>
            <input
              id="fd-auth-invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <span className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.inviteProveNote}</span>
            {inviteState === "used" && (
              <p role="alert" className="rounded-xl border border-[var(--fd-line)] bg-[var(--fd-paper)] p-3 text-sm leading-relaxed text-[var(--fd-ink)]">
                {t.inviteUsed}
              </p>
            )}
            {inviteState === "invalid" && (
              <p role="alert" className="rounded-xl border border-[var(--fd-error-text)]/40 bg-white p-3 text-sm leading-relaxed text-[var(--fd-ink)]">
                {t.inviteInvalid}
              </p>
            )}
            <button type="submit" disabled={inviteState === "checking"} className={primaryClass}>
              {inviteState === "checking" ? t.sending : t.inviteContinue}
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => setMode("email")} className={ghostClass}>
              {t.backToSignIn}
            </button>
            <Link href="/" className={ghostClass}>
              {t.joinWaitlist}
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
