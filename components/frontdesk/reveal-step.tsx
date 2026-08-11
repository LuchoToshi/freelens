"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
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
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white transition hover:bg-[var(--fl-ink-hover)] disabled:pointer-events-none disabled:opacity-50";
const secondaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--fl-line-control)] bg-white px-6 text-base font-medium text-[var(--fl-ink)] transition hover:border-[var(--fl-ink)]";

export function RevealStep({
  locale,
  session,
  regenerate,
  onContinue,
  onAdjust,
}: {
  locale: FrontdeskLocale;
  session: Session;
  /** True when returning after a voice edit: the draft is re-made first. */
  regenerate: boolean;
  onContinue: () => void;
  onAdjust: () => void;
}) {
  const t = fdDict(locale).setup.reveal;
  const dict = fdDict(locale);
  const [state, setState] = useState<"loading" | "ready" | "pending">("loading");
  const [payload, setPayload] = useState<SamplePayload | null>(null);
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
        <h1 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">{t.heading}</h1>
        <p className="text-sm text-[var(--fl-slate)]">{dict.setup.voice.extracting}</p>
      </section>
    );
  }

  const inquiry = payload?.inquiry;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">{t.heading}</h1>
        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{t.sub}</p>
      </div>

      {inquiry && (
        <div className="flex flex-col gap-1 rounded-2xl border border-[var(--fl-line)] bg-white p-4">
          <span className="text-sm font-semibold text-[var(--fl-ink)]">
            {inquiry.client_name}
          </span>
          <span className="text-xs text-[var(--fl-slate)]">
            {dict.public.form.types[inquiry.event_type as keyof typeof dict.public.form.types]}
            {inquiry.event_date ? ` · ${inquiry.event_date}` : ""} · {inquiry.budget_band}
          </span>
          {inquiry.message && (
            <p className="mt-1 text-sm leading-relaxed text-[var(--fl-slate)]">
              {inquiry.message}
            </p>
          )}
        </div>
      )}

      {state === "ready" && payload?.draft ? (
        <div className="whitespace-pre-line rounded-2xl border border-[var(--fl-ink)] bg-white p-5 text-sm leading-relaxed text-[var(--fl-ink)]">
          {payload.draft.body}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--fl-line)] p-5">
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{t.pending}</p>
          <button type="button" onClick={retry} className={`${secondaryClass} w-fit`}>
            {t.retry}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onContinue} className={primaryClass}>
          {t.primary}
        </button>
        <button type="button" onClick={onAdjust} className={secondaryClass}>
          {t.secondary}
        </button>
      </div>
    </section>
  );
}
