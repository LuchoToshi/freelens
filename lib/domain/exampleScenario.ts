/**
 * The one worked example the site is allowed to show.
 *
 * Before this module the homepage told three different stories about the same
 * €2.500 payment: the hero ran it through the engine and said €1.790 was yours,
 * the problem section had €1.246 hardcoded, and how-it-works and the privacy
 * panel had €1.446. All three were on screen within one scroll. The hardcoded
 * pair also disagreed with the engine on the reserve by more than a factor of
 * two, which is the one number the product exists to get right.
 *
 * So the illustrations no longer carry figures. They ask for them here, and
 * every figure is computed from the same scenario through the same engine that
 * serves the real tool. A rate change moves the whole site at once, or it moves
 * nothing and a test fails.
 *
 * Pure, and pinned by `exampleScenario.test.ts`. No clock, no storage.
 */
import {
  addCents,
  asCentsUnsafe,
  toCents,
  type Cents,
} from "@/lib/domain/money";
import { resolvePaymentVat } from "@/lib/domain/vat";
import { allocatePayment } from "@/lib/domain/allocation";
import { calculatePerPaymentReserve } from "@/lib/domain/reserves";
import { outcomeForJobFee } from "@/lib/tax/jobOutcome";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";

/**
 * One freelancer, one year, both moments. The payment side and the quote side
 * share this profile on purpose: they are the same person at two points in the
 * same job, and the site claims they are one engine.
 */
export const EXAMPLE = {
  /** The payment that lands, including btw. */
  paymentGross: 2_500,
  /** The fee being considered on a quote, excluding btw. */
  jobFeeExVat: 1_800,
  /** Costs this one job puts back out (travel, an assistant, rental). */
  jobCosts: 0,
  /** Business costs this payment has to cover. */
  businessCosts: 200,
  /** Profit already expected this year, before either of the above. */
  annualProfit: 40_000,
  vatRate: 21,
  /** The btw treatment as the VAT helpers name it. */
  vatTreatment: "21",
  meetsHoursCriterion: true,
  isStarter: false,
} as const;

export const EXAMPLE_TAX_YEAR = latestProfileYear(DEFAULT_COUNTRY) ?? 0;

export interface ExamplePaymentSplit {
  gross: Cents;
  vat: Cents;
  reserve: Cents;
  business: Cents;
  yours: Cents;
  /** Share of this payment held back for tax, as a percentage. */
  reserveSharePercent: number | null;
}

/**
 * "A payment landed. What is actually mine?"
 *
 * @param amountCents Overrides the canonical amount so the interactive version
 *   of this example can recompute as the visitor types. Defaults to the
 *   scenario's own figure, which is what every static illustration uses.
 * @param includesVat Whether `amountCents` already contains the btw. When it
 *   does not, the btw is added on top, because a fee quoted ex btw still
 *   arrives in the bank account with the btw attached.
 */
export function examplePaymentSplit(
  amountCents: Cents = toCents(EXAMPLE.paymentGross),
  includesVat = true
): ExamplePaymentSplit {
  const resolved = resolvePaymentVat(
    amountCents,
    EXAMPLE.vatTreatment,
    includesVat
  );
  const grossCents = includesVat
    ? amountCents
    : addCents(amountCents, resolved.vatCents ?? asCentsUnsafe(0));
  const vat = includesVat
    ? resolved
    : resolvePaymentVat(grossCents, EXAMPLE.vatTreatment, true);
  const reserve = calculatePerPaymentReserve({
    paymentNetCents: vat.netCents,
    taxYear: EXAMPLE_TAX_YEAR,
    country: DEFAULT_COUNTRY,
    projectedAnnualProfitCents: toCents(EXAMPLE.annualProfit),
    // The example is the first payment of the year: nothing earned or set
    // aside yet, so the reserve is this payment's share of the whole year's
    // bill rather than a marginal rate applied to it.
    ytdProfitCents: asCentsUnsafe(0),
    ytdReservedCents: asCentsUnsafe(0),
    meetsHoursCriterion: EXAMPLE.meetsHoursCriterion,
    isStarter: EXAMPLE.isStarter,
    otherIncomeCents: asCentsUnsafe(0),
    otherIncomeTaxWithheldCents: asCentsUnsafe(0),
  });

  const business = toCents(EXAMPLE.businessCosts);
  const allocation = allocatePayment({
    grossPaymentCents: grossCents,
    vat,
    reserve: {
      cents: reserve?.reserveCents ?? asCentsUnsafe(0),
      source: "guided-estimate",
    },
    obligations: [{ label: "business", cents: business }],
    bufferCents: asCentsUnsafe(0),
  });

  return {
    gross: allocation.grossPaymentCents,
    vat: allocation.vatComponentCents ?? asCentsUnsafe(0),
    reserve: allocation.reserveCents,
    business: allocation.obligationsCents,
    yours: allocation.availableForPersonalPayoutCents,
    // The share actually held back, not the marginal rate. The hero used to
    // print the marginal rate next to a reserve computed a different way, so
    // the sentence and the number below it disagreed by 26 points.
    reserveSharePercent: reserve
      ? Math.round(reserve.appliedRate * 1000) / 10
      : null,
  };
}

export interface ExampleQuoteSplit {
  fee: Cents;
  vat: Cents;
  invoiceTotal: Cents;
  jobCosts: Cents;
  tax: Cents;
  yours: Cents;
  /** Share of the fee that survives, as a percentage. */
  keptSharePercent: number;
}

/** "I am thinking of quoting this. What is left?" */
export function exampleQuoteSplit(
  feeExVat: number = EXAMPLE.jobFeeExVat
): ExampleQuoteSplit {
  const outcome = outcomeForJobFee({
    taxYear: EXAMPLE_TAX_YEAR,
    country: DEFAULT_COUNTRY,
    feeExVat,
    jobCosts: EXAMPLE.jobCosts,
    currentProjectedProfit: EXAMPLE.annualProfit,
    vatRate: EXAMPLE.vatRate,
    meetsHoursCriterion: EXAMPLE.meetsHoursCriterion,
    isStarter: EXAMPLE.isStarter,
  });

  return {
    fee: outcome.feeExVat,
    vat: outcome.vat,
    invoiceTotal: outcome.feeInclVat,
    jobCosts: outcome.jobCosts,
    tax: outcome.additionalLiability,
    yours: outcome.takeHome,
    keptSharePercent: Math.round(outcome.keptShare * 1000) / 10,
  };
}
