"use client";

import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { CheckNotes } from "@/components/frontdesk/plan-rail";

/**
 * The deterministic checks, rendered (handoff §13 `GuardPanel`). Extracted
 * verbatim from the inbox detail pane so `/inbox` and the `/home` decision
 * panel state the same verdict in the same words.
 *
 * Kept visually separate from the draft body on purpose (handoff §8): guard
 * copy must never sit inside or directly against the email text, or a reader
 * mistakes validation language for something the client will receive.
 */
export type DraftValidationStatus = "pending" | "ready_for_review" | "needs_review" | "failed";

type ValidationDict = { validation: { reasons: Record<string, string> } };

/**
 * Plain-language line for a stored failure code (§10.7). Codes may carry a
 * suffix (price-not-in-packages:1950); the prefix picks the copy, and an
 * unknown code falls back to the raw code, which is still text-first.
 */
export function validationReason(code: string, d: ValidationDict): string {
  const base = code.split(":")[0];
  const key = base.startsWith("reply-length") || base.startsWith("nudge-length") ? "length" : base;
  return d.validation.reasons[key] ?? code;
}

/** The needs_review notice and the passed line; the failed block is its own component. */
export function GuardPanel({
  locale,
  status,
  failures,
  body,
  eventDate,
}: {
  locale: FrontdeskLocale;
  status: DraftValidationStatus | null | undefined;
  failures: readonly string[] | null | undefined;
  /**
   * The draft as shown. With it, the passed verdict lists what was actually
   * checked in this draft; without it, the panel falls back to naming the
   * checks that ran, which is the most it can honestly say.
   */
  body?: string;
  eventDate?: string | null;
}) {
  const d = fdDict(locale).inbox.detail;
  const codes = failures ?? [];

  if (status === "needs_review" && codes.length > 0) {
    return (
      <div
        role="status"
        className="rounded-xl border border-[var(--fd-line)] bg-[var(--fd-paper)] px-4 py-3 text-sm leading-relaxed text-[var(--fd-slate)]"
      >
        <p className="font-medium text-[var(--fd-ink)]">{d.validation.needsReview}</p>
        <ul className="list-disc pl-5">
          {codes.map((code) => (
            <li key={code}>{validationReason(code, d)}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (status === "ready_for_review") {
    if (body) return <CheckNotes locale={locale} body={body} eventDate={eventDate ?? null} />;
    return (
      <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{d.validation.checksPassed}</p>
    );
  }

  return null;
}

/** The failed verdict: named checks, never an editable draft (§10.7). */
export function GuardFailedPanel({
  locale,
  failures,
  children,
}: {
  locale: FrontdeskLocale;
  failures: readonly string[] | null | undefined;
  /** Recovery affordances (progress, regenerate) supplied by the caller. */
  children?: React.ReactNode;
}) {
  const d = fdDict(locale).inbox.detail;
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-[var(--fd-error-text)]/40 bg-white p-5"
    >
      <span className="text-sm font-semibold text-[var(--fd-ink)]">
        {d.validation.failedHeading}
      </span>
      <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{d.validation.failedIntro}</p>
      <ul className="list-disc pl-5 text-sm leading-relaxed text-[var(--fd-slate)]">
        {(failures ?? []).map((code) => (
          <li key={code}>{validationReason(code, d)}</li>
        ))}
      </ul>
      {children}
    </div>
  );
}
