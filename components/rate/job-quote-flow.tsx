"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { CurrencyField } from "@/components/app/fields";
import { AllocationBar } from "@/components/app/allocation-bar";
import { AnimatedAmount } from "@/components/design/animated-amount";
import { Label } from "@/components/ui/label";
import {
  hintClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/app/styles";
import {
  asCentsUnsafe,
  formatEuro,
  formatEuroExact,
  fromCents,
  parseAmountInput,
  type Cents,
} from "@/lib/domain/money";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
import { outcomeForJobFee } from "@/lib/tax/jobOutcome";
import { useYearPosition } from "@/components/rate/use-year-position";
import { useJobs } from "@/components/rate/use-jobs";
import { SaveQuote } from "@/components/rate/save-quote";
import { countKey, jobContribution } from "@/lib/domain/yearPosition";
import { track } from "@/lib/analytics";
import type { RateProfile } from "@/components/rate/guided-rate-calculator";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import {
  translateAssumption,
  translateBreakdownExplanation,
  translateBreakdownLabel,
} from "@/lib/i18n/engineText";
import { fill } from "@/lib/i18n";

const TAX_YEAR = latestProfileYear(DEFAULT_COUNTRY) ?? 0;
const VAT_CHOICES = [21, 9, 0];
const STEP_COUNT = 3;
const HEADING_ID = "job-step-question";

/** €1.800 for a two-day shoot: a real number, not a round placeholder. */
const DEFAULT_FEE = "1800";

/**
 * Where a working freelancer plausibly is by mid-year.
 *
 * Not zero, and the reason matters. At zero profit the credits wipe out almost
 * all the tax on a single job, so the answer comes back "you keep 96%", which
 * is arithmetically true, useless, and the exact opposite of what this product
 * exists to say. A default nobody would ever sit at teaches the wrong lesson on
 * first impression. A slider also cannot be left blank by accident the way an
 * empty currency field can.
 */
const DEFAULT_PROJECTED_PROFIT = 40_000;

export interface JobQuoteFlowProps {
  profile: RateProfile;
  /** Profit already expected this year, from the saved profile. */
  knownProjectedProfit: number;
  /** Homepage only: the way through to the annual day-rate mode. */
  showTariefLink?: boolean;
  /**
   * Open on the answer for the default fee instead of on question one.
   *
   * The homepage pairs this flow with a payment calculator that returns a
   * figure the moment it renders. Opening this one on an empty first step made
   * the same card behave two different ways depending on the tab, and put three
   * taps between a visitor and the only thing they came for. Every input is
   * still one tap away behind "Adjust".
   */
  startAtResult?: boolean;
}

/**
 * The question a freelancer actually asks, in the moment they ask it.
 *
 * "I'm thinking of quoting €1.800 for this — what's left?" This runs the engine
 * forwards: the fee is known, so there is no solve, just the real liability
 * curve applied on top of the year so far.
 *
 * Not to be confused with `guided-rate-calculator`, which runs backwards from a
 * target income to a day rate. That one recommends a number. This one does not
 * recommend anything: it takes a price the user chose and shows what survives.
 * The copy has to keep saying so, because a number this prominent is very easy
 * to read as advice.
 *
 * Three steps, all with workable defaults, so the fastest path is three taps.
 * State lives above the step index, so Back never costs an answer.
 */
export function JobQuoteFlow({
  profile,
  knownProjectedProfit,
  showTariefLink = false,
  startAtResult = false,
}: JobQuoteFlowProps) {
  const t = useT();
  const j = t.rate.job;

  const [step, setStep] = useState(startAtResult ? STEP_COUNT : 0);
  const [fee, setFee] = useState(DEFAULT_FEE);
  const [vatRate, setVatRate] = useState(21);
  const [days, setDays] = useState("");
  const [costs, setCosts] = useState("");
  const [profitEdited, setProfitEdited] = useState<number | null>(null);
  const year = useYearPosition(TAX_YEAR);
  const jobsStore = useJobs();

  // What the user has actually counted beats the saved profile, which beats the
  // default. The whole point of the running total is to replace a guess.
  const countedProfit = year.position ? fromCents(year.position.profitCents) : 0;
  const basis: "counted" | "profile" | "default" =
    countedProfit > 0 ? "counted" : knownProjectedProfit > 0 ? "profile" : "default";

  // The saved profile arrives after hydration. Until the user types here, the
  // field shows whatever Freelens already knows, so nobody is asked to
  // re-enter a figure the product has.
  const profitValue =
    profitEdited ??
    (basis === "counted"
      ? countedProfit
      : basis === "profile"
        ? knownProjectedProfit
        : DEFAULT_PROJECTED_PROFIT);
  const usingSavedProfit = profitEdited === null && basis === "profile";
  const usingCountedProfit = profitEdited === null && basis === "counted";

  const prefillReported = useRef(false);
  useEffect(() => {
    if (prefillReported.current || !usingCountedProfit) return;
    prefillReported.current = true;
    track("year_position_prefilled");
  }, [usingCountedProfit]);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstPaint = useRef(true);
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const feeCents = parseAmountInput(fee).cents ?? asCentsUnsafe(0);
  const costsCents = parseAmountInput(costs).cents ?? asCentsUnsafe(0);
  const profitCents = asCentsUnsafe(Math.round(profitValue * 100));
  const daysCount = Number.parseInt(days, 10);

  const result = useMemo(
    () =>
      outcomeForJobFee({
        taxYear: TAX_YEAR,
        country: DEFAULT_COUNTRY,
        feeExVat: fromCents(feeCents),
        jobCosts: fromCents(costsCents),
        currentProjectedProfit: fromCents(profitCents),
        vatRate,
        daysOfWork: Number.isFinite(daysCount) && daysCount > 0 ? daysCount : undefined,
        meetsHoursCriterion: profile.meetsHoursCriterion,
        isStarter: profile.isStarter,
        otherIncome: profile.otherIncome,
        otherIncomeTaxWithheld: profile.otherIncomeTaxWithheld,
      }),
    [feeCents, costsCents, profitCents, vatRate, daysCount, profile]
  );

  if (step === STEP_COUNT) {
    return (
      <JobResult
        headingRef={headingRef}
        result={result}
        vatRate={vatRate}
        assumesFirstJob={profitCents === 0}
        onFixFirstJob={() => setStep(2)}
        onAdjust={() => {
          // Release the pin so the next run picks up the new running total.
          setProfitEdited(null);
          setStep(0);
        }}
        showTariefLink={showTariefLink}
        year={year}
        jobsStore={jobsStore}
        // Counting must not move the answer on screen. Without this the total
        // that now includes this job would become the basis for this job's own
        // calculation, taxing it on top of itself and swinging the headline.
        onCounted={() => setProfitEdited(profitValue)}
        contribution={jobContribution(result.feeExVat, result.jobCosts)}
        countKey={countKey({
          feeExVatCents: result.feeExVat,
          jobCostsCents: result.jobCosts,
          vatRate,
          taxYear: TAX_YEAR,
        })}
      />
    );
  }

  const steps = [
    {
      question: j.fee.question,
      helper: j.fee.helper,
      why: j.fee.why,
      body: (
        <div className="flex flex-col gap-5">
          <CurrencyField
            id="job-fee"
            label={j.fee.fieldLabel}
            placeholder={j.fee.placeholder}
            leadingSymbol="€"
            size="lg"
            value={fee}
            onChange={setFee}
          />

          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>{j.fee.vatLabel}</Label>
            <div className="flex gap-2" role="group" aria-label={j.fee.vatGroupLabel}>
              {VAT_CHOICES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  aria-pressed={vatRate === rate}
                  onClick={() => setVatRate(rate)}
                  className={`min-h-11 flex-1 rounded-lg border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
                    vatRate === rate
                      ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                      : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)]"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <p className={hintClass}>{j.fee.vatNote}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className={labelClass} htmlFor="job-days">
              {j.fee.daysLabel}
            </Label>
            <input
              id="job-days"
              type="number"
              inputMode="numeric"
              min={1}
              max={365}
              placeholder={j.fee.daysPlaceholder}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className={`${inputClass} max-w-28`}
            />
            <p className={hintClass}>{j.fee.daysHelper}</p>
          </div>
        </div>
      ),
    },
    {
      question: j.costs.question,
      helper: j.costs.helper,
      why: j.costs.why,
      optional: true,
      body: (
        <CurrencyField
          id="job-costs"
          label={j.costs.fieldLabel}
          placeholder={j.costs.placeholder}
          leadingSymbol="€"
          size="lg"
          value={costs}
          onChange={setCosts}
        />
      ),
    },
    {
      question: j.profit.question,
      helper: j.profit.helper,
      why: j.profit.why,
      body: usingCountedProfit ? (
        // A counted total is known, so it is stated rather than offered on a
        // slider. A slider would also snap it to the nearest step and show a
        // thumb that disagrees with the figure beside it.
        <div className="flex flex-col gap-3">
          <p className="fl-tnum font-serif text-4xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-5xl">
            {formatEuro(asCentsUnsafe(Math.round(profitValue * 100)))}
          </p>
          <p className={hintClass}>{j.year.prefilled}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => setProfitEdited(profitValue)}
              className={`${linkButtonClass} text-xs`}
            >
              {j.year.adjust}
            </button>
            <button
              type="button"
              onClick={year.reset}
              className={`${linkButtonClass} text-xs`}
            >
              {j.year.reset}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Label className="sr-only" htmlFor="job-projected-profit">
            {j.profit.fieldLabel}
          </Label>
          <output
            htmlFor="job-projected-profit"
            className="fl-tnum font-serif text-4xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-5xl"
          >
            {formatEuro(asCentsUnsafe(Math.round(profitValue * 100)))}
          </output>
          <input
            id="job-projected-profit"
            type="range"
            min={0}
            max={150_000}
            step={2_500}
            value={profitValue}
            onChange={(e) => setProfitEdited(Number(e.target.value))}
            className="h-11 w-full accent-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          />
          {usingSavedProfit && <p className={hintClass}>{j.profit.fromProfile}</p>}
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="flex flex-col gap-6">
      <Progress step={step} label={j.progressLabel} stepOf={j.stepOf} />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            id={HEADING_ID}
            ref={headingRef}
            tabIndex={-1}
            className="font-serif text-2xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] outline-none sm:text-3xl"
          >
            {current.question}
          </h3>
          {current.optional && (
            <span className="rounded-full border border-[var(--fl-line)] px-2 py-0.5 text-xs text-[var(--fl-slate)]">
              {j.optional}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{current.helper}</p>
      </div>

      <div className="rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-6">
        {current.body}
      </div>

      <WhyAsk label={j.whyAsk} body={current.why} />

      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={secondaryButtonClass}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {j.back}
          </button>
        )}
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(STEP_COUNT, s + 1))}
          className={`${primaryButtonClass} flex-1 sm:flex-none`}
        >
          {step === STEP_COUNT - 1 ? j.submit : j.next}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {fill(j.announce, {
          n: step + 1,
          total: STEP_COUNT,
          question: current.question,
        })}
      </p>
    </div>
  );
}

function Progress({
  step,
  label,
  stepOf,
}: {
  step: number;
  label: string;
  stepOf: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
        {fill(stepOf, { n: step + 1, total: STEP_COUNT })}
      </span>
      <div className="flex gap-1.5" role="group" aria-label={label}>
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-[var(--fl-ink)]" : "bg-[var(--fl-line-control)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function WhyAsk({ label, body }: { label: string; body: string }) {
  return (
    <details>
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
        {label}
      </summary>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--fl-slate)]">
        {body}
      </p>
    </details>
  );
}

type Outcome = ReturnType<typeof outcomeForJobFee>;

/**
 * The answer, with the kept amount as the only large number.
 *
 * The fee is the user's own input, so repeating it big would tell them nothing.
 * What they came for is the part they had not worked out.
 */
function JobResult({
  headingRef,
  result,
  vatRate,
  assumesFirstJob,
  onFixFirstJob,
  onAdjust,
  showTariefLink,
  year,
  jobsStore,
  onCounted,
  contribution,
  countKey: resultKey,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  result: Outcome;
  vatRate: number;
  assumesFirstJob: boolean;
  onFixFirstJob: () => void;
  onAdjust: () => void;
  showTariefLink: boolean;
  year: ReturnType<typeof useYearPosition>;
  jobsStore: ReturnType<typeof useJobs>;
  onCounted: () => void;
  contribution: Cents;
  countKey: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const r = t.rate.job.result;

  const costsClause =
    result.jobCosts > 0
      ? fill(r.costsClause, { costs: formatEuro(result.jobCosts) })
      : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6 shadow-sm sm:p-8">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {r.eyebrow}
        </span>

        <h3
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 outline-none"
        >
          <AnimatedAmount
            cents={result.takeHome}
            className="font-serif text-5xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-6xl"
          />
          <span className="text-sm text-[var(--fl-slate)]">
            {fill(r.ofFee, { fee: formatEuro(result.feeExVat) })}
          </span>
        </h3>

        <p className="mt-4 max-w-prose text-base leading-relaxed text-[var(--fl-ink)]">
          {fill(r.summary, {
            tax: formatEuro(result.additionalLiability),
            costsClause,
          })}
        </p>

        <div className="mt-6">
          <AllocationBar
            caption={t.rate.quoteCaption}
            segments={[
              result.jobCosts > 0
                ? {
                    label: t.rate.segments.jobCosts,
                    cents: result.jobCosts,
                    color: "var(--fl-costs-fill)",
                  }
                : null,
              {
                label: t.rate.segments.tax,
                cents: result.additionalLiability,
                color: "var(--fl-reserve-fill)",
              },
              {
                label: t.rate.segments.yours,
                cents: result.takeHome,
                color: "var(--fl-payout-fill)",
              },
            ].filter((s): s is NonNullable<typeof s> => s !== null)}
          />
        </div>

        <dl className="mt-6 flex flex-col gap-1.5 border-t border-[var(--fl-line)] pt-4 text-sm text-[var(--fl-slate)]">
          {vatRate > 0 && (
            <div>
              {fill(r.invoice, {
                gross: formatEuro(result.feeInclVat),
                vat: formatEuro(result.vat),
              })}
            </div>
          )}
          {result.impliedDayRate !== null && (
            <div>
              {fill(r.perDay, {
                rate: formatEuro(result.impliedDayRate),
                days: String(Math.round(result.takeHome / result.impliedDayRate)),
              })}
            </div>
          )}
          <div>{fill(r.keptShare, { pct: Math.round(result.keptShare * 100) })}</div>
        </dl>
      </div>

      <CountTowardYear
        year={year}
        onCounted={onCounted}
        contribution={contribution}
        resultKey={resultKey}
      />

      <SaveQuote
        jobsStore={jobsStore}
        feeExVatCents={result.feeExVat}
        jobCostsCents={result.jobCosts}
        vatRate={vatRate}
        takeHomeCents={result.takeHome}
        taxCents={result.additionalLiability}
        configVersion={result.configVersion}
      />

      {/* Not collapsed. A zero-profit assumption makes this job look better
          than it is, which is the one direction the product must not be quiet
          about. */}
      {assumesFirstJob && (
        <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-[var(--fl-line)] bg-white p-5">
          <p className="text-sm leading-relaxed text-[var(--fl-ink)]">
            {r.firstJobWarning}
          </p>
          <button type="button" onClick={onFixFirstJob} className={`${linkButtonClass} w-fit`}>
            {r.fixFirstJob}
          </button>
        </div>
      )}

      <details className="rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-6">
        <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
          {r.breakdown}
        </summary>

        <dl className="mt-5 flex flex-col gap-3">
          {result.breakdown.map((line) => (
            <div key={line.id} className="flex flex-col gap-0.5">
              <div
                className={`flex items-baseline justify-between gap-4 text-sm ${
                  line.id === "job-take-home" ? "font-semibold" : ""
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

        <ul className="mt-5 flex list-disc flex-col gap-2 border-t border-[var(--fl-line)] pl-5 pt-4">
          {result.assumptions.map((line, i) => (
            <li key={i} className="text-xs leading-relaxed text-[var(--fl-slate)]">
              {translateAssumption(locale, line)}
            </li>
          ))}
        </ul>
      </details>

      <p className={hintClass}>{r.notAdvice}</p>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onAdjust} className={secondaryButtonClass}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {r.adjust}
        </button>
        <Link href="/tool" className={primaryButtonClass}>
          {r.toTool}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {showTariefLink && (
        <Link href="/tarief" className={`${linkButtonClass} w-fit`}>
          {r.toTarief}
        </Link>
      )}
    </div>
  );
}

/**
 * "Count this toward my year."
 *
 * The one place the running total is built. Distinct from "Save this quote"
 * below it on purpose: counting adds one number to the year's running total,
 * saving files a record on the quote list. Either can be used without the
 * other, and the copy keeps them apart.
 *
 * Two safeguards, both load-bearing:
 *
 *   Undo, offered immediately and in the same place. A mis-tap shifts every
 *   later reserve up the progressive curve and nothing on screen would say so,
 *   which makes it the most expensive silent error in the product.
 *
 *   One count per result. The same fingerprint cannot be added twice, so an
 *   impatient double-click is free. Change any input and the fingerprint
 *   changes, so a genuinely different job counts again.
 */
function CountTowardYear({
  year,
  onCounted,
  contribution,
  resultKey,
}: {
  year: ReturnType<typeof useYearPosition>;
  onCounted: () => void;
  contribution: Cents;
  resultKey: string;
}) {
  const t = useT();
  const y = t.rate.job.year;
  const [countedKey, setCountedKey] = useState<string | null>(null);

  // A result worth nothing is not worth a control.
  if (contribution <= 0) return null;

  const isCounted = countedKey === resultKey;

  if (year.rolledOver) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-2xl border border-[var(--fl-line)] bg-white p-5">
        <p className="text-sm leading-relaxed text-[var(--fl-ink)]">{y.rolledOver}</p>
        <button
          type="button"
          onClick={year.dismissRollover}
          className={`${linkButtonClass} w-fit`}
        >
          {y.rolledOverDismiss}
        </button>
      </div>
    );
  }

  if (isCounted) {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-5"
        aria-live="polite"
      >
        <p className="text-sm leading-relaxed text-[var(--fl-ink)]">
          {fill(y.counted, {
            total: formatEuro(year.position?.profitCents ?? asCentsUnsafe(0)),
          })}
        </p>
        {year.canUndo && (
          <button
            type="button"
            onClick={() => {
              year.undo();
              setCountedKey(null);
            }}
            className={`${linkButtonClass} shrink-0`}
          >
            {y.undo}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border border-[var(--fl-line)] bg-white p-5">
      <button
        type="button"
        onClick={() => {
          year.count(contribution);
          onCounted();
          setCountedKey(resultKey);
        }}
        className={secondaryButtonClass}
      >
        <Plus className="size-4" aria-hidden="true" />
        {y.count}
      </button>
      <p className={hintClass}>
        {fill(y.countHint, { amount: formatEuro(contribution) })}
      </p>
    </div>
  );
}
