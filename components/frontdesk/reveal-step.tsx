"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";
import { arrive, arriveGroup } from "@/components/design/motion";
import { TrustNote } from "@/components/frontdesk/trust-note";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * Step 3.5: the payoff. Right after the voice mirror, the freelancer sees a
 * draft for a canned sample inquiry written with their REAL profile and REAL
 * prices — the moment the product stops being a form and starts being them.
 *
 * The draft comes from the production pipeline via the sample route; if the
 * guards keep rejecting, this shows the pending state and never a canned
 * fake. Returning here after adjusting the voice regenerates the draft so
 * the edit is visibly cause and effect.
 */
interface SamplePayload {
  ok: boolean;
  inquiry?: {
    id: string;
    client_name: string;
    event_type: string;
    event_date: string | null;
    budget_band: string;
    message: string | null;
  };
  draft?: { body: string } | null;
}

const primaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-6 text-base font-medium text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50";
const secondaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--fd-line-control)] bg-white px-6 text-base font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]";

export function RevealStep({
  locale,
  session,
  regenerate,
  onContinue,
  onAdjust,
  onBack,
}: {
  locale: FrontdeskLocale;
  session: Session;
  /** True when returning after a voice edit: the draft is re-made first. */
  regenerate: boolean;
  onContinue: () => void;
  onAdjust: () => void;
  /** Back to the decision before this one; every step can be reconsidered. */
  onBack?: () => void;
}) {
  const t = fdDict(locale).setup.reveal;
  const dict = fdDict(locale);
  const reduce = useReducedMotion();
  const [state, setState] = useState<"loading" | "ready" | "pending">("loading");
  const [payload, setPayload] = useState<SamplePayload | null>(null);
  const [copied, setCopied] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void (async () => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
      const fetchSample = async (): Promise<SamplePayload | null> =>
        fetch("/api/frontdesk/sample", { method: "POST", headers })
          .then((r) => r.json() as Promise<SamplePayload>)
          .catch(() => null);

      let sample = await fetchSample();
      if (regenerate && sample?.inquiry) {
        await fetch("/api/frontdesk/drafts/regenerate", {
          method: "POST",
          headers,
          body: JSON.stringify({ inquiryId: sample.inquiry.id }),
        }).catch(() => null);
        sample = await fetchSample();
      }
      setPayload(sample);
      setState(sample?.ok && sample.draft ? "ready" : "pending");
    })();
  }, [regenerate, session.access_token]);

  async function retry() {
    setState("loading");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
    if (payload?.inquiry) {
      await fetch("/api/frontdesk/drafts/regenerate", {
        method: "POST",
        headers,
        body: JSON.stringify({ inquiryId: payload.inquiry.id }),
      }).catch(() => null);
    }
    const sample = await fetch("/api/frontdesk/sample", { method: "POST", headers })
      .then((r) => r.json() as Promise<SamplePayload>)
      .catch(() => null);
    setPayload(sample);
    setState(sample?.ok && sample.draft ? "ready" : "pending");
  }

  if (state === "loading") {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">{t.heading}</h1>
        <p className="text-sm text-[var(--fd-slate)]">{dict.setup.voice.extracting}</p>
      </section>
    );
  }

  const inquiry = payload?.inquiry;

  async function copyDraft(body: string) {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // The wizard's payoff moment: inquiry first, then the draft settles in, then
  // the actions. Same arrive grammar as the core app; reduced motion collapses
  // it to instant opacity via the helpers, and the draft text itself is in the
  // DOM from the first frame either way.
  return (
    <motion.section
      className="flex flex-col gap-5"
      variants={arriveGroup(reduce)}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={arrive(reduce)} className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">{t.heading}</h1>
        <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.sub}</p>
      </motion.div>

      {inquiry && (
        <motion.div
          variants={arrive(reduce)}
          className="flex flex-col gap-1 rounded-2xl border border-[var(--fd-line)] bg-white p-4"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
            {t.inquiryLabel}
          </span>
          <span className="text-sm font-semibold text-[var(--fd-ink)]">
            {inquiry.client_name}
          </span>
          <span className="text-xs text-[var(--fd-slate)]">
            {dict.public.form.types[inquiry.event_type as keyof typeof dict.public.form.types]}
            {inquiry.event_date ? ` · ${inquiry.event_date}` : ""} · {inquiry.budget_band}
          </span>
          {inquiry.message && (
            <p className="mt-1 break-words text-sm leading-relaxed text-[var(--fd-slate)]">
              {inquiry.message}
            </p>
          )}
        </motion.div>
      )}

      {state === "ready" && payload?.draft ? (
        <motion.div variants={arrive(reduce)} className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
            {t.draftLabel}
          </span>
          <div className="whitespace-pre-line rounded-2xl border border-[var(--fd-ink)] bg-white p-5 text-sm leading-relaxed text-[var(--fd-ink)]">
            {payload.draft.body}
          </div>
          <button
            type="button"
            onClick={() => void copyDraft(payload.draft!.body)}
            className={`${secondaryClass} w-fit`}
          >
            {copied ? t.copied : t.copy}
          </button>
          <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.everyOne}</p>
        </motion.div>
      ) : (
        <motion.div
          variants={arrive(reduce)}
          className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--fd-line)] p-5"
        >
          <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.pending}</p>
          <button type="button" onClick={retry} className={`${secondaryClass} w-fit`}>
            {t.retry}
          </button>
        </motion.div>
      )}

      <motion.div variants={arrive(reduce)}>
        <TrustNote>{t.trust}</TrustNote>
      </motion.div>

      <motion.div variants={arrive(reduce)} className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--fd-ink)]">{t.question}</span>
        <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onContinue} className={primaryClass}>
          {t.primary}
        </button>
        <button type="button" onClick={onAdjust} className={secondaryClass}>
          {t.secondary}
        </button>
        {onBack && (
          <button type="button" onClick={onBack} className={secondaryClass}>
            {dict.setup.back}
          </button>
        )}
        </div>
      </motion.div>
    </motion.section>
  );
}
