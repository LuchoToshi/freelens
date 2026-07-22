"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyField } from "@/components/app/fields";
import { StatusBanner } from "@/components/app/status-banner";
import { WhyThisNumber } from "@/components/app/why-this-number";
import { DisclaimerNote } from "@/components/disclaimer-note";
import { AnimatedAmount } from "@/components/design/animated-amount";
import {
  cardClass,
  hintClass,
  labelClass,
  pillButtonClass,
  primaryButtonClass,
} from "@/components/app/styles";
import {
  asCentsUnsafe,
  formatEuro,
  fromCents,
  parseAmountInput,
  type Cents,
} from "@/lib/domain/money";
import {
  evaluateWeeklyPosition,
  type CompletenessLevel,
  type WeeklyPositionInput,
  type WeeklyPositionResult,
} from "@/lib/domain/allocation";
import type { ReserveSource } from "@/lib/domain/reserves";
import type { StoredWeeklyPosition, UserSetup } from "@/lib/domain/persistence";

const BUFFER_OPTIONS = [1, 2, 3, 6] as const;

const COMPLETENESS_COPY: Record<CompletenessLevel, string> = {
  "quick-estimate": "Based on limited information and your chosen reserve rules.",
  "improved-estimate": "Includes actual reserve balances and upcoming obligations.",
  "bookkeeping-based": "Uses amounts entered from your bookkeeping.",
};

const STATUS_COLOR: Record<WeeklyPositionResult["status"], string> = {
  "reserves-covered": "var(--fl-payout-fill)",
  "limited-room": "var(--fl-vat-fill)",
  "reserve-gap": "var(--fl-short-text)",
};

function centsToInput(cents: Cents | undefined): string {
  if (cents === undefined) return "";
  const v = fromCents(cents);
  return v === 0 ? "" : String(v);
}

export function WeeklyCheckinView({
  setup,
  saved,
  onSave,
}: {
  setup: UserSetup | null;
  saved: StoredWeeklyPosition | null;
  onSave: (input: WeeklyPositionInput) => void;
}) {
  const prior = saved?.input;
  const [balance, setBalance] = useState(centsToInput(prior?.currentBalanceCents));
  const [actualVat, setActualVat] = useState(
    prior?.vatProtectedIsActual ? centsToInput(prior?.vatProtectedCents) : ""
  );
  const [reserve, setReserve] = useState(
    centsToInput(prior?.reserveProtectedCents)
  );
  const [monthlyCosts, setMonthlyCosts] = useState(
    centsToInput(
      prior?.essentialMonthlyCostsCents ??
        setup?.essentialMonthlyBusinessCostsCents
    )
  );
  const [obligations, setObligations] = useState(
    centsToInput(prior?.obligations?.[0]?.cents)
  );
  const [bufferMonths, setBufferMonths] = useState<number>(
    setup?.bufferMonths ?? 2
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [recommendedPayout, setRecommendedPayout] = useState(
    centsToInput(prior?.recommendedPersonalPayoutCents)
  );
  const [saveState, setSaveState] = useState(false);

  const balanceCents = parseAmountInput(balance, { allowNegative: true }).cents;
  const hasBalance = balanceCents !== null;

  const monthlyCostsCents = parseAmountInput(monthlyCosts).cents;
  const bufferTargetCents = asCentsUnsafe(
    (monthlyCostsCents ?? 0) * bufferMonths
  );

  const reserveSource: ReserveSource =
    setup?.reserveMethod.mode === "provisional-assessment"
      ? "provisional-assessment"
      : setup?.reserveMethod.mode === "guided-estimate"
        ? "guided-estimate"
        : setup?.reserveMethod.mode === "own-rule"
          ? "own-rule"
          : "manual";

  const input: WeeklyPositionInput | null = hasBalance
    ? {
        currentBalanceCents: balanceCents,
        vatProtectedCents: parseAmountInput(actualVat).cents ?? asCentsUnsafe(0),
        vatProtectedIsActual: actualVat.trim() !== "",
        reserveProtectedCents: parseAmountInput(reserve).cents ?? asCentsUnsafe(0),
        reserveSource,
        obligations:
          (parseAmountInput(obligations).cents ?? 0) > 0
            ? [
                {
                  label: "Upcoming obligations",
                  cents: parseAmountInput(obligations).cents as Cents,
                },
              ]
            : [],
        bufferTargetCents,
        essentialMonthlyCostsCents: monthlyCostsCents ?? undefined,
        recommendedPersonalPayoutCents:
          parseAmountInput(recommendedPayout).cents ?? undefined,
      }
    : null;

  const result = input ? evaluateWeeklyPosition(input) : null;

  // Progress rhythm: Balance -> Protected -> Costs -> Buffer.
  const steps = [
    { label: "Balance", done: hasBalance },
    { label: "Protected", done: reserve.trim() !== "" || actualVat.trim() !== "" },
    { label: "Costs", done: monthlyCosts.trim() !== "" },
    { label: "Buffer", done: true },
  ];

  function handleSave() {
    if (!input) return;
    onSave(input);
    setSaveState(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressRhythm steps={steps} />

      <Card className={cardClass}>
        <CardContent className="flex flex-col gap-5 p-6">
          <CurrencyField
            id="balance"
            label="How much is in your business account?"
            placeholder="7000"
            leadingSymbol="€"
            value={balance}
            onChange={(v) => {
              setBalance(v);
              setSaveState(false);
            }}
            allowNegative
            hint="Use the balance from your banking app; a close estimate works."
          />
          <CurrencyField
            id="reserve-amount"
            label="How much have you reserved for income tax and Zvw?"
            placeholder="1500"
            leadingSymbol="€"
            value={reserve}
            onChange={setReserve}
            hint="The amount you're keeping aside for tax. A planning figure, not a final assessment."
          />
          <CurrencyField
            id="monthly-costs"
            label="Essential monthly business costs"
            placeholder="1200"
            leadingSymbol="€"
            value={monthlyCosts}
            onChange={setMonthlyCosts}
          />
          <CurrencyField
            id="obligations"
            label="Known upcoming obligations (optional)"
            placeholder="500"
            leadingSymbol="€"
            value={obligations}
            onChange={setObligations}
          />
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Buffer to keep, in months</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Buffer months">
              {BUFFER_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={bufferMonths === m}
                  onClick={() => setBufferMonths(m)}
                  className={`inline-flex min-h-11 min-w-14 items-center justify-center rounded-lg border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
                    bufferMonths === m
                      ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                      : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className={hintClass}>
              Buffer target: {formatEuro(bufferTargetCents)} ({bufferMonths} ×
              monthly costs).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            aria-expanded={advancedOpen}
            className={pillButtonClass}
          >
            Improve accuracy
            {advancedOpen ? (
              <ChevronUp className="size-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden="true" />
            )}
          </button>
          {advancedOpen && (
            <div className="flex flex-col gap-5">
              <CurrencyField
                id="actual-vat"
                label="Actual VAT currently reserved (optional)"
                placeholder="600"
                leadingSymbol="€"
                value={actualVat}
                onChange={setActualVat}
                hint="From your bookkeeping or latest VAT overview. Often more accurate than one payment."
              />
              <CurrencyField
                id="recommended-payout"
                label="Personal payout you plan to take (optional)"
                placeholder="2000"
                leadingSymbol="€"
                value={recommendedPayout}
                onChange={setRecommendedPayout}
                hint="Set this to see how much room remains beyond your planned salary."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {result ? (
        <>
          <StatusBanner
            status={result.status}
            detail={
              result.status === "reserve-gap" && result.shortfallCents !== null
                ? `Keep the next ${formatEuro(result.shortfallCents)} of incoming cash in the business to restore your selected reserves.`
                : undefined
            }
          />
          <Card className="rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] shadow-sm">
            <CardContent className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--fl-slate)]">
                  {result.availableForPersonalPayoutCents < 0
                    ? "Short of your selected reserves by"
                    : "May be available for personal payout"}
                </span>
                <AnimatedAmount
                  cents={
                    (result.availableForPersonalPayoutCents < 0
                      ? Math.abs(result.availableForPersonalPayoutCents)
                      : result.availableForPersonalPayoutCents) as Cents
                  }
                  className={`font-serif text-4xl font-medium tracking-tight sm:text-5xl ${
                    result.availableForPersonalPayoutCents < 0
                      ? "text-[var(--fl-short-text)]"
                      : "text-[var(--fl-ink)]"
                  }`}
                />
                <p className={hintClass}>{interpret(result)}</p>
              </div>

              <RunwayMeter
                runwayMonths={result.runwayMonths}
                bufferMonths={bufferMonths}
                color={STATUS_COLOR[result.status]}
              />

              <dl className="flex flex-col gap-2 border-t border-[var(--fl-line)] pt-4">
                <Row label="VAT protected" value={formatEuro(result.vatProtectedCents)} />
                <Row
                  label="Income tax and Zvw reserve protected"
                  value={formatEuro(result.reserveProtectedCents)}
                />
                {result.obligationsCents > 0 && (
                  <Row label="Upcoming obligations" value={formatEuro(result.obligationsCents)} />
                )}
                <Row label="Business buffer" value={formatEuro(result.bufferTargetCents)} />
                <Row
                  label="Optional spending room"
                  value={formatEuro(result.optionalSpendingRoomCents)}
                />
              </dl>

              <WhyThisNumber
                steps={result.breakdown}
                resultLabel="May be available for personal payout"
                resultCents={result.availableForPersonalPayoutCents}
                reserveSourceNote={reserveSourceNote(result.reserveSource)}
              />

              <p className={hintClass}>{COMPLETENESS_COPY[result.completeness]}</p>

              <div className="flex flex-col gap-2 border-t border-[var(--fl-line)] pt-4">
                {saveState ? (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--fl-payout-text)]">
                    <Check className="size-4" aria-hidden="true" />
                    Saved on this device.
                  </p>
                ) : (
                  <button type="button" onClick={handleSave} className={primaryButtonClass}>
                    Save this check-in
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className={cardClass}>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--fl-slate)]">
              Enter your business balance to see where you stand.
            </p>
          </CardContent>
        </Card>
      )}

      <DisclaimerNote />
    </div>
  );
}

/** One plain-language read of the result, only from figures we actually have. */
function interpret(result: WeeklyPositionResult): string {
  const runway =
    result.runwayMonths === null
      ? "Add monthly costs to estimate your runway."
      : `You have ${result.runwayMonths.toFixed(1)} months of runway.`;
  const tail =
    result.status === "reserves-covered"
      ? " Your selected reserves and buffer are covered."
      : result.status === "limited-room"
        ? " Reserves are covered, but spending room is tight."
        : " Your balance doesn't yet cover all selected reserves.";
  return runway + tail;
}

/** A calm horizon meter: runway months against the buffer-target marker. */
function RunwayMeter({
  runwayMonths,
  bufferMonths,
  color,
}: {
  runwayMonths: number | null;
  bufferMonths: number;
  color: string;
}) {
  const reduce = useReducedMotion();
  if (runwayMonths === null) return null;
  const scale = Math.max(6, bufferMonths, Math.ceil(runwayMonths));
  const fillPct = Math.min(100, Math.max(0, (runwayMonths / scale) * 100));
  const bufferPct = Math.min(100, (bufferMonths / scale) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative h-6 w-full overflow-hidden rounded-full bg-[var(--fl-line)]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <span
          className="absolute top-0 h-full w-0.5 bg-[var(--fl-ink)]"
          style={{ left: `${bufferPct}%` }}
          aria-hidden="true"
        />
      </div>
      <p className={hintClass}>
        {runwayMonths.toFixed(1)} months of runway · buffer target {bufferMonths}{" "}
        months.
      </p>
    </div>
  );
}

function ProgressRhythm({
  steps,
}: {
  steps: { label: string; done: boolean }[];
}) {
  return (
    <ol className="flex items-center gap-2" aria-label="Check-in progress">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center gap-2">
          <span
            className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
              s.done
                ? "bg-[var(--fl-payout-fill)] text-white"
                : "border border-[var(--fl-line)] text-[var(--fl-slate)]"
            }`}
          >
            {s.done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
          </span>
          <span className="text-xs font-medium text-[var(--fl-slate)]">
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="h-px w-4 bg-[var(--fl-line)]" aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  );
}

function reserveSourceNote(source: ReserveSource | "not-tracked"): string {
  switch (source) {
    case "own-rule":
      return "Reserve came from your own percentage rule (a planning rule, not a tax assessment).";
    case "provisional-assessment":
      return "Reserve came from your provisional assessment amount.";
    case "guided-estimate":
      return "Reserve came from the guided estimate (a planning estimate, not a final assessment).";
    case "manual":
      return "Reserve is the amount you entered.";
    default:
      return "No reserve is being tracked yet.";
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-[var(--fl-slate)]">{label}</dt>
      <dd className="fl-tnum font-mono text-sm text-[var(--fl-ink)]">
        {value}
      </dd>
    </div>
  );
}
