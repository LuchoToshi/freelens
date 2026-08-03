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

const TREATMENT_CHOICES: { v: VatTreatment; l: string }[] = [
  { v: "21", l: "21%" },
  { v: "9", l: "9%" },
  { v: "0", l: "0%" },
  { v: "exempt", l: "Exempt" },
  { v: "reverse-charged", l: "Reverse-charged" },
  { v: "kor", l: "KOR" },
  { v: "mixed-unsure", l: "Mixed / unsure" },
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
        None of this is required. The calculator works without it, and says on
        every result which defaults it used. Filling this in makes the number
        yours instead of typical.
      </p>

      <Section title="Your year">
        {splitCosts ? (
          <>
            <CurrencyField
              id="set-revenue"
              label="Expected revenue this year (excl. btw)"
              placeholder="e.g. 55000"
              leadingSymbol="€"
              value={revenue}
              onChange={setRevenue}
            />
            <CurrencyField
              id="set-costs"
              label="Expected business costs this year (excl. btw)"
              placeholder="e.g. 15000"
              leadingSymbol="€"
              value={costs}
              onChange={setCosts}
            />
          </>
        ) : (
          <CurrencyField
            id="set-profit"
            label="Expected profit this year"
            hint="Revenue excluding btw, minus your business costs. A rough figure is fine; you can change it whenever the year changes."
            placeholder="e.g. 40000"
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
          {splitCosts
            ? "Enter one profit figure instead"
            : "Enter revenue and costs separately"}
        </button>
      </Section>

      <Section title="Deductions you qualify for">
        <YesNo
          label="Do you spend at least 1.225 hours a year on your business?"
          hint="The urencriterium. Meeting it unlocks the zelfstandigenaftrek, which lowers what you owe. Roughly 24 hours a week across a full year."
          value={meetsHours}
          onChange={setMeetsHours}
        />
        <YesNo
          label="Were you not an entrepreneur in one or more of the last five years?"
          hint="If so you may qualify for the startersaftrek, an extra deduction for up to three of your first five years."
          value={isStarter}
          onChange={setIsStarter}
        />
      </Section>

      <Section title="Other income">
        <CurrencyField
          id="set-other-income"
          label="Salary or benefits this year, before tax"
          hint="Leave blank if the business is your only income. Other income raises the bracket your freelance profit lands in."
          placeholder="e.g. 30000"
          leadingSymbol="€"
          value={otherIncome}
          onChange={setOtherIncome}
        />
        {hasOtherIncome && (
          <CurrencyField
            id="set-withheld"
            label="Tax your employer already withheld this year"
            hint="The loonheffing on your payslip or jaaropgaaf. You have already paid this, so Freelens will not ask you to set it aside again. Leave blank if you are not sure and the estimate stays on the cautious side."
            placeholder="e.g. 2250"
            leadingSymbol="€"
            value={withheld}
            onChange={setWithheld}
          />
        )}
      </Section>

      <Section title="Defaults for new payments">
        <div className="flex flex-col gap-1.5">
          <Label className={labelClass}>btw you usually charge</Label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Usual VAT treatments">
            {TREATMENT_CHOICES.map((t) => (
              <Chip
                key={t.v}
                active={treatments.includes(t.v)}
                onClick={() => toggleTreatment(t.v)}
              >
                {t.l}
              </Chip>
            ))}
          </div>
          <p className={hintClass}>
            The first one you pick prefills the calculator. You can change it on
            any individual payment.
          </p>
        </div>
        <YesNo
          label="Are the amounts you type usually inclusive of btw?"
          hint="Money landing in your bank account normally includes btw, so this is usually yes."
          value={amountsInclusive}
          onChange={setAmountsInclusive}
        />
      </Section>

      <Section title="For the weekly check-in">
        <CurrencyField
          id="set-monthly-costs"
          label="Essential monthly business costs"
          hint="Rent, insurance, utilities, core subscriptions."
          placeholder="e.g. 1200"
          leadingSymbol="€"
          value={monthlyCosts}
          onChange={setMonthlyCosts}
        />
        <div className="flex flex-col gap-1.5">
          <Label className={labelClass}>Business buffer, in months</Label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Buffer months">
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
          Back without saving
        </button>
        <button type="button" onClick={save} className={primaryButtonClass}>
          Save settings
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
  return (
    <div className="flex flex-col gap-1.5">
      <Label className={labelClass}>{label}</Label>
      <div className="flex gap-2" role="group" aria-label={label}>
        <Chip active={value} onClick={() => onChange(true)}>
          Yes
        </Chip>
        <Chip active={!value} onClick={() => onChange(false)}>
          No
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
