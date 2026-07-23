"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyField, PercentField } from "@/components/app/fields";
import { AllocationBar } from "@/components/app/allocation-bar";
import { WhyThisNumber } from "@/components/app/why-this-number";
import { DisclaimerNote } from "@/components/disclaimer-note";
import { ExampleBadge } from "@/components/example-badge";
import { AnimatedAmount } from "@/components/design/animated-amount";
import {
  cardClass,
  hintClass,
  labelClass,
  primaryButtonClass,
} from "@/components/app/styles";
import {
  addCents,
  asCentsUnsafe,
  formatEuro,
  parseAmountInput,
  parsePercentInput,
  toCents,
  type Cents,
} from "@/lib/domain/money";
import { resolvePaymentVat, type VatTreatment } from "@/lib/domain/vat";
import {
  allocatePayment,
  type PaymentAllocationResult,
} from "@/lib/domain/allocation";
import type { ReserveSource } from "@/lib/domain/reserves";
import type { StoredAllocation, UserSetup } from "@/lib/domain/persistence";

const TREATMENT_LABELS: Record<VatTreatment, string> = {
  "21": "21% VAT",
  "9": "9% VAT",
  "0": "0% (export / intra-EU)",
  exempt: "Exempt",
  "reverse-charged": "Reverse-charged",
  kor: "KOR (Small Businesses Scheme)",
  "mixed-unsure": "Mixed / unsure",
};

// The non-numeric ("other") VAT treatments, revealed behind progressive
// disclosure so the common 21% / 9% path stays calm (audit M3).
const OTHER_TREATMENTS: VatTreatment[] = [
  "0",
  "exempt",
  "reverse-charged",
  "kor",
  "mixed-unsure",
];

type VatMode = "21" | "9" | "other";

// Ephemeral example shown before the user enters a real amount.
const SAMPLE = buildSample();

function buildSample() {
  const vat = resolvePaymentVat(toCents(1500), "21", true);
  return allocatePayment({
    grossPaymentCents: toCents(1500),
    vat,
    reserve: {
      cents: asCentsUnsafe((vat.netCents * 30) / 100),
      source: "own-rule",
    },
    obligations: [],
    bufferCents: asCentsUnsafe(0),
  });
}

/** A sliding segmented pill toggle (audit M3). */
function Segmented<T extends string>({
  name,
  ariaLabel,
  options,
  value,
  onChange,
}: {
  name: string;
  ariaLabel: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex w-fit rounded-xl border border-[var(--fl-line)] bg-white p-1"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className="relative min-h-11 rounded-lg px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {active && (
              <motion.span
                layoutId={`seg-${name}`}
                aria-hidden="true"
                className="absolute inset-0 rounded-lg bg-[var(--fl-ink)]"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 320, damping: 30 }
                }
              />
            )}
            <span
              className={`relative z-10 ${active ? "text-white" : "text-[var(--fl-ink)]"}`}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MoneyArrivedView({
  setup,
  onHandled,
  onPersonalize,
}: {
  setup: UserSetup | null;
  onHandled: (allocation: StoredAllocation) => void;
  onPersonalize?: () => void;
}) {
  const defaultTreatment: VatTreatment = setup?.commonVatTreatments?.[0] ?? "21";
  const defaultMode: VatMode =
    defaultTreatment === "21" || defaultTreatment === "9"
      ? defaultTreatment
      : "other";
  const defaultOther: VatTreatment =
    defaultMode === "other" ? defaultTreatment : "reverse-charged";
  const defaultPct =
    setup?.reserveMethod.mode === "own-rule"
      ? String(setup.reserveMethod.percentage)
      : "30";

  const [amount, setAmount] = useState("");
  const [includesVat, setIncludesVat] = useState(
    setup?.amountsDefaultInclusive ?? true
  );
  const [vatMode, setVatMode] = useState<VatMode>(defaultMode);
  const [otherTreatment, setOtherTreatment] =
    useState<VatTreatment>(defaultOther);
  const [reservePct, setReservePct] = useState(defaultPct);
  const [businessReserve, setBusinessReserve] = useState("");
  const [deductibleCosts, setDeductibleCosts] = useState("");
  const [label, setLabel] = useState("");
  const [handled, setHandled] = useState(false);

  const treatment: VatTreatment = vatMode === "other" ? otherTreatment : vatMode;
  const numeric = vatMode !== "other";

  const amountCents = parseAmountInput(amount).cents;
  const hasAmount = amountCents !== null && amountCents > 0;

  const result: PaymentAllocationResult | null = hasAmount
    ? buildResult({
        amountCents,
        includesVat: numeric ? includesVat : true,
        treatment,
        reservePct,
        businessReserve,
        deductibleCosts,
      })
    : null;

  function handleMarkHandled() {
    if (!result) return;
    const stored: StoredAllocation = {
      label: label.trim() || undefined,
      grossPaymentCents: result.grossPaymentCents,
      vatComponentCents: result.vatComponentCents,
      reserveCents: result.reserveCents,
      reserveSource: result.reserveSource,
      obligationsCents: result.obligationsCents,
      bufferCents: result.bufferCents,
      availableForPersonalPayoutCents: result.availableForPersonalPayoutCents,
      timestampIso: new Date().toISOString(),
      status: "handled",
    };
    onHandled(stored);
    setHandled(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        {/* Inputs, "what I tell Freelens". */}
        <Card className={cardClass}>
          <CardContent className="flex flex-col gap-5 p-6">
            <CurrencyField
              id="payment-amount"
              label="How much did you receive?"
              placeholder="1500"
              leadingSymbol="€"
              size="lg"
              value={amount}
              onChange={(v) => {
                setAmount(v);
                setHandled(false);
              }}
            />

            {numeric && (
              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>Does this amount include VAT?</Label>
                <Segmented
                  name="vat-inclusion"
                  ariaLabel="VAT inclusion"
                  value={includesVat ? "incl" : "excl"}
                  onChange={(v) => setIncludesVat(v === "incl")}
                  options={[
                    { value: "incl", label: "Includes VAT" },
                    { value: "excl", label: "Excludes VAT" },
                  ]}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className={labelClass}>VAT treatment</Label>
              <Segmented
                name="vat-mode"
                ariaLabel="VAT treatment"
                value={vatMode}
                onChange={setVatMode}
                options={[
                  { value: "21", label: "21%" },
                  { value: "9", label: "9%" },
                  { value: "other", label: "Other" },
                ]}
              />
              {vatMode === "other" && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  <Label className={labelClass} htmlFor="vat-other">
                    Which treatment?
                  </Label>
                  <select
                    id="vat-other"
                    value={otherTreatment}
                    onChange={(e) =>
                      setOtherTreatment(e.target.value as VatTreatment)
                    }
                    className="h-11 rounded-lg border border-[var(--fl-line)] bg-white px-2.5 text-sm text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
                  >
                    {OTHER_TREATMENTS.map((t) => (
                      <option key={t} value={t}>
                        {TREATMENT_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <details className="mt-0.5">
                <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-xs font-medium text-[var(--fl-slate)] hover:text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
                  I&apos;m not sure which VAT applies
                </summary>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--fl-slate)]">
                  Most Dutch services use <strong>21%</strong>; some (like certain
                  food, culture, or press work) use <strong>9%</strong>. Pick{" "}
                  <strong>Other</strong> if you use the KOR, invoice reverse-charged
                  or exempt work, or genuinely aren&apos;t sure. Freelens will then
                  set no VAT aside and explain why. You can change this anytime.
                </p>
              </details>
            </div>

            <PercentField
              id="reserve-pct"
              label="Income tax and Zvw reserve (%)"
              hint="Not sure? 30% is a cautious default you can adjust anytime. A planning rule, not your final assessment."
              value={reservePct}
              onChange={setReservePct}
              compact
            />

            <details className="rounded-lg border border-[var(--fl-line)] p-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
                Add costs and a label (optional)
              </summary>
              <div className="mt-4 flex flex-col gap-5">
                <CurrencyField
                  id="business-reserve"
                  label="Set aside for business costs"
                  placeholder="e.g. 500"
                  leadingSymbol="€"
                  value={businessReserve}
                  onChange={setBusinessReserve}
                />
                <CurrencyField
                  id="deductible-costs"
                  label="Deductible costs linked to this payment"
                  hint="Lowers the amount your reserve percentage applies to. This does not change VAT, so your VAT return may differ after input VAT."
                  placeholder="e.g. 200"
                  leadingSymbol="€"
                  value={deductibleCosts}
                  onChange={setDeductibleCosts}
                />
                <CurrencyField
                  id="payment-label"
                  label="Label"
                  placeholder="e.g. Editorial shoot, Friday DJ set"
                  value={label}
                  onChange={setLabel}
                />
              </div>
            </details>
          </CardContent>
        </Card>

        {/* Result, "what Freelens gives me". Sticky, distinct surface. */}
        <div className="lg:sticky lg:top-24">
          {result ? (
            <ResultCard
              result={result}
              treatment={treatment}
              handled={handled}
              onMarkHandled={handleMarkHandled}
            />
          ) : (
            <SampleCard />
          )}
        </div>
      </div>

      {!setup && onPersonalize && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] px-4 py-3 text-sm text-[var(--fl-slate)]">
          <span>This uses sensible defaults (21% VAT, 30% reserve).</span>
          <button
            type="button"
            onClick={onPersonalize}
            className="min-h-9 font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            Personalize this estimate
          </button>
        </div>
      )}

      <DisclaimerNote />
    </div>
  );
}

function buildResult(args: {
  amountCents: Cents;
  includesVat: boolean;
  treatment: VatTreatment;
  reservePct: string;
  businessReserve: string;
  deductibleCosts: string;
}): PaymentAllocationResult {
  const vat = resolvePaymentVat(
    args.amountCents,
    args.treatment,
    args.includesVat
  );
  const grossForAllocation =
    args.includesVat || vat.vatCents === null
      ? args.amountCents
      : addCents(args.amountCents, vat.vatCents);

  const deductible =
    parseAmountInput(args.deductibleCosts).cents ?? asCentsUnsafe(0);
  const reserveBaseRaw = vat.netCents - deductible;
  const reserveBase = asCentsUnsafe(Math.max(0, reserveBaseRaw));
  const pct = parsePercentInput(args.reservePct).value ?? 0;
  const reserveCents = asCentsUnsafe((reserveBase * pct) / 100);
  const source: ReserveSource = "own-rule";

  const businessReserveCents =
    parseAmountInput(args.businessReserve).cents ?? asCentsUnsafe(0);
  const obligations =
    businessReserveCents > 0
      ? [{ label: "Business set-aside", cents: businessReserveCents }]
      : [];

  const assumptions: string[] = [];
  if (deductible > 0) {
    assumptions.push(
      `Reserve applied to ${formatEuro(reserveBase)} after ${formatEuro(deductible)} deductible costs.`
    );
  }

  return allocatePayment({
    grossPaymentCents: grossForAllocation,
    vat,
    reserve: { cents: reserveCents, source },
    obligations,
    bufferCents: asCentsUnsafe(0),
    assumptions,
  });
}

const stageCardClass =
  "rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] shadow-sm";

function ResultCard({
  result,
  treatment,
  handled,
  onMarkHandled,
}: {
  result: PaymentAllocationResult;
  treatment: VatTreatment;
  handled: boolean;
  onMarkHandled: () => void;
}) {
  const isShort = result.availableForPersonalPayoutCents < 0;
  const segments = [
    result.vatComponentCents
      ? {
          label: "VAT",
          cents: result.vatComponentCents,
          color: "var(--fl-vat-fill)",
        }
      : null,
    { label: "Reserve", cents: result.reserveCents, color: "var(--fl-reserve-fill)" },
    result.obligationsCents > 0
      ? {
          label: "Business",
          cents: result.obligationsCents,
          color: "var(--fl-costs-fill)",
        }
      : null,
    {
      label: "Personal payout",
      cents: result.availableForPersonalPayoutCents,
      color: "var(--fl-payout-fill)",
    },
  ].filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <Card className={stageCardClass}>
      <CardContent className="flex flex-col gap-5 p-6">
        <dl className="flex flex-col gap-2">
          <Row label="Payment received" value={formatEuro(result.grossPaymentCents)} />
          {result.vatComponentCents !== null ? (
            <Row
              label="VAT included in this payment"
              value={formatEuro(result.vatComponentCents)}
              muted
            />
          ) : (
            <p className="text-sm text-[var(--fl-slate)]">
              {result.vatExplanation}
            </p>
          )}
          <Row
            label="Income tax and Zvw reserve"
            value={formatEuro(result.reserveCents)}
            muted
          />
          {result.obligationsCents > 0 && (
            <Row
              label="Set aside for business costs"
              value={formatEuro(result.obligationsCents)}
              muted
            />
          )}
        </dl>

        <div className="flex flex-col gap-1 border-t border-[var(--fl-line)] pt-4">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            {isShort
              ? "This payment doesn't cover your set-asides"
              : "Estimated amount available to pay yourself"}
          </span>
          <AnimatedAmount
            cents={result.availableForPersonalPayoutCents}
            className={`font-serif text-4xl font-medium tracking-tight sm:text-5xl ${
              isShort ? "text-[var(--fl-short-text)]" : "text-[var(--fl-ink)]"
            }`}
          />
        </div>

        <AllocationBar segments={segments} />

        <WhyThisNumber
          steps={result.breakdown}
          resultLabel="Estimated amount available to pay yourself"
          resultCents={result.availableForPersonalPayoutCents}
          reserveSourceNote="Reserve based on the percentage you set (a planning rule, not a tax assessment)."
        />

        {treatment !== "21" && treatment !== "9" && (
          <p className={hintClass}>{result.vatExplanation}</p>
        )}

        <div className="flex flex-col gap-2 border-t border-[var(--fl-line)] pt-4">
          {handled ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--fl-payout-text)]">
              <Check className="size-4" aria-hidden="true" />
              Saved on this device.
            </p>
          ) : (
            <button type="button" onClick={onMarkHandled} className={primaryButtonClass}>
              Mark allocation as handled
            </button>
          )}
          <p className={hintClass}>
            Freelens records the plan on this device. You still need to move the
            money in your bank.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SampleCard() {
  const segments = [
    {
      label: "VAT",
      cents: SAMPLE.vatComponentCents ?? asCentsUnsafe(0),
      color: "var(--fl-vat-fill)",
    },
    { label: "Reserve", cents: SAMPLE.reserveCents, color: "var(--fl-reserve-fill)" },
    {
      label: "Personal payout",
      cents: SAMPLE.availableForPersonalPayoutCents,
      color: "var(--fl-payout-fill)",
    },
  ];
  return (
    <Card className={stageCardClass}>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <ExampleBadge />
          <p className={hintClass}>
            Here&apos;s how a €1.500 payment at 21% VAT and a 30% reserve splits.
          </p>
        </div>
        <dl className="flex flex-col gap-2">
          <Row label="Payment received" value={formatEuro(SAMPLE.grossPaymentCents)} />
          <Row
            label="VAT included in this payment"
            value={formatEuro(SAMPLE.vatComponentCents ?? asCentsUnsafe(0))}
            muted
          />
          <Row
            label="Income tax and Zvw reserve"
            value={formatEuro(SAMPLE.reserveCents)}
            muted
          />
        </dl>
        <div className="flex flex-col gap-1 border-t border-[var(--fl-line)] pt-4">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            Estimated amount available to pay yourself
          </span>
          <span className="fl-tnum font-serif text-3xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {formatEuro(SAMPLE.availableForPersonalPayoutCents)}
          </span>
        </div>
        <AllocationBar segments={segments} />
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={muted ? "text-sm text-[var(--fl-slate)]" : "text-sm font-medium text-[var(--fl-ink)]"}>
        {label}
      </dt>
      <dd className="fl-tnum font-mono text-sm text-[var(--fl-ink)]">
        {value}
      </dd>
    </div>
  );
}
