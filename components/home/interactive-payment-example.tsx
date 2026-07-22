"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AllocationBar } from "@/components/app/allocation-bar";
import { ExampleBadge } from "@/components/example-badge";
import {
  asCentsUnsafe,
  formatEuro,
  parseAmountInput,
  toCents,
  type Cents,
} from "@/lib/domain/money";
import { resolvePaymentVat } from "@/lib/domain/vat";
import { allocatePayment } from "@/lib/domain/allocation";

// Example assumptions, shown explicitly. This demo is ephemeral — it never
// reads or writes the visitor's saved data.
const EXAMPLE_VAT_RATE = "21";
const EXAMPLE_RESERVE_PCT = 30;

function allocate(grossCents: Cents, includesVat: boolean) {
  const vat = resolvePaymentVat(grossCents, EXAMPLE_VAT_RATE, includesVat);
  const gross = includesVat ? grossCents : (asCentsUnsafe(grossCents + (vat.vatCents ?? 0)));
  return allocatePayment({
    grossPaymentCents: gross,
    vat,
    reserve: {
      cents: asCentsUnsafe((vat.netCents * EXAMPLE_RESERVE_PCT) / 100),
      source: "own-rule",
    },
    obligations: [],
    bufferCents: asCentsUnsafe(0),
  });
}

export function InteractivePaymentExample() {
  const [amount, setAmount] = useState("2500");
  const [includesVat, setIncludesVat] = useState(true);

  const parsed = parseAmountInput(amount).cents;
  const grossCents = parsed !== null && parsed > 0 ? parsed : toCents(2500);
  const result = allocate(grossCents, includesVat);

  const segments = [
    result.vatComponentCents
      ? { label: "VAT", cents: result.vatComponentCents, color: "var(--fl-vat-fill)" }
      : null,
    { label: "Tax reserve", cents: result.reserveCents, color: "var(--fl-reserve-fill)" },
    {
      label: "Personal payout",
      cents: result.availableForPersonalPayoutCents,
      color: "var(--fl-payout-fill)",
    },
  ].filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <div className="rounded-2xl border border-[var(--fl-line)] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center gap-2">
        <ExampleBadge />
        <span className="text-xs text-[var(--fl-slate)]">
          Example uses {EXAMPLE_VAT_RATE}% VAT and a {EXAMPLE_RESERVE_PCT}% reserve.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[var(--fl-ink)]" htmlFor="hero-amount">
          How much did you receive?
        </Label>
        <Input
          id="hero-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-[var(--fl-line)] bg-white"
        />
      </div>

      <div className="mt-3 flex gap-2" role="group" aria-label="VAT inclusion">
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

      <dl className="mt-6 flex flex-col gap-2 border-t border-[var(--fl-line)] pt-5">
        <Line label="Payment received" value={formatEuro(result.grossPaymentCents)} strong />
        <Line
          label="VAT included in this payment"
          value={formatEuro(result.vatComponentCents ?? asCentsUnsafe(0))}
        />
        <Line
          label="Income tax and Zvw reserve"
          value={formatEuro(result.reserveCents)}
        />
      </dl>

      <div className="mt-5 flex flex-col gap-1 border-t border-[var(--fl-line)] pt-5">
        <span className="text-sm font-medium text-[var(--fl-slate)]">
          May be available to pay yourself
        </span>
        <span className="font-serif text-4xl font-medium tracking-tight tabular-nums text-[var(--fl-ink)] sm:text-5xl">
          {formatEuro(result.availableForPersonalPayoutCents)}
        </span>
      </div>

      <div className="mt-5">
        <AllocationBar segments={segments} />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--fl-slate)]">
        A planning estimate, not a tax assessment. The real tool uses your own
        VAT treatment and reserve rules. Your numbers stay on your device.
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
      <dt className={strong ? "text-sm font-medium text-[var(--fl-ink)]" : "text-sm text-[var(--fl-slate)]"}>
        {label}
      </dt>
      <dd className="font-mono text-sm tabular-nums text-[var(--fl-ink)]">{value}</dd>
    </div>
  );
}
