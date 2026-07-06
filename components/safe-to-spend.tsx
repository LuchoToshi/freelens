"use client";

import { useEffect, useRef, useState } from "react";
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
  formatCheckInDate,
  formatEuro,
  getMonthStatus,
  getStatusReason,
  roundToNearest,
  type CheckIn,
  type MonthStatus,
} from "@/lib/calc";

const STORAGE_KEY = "freelens.safe-to-spend.v1";
const CHECKIN_STORAGE_KEY = "freelens.checkin.v1";
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
  vatCollected: string;
}

const DEFAULT_INPUTS: StoredInputs = {
  balance: "",
  monthlyEssentialCosts: "",
  taxReservePercent: "30",
  bufferMonths: "2",
  incomeThisYear: "",
  invoiceAmount: "",
  vatCollected: "",
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

const labelClass = "text-sm font-medium text-[#122540]";
const hintClass = "text-xs text-[#5b6472]";
const errorClass = "text-xs font-medium text-[#b8362b]";
const inputClass =
  "rounded-lg border border-[#d8d5cd] bg-white focus-visible:ring-[#122540]";
const cardClass = "rounded-2xl border border-[#e3e1da] bg-white shadow-sm";
const pillButtonClass =
  "flex w-fit items-center gap-1.5 rounded-lg border border-[#d8d5cd] bg-white px-3 py-1.5 text-sm font-medium text-[#122540] transition hover:border-[#122540]";

const STATUS_COPY: Record<
  MonthStatus,
  { label: string; cardBg: string; accent: string }
> = {
  good: {
    label: "Healthy",
    cardBg: "bg-[#eaf4ee] border-[#bfe3cd]",
    accent: "text-[#1f7a4d]",
  },
  tight: {
    label: "Borderline",
    cardBg: "bg-[#fbf1de] border-[#f0dcae]",
    accent: "text-[#a8721c]",
  },
  short: {
    label: "Tight",
    cardBg: "bg-[#fbeaea] border-[#f3caca]",
    accent: "text-[#b8362b]",
  },
};

function FormulaTerm({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-base font-semibold">{value}</span>
      <span className="text-[#5b6472]">{label}</span>
    </div>
  );
}

function FormulaOperator({ symbol }: { symbol: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-base font-semibold">{symbol}</span>
      <span aria-hidden="true" className="invisible text-xs">
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
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const incomeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Deliberate one-time sync from localStorage post-mount: rendering
      // DEFAULT_INPUTS first keeps server/client markup identical and avoids
      // a hydration mismatch, so this can't be a lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputs({ ...DEFAULT_INPUTS, ...JSON.parse(stored) });
    }
    const storedCheckIn = window.localStorage.getItem(CHECKIN_STORAGE_KEY);
    if (storedCheckIn) {
      setCheckIn(JSON.parse(storedCheckIn));
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
  const trendDiff = checkIn ? roundedSafeToSpend - checkIn.safeToSpend : 0;

  const hasValidInvoice =
    inputs.invoiceAmount.trim() !== "" && fieldError(inputs.invoiceAmount) === null;
  const invoiceAmount = toNumber(inputs.invoiceAmount);
  const invoiceSplit = calculateInvoiceSplit(invoiceAmount, taxReservePercent);

  const hasValidVat =
    inputs.vatCollected.trim() !== "" && fieldError(inputs.vatCollected) === null;
  const vatCollected = toNumber(inputs.vatCollected);

  function updateField(field: keyof StoredInputs) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputs((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleAddIncomeClick() {
    setAdvancedOpen(true);
    requestAnimationFrame(() => {
      incomeInputRef.current?.focus();
      incomeInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function handleSaveCheckIn() {
    const snapshot: CheckIn = {
      date: new Date().toISOString(),
      safeToSpend: roundedSafeToSpend,
      status: monthStatus,
    };
    window.localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(snapshot));
    setCheckIn(snapshot);
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1c1e21]">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#122540] sm:text-3xl">
            Freelens
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[#5b6472]">
            What can you safely spend this month as a Dutch freelancer or
            ZZP&apos;er?
          </p>
        </div>

        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#122540]">
              Your numbers
            </CardTitle>
            <CardDescription className="text-[#5b6472]">
              Your numbers never leave your browser.
            </CardDescription>
            <p className={hintClass}>
              If you&apos;re unsure about exact balances, use reasonable
              estimates. You can update anytime.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-2">
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

            <div className="flex flex-col gap-1.5">
              <Label className={labelClass} htmlFor="vat-collected">
                VAT collected this period (optional)
              </Label>
              <Input
                id="vat-collected"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 800"
                value={inputs.vatCollected}
                onChange={updateField("vatCollected")}
                className={inputClass}
              />
              <p className={hintClass}>
                If you&apos;re VAT-registered, enter the BTW you&apos;ve
                collected this period. We&apos;ll show it as its own
                set-aside — separate from your safe-to-spend number.
              </p>
              {fieldError(inputs.vatCollected) && (
                <p className={errorClass}>{fieldError(inputs.vatCollected)}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAdvancedOpen((open) => !open)}
              aria-expanded={advancedOpen}
              aria-controls="advanced-fields"
              className={pillButtonClass}
            >
              Advanced
              {advancedOpen ? (
                <ChevronUp className="size-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-3.5" aria-hidden="true" />
              )}
            </button>

            {advancedOpen && (
              <div id="advanced-fields" className="flex flex-col gap-5">
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
                    ref={incomeInputRef}
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

        {hasValidVat && (
          <Card className={cardClass}>
            <CardContent className="flex flex-col gap-1 p-5 text-center">
              <span className="text-sm font-medium text-[#5b6472]">
                VAT to set aside
              </span>
              <span className="text-3xl font-semibold text-[#122540]">
                {formatEuro(vatCollected)}
              </span>
              <p className="text-sm text-[#5b6472]">
                Not part of your safe-to-spend number — this was never your
                money.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#5b6472]">
            What are you checking?
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("monthly")}
              aria-pressed={mode === "monthly"}
              className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${
                mode === "monthly"
                  ? "border-[#122540] bg-[#122540] text-white"
                  : "border-[#e3e1da] bg-white hover:border-[#122540]"
              }`}
            >
              <span className="text-base font-semibold">This month</span>
              <span
                className={`text-sm ${
                  mode === "monthly" ? "text-white/80" : "text-[#5b6472]"
                }`}
              >
                Your ongoing safe-to-spend for everyday decisions.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode("invoice")}
              aria-pressed={mode === "invoice"}
              className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${
                mode === "invoice"
                  ? "border-[#122540] bg-[#122540] text-white"
                  : "border-[#e3e1da] bg-white hover:border-[#122540]"
              }`}
            >
              <span className="text-base font-semibold">Per invoice</span>
              <span
                className={`text-sm ${
                  mode === "invoice" ? "text-white/80" : "text-[#5b6472]"
                }`}
              >
                Instant tax split right after a payment lands.
              </span>
            </button>
          </div>
        </div>

        {mode === "monthly" && (
          <p className={hintClass}>
            Example: balance 4,000; fixed costs 2,200; tax reserve 30%; buffer
            2 months.
          </p>
        )}

        {mode === "monthly" ? (
          <Card
            className={`rounded-2xl border shadow-sm ${
              hasCoreInputs ? STATUS_COPY[monthStatus].cardBg : "border-[#e3e1da] bg-white"
            }`}
          >
            <CardContent className="flex flex-col gap-4 p-6 text-center">
              {hasCoreInputs ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-[#5b6472]">
                      This month looks
                    </span>
                    <span
                      className={`text-xl font-semibold ${STATUS_COPY[monthStatus].accent}`}
                    >
                      {STATUS_COPY[monthStatus].label}
                    </span>
                    <p className="text-sm text-[#5b6472]">
                      {STATUS_COPY[monthStatus].label} because {statusReason}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-[#5b6472]">
                      You can safely pay yourself up to
                    </span>
                    <span className="text-5xl font-semibold tracking-tight text-[#122540] sm:text-6xl">
                      {formatEuro(roundedSafeToSpend)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t border-[#e3e1da] pt-4 text-left sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-[#122540]">
                        Tax reserve set aside
                      </p>
                      <p className="text-sm text-[#5b6472]">
                        {formatEuro(taxReserve)}
                      </p>
                      {!hasValidIncome && (
                        <p className="text-sm text-[#5b6472]">
                          Estimated from your balance —{" "}
                          <button
                            type="button"
                            onClick={handleAddIncomeClick}
                            className="font-medium text-[#122540] underline"
                          >
                            add your income
                          </button>{" "}
                          for a more accurate reserve.
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#122540]">
                        Buffer impact
                      </p>
                      <p className="text-sm text-[#5b6472]">{bufferNote}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-3 border-t border-[#e3e1da] pt-4 text-center font-mono text-xs text-[#1c1e21]">
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
                  <span className="text-sm font-medium text-[#5b6472]">
                    This month looks
                  </span>
                  <p className="text-base text-[#5b6472]">
                    Enter your numbers above to see your safe-to-spend amount.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className={cardClass}>
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
                  <div className="grid grid-cols-1 gap-3 border-t border-[#e3e1da] pt-4 text-left sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-[#122540]">
                        Set aside for tax
                      </p>
                      <p className="text-2xl font-semibold text-[#122540]">
                        {formatEuro(invoiceSplit.setAsideForTax)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#122540]">
                        Keep as safe-to-spend
                      </p>
                      <p className="text-2xl font-semibold text-[#122540]">
                        {formatEuro(invoiceSplit.keepAsSafeToSpend)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-3 border-t border-[#e3e1da] pt-4 text-center font-mono text-xs text-[#1c1e21]">
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
                <p className="text-base text-[#5b6472]">
                  Enter an invoice amount to see the split.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {mode === "monthly" && hasCoreInputs && (
          <Card className={cardClass}>
            <CardContent className="flex flex-col gap-3 p-5">
              <span className="text-sm font-medium text-[#122540]">
                Monthly check-in
              </span>
              {checkIn ? (
                <p className="text-sm text-[#5b6472]">
                  Last check-in ({formatCheckInDate(checkIn.date)}):{" "}
                  {formatEuro(checkIn.safeToSpend)} (
                  {STATUS_COPY[checkIn.status].label}). This time:{" "}
                  {formatEuro(roundedSafeToSpend)} (
                  {STATUS_COPY[monthStatus].label}) —{" "}
                  {trendDiff === 0
                    ? "no change"
                    : `${trendDiff > 0 ? "+" : "-"}${formatEuro(
                        Math.abs(trendDiff)
                      )} vs last time`}
                  .
                </p>
              ) : (
                <p className="text-sm text-[#5b6472]">
                  Save this month&apos;s number to start tracking your trend
                  over time.
                </p>
              )}
              <button
                type="button"
                onClick={handleSaveCheckIn}
                className={pillButtonClass}
              >
                {checkIn ? "Update this check-in" : "Save this check-in"}
              </button>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-1 rounded-2xl border border-[#e3e1da] bg-white px-4 py-3 text-xs text-[#5b6472]">
          <p>Estimate only, not tax advice for your Dutch freelance business.</p>
        </div>
      </div>
    </main>
  );
}
