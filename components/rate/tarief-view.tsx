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
          Before the job
        </span>
        <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-[var(--fl-ink)] sm:text-5xl">
          What do you need to charge?
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
          This is what you need to charge, not what you can charge. It is your
          floor: below it the work does not pay for itself once tax and costs
          are out.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--fl-slate)]">
          What the market will pay is a different question. Freelens has no view
          on it, and will never pretend to.
        </p>
      </header>

      <p className="max-w-2xl text-sm leading-relaxed text-[var(--fl-slate)]">
        Most rate calculators apply one flat percentage. Freelens runs the real{" "}
        {TAX_YEAR} brackets, deductions and credits, which is why the answer
        changes depending on where you already are in your year.
      </p>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === "year" ? (
        <YearRateMode profile={profile} hydrated={hydrated} />
      ) : (
        <JobQuoteMode profile={profile} hydrated={hydrated} />
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-6">
        <h2 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
          Most rate calculators get this wrong
        </h2>
        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
          A flat percentage is wrong in both directions at once. On{" "}
          {formatEuro(HIGH_COST_CASE.revenue)} of revenue with{" "}
          {formatEuro(HIGH_COST_CASE.costs)} of costs, the 30% rule sets aside{" "}
          {formatEuro(HIGH_COST_CASE.oldReserve)} against a real bill of{" "}
          {formatEuroExact(HIGH_COST_CASE.realBill)}. At{" "}
          {formatEuro(HIGH_EARNER_CASE.profit)} of profit the same rule leaves
          you {formatEuroExact(flatRuleError(HIGH_EARNER_CASE))} short. Freelens
          used to apply that rule. Replacing it is the reason this page can
          exist.
        </p>
        <Link href="/accuracy" className={`${linkButtonClass} w-fit`}>
          What Freelens is honest about
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] px-6 py-5">
        <span className="text-sm text-[var(--fl-slate)]">
          Before the job: what do I need to charge. After the payment: what is
          actually mine. Same calculation, both directions.
        </span>
        <Link
          href="/tool"
          className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          See what is actually yours
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
            label="What do you want to earn, after tax?"
            hint="Your take-home for the year, once income tax and Zvw are paid. Not your revenue."
            value={targetNet}
            onChange={setTargetNet}
            min={10_000}
            max={150_000}
            step={1_000}
            display={formatEuro(asCentsUnsafe(targetNet * 100))}
          />

          <RangeField
            id="billable-days"
            label="How many days can you realistically bill?"
            hint="Not 260. Take out holidays, sick days, admin, chasing work and the quiet weeks. Most freelancers bill far fewer days than they plan for, and the rate is what pays for the gap."
            value={billableDays}
            onChange={setBillableDays}
            min={20}
            max={260}
            step={5}
            display={`${billableDays} days`}
          />

          <OptimismCost
            honestRevenue={result.requiredGrossRevenue}
            billableDays={billableDays}
            optimisticRate={optimistic?.requiredRatePerUnit ?? null}
          />

          <CurrencyField
            id="annual-costs"
            label="Your yearly business costs"
            hint="Software, insurance, gear, workspace, your accountant, professional memberships. Leave blank if you genuinely have none."
            placeholder="e.g. 6000"
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
                Your day rate, excluding btw
              </span>
              <AnimatedAmount
                cents={result.requiredRatePerUnit}
                className="font-serif text-4xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-5xl"
              />
              <span className={hintClass}>
                {billableDays} billable days at this rate is{" "}
                {formatEuro(result.requiredGrossRevenue)} of revenue for the
                year.
              </span>
            </div>

            <AllocationBar
              caption="Where every euro of your rate goes"
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
              Across the whole year that works out at{" "}
              <strong>{(result.effectiveRate * 100).toFixed(1)}%</strong> in
              income tax and Zvw. Not a flat rate: it is what the real brackets,
              deductions and credits add up to at this profit.
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
            label="What do you want to keep from this job?"
            placeholder="2000"
            leadingSymbol="€"
            size="lg"
            value={keep}
            onChange={setKeep}
          />

          <CurrencyField
            id="job-costs"
            label="Costs just for this job (optional)"
            hint="Travel, an assistant, equipment rental, licensing. Money that goes straight back out. It is added to the quote in full, because it is deductible."
            placeholder="e.g. 500"
            leadingSymbol="€"
            value={jobCosts}
            onChange={setJobCosts}
          />

          <CurrencyField
            id="job-projected-profit"
            label="Profit you already expect this year"
            hint="Everything except this job. It decides which bracket this job lands in, which is why the same job is worth different amounts in January and November."
            placeholder="e.g. 40000"
            leadingSymbol="€"
            value={effectiveProfit}
            onChange={setProjectedProfit}
          />

          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>btw you charge on this</Label>
            <div className="flex gap-2" role="group" aria-label="btw rate">
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
              btw is charged on top and passed straight on. It never changes what
              you keep.
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
                  Quote this, excluding btw
                </span>
                <AnimatedAmount
                  cents={quote.quoteExVat}
                  className="font-serif text-4xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-5xl"
                />
                {vatRate > 0 && (
                  <span className={hintClass}>
                    {formatEuro(quote.quoteInclVat)} on the invoice, including{" "}
                    {formatEuro(quote.vat)} btw.
                  </span>
                )}
              </div>

              <AllocationBar
                caption="Where every euro of this quote goes"
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
                Fill in what you want to keep and the profit you already expect
                this year.
              </p>
              <p className={hintClass}>
                Both are needed. Without the profit figure there is no way to
                know which bracket this job lands in, and a number produced
                without it would be a guess wearing a decimal point.
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
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-[var(--fl-line)] bg-white p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
        This job crosses a bracket
      </span>
      <p className="text-sm leading-relaxed text-[var(--fl-ink)]">
        It takes you past €{threshold.toLocaleString("nl-NL")} of taxable income,
        so about <strong>{formatEuro(amountAbove)}</strong> of it is taxed in the
        higher bracket. Across the whole job that averages{" "}
        <strong>{(jobRate * 100).toFixed(1)}%</strong>.
      </p>
      <p className={hintClass}>
        A flat percentage cannot see this, which is why it under-quotes exactly
        the jobs that matter most.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const tabs: { id: Mode; label: string; sub: string }[] = [
    { id: "year", label: "My rate for the year", sub: "Set a day rate" },
    { id: "job", label: "This one job", sub: "Quote a project" },
  ];
  return (
    <div role="tablist" aria-label="What are you pricing?" className="flex gap-2">
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
  if (optimisticRate === null) return null;

  const earned = asCentsUnsafe(optimisticRate * billableDays);
  const shortfall = asCentsUnsafe(honestRevenue - earned);
  if (shortfall <= 0) return null;
  const share = Math.round((shortfall / honestRevenue) * 100);

  return (
    <p className="-mt-3 rounded-lg border border-dashed border-[var(--fl-line)] p-3 text-xs leading-relaxed text-[var(--fl-slate)]">
      If you set your rate for {OPTIMISTIC_DAYS} days and bill {billableDays},
      you charge {formatEuro(optimisticRate)} a day and end the year on{" "}
      {formatEuro(earned)} instead of {formatEuro(honestRevenue)}. That is{" "}
      <strong className="text-[var(--fl-ink)]">{formatEuro(shortfall)}</strong>{" "}
      short, {share}% of your year.
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
  return (
    <details className="border-t border-[var(--fl-line)] pt-4">
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
        Why this number?
      </summary>
      <dl className="mt-4 flex flex-col gap-3">
        {lines.map((line) => (
          <div key={line.id} className="flex flex-col gap-0.5">
            <div
              className={`flex items-baseline justify-between gap-4 text-sm ${
                line.id === highlightId ? "font-semibold" : ""
              }`}
            >
              <dt className="text-[var(--fl-ink)]">{line.label}</dt>
              <dd className="fl-tnum shrink-0 font-mono tabular-nums text-[var(--fl-ink)]">
                {formatEuroExact(line.amount)}
              </dd>
            </div>
            <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
              {line.explanation}
            </p>
          </div>
        ))}
      </dl>
    </details>
  );
}

function Assumptions({ lines }: { lines: string[] }) {
  return (
    <details className="border-t border-[var(--fl-line)] pt-4">
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
        What this assumes ({lines.length})
      </summary>
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-5">
        {lines.map((line, i) => (
          <li key={i} className="text-xs leading-relaxed text-[var(--fl-slate)]">
            {line}
          </li>
        ))}
      </ul>
    </details>
  );
}

/** What was read from the saved profile, and where to change it. */
function ProfileNote({ profile, hydrated }: { profile: Profile; hydrated: boolean }) {
  if (!hydrated) return null;

  const claimed: string[] = [];
  if (profile.meetsHoursCriterion) {
    claimed.push("the 1.225 hours a year that unlock the zelfstandigenaftrek");
  }
  if (profile.isStarter) claimed.push("your first years in business");
  if (profile.otherIncome > 0) claimed.push("a salary alongside this");

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-dashed border-[var(--fl-line)] p-3">
      <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
        {claimed.length > 0
          ? `Using what you already told Freelens: ${claimed.join(", ")}.`
          : "You have not told Freelens whether you qualify for the zelfstandigenaftrek or the extra deduction for your first years in business, so this figure leaves both out. Claiming them lowers what you need to charge."}
      </p>
      <Link href="/tool" className={`${linkButtonClass} w-fit text-xs`}>
        Change your details
      </Link>
    </div>
  );
}
