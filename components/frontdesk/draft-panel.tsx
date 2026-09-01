"use client";

import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * The draft exactly as it will send (handoff §6): the same string the mailto
 * and the clipboard carry, rendered read-only. Editing happens in the full
 * editor at /inbox, never here — this pane exists so the freelancer can
 * decide, and a decision needs the real text, not a summary of it.
 *
 * `whitespace-pre-line` and `break-words` keep the body verbatim while
 * surviving a pasted URL; no transformation is applied to the string itself.
 */
export function DraftPanel({
  locale,
  kind,
  body,
}: {
  locale: FrontdeskLocale;
  kind: "reply" | "nudge";
  body: string;
}) {
  const d = fdDict(locale).inbox.detail;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
        {kind === "nudge" ? d.draftNudge : d.draftReply}
      </span>
      <div className="rounded-2xl border border-[var(--fd-line)] bg-white px-4 py-3 text-sm leading-relaxed whitespace-pre-line break-words text-[var(--fd-ink)]">
        {body}
      </div>
    </div>
  );
}
