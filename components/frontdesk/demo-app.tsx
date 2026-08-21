"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { resolveInitialLocale } from "@/components/i18n/locale-provider";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { track } from "@/lib/analytics";

/**
 * The public, no-auth demo (spec §3). One fixture inquiry, one live draft
 * generation, editable in place. Nothing here is persisted: the inquiry is
 * hardcoded copy, the draft comes back from `/api/frontdesk/demo/draft`
 * (which writes to no table), and edits live in component state only.
 */
type DraftState = "landing" | "loading" | "ready" | "pending";

const primaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-5 text-base font-medium text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50";
const secondaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--fd-line-control)] bg-white px-5 text-base font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]";

export function DemoApp() {
  const [locale, setLocale] = useState<FrontdeskLocale>("en");
  const [state, setState] = useState<DraftState>("landing");
  const [draft, setDraft] = useState("");
  const [edited, setEdited] = useState(false);

  const dict = fdDict(locale);
  const t = dict.demo;
  const sample = dict.sample;

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLocale(resolveInitialLocale(null, window.navigator?.language ?? ""));
    /* eslint-enable react-hooks/set-state-in-effect */
    track("demo_viewed");
  }, []);

  async function generate() {
    setState("loading");
    const ok = await fetch("/api/frontdesk/demo/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    })
      .then((r) => r.json() as Promise<{ ok: boolean; body?: string }>)
      .catch(() => ({ ok: false as const }));

    if (ok.ok && ok.body) {
      setDraft(ok.body);
      setEdited(false);
      setState("ready");
      track("demo_draft_generated");
    } else {
      setState("pending");
      track("demo_draft_generation_failed");
    }
  }

  function onEditDraft(value: string) {
    setDraft(value);
    if (!edited) {
      setEdited(true);
      track("demo_draft_edited");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-3 rounded-2xl bg-[var(--fd-accent)]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-[var(--fd-ink)]">{t.bannerText}</p>
        <Link
          href="/inbox?ref=demo"
          onClick={() => track("demo_cta_clicked_banner")}
          className={`${secondaryClass} w-fit shrink-0`}
        >
          {t.bannerCta}
        </Link>
      </div>

      <div className="flex flex-col gap-1 rounded-2xl border border-[var(--fd-line)] bg-white p-4">
        <span className="text-sm font-semibold text-[var(--fd-ink)]">{sample.clientName}</span>
        <span className="text-xs text-[var(--fd-slate)]">{dict.public.form.types.wedding}</span>
        <p className="mt-1 text-sm leading-relaxed text-[var(--fd-slate)]">{sample.message}</p>
      </div>

      {state === "landing" && (
        <button type="button" onClick={generate} className={`${primaryClass} w-fit`}>
          {t.viewDraft}
        </button>
      )}

      {state === "loading" && (
        <p className="text-sm text-[var(--fd-slate)]">{dict.auth.loading}</p>
      )}

      {(state === "ready" || state === "pending") && (
        <div className="flex flex-col gap-3">
          {state === "ready" ? (
            <>
              <textarea
                aria-label={t.viewDraft}
                rows={10}
                value={draft}
                onChange={(e) => onEditDraft(e.target.value)}
                className="min-h-56 w-full rounded-2xl border border-[var(--fd-line-control)] bg-white px-4 py-3 text-sm leading-relaxed focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none"
              />
              <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.editHint}</p>
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-[var(--fd-line)] p-4">
                <p className="text-sm leading-relaxed text-[var(--fd-ink)]">{t.inlineCta}</p>
                <Link
                  href="/inbox?ref=demo"
                  onClick={() => track("demo_cta_clicked_inline")}
                  className={`${primaryClass} w-fit`}
                >
                  {t.inlineCtaLink}
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--fd-line)] p-5">
              <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.pending}</p>
              <button type="button" onClick={generate} className={`${secondaryClass} w-fit`}>
                {t.retry}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
