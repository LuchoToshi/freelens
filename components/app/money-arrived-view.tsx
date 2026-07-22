"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyField, PercentField } from "@/components/app/fields";
import { AllocationBar } from "@/components/app/allocation-bar";
import { WhyThisNumber } from "@/components/app/why-this-number";
import { DisclaimerNote } from "@/components/disclaimer-note";
import { ExampleBadge } from "@/components/example-badge";
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

export function MoneyArrivedView({
  setup,
  onHandled,
}: {
  setup: UserSetup | null;
  onHandled: (allocation: StoredAllocation) => void;
}) {
  const defaultTreatment: VatTreatment = setup?.commonVatTreatments?.[0] ?? "21";
  const defaultPct =
    setup?.reserveMethod.mode === "own-rule"
      ? String(setup.reserveMethod.percentage)
      : "30";

  const [amount, setAmount] = useState("");
  const [includesVat, setIncludesVat] = useState(
    setup?.amountsDefaultInclusive ?? true
  );
  const [treatment, setTreatment] = useState<VatTreatment>(defaultTreatment);
  const [reservePct, setReservePct] = useState(defaultPct);
  const [businessReserve, setBusinessReserve] = useState("");
  const [deductibleCosts, setDeductibleCosts] = useState("");
  const [label, setLabel] = useState("");
  const [handled, setHandled] = useState(false);

  const amountCents = parseAmountInput(amount).cents;
  const hasAmount = amountCents !== null && amountCents > 0;

  const result: PaymentAllocationResult | null = hasAmount
    ? buildResult({
        amountCents,
        includesVat,
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
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)] sm:text-3xl">
          Money arrived
        </h2>
        <p className={hintClass}>Give every euro a job before it feels available.</p>
      </div>

      <Card className={cardClass}>
        <CardContent className="flex flex-col gap-5 p-6">
          <CurrencyField
            id="payment-amount"
            label="How much did you receive?"
            placeholder="e.g. 1500"
            value={amount}
            onChange={(v) => {
              setAmount(v);
              setHandled(false);
            }}
          />

          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Does this amount include VAT?</Label>
            <div className="flex gap-2" role="group" aria-label="VAT inclusion">
              {[
                { v: true, l: "Includes VAT" },
                { v: false, l: "Excludes VAT" },
              ].map((opt) => (
                <button
                  key={String(opt.v)}
                  type="button"
                  aria-pressed={includesVat === opt.v}
                  onClick={() => setIncludesVat(opt.v)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    includesVat === opt.v
                      ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                      : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className={labelClass} htmlFor="vat-treatment">
              VAT treatment
            </Label>
            <select
              id="vat-treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value as VatTreatment)}
              className="h-9 rounded-lg border border-[var(--fl-line)] bg-white px-2.5 text-sm text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)]"
            >
              {(Object.keys(TREATMENT_LABELS) as VatTreatment[]).map((t) => (
                <option key={t} value={t}>
                  {TREATMENT_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <PercentField
            id="reserve-pct"
            label="Income tax and Zvw reserve (%)"
            hint="A cautious percentage of this payment to set aside. A planning rule, not your final assessment."
            value={reservePct}
            onChange={setReservePct}
            compact
          />

          <CurrencyField
            id="business-reserve"
            label="Set aside for business costs (optional)"
            placeholder="e.g. 500"
            value={businessReserve}
            onChange={setBusinessReserve}
          />

          <CurrencyField
            id="deductible-costs"
            label="Deductible costs linked to this payment (optional)"
            hint="Lowers the amount your reserve percentage applies to. This does not change VAT — your VAT return may differ after input VAT."
            placeholder="e.g. 200"
            value={deductibleCosts}
            onChange={setDeductibleCosts}
          />

          <CurrencyField
            id="payment-label"
            label="Label (optional)"
            placeholder="e.g. Client X invoice"
            value={label}
            onChange={setLabel}
          />
        </CardContent>
      </Card>

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
    <Card className={cardClass}>
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
            {isShort ? "This payment doesn't cover your set-asides" : "Available for personal payout"}
          </span>
          <span
            className={`font-serif text-4xl font-medium tracking-tight tabular-nums sm:text-5xl ${
              isShort ? "text-[var(--fl-short-text)]" : "text-[var(--fl-ink)]"
            }`}
          >
            {formatEuro(result.availableForPersonalPayoutCents)}
          </span>
        </div>

        <AllocationBar segments={segments} />

        <WhyThisNumber
          steps={result.breakdown}
          resultLabel="Available for personal payout"
          resultCents={result.availableForPersonalPayoutCents}
          reserveSourceNote="Reserve based on the percentage you set (a planning rule, not a tax assessment)."
        />

        {treatment !== "21" && treatment !== "9" && (
          <p className={hintClass}>{result.vatExplanation}</p>
        )}

        <div className="flex flex-col gap-2 border-t border-[var(--fl-line)] pt-4">
          {handled ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--fl-good-text)]">
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
      color: "var(--fl-tight-text)",
    },
    { label: "Reserve", cents: SAMPLE.reserveCents, color: "var(--fl-reserve-fill)" },
    {
      label: "Personal payout",
      cents: SAMPLE.availableForPersonalPayoutCents,
      color: "var(--fl-payout-fill)",
    },
  ];
  return (
    <Card className={cardClass}>
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
            Available for personal payout
          </span>
          <span className="font-serif text-3xl font-medium tracking-tight tabular-nums text-[var(--fl-ink)] sm:text-4xl">
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
      <dd className="font-mono text-sm tabular-nums text-[var(--fl-ink)]">
        {value}
      </dd>
    </div>
  );
}
