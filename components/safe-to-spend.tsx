"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateInvoiceSplit,
  calculateSafeToSpend,
  formatBufferNote,
  formatEuro,
  getMonthStatus,
  getStatusReason,
  roundToNearest,
  type MonthStatus,
} from "@/lib/calc";

const STORAGE_KEY = "freelens.safe-to-spend.v1";
const DESKTOP_QUERY = "(min-width: 1024px)";
const NUMBER_PATTERN = /^-?\d+([.,]\d+)?$/;
const BELASTINGDIENST_MKB_URL =
  "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/mkb_winstvrijstelling";

interface StoredInputs {
  balance: string;
  monthlyEssentialCosts: string;
  taxReservePercent: string;
  bufferMonths: string;
  incomeThisYear: string;
  invoiceAmount: string;
}

const DEFAULT_INPUTS: StoredInputs = {
  balance: "",
  monthlyEssentialCosts: "",
  taxReservePercent: "30",
  bufferMonths: "2",
  incomeThisYear: "",
  invoiceAmount: "",
};

function toNumber(value: string): number {
  const trimmed = value.trim().replace(",", ".");
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fieldError(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  return NUMBER_PATTERN.test(trimmed) ? null : "Enter a number, e.g. 1500 or 1500.50";
}

const labelClass = "font-mono text-xs font-black uppercase";
const hintClass = "text-xs font-semibold text-[#4a4334]";
const errorClass = "font-mono text-xs font-bold text-red-600";
const inputClass =
  "rounded-none border-2 border-black bg-[#fbf8eb] font-mono focus-visible:ring-[#0057ff]";

const STATUS_COPY: Record<MonthStatus, { label: string; cardBg: string }> = {
  good: { label: "Healthy", cardBg: "bg-[#e3f7d4]" },
  tight: { label: "Borderline", cardBg: "bg-[#f2dc78]" },
  short: { label: "Tight", cardBg: "bg-[#f7d9d9]" },
};

function FormulaTerm({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-base font-black">{value}</span>
      <span className="font-semibold uppercase text-[#4a4334]">{label}</span>
    </div>
  );
}

function FormulaOperator({ symbol }: { symbol: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-base font-black">{symbol}</span>
      <span aria-hidden="true" className="invisible text-xs font-semibold">
        .
      </span>
    </div>
  );
}

export function SafeToSpend() {
  const [inputs, setInputs] = useState<StoredInputs>(DEFAULT_INPUTS);
  const [hydrated, setHydrated] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mode, setMode] = useState<"monthly" | "invoice">("monthly");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Deliberate one-time sync from localStorage post-mount: rendering
      // DEFAULT_INPUTS first keeps server/client markup identical and avoids
      // a hydration mismatch, so this can't be a lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputs({ ...DEFAULT_INPUTS, ...JSON.parse(stored) });
    }
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      setAdvancedOpen(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs, hydrated]);

  const balance = toNumber(inputs.balance);
  const monthlyEssentialCosts = toNumber(inputs.monthlyEssentialCosts);
  const taxReservePercent = toNumber(inputs.taxReservePercent);
  const bufferMonths = toNumber(inputs.bufferMonths);

  const hasValidIncome =
    inputs.incomeThisYear.trim() !== "" && fieldError(inputs.incomeThisYear) === null;
  const incomeThisYear = toNumber(inputs.incomeThisYear);
  const taxBase = hasValidIncome ? incomeThisYear : balance;

  const { taxReserve, buffer, safeToSpend } = calculateSafeToSpend({
    balance,
    monthlyEssentialCosts,
    taxReservePercent,
    bufferMonths,
    taxBase,
  });

  const hasCoreInputs =
    inputs.balance.trim() !== "" &&
    inputs.monthlyEssentialCosts.trim() !== "" &&
    fieldError(inputs.balance) === null &&
    fieldError(inputs.monthlyEssentialCosts) === null;

  const monthStatus = getMonthStatus(safeToSpend, monthlyEssentialCosts);
  const statusReason = getStatusReason(monthStatus, safeToSpend, monthlyEssentialCosts);
  const bufferNote = formatBufferNote(buffer, bufferMonths);
  const roundedSafeToSpend = roundToNearest(safeToSpend);

  const hasValidInvoice =
    inputs.invoiceAmount.trim() !== "" && fieldError(inputs.invoiceAmount) === null;
  const invoiceAmount = toNumber(inputs.invoiceAmount);
  const invoiceSplit = calculateInvoiceSplit(invoiceAmount, taxReservePercent);

  function updateField(field: keyof StoredInputs) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputs((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  return (
    <main className="min-h-screen bg-[#f6f1df] text-[#101010]">
      <div className="relative isolate mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="absolute inset-0 -z-10 opacity-12 [background-image:linear-gradient(#101010_1px,transparent_1px),linear-gradient(90deg,#101010_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="flex flex-col gap-3 border-4 border-black bg-[#f2dc78] px-5 py-5 shadow-[8px_8px_0_#101010]">
          <div className="flex w-fit items-center border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black uppercase shadow-[3px_3px_0_#101010]">
            NL-ZZP cash clarity
          </div>
          <h1 className="font-mono text-4xl font-black uppercase leading-none tracking-normal sm:text-6xl">
            Freelens
          </h1>
          <p className="max-w-xl text-base font-semibold leading-7">
            What can you safely spend this month as a Dutch freelancer or
            ZZP&apos;er?
          </p>
        </div>

        <Card className="rounded-none border-4 border-black bg-white shadow-[8px_8px_0_#101010]">
          <CardHeader className="border-b-4 border-black">
            <CardTitle className="font-mono text-xl font-black uppercase">
              Your numbers
            </CardTitle>
            <CardDescription className="text-[#4a4334]">
              Everything stays on your own device.
            </CardDescription>
            <p className={hintClass}>
              If you&apos;re unsure about exact balances, use reasonable
              estimates. You can update anytime.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-col gap-1.5">
              <Label className={labelClass} htmlFor="balance">
                Bank balance (rough estimate is fine)
              </Label>
              <Input
                id="balance"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 4000"
                value={inputs.balance}
                onChange={updateField("balance")}
                className={inputClass}
              />
              <p className={hintClass}>
                Use the balance you see in your banking app; a close estimate
                works.
              </p>
              <p className={hintClass}>
                Don&apos;t know it? Open your banking app and come back—your
                data stays on this device.
              </p>
              {fieldError(inputs.balance) && (
                <p className={errorClass}>{fieldError(inputs.balance)}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className={labelClass} htmlFor="monthly-costs">
                Average fixed monthly costs
              </Label>
              <Input
                id="monthly-costs"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 2200"
                value={inputs.monthlyEssentialCosts}
                onChange={updateField("monthlyEssentialCosts")}
                className={inputClass}
              />
              <p className={hintClass}>
                Include essential personal and business costs you must pay
                each month (for example rent, insurance, utilities, core
                subscriptions).
              </p>
              {fieldError(inputs.monthlyEssentialCosts) && (
                <p className={errorClass}>
                  {fieldError(inputs.monthlyEssentialCosts)}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAdvancedOpen((open) => !open)}
              aria-expanded={advancedOpen}
              aria-controls="advanced-fields"
              className="flex w-fit items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-black uppercase shadow-[3px_3px_0_#101010] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#101010]"
            >
              Advanced
              {advancedOpen ? (
                <ChevronUp className="size-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-3.5" aria-hidden="true" />
              )}
            </button>

            {advancedOpen && (
              <div id="advanced-fields" className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass} htmlFor="tax-reserve">
                    Tax reserve (%)
                  </Label>
                  <Input
                    id="tax-reserve"
                    type="text"
                    inputMode="decimal"
                    value={inputs.taxReservePercent}
                    onChange={updateField("taxReservePercent")}
                    className={inputClass}
                  />
                  <p className={hintClass}>
                    Percentage of profit you set aside for tax.
                  </p>
                  <p className={hintClass}>
                    Many ZZP&apos;ers reserve 25–40% of profit for income tax
                    and Zvw combined; 30% is a common, cautious default for
                    2026 rates.{" "}
                    <a
                      href={BELASTINGDIENST_MKB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Source: Belastingdienst
                    </a>
                    .
                  </p>
                  {fieldError(inputs.taxReservePercent) && (
                    <p className={errorClass}>
                      {fieldError(inputs.taxReservePercent)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass} htmlFor="income-this-year">
                    Estimated taxable income this year (optional)
                  </Label>
                  <Input
                    id="income-this-year"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 40000"
                    value={inputs.incomeThisYear}
                    onChange={updateField("incomeThisYear")}
                    className={inputClass}
                  />
                  <p className={hintClass}>
                    Used as the base for your tax reserve instead of your
                    balance. Leave blank and we&apos;ll estimate from your
                    balance.
                  </p>
                  {fieldError(inputs.incomeThisYear) && (
                    <p className={errorClass}>
                      {fieldError(inputs.incomeThisYear)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass} htmlFor="buffer-months">
                    Buffer (months)
                  </Label>
                  <Input
                    id="buffer-months"
                    type="text"
                    inputMode="decimal"
                    value={inputs.bufferMonths}
                    onChange={updateField("bufferMonths")}
                    className={inputClass}
                  />
                  <p className={hintClass}>
                    Extra runway you want to keep before spending.
                  </p>
                  {fieldError(inputs.bufferMonths) && (
                    <p className={errorClass}>
                      {fieldError(inputs.bufferMonths)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex w-fit gap-1 border-2 border-black bg-white p-1 font-mono text-xs font-black uppercase shadow-[3px_3px_0_#101010]">
          <button
            type="button"
            onClick={() => setMode("monthly")}
            aria-pressed={mode === "monthly"}
            className={`px-3 py-1.5 transition ${
              mode === "monthly" ? "bg-[#0057ff] text-white" : ""
            }`}
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => setMode("invoice")}
            aria-pressed={mode === "invoice"}
            className={`px-3 py-1.5 transition ${
              mode === "invoice" ? "bg-[#0057ff] text-white" : ""
            }`}
          >
            Per invoice
          </button>
        </div>

        {mode === "monthly" && (
          <p className={hintClass}>
            Example: balance 4,000; fixed costs 2,200; tax reserve 30%; buffer
            2 months.
          </p>
        )}

        {mode === "monthly" ? (
          <Card
            className={`rounded-none border-4 border-black shadow-[8px_8px_0_#101010] ${
              hasCoreInputs ? STATUS_COPY[monthStatus].cardBg : "bg-white"
            }`}
          >
            <CardContent className="flex flex-col gap-4 p-6 text-center">
              {hasCoreInputs ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs font-black uppercase">
                      This month looks
                    </span>
                    <span className="font-mono text-2xl font-black uppercase">
                      {STATUS_COPY[monthStatus].label}
                    </span>
                    <p className="text-sm font-semibold text-[#4a4334]">
                      {STATUS_COPY[monthStatus].label} because {statusReason}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs font-black uppercase">
                      You can safely pay yourself up to
                    </span>
                    <span
                      className={`font-mono text-5xl font-black tracking-normal sm:text-6xl ${
                        safeToSpend < 0 ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      {formatEuro(roundedSafeToSpend)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t-2 border-black pt-4 text-left sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-xs font-black uppercase">
                        Tax reserve set aside
                      </p>
                      <p className="text-sm font-semibold text-[#4a4334]">
                        {formatEuro(taxReserve)}
                      </p>
                      {!hasValidIncome && (
                        <p className="text-sm font-semibold text-[#4a4334]">
                          Estimated from your balance — add your income above
                          for a more accurate reserve.
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-xs font-black uppercase">
                        Buffer impact
                      </p>
                      <p className="text-sm font-semibold text-[#4a4334]">
                        {bufferNote}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-3 border-t-2 border-black pt-4 text-center font-mono text-xs">
                    <FormulaTerm value={formatEuro(balance)} label="balance" />
                    <FormulaOperator symbol="-" />
                    <FormulaTerm
                      value={`(${formatEuro(monthlyEssentialCosts)} × ${bufferMonths})`}
                      label="costs × buffer"
                    />
                    <FormulaOperator symbol="-" />
                    <FormulaTerm
                      value={formatEuro(taxReserve)}
                      label="tax reserve"
                    />
                    <FormulaOperator symbol="≈" />
                    <FormulaTerm
                      value={formatEuro(roundedSafeToSpend)}
                      label="safe-to-spend"
                    />
                  </div>
                </>
              ) : (
                <>
                  <span className="font-mono text-xs font-black uppercase">
                    This month looks
                  </span>
                  <p className="text-base font-semibold text-[#4a4334]">
                    Enter your numbers above to see your safe-to-spend amount.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-none border-4 border-black bg-white shadow-[8px_8px_0_#101010]">
            <CardContent className="flex flex-col gap-4 p-6 text-center">
              <div className="flex flex-col gap-1.5 text-left">
                <Label className={labelClass} htmlFor="invoice-amount">
                  Invoice amount
                </Label>
                <Input
                  id="invoice-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 1500"
                  value={inputs.invoiceAmount}
                  onChange={updateField("invoiceAmount")}
                  className={inputClass}
                />
                <p className={hintClass}>
                  Uses your tax reserve percentage from above (
                  {taxReservePercent}%).
                </p>
                {fieldError(inputs.invoiceAmount) && (
                  <p className={errorClass}>
                    {fieldError(inputs.invoiceAmount)}
                  </p>
                )}
              </div>

              {hasValidInvoice ? (
                <>
                  <div className="grid grid-cols-1 gap-3 border-t-2 border-black pt-4 text-left sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-xs font-black uppercase">
                        Set aside for tax
                      </p>
                      <p className="text-2xl font-black">
                        {formatEuro(invoiceSplit.setAsideForTax)}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs font-black uppercase">
                        Keep as safe-to-spend
                      </p>
                      <p className="text-2xl font-black">
                        {formatEuro(invoiceSplit.keepAsSafeToSpend)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-3 border-t-2 border-black pt-4 text-center font-mono text-xs">
                    <FormulaTerm
                      value={formatEuro(invoiceAmount)}
                      label="invoice"
                    />
                    <FormulaOperator symbol="-" />
                    <FormulaTerm
                      value={formatEuro(invoiceSplit.setAsideForTax)}
                      label="tax reserve"
                    />
                    <FormulaOperator symbol="=" />
                    <FormulaTerm
                      value={formatEuro(invoiceSplit.keepAsSafeToSpend)}
                      label="keep"
                    />
                  </div>
                </>
              ) : (
                <p className="text-base font-semibold text-[#4a4334]">
                  Enter an invoice amount to see the split.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-1 border-2 border-dashed border-black bg-white px-4 py-3 font-mono text-xs font-bold text-[#4a4334]">
          <p>
            VAT you have collected should be reserved separately; it is not part
            of this amount.
          </p>
          <p>Estimate only, not tax advice for your Dutch freelance business.</p>
        </div>
      </div>
    </main>
  );
}
