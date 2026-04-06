import type { CalcInputs, CalcResult } from '../types/calculator';

export function calculate(inputs: CalcInputs): CalcResult {
  const { balance, taxRatePercent, monthlyExpenses, runwayMonths } = inputs;
  const taxReserve = balance * (taxRatePercent / 100);
  const runwayBuffer = monthlyExpenses * runwayMonths;
  const raw = balance - taxReserve - runwayBuffer;
  const safeToSpend = Math.max(0, raw);
  return {
    taxReserve,
    runwayBuffer,
    safeToSpend,
    isOverReserved: raw < 0,
  };
}
