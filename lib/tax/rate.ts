/**
 * What does my day rate have to be?
 *
 * The whole-year twin of ./quote.ts. Where the quote prices one job on top of a
 * year already in motion, this one builds the year from nothing: pick the
 * take-home you need, say how many days you can realistically bill, and solve
 * for the revenue that gets there once annual costs and the full tax
 * calculation have taken their share.
 *
 * This is deliberately NOT a marginal calculation. The marginal rate is what
 * the next euro costs at one point on the curve; a whole year spans the entire
 * curve, from the first untaxed euro through both credit phase-outs. Applying a
 * marginal rate to the whole year overstates the tax badly and produces a rate
 * far above what the freelancer actually needs. The solve runs over the real
 * liability function from zero, so every low-income euro is priced as a
 * low-income euro.
 *
 * It computes a floor: the rate below which the year does not work. It has no
 * view on what the market pays, and must never be presented as if it does.
 */
import { asCentsUnsafe, fromCents, toCents, type Cents } from "@/lib/domain/money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { solveNetDelta } from "@/lib/tax/solve";
import type { BreakdownLine, TaxInput } from "@/lib/tax/types";

export interface RateRequest {
  taxYear: number;
  country: string;
  /** Take-home you want from the business this year, in euros, after tax. */
  targetAnnualNet: number;
  /**
   * Days (or hours) you can realistically bill in a year.
   *
   * The number that decides everything. A freelancer who assumes 220 and bills
   * 140 has under-priced by more than a third, and will not know why the year
   * feels tight. Must be above zero.
   */
  billableUnitsPerYear: number;
  /** Ongoing costs, in euros: software, insurance, gear, workspace, accountant. */
  annualBusinessCosts: number;
  meetsHoursCriterion: boolean;
  isStarter: boolean;
  /** Salary or benefits alongside the business, in euros. Defaults to 0. */
  otherIncome?: number;
  /** Loonheffing already withheld on that other income, in euros. Defaults to 0. */
  otherIncomeTaxWithheld?: number;
}

export interface RateResult {
  /** Revenue ex btw the year needs, in cents. */
  requiredGrossRevenue: Cents;
  /** requiredGrossRevenue / billableUnitsPerYear, rounded UP to the euro. */
  requiredRatePerUnit: Cents;
  billableUnitsPerYear: number;
  annualBusinessCosts: Cents;
  /** requiredGrossRevenue - annualBusinessCosts. What the tax is worked out on. */
  projectedProfit: Cents;
  /**
   * Income tax and Zvw the business causes, in cents.
   *
   * With no other income this is the whole annual bill. With a salary alongside
   * it, it is the bill with the business minus the bill without it, so the
   * take-home figure below is the money the business itself leaves.
   */
  totalTaxLiability: Cents;
  /** totalTaxLiability / projectedProfit, as a fraction. 0 when profit <= 0. */
  effectiveRate: number;
  /** projectedProfit - totalTaxLiability. At or just above targetAnnualNet. */
  takeHome: Cents;
  breakdown: BreakdownLine[];
  assumptions: string[];
  configVersion: string;
  configRetrievedAt: string;
}

export class RateInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateInputError";
  }
}

function toTaxInput(profitEuros: number, request: RateRequest): TaxInput {
  return {
    taxYear: request.taxYear,
    country: request.country,
    projectedAnnualProfit: profitEuros,
    ytdReserved: 0,
    meetsHoursCriterion: request.meetsHoursCriterion,
    isStarter: request.isStarter,
    otherIncome: request.otherIncome ?? 0,
    otherIncomeTaxWithheld: request.otherIncomeTaxWithheld ?? 0,
  };
}

/** Rounds up to the next whole euro. Under-pricing is the direction that hurts. */
function ceilToEuro(cents: number): Cents {
  return asCentsUnsafe(Math.ceil(cents / 100) * 100);
}

export function rateForTargetAnnualNet(request: RateRequest): RateResult {
  if (!Number.isFinite(request.billableUnitsPerYear) || request.billableUnitsPerYear <= 0) {
    throw new RateInputError(
      "billableUnitsPerYear must be greater than zero. Enter how many days or hours you expect to bill in a year."
    );
  }

  const target = toCents(Math.max(0, request.targetAnnualNet));
  const costs = toCents(Math.max(0, request.annualBusinessCosts));

  const zeroProfit = calculateTaxReserve(toTaxInput(0, request));
  const baselineLiability = zeroProfit.totalLiability;
  const liabilityAt = (profit: Cents): Cents =>
    calculateTaxReserve(toTaxInput(fromCents(profit), request)).totalLiability;

  // Solve from zero profit, not from the margin. The year has to pay for itself
  // all the way up, so every euro is priced at the rate that euro really costs.
  const { delta: projectedProfit } = solveNetDelta(target, asCentsUnsafe(0), liabilityAt);

  const totalTaxLiability = asCentsUnsafe(
    Math.max(0, liabilityAt(projectedProfit) - baselineLiability)
  );
  const requiredGrossRevenue = asCentsUnsafe(projectedProfit + costs);
  const requiredRatePerUnit = ceilToEuro(
    requiredGrossRevenue / request.billableUnitsPerYear
  );
  const takeHome = asCentsUnsafe(projectedProfit - totalTaxLiability);

  const finalResult = calculateTaxReserve(toTaxInput(fromCents(projectedProfit), request));

  return {
    requiredGrossRevenue,
    requiredRatePerUnit,
    billableUnitsPerYear: request.billableUnitsPerYear,
    annualBusinessCosts: costs,
    projectedProfit,
    totalTaxLiability,
    effectiveRate: projectedProfit > 0 ? totalTaxLiability / projectedProfit : 0,
    takeHome,
    breakdown: buildRateBreakdown({
      requiredGrossRevenue,
      requiredRatePerUnit,
      billableUnits: request.billableUnitsPerYear,
      costs,
      projectedProfit,
      totalTaxLiability,
      takeHome,
    }),
    assumptions: buildRateAssumptions(request, finalResult.assumptions),
    configVersion: finalResult.configVersion,
    configRetrievedAt: finalResult.configRetrievedAt,
  };
}

function buildRateBreakdown(parts: {
  requiredGrossRevenue: Cents;
  requiredRatePerUnit: Cents;
  billableUnits: number;
  costs: Cents;
  projectedProfit: Cents;
  totalTaxLiability: Cents;
  takeHome: Cents;
}): BreakdownLine[] {
  return [
    {
      id: "rate-per-unit",
      label: "What you need to charge",
      amount: parts.requiredRatePerUnit,
      explanation: `The revenue you need, spread over the ${parts.billableUnits} billable days you expect. Rounded up, because rounding a rate down means working the year at a loss you only notice in December.`,
    },
    {
      id: "rate-gross-revenue",
      label: "Revenue for the year, excluding btw",
      amount: parts.requiredGrossRevenue,
      explanation:
        "What has to come in across the whole year. btw is charged on top and passed on, so it plays no part in this.",
    },
    {
      id: "rate-business-costs",
      label: "Your yearly business costs",
      amount: parts.costs,
      explanation:
        "Software, insurance, gear, workspace, your accountant. Deductible, so they lower your tax, but they still have to be earned before anything is yours.",
    },
    {
      id: "rate-profit",
      label: "Profit before tax",
      amount: parts.projectedProfit,
      explanation: "Revenue minus your costs. This is the figure the tax is worked out on.",
    },
    {
      id: "rate-tax",
      label: "Income tax and Zvw",
      amount: parts.totalTaxLiability,
      explanation:
        "Worked out across the real brackets for the whole year, with the deductions and credits you qualify for. Not a flat percentage.",
    },
    {
      id: "rate-take-home",
      label: "What you keep",
      amount: parts.takeHome,
      explanation: "Profit minus the tax above. This is the number you asked for.",
    },
  ];
}

function buildRateAssumptions(request: RateRequest, engineAssumptions: string[]): string[] {
  const assumptions = [
    "This is what you need to charge, not what you can charge. It is a floor. Freelens has no view on what your market pays.",
    `Built on ${request.billableUnitsPerYear} billable days a year. That is the number this whole answer turns on: bill fewer days than you planned and the rate was too low all along.`,
    ...engineAssumptions,
  ];

  if ((request.otherIncome ?? 0) > 0) {
    assumptions.push(
      "You have income alongside the business. It is counted, because it decides which bracket your profit lands in, but the take-home figure here is what the business itself leaves you."
    );
  }

  return assumptions;
}
