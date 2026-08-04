"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CurrencyField } from "@/components/app/fields";
import { AllocationBar } from "@/components/app/allocation-bar";
import { AnimatedAmount } from "@/components/design/animated-amount";
import {
  hintClass,
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
} from "@/lib/domain/money";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
import { rateForTargetAnnualNet } from "@/lib/tax/rate";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import {
  translateAssumption,
  translateBreakdownExplanation,
  translateBreakdownLabel,
} from "@/lib/i18n/engineText";
import { fill } from "@/lib/i18n";

const TAX_YEAR = latestProfileYear(DEFAULT_COUNTRY) ?? 0;

export const DEFAULT_TARGET_NET = 40_000;
export const DEFAULT_BILLABLE_DAYS = 140;

/** What the profile contributes. Read only; this flow never writes to it. */
export interface RateProfile {
  meetsHoursCriterion: boolean;
  isStarter: boolean;
  otherIncome: number;
  otherIncomeTaxWithheld: number;
}

const STEP_COUNT = 3;
const HEADING_ID = "guided-step-question";

/**
 * The rate question as a guided flow.
 *
 * Three answers and a result, rather than one long form beside a live panel.
 * The reasoning: every input here has a defensible default, so the fastest
 * honest path through is three taps. Showing all three at once invites reading;
 * showing one at a time invites answering.
 *
 * Every explanation sits behind "Why are we asking?" and is closed by default.
 * The visible text per step is a question and one short line, which is the most
 * a person will read before they decide whether to bother.
 *
 * State lives here, above the step index, so going back never costs an answer.
 * The engine call is unchanged: `rateForTargetAnnualNet` computes on every
 * render, so the result is always consistent with whatever is currently entered.
 */
export function GuidedRateCalculator({
  profile,
  showTariefLink = false,
}: {
  profile: RateProfile;
  /** Homepage only: the way through to the per-project mode on /tarief. */
  showTariefLink?: boolean;
}) {
  const t = useT();
  const g = t.rate.guided;

  const [step, setStep] = useState(0);
  const [targetNet, setTargetNet] = useState(DEFAULT_TARGET_NET);
  const [billableDays, setBillableDays] = useState(DEFAULT_BILLABLE_DAYS);
  const [costs, setCosts] = useState("");

  // Focus moves to the heading of whatever just appeared, so a keyboard or
  // screen reader user is not left at the bottom of the previous step. Skipped
  // on first paint: stealing focus on page load would yank a homepage reader
  // down the page unprompted.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstPaint = useRef(true);
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const costsCents = parseAmountInput(costs).cents ?? asCentsUnsafe(0);

  const result = rateForTargetAnnualNet({
    taxYear: TAX_YEAR,
    country: DEFAULT_COUNTRY,
    targetAnnualNet: targetNet,
    annualBusinessCosts: fromCents(costsCents),
    billableUnitsPerYear: billableDays,
    meetsHoursCriterion: profile.meetsHoursCriterion,
    isStarter: profile.isStarter,
    otherIncome: profile.otherIncome,
    otherIncomeTaxWithheld: profile.otherIncomeTaxWithheld,
  });

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const next = useCallback(() => setStep((s) => Math.min(STEP_COUNT, s + 1)), []);

  if (step === STEP_COUNT) {
    return (
      <ResultPanel
        headingRef={headingRef}
        result={result}
        billableDays={billableDays}
        onAdjust={() => setStep(0)}
        showTariefLink={showTariefLink}
      />
    );
  }

  const steps = [
    {
      question: g.target.question,
      helper: g.target.helper,
      why: g.target.why,
      field: (
        <SliderField
          id="guided-target-net"
          labelledBy={HEADING_ID}
          value={targetNet}
          onChange={setTargetNet}
          min={10_000}
          max={150_000}
          step={1_000}
          display={formatEuro(asCentsUnsafe(targetNet * 100))}
        />
      ),
    },
    {
      question: g.days.question,
      helper: g.days.helper,
      why: g.days.why,
      field: (
        <SliderField
          id="guided-billable-days"
          labelledBy={HEADING_ID}
          value={billableDays}
          onChange={setBillableDays}
          min={20}
          max={260}
          step={5}
          display={fill(t.rate.daysValue, { days: billableDays })}
        />
      ),
    },
    {
      question: g.costs.question,
      helper: g.costs.helper,
      why: g.costs.why,
      optional: true,
      field: (
        <CurrencyField
          id="guided-annual-costs"
          label={g.costs.fieldLabel}
          placeholder={g.costs.placeholder}
          leadingSymbol="€"
          size="lg"
          value={costs}
          onChange={setCosts}
        />
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="flex flex-col gap-6">
      <Progress step={step} />

      {/* The question is the heading, so the hierarchy is question, then one
          supporting line, then the control. Nothing else competes. */}
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
              {g.optional}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{current.helper}</p>
      </div>

      <div className="rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-6">
        {current.field}
      </div>

      <WhyAsk label={g.whyAsk} body={current.why} />

      <div className="flex items-center gap-3">
        {step > 0 && (
          <button type="button" onClick={back} className={secondaryButtonClass}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {g.back}
          </button>
        )}
        <button type="button" onClick={next} className={`${primaryButtonClass} flex-1 sm:flex-none`}>
          {step === STEP_COUNT - 1 ? g.submit : g.next}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Announced rather than shown: sighted users already see the step move. */}
      <p aria-live="polite" className="sr-only">
        {fill(g.announce, {
          n: step + 1,
          total: STEP_COUNT,
          question: current.question,
        })}
      </p>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  const t = useT();
  const g = t.rate.guided;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {fill(g.stepOf, { n: step + 1, total: STEP_COUNT })}
        </span>
      </div>
      <div
        className="flex gap-1.5"
        role="group"
        aria-label={g.progressLabel}
      >
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-[var(--fl-ink)]" : "bg-[var(--fl-line)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/** The one place a step is allowed to explain itself, and it starts closed. */
function WhyAsk({ label, body }: { label: string; body: string }) {
  return (
    <details className="group">
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
        {label}
      </summary>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--fl-slate)]">
        {body}
      </p>
    </details>
  );
}

function SliderField({
  id,
  labelledBy,
  value,
  onChange,
  min,
  max,
  step,
  display,
}: {
  id: string;
  /** The step heading. Referenced rather than repeated, so the question is
      announced once, not twice. */
  labelledBy: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <output
        htmlFor={id}
        className="fl-tnum font-serif text-4xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-5xl"
      >
        {display}
      </output>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-labelledby={labelledBy}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full accent-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
      />
    </div>
  );
}

type RateResult = ReturnType<typeof rateForTargetAnnualNet>;

/**
 * The result. The rate is the largest thing on the page by a wide margin, then
 * one sentence of plain arithmetic, then the visual split. Everything that
 * could be called methodology is collapsed.
 */
function ResultPanel({
  headingRef,
  result,
  billableDays,
  onAdjust,
  showTariefLink,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  result: RateResult;
  billableDays: number;
  onAdjust: () => void;
  showTariefLink: boolean;
}) {
  const t = useT();
  const { locale } = useLocale();
  const g = t.rate.guided;
  const r = g.result;

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
            cents={result.requiredRatePerUnit}
            className="font-serif text-5xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-6xl"
          />
          <span className="text-sm text-[var(--fl-slate)]">{r.perDay}</span>
        </h3>

        <p className="mt-4 max-w-prose text-base leading-relaxed text-[var(--fl-ink)]">
          {fill(r.summary, {
            days: billableDays,
            revenue: formatEuro(result.requiredGrossRevenue),
            take: formatEuro(result.takeHome),
          })}
        </p>

        <div className="mt-6">
          <AllocationBar
            caption={t.rate.rateCaption}
            segments={[
              result.annualBusinessCosts > 0
                ? {
                    label: t.rate.segments.annualCosts,
                    cents: result.annualBusinessCosts,
                    color: "var(--fl-costs-fill)",
                  }
                : null,
              {
                label: t.rate.segments.tax,
                cents: result.totalTaxLiability,
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

        <p className="mt-5 border-t border-[var(--fl-line)] pt-4 text-sm leading-relaxed text-[var(--fl-slate)]">
          {r.notMarket}
        </p>
      </div>

      <details className="rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-6">
        <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
          {r.breakdown}
        </summary>

        <dl className="mt-5 flex flex-col gap-3">
          {result.breakdown.map((line) => (
            <div key={line.id} className="flex flex-col gap-0.5">
              <div
                className={`flex items-baseline justify-between gap-4 text-sm ${
                  line.id === "rate-take-home" ? "font-semibold" : ""
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

        <p className={`${hintClass} mt-4`}>
          {fill(t.rate.effectiveRate, { pct: (result.effectiveRate * 100).toFixed(1) })}
        </p>

        <ul className="mt-5 flex list-disc flex-col gap-2 border-t border-[var(--fl-line)] pl-5 pt-4">
          {result.assumptions.map((line, i) => (
            <li key={i} className="text-xs leading-relaxed text-[var(--fl-slate)]">
              {translateAssumption(locale, line)}
            </li>
          ))}
        </ul>
      </details>

      <p className={hintClass}>{r.estimate}</p>

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
