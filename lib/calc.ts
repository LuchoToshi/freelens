export interface SafeToSpendInputs {
  balance: number;
  monthlyEssentialCosts: number;
  taxReservePercent: number;
  bufferMonths: number;
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
}: SafeToSpendInputs): SafeToSpendResult {
  const taxReserve = balance * (taxReservePercent / 100);
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
