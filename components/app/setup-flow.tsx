"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyField, PercentField } from "@/components/app/fields";
import {
  cardClass,
  hintClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/app/styles";
import { asCentsUnsafe, parseAmountInput, parsePercentInput } from "@/lib/domain/money";
import type { ReserveMethod } from "@/lib/domain/reserves";
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

type ReserveMode = ReserveMethod["mode"];

export function SetupFlow({
  initial,
  onComplete,
  onCancel,
}: {
  initial: UserSetup | null;
  onComplete: (setup: UserSetup) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Step 1
  const [isEntrepreneurNL, setIsEntrepreneurNL] = useState(
    initial?.isEntrepreneurNL ?? true
  );
  const [vatRegistered, setVatRegistered] = useState(
    initial?.vatRegistered ?? true
  );
  const [participatesKOR, setParticipatesKOR] = useState(
    initial?.participatesKOR ?? false
  );
  const [treatments, setTreatments] = useState<VatTreatment[]>(
    initial?.commonVatTreatments ?? ["21"]
  );
  const [accountingSystem, setAccountingSystem] = useState<"invoice" | "cash">(
    initial?.accountingSystem ?? "invoice"
  );
  const [amountsInclusive, setAmountsInclusive] = useState(
    initial?.amountsDefaultInclusive ?? true
  );

  // Step 2
  const [reserveMode, setReserveMode] = useState<ReserveMode>(
    initial?.reserveMethod.mode ?? "own-rule"
  );
  const [ownPct, setOwnPct] = useState(
    initial?.reserveMethod.mode === "own-rule"
      ? String(initial.reserveMethod.percentage)
      : "30"
  );
  const [expectedRemaining, setExpectedRemaining] = useState("");
  const [alreadyPaid, setAlreadyPaid] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [annualCosts, setAnnualCosts] = useState("");

  // Step 3
  const [monthlyCosts, setMonthlyCosts] = useState(
    initial ? String(initial.essentialMonthlyBusinessCostsCents / 100) : ""
  );
  const [bufferMonths, setBufferMonths] = useState(initial?.bufferMonths ?? 2);
  const [personalMonthly, setPersonalMonthly] = useState("");
  const [recommendPayout, setRecommendPayout] = useState(
    initial?.recommendPersonalPayout ?? true
  );

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function toggleTreatment(t: VatTreatment) {
    setTreatments((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function buildReserveMethod(): ReserveMethod {
    if (reserveMode === "provisional-assessment") {
      return {
        mode: "provisional-assessment",
        expectedRemainingAnnualCents:
          parseAmountInput(expectedRemaining).cents ?? asCentsUnsafe(0),
        alreadyPaidOrReservedCents:
          parseAmountInput(alreadyPaid).cents ?? asCentsUnsafe(0),
      };
    }
    if (reserveMode === "guided-estimate") {
      return {
        mode: "guided-estimate",
        expectedAnnualRevenueExVatCents:
          parseAmountInput(annualRevenue).cents ?? asCentsUnsafe(0),
        expectedDeductibleCostsExVatCents:
          parseAmountInput(annualCosts).cents ?? asCentsUnsafe(0),
        alreadyReservedCents: asCentsUnsafe(0),
        alreadyPaidCents: asCentsUnsafe(0),
      };
    }
    return {
      mode: "own-rule",
      percentage: parsePercentInput(ownPct).value ?? 30,
    };
  }

  function finish() {
    const setup: UserSetup = {
      isEntrepreneurNL,
      vatRegistered,
      participatesKOR,
      commonVatTreatments: treatments.length > 0 ? treatments : ["21"],
      accountingSystem,
      amountsDefaultInclusive: amountsInclusive,
      reserveMethod: buildReserveMethod(),
      essentialMonthlyBusinessCostsCents:
        parseAmountInput(monthlyCosts).cents ?? asCentsUnsafe(0),
      bufferMonths,
      essentialMonthlyPersonalCents:
        parseAmountInput(personalMonthly).cents ?? undefined,
      recommendPersonalPayout: recommendPayout,
    };
    onComplete(setup);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className={hintClass}>Step {step + 1} of 3</p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-serif text-2xl font-medium text-[var(--fl-ink)] outline-none sm:text-3xl"
        >
          {step === 0 ? "Your business and VAT" : step === 1 ? "Your reserve method" : "Costs and buffer"}
        </h2>
      </div>

      <Card className={cardClass}>
        <CardContent className="flex flex-col gap-5 p-6">
          {step === 0 && (
            <>
              <YesNo label="Are you an entrepreneur or freelancer in the Netherlands?" value={isEntrepreneurNL} onChange={setIsEntrepreneurNL} />
              <YesNo label="Are you registered for VAT?" value={vatRegistered} onChange={setVatRegistered} />
              <YesNo label="Do you take part in the KOR (Small Businesses Scheme)?" value={participatesKOR} onChange={setParticipatesKOR} />
              <details className="-mt-2">
                <summary className="inline-flex min-h-9 cursor-pointer list-none items-center text-xs font-medium text-[var(--fl-slate)] hover:text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
                  What is the KOR? I&apos;m not sure
                </summary>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--fl-slate)]">
                  The KOR (Kleineondernemersregeling) is a Dutch small-business
                  scheme. If you joined it, you generally don&apos;t charge VAT or
                  file ordinary VAT returns. If you&apos;re registered for VAT and
                  send invoices with 21% or 9% on them, you&apos;re almost
                  certainly not on the KOR. When unsure, answer No. You can change
                  it later.
                </p>
              </details>
              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>Which VAT treatments do you commonly use?</Label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Common VAT treatments">
                  {TREATMENT_CHOICES.map((c) => (
                    <Chip key={c.v} active={treatments.includes(c.v)} onClick={() => toggleTreatment(c.v)}>
                      {c.l}
                    </Chip>
                  ))}
                </div>
                {treatments.includes("mixed-unsure") && (
                  <p className={hintClass}>
                    No problem. You can pick the correct treatment for each
                    payment when it arrives.
                  </p>
                )}
              </div>
              <ChoicePair
                label="Do you usually work with the invoice system or the cash system?"
                a={{ v: "invoice", l: "Invoice system" }}
                b={{ v: "cash", l: "Cash system" }}
                value={accountingSystem}
                onChange={setAccountingSystem}
              />
              <ChoicePair
                label="Are the amounts you enter usually inclusive or exclusive of VAT?"
                a={{ v: true, l: "Inclusive" }}
                b={{ v: false, l: "Exclusive" }}
                value={amountsInclusive}
                onChange={setAmountsInclusive}
              />
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Reserve method">
                <ReserveOption
                  active={reserveMode === "own-rule"}
                  onClick={() => setReserveMode("own-rule")}
                  title="My own reserve rule"
                  body="You choose a cautious percentage. Freelens applies it consistently, but this is not a calculation of your final tax assessment."
                />
                <ReserveOption
                  active={reserveMode === "provisional-assessment"}
                  onClick={() => setReserveMode("provisional-assessment")}
                  title="My provisional assessment"
                  body="Use the amount from your provisional assessment or tax adviser."
                />
                <ReserveOption
                  active={reserveMode === "guided-estimate"}
                  onClick={() => setReserveMode("guided-estimate")}
                  title="Simple guided estimate"
                  body="A cautious planning estimate from your expected revenue and costs. Not a calculation of your final assessment."
                />
              </div>

              {reserveMode === "own-rule" && (
                <PercentField id="own-pct" label="Reserve percentage" value={ownPct} onChange={setOwnPct} compact />
              )}
              {reserveMode === "provisional-assessment" && (
                <>
                  <CurrencyField id="prov-remaining" label="Expected remaining amount this year" placeholder="e.g. 6000" value={expectedRemaining} onChange={setExpectedRemaining} />
                  <CurrencyField id="prov-paid" label="Already paid or reserved" placeholder="e.g. 2000" value={alreadyPaid} onChange={setAlreadyPaid} />
                </>
              )}
              {reserveMode === "guided-estimate" && (
                <>
                  <CurrencyField id="gui-rev" label="Expected annual revenue (excl. VAT)" placeholder="e.g. 50000" value={annualRevenue} onChange={setAnnualRevenue} />
                  <CurrencyField id="gui-costs" label="Expected deductible costs (excl. VAT)" placeholder="e.g. 10000" value={annualCosts} onChange={setAnnualCosts} />
                  <p className={hintClass}>
                    Shown as a suggested reserve range, not tax owed. This is a
                    planning estimate, not a calculation of your final assessment.
                  </p>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <CurrencyField id="setup-monthly-costs" label="Essential monthly business costs" placeholder="e.g. 1200" value={monthlyCosts} onChange={setMonthlyCosts} hint="Rent, insurance, utilities, core subscriptions." />
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
              <CurrencyField id="setup-personal" label="Essential personal amount per month (optional)" placeholder="e.g. 2000" value={personalMonthly} onChange={setPersonalMonthly} />
              <YesNo label="Should Freelens suggest a personal payout?" value={recommendPayout} onChange={setRecommendPayout} />
              <p className={hintClass}>
                Freelens keeps three things separate: your business operating
                reserve, your personal salary or payout, and optional spending.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        {step === 0 ? (
          <button type="button" onClick={onCancel} className={linkButtonClass}>
            Skip for now
          </button>
        ) : (
          <button type="button" onClick={() => setStep((s) => s - 1)} className={secondaryButtonClass}>
            Back
          </button>
        )}
        {step < 2 ? (
          <button type="button" onClick={() => setStep((s) => s + 1)} className={primaryButtonClass}>
            Continue
          </button>
        ) : (
          <button type="button" onClick={finish} className={primaryButtonClass}>
            Finish setup
          </button>
        )}
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <ChoicePair label={label} a={{ v: true, l: "Yes" }} b={{ v: false, l: "No" }} value={value} onChange={onChange} />
  );
}

function ChoicePair<T extends string | boolean>({
  label,
  a,
  b,
  value,
  onChange,
}: {
  label: string;
  a: { v: T; l: string };
  b: { v: T; l: string };
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className={labelClass}>{label}</Label>
      <div className="flex gap-2" role="group" aria-label={label}>
        {[a, b].map((opt) => (
          <Chip key={String(opt.v)} active={value === opt.v} onClick={() => onChange(opt.v)}>
            {opt.l}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-w-12 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
          : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
      }`}
    >
      {children}
    </button>
  );
}

function ReserveOption({
  active,
  onClick,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition ${
        active
          ? "border-[var(--fl-ink)] bg-white shadow-sm"
          : "border-[var(--fl-line)] bg-white hover:border-[var(--fl-ink)]"
      }`}
    >
      <span className="text-sm font-semibold text-[var(--fl-ink)]">{title}</span>
      <span className="text-xs leading-relaxed text-[var(--fl-slate)]">{body}</span>
    </button>
  );
}
