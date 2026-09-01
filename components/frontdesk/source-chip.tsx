"use client";

import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * The four provenance words of the agent experience, plus the inquiry source
 * (handoff §7): Yours, Suggested, Learned, Missing, From the inquiry. Text
 * plus a monospace glyph, never colour alone, so the label survives
 * greyscale and screen readers.
 */
export type SourceKind = "yours" | "suggested" | "learned" | "missing" | "inquiry";

const GLYPH: Record<SourceKind, string> = {
  yours: "✎",
  suggested: "≈",
  learned: "↺",
  missing: "∅",
  inquiry: "❝",
};

export function SourceChip({
  locale,
  kind,
  detail,
}: {
  locale: FrontdeskLocale;
  kind: SourceKind;
  /** Optional trailing note, e.g. a confidence percentage. */
  detail?: string;
}) {
  const s = fdDict(locale).inbox.sources;
  return (
    <span
      aria-label={s.aria.replace("{kind}", s.kinds[kind])}
      className="inline-flex items-center gap-1 rounded-md border border-[var(--fd-line)] bg-[var(--fd-paper)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--fd-slate)]"
    >
      <span aria-hidden="true" className="font-mono">
        {GLYPH[kind]}
      </span>
      {s.kinds[kind]}
      {detail ? ` · ${detail}` : ""}
    </span>
  );
}
