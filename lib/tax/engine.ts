/**
 * The tax reserve engine.
 *
 * Pure functions. No network, no filesystem, no React, no reading of the system
 * clock. The tax year is an explicit input, so the same input always produces
 * the same output, forever.
 *
 * What it answers, in both directions:
 *  - forward: given a projected profit and a payment, what should be set aside
 *  - reverse: `marginalRate` is the tax on the next euro, which is what
 *    `quoteForTargetNet` in ./quote.ts needs
 *
 * What it is not: an assessment. Every result carries its assumptions, and the
 * UI is required to show them.
 */
import { asCentsUnsafe, toCents, type Cents } from "@/lib/domain/money";
import { bracketTax, rateAdjustment } from "@/lib/tax/brackets";
import { evaluateCredits, type AppliedCredit } from "@/lib/tax/credits";
import { applyDeductions, type TaxpayerFlags } from "@/lib/tax/deductions";
import { loadProfile } from "@/lib/tax/loadProfile";
import { ceilCents, ceilToEuro, percentUp } from "@/lib/tax/rounding";
import type {
  BreakdownLine,
  CountryProfile,
  IncomeBase,
  TaxInput,
  TaxResult,
} from "@/lib/tax/types";

interface AppliedContribution {
  id: string;
  label: string;
  explanation: string;
  assessedOn: Cents;
  amount: Cents;
  cappedAt: Cents | null;
  baseVerified: boolean;
}

interface Liability {
  grossProfit: Cents;
  otherIncome: Cents;
  deductions: ReturnType<typeof applyDeductions>;
  profitAfterDeductions: Cents;
  taxableIncome: Cents;
  labourIncome: Cents;
  bracket: ReturnType<typeof bracketTax>;
  adjustment: Cents;
  grossTax: Cents;
  credits: AppliedCredit[];
  creditsEarned: Cents;
  creditsApplied: Cents;
  withheldApplied: Cents;
  netTax: Cents;
  contributions: AppliedContribution[];
  socialTotal: Cents;
  totalLiability: Cents;
}

/**
 * The whole annual calculation for one profit figure. Called three times per
 * result: once for the answer, twice more one euro apart for the marginal rate.
 */
function computeLiability(
  grossProfit: Cents,
  otherIncome: Cents,
  withheld: Cents,
  profile: CountryProfile,
  flags: TaxpayerFlags
): Liability {
  const deductions = applyDeductions(grossProfit, profile, flags);
  const profitAfterDeductions = deductions.profitAfterDeductions;

  const taxableIncome = asCentsUnsafe(Math.max(0, profitAfterDeductions + otherIncome));
  const labourIncome = asCentsUnsafe(Math.max(0, grossProfit + otherIncome));

  const bracket = bracketTax(taxableIncome, profile.brackets);
  const adjustment = rateAdjustment(
    deductions.totalSubjectToRateAdjustment,
    labourIncome,
    profile.rateAdjustment
  );
  const grossTax = asCentsUnsafe(bracket.tax + adjustment);

  const incomeFor = (base: string): Cents => {
    switch (base as IncomeBase) {
      case "grossProfit":
        return grossProfit;
      case "profitAfterDeductions":
        return profitAfterDeductions;
      case "taxableIncome":
        return taxableIncome;
      case "labourIncome":
        return labourIncome;
    }
  };

  const creditResult = evaluateCredits(profile.credits, incomeFor);
  // Credits reduce tax owed but never turn into a payment, so anything above
  // the tax owed is lost. That is the conservative reading for a reserve.
  const creditsApplied = asCentsUnsafe(Math.min(creditResult.total, grossTax));
  const taxAfterCredits = Math.max(0, grossTax - creditsApplied);
  // Wage tax an employer already paid over is a prepayment against this bill,
  // not another deduction. Anything beyond the bill is a refund the engine does
  // not promise, so it is dropped rather than carried as a negative.
  //
  // Ignored entirely without employment income to have withheld it: a stray
  // figure there would wipe out real tax and under-reserve the user, which is
  // the one direction this engine must never fail in.
  const claimable = otherIncome > 0 ? Math.max(0, withheld) : 0;
  const withheldApplied = asCentsUnsafe(Math.min(claimable, taxAfterCredits));
  const netTax = asCentsUnsafe(taxAfterCredits - withheldApplied);

  const contributions: AppliedContribution[] = [];
  let socialTotal = 0;
  for (const config of profile.socialContributions) {
    let base = incomeFor(config.base);
    if (config.floorAtZero) {
      base = asCentsUnsafe(Math.max(0, base));
    }
    const capCents = config.cap === null ? null : toCents(config.cap);
    if (capCents !== null) {
      base = asCentsUnsafe(Math.min(base, capCents));
    }
    const amount = percentUp(base, config.rate);
    socialTotal += amount;
    contributions.push({
      id: config.id,
      label: config.label,
      explanation: config.explanation,
      assessedOn: base,
      amount,
      cappedAt: capCents,
      baseVerified: config.baseVerified,
    });
  }

  return {
    grossProfit,
    otherIncome,
    deductions,
    profitAfterDeductions,
    taxableIncome,
    labourIncome,
    bracket,
    adjustment,
    grossTax,
    credits: creditResult.credits,
    creditsEarned: creditResult.total,
    creditsApplied,
    withheldApplied,
    netTax,
    contributions,
    socialTotal: asCentsUnsafe(socialTotal),
    totalLiability: asCentsUnsafe(netTax + socialTotal),
  };
}

/**
 * Step size for the marginal rate, in cents (€100).
 *
 * A one-euro step is the textbook definition but it is too small in practice:
 * every line rounds to the cent, so a one-euro difference carries up to a cent
 * of rounding noise, which is a whole percentage point of apparent rate. A
 * hundred-euro step pushes that noise below 0.01% while smearing a bracket edge
 * over an amount too small to matter for a planning estimate.
 */
const MARGINAL_STEP = 10_000;

/**
 * Tax on the next slice of profit, as a fraction.
 *
 * Computed numerically rather than derived by hand. The liability curve has a
 * kink at every bracket edge, at both credit phase-out edges, at the deduction
 * cap, at the contribution ceiling and at the rate-adjustment threshold.
 * Differencing the real function picks up all of them and cannot drift out of
 * sync with the config the way a hand-derived formula would.
 */
export function marginalRateAt(
  grossProfit: Cents,
  otherIncome: Cents,
  withheld: Cents,
  profile: CountryProfile,
  flags: TaxpayerFlags
): number {
  const here = computeLiability(grossProfit, otherIncome, withheld, profile, flags)
    .totalLiability;
  const next = computeLiability(
    asCentsUnsafe(grossProfit + MARGINAL_STEP),
    otherIncome,
    withheld,
    profile,
    flags
  ).totalLiability;
  return (next - here) / MARGINAL_STEP;
}

export function calculateTaxReserve(input: TaxInput): TaxResult {
  const profile = loadProfile(input.country, input.taxYear);
  const flags: TaxpayerFlags = {
    meetsHoursCriterion: input.meetsHoursCriterion,
    isStarter: input.isStarter,
  };

  const grossProfit = toCents(input.projectedAnnualProfit);
  const otherIncome = toCents(input.otherIncome ?? 0);
  const withheld = toCents(input.otherIncomeTaxWithheld ?? 0);
  const ytdReserved = toCents(input.ytdReserved);
  const ytdProfit = toCents(input.ytdProfit ?? 0);

  const liability = computeLiability(grossProfit, otherIncome, withheld, profile, flags);
  const marginalRate = marginalRateAt(grossProfit, otherIncome, withheld, profile, flags);

  // Exact outstanding balance. `reserveGap` is the same figure rounded up for
  // display; the per-payment split works off the exact one so the rounding is
  // applied once at the end rather than compounding across a year of payments.
  const outstanding = asCentsUnsafe(
    Math.max(0, liability.totalLiability - ytdReserved)
  );
  const reserveGap = ceilToEuro(outstanding);

  const paymentNotes: string[] = [];
  let safeToSpend: Cents | null = null;
  let reserveFromThisPayment: Cents | null = null;
  if (input.paymentReceived !== undefined) {
    const payment = toCents(input.paymentReceived);
    const remainingIncome = asCentsUnsafe(Math.max(0, grossProfit - ytdProfit));

    if (payment <= 0) {
      reserveFromThisPayment = asCentsUnsafe(0);
      safeToSpend = asCentsUnsafe(Math.min(0, payment));
    } else if (outstanding <= 0) {
      // Already covered for the year. Reserving anything more would be taking
      // money for a bill that does not exist.
      reserveFromThisPayment = asCentsUnsafe(0);
      safeToSpend = payment;
    } else {
      // This payment's share of what is still owed, allocated across the income
      // still expected this year. NOT the marginal rate: the marginal rate is
      // what the next euro costs, which is far above the average, and charging
      // it on every payment over-reserves the year several times over.
      let raw: number;
      if (remainingIncome <= 0) {
        // The projection is behind reality: the year is already fully earned.
        raw = payment * marginalRate;
        paymentNotes.push(
          "You have already earned your whole projected profit for the year, so this payment is reserved at the rate on your next euro. Raise your projected profit to get a truer figure."
        );
      } else if (payment > remainingIncome) {
        const excess = payment - remainingIncome;
        raw = outstanding + excess * marginalRate;
        paymentNotes.push(
          "This payment is larger than the profit you still expect this year. The part beyond your projection is reserved at the rate on your next euro. Raise your projected profit to get a truer figure."
        );
      } else {
        raw = (outstanding * payment) / remainingIncome;
      }

      let held = ceilToEuro(ceilCents(raw));
      if (held > payment) {
        held = payment;
        paymentNotes.push(
          "This payment is not enough to cover what is still owed for the year, so all of it is set aside."
        );
      }
      reserveFromThisPayment = held;
      safeToSpend = asCentsUnsafe(payment - held);
    }
  }

  // Measured against all the income the liability was calculated on, not just
  // the business profit. Dividing by profit alone would report a rate above 50%
  // for someone with a job alongside the business, which is nonsense.
  const totalIncome = Math.max(0, grossProfit + otherIncome);
  const effectiveRate = totalIncome > 0 ? liability.totalLiability / totalIncome : 0;

  return {
    country: profile.country,
    taxYear: profile.taxYear,
    currency: profile.currency,

    profitAfterDeductions: liability.profitAfterDeductions,
    taxableIncome: liability.taxableIncome,

    totalLiability: liability.totalLiability,
    grossTax: liability.grossTax,
    credits: liability.creditsApplied,
    taxAlreadyWithheld: liability.withheldApplied,
    netTax: liability.netTax,
    zvw: liability.socialTotal,

    effectiveRate,
    marginalRate,

    reserveGap,
    safeToSpend,
    reserveFromThisPayment,

    breakdown: buildBreakdown(liability, ytdReserved, reserveGap, profile),
    assumptions: buildAssumptions(liability, profile, flags, paymentNotes),
    configVersion: profile.configVersion,
    configRetrievedAt: profile.configRetrievedAt,
  };
}

function buildBreakdown(
  liability: Liability,
  ytdReserved: Cents,
  reserveGap: Cents,
  profile: CountryProfile
): BreakdownLine[] {
  const lines: BreakdownLine[] = [
    {
      id: "gross-profit",
      label: "Projected profit for the year",
      amount: liability.grossProfit,
      explanation:
        "Your revenue excluding VAT, minus your business costs. Tax is calculated on this, not on what your clients pay you.",
    },
  ];

  for (const deduction of liability.deductions.deductions) {
    lines.push({
      id: `deduction-${deduction.id}`,
      label: deduction.applied
        ? deduction.label
        : `${deduction.label} (not applied)`,
      amount: deduction.amount,
      explanation: deduction.applied
        ? deduction.explanation
        : `Not applied because ${deduction.skippedBecause}.`,
    });
  }

  lines.push({
    id: "taxable-profit",
    label: "Profit the tax is calculated on",
    amount: liability.profitAfterDeductions,
    explanation: "What is left of your profit after the deductions above.",
  });

  if (liability.otherIncome !== 0) {
    lines.push({
      id: "other-income",
      label: "Other income",
      amount: liability.otherIncome,
      explanation:
        "Employment income or benefits. Counted here so your rate is right, but tax your employer already withheld is not subtracted.",
    });
    lines.push({
      id: "taxable-income",
      label: "Total taxable income",
      amount: liability.taxableIncome,
      explanation: "Your taxable profit plus your other income.",
    });
  }

  for (const slice of liability.bracket.slices) {
    lines.push({
      id: `bracket-${slice.bracket}`,
      label: `Bracket ${slice.bracket} at ${slice.rate}%`,
      amount: slice.tax,
      explanation: `${formatBand(slice.incomeInBracket)} of your income falls in this bracket.`,
    });
  }

  if (liability.adjustment > 0 && profile.rateAdjustment) {
    lines.push({
      id: "rate-adjustment",
      label: profile.rateAdjustment.label,
      amount: liability.adjustment,
      explanation: profile.rateAdjustment.explanation,
    });
  }

  for (const credit of liability.credits) {
    lines.push({
      id: `credit-${credit.id}`,
      label: credit.label,
      amount: credit.amount,
      explanation: credit.explanation,
    });
  }

  if (liability.creditsEarned > liability.creditsApplied) {
    lines.push({
      id: "credits-limited",
      label: "Credits not usable",
      amount: asCentsUnsafe(liability.creditsEarned - liability.creditsApplied),
      explanation:
        "Your credits add up to more than the income tax you owe. The excess is not paid out, so it does not reduce your bill any further.",
    });
  }

  if (liability.withheldApplied > 0) {
    lines.push({
      id: "tax-already-withheld",
      label: "Tax your employer already withheld",
      amount: liability.withheldApplied,
      explanation:
        "Loonheffing paid over on your salary. It counts against this bill, so you do not need to set it aside again.",
    });
  }

  lines.push({
    id: "net-tax",
    label:
      liability.withheldApplied > 0
        ? "Income tax still to pay"
        : "Income tax after credits",
    amount: liability.netTax,
    explanation:
      liability.withheldApplied > 0
        ? "Bracket tax, minus the credits, minus what your employer already withheld. Never below zero."
        : "Bracket tax minus the credits above. Never below zero.",
  });

  for (const contribution of liability.contributions) {
    lines.push({
      id: `contribution-${contribution.id}`,
      label: contribution.label,
      amount: contribution.amount,
      explanation: contribution.explanation,
    });
  }

  lines.push(
    {
      id: "total-liability",
      label: "Total to pay for the year",
      amount: liability.totalLiability,
      explanation: "Income tax after credits, plus the contributions above.",
    },
    {
      id: "already-reserved",
      label: "Already set aside",
      amount: ytdReserved,
      explanation: "What you have already put away against this year's bill.",
    },
    {
      id: "reserve-gap",
      label: "Still to set aside",
      amount: reserveGap,
      explanation:
        "The rest of this year's bill, rounded up to the whole euro. Rounding always goes up, because a shortfall costs more than a surplus.",
    }
  );

  return lines;
}

function formatBand(cents: Cents): string {
  return `About €${Math.round(cents / 100).toLocaleString("nl-NL")}`;
}

function buildAssumptions(
  liability: Liability,
  profile: CountryProfile,
  flags: TaxpayerFlags,
  paymentNotes: string[] = []
): string[] {
  const assumptions = [
    `Calculated for tax year ${profile.taxYear} using config ${profile.configVersion}, with every figure checked against the official source on ${profile.configRetrievedAt}.`,
    ...profile.assumptions,
  ];

  if (!flags.meetsHoursCriterion) {
    assumptions.push(
      "You have not confirmed the hours criterion, so the entrepreneur deductions are left out. If you do meet it, your bill is lower than this."
    );
  }
  if (liability.creditsEarned > liability.creditsApplied) {
    assumptions.push(
      "Your tax credits are worth more than the income tax you owe. The unused part is not refunded, and this estimate does not assume it will be."
    );
  }
  if (liability.otherIncome > 0 && liability.withheldApplied === 0) {
    assumptions.push(
      "You have employment income but have not entered the loonheffing your employer already withheld, so this estimate is higher than what you actually still owe. The figure is on your jaaropgaaf or a recent payslip."
    );
  }
  if (liability.withheldApplied > 0) {
    assumptions.push(
      "The loonheffing your employer already withheld has been subtracted from the bill. If you have over-withheld, the excess comes back through your return rather than reducing this estimate below zero."
    );
  }
  assumptions.push(...paymentNotes);
  return assumptions;
}
