/**
 * The forward direction for a single job: I am thinking of quoting X, what is
 * left?
 *
 * `quote.ts` answers the opposite question, "I want to keep X, what do I
 * charge", by bisecting the liability curve. This one needs no solve at all:
 * the fee is known, so the answer is one subtraction against the real curve.
 *
 * Both directions must agree, and a round-trip test pins that: feeding this the
 * quote that `quoteForTargetNet` produced has to give back the target that
 * produced it. Two functions that disagree about the same job would be worse
 * than having only one.
 *
 * What it is not: a view on whether the fee is enough for the work. This says
 * what a fee leaves once the Belastingdienst and the job's own costs are paid.
 * Nothing here knows what the market pays.
 */
import { asCentsUnsafe, fromCents, toCents, type Cents } from "@/lib/domain/money";
import { addVatExclusive } from "@/lib/domain/vat";
import { detectBracketCrossing, type BracketCrossing } from "@/lib/tax/bracketCrossing";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { loadProfile } from "@/lib/tax/loadProfile";
import type { BreakdownLine, TaxInput } from "@/lib/tax/types";

export interface JobOutcomeRequest {
  taxYear: number;
  country: string;
  /**
   * The fee excluding btw, in euros: the number going on the quote. btw is
   * added on top and passed straight through, so it is never part of this.
   */
  feeExVat: number;
  /**
   * Deductible costs specific to this job, in euros: travel, an assistant,
   * equipment rental, licensing. Defaults to 0.
   *
   * These come out of the fee before anything is the freelancer's, and they
   * reduce taxable profit by the same amount, which is why they are subtracted
   * before the liability is worked out rather than after.
   */
  jobCosts?: number;
  /** Profit already projected for the year, before this job, in euros. */
  currentProjectedProfit: number;
  /** Percent added on top, e.g. 21. Does not affect what is kept. */
  vatRate: number;
  meetsHoursCriterion: boolean;
  isStarter: boolean;
  otherIncome?: number;
  otherIncomeTaxWithheld?: number;
  /**
   * Optional. Days of work this job represents. Present only so the result can
   * show an implied day rate, which is the one number that makes a fee
   * comparable to anything else. Never enters the tax calculation.
   */
  daysOfWork?: number;
}

export interface JobOutcomeResult {
  /** The fee as entered, clamped at zero. */
  feeExVat: Cents;
  vat: Cents;
  /** What the client is invoiced. */
  feeInclVat: Cents;
  jobCosts: Cents;
  /** feeExVat - jobCosts. What this job adds to profit for the year. */
  taxableDelta: Cents;
  /** Extra income tax and Zvw this job triggers, on top of the year so far. */
  additionalLiability: Cents;
  /** feeExVat - jobCosts - additionalLiability. What is actually kept. */
  takeHome: Cents;
  /**
   * additionalLiability / taxableDelta as a fraction. The blend across this
   * job, not the marginal rate at a point: a job that crosses a bracket is
   * taxed at more than one rate.
   */
  effectiveJobRate: number;
  /** takeHome / feeExVat. What share of the fee survives. */
  keptShare: number;
  /** Set when this job pushes taxable income past a bracket threshold. */
  bracketCrossing: BracketCrossing | null;
  /** takeHome per day, when days were given and positive. */
  impliedDayRate: Cents | null;
  breakdown: BreakdownLine[];
  assumptions: string[];
  configVersion: string;
  configRetrievedAt: string;
}

function toTaxInput(profitEuros: number, request: JobOutcomeRequest): TaxInput {
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

function addVat(netCents: Cents, rate: number): { vat: Cents; gross: Cents } {
  if (rate === 21 || rate === 9) {
    const split = addVatExclusive(netCents, rate);
    return { vat: split.vatCents, gross: split.grossCents };
  }
  return { vat: asCentsUnsafe(0), gross: netCents };
}

export function outcomeForJobFee(request: JobOutcomeRequest): JobOutcomeResult {
  const fee = toCents(Math.max(0, request.feeExVat));
  const costs = toCents(Math.max(0, request.jobCosts ?? 0));
  const baseProfit = toCents(request.currentProjectedProfit);

  // Costs are deductible, so what this job adds to taxable profit is the fee
  // minus the costs. A job whose costs exceed the fee reduces profit for the
  // year, and the arithmetic below handles that without a special case: the
  // delta simply goes negative and the liability difference comes back
  // negative too.
  const taxableDelta = asCentsUnsafe(fee - costs);
  const profitAfter = asCentsUnsafe(baseProfit + taxableDelta);

  const resultAt = (profit: Cents) =>
    calculateTaxReserve(toTaxInput(fromCents(profit), request));
  const baseResult = resultAt(baseProfit);
  const afterResult = resultAt(profitAfter);

  const additionalLiability = asCentsUnsafe(
    afterResult.totalLiability - baseResult.totalLiability
  );
  const takeHome = asCentsUnsafe(fee - costs - additionalLiability);

  const bracketCrossing = detectBracketCrossing(
    baseProfit,
    profitAfter,
    loadProfile(request.country, request.taxYear).brackets,
    (profit) => resultAt(profit).taxableIncome
  );

  const { vat, gross } = addVat(fee, request.vatRate);

  const days = request.daysOfWork ?? 0;
  const impliedDayRate =
    days > 0 ? asCentsUnsafe(Math.round(takeHome / days)) : null;

  return {
    feeExVat: fee,
    vat,
    feeInclVat: gross,
    jobCosts: costs,
    taxableDelta,
    additionalLiability,
    takeHome,
    effectiveJobRate: taxableDelta > 0 ? additionalLiability / taxableDelta : 0,
    keptShare: fee > 0 ? takeHome / fee : 0,
    bracketCrossing,
    impliedDayRate,
    breakdown: buildBreakdown({
      fee,
      vat,
      gross,
      costs,
      additionalLiability,
      takeHome,
      vatRate: request.vatRate,
    }),
    assumptions: buildAssumptions(request, baseResult.assumptions, costs, bracketCrossing),
    configVersion: baseResult.configVersion,
    configRetrievedAt: baseResult.configRetrievedAt,
  };
}

function buildBreakdown(parts: {
  fee: Cents;
  vat: Cents;
  gross: Cents;
  costs: Cents;
  additionalLiability: Cents;
  takeHome: Cents;
  vatRate: number;
}): BreakdownLine[] {
  const lines: BreakdownLine[] = [
    {
      id: "job-fee",
      label: "Your fee, excluding btw",
      amount: parts.fee,
      explanation:
        "What you put on the quote. btw is added on top and passed on, so it never changes what you keep.",
    },
  ];

  if (parts.vatRate > 0) {
    lines.push({
      id: "job-invoice-total",
      label: "On the invoice",
      amount: parts.gross,
      explanation: `Your fee plus ${parts.vatRate}% btw. The btw is the Belastingdienst's, held by you until your return.`,
    });
  }

  if (parts.costs > 0) {
    lines.push({
      id: "job-costs",
      label: "Costs for this job",
      amount: parts.costs,
      explanation:
        "Travel, an assistant, equipment rental, licensing. Money that goes straight back out. Deductible, so it lowers your tax, but it still has to come out of the fee first.",
    });
  }

  lines.push(
    {
      id: "job-tax",
      label: "Income tax and Zvw on this job",
      amount: parts.additionalLiability,
      explanation:
        "What this job adds to your bill for the year, worked out across the real brackets on top of the profit you already expect. Not a flat percentage.",
    },
    {
      id: "job-take-home",
      label: "What you keep",
      amount: parts.takeHome,
      explanation:
        "Your fee, minus the costs of doing the work, minus the tax it triggers. This is the number to judge the job on.",
    }
  );

  return lines;
}

function buildAssumptions(
  request: JobOutcomeRequest,
  engineAssumptions: string[],
  costs: Cents,
  crossing: BracketCrossing | null
): string[] {
  const assumptions: string[] = [
    "This is what a fee leaves you, not a view on whether the fee is right for the work. Freelens has no opinion on what your market pays.",
    "Worked out on top of the profit you already expect this year, which is why the same fee is worth different amounts in January and in November.",
  ];

  if (costs > 0) {
    assumptions.push(
      "Costs for this job are treated as fully deductible and are taken out of the fee before tax is worked out."
    );
  }

  if (crossing) {
    assumptions.push(
      "Part of this job is taxed in a higher bracket, so the rate shown is the blend across the job rather than a single bracket rate."
    );
  }

  if (request.vatRate > 0) {
    assumptions.push(
      "btw is added on top and passed straight through. It is never income and never a cost."
    );
  }

  return [...assumptions, ...engineAssumptions];
}
