"use client";

import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * Setup as a queue of decisions, not a form march (handoff §5.2, §7).
 *
 * The rail names what is being decided and what is still open, and lets a
 * settled decision be reopened by clicking it. What it deliberately does not
 * say is "step 2 of 4": a count promises a fixed march through forms, and the
 * queue is the opposite claim — these are the questions the account, the
 * extraction and the defaults could not already answer.
 */
export type DecisionKey = "who" | "prices" | "voice" | "link";

export const DECISION_ORDER: readonly DecisionKey[] = ["who", "prices", "voice", "link"];

export function DecisionRail({
  locale,
  current,
  settled,
  onOpen,
}: {
  locale: FrontdeskLocale;
  current: DecisionKey;
  /** Decisions already made, in any order; only these can be reopened. */
  settled: readonly DecisionKey[];
  onOpen: (key: DecisionKey) => void;
}) {
  const t = fdDict(locale).setup.decisions;

  return (
    <nav aria-label={t.railLabel}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {DECISION_ORDER.map((key) => {
          const isCurrent = key === current;
          const isSettled = settled.includes(key) && !isCurrent;
          return (
            <li key={key} className="flex items-center gap-2">
              {isSettled ? (
                <button
                  type="button"
                  onClick={() => onOpen(key)}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]"
                >
                  {t.labels[key]}
                </button>
              ) : (
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                    isCurrent ? "text-[var(--fd-ink)]" : "text-[var(--fd-line-control)]"
                  }`}
                >
                  {t.labels[key]}
                </span>
              )}
              {key !== DECISION_ORDER[DECISION_ORDER.length - 1] && (
                <span aria-hidden="true" className="text-xs text-[var(--fd-line-control)]">
                  ·
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
