/**
 * The reverse direction: what do I have to quote to keep a given amount?
 *
 * The forward engine answers "of this payment, what is mine". This answers the
 * question freelancers actually ask before sending a proposal: "I need €X in my
 * pocket, what do I put on the invoice."
 *
 * It is solved by bisecting the real liability function, NOT by dividing the
 * target by one minus the marginal rate. The liability curve is piecewise
 * linear with kinks at bracket edges, both credit phase-outs, the deduction cap
 * and the contribution ceiling, so a single job can straddle two or three
 * regimes. On a €10.000 job at €36.000 of existing profit the marginal-rate
 * shortcut quotes €16.417,67 where the true answer is €17.756,65, and the
 * freelancer who used it ends the job €681,30 short of what they meant to keep.
 * The whole error is the bracket edge the shortcut cannot see. Bisection over
 * the real function is correct at every point.
 *
 * This tells the freelancer their floor: what they need to charge to keep what
 * they asked for. It says nothing about what the market will pay.
 */
import { asCentsUnsafe, fromCents, toCents, type Cents } from "@/lib/domain/money";
import { addVatExclusive } from "@/lib/domain/vat";
import { detectBracketCrossing, type BracketCrossing } from "@/lib/tax/bracketCrossing";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { loadProfile } from "@/lib/tax/loadProfile";
import { solveNetDelta } from "@/lib/tax/solve";
import type { BreakdownLine, TaxInput } from "@/lib/tax/types";

export interface QuoteRequest {
  taxYear: number;
  country: string;
  /** What you want to keep from this job, in euros, after tax and after costs. */
  targetNet: number;
  /**
   * Deductible costs specific to this job, in euros: travel, an assistant,
   * equipment rental, licensing. Defaults to 0.
   *
   * These raise the quote euro for euro but never raise taxable profit, because
   * they come off the profit the job produces. Leaving them out of the quote is
   * the error that costs real money: it silently converts them into a discount.
   */
  jobCosts?: number;
  /** Profit already projected for the year, before this job, in euros. */
  currentProjectedProfit: number;
  /** Percent to add on top of the quote, e.g. 21. */
  vatRate: number;
  meetsHoursCriterion: boolean;
  isStarter: boolean;
  otherIncome?: number;
  otherIncomeTaxWithheld?: number;
}

export interface QuoteResult {
  /** What the caller asked to keep, in cents. */
  targetNet: Cents;
  /** Job costs echoed back, clamped at zero. */
  jobCosts: Cents;
  /** The part of the quote that becomes taxable profit: quoteExVat - jobCosts. */
  taxableDelta: Cents;
  /** What to quote before btw. Includes the job costs. */
  quoteExVat: Cents;
  vat: Cents;
  /** What to put on the invoice. */
  quoteInclVat: Cents;
  /** Extra income tax and Zvw this job triggers. */
  additionalLiability: Cents;
  /**
   * additionalLiability / taxableDelta, as a fraction. The average rate across
   * this job, not the marginal rate at any single point: a job that crosses a
   * bracket is taxed at more than one rate and this is the blend.
   */
  effectiveJobRate: number;
  /** quoteExVat - jobCosts - additionalLiability. Never below targetNet. */
  takeHome: Cents;
  /**
   * Set when this job pushes taxable income past a bracket threshold. null when
   * the whole job is taxed in one bracket, which is the common case.
   */
  bracketCrossing: BracketCrossing | null;
  breakdown: BreakdownLine[];
  assumptions: string[];
  /** Bisection steps taken. Exposed so tests can catch a convergence problem. */
  iterations: number;
  configVersion: string;
  configRetrievedAt: string;
}

function toTaxInput(profitEuros: number, request: QuoteRequest): TaxInput {
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

/**
 * Returns the amount to quote so that `targetNet` is left after tax and costs.
 *
 * The solve is on the TAXABLE part of the job. Job costs are deductible, so
 * they never enter the tax calculation; they are added to the quote afterwards,
 * in full. Doing it the other way round (grossing the costs up for tax) would
 * over-quote by taxing money that goes straight back out.
 */
export function quoteForTargetNet(request: QuoteRequest): QuoteResult {
  const target = toCents(request.targetNet);
  const costs = toCents(Math.max(0, request.jobCosts ?? 0));
  const baseProfit = toCents(request.currentProjectedProfit);

  const baseResult = calculateTaxReserve(toTaxInput(request.currentProjectedProfit, request));
  const baseLiability = baseResult.totalLiability;

  const resultAt = (profit: Cents) =>
    calculateTaxReserve(toTaxInput(fromCents(profit), request));
  const liabilityAt = (profit: Cents): Cents => resultAt(profit).totalLiability;

  const { delta: taxableDelta, iterations } = solveNetDelta(target, baseProfit, liabilityAt);

  // A job with costs and no profit target still has to be paid for. Quoting
  // zero here would hand the client the costs as a discount.
  const quoteExVat = asCentsUnsafe(taxableDelta + costs);
  const profitAfter = asCentsUnsafe(baseProfit + taxableDelta);
  const additionalLiability = asCentsUnsafe(liabilityAt(profitAfter) - baseLiability);

  const bracketCrossing = detectBracketCrossing(
    baseProfit,
    profitAfter,
    loadProfile(request.country, request.taxYear).brackets,
    (profit) => resultAt(profit).taxableIncome
  );
  const { vat, gross } = addVat(quoteExVat, request.vatRate);
  const takeHome = asCentsUnsafe(quoteExVat - costs - additionalLiability);

  return {
    targetNet: target,
    jobCosts: costs,
    taxableDelta,
    quoteExVat,
    vat,
    quoteInclVat: gross,
    additionalLiability,
    effectiveJobRate: taxableDelta > 0 ? additionalLiability / taxableDelta : 0,
    takeHome,
    bracketCrossing,
    breakdown: buildQuoteBreakdown({
      quoteExVat,
      vat,
      gross,
      costs,
      taxableDelta,
      additionalLiability,
      takeHome,
      vatRate: request.vatRate,
    }),
    assumptions: buildQuoteAssumptions(
      request,
      baseResult.assumptions,
      costs,
      bracketCrossing
    ),
    iterations,
    configVersion: baseResult.configVersion,
    configRetrievedAt: baseResult.configRetrievedAt,
  };
}

function addVat(netCents: Cents, rate: number): { vat: Cents; gross: Cents } {
  if (rate === 21 || rate === 9) {
    const split = addVatExclusive(netCents, rate);
    return { vat: split.vatCents, gross: split.grossCents };
  }
  // Same rule as addVatExclusive, for rates that module does not enumerate.
  const vat = asCentsUnsafe(Math.round((netCents * rate) / 100));
  return { vat, gross: asCentsUnsafe(netCents + vat) };
}

function buildQuoteBreakdown(parts: {
  quoteExVat: Cents;
  vat: Cents;
  gross: Cents;
  costs: Cents;
  taxableDelta: Cents;
  additionalLiability: Cents;
  takeHome: Cents;
  vatRate: number;
}): BreakdownLine[] {
  const lines: BreakdownLine[] = [
    {
      id: "quote-ex-vat",
      label: "What to quote, excluding btw",
      amount: parts.quoteExVat,
      explanation:
        "The price on your proposal before btw. This is the number the rest of the calculation works from.",
    },
    {
      id: "quote-vat",
      label: `btw at ${parts.vatRate}%`,
      amount: parts.vat,
      explanation:
        "Charged on top and passed straight to the Belastingdienst. It is never yours, so it plays no part in what you keep.",
    },
    {
      id: "quote-incl-vat",
      label: "What the client pays",
      amount: parts.gross,
      explanation: "The invoice total: your price plus the btw.",
    },
  ];

  if (parts.costs > 0) {
    lines.push({
      id: "quote-job-costs",
      label: "Costs for this job",
      amount: parts.costs,
      explanation:
        "Money that goes straight back out again: travel, an assistant, rental, licensing. Added to the quote in full, because they lower your profit rather than your tax bill by the same amount.",
    });
    lines.push({
      id: "quote-taxable-delta",
      label: "Profit this job adds",
      amount: parts.taxableDelta,
      explanation: "Your price minus the costs above. Only this part is taxed.",
    });
  }

  lines.push(
    {
      id: "quote-additional-liability",
      label: "Income tax and Zvw this job adds",
      amount: parts.additionalLiability,
      explanation:
        "The difference between your bill for the year with this job and without it. Worked out on your real brackets, so a job that pushes you into a higher one is priced for that.",
    },
    {
      id: "quote-take-home",
      label: "What you keep",
      amount: parts.takeHome,
      explanation: "Your price, minus the costs, minus the tax this job adds.",
    }
  );

  return lines;
}

function buildQuoteAssumptions(
  request: QuoteRequest,
  engineAssumptions: string[],
  costs: Cents,
  crossing: BracketCrossing | null
): string[] {
  const assumptions = [
    "This is what you need to charge to keep what you asked for. It is not what the market will pay, and Freelens has no view on that.",
    `Worked out as an addition to the €${Math.round(
      request.currentProjectedProfit
    ).toLocaleString("nl-NL")} profit you already expect this year. A different projection gives a different answer, because the tax on this job depends on where the rest of your year lands.`,
    ...engineAssumptions,
  ];

  if (costs > 0) {
    assumptions.push(
      "Your costs for this job are added to the quote in full and are not taxed, because they are deductible. The btw you pay on them is reclaimed through your btw-aangifte and is not part of this figure."
    );
  }

  if (crossing) {
    assumptions.push(
      `This job takes your taxable income past €${crossing.threshold.toLocaleString(
        "nl-NL"
      )}, so part of it is taxed in a higher bracket. That is why the quote is higher than a flat percentage would suggest.`
    );
  }

  return assumptions;
}
