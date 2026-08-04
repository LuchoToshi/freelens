/**
 * Applies a profile's deductions to a profit, in declared order.
 *
 * Two rules make this less trivial than a subtraction loop:
 *
 * 1. A deduction can be capped at the base it is applied to (you cannot deduct
 *    more than you earned), and another deduction can waive that cap. So we
 *    resolve which deductions apply BEFORE working out any amounts.
 * 2. A percentage deduction applies to whatever is left after the earlier ones,
 *    which is why order is declared in the config rather than inferred.
 */
import { asCentsUnsafe, toCents, type Cents } from "@/lib/domain/money";
import { percentDown } from "@/lib/tax/rounding";
import type { CountryProfile, DeductionConfig } from "@/lib/tax/types";

export interface TaxpayerFlags {
  meetsHoursCriterion: boolean;
  isStarter: boolean;
}

export interface AppliedDeduction {
  id: string;
  label: string;
  explanation: string;
  /** Zero when `applied` is false. */
  amount: Cents;
  applied: boolean;
  /** Set when `applied` is false: which condition was not met. */
  skippedBecause: string | null;
  subjectToRateAdjustment: boolean;
}

export interface DeductionResult {
  deductions: AppliedDeduction[];
  total: Cents;
  /** Total of the deductions the rate adjustment applies to. */
  totalSubjectToRateAdjustment: Cents;
  /** Profit after every deduction. Can be negative. */
  profitAfterDeductions: Cents;
}

const CONDITION_EXPLANATIONS: Record<string, string> = {
  meetsHoursCriterion: "you did not meet the hours criterion",
  isStarter: "you are past your starter years",
};

function conditionsMet(
  deduction: DeductionConfig,
  flags: TaxpayerFlags
): { met: boolean; failed: string | null } {
  for (const condition of deduction.conditions) {
    if (!flags[condition]) {
      return { met: false, failed: CONDITION_EXPLANATIONS[condition] ?? condition };
    }
  }
  return { met: true, failed: null };
}

export function applyDeductions(
  grossProfit: Cents,
  profile: CountryProfile,
  flags: TaxpayerFlags
): DeductionResult {
  // Pass one: which deductions apply at all. A cap waiver can be declared by a
  // deduction that is applied later, so this has to be settled up front.
  const eligibility = new Map<string, { met: boolean; failed: string | null }>();
  for (const deduction of profile.deductions) {
    eligibility.set(deduction.id, conditionsMet(deduction, flags));
  }

  // Pass two: amounts, in declared order.
  const results: AppliedDeduction[] = [];
  let base = grossProfit;
  let total = 0;
  let totalSubjectToRateAdjustment = 0;

  for (const deduction of profile.deductions) {
    const eligible = eligibility.get(deduction.id)!;
    if (!eligible.met) {
      results.push({
        id: deduction.id,
        label: deduction.label,
        explanation: deduction.explanation,
        amount: asCentsUnsafe(0),
        applied: false,
        skippedBecause: eligible.failed,
        subjectToRateAdjustment: deduction.subjectToRateAdjustment,
      });
      continue;
    }

    // Round deductions DOWN, which leaves a slightly larger taxable base.
    let amount =
      deduction.type === "fixed"
        ? toCents(deduction.value)
        : percentDown(base, deduction.value);

    const capWaived = deduction.capWaivedBy.some((id) => eligibility.get(id)?.met);
    if (deduction.cappedAtBase && !capWaived) {
      amount = asCentsUnsafe(Math.min(amount, Math.max(0, base)));
    }

    base = asCentsUnsafe(base - amount);
    total += amount;
    // Only a deduction that actually reduced the base can have its benefit
    // clawed back by the rate adjustment. Wet IB 2001 art. 2.10 lid 3 onder b
    // says this outright for the MKB-winstvrijstelling: it counts as a
    // grondslagverminderende post only "mits het gezamenlijke bedrag van de met
    // de ondernemersaftrek verminderde winst [...] positief is".
    //
    // Without the guard, a percentage deduction on a loss produces a NEGATIVE
    // amount that shrinks the total the adjustment is computed on, understating
    // tax. That only surfaces for a loss-making business alongside enough salary
    // to clear the threshold, but it under-reserves, and this engine is allowed
    // to be wrong in the other direction only.
    if (deduction.subjectToRateAdjustment && amount > 0) {
      totalSubjectToRateAdjustment += amount;
    }

    results.push({
      id: deduction.id,
      label: deduction.label,
      explanation: deduction.explanation,
      amount,
      applied: true,
      skippedBecause: null,
      subjectToRateAdjustment: deduction.subjectToRateAdjustment,
    });
  }

  return {
    deductions: results,
    total: asCentsUnsafe(total),
    totalSubjectToRateAdjustment: asCentsUnsafe(totalSubjectToRateAdjustment),
    profitAfterDeductions: base,
  };
}
