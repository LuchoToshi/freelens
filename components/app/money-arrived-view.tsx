"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyField } from "@/components/app/fields";
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
  toCents,
  type Cents,
} from "@/lib/domain/money";
import { resolvePaymentVat, type VatTreatment } from "@/lib/domain/vat";
import {
  allocatePayment,
  type PaymentAllocationResult,
} from "@/lib/domain/allocation";
import {
  calculatePerPaymentReserve,
  type ReserveSource,
} from "@/lib/domain/reserves";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
import { PaymentHistory } from "@/components/app/payment-history";
import {
  newPaymentId,
  yearTotals,
  MAX_NOTE_LENGTH,
  type PaymentPatch,
  type PaymentRecord,
} from "@/lib/domain/paymentHistory";
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

/**
 * Profit assumed for the worked example, stated on screen so it is not a hidden
 * guess. Declared before `SAMPLE` because `buildSample()` runs at module
 * evaluation: below it, this is in the temporal dead zone and `/tool` throws.
 * Production constant-folds the reference and hides the fault, so only a dev
 * server catches it.
 */
const SAMPLE_ANNUAL_PROFIT = 40_000;

// Ephemeral example shown before the user enters a real amount.
const SAMPLE = buildSample();

function buildSample() {
  const vat = resolvePaymentVat(toCents(1500), "21", true);
  const reserve = calculatePerPaymentReserve({
    paymentNetCents: vat.netCents,
    taxYear: latestProfileYear(DEFAULT_COUNTRY) ?? 0,
    country: DEFAULT_COUNTRY,
    projectedAnnualProfitCents: toCents(SAMPLE_ANNUAL_PROFIT),
    // The worked example is the first payment of the year.
    ytdProfitCents: asCentsUnsafe(0),
    ytdReservedCents: asCentsUnsafe(0),
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncomeCents: asCentsUnsafe(0),
    otherIncomeTaxWithheldCents: asCentsUnsafe(0),
  });
  return {
    allocation: allocatePayment({
      grossPaymentCents: toCents(1500),
      vat,
      reserve: {
        cents: reserve?.reserveCents ?? asCentsUnsafe(0),
        source: "guided-estimate",
      },
      obligations: [],
      bufferCents: asCentsUnsafe(0),
    }),
    ratePercent: reserve ? Math.round(reserve.appliedRate * 1000) / 10 : null,
  };
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
  paymentHistory,
  taxYear,
  today,
  onSavePayment,
  onEditPayment,
  onDeletePayment,
  onUpdateProfile,
  onOpenSettings,
}: {
  setup: UserSetup | null;
  onHandled: (allocation: StoredAllocation) => void;
  onPersonalize?: () => void;
  paymentHistory: PaymentRecord[];
  /** The tax year the running totals belong to. */
  taxYear: number;
  /** Today as YYYY-MM-DD, passed in so this component never reads the clock. */
  today: string;
  onSavePayment: (record: PaymentRecord) => void;
  onEditPayment: (id: string, patch: PaymentPatch) => void;
  onDeletePayment: (id: string) => void;
  /** Persists a correction made from the strip beside the result. */
  onUpdateProfile?: (patch: { meetsHoursCriterion?: boolean; isStarter?: boolean }) => void;
  onOpenSettings?: () => void;
}) {
  const defaultTreatment: VatTreatment = setup?.commonVatTreatments?.[0] ?? "21";
  const defaultMode: VatMode =
    defaultTreatment === "21" || defaultTreatment === "9"
      ? defaultTreatment
      : "other";
  const defaultOther: VatTreatment =
    defaultMode === "other" ? defaultTreatment : "reverse-charged";
  const guided =
    setup?.reserveMethod.mode === "guided-estimate"
      ? setup.reserveMethod
      : null;
  const storedProfitCents = guided
    ? guided.expectedAnnualRevenueExVatCents -
      guided.expectedDeductibleCostsExVatCents
    : 0;
  // Zero means "never answered", not "expects to break even". Prefilling a 0
  // would look like an answer and produce no reserve at all.
  const defaultAnnualProfit =
    storedProfitCents !== 0 ? String(storedProfitCents / 100) : "";

  const [amount, setAmount] = useState("");
  // Expected profit for the year. With it, the reserve comes from the real tax
  // rules at the point the year has actually reached. Without it, we fall back
  // to the user's own flat percentage and say so.
  const [annualProfit, setAnnualProfit] = useState(defaultAnnualProfit);
  // Defaults to NOT claimed. Claiming it lowers the reserve, so assuming it
  // unasked would under-reserve, and a surprise tax bill is worse than an
  // estimate the user corrects with one tap.
  const [meetsHours, setMeetsHours] = useState(guided?.meetsHoursCriterion ?? false);
  const [isStarter, setIsStarter] = useState(guided?.isStarter ?? false);
  // The running balance, derived from saved payments rather than typed. An
  // empty history means zero on both, which is the correct
  // first-payment-of-the-year state.
  const totals = yearTotals(paymentHistory, taxYear);
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentNote, setPaymentNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [includesVat, setIncludesVat] = useState(
    setup?.amountsDefaultInclusive ?? true
  );
  const [vatMode, setVatMode] = useState<VatMode>(defaultMode);
  const [otherTreatment, setOtherTreatment] =
    useState<VatTreatment>(defaultOther);
  const [businessReserve, setBusinessReserve] = useState("");
  const [deductibleCosts, setDeductibleCosts] = useState("");
  const [label, setLabel] = useState("");
  const [handled, setHandled] = useState(false);

  const treatment: VatTreatment = vatMode === "other" ? otherTreatment : vatMode;
  const numeric = vatMode !== "other";

  const amountCents = parseAmountInput(amount).cents;
  const hasAmount = amountCents !== null && amountCents > 0;

  const annualProfitCents = parseAmountInput(annualProfit, {
    allowNegative: true,
  }).cents;

  const hasProfit = annualProfitCents !== null;
  const built = hasAmount && hasProfit
    ? buildResult({
        amountCents,
        includesVat: numeric ? includesVat : true,
        treatment,
        businessReserve,
        deductibleCosts,
        annualProfitCents,
        ytdProfitCents: totals.profitCents,
        ytdReservedCents: totals.reservedCents,
        meetsHours,
        isStarter,
        otherIncomeCents: guided?.otherIncomeCents ?? asCentsUnsafe(0),
        otherIncomeTaxWithheldCents:
          guided?.otherIncomeTaxWithheldCents ?? asCentsUnsafe(0),
      })
    : null;
  const result: PaymentAllocationResult | null = built?.allocation ?? null;

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

            <details className="-mt-2">
              <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-xs text-[var(--fl-slate)] hover:text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
                <span>
                  {numeric && includesVat ? "Includes" : numeric ? "Excludes" : "No"}{" "}
                  {numeric ? `${treatment}% btw` : TREATMENT_LABELS[treatment].toLowerCase()}
                </span>
                <span className="ml-1.5 font-medium underline decoration-[var(--fl-line)] underline-offset-2">
                  change
                </span>
              </summary>
              <div className="mt-3 flex flex-col gap-4 rounded-lg border border-[var(--fl-line)] p-3">
                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass}>btw treatment</Label>
                  <Segmented
                    name="vat-mode"
                    ariaLabel="btw treatment"
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
                </div>
                {numeric && (
                  <div className="flex flex-col gap-1.5">
                    <Label className={labelClass}>Does this amount include btw?</Label>
                    <Segmented
                      name="vat-inclusion"
                      ariaLabel="btw inclusion"
                      value={includesVat ? "incl" : "excl"}
                      onChange={(v) => setIncludesVat(v === "incl")}
                      options={[
                        { value: "incl", label: "Includes btw" },
                        { value: "excl", label: "Excludes btw" },
                      ]}
                    />
                  </div>
                )}
                <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
                  Most Dutch services use <strong>21%</strong>; some (food,
                  culture, press work) use <strong>9%</strong>. Pick{" "}
                  <strong>Other</strong> for KOR, reverse-charged or exempt work,
                  or if you genuinely are not sure. Freelens then sets no btw
                  aside and explains why.
                </p>
              </div>
            </details>

            <CurrencyField
              id="annual-profit"
              label="Expected profit this year"
              hint="Revenue excluding VAT, minus your business costs. Income tax is worked out on profit for the whole year, so this is what sets your real rate. A rough figure is fine."
              placeholder="e.g. 40000"
              leadingSymbol="€"
              value={annualProfit}
              onChange={setAnnualProfit}
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
                  hint="Lowers the amount this payment is taxed on. It does not change VAT, so your VAT return may differ after input VAT."
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
            <div className="flex flex-col gap-3">
              <ResultCard
                result={result}
                treatment={treatment}
                handled={handled}
                onMarkHandled={handleMarkHandled}
              />
              <CorrectionStrip
                meetsHours={meetsHours}
                isStarter={isStarter}
                hasOtherIncome={(guided?.otherIncomeCents ?? 0) > 0}
                onToggleHours={(next) => {
                  setMeetsHours(next);
                  onUpdateProfile?.({ meetsHoursCriterion: next });
                }}
                onToggleStarter={(next) => {
                  setIsStarter(next);
                  onUpdateProfile?.({ isStarter: next });
                }}
                onOpenSettings={onOpenSettings}
              />
            </div>
          ) : (
            <SampleCard />
          )}
        </div>
      </div>

      {result && built && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--fl-line)] bg-white p-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
              Save this payment to {taxYear}
            </h3>
            <p className={hintClass}>
              Nothing is saved unless you choose to. Once it is, Freelens counts
              it towards the year and takes less from your later payments.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className={labelClass} htmlFor="payment-date">
                Date
              </Label>
              <input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => {
                  setPaymentDate(e.target.value);
                  setSaved(false);
                }}
                className="h-11 rounded-lg border border-[var(--fl-line)] bg-white px-2.5 text-sm text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
              />
            </div>
            <div className="flex min-w-48 flex-1 flex-col gap-1.5">
              <Label className={labelClass} htmlFor="payment-note">
                Note (optional)
              </Label>
              <input
                id="payment-note"
                type="text"
                maxLength={MAX_NOTE_LENGTH}
                value={paymentNote}
                onChange={(e) => {
                  setPaymentNote(e.target.value);
                  setSaved(false);
                }}
                placeholder="e.g. Editorial shoot"
                className="h-11 rounded-lg border border-[var(--fl-line)] bg-white px-2.5 text-sm text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
              />
            </div>
            <button
              type="button"
              disabled={saved}
              onClick={() => {
                onSavePayment({
                  id: newPaymentId(),
                  date: paymentDate,
                  // The reserve base, not the raw payment: this is what the
                  // payment actually added to profit, so a year of these sums
                  // to a real ytdProfit.
                  amountExVat: built.reserveBaseCents,
                  vatRate: built.vatRatePercent,
                  vatAmount: result.vatComponentCents ?? asCentsUnsafe(0),
                  reserveTaken: result.reserveCents,
                  note: paymentNote.trim() || undefined,
                  taxYear: Number(paymentDate.slice(0, 4)),
                });
                setPaymentNote("");
                setSaved(true);
              }}
              className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {saved ? "Saved" : `Save to ${taxYear}`}
            </button>
          </div>
          {saved && (
            <p className="text-sm text-[var(--fl-slate)]">
              Saved on this device. Your {taxYear} totals below have gone up, and
              your next payment will ask for less.
            </p>
          )}
        </div>
      )}

      <PaymentHistory
        records={paymentHistory}
        taxYear={taxYear}
        onEdit={onEditPayment}
        onDelete={onDeletePayment}
      />

      {!setup && onPersonalize && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] px-4 py-3 text-sm text-[var(--fl-slate)]">
          <span>
            Freelens is remembering nothing yet. Your answers above apply to this
            payment only.
          </span>
          <button
            type="button"
            onClick={onPersonalize}
            className="min-h-9 font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            Save my details
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] px-6 py-5">
        <span className="text-sm text-[var(--fl-slate)]">
          Pricing the next one? Same calculation, run backwards:
        </span>
        <Link
          href="/tarief"
          className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          Work out what to charge
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      <DisclaimerNote />
    </div>
  );
}

/**
 * The remaining profile questions, asked next to a number they visibly move.
 *
 * The hours criterion alone is worth €511,31 a year at €50.000 profit. Asked on
 * a setup screen before the user has seen anything it gets skipped; asked here,
 * with the answer already on screen, it earns a tap. Each answer is written
 * straight back to the profile so it is never asked again.
 */
function CorrectionStrip({
  meetsHours,
  isStarter,
  hasOtherIncome,
  onToggleHours,
  onToggleStarter,
  onOpenSettings,
}: {
  meetsHours: boolean;
  isStarter: boolean;
  hasOtherIncome: boolean;
  onToggleHours: (next: boolean) => void;
  onToggleStarter: (next: boolean) => void;
  onOpenSettings?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--fl-line)] bg-white p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
        Make this more accurate
      </span>
      <div className="flex flex-col gap-2">
        <StripToggle
          active={meetsHours}
          onClick={() => onToggleHours(!meetsHours)}
          label="I work 1.225 hours or more a year on this"
          effect="lowers it"
        />
        <StripToggle
          active={isStarter}
          onClick={() => onToggleStarter(!isStarter)}
          label="I'm in my first five years in business"
          effect="lowers it"
        />
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--fl-line)] px-3 text-left text-sm text-[var(--fl-ink)] hover:border-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            <span>
              {hasOtherIncome
                ? "I have a salary alongside this"
                : "I also have a salary"}
            </span>
            <span className="shrink-0 text-xs text-[var(--fl-slate)]">
              {hasOtherIncome ? "counted" : "raises it"}
            </span>
          </button>
        )}
      </div>
      <p className={hintClass}>
        Each answer is remembered, so you are only asked once.
      </p>
    </div>
  );
}

function StripToggle({
  active,
  onClick,
  label,
  effect,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  effect: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
        active
          ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
          : "border-dashed border-[var(--fl-line)] text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`shrink-0 text-xs ${active ? "text-white/70" : "text-[var(--fl-slate)]"}`}
      >
        {active ? "applied" : effect}
      </span>
    </button>
  );
}

function buildResult(args: {
  amountCents: Cents;
  includesVat: boolean;
  treatment: VatTreatment;
  businessReserve: string;
  deductibleCosts: string;
  annualProfitCents: Cents | null;
  ytdProfitCents: Cents;
  ytdReservedCents: Cents;
  meetsHours: boolean;
  isStarter: boolean;
  otherIncomeCents: Cents;
  otherIncomeTaxWithheldCents: Cents;
}): {
  allocation: PaymentAllocationResult;
  ratePercent: number | null;
  /** What the reserve was calculated on: net of VAT and of linked costs. */
  reserveBaseCents: Cents;
  /** 21, 9, or 0 for treatments that carry no VAT. */
  vatRatePercent: number;
} {
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

  const assumptions: string[] = [];
  if (deductible > 0) {
    assumptions.push(
      `Reserve applied to ${formatEuro(reserveBase)} after ${formatEuro(deductible)} deductible costs.`
    );
  }

  // Preferred path: the real tax rules, at the rate this year has reached.
  const engineReserve =
    args.annualProfitCents !== null
      ? calculatePerPaymentReserve({
          paymentNetCents: reserveBase,
          taxYear: latestProfileYear(DEFAULT_COUNTRY) ?? 0,
          country: DEFAULT_COUNTRY,
          projectedAnnualProfitCents: args.annualProfitCents,
          ytdProfitCents: args.ytdProfitCents,
          ytdReservedCents: args.ytdReservedCents,
          meetsHoursCriterion: args.meetsHours,
          isStarter: args.isStarter,
          otherIncomeCents: args.otherIncomeCents,
          otherIncomeTaxWithheldCents: args.otherIncomeTaxWithheldCents,
        })
      : null;

  // Without an expected profit there is no honest answer, so the caller does
  // not render a result at all. A flat fallback percentage used to fill this
  // gap; it was the last remnant of the 30% rule and has been removed rather
  // than kept as a quiet wrong answer.
  const reserveCents: Cents = engineReserve
    ? engineReserve.reserveCents
    : asCentsUnsafe(0);
  const source: ReserveSource = "guided-estimate";
  const ratePercent = engineReserve
    ? Math.round(engineReserve.appliedRate * 1000) / 10
    : null;
  if (engineReserve) {
    assumptions.push(
      `This payment's share of the ${formatEuro(engineReserve.annualLiabilityCents)} you are on track to owe for the year, which works out at ${ratePercent}% of this payment.`
    );
    assumptions.push(...engineReserve.assumptions.slice(1));
  }

  const businessReserveCents =
    parseAmountInput(args.businessReserve).cents ?? asCentsUnsafe(0);
  const obligations =
    businessReserveCents > 0
      ? [{ label: "Business set-aside", cents: businessReserveCents }]
      : [];

  return {
    allocation: allocatePayment({
      grossPaymentCents: grossForAllocation,
      vat,
      reserve: { cents: reserveCents, source },
      obligations,
      bufferCents: asCentsUnsafe(0),
      assumptions,
    }),
    ratePercent,
    reserveBaseCents: reserveBase,
    vatRatePercent: args.treatment === "21" ? 21 : args.treatment === "9" ? 9 : 0,
  };
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
      cents: SAMPLE.allocation.vatComponentCents ?? asCentsUnsafe(0),
      color: "var(--fl-vat-fill)",
    },
    { label: "Reserve", cents: SAMPLE.allocation.reserveCents, color: "var(--fl-reserve-fill)" },
    {
      label: "Personal payout",
      cents: SAMPLE.allocation.availableForPersonalPayoutCents,
      color: "var(--fl-payout-fill)",
    },
  ];
  return (
    <Card className={stageCardClass}>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <ExampleBadge />
          <p className={hintClass}>
            Here&apos;s how a €1.500 payment at 21% VAT splits, for someone
            expecting €40.000 profit this year
            {SAMPLE.ratePercent !== null
              ? ` (reserved at ${SAMPLE.ratePercent}%, the rate on their next euro)`
              : ""}
            .
          </p>
        </div>
        <dl className="flex flex-col gap-2">
          <Row label="Payment received" value={formatEuro(SAMPLE.allocation.grossPaymentCents)} />
          <Row
            label="VAT included in this payment"
            value={formatEuro(SAMPLE.allocation.vatComponentCents ?? asCentsUnsafe(0))}
            muted
          />
          <Row
            label="Income tax and Zvw reserve"
            value={formatEuro(SAMPLE.allocation.reserveCents)}
            muted
          />
        </dl>
        <div className="flex flex-col gap-1 border-t border-[var(--fl-line)] pt-4">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            Estimated amount available to pay yourself
          </span>
          <span className="fl-tnum font-serif text-3xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {formatEuro(SAMPLE.allocation.availableForPersonalPayoutCents)}
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
