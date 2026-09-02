"use client";

import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { checkNotes } from "@/lib/frontdesk/checkNotes";
import { planSteps, type PlanPackage } from "@/lib/frontdesk/planSteps";

/**
 * The plan rail and the check notes (handoff §8.8, §12).
 *
 * Both read from the draft that is on screen. The rail says what was read,
 * matched, checked and written, and the notes say what "Passed every check"
 * covered for this particular draft. Neither states anything the derivation
 * could not establish: a draft with no number gets a step that says so, and
 * an inquiry with no date gets no date claim at all.
 */
export function PlanRail({
  locale,
  body,
  packages,
  eventType,
  eventDate,
}: {
  locale: FrontdeskLocale;
  body: string;
  packages: readonly PlanPackage[];
  /** Already translated for display; the rail does not map event types itself. */
  eventType: string;
  eventDate: string | null;
}) {
  const p = fdDict(locale).inbox.plan;
  const steps = planSteps({ body, packages, eventType, eventDate });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
        {p.heading}
      </span>
      <ol className="flex flex-col gap-2">
        {steps.map((step) => (
          <li key={step.key} className="flex gap-2 text-sm leading-relaxed">
            <span aria-hidden="true" className="pt-0.5 font-mono text-[11px] text-[var(--fd-slate)]">
              ✓
            </span>
            <span className="flex flex-col">
              <span className="text-[var(--fd-ink)]">{p.steps[step.key]}</span>
              <span className="text-xs text-[var(--fd-slate)]">
                {fill(p.details[step.detailKey], step.values)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The evidence behind "Passed every check", for this draft. */
export function CheckNotes({
  locale,
  body,
  eventDate,
}: {
  locale: FrontdeskLocale;
  body: string;
  eventDate: string | null;
}) {
  const c = fdDict(locale).inbox.checks;
  const notes = checkNotes(body, eventDate);

  return (
    <div role="status" className="flex flex-col gap-1">
      <span className="text-sm font-medium text-[var(--fd-ink)]">{c.passed}</span>
      <ul className="flex flex-col gap-0.5 text-xs leading-relaxed text-[var(--fd-slate)]">
        {notes.map((note) => (
          <li key={note.kind}>
            {note.kind === "price"
              ? c.notes.price.replace("{price}", note.amount)
              : note.kind === "date"
                ? c.notes.date.replace("{date}", note.date)
                : note.kind === "noPrice"
                  ? c.notes.noPrice
                  : c.notes.emDash}
          </li>
        ))}
      </ul>
    </div>
  );
}

function fill(template: string, values: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(values)) out = out.replace(`{${key}}`, value);
  return out;
}
