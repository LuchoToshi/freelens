"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
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
const BUFFER_OPTIONS = [1, 2, 3, 6] as const;
const BELASTINGDIENST_MKB_URL =
  "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/mkb_winstvrijstelling";

type View = "payment" | "checkin" | "afford";

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
const navLinkClass = "underline decoration-[#d8d5cd] underline-offset-4 hover:text-[#122540]";

const STATUS_COPY: Record<
  MonthStatus,
  { label: string; cardBg: string; accent: string; dot: string }
> = {
  good: {
    label: "Looking healthy",
    cardBg: "bg-[#eaf4ee] border-[#bfe3cd]",
    accent: "text-[#1f7a4d]",
    dot: "#1f7a4d",
  },
  tight: {
    label: "A little tight",
    cardBg: "bg-[#fbf1de] border-[#f0dcae]",
    accent: "text-[#a8721c]",
    dot: "#a8721c",
  },
  short: {
    label: "Better to wait",
    cardBg: "bg-[#fbeaea] border-[#f3caca]",
    accent: "text-[#b8362b]",
    dot: "#b8362b",
  },
};

const VERDICT_COPY: Record<MonthStatus, { headline: string; closing: string }> = {
  good: { headline: "You're good.", closing: "Spend confidently." },
  tight: {
    headline: "A little tight.",
    closing: "A little caution today keeps things comfortable later.",
  },
  short: {
    headline: "Hold off for now.",
    closing: "Not today. Waiting a little longer protects Future You.",
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

function CheckLine({ text }: { text: string }) {
  return (
    <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#122540]">
      <Check className="size-4 shrink-0 text-[#1f7a4d]" aria-hidden="true" />
      {text}
    </p>
  );
}

function ConfidenceDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

function WhyThisNumber({
  open,
  onToggle,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[#e3e1da] pt-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`${pillButtonClass} mx-auto`}
      >
        Why this number?
        {open ? (
          <ChevronUp className="size-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-3.5" aria-hidden="true" />
        )}
      </button>
      {open && <div className="mt-3 flex flex-col gap-3 text-left">{children}</div>}
    </div>
  );
}

function WhyStep({ text }: { text: string }) {
  return <p className="text-sm text-[#5b6472]">{text}</p>;
}

export function SafeToSpend() {
  const [inputs, setInputs] = useState<StoredInputs>(DEFAULT_INPUTS);
  const [hydrated, setHydrated] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [view, setView] = useState<View>("payment");
  const [paymentWhyOpen, setPaymentWhyOpen] = useState(false);
  const [checkinWhyOpen, setCheckinWhyOpen] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState("");
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
  const isShort = roundedSafeToSpend < 0;
  const trendDiff = checkIn ? roundedSafeToSpend - checkIn.safeToSpend : 0;

  const hasValidInvoice =
    inputs.invoiceAmount.trim() !== "" && fieldError(inputs.invoiceAmount) === null;
  const invoiceAmount = toNumber(inputs.invoiceAmount);
  const invoiceSplit = calculateInvoiceSplit(invoiceAmount, taxReservePercent);

  const hasValidVat =
    inputs.vatCollected.trim() !== "" && fieldError(inputs.vatCollected) === null;
  const vatCollected = toNumber(inputs.vatCollected);

  const hasValidPurchase =
    purchaseAmount.trim() !== "" && fieldError(purchaseAmount) === null;
  const purchaseValue = toNumber(purchaseAmount);
  const purchaseFits = purchaseValue <= roundedSafeToSpend;

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
            A clear answer before you spend, save, or send an invoice.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#5b6472]">
          {view === "payment" ? (
            <span className="font-semibold text-[#122540]">Payment landed</span>
          ) : (
            <button type="button" onClick={() => setView("payment")} className={navLinkClass}>
              Payment landed
            </button>
          )}
          <span className="text-[#d8d5cd]">·</span>
          {view === "checkin" ? (
            <span className="font-semibold text-[#122540]">Weekly check-in</span>
          ) : (
            <button type="button" onClick={() => setView("checkin")} className={navLinkClass}>
              Weekly check-in
            </button>
          )}
          <span className="text-[#d8d5cd]">·</span>
          {view === "afford" ? (
            <span className="font-semibold text-[#122540]">Can I afford this?</span>
          ) : hasCoreInputs ? (
            <button type="button" onClick={() => setView("afford")} className={navLinkClass}>
              Can I afford this?
            </button>
          ) : (
            <span className="text-[#d8d5cd]">Can I afford this?</span>
          )}
        </nav>

        {view === "payment" && (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-[#122540]">A payment landed</h2>
              <p className={hintClass}>How much of it is actually yours?</p>
            </div>

            <Card className={cardClass}>
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass} htmlFor="payment-amount">
                    How much did you get paid?
                  </Label>
                  <Input
                    id="payment-amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 1500"
                    value={inputs.invoiceAmount}
                    onChange={updateField("invoiceAmount")}
                    className={inputClass}
                  />
                  {fieldError(inputs.invoiceAmount) && (
                    <p className={errorClass}>{fieldError(inputs.invoiceAmount)}</p>
                  )}
                </div>

                <div className="flex max-w-[160px] flex-col gap-1.5">
                  <Label className="text-xs font-medium text-[#5b6472]" htmlFor="payment-tax-rate">
                    Tax rate (%)
                  </Label>
                  <Input
                    id="payment-tax-rate"
                    type="text"
                    inputMode="decimal"
                    value={inputs.taxReservePercent}
                    onChange={updateField("taxReservePercent")}
                    className={`${inputClass} h-9 text-sm`}
                  />
                  {fieldError(inputs.taxReservePercent) && (
                    <p className={errorClass}>{fieldError(inputs.taxReservePercent)}</p>
                  )}
                </div>

                {hasValidInvoice ? (
                  <div className="flex flex-col gap-3 border-t border-[#e3e1da] pt-4 text-center">
                    <CheckLine
                      text={`Tax already set aside — ${formatEuro(invoiceSplit.setAsideForTax)}`}
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-[#5b6472]">Yours to keep</span>
                      <span className="text-5xl font-semibold tracking-tight text-[#122540] sm:text-6xl">
                        {formatEuro(invoiceSplit.keepAsSafeToSpend)}
                      </span>
                    </div>

                    <WhyThisNumber open={paymentWhyOpen} onToggle={() => setPaymentWhyOpen((o) => !o)}>
                      <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-3 text-center font-mono text-xs text-[#1c1e21]">
                        <FormulaTerm value={formatEuro(invoiceAmount)} label="payment" />
                        <FormulaOperator symbol="-" />
                        <FormulaTerm
                          value={formatEuro(invoiceSplit.setAsideForTax)}
                          label="tax reserve"
                        />
                        <FormulaOperator symbol="=" />
                        <FormulaTerm
                          value={formatEuro(invoiceSplit.keepAsSafeToSpend)}
                          label="yours to keep"
                        />
                      </div>
                    </WhyThisNumber>
                  </div>
                ) : (
                  <p className={`${hintClass} border-t border-[#e3e1da] pt-4 text-center`}>
                    Enter what you got paid to see the split.
                  </p>
                )}
              </CardContent>
            </Card>

            <button
              type="button"
              onClick={() => setView("checkin")}
              className={`text-sm font-medium text-[#122540] ${navLinkClass} w-fit`}
            >
              Check your overall position →
            </button>
          </>
        )}

        {view === "checkin" && (
          <>
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#122540]">
                  Weekly check-in
                </CardTitle>
                <CardDescription className="text-[#5b6472]">
                  Your numbers never leave your browser.
                </CardDescription>
                <p className={hintClass}>Takes about 30 seconds.</p>
                <p className={hintClass}>
                  If you&apos;re unsure about exact balances, use reasonable
                  estimates. You can update anytime.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-5 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label className={labelClass} htmlFor="balance">
                    How much is currently in your account?
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
                    What do you need to cover this month?
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
                    Any VAT in there that isn&apos;t really yours? (optional)
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
                        How much do you set aside for taxes?
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
                        Roughly what will you earn this year? (optional)
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
                      <Label className={labelClass}>
                        How many months of safety cushion do you want?
                      </Label>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Buffer months">
                        {BUFFER_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setInputs((prev) => ({
                                ...prev,
                                bufferMonths: String(option),
                              }))
                            }
                            aria-pressed={bufferMonths === option}
                            className={`min-w-14 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                              bufferMonths === option
                                ? "border-[#122540] bg-[#122540] text-white"
                                : "border-[#d8d5cd] bg-white text-[#122540] hover:border-[#122540]"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <p className={hintClass}>
                        Extra runway you want to keep before spending. Most
                        freelancers keep 2–3 months.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {hasValidVat && (
              <Card className={cardClass}>
                <CardContent className="flex flex-col gap-1 p-5 text-center">
                  <CheckLine text="VAT already excluded" />
                  <span className="text-3xl font-semibold text-[#122540]">
                    {formatEuro(vatCollected)}
                  </span>
                  <p className="text-sm text-[#5b6472]">
                    We never include VAT in what you can safely spend — set it
                    aside for your VAT return.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card
              className={`rounded-2xl border shadow-sm ${
                hasCoreInputs ? STATUS_COPY[monthStatus].cardBg : "border-[#e3e1da] bg-white"
              }`}
            >
              <CardContent className="flex flex-col gap-4 p-6 text-center">
                {hasCoreInputs ? (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-semibold">
                        <ConfidenceDot color={STATUS_COPY[monthStatus].dot} />
                        <span className={STATUS_COPY[monthStatus].accent}>
                          {STATUS_COPY[monthStatus].label}
                        </span>
                      </span>
                      <span className="text-xl font-semibold text-[#122540]">
                        {VERDICT_COPY[monthStatus].headline}
                      </span>
                      {monthStatus === "good" ? (
                        <span className="text-3xl font-semibold tracking-tight text-[#122540] sm:text-4xl">
                          {formatEuro(roundedSafeToSpend)} is yours to spend.
                        </span>
                      ) : (
                        <span className="text-2xl font-semibold tracking-tight text-[#122540] sm:text-3xl">
                          {isShort
                            ? `Right now, you're ${formatEuro(Math.abs(roundedSafeToSpend))} short of covered.`
                            : `Right now, only ${formatEuro(roundedSafeToSpend)} is safely yours to spend.`}
                        </span>
                      )}
                      <p className="text-sm text-[#5b6472]">
                        {monthStatus === "good"
                          ? "Everything important has already been taken care of."
                          : statusReason}
                      </p>
                      {monthStatus === "short" && checkIn && (
                        <p className="text-sm text-[#5b6472]">
                          Since your last check-in (
                          {formatCheckInDate(checkIn.date)}), this is{" "}
                          {trendDiff === 0
                            ? "no change"
                            : `${trendDiff > 0 ? "+" : "-"}${formatEuro(
                                Math.abs(trendDiff)
                              )}`}
                          .
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 border-t border-black/10 pt-4">
                      <CheckLine text={`Taxes reserved — ${formatEuro(taxReserve)}`} />
                      {!hasValidIncome && (
                        <p className="text-xs text-[#5b6472]">
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
                      <CheckLine text="Buffer protected" />
                      <p className="text-xs text-[#5b6472]">{bufferNote}</p>
                    </div>

                    <WhyThisNumber open={checkinWhyOpen} onToggle={() => setCheckinWhyOpen((o) => !o)}>
                      <WhyStep text={`We started with your balance: ${formatEuro(balance)}.`} />
                      <WhyStep text={`Protected your tax money: −${formatEuro(taxReserve)}.`} />
                      <WhyStep text={`Kept your safety buffer untouched: −${formatEuro(buffer)}.`} />
                      <WhyStep text={`What's left is yours: ${formatEuro(roundedSafeToSpend)}.`} />
                      <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-3 border-t border-[#e3e1da] pt-3 text-center font-mono text-xs text-[#1c1e21]">
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
                    </WhyThisNumber>

                    <p className="text-sm font-medium text-[#122540]">
                      {VERDICT_COPY[monthStatus].closing}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-[#5b6472]">
                      This month looks
                    </span>
                    <p className="text-base text-[#5b6472]">
                      Enter your numbers above to see where you stand.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {hasCoreInputs && (
              <Card className={cardClass}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <span className="text-sm font-medium text-[#122540]">
                    Remember this week?
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
                      One tap. Freelens remembers how your finances changed, so
                      you don&apos;t have to.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveCheckIn}
                    className={pillButtonClass}
                  >
                    {checkIn ? "Update this week" : "Remember this week"}
                  </button>
                </CardContent>
              </Card>
            )}

            {hasCoreInputs && (
              <button
                type="button"
                onClick={() => setView("afford")}
                className={`text-sm font-medium text-[#122540] ${navLinkClass} w-fit`}
              >
                Can I afford something? →
              </button>
            )}
          </>
        )}

        {view === "afford" && (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-[#122540]">
                Can I afford this?
              </h2>
            </div>

            {hasCoreInputs ? (
              <Card className={cardClass}>
                <CardContent className="flex flex-col gap-4 p-6 text-center">
                  <div className="flex flex-col gap-1.5 text-left">
                    <Label className={labelClass} htmlFor="purchase-amount">
                      What does it cost?
                    </Label>
                    <Input
                      id="purchase-amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 300"
                      value={purchaseAmount}
                      onChange={(event) => setPurchaseAmount(event.target.value)}
                      className={inputClass}
                    />
                    {fieldError(purchaseAmount) && (
                      <p className={errorClass}>{fieldError(purchaseAmount)}</p>
                    )}
                  </div>

                  {hasValidPurchase ? (
                    purchaseFits ? (
                      <div className="flex flex-col gap-1 border-t border-[#e3e1da] pt-4">
                        <p className="text-2xl font-semibold text-[#1f7a4d]">
                          Yes, that fits.
                        </p>
                        <p className="text-sm text-[#5b6472]">
                          You&apos;d still have{" "}
                          {formatEuro(roundedSafeToSpend - purchaseValue)} after.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 border-t border-[#e3e1da] pt-4">
                        <p className="text-2xl font-semibold text-[#b8362b]">
                          That would leave you short.
                        </p>
                        <p className="text-sm text-[#5b6472]">
                          {formatEuro(purchaseValue - roundedSafeToSpend)} short of
                          your buffer.
                        </p>
                      </div>
                    )
                  ) : (
                    <p className={`${hintClass} border-t border-[#e3e1da] pt-4`}>
                      Enter a cost to see if it fits.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className={cardClass}>
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <p className="text-base text-[#5b6472]">
                    Do your weekly check-in first so there&apos;s something to
                    compare against.
                  </p>
                  <button
                    type="button"
                    onClick={() => setView("checkin")}
                    className={pillButtonClass}
                  >
                    Go to weekly check-in
                  </button>
                </CardContent>
              </Card>
            )}

            <button
              type="button"
              onClick={() => setView("checkin")}
              className={`text-sm font-medium text-[#122540] ${navLinkClass} w-fit`}
            >
              ← Weekly check-in
            </button>
          </>
        )}

        <div className="flex flex-col gap-1 rounded-2xl border border-[#e3e1da] bg-white px-4 py-3 text-xs text-[#5b6472]">
          <p>Estimate only, not tax advice for your Dutch freelance business.</p>
        </div>
      </div>
    </main>
  );
}
