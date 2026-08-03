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
import { useAppState } from "@/components/app/use-app-state";
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
import { rateForTargetAnnualNet } from "@/lib/tax/rate";
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
  const { state, hydrated } = useAppState();

  const guided =
    state.setup?.reserveMethod.mode === "guided-estimate"
      ? state.setup.reserveMethod
      : null;

  const profile = {
    meetsHoursCriterion: guided?.meetsHoursCriterion ?? false,
    isStarter: guided?.isStarter ?? false,
    otherIncome: fromCents(guided?.otherIncomeCents ?? asCentsUnsafe(0)),
    otherIncomeTaxWithheld: fromCents(
      guided?.otherIncomeTaxWithheldCents ?? asCentsUnsafe(0)
    ),
    projectedProfit: guided
      ? fromCents(
          asCentsUnsafe(
            guided.expectedAnnualRevenueExVatCents -
              guided.expectedDeductibleCostsExVatCents
          )
        )
      : 0,
  };

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
        <p className="max-w-2xl text-base leading-relaxed text-[var(--fl-slate)]">
          {t.rate.marketNote}
        </p>
      </header>

      <p className="max-w-2xl text-sm leading-relaxed text-[var(--fl-slate)]">
        {fill(t.rate.framing, { year: TAX_YEAR })}
      </p>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === "year" ? (
        <YearRateMode profile={profile} hydrated={hydrated} />
      ) : (
        <JobQuoteMode profile={profile} hydrated={hydrated} />
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-6">
        <h2 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
          {t.rate.flatRuleHeading}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
          {fill(t.rate.flatRuleBody, {
            revenue: formatEuro(HIGH_COST_CASE.revenue),
            costs: formatEuro(HIGH_COST_CASE.costs),
            oldReserve: formatEuro(HIGH_COST_CASE.oldReserve),
            realBill: formatEuroExact(HIGH_COST_CASE.realBill),
            profit: formatEuro(HIGH_EARNER_CASE.profit),
            shortfall: formatEuroExact(flatRuleError(HIGH_EARNER_CASE)),
          })}
        </p>
        <Link href="/accuracy#flat-rule" className={`${linkButtonClass} w-fit`}>
          {t.rate.flatRuleLink}
        </Link>
      </div>

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
// Mode 2: what should my rate be
// ---------------------------------------------------------------------------

const DEFAULT_TARGET_NET = 40_000;
const DEFAULT_BILLABLE_DAYS = 140;

/**
 * The hopeful figure freelancers price against: roughly a working year minus
 * holidays, and nothing else. Used only to show what assuming it costs.
 */
const OPTIMISTIC_DAYS = 220;

function YearRateMode({ profile, hydrated }: { profile: Profile; hydrated: boolean }) {
  const t = useT();
  const [targetNet, setTargetNet] = useState(DEFAULT_TARGET_NET);
  const [billableDays, setBillableDays] = useState(DEFAULT_BILLABLE_DAYS);
  const [costs, setCosts] = useState("");

  const costsCents = parseAmountInput(costs).cents ?? asCentsUnsafe(0);

  const shared = {
    taxYear: TAX_YEAR,
    country: DEFAULT_COUNTRY,
    targetAnnualNet: targetNet,
    annualBusinessCosts: fromCents(costsCents),
    meetsHoursCriterion: profile.meetsHoursCriterion,
    isStarter: profile.isStarter,
    otherIncome: profile.otherIncome,
    otherIncomeTaxWithheld: profile.otherIncomeTaxWithheld,
  };

  const result = rateForTargetAnnualNet({
    ...shared,
    billableUnitsPerYear: billableDays,
  });

  // The same year priced for a hopeful number of days, used to show what the
  // optimism costs. Skipped once the reader is already at or above it, so it
  // never nags someone who genuinely bills that much.
  const optimistic =
    billableDays < OPTIMISTIC_DAYS
      ? rateForTargetAnnualNet({ ...shared, billableUnitsPerYear: OPTIMISTIC_DAYS })
      : null;

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <Card className={cardClass}>
        <CardContent className="flex flex-col gap-7 p-6">
          <RangeField
            id="target-net"
            label={t.rate.targetLabel}
            hint={t.rate.targetHint}
            value={targetNet}
            onChange={setTargetNet}
            min={10_000}
            max={150_000}
            step={1_000}
            display={formatEuro(asCentsUnsafe(targetNet * 100))}
          />

          <RangeField
            id="billable-days"
            label={t.rate.daysLabel}
            hint={t.rate.daysHint}
            value={billableDays}
            onChange={setBillableDays}
            min={20}
            max={260}
            step={5}
            display={fill(t.rate.daysValue, { days: billableDays })}
          />

          <OptimismCost
            honestRevenue={result.requiredGrossRevenue}
            billableDays={billableDays}
            optimisticRate={optimistic?.requiredRatePerUnit ?? null}
          />

          <CurrencyField
            id="annual-costs"
            label={t.rate.costsLabel}
            hint={t.rate.costsHint}
            placeholder={t.rate.costsPlaceholder}
            leadingSymbol="€"
            value={costs}
            onChange={setCosts}
          />

          <ProfileNote profile={profile} hydrated={hydrated} />
        </CardContent>
      </Card>

      <div className="lg:sticky lg:top-24">
        <Card className={stageCardClass}>
          <CardContent className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-[var(--fl-slate)]">
                {t.rate.dayRate}
              </span>
              <AnimatedAmount
                cents={result.requiredRatePerUnit}
                className="font-serif text-4xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-5xl"
              />
              <span className={hintClass}>
                {fill(t.rate.dayRateNote, {
                  days: billableDays,
                  revenue: formatEuro(result.requiredGrossRevenue),
                })}
              </span>
            </div>

            <AllocationBar
              caption={t.rate.rateCaption}
              segments={[
                result.annualBusinessCosts > 0
                  ? {
                      label: "Business costs",
                      cents: result.annualBusinessCosts,
                      color: "var(--fl-costs-fill)",
                    }
                  : null,
                {
                  label: "Income tax and Zvw",
                  cents: result.totalTaxLiability,
                  color: "var(--fl-reserve-fill)",
                },
                {
                  label: "Yours",
                  cents: result.takeHome,
                  color: "var(--fl-payout-fill)",
                },
              ].filter((s): s is NonNullable<typeof s> => s !== null)}
            />

            <BreakdownList lines={result.breakdown} highlightId="rate-take-home" />

            <p className={hintClass}>
              {fill(t.rate.effectiveRate, {
                pct: (result.effectiveRate * 100).toFixed(1),
              })}
            </p>

            <Assumptions lines={result.assumptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
                        label: "Job costs",
                        cents: quote.jobCosts,
                        color: "var(--fl-costs-fill)",
                      }
                    : null,
                  {
                    label: "Income tax and Zvw",
                    cents: quote.additionalLiability,
                    color: "var(--fl-reserve-fill)",
                  },
                  {
                    label: "Yours",
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

/**
 * What planning for more days than you bill actually costs, in euros.
 *
 * Computed rather than written down. A fixed sentence would be wrong for anyone
 * who has claimed a deduction or moved either slider, and this is the number
 * the whole page turns on: underpricing is almost never a maths error, it is an
 * optimistic day count nobody ever revisits.
 */
function OptimismCost({
  honestRevenue,
  billableDays,
  optimisticRate,
}: {
  honestRevenue: Cents;
  billableDays: number;
  optimisticRate: Cents | null;
}) {
  const t = useT();
  if (optimisticRate === null) return null;

  const earned = asCentsUnsafe(optimisticRate * billableDays);
  const shortfall = asCentsUnsafe(honestRevenue - earned);
  if (shortfall <= 0) return null;
  const share = Math.round((shortfall / honestRevenue) * 100);

  return (
    <p className="-mt-3 rounded-lg border border-dashed border-[var(--fl-line)] p-3 text-xs leading-relaxed text-[var(--fl-slate)]">
      {fill(t.rate.optimism, {
        optimistic: OPTIMISTIC_DAYS,
        actual: billableDays,
        rate: formatEuro(optimisticRate),
        earned: formatEuro(earned),
        needed: formatEuro(honestRevenue),
        short: formatEuro(shortfall),
        pct: share,
      })}
    </p>
  );
}

function RangeField({
  id,
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  display,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label className={labelClass} htmlFor={id}>
          {label}
        </Label>
        <span className="fl-tnum shrink-0 font-serif text-xl font-medium text-[var(--fl-ink)]">
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full accent-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
      />
      <p className={hintClass}>{hint}</p>
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
