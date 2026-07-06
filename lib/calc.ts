export interface SafeToSpendInputs {
  balance: number;
  monthlyEssentialCosts: number;
  taxReservePercent: number;
  bufferMonths: number;
  taxBase: number;
}

export interface SafeToSpendResult {
  taxReserve: number;
  buffer: number;
  safeToSpend: number;
}

export function calculateSafeToSpend({
  balance,
  monthlyEssentialCosts,
  taxReservePercent,
  bufferMonths,
  taxBase,
}: SafeToSpendInputs): SafeToSpendResult {
  const taxReserve = taxBase * (taxReservePercent / 100);
  const buffer = monthlyEssentialCosts * bufferMonths;
  const safeToSpend = balance - taxReserve - buffer;

  return { taxReserve, buffer, safeToSpend };
}

const currencyFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatEuro(amount: number): string {
  return currencyFormatter.format(amount);
}

export function roundToNearest(value: number, step = 50): number {
  return Math.round(value / step) * step;
}

export type MonthStatus = "short" | "tight" | "good";

export function getMonthStatus(
  safeToSpend: number,
  monthlyEssentialCosts: number
): MonthStatus {
  if (safeToSpend < 0) return "short";
  if (safeToSpend < monthlyEssentialCosts) return "tight";
  return "good";
}

export function getStatusReason(
  status: MonthStatus,
  safeToSpend: number,
  monthlyEssentialCosts: number
): string {
  if (status === "short") {
    return "reserves and buffer add up to more than your current balance.";
  }
  if (status === "tight") {
    return "what's safe to spend is less than a month of your costs after reserves.";
  }
  if (monthlyEssentialCosts <= 0) {
    return "you have money left after reserves and buffer.";
  }
  const monthsCovered = safeToSpend / monthlyEssentialCosts;
  const roundedMonths = Math.round(monthsCovered * 10) / 10;
  return `you have about ${roundedMonths} month${roundedMonths === 1 ? "" : "s"} of costs covered after reserves.`;
}

export function formatBufferNote(buffer: number, bufferMonths: number): string {
  const monthLabel = bufferMonths === 1 ? "1-month" : `${bufferMonths}-month`;
  return `${formatEuro(buffer)} kept aside for your ${monthLabel} buffer`;
}

export interface InvoiceSplit {
  setAsideForTax: number;
  keepAsSafeToSpend: number;
}

export function calculateInvoiceSplit(
  invoiceAmount: number,
  taxReservePercent: number
): InvoiceSplit {
  const setAsideForTax = invoiceAmount * (taxReservePercent / 100);
  const keepAsSafeToSpend = invoiceAmount - setAsideForTax;
  return { setAsideForTax, keepAsSafeToSpend };
}
