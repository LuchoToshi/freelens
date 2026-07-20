"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
import { useCountUp } from "@/components/use-count-up";
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

// Worked examples shown before real data exists — same figures used in the
// homepage walkthrough, so the tool and the homepage tell one consistent story.
const SAMPLE_INVOICE = 1500;
const SAMPLE_TAX_PERCENT = 30;
const SAMPLE_BALANCE = 6000;
const SAMPLE_COSTS = 1200;
const SAMPLE_BUFFER_MONTHS = 2;
const SAMPLE_PURCHASE = 300;

const SAMPLE_INVOICE_SPLIT = calculateInvoiceSplit(SAMPLE_INVOICE, SAMPLE_TAX_PERCENT);
const SAMPLE_CHECKIN = calculateSafeToSpend({
  balance: SAMPLE_BALANCE,
  monthlyEssentialCosts: SAMPLE_COSTS,
  taxReservePercent: SAMPLE_TAX_PERCENT,
  bufferMonths: SAMPLE_BUFFER_MONTHS,
  taxBase: SAMPLE_BALANCE,
});
const SAMPLE_SAFE_TO_SPEND = roundToNearest(SAMPLE_CHECKIN.safeToSpend);
const SAMPLE_AFFORD_REMAINING = SAMPLE_SAFE_TO_SPEND - SAMPLE_PURCHASE;

type View = "payment" | "checkin" | "afford";

const TABS: { id: View; label: string; description: string }[] = [
  {
    id: "payment",
    label: "Payment landed",
    description: "See what a payment splits into, after tax.",
  },
  {
    id: "checkin",
    label: "Weekly check-in",
    description: "A calm, honest number for right now.",
  },
  {
    id: "afford",
    label: "Can I afford this?",
    description: "Check a purchase against what's safely yours.",
  },
];

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

const labelClass = "text-sm font-medium text-[var(--fl-ink)]";
const hintClass = "text-xs text-[var(--fl-slate)]";
const errorClass = "text-xs font-medium text-[var(--fl-short-text)]";
const inputClass =
  "rounded-lg border border-[var(--fl-line)] bg-white focus-visible:ring-[var(--fl-ink)]";
const cardClass = "rounded-2xl border border-[var(--fl-line)] bg-white shadow-sm";
const pillButtonClass =
  "flex w-fit items-center gap-1.5 rounded-lg border border-[var(--fl-line)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--fl-ink)] transition hover:border-[var(--fl-ink)]";
const navLinkClass =
  "underline decoration-[var(--fl-line)] underline-offset-4 hover:text-[var(--fl-ink)]";

const STATUS_COPY: Record<
  MonthStatus,
  { label: string; cardBg: string; accent: string; dot: string }
> = {
  good: {
    label: "Looking healthy",
    cardBg: "bg-[var(--fl-good-tint)] border-[#bfe3cd]",
    accent: "text-[var(--fl-good-text)]",
    dot: "var(--fl-good-text)",
  },
  tight: {
    label: "A little tight",
    cardBg: "bg-[var(--fl-tight-tint)] border-[#f0dcae]",
    accent: "text-[var(--fl-tight-text)]",
    dot: "var(--fl-tight-text)",
  },
  short: {
    label: "Better to wait",
    cardBg: "bg-[var(--fl-short-tint)] border-[#f3caca]",
    accent: "text-[var(--fl-short-text)]",
    dot: "var(--fl-short-text)",
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
      <span className="text-[var(--fl-slate)]">{label}</span>
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
    <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--fl-ink)]">
      <Check className="size-4 shrink-0 text-[var(--fl-good-text)]" aria-hidden="true" />
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

function ExampleBadge() {
  return (
    <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-[var(--fl-line)] bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--fl-slate)]">
      Example
    </span>
  );
}

function SplitBar({
  leftPct,
  leftColor,
  rightColor,
  reducedMotion,
}: {
  leftPct: number;
  leftColor: string;
  rightColor: string;
  reducedMotion: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, leftPct));
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: rightColor }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: leftColor }}
        initial={reducedMotion ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }}
      />
    </div>
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
    <div className="border-t border-[var(--fl-line)] pt-4">
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
  return <p className="text-sm text-[var(--fl-slate)]">{text}</p>;
}

function TabBar({ view, onChange }: { view: View; onChange: (next: View) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Freelens mode"
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
    >
      {TABS.map((tab) => {
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-12 flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)] ${
              active
                ? "border-[var(--fl-ink)] bg-white shadow-sm"
                : "border-[var(--fl-line)] bg-transparent hover:border-[var(--fl-ink)]/40"
            }`}
          >
            <span
              className={`text-sm font-semibold ${
                active ? "text-[var(--fl-ink)]" : "text-[var(--fl-slate)]"
              }`}
            >
              {tab.label}
            </span>
            <span className="text-xs text-[var(--fl-slate)]">{tab.description}</span>
          </button>
        );
      })}
    </div>
  );
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
  const prefersReducedMotion = Boolean(useReducedMotion());

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

  const affordIsSample = !hasCoreInputs;
  const affordReference = hasCoreInputs ? roundedSafeToSpend : SAMPLE_SAFE_TO_SPEND;
  const hasValidPurchase =
    purchaseAmount.trim() !== "" && fieldError(purchaseAmount) === null;
  const purchaseValue = toNumber(purchaseAmount);
  const purchaseFits = purchaseValue <= affordReference;
  const affordDeltaValue = purchaseFits
    ? affordReference - purchaseValue
    : purchaseValue - affordReference;

  // Count-up hooks must run unconditionally on every render regardless of
  // which view is active or whether real data exists yet.
  const animatedKeep = useCountUp(invoiceSplit.keepAsSafeToSpend);
  const animatedTaxSetAside = useCountUp(invoiceSplit.setAsideForTax);
  const animatedTaxReserve = useCountUp(taxReserve);
  const animatedSafeToSpend = useCountUp(roundedSafeToSpend);
  const animatedAffordDelta = useCountUp(affordDeltaValue);

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

  const panelInitial = prefersReducedMotion ? false : { opacity: 0, y: 12 };
  const panelExit = prefersReducedMotion ? undefined : { opacity: 0, y: -8 };
  const panelTransition = {
    duration: prefersReducedMotion ? 0 : 0.35,
    ease: "easeOut" as const,
  };

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-2xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-3xl">
            Freelens
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[var(--fl-slate)]">
            A clear answer before you spend, save, or send an invoice.
          </p>
        </div>

        <TabBar view={view} onChange={setView} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            id={`panel-${view}`}
            role="tabpanel"
            aria-labelledby={`tab-${view}`}
            initial={panelInitial}
            animate={{ opacity: 1, y: 0 }}
            exit={panelExit}
            transition={panelTransition}
            className="flex flex-col gap-6"
          >
            {view === "payment" && (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)] sm:text-3xl">
                    A payment landed
                  </h2>
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
                      <Label
                        className="text-xs font-medium text-[var(--fl-slate)]"
                        htmlFor="payment-tax-rate"
                      >
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
                      <div className="flex flex-col gap-4 border-t border-[var(--fl-line)] pt-4 text-center">
                        <CheckLine
                          text={`Tax already set aside: ${formatEuro(animatedTaxSetAside)}`}
                        />
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-[var(--fl-slate)]">
                            Yours to keep
                          </span>
                          <span className="font-serif text-5xl font-medium tracking-tight tabular-nums text-[var(--fl-ink)] sm:text-6xl">
                            {formatEuro(animatedKeep)}
                          </span>
                        </div>

                        <SplitBar
                          leftPct={
                            invoiceAmount > 0
                              ? (invoiceSplit.keepAsSafeToSpend / invoiceAmount) * 100
                              : 0
                          }
                          leftColor="var(--fl-ink)"
                          rightColor="var(--fl-tight-tint)"
                          reducedMotion={prefersReducedMotion}
                        />
                        <div className="flex items-center justify-between text-xs text-[var(--fl-slate)]">
                          <span>Yours: {formatEuro(invoiceSplit.keepAsSafeToSpend)}</span>
                          <span>Tax reserve: {formatEuro(invoiceSplit.setAsideForTax)}</span>
                        </div>

                        <WhyThisNumber
                          open={paymentWhyOpen}
                          onToggle={() => setPaymentWhyOpen((o) => !o)}
                        >
                          <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-3 text-center font-mono text-xs text-[var(--fl-text)]">
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
                      <div className="flex flex-col gap-4 border-t border-dashed border-[var(--fl-line)] pt-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <ExampleBadge />
                          <p className="text-xs text-[var(--fl-slate)]">
                            Here&apos;s what the split looks like.
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-[var(--fl-slate)]">
                            Yours to keep
                          </span>
                          <span className="font-serif text-3xl font-medium tracking-tight tabular-nums text-[var(--fl-ink)] sm:text-4xl">
                            {formatEuro(SAMPLE_INVOICE_SPLIT.keepAsSafeToSpend)}
                          </span>
                        </div>
                        <SplitBar
                          leftPct={
                            (SAMPLE_INVOICE_SPLIT.keepAsSafeToSpend / SAMPLE_INVOICE) * 100
                          }
                          leftColor="var(--fl-ink)"
                          rightColor="var(--fl-tight-tint)"
                          reducedMotion={prefersReducedMotion}
                        />
                        <div className="flex items-center justify-between text-xs text-[var(--fl-slate)]">
                          <span>
                            Sample yours: {formatEuro(SAMPLE_INVOICE_SPLIT.keepAsSafeToSpend)}
                          </span>
                          <span>
                            Sample tax: {formatEuro(SAMPLE_INVOICE_SPLIT.setAsideForTax)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--fl-slate)]">
                          Based on a {formatEuro(SAMPLE_INVOICE)} payment at{" "}
                          {SAMPLE_TAX_PERCENT}% tax.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <button
                  type="button"
                  onClick={() => setView("checkin")}
                  className={`text-sm font-medium text-[var(--fl-ink)] ${navLinkClass} w-fit`}
                >
                  Check your overall position →
                </button>
              </>
            )}

            {view === "checkin" && (
              <>
                <Card className={cardClass}>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg font-medium text-[var(--fl-ink)]">
                      Weekly check-in
                    </CardTitle>
                    <CardDescription className="text-[var(--fl-slate)]">
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
                        Don&apos;t know it? Open your banking app and come back.
                        Your data stays on this device.
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
                        set-aside, separate from your safe-to-spend number.
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
                          <div
                            className="flex flex-wrap gap-2"
                            role="group"
                            aria-label="Buffer months"
                          >
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
                                    ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                                    : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
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
                      <span className="font-serif text-3xl font-medium text-[var(--fl-ink)]">
                        {formatEuro(vatCollected)}
                      </span>
                      <p className="text-sm text-[var(--fl-slate)]">
                        We never include VAT in what you can safely spend. Set it
                        aside for your VAT return.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card
                  className={`rounded-2xl border shadow-sm ${
                    hasCoreInputs
                      ? STATUS_COPY[monthStatus].cardBg
                      : "border-[var(--fl-line)] bg-white"
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
                          <span className="font-serif text-xl font-medium text-[var(--fl-ink)]">
                            {VERDICT_COPY[monthStatus].headline}
                          </span>
                          {monthStatus === "good" ? (
                            <span className="font-serif text-3xl font-medium tracking-tight tabular-nums text-[var(--fl-ink)] sm:text-4xl">
                              {formatEuro(animatedSafeToSpend)} is yours to spend.
                            </span>
                          ) : (
                            <span className="font-serif text-2xl font-medium tracking-tight tabular-nums text-[var(--fl-ink)] sm:text-3xl">
                              {isShort
                                ? `Right now, you're ${formatEuro(
                                    Math.abs(animatedSafeToSpend)
                                  )} short of covered.`
                                : `Right now, only ${formatEuro(
                                    animatedSafeToSpend
                                  )} is safely yours to spend.`}
                            </span>
                          )}
                          <p className="text-sm text-[var(--fl-slate)]">
                            {monthStatus === "good"
                              ? "Everything important has already been taken care of."
                              : statusReason}
                          </p>
                          {monthStatus === "short" && checkIn && (
                            <p className="text-sm text-[var(--fl-slate)]">
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
                          <CheckLine
                            text={`Taxes reserved: ${formatEuro(animatedTaxReserve)}`}
                          />
                          {!hasValidIncome && (
                            <p className="text-xs text-[var(--fl-slate)]">
                              Estimated from your balance.{" "}
                              <button
                                type="button"
                                onClick={handleAddIncomeClick}
                                className="font-medium text-[var(--fl-ink)] underline"
                              >
                                Add your income
                              </button>{" "}
                              for a more accurate reserve.
                            </p>
                          )}
                          <CheckLine text="Buffer protected" />
                          <p className="text-xs text-[var(--fl-slate)]">{bufferNote}</p>
                        </div>

                        <WhyThisNumber
                          open={checkinWhyOpen}
                          onToggle={() => setCheckinWhyOpen((o) => !o)}
                        >
                          <WhyStep
                            text={`We started with your balance: ${formatEuro(balance)}.`}
                          />
                          <WhyStep
                            text={`Protected your tax money: −${formatEuro(taxReserve)}.`}
                          />
                          <WhyStep
                            text={`Kept your safety buffer untouched: −${formatEuro(
                              buffer
                            )}.`}
                          />
                          <WhyStep
                            text={`What's left is yours: ${formatEuro(
                              roundedSafeToSpend
                            )}.`}
                          />
                          <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-3 border-t border-[var(--fl-line)] pt-3 text-center font-mono text-xs text-[var(--fl-text)]">
                            <FormulaTerm value={formatEuro(balance)} label="balance" />
                            <FormulaOperator symbol="-" />
                            <FormulaTerm
                              value={`(${formatEuro(
                                monthlyEssentialCosts
                              )} × ${bufferMonths})`}
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

                        <p className="text-sm font-medium text-[var(--fl-ink)]">
                          {VERDICT_COPY[monthStatus].closing}
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2">
                          <ExampleBadge />
                          <p className="text-xs text-[var(--fl-slate)]">
                            Here&apos;s what your answer will look like.
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="flex items-center gap-1.5 text-sm font-semibold">
                            <ConfidenceDot color="var(--fl-good-text)" />
                            <span className="text-[var(--fl-good-text)]">
                              Looking healthy
                            </span>
                          </span>
                          <span className="font-serif text-3xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-4xl">
                            {formatEuro(SAMPLE_SAFE_TO_SPEND)} is yours to spend.
                          </span>
                          <p className="text-sm text-[var(--fl-slate)]">
                            Example: {formatEuro(SAMPLE_BALANCE)} in the bank,{" "}
                            {formatEuro(SAMPLE_COSTS)} in monthly costs, a{" "}
                            {SAMPLE_BUFFER_MONTHS}-month buffer.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {hasCoreInputs && (
                  <Card className={cardClass}>
                    <CardContent className="flex flex-col gap-3 p-5">
                      <span className="text-sm font-medium text-[var(--fl-ink)]">
                        Remember this week?
                      </span>
                      {checkIn ? (
                        <p className="text-sm text-[var(--fl-slate)]">
                          Last check-in ({formatCheckInDate(checkIn.date)}):{" "}
                          {formatEuro(checkIn.safeToSpend)} (
                          {STATUS_COPY[checkIn.status].label}). This time:{" "}
                          {formatEuro(roundedSafeToSpend)} (
                          {STATUS_COPY[monthStatus].label}),{" "}
                          {trendDiff === 0
                            ? "no change"
                            : `${trendDiff > 0 ? "+" : "-"}${formatEuro(
                                Math.abs(trendDiff)
                              )} vs last time`}
                          .
                        </p>
                      ) : (
                        <p className="text-sm text-[var(--fl-slate)]">
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

                <button
                  type="button"
                  onClick={() => setView("afford")}
                  className={`text-sm font-medium text-[var(--fl-ink)] ${navLinkClass} w-fit`}
                >
                  Can I afford something? →
                </button>
              </>
            )}

            {view === "afford" && (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)] sm:text-3xl">
                    Can I afford this?
                  </h2>
                  <p className={hintClass}>
                    Check a planned purchase against what&apos;s safely yours.
                  </p>
                </div>

                <Card className={cardClass}>
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex flex-col gap-1.5">
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
                      <div className="flex flex-col gap-4 border-t border-[var(--fl-line)] pt-4">
                        {affordIsSample && (
                          <div className="flex items-center gap-2">
                            <ExampleBadge />
                            <p className="text-xs text-[var(--fl-slate)]">
                              Using a sample {formatEuro(SAMPLE_SAFE_TO_SPEND)}{" "}
                              safe-to-spend number.
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col gap-1 text-center">
                          <p
                            className={`font-serif text-2xl font-medium sm:text-3xl ${
                              purchaseFits
                                ? "text-[var(--fl-good-text)]"
                                : "text-[var(--fl-short-text)]"
                            }`}
                          >
                            {purchaseFits ? "Yes, that fits." : "That would leave you short."}
                          </p>
                          <p className="text-sm text-[var(--fl-slate)]">
                            {purchaseFits
                              ? `You'd still have ${formatEuro(animatedAffordDelta)} after.`
                              : `${formatEuro(
                                  animatedAffordDelta
                                )} short of your safe-to-spend.`}
                          </p>
                        </div>
                        <SplitBar
                          leftPct={
                            (purchaseValue / Math.max(affordReference, 1)) * 100
                          }
                          leftColor={
                            purchaseFits
                              ? "var(--fl-good-text)"
                              : "var(--fl-short-text)"
                          }
                          rightColor="var(--fl-line)"
                          reducedMotion={prefersReducedMotion}
                        />
                        <div className="flex items-center justify-between text-xs text-[var(--fl-slate)]">
                          <span>This purchase: {formatEuro(purchaseValue)}</span>
                          <span>Safe to spend: {formatEuro(affordReference)}</span>
                        </div>
                        {affordIsSample && (
                          <p className="text-sm text-[var(--fl-slate)]">
                            This is an example.{" "}
                            <button
                              type="button"
                              onClick={() => setView("checkin")}
                              className="font-medium text-[var(--fl-ink)] underline"
                            >
                              Do your weekly check-in
                            </button>{" "}
                            to check against your real number.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 border-t border-dashed border-[var(--fl-line)] pt-4">
                        <div className="flex items-center gap-2">
                          <ExampleBadge />
                          <p className="text-xs text-[var(--fl-slate)]">
                            {hasCoreInputs
                              ? `Type an amount to check it against your ${formatEuro(
                                  roundedSafeToSpend
                                )} safe to spend.`
                              : "Here's how it works, with sample numbers."}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 text-center">
                          <p className="font-serif text-2xl font-medium text-[var(--fl-good-text)] sm:text-3xl">
                            Yes, that fits.
                          </p>
                          <p className="text-sm text-[var(--fl-slate)]">
                            You&apos;d still have {formatEuro(SAMPLE_AFFORD_REMAINING)}{" "}
                            after a {formatEuro(SAMPLE_PURCHASE)} purchase.
                          </p>
                        </div>
                        <SplitBar
                          leftPct={(SAMPLE_PURCHASE / SAMPLE_SAFE_TO_SPEND) * 100}
                          leftColor="var(--fl-good-text)"
                          rightColor="var(--fl-line)"
                          reducedMotion={prefersReducedMotion}
                        />
                        <div className="flex items-center justify-between text-xs text-[var(--fl-slate)]">
                          <span>Sample purchase: {formatEuro(SAMPLE_PURCHASE)}</span>
                          <span>
                            Sample safe to spend: {formatEuro(SAMPLE_SAFE_TO_SPEND)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <button
                  type="button"
                  onClick={() => setView("checkin")}
                  className={`text-sm font-medium text-[var(--fl-ink)] ${navLinkClass} w-fit`}
                >
                  ← Weekly check-in
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-1 rounded-2xl border border-[var(--fl-line)] bg-white px-4 py-3 text-xs text-[var(--fl-slate)]">
          <p>Estimate only, not tax advice for your Dutch freelance business.</p>
        </div>
      </div>
    </main>
  );
}
