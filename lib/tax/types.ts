/**
 * Types for the country-driven tax reserve engine.
 *
 * The engine contains no country-specific logic. Everything that differs
 * between countries (or between tax years) lives in a `CountryProfile` loaded
 * from `config/countries/<country>-<year>.json`. Adding a country means adding
 * a JSON file, not writing new code.
 *
 * All monetary values INSIDE the config are plain euros, because that is how
 * the official source publishes them and it keeps the JSON reviewable against
 * the source by eye. They are converted to integer `Cents` at load time, and
 * every calculation from that point on is integer-cent math.
 */
import type { Cents } from "@/lib/domain/money";

/**
 * Which measure of income a credit or contribution is assessed on. The Dutch
 * rules need four distinct measures, and getting them confused is the single
 * biggest source of wrong answers:
 *
 * - `grossProfit`            profit before any deduction
 * - `profitAfterDeductions`  belastbare winst, after ondernemersaftrek + MKB
 * - `taxableIncome`          profitAfterDeductions + otherIncome (verzamelinkomen proxy)
 * - `labourIncome`           grossProfit + otherIncome (arbeidsinkomen)
 *
 * The algemene heffingskorting uses `taxableIncome`; the arbeidskorting uses
 * `labourIncome`, because Belastingdienst defines arbeidsinkomen as "winst uit
 * onderneming vóór ondernemersaftrek en mkb-winstvrijstelling".
 */
export type IncomeBase =
  | "grossProfit"
  | "profitAfterDeductions"
  | "taxableIncome"
  | "labourIncome";

/** Condition flags a deduction can require, supplied per taxpayer. */
export type DeductionCondition = "meetsHoursCriterion" | "isStarter";

export interface Provenance {
  /** Dotted path into the profile, e.g. "credits.arbeidskorting.segments". */
  field: string;
  /** Official source only. Never an aggregator, blog, or bank explainer. */
  sourceUrl: string;
  /** ISO date the value was checked against the source, not its publication date. */
  retrievedAt: string;
  note?: string;
  /** true when computed from other sourced values rather than published directly. */
  derived?: boolean;
}

export interface VatRateConfig {
  id: string;
  label: string;
  /** Percent, e.g. 21 for 21%. */
  rate: number;
}

export interface BracketConfig {
  /** Upper bound in euros, inclusive. `null` marks the top bracket. */
  upTo: number | null;
  /** Combined percent (income tax plus premies volksverzekeringen where levied). */
  rate: number;
}

export interface BracketComposition {
  upTo: number | null;
  incomeTaxRate: number;
  socialPremiumRate: number;
  combinedRate: number;
}

export interface DeductionConfig {
  id: string;
  label: string;
  explanation: string;
  type: "fixed" | "percentage";
  /** Euros for "fixed", percent for "percentage". */
  value: number;
  /** Deduction ids that must already be applied before this one. */
  appliesAfter: string[];
  /** When true the deduction may not exceed the base it is applied to. */
  cappedAtBase: boolean;
  /** Deduction ids whose presence lifts `cappedAtBase`. */
  capWaivedBy: string[];
  conditions: DeductionCondition[];
  /** Whether this deduction counts toward the top-bracket rate adjustment. */
  subjectToRateAdjustment: boolean;
}

/**
 * One piece of a piecewise-linear credit function. For income x in
 * [from, to]: credit = baseAmount + rate% x (x - from).
 *
 * A flat segment is `rate: 0`; a build-up is a positive rate; a phase-out is a
 * negative rate. This single shape expresses both Dutch credits (a 3-row and a
 * 5-row table) and generalises to any other country's credit schedule.
 */
export interface CreditSegment {
  /** Lower bound in euros, inclusive. */
  from: number;
  /** Upper bound in euros, inclusive. `null` marks the final segment. */
  to: number | null;
  baseAmount: number;
  rate: number;
}

export interface CreditConfig {
  id: string;
  label: string;
  explanation: string;
  base: IncomeBase;
  /** Ascending, contiguous, non-overlapping. */
  segments: CreditSegment[];
}

/**
 * Caps the benefit of deductions in the top bracket. In NL this is the
 * "tariefsaanpassing aftrekposten": deductions reduce income at the top rate,
 * then a correction is added back so the net benefit is capped.
 */
export interface RateAdjustmentConfig {
  id: string;
  label: string;
  explanation: string;
  /** Percent added back, e.g. 11.94. */
  correctionRate: number;
  /** Income in euros above which the adjustment bites. */
  appliesAboveIncome: number;
  /** Documentation only, never used in the maths. */
  resultingMaxBenefitRate: number;
}

export interface SocialContributionConfig {
  id: string;
  label: string;
  explanation: string;
  /** Percent, e.g. 4.85. */
  rate: number;
  base: IncomeBase;
  /** Maximum contribution base in euros, or null for uncapped. */
  cap: number | null;
  floorAtZero: boolean;
  /**
   * false when the base could not be confirmed from the official source. The
   * engine then emits an explicit assumption line rather than presenting the
   * figure as settled.
   */
  baseVerified: boolean;
}

export interface CountryProfile {
  country: string;
  taxYear: number;
  currency: string;
  configVersion: string;
  /** ISO date every figure in this profile was last checked against source. */
  configRetrievedAt: string;
  /** Which taxpayer this profile describes, e.g. "under-AOW-age". */
  taxpayerProfile: string;
  vatRates: VatRateConfig[];
  brackets: BracketConfig[];
  /** Documentation of what each bracket rate is made of. Not used in maths. */
  bracketComposition: BracketComposition[];
  deductions: DeductionConfig[];
  credits: CreditConfig[];
  rateAdjustment: RateAdjustmentConfig | null;
  socialContributions: SocialContributionConfig[];
  /** Profile-level caveats, copied verbatim into every result. */
  assumptions: string[];
  provenance: Provenance[];
}

export interface TaxInput {
  taxYear: number;
  country: string;
  /** Revenue ex VAT minus business costs, in euros. May be negative. */
  projectedAnnualProfit: number;
  /** Already set aside this year, in euros. */
  ytdReserved: number;
  /**
   * Profit already earned this year, in euros, BEFORE this payment. Defaults
   * to 0, i.e. this is the first payment of the year.
   *
   * Together with `ytdReserved` this is what makes the per-payment reserve a
   * running balance rather than a rate. Without it every payment would be
   * treated as the first one and the year would end wildly over-reserved.
   */
  ytdProfit?: number;
  meetsHoursCriterion: boolean;
  isStarter: boolean;
  /** Employment income or benefits, in euros. Defaults to 0. */
  otherIncome?: number;
  /**
   * Loonheffing an employer already withheld on `otherIncome` this year, in
   * euros. Defaults to 0.
   *
   * It is a prepayment, not a deduction: it comes off the tax owed after
   * credits, floored at zero. Without it a hybrid taxpayer is told to reserve
   * for tax that has already been paid on their behalf.
   */
  otherIncomeTaxWithheld?: number;
  /**
   * A single payment (ex VAT) being assessed, in euros. Only needed to produce
   * `safeToSpend`; every other output is annual and ignores it.
   */
  paymentReceived?: number;
}

export interface BreakdownLine {
  id: string;
  label: string;
  amount: Cents;
  explanation: string;
}

export interface TaxResult {
  country: string;
  taxYear: number;
  currency: string;

  /** Belastbare winst: profit after ondernemersaftrek and the MKB exemption. */
  profitAfterDeductions: Cents;
  /**
   * What the bracket table is actually applied to: profitAfterDeductions plus
   * other income, floored at zero.
   *
   * Exposed because it is the only figure a bracket threshold can be compared
   * against. Profit is not: €10.000 more profit adds well under €10.000 of
   * taxable income once the deductions and the MKB exemption have taken their
   * share.
   */
  taxableIncome: Cents;

  /** Income tax plus social contributions owed for the year. */
  totalLiability: Cents;
  /** Bracket tax plus rate adjustment, before credits. */
  grossTax: Cents;
  /** Credits actually applied (never more than `grossTax`). */
  credits: Cents;
  /** Tax already withheld by an employer and applied against the bill. */
  taxAlreadyWithheld: Cents;
  /** max(0, grossTax - credits - taxAlreadyWithheld). */
  netTax: Cents;
  /** Social contributions, shown separately and never folded into netTax. */
  zvw: Cents;

  /** totalLiability / grossProfit, as a fraction. 0 when profit <= 0. */
  effectiveRate: number;
  /** Tax on the next euro of profit, as a fraction. Powers the reverse direction. */
  marginalRate: number;

  /** Still to set aside, rounded UP to the whole euro. Never negative. */
  reserveGap: Cents;
  /** Set only when `paymentReceived` was supplied. */
  safeToSpend: Cents | null;
  /** Held back from this payment. Set only when `paymentReceived` was supplied. */
  reserveFromThisPayment: Cents | null;

  breakdown: BreakdownLine[];
  assumptions: string[];
  configVersion: string;
  configRetrievedAt: string;
}
