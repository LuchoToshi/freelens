"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyField } from "@/components/app/fields";
import { AllocationBar } from "@/components/app/allocation-bar";
import { AnimatedAmount } from "@/components/design/animated-amount";
import { DisclaimerNote } from "@/components/disclaimer-note";
import { useRateProfile } from "@/components/rate/use-rate-profile";
import { GuidedRateCalculator } from "@/components/rate/guided-rate-calculator";
import {
  cardClass,
  hintClass,
  labelClass,
  linkButtonClass,
} from "@/components/app/styles";
import {
  asCentsUnsafe,
  formatEuro,
  formatEuroExact,
  fromCents,
  parseAmountInput,
  type Cents,
} from "@/lib/domain/money";
import {
  flatRuleError,
  HIGH_COST_CASE,
  HIGH_EARNER_CASE,
} from "@/lib/tax/flatRuleEvidence";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
import { quoteForTargetNet } from "@/lib/tax/quote";
import type { BreakdownLine } from "@/lib/tax/types";
import { useDocumentTitle, useLocale, useT } from "@/components/i18n/locale-provider";
import {
  translateAssumption,
  translateBreakdownExplanation,
  translateBreakdownLabel,
} from "@/lib/i18n/engineText";
import { fill } from "@/lib/i18n";

const TAX_YEAR = latestProfileYear(DEFAULT_COUNTRY) ?? 0;

const stageCardClass =
  "rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] shadow-sm";


type Mode = "year" | "job";

/**
 * The moment before the job.
 *
 * Two questions, one engine, run backwards. Mode 2 (what should my rate be) is
 * the default because it is the broader question and the more common way in.
 * Mode 1 (what do I quote for this job) is the same solve applied to a single
 * piece of work on top of a year already running.
 *
 * Everything the profile already knows is read, never asked again. Nothing on
 * this page writes to the profile: a freelancer exploring rates is not changing
 * their tax settings.
 */
export function TariefView() {
  const t = useT();
  useDocumentTitle(t.meta.tarief.title, t.meta.tarief.description);
  const [mode, setMode] = useState<Mode>("year");
  // Read only. This page explores rates; it never edits the saved profile.
  const { profile: saved, projectedProfit, hydrated } = useRateProfile();
  const profile = { ...saved, projectedProfit };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {t.rate.eyebrow}
        </span>
        <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-[var(--fl-ink)] sm:text-5xl">
          {t.rate.heading}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
          {t.rate.floor}
        </p>
      </header>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === "year" ? (
        <div className="rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-7">
          <GuidedRateCalculator profile={profile} />
        </div>
      ) : (
        <JobQuoteMode profile={profile} hydrated={hydrated} />
      )}

      {/* Why this calculator can exist at all. Below the tool, not above it:
          the reader came to price something, not to read an argument. */}
      <details className="rounded-2xl border border-[var(--fl-line)] bg-white p-6">
        <summary className="inline-flex min-h-9 cursor-pointer list-none items-center font-serif text-lg font-medium text-[var(--fl-ink)]">
          {t.rate.flatRuleHeading}
        </summary>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--fl-slate)]">
          {fill(t.rate.flatRuleBody, {
            revenue: formatEuro(HIGH_COST_CASE.revenue),
            costs: formatEuro(HIGH_COST_CASE.costs),
            oldReserve: formatEuro(HIGH_COST_CASE.oldReserve),
            realBill: formatEuroExact(HIGH_COST_CASE.realBill),
            profit: formatEuro(HIGH_EARNER_CASE.profit),
            shortfall: formatEuroExact(flatRuleError(HIGH_EARNER_CASE)),
          })}
        </p>
        <Link
          href="/accuracy#flat-rule"
          className={`${linkButtonClass} mt-3 w-fit`}
        >
          {t.rate.flatRuleLink}
        </Link>
      </details>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] px-6 py-5">
        <span className="text-sm text-[var(--fl-slate)]">
          {t.rate.bothDirections}
        </span>
        <Link
          href="/tool"
          className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          {t.rate.toToolCta}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      <DisclaimerNote />
    </div>
  );
}

interface Profile {
  meetsHoursCriterion: boolean;
  isStarter: boolean;
  otherIncome: number;
  otherIncomeTaxWithheld: number;
  projectedProfit: number;
}

// ---------------------------------------------------------------------------
// Mode 1: what do I quote for this job
// ---------------------------------------------------------------------------

const VAT_CHOICES = [21, 9, 0];

function JobQuoteMode({ profile, hydrated }: { profile: Profile; hydrated: boolean }) {
  const t = useT();
  const [keep, setKeep] = useState("2000");
  const [jobCosts, setJobCosts] = useState("");
  const [projectedProfit, setProjectedProfit] = useState(
    profile.projectedProfit > 0 ? String(profile.projectedProfit) : ""
  );
  const [vatRate, setVatRate] = useState(21);

  // The profile only lands after hydration, so a stored projection prefills the
  // field the moment it arrives without overwriting anything already typed.
  const effectiveProfit =
    projectedProfit.trim() === "" && profile.projectedProfit > 0
      ? String(profile.projectedProfit)
      : projectedProfit;

  const keepCents = parseAmountInput(keep).cents;
  const profitCents = parseAmountInput(effectiveProfit, { allowNegative: true }).cents;
  const jobCostsCents = parseAmountInput(jobCosts).cents ?? asCentsUnsafe(0);

  const quote =
    keepCents !== null && keepCents > 0 && profitCents !== null
      ? quoteForTargetNet({
          taxYear: TAX_YEAR,
          country: DEFAULT_COUNTRY,
          targetNet: fromCents(keepCents),
          jobCosts: fromCents(jobCostsCents),
          currentProjectedProfit: fromCents(profitCents),
          vatRate,
          meetsHoursCriterion: profile.meetsHoursCriterion,
          isStarter: profile.isStarter,
          otherIncome: profile.otherIncome,
          otherIncomeTaxWithheld: profile.otherIncomeTaxWithheld,
        })
      : null;

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <Card className={cardClass}>
        <CardContent className="flex flex-col gap-5 p-6">
          <CurrencyField
            id="job-keep"
            label={t.rate.keepLabel}
            placeholder={t.rate.keepPlaceholder}
            leadingSymbol="€"
            size="lg"
            value={keep}
            onChange={setKeep}
          />

          <CurrencyField
            id="job-costs"
            label={t.rate.jobCostsLabel}
            hint={t.rate.jobCostsHint}
            placeholder={t.rate.jobCostsPlaceholder}
            leadingSymbol="€"
            value={jobCosts}
            onChange={setJobCosts}
          />

          <CurrencyField
            id="job-projected-profit"
            label={t.rate.projectedLabel}
            hint={t.rate.projectedHint}
            placeholder={t.rate.projectedPlaceholder}
            leadingSymbol="€"
            value={effectiveProfit}
            onChange={setProjectedProfit}
          />

          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>{t.rate.vatLabel}</Label>
            <div className="flex gap-2" role="group" aria-label={t.rate.vatGroupLabel}>
              {VAT_CHOICES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  aria-pressed={vatRate === rate}
                  onClick={() => setVatRate(rate)}
                  className={`min-h-11 rounded-lg border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
                    vatRate === rate
                      ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                      : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)]"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <p className={hintClass}>
              {t.rate.vatNote}
            </p>
          </div>

          <ProfileNote profile={profile} hydrated={hydrated} />
        </CardContent>
      </Card>

      <div className="lg:sticky lg:top-24">
        {quote ? (
          <Card className={stageCardClass}>
            <CardContent className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--fl-slate)]">
                  {t.rate.quote}
                </span>
                <AnimatedAmount
                  cents={quote.quoteExVat}
                  className="font-serif text-4xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-5xl"
                />
                {vatRate > 0 && (
                  <span className={hintClass}>
                    {fill(t.rate.quoteInvoice, {
                      gross: formatEuro(quote.quoteInclVat),
                      vat: formatEuro(quote.vat),
                    })}
                  </span>
                )}
              </div>

              <AllocationBar
                caption={t.rate.quoteCaption}
                segments={[
                  quote.jobCosts > 0
                    ? {
                        label: t.rate.segments.jobCosts,
                        cents: quote.jobCosts,
                        color: "var(--fl-costs-fill)",
                      }
                    : null,
                  {
                    label: t.rate.segments.tax,
                    cents: quote.additionalLiability,
                    color: "var(--fl-reserve-fill)",
                  },
                  {
                    label: t.rate.segments.yours,
                    cents: quote.takeHome,
                    color: "var(--fl-payout-fill)",
                  },
                ].filter((s): s is NonNullable<typeof s> => s !== null)}
              />

              {quote.bracketCrossing && (
                <BracketCrossingNote
                  threshold={quote.bracketCrossing.threshold}
                  amountAbove={quote.bracketCrossing.amountAbove}
                  jobRate={quote.effectiveJobRate}
                />
              )}

              <BreakdownList lines={quote.breakdown} highlightId="quote-take-home" />

              <Assumptions lines={quote.assumptions} />
            </CardContent>
          </Card>
        ) : (
          <Card className={stageCardClass}>
            <CardContent className="flex flex-col gap-2 p-6">
              <p className="text-sm text-[var(--fl-slate)]">
                {t.rate.emptyTitle}
              </p>
              <p className={hintClass}>
                {t.rate.emptyBody}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * The line no flat-percentage calculator can produce.
 *
 * Deliberately phrased around the threshold and the amount, not around the
 * bracket percentage: the statutory rate is levied on taxable income, and
 * printing it beside a job figure would overstate what those euros cost. The
 * honest per-job number is the blended rate, which is what is shown.
 */
function BracketCrossingNote({
  threshold,
  amountAbove,
  jobRate,
}: {
  threshold: number;
  amountAbove: Cents;
  jobRate: number;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-[var(--fl-line)] bg-white p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
        {t.rate.crossing.title}
      </span>
      <p className="text-sm leading-relaxed text-[var(--fl-ink)]">
        {fill(t.rate.crossing.body, {
          threshold: threshold.toLocaleString("nl-NL"),
          amount: formatEuro(amountAbove),
          pct: (jobRate * 100).toFixed(1),
        })}
      </p>
      <p className={hintClass}>
        {t.rate.crossing.note}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const t = useT();
  const tabs: { id: Mode; label: string; sub: string }[] = [
    { id: "year", ...t.rate.tabs.year },
    { id: "job", ...t.rate.tabs.job },
  ];
  return (
    <div role="tablist" aria-label={t.rate.tabsLabel} className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={mode === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex min-h-14 flex-1 flex-col items-start justify-center gap-0.5 rounded-xl border px-4 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
            mode === tab.id
              ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
              : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
          }`}
        >
          <span className="text-sm font-medium">{tab.label}</span>
          <span
            className={`text-xs ${mode === tab.id ? "text-white/70" : "text-[var(--fl-slate)]"}`}
          >
            {tab.sub}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Same shape as "Why this number?" in the tool, driven by the engine's lines. */
function BreakdownList({
  lines,
  highlightId,
}: {
  lines: BreakdownLine[];
  highlightId: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  return (
    <details className="border-t border-[var(--fl-line)] pt-4">
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
        {t.rate.whyThisNumber}
      </summary>
      <dl className="mt-4 flex flex-col gap-3">
        {lines.map((line) => (
          <div key={line.id} className="flex flex-col gap-0.5">
            <div
              className={`flex items-baseline justify-between gap-4 text-sm ${
                line.id === highlightId ? "font-semibold" : ""
              }`}
            >
              <dt className="text-[var(--fl-ink)]">
                {translateBreakdownLabel(locale, line.id, line.label)}
              </dt>
              <dd className="fl-tnum shrink-0 font-mono tabular-nums text-[var(--fl-ink)]">
                {formatEuroExact(line.amount)}
              </dd>
            </div>
            <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
              {translateBreakdownExplanation(locale, line.id, line.explanation)}
            </p>
          </div>
        ))}
      </dl>
    </details>
  );
}

function Assumptions({ lines }: { lines: string[] }) {
  const t = useT();
  const { locale } = useLocale();
  return (
    <details className="border-t border-[var(--fl-line)] pt-4">
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
        {fill(t.rate.assumptionsToggle, { count: lines.length })}
      </summary>
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-5">
        {lines.map((line, i) => (
          <li key={i} className="text-xs leading-relaxed text-[var(--fl-slate)]">
            {translateAssumption(locale, line)}
          </li>
        ))}
      </ul>
    </details>
  );
}

/** What was read from the saved profile, and where to change it. */
function ProfileNote({ profile, hydrated }: { profile: Profile; hydrated: boolean }) {
  const t = useT();
  if (!hydrated) return null;

  const claimed: string[] = [];
  if (profile.meetsHoursCriterion) claimed.push(t.rate.profileHours);
  if (profile.isStarter) claimed.push(t.rate.profileStarter);
  if (profile.otherIncome > 0) claimed.push(t.rate.profileSalary);

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-dashed border-[var(--fl-line)] p-3">
      <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
        {claimed.length > 0
          ? fill(t.rate.profileUsing, { claimed: claimed.join(", ") })
          : t.rate.profileNone}
      </p>
      <Link href="/tool" className={`${linkButtonClass} w-fit text-xs`}>
        {t.rate.changeDetails}
      </Link>
    </div>
  );
}
