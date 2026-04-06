export interface CalcInputs {
  balance: number;
  taxRatePercent: number;
  monthlyExpenses: number;
  runwayMonths: number;
}

export interface CalcResult {
  taxReserve: number;
  runwayBuffer: number;
  safeToSpend: number;
  isOverReserved: boolean;
}
