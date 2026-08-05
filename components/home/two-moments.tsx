"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JobQuoteFlow } from "@/components/rate/job-quote-flow";
import { PaymentSplit } from "@/components/home/payment-split";
import { useRateProfile } from "@/components/rate/use-rate-profile";
import { linkButtonClass } from "@/components/app/styles";
import { EXAMPLE_TAX_YEAR } from "@/lib/domain/exampleScenario";
import { useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

type Moment = "before" | "after";

const PANEL_ID = "moment-panel";
const TAB_ID: Record<Moment, string> = {
  before: "moment-tab-before",
  after: "moment-tab-after",
};

/**
 * Both moments, in one control.
 *
 * This replaces a row of two cards where only the left one was a working
 * calculator and the right was a doorway with bullet points. The asymmetry
 * read as two products sharing a stylesheet, which is exactly what the site
 * needed to stop looking like.
 *
 * One card, one tablist, two live calculators driven by the same engine. The
 * tabs are named after the visitor's situation rather than the feature, so the
 * difference between the two is legible before either is opened.
 *
 * Reads the saved profile. Writes nothing: `useRateProfile` is deliberately not
 * `useAppState`, which autosaves on mount.
 */
export function TwoMoments() {
  const t = useT();
  const m = t.home.moments;
  const [moment, setMoment] = useState<Moment>("before");
  const { profile, projectedProfit } = useRateProfile();

  const tabs: { id: Moment; label: string; sub: string }[] = [
    { id: "before", label: m.before.tab, sub: m.before.tabSub },
    { id: "after", label: m.after.tab, sub: m.after.tabSub },
  ];

  // Routes stay in the component, not the dictionary: a translator should never
  // be able to change where a link goes. Each link offers the thing this card
  // does not, so /tarief's own default tab (a day rate for the year) is the
  // right landing spot rather than a repeat of the job flow above it.
  const active =
    moment === "before"
      ? { ...m.before, href: "/tarief" }
      : { ...m.after, href: "/tool" };

  function onTablistKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const order: Moment[] = ["before", "after"];
    const next = order[(order.indexOf(moment) + step + order.length) % order.length];
    setMoment(next);
    document.getElementById(TAB_ID[next])?.focus();
  }

  return (
    <section
      id="start"
      aria-label={m.ariaLabel}
      className="scroll-mt-24 border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
    >
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {m.eyebrow}
          </span>
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {m.heading}
          </h2>
          <p className="mt-1 text-base leading-relaxed text-[var(--fl-slate)]">
            {fill(m.body, { year: EXAMPLE_TAX_YEAR })}
          </p>
        </div>

        {/* Arrow keys move between tabs and Tab leaves the set, per the ARIA
            tabs pattern. Without the roving tabindex a keyboard user has to
            step through every tab to reach the calculator inside the panel. */}
        <div
          role="tablist"
          aria-label={m.tablistLabel}
          onKeyDown={onTablistKeyDown}
          className="mt-8 flex flex-col gap-2 sm:flex-row"
        >
          {tabs.map((tab) => {
            const selected = moment === tab.id;
            return (
              <button
                key={tab.id}
                id={TAB_ID[tab.id]}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={PANEL_ID}
                tabIndex={selected ? 0 : -1}
                onClick={() => setMoment(tab.id)}
                className={`flex min-h-14 flex-1 flex-col items-start justify-center gap-0.5 rounded-xl border px-4 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
                  selected
                    ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                    : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                <span
                  className={`text-xs ${selected ? "text-white/70" : "text-[var(--fl-slate)]"}`}
                >
                  {tab.sub}
                </span>
              </button>
            );
          })}
        </div>

        <div
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={TAB_ID[moment]}
          tabIndex={-1}
          className="mt-6 rounded-2xl border border-[var(--fl-line)] bg-white p-5 shadow-sm sm:p-7"
        >
          {moment === "before" ? (
            <JobQuoteFlow
              profile={profile}
              knownProjectedProfit={projectedProfit}
              startAtResult
            />
          ) : (
            <PaymentSplit />
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Link href={active.href} className={`${linkButtonClass} w-fit`}>
            {active.deepLink}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          {/* The two tabs report different percentages for the same person, and
              that looks like a bug until you know why. Answering it here turns
              the most obvious objection into the clearest evidence that this is
              a real engine and not a flat rate with extra steps. */}
          <details className="group rounded-xl border border-[var(--fl-line)] bg-white px-4 py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-[var(--fl-ink)] marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
              {m.whyDifferent.toggle}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fl-slate)]">
              {m.whyDifferent.body}
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
