"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AllocationBar } from "@/components/app/allocation-bar";
import { formatEuro, parseAmountInput, toCents } from "@/lib/domain/money";
import {
  EXAMPLE,
  EXAMPLE_TAX_YEAR,
  examplePaymentSplit,
} from "@/lib/domain/exampleScenario";
import { useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

/**
 * "A payment landed. What is actually mine?"
 *
 * The after-payment half of the homepage calculator. Ephemeral: it never reads
 * or writes the visitor's saved data, so the privacy claim two sections down
 * stays true on a page that computes real figures.
 *
 * Every number comes from `examplePaymentSplit`, which is the same engine and
 * the same scenario the illustrations further down use. Before that shared
 * module existed this component and the static sections disagreed about the
 * same payment by €544.
 */
export function PaymentSplit() {
  const t = useT();
  const e = t.home.heroExample;
  const [amount, setAmount] = useState(String(EXAMPLE.paymentGross));
  const [includesVat, setIncludesVat] = useState(true);

  const parsed = parseAmountInput(amount).cents;
  const entered =
    parsed !== null && parsed > 0 ? parsed : toCents(EXAMPLE.paymentGross);
  const split = examplePaymentSplit(entered, includesVat);

  const segments = [
    { label: t.app.allocation.vat, cents: split.vat, color: "var(--fl-vat-fill)" },
    { label: t.app.allocation.reserve, cents: split.reserve, color: "var(--fl-reserve-fill)" },
    { label: t.app.allocation.business, cents: split.business, color: "var(--fl-costs-fill)" },
    {
      label: t.app.allocation.personalPayout,
      cents: split.yours,
      color: "var(--fl-payout-fill)",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[var(--fl-ink)]" htmlFor="split-amount">
          {e.amountLabel}
        </Label>
        <Input
          id="split-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(ev) => setAmount(ev.target.value)}
          className="rounded-lg border border-[var(--fl-line)] bg-white"
        />
      </div>

      <div className="flex gap-2" role="group" aria-label={e.vatGroupLabel}>
        {[
          { v: true, l: e.includesVat },
          { v: false, l: e.excludesVat },
        ].map((opt) => (
          <button
            key={String(opt.v)}
            type="button"
            aria-pressed={includesVat === opt.v}
            onClick={() => setIncludesVat(opt.v)}
            className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
              includesVat === opt.v
                ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
            }`}
          >
            {opt.l}
          </button>
        ))}
      </div>

      <dl className="flex flex-col gap-2 border-t border-[var(--fl-line)] pt-5">
        <Line label={e.received} value={formatEuro(split.gross)} strong />
        <Line label={e.vatIncluded} value={formatEuro(split.vat)} />
        <Line label={e.reserve} value={formatEuro(split.reserve)} />
        <Line label={e.business} value={formatEuro(split.business)} />
      </dl>

      <div className="flex flex-col gap-1 border-t border-[var(--fl-line)] pt-5">
        <span className="text-sm font-medium text-[var(--fl-slate)]">{e.available}</span>
        <span className="fl-tnum font-serif text-4xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-5xl">
          {formatEuro(split.yours)}
        </span>
      </div>

      <AllocationBar segments={segments} caption={t.app.allocation.caption} />

      <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
        {fill(e.note, {
          rate: EXAMPLE.vatRate,
          year: EXAMPLE_TAX_YEAR,
          profit: formatEuro(toCents(EXAMPLE.annualProfit)),
          costs: formatEuro(toCents(EXAMPLE.businessCosts)),
          // The share actually held back. This used to print the marginal rate
          // (39,1%) directly above a reserve worth 13,4% of the payment.
          rateNote:
            split.reserveSharePercent !== null
              ? fill(e.rateNote, { pct: split.reserveSharePercent })
              : "",
        })}
      </p>
    </div>
  );
}

function Line({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt
        className={
          strong
            ? "text-sm font-medium text-[var(--fl-ink)]"
            : "text-sm text-[var(--fl-slate)]"
        }
      >
        {label}
      </dt>
      <dd className="fl-tnum text-sm text-[var(--fl-ink)]">{value}</dd>
    </div>
  );
}
