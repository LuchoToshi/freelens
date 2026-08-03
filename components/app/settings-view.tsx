"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyField } from "@/components/app/fields";
import {
  cardClass,
  hintClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
} from "@/components/app/styles";
import { asCentsUnsafe, parseAmountInput } from "@/lib/domain/money";
import type { ReserveMethod } from "@/lib/domain/reserves";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
import type { VatTreatment } from "@/lib/domain/vat";
import type { UserSetup } from "@/lib/domain/persistence";
import { useT } from "@/components/i18n/locale-provider";
import type { Dictionary } from "@/lib/i18n";

type TreatmentKey = keyof Dictionary["app"]["settings"]["treatments"];

const TREATMENT_CHOICES: { v: VatTreatment; k: TreatmentKey }[] = [
  { v: "21", k: "21" },
  { v: "9", k: "9" },
  { v: "0", k: "0" },
  { v: "exempt", k: "exempt" },
  { v: "reverse-charged", k: "reverseCharged" },
  { v: "kor", k: "kor" },
  { v: "mixed-unsure", k: "mixedUnsure" },
];

function centsToInput(cents: number): string {
  return cents === 0 ? "" : String(cents / 100);
}

/**
 * The one-time profile, in one page.
 *
 * This replaced a three-step wizard that asked eleven questions before showing
 * anything, six of which nothing read. Nothing here is required: the calculator
 * works from two fields on its own screen and every setting below has a
 * default that the result states out loud.
 */
export function SettingsView({
  initial,
  onSave,
  onCancel,
}: {
  initial: UserSetup | null;
  onSave: (setup: UserSetup) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const guided =
    initial?.reserveMethod.mode === "guided-estimate" ? initial.reserveMethod : null;

  const storedProfit = guided
    ? guided.expectedAnnualRevenueExVatCents - guided.expectedDeductibleCostsExVatCents
    : 0;
  const storedCosts = guided?.expectedDeductibleCostsExVatCents ?? 0;

  // Profit is the single number the engine needs. The revenue/costs split is
  // offered for people who think that way, and collapses back to the same
  // profit either way.
  const [splitCosts, setSplitCosts] = useState(storedCosts > 0);
  const [profit, setProfit] = useState(centsToInput(storedProfit));
  const [revenue, setRevenue] = useState(
    centsToInput(guided?.expectedAnnualRevenueExVatCents ?? 0)
  );
  const [costs, setCosts] = useState(centsToInput(storedCosts));

  const [meetsHours, setMeetsHours] = useState(guided?.meetsHoursCriterion ?? false);
  const [isStarter, setIsStarter] = useState(guided?.isStarter ?? false);
  const [otherIncome, setOtherIncome] = useState(
    centsToInput(guided?.otherIncomeCents ?? 0)
  );
  const [withheld, setWithheld] = useState(
    centsToInput(guided?.otherIncomeTaxWithheldCents ?? 0)
  );

  const [treatments, setTreatments] = useState<VatTreatment[]>(
    initial?.commonVatTreatments ?? ["21"]
  );
  const [amountsInclusive, setAmountsInclusive] = useState(
    initial?.amountsDefaultInclusive ?? true
  );
  const [monthlyCosts, setMonthlyCosts] = useState(
    centsToInput(initial?.essentialMonthlyBusinessCostsCents ?? 0)
  );
  const [bufferMonths, setBufferMonths] = useState(initial?.bufferMonths ?? 2);

  const hasOtherIncome = (parseAmountInput(otherIncome).cents ?? 0) > 0;

  function toggleTreatment(t: VatTreatment) {
    setTreatments((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function buildReserveMethod(): ReserveMethod {
    const revenueCents = splitCosts
      ? (parseAmountInput(revenue).cents ?? asCentsUnsafe(0))
      : (parseAmountInput(profit, { allowNegative: true }).cents ?? asCentsUnsafe(0));
    const costsCents = splitCosts
      ? (parseAmountInput(costs).cents ?? asCentsUnsafe(0))
      : asCentsUnsafe(0);
    return {
      mode: "guided-estimate",
      // Pinned so a saved estimate keeps calculating against the year it was
      // made for, even after the calendar rolls over.
      taxYear: latestProfileYear(DEFAULT_COUNTRY) ?? 0,
      country: DEFAULT_COUNTRY,
      expectedAnnualRevenueExVatCents: revenueCents,
      expectedDeductibleCostsExVatCents: costsCents,
      meetsHoursCriterion: meetsHours,
      isStarter,
      otherIncomeCents: hasOtherIncome
        ? (parseAmountInput(otherIncome).cents ?? asCentsUnsafe(0))
        : asCentsUnsafe(0),
      otherIncomeTaxWithheldCents: hasOtherIncome
        ? (parseAmountInput(withheld).cents ?? asCentsUnsafe(0))
        : asCentsUnsafe(0),
      alreadyReservedCents: asCentsUnsafe(0),
      alreadyPaidCents: asCentsUnsafe(0),
    };
  }

  function save() {
    onSave({
      commonVatTreatments: treatments.length > 0 ? treatments : ["21"],
      amountsDefaultInclusive: amountsInclusive,
      reserveMethod: buildReserveMethod(),
      essentialMonthlyBusinessCostsCents:
        parseAmountInput(monthlyCosts).cents ?? asCentsUnsafe(0),
      bufferMonths,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-xl text-sm leading-relaxed text-[var(--fl-slate)]">
        {t.app.settings.intro}
      </p>

      <Section title={t.app.settings.sections.year}>
        {splitCosts ? (
          <>
            <CurrencyField
              id="set-revenue"
              label={t.app.settings.revenueLabel}
              placeholder={t.app.settings.revenuePlaceholder}
              leadingSymbol="€"
              value={revenue}
              onChange={setRevenue}
            />
            <CurrencyField
              id="set-costs"
              label={t.app.settings.costsLabel}
              placeholder={t.app.settings.costsPlaceholder}
              leadingSymbol="€"
              value={costs}
              onChange={setCosts}
            />
          </>
        ) : (
          <CurrencyField
            id="set-profit"
            label={t.app.settings.profitLabel}
            hint={t.app.settings.profitHint}
            placeholder={t.app.settings.profitPlaceholder}
            leadingSymbol="€"
            value={profit}
            onChange={setProfit}
          />
        )}
        <button
          type="button"
          onClick={() => setSplitCosts((v) => !v)}
          className={`${linkButtonClass} w-fit`}
        >
          {splitCosts ? t.app.settings.splitOn : t.app.settings.splitOff}
        </button>
      </Section>

      <Section title={t.app.settings.sections.deductions}>
        <YesNo
          label={t.app.settings.hoursLabel}
          hint={t.app.settings.hoursHint}
          value={meetsHours}
          onChange={setMeetsHours}
        />
        <YesNo
          label={t.app.settings.starterLabel}
          hint={t.app.settings.starterHint}
          value={isStarter}
          onChange={setIsStarter}
        />
      </Section>

      <Section title={t.app.settings.sections.otherIncome}>
        <CurrencyField
          id="set-other-income"
          label={t.app.settings.otherIncomeLabel}
          hint={t.app.settings.otherIncomeHint}
          placeholder={t.app.settings.otherIncomePlaceholder}
          leadingSymbol="€"
          value={otherIncome}
          onChange={setOtherIncome}
        />
        {hasOtherIncome && (
          <CurrencyField
            id="set-withheld"
            label={t.app.settings.withheldLabel}
            hint={t.app.settings.withheldHint}
            placeholder={t.app.settings.withheldPlaceholder}
            leadingSymbol="€"
            value={withheld}
            onChange={setWithheld}
          />
        )}
      </Section>

      <Section title={t.app.settings.sections.paymentDefaults}>
        <div className="flex flex-col gap-1.5">
          <Label className={labelClass}>{t.app.settings.vatLabel}</Label>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.app.settings.vatGroupLabel}>
            {TREATMENT_CHOICES.map((choice) => (
              <Chip
                key={choice.v}
                active={treatments.includes(choice.v)}
                onClick={() => toggleTreatment(choice.v)}
              >
                {t.app.settings.treatments[choice.k]}
              </Chip>
            ))}
          </div>
          <p className={hintClass}>
            {t.app.settings.vatHint}
          </p>
        </div>
        <YesNo
          label={t.app.settings.inclusiveLabel}
          hint={t.app.settings.inclusiveHint}
          value={amountsInclusive}
          onChange={setAmountsInclusive}
        />
      </Section>

      <Section title={t.app.settings.sections.weekly}>
        <CurrencyField
          id="set-monthly-costs"
          label={t.app.settings.monthlyCostsLabel}
          hint={t.app.settings.monthlyCostsHint}
          placeholder={t.app.settings.monthlyCostsPlaceholder}
          leadingSymbol="€"
          value={monthlyCosts}
          onChange={setMonthlyCosts}
        />
        <div className="flex flex-col gap-1.5">
          <Label className={labelClass}>{t.app.settings.bufferLabel}</Label>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.app.settings.bufferGroupLabel}>
            {[1, 2, 3, 6].map((m) => (
              <Chip key={m} active={bufferMonths === m} onClick={() => setBufferMonths(m)}>
                {m}
              </Chip>
            ))}
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onCancel} className={linkButtonClass}>
          {t.app.settings.backWithoutSaving}
        </button>
        <button type="button" onClick={save} className={primaryButtonClass}>
          {t.app.settings.saveSettings}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className={cardClass}>
      <CardContent className="flex flex-col gap-5 p-6">
        <h2 className="font-serif text-lg font-medium text-[var(--fl-ink)]">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function YesNo({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1.5">
      <Label className={labelClass}>{label}</Label>
      <div className="flex gap-2" role="group" aria-label={label}>
        <Chip active={value} onClick={() => onChange(true)}>
          {t.app.settings.yes}
        </Chip>
        <Chip active={!value} onClick={() => onChange(false)}>
          {t.app.settings.no}
        </Chip>
      </div>
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-lg border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
        active
          ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
          : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)]"
      }`}
    >
      {children}
    </button>
  );
}
