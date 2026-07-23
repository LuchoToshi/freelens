/**
 * Business runway: how many months the operating reserve covers essential
 * monthly business costs. Never returns Infinity, a missing or zero cost base
 * is `null` ("can't estimate"), which is a different thing from "infinite".
 */
import { type Cents } from "@/lib/domain/money";

/** One-decimal months, or null when monthly costs are zero/missing/negative. */
export function calculateRunwayMonths(
  availableOperatingReserveCents: Cents,
  essentialMonthlyCostsCents: Cents
): number | null {
  if (essentialMonthlyCostsCents <= 0) return null;
  // Negative reserve → 0 months of survival (the shortfall itself is reported
  // separately by evaluateWeeklyPosition; runway only measures survival time).
  const reserve = Math.max(0, availableOperatingReserveCents);
  const months = reserve / essentialMonthlyCostsCents;
  return Math.round(months * 10) / 10;
}

function formatMonths(months: number): string {
  return `${months.toFixed(1)} month${months === 1 ? "" : "s"}`;
}

export function describeRunwayChange(
  before: number | null,
  after: number | null
): string {
  if (before === null && after === null) {
    return "Runway can't be estimated without your essential monthly costs.";
  }
  if (before === null) {
    return `Your business runway would be about ${formatMonths(after as number)}.`;
  }
  if (after === null) {
    return `Your business runway is about ${formatMonths(before)}.`;
  }
  if (before === after) {
    return `Your business runway would stay about the same, at ${formatMonths(before)}.`;
  }
  return `Your business runway would change from ${formatMonths(before)} to ${formatMonths(after)}.`;
}
