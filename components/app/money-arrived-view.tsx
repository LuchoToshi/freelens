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
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { translateAssumption } from "@/lib/i18n/engineText";
import { fill } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

type TreatmentKey = keyof Dictionary["app"]["moneyArrived"]["treatments"];

const TREATMENT_KEY: Record<VatTreatment, TreatmentKey> = {
  "21": "21",
  "9": "9",
  "0": "0",
  exempt: "exempt",
  "reverse-charged": "reverseCharged",
  kor: "kor",
  "mixed-unsure": "mixedUnsure",
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
  const t = useT();
  const { locale } = useLocale();
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
  // `today` is passed in, so this stays deterministic under test.
  const isPastJanuary = Number(today.slice(5, 7)) > 1;
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

  // The projection has fallen behind reality: saved profit has caught up with
  // it, so the engine has nothing left to spread the remaining bill over and
  // falls back to the marginal rate. Worth one prompt, not a warning.
  const showDrift =
    hasProfit && annualProfitCents > 0 && totals.profitCents >= annualProfitCents;

  // Someone who starts using Freelens in June has months of earnings the
  // running balance knows nothing about, so it treats every payment as their
  // first and over-reserves all year. Shown only until they save something.
  const showMidYear = totals.count === 0 && isPastJanuary;
  const built = hasAmount && hasProfit
    ? buildResult({
        t,
        locale,
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
              label={t.app.moneyArrived.amountLabel}
              placeholder={t.app.moneyArrived.amountPlaceholder}
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
                  {numeric && includesVat
                    ? t.app.moneyArrived.vatSummary.includes
                    : numeric
                      ? t.app.moneyArrived.vatSummary.excludes
                      : t.app.moneyArrived.vatSummary.none}{" "}
                  {numeric
                    ? `${treatment}% btw`
                    : t.app.moneyArrived.treatments[TREATMENT_KEY[treatment]].toLowerCase()}
                </span>
                <span className="ml-1.5 font-medium underline decoration-[var(--fl-line)] underline-offset-2">
                  {t.common.actions.change}
                </span>
              </summary>
              <div className="mt-3 flex flex-col gap-4 rounded-lg border border-[var(--fl-line)] p-3">
                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass}>{t.app.moneyArrived.vatTreatmentLabel}</Label>
                  <Segmented
                    name="vat-mode"
                    ariaLabel={t.app.moneyArrived.vatTreatmentLabel}
                    value={vatMode}
                    onChange={setVatMode}
                    options={[
                      { value: "21", label: "21%" },
                      { value: "9", label: "9%" },
                      { value: "other", label: t.app.moneyArrived.vatOther },
                    ]}
                  />
                  {vatMode === "other" && (
                    <div className="mt-1.5 flex flex-col gap-1.5">
                      <Label className={labelClass} htmlFor="vat-other">
                        {t.app.moneyArrived.whichTreatment}
                      </Label>
                      <select
                        id="vat-other"
                        value={otherTreatment}
                        onChange={(e) =>
                          setOtherTreatment(e.target.value as VatTreatment)
                        }
                        className="h-11 rounded-lg border border-[var(--fl-line)] bg-white px-2.5 text-sm text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
                      >
                        {OTHER_TREATMENTS.map((option) => (
                          <option key={option} value={option}>
                            {t.app.moneyArrived.treatments[TREATMENT_KEY[option]]}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {numeric && (
                  <div className="flex flex-col gap-1.5">
                    <Label className={labelClass}>{t.app.moneyArrived.includesQuestion}</Label>
                    <Segmented
                      name="vat-inclusion"
                      ariaLabel="btw inclusion"
                      value={includesVat ? "incl" : "excl"}
                      onChange={(v) => setIncludesVat(v === "incl")}
                      options={[
                        { value: "incl", label: t.app.moneyArrived.includesVat },
                        { value: "excl", label: t.app.moneyArrived.excludesVat },
                      ]}
                    />
                  </div>
                )}
                <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
                  {t.app.moneyArrived.vatExplainer}
                </p>
              </div>
            </details>

            <CurrencyField
              id="annual-profit"
              label={t.app.moneyArrived.profitLabel}
              hint={t.app.moneyArrived.profitHint}
              placeholder={t.app.moneyArrived.profitPlaceholder}
              leadingSymbol="€"
              value={annualProfit}
              onChange={setAnnualProfit}
            />

            <details className="rounded-lg border border-[var(--fl-line)] p-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
                {t.app.moneyArrived.extrasToggle}
              </summary>
              <div className="mt-4 flex flex-col gap-5">
                <CurrencyField
                  id="business-reserve"
                  label={t.app.moneyArrived.businessReserveLabel}
                  placeholder={t.app.moneyArrived.businessReservePlaceholder}
                  leadingSymbol="€"
                  value={businessReserve}
                  onChange={setBusinessReserve}
                />
                <CurrencyField
                  id="deductible-costs"
                  label={t.app.moneyArrived.deductibleLabel}
                  hint={t.app.moneyArrived.deductibleHint}
                  placeholder={t.app.moneyArrived.deductiblePlaceholder}
                  leadingSymbol="€"
                  value={deductibleCosts}
                  onChange={setDeductibleCosts}
                />
                <CurrencyField
                  id="payment-label"
                  label={t.app.moneyArrived.labelLabel}
                  placeholder={t.app.moneyArrived.labelPlaceholder}
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
              {fill(t.app.moneyArrived.saveHeading, { year: taxYear })}
            </h3>
            <p className={hintClass}>
              {t.app.moneyArrived.saveBody}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className={labelClass} htmlFor="payment-date">
                {t.app.moneyArrived.dateLabel}
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
                {t.app.moneyArrived.noteLabel}
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
                placeholder={t.app.moneyArrived.notePlaceholder}
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
              {saved
                ? t.common.actions.saved
                : fill(t.app.moneyArrived.saveButton, { year: taxYear })}
            </button>
          </div>
          {saved && (
            <p className="text-sm text-[var(--fl-slate)]">
              {fill(t.app.moneyArrived.savedConfirm, { year: taxYear })}
            </p>
          )}
        </div>
      )}

      {showDrift && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-[var(--fl-vat-fill)]/40 bg-[var(--fl-vat-tint)] px-6 py-5">
          <span className="text-sm text-[var(--fl-ink)]">
            {fill(t.app.moneyArrived.driftPrompt, {
              earned: formatEuro(totals.profitCents),
              projected: formatEuro(annualProfitCents ?? asCentsUnsafe(0)),
            })}
          </span>
          <button
            type="button"
            // Focus the field rather than filling it in. Setting the
            // projection to exactly what has been earned leaves the engine on
            // the same marginal fallback and the prompt still showing, so the
            // button would look broken. Only the user knows their real figure.
            onClick={() => {
              const field = document.getElementById("annual-profit");
              if (field instanceof HTMLInputElement) {
                field.focus();
                field.select();
                field.scrollIntoView({ block: "center", behavior: "smooth" });
              }
            }}
            className="min-h-9 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {t.app.moneyArrived.driftCta}
          </button>
        </div>
      )}

      {showMidYear && (
        <p className="rounded-2xl border border-dashed border-[var(--fl-line)] bg-white px-6 py-5 text-sm leading-relaxed text-[var(--fl-slate)]">
          {fill(t.app.moneyArrived.midYearPrompt, { year: taxYear })}
        </p>
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
            {t.app.moneyArrived.rememberNothing}
          </span>
          <button
            type="button"
            onClick={onPersonalize}
            className="min-h-9 font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {t.app.moneyArrived.saveMyDetails}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] px-6 py-5">
        <span className="text-sm text-[var(--fl-slate)]">
          {t.app.moneyArrived.crossLink}
        </span>
        <Link
          href="/tarief"
          className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          {t.app.moneyArrived.crossLinkCta}
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
  const t = useT();
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--fl-line)] bg-white p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
        {t.app.moneyArrived.strip.heading}
      </span>
      <div className="flex flex-col gap-2">
        <StripToggle
          active={meetsHours}
          onClick={() => onToggleHours(!meetsHours)}
          label={t.app.moneyArrived.strip.hours}
          effect={t.app.moneyArrived.strip.lowers}
        />
        <StripToggle
          active={isStarter}
          onClick={() => onToggleStarter(!isStarter)}
          label={t.app.moneyArrived.strip.starter}
          effect={t.app.moneyArrived.strip.lowers}
        />
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--fl-line)] px-3 text-left text-sm text-[var(--fl-ink)] hover:border-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            <span>
              {hasOtherIncome
                ? t.app.moneyArrived.strip.salaryHas
                : t.app.moneyArrived.strip.salaryNew}
            </span>
            <span className="shrink-0 text-xs text-[var(--fl-slate)]">
              {hasOtherIncome
                ? t.app.moneyArrived.strip.counted
                : t.app.moneyArrived.strip.raises}
            </span>
          </button>
        )}
      </div>
      <p className={hintClass}>
        {t.app.moneyArrived.strip.askedOnce}
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
  const t = useT();
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
        {active ? t.app.moneyArrived.strip.applied : effect}
      </span>
    </button>
  );
}

function buildResult(args: {
  t: Dictionary;
  locale: Locale;
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
      fill(args.t.app.moneyArrived.assumptions.deductible, {
        base: formatEuro(reserveBase),
        costs: formatEuro(deductible),
      })
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
      fill(args.t.app.moneyArrived.assumptions.share, {
        annual: formatEuro(engineReserve.annualLiabilityCents),
        pct: ratePercent ?? 0,
      })
    );
    assumptions.push(
      ...engineReserve.assumptions
        .slice(1)
        .map((line) => translateAssumption(args.locale, line))
    );
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
  const t = useT();
  const isShort = result.availableForPersonalPayoutCents < 0;
  const segments = [
    result.vatComponentCents
      ? {
          label: t.app.allocation.vat,
          cents: result.vatComponentCents,
          color: "var(--fl-vat-fill)",
        }
      : null,
    { label: t.app.allocation.reserve, cents: result.reserveCents, color: "var(--fl-reserve-fill)" },
    result.obligationsCents > 0
      ? {
          label: t.app.allocation.business,
          cents: result.obligationsCents,
          color: "var(--fl-costs-fill)",
        }
      : null,
    {
      label: t.app.allocation.personalPayout,
      cents: result.availableForPersonalPayoutCents,
      color: "var(--fl-payout-fill)",
    },
  ].filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <Card className={stageCardClass}>
      <CardContent className="flex flex-col gap-5 p-6">
        <dl className="flex flex-col gap-2">
          <Row label={t.app.moneyArrived.result.received} value={formatEuro(result.grossPaymentCents)} />
          {result.vatComponentCents !== null ? (
            <Row
              label={t.app.moneyArrived.result.vatIncluded}
              value={formatEuro(result.vatComponentCents)}
              muted
            />
          ) : (
            <p className="text-sm text-[var(--fl-slate)]">
              {result.vatExplanation}
            </p>
          )}
          <Row
            label={t.app.moneyArrived.result.reserve}
            value={formatEuro(result.reserveCents)}
            muted
          />
          {result.obligationsCents > 0 && (
            <Row
              label={t.app.moneyArrived.result.businessSetAside}
              value={formatEuro(result.obligationsCents)}
              muted
            />
          )}
        </dl>

        <div className="flex flex-col gap-1 border-t border-[var(--fl-line)] pt-4">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            {isShort
              ? t.app.moneyArrived.result.short
              : t.app.moneyArrived.result.available}
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
          resultLabel={t.app.moneyArrived.result.available}
          resultCents={result.availableForPersonalPayoutCents}
          reserveSourceNote={t.app.moneyArrived.result.reserveSourceNote}
        />

        {treatment !== "21" && treatment !== "9" && (
          <p className={hintClass}>{result.vatExplanation}</p>
        )}

        <div className="flex flex-col gap-2 border-t border-[var(--fl-line)] pt-4">
          {handled ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--fl-payout-text)]">
              <Check className="size-4" aria-hidden="true" />
              {t.app.moneyArrived.result.savedOnDevice}
            </p>
          ) : (
            <button type="button" onClick={onMarkHandled} className={primaryButtonClass}>
              {t.app.moneyArrived.result.markHandled}
            </button>
          )}
          <p className={hintClass}>
            {t.app.moneyArrived.result.movesMoneyNote}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SampleCard() {
  const t = useT();
  const segments = [
    {
      label: t.app.allocation.vat,
      cents: SAMPLE.allocation.vatComponentCents ?? asCentsUnsafe(0),
      color: "var(--fl-vat-fill)",
    },
    { label: t.app.allocation.reserve, cents: SAMPLE.allocation.reserveCents, color: "var(--fl-reserve-fill)" },
    {
      label: t.app.allocation.personalPayout,
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
            {fill(t.app.moneyArrived.sample.intro, {
              amount: formatEuro(toCents(1500)),
              profit: formatEuro(toCents(SAMPLE_ANNUAL_PROFIT)),
              rate:
                SAMPLE.ratePercent !== null
                  ? fill(t.app.moneyArrived.sample.rateNote, {
                      pct: SAMPLE.ratePercent,
                    })
                  : "",
            })}
          </p>
        </div>
        <dl className="flex flex-col gap-2">
          <Row label={t.app.moneyArrived.result.received} value={formatEuro(SAMPLE.allocation.grossPaymentCents)} />
          <Row
            label={t.app.moneyArrived.result.vatIncluded}
            value={formatEuro(SAMPLE.allocation.vatComponentCents ?? asCentsUnsafe(0))}
            muted
          />
          <Row
            label={t.app.moneyArrived.result.reserve}
            value={formatEuro(SAMPLE.allocation.reserveCents)}
            muted
          />
        </dl>
        <div className="flex flex-col gap-1 border-t border-[var(--fl-line)] pt-4">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            {t.app.moneyArrived.result.available}
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
