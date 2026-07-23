/**
 * Versioned tax-year configuration.
 *
 * Every year-specific figure lives here with metadata, never scattered through
 * UI components. Values are either `"active"` (used by a calculation) or
 * `"informational"` (displayed for context on /accuracy, never fed into math).
 *
 * IMPORTANT: These figures require review by a Dutch tax professional before
 * they support a new tax year. See ADD_A_TAX_YEAR_CHECKLIST below.
 */
import { toCents, type Cents } from "@/lib/domain/money";

export interface ReferenceValue<T> {
  taxYear: number;
  value: T;
  /** Human-readable source (publication/section name), not just a URL. */
  sourceTitle: string;
  /** ISO date the value was last checked against the source (not published). */
  dateLastVerified: string;
  notes: string;
  status: "active" | "informational";
}

export type VatNonNumericTreatment =
  | "0"
  | "exempt"
  | "reverse-charged"
  | "kor"
  | "mixed-unsure";

export interface TaxYearConfig {
  taxYear: number;
  verified: true;
  /** Flat, cautious income-tax reserve % for the guided estimate. NOT a bracket calc. */
  guidedEstimateFlatReservePercentage: ReferenceValue<number>;
  zvw: {
    ratePercentage: ReferenceValue<number>;
    maxContributionIncomeCents: ReferenceValue<Cents>;
  };
  vat: {
    standardRatePercentage: ReferenceValue<21>;
    reducedRatePercentage: ReferenceValue<9>;
    nonNumericTreatments: ReadonlyArray<{
      treatment: VatNonNumericTreatment;
      label: string;
      status: "active" | "informational";
    }>;
  };
  /** Informational only, displayed on /accuracy, not used in any calculation. */
  zelfstandigenaftrek: ReferenceValue<Cents>;
  mkbWinstvrijstellingPercentage: ReferenceValue<number>;
}

export interface UnverifiedTaxYearConfig {
  taxYear: number;
  verified: false;
}

export type TaxYearConfigResult = TaxYearConfig | UnverifiedTaxYearConfig;

/*
 * ADD_A_TAX_YEAR_CHECKLIST, before adding an entry for a new year:
 * 1. Verify each figure against the official Belastingdienst.nl publication for
 *    that year: guided-estimate reserve heuristic (re-justify, don't copy),
 *    Zvw rate + max bijdrage-inkomen, VAT rates, zelfstandigenaftrek, MKB %.
 * 2. Set sourceTitle to the exact publication/section; put the URL in notes.
 *    Set dateLastVerified to the date YOU checked it, not the publication date.
 * 3. Re-derive guidedEstimateFlatReservePercentage independently and justify it.
 * 4. Add the new entry to TAX_YEAR_CONFIGS keyed by year. NEVER delete or
 *    overwrite a prior year, past allocations may recalc against their year.
 * 5. Pre-publication estimates: status "informational" + say so in notes; do
 *    not mark "active" until confirmed.
 * 6. Extend taxYearConfig.test.ts fixtures to cover the new year.
 */

const CONFIG_2026: TaxYearConfig = {
  taxYear: 2026,
  verified: true,
  guidedEstimateFlatReservePercentage: {
    taxYear: 2026,
    // 30%: a deliberately cautious, flat income-tax reserve heuristic for the
    // guided estimate. This is NOT a box-1 bracket calculation. Dutch box-1
    // income tax on typical post-deduction freelancer profit sits around the
    // first-bracket rate (~37%); 30% is a simple, memorable planning floor that
    // pairs with a separately-shown Zvw line and a ± range, and is clearly
    // labelled a "planning estimate, not your final assessment" in the UI.
    // Zvw is NEVER folded into this number.
    value: 30,
    sourceTitle:
      "Belastingdienst, Reserve money to pay your taxes (general guidance)",
    dateLastVerified: "2026-07-22",
    notes:
      "Placeholder cautious heuristic for MVP planning guidance only. Requires review by a Dutch tax professional before relying on it. Not derived from a bracket calculation.",
    status: "active",
  },
  zvw: {
    ratePercentage: {
      taxYear: 2026,
      value: 4.85,
      sourceTitle:
        "Belastingdienst, Income-dependent contribution Health Care Insurance Act (Zvw) 2026",
      dateLastVerified: "2026-07-22",
      notes:
        "Assessment-based Zvw contribution rate. Applies to the contribution base up to the maximum below.",
      status: "active",
    },
    maxContributionIncomeCents: {
      taxYear: 2026,
      value: toCents(79409),
      sourceTitle:
        "Belastingdienst, Maximum contribution income Zvw 2026 (€79,409)",
      dateLastVerified: "2026-07-22",
      notes: "Zvw is only levied on the contribution base up to this ceiling.",
      status: "active",
    },
  },
  vat: {
    standardRatePercentage: {
      taxYear: 2026,
      value: 21,
      sourceTitle: "Belastingdienst, VAT rates and exemptions (standard 21%)",
      dateLastVerified: "2026-07-22",
      notes: "General Dutch VAT rate.",
      status: "active",
    },
    reducedRatePercentage: {
      taxYear: 2026,
      value: 9,
      sourceTitle: "Belastingdienst, VAT rates and exemptions (reduced 9%)",
      dateLastVerified: "2026-07-22",
      notes: "Reduced Dutch VAT rate for qualifying goods and services.",
      status: "active",
    },
    nonNumericTreatments: [
      { treatment: "0", label: "0% (e.g. exports, intra-EU)", status: "active" },
      { treatment: "exempt", label: "Exempt", status: "active" },
      { treatment: "reverse-charged", label: "Reverse-charged", status: "active" },
      { treatment: "kor", label: "KOR (Small Businesses Scheme)", status: "active" },
      { treatment: "mixed-unsure", label: "Mixed / unsure", status: "active" },
    ],
  },
  zelfstandigenaftrek: {
    taxYear: 2026,
    value: toCents(1200),
    sourceTitle: "Belastingdienst, Zelfstandigenaftrek 2026 (€1,200)",
    dateLastVerified: "2026-07-22",
    notes:
      "For qualifying entrepreneurs meeting the hours criterion who had not reached AOW age at the start of the year. Informational only in Freelens, not used in any calculation.",
    status: "informational",
  },
  mkbWinstvrijstellingPercentage: {
    taxYear: 2026,
    value: 12.7,
    sourceTitle: "Belastingdienst, MKB profit exemption 2026 (12.7%)",
    dateLastVerified: "2026-07-22",
    notes:
      "12.7% of profit after entrepreneur deductions. Informational only in Freelens, not used in any calculation.",
    status: "informational",
  },
};

const TAX_YEAR_CONFIGS: Readonly<Record<number, TaxYearConfig>> = {
  2026: CONFIG_2026,
};

function currentYear(): number {
  return new Date().getFullYear();
}

/**
 * Returns the config for a year, or `{ verified: false }` when that year has no
 * reviewed entry. NEVER silently falls back to another year's figures. Only the
 * guided-estimate reserve mode depends on a verified config; own-rule and
 * provisional-assessment reserves (and all VAT math) keep working regardless.
 */
export function getActiveTaxYearConfig(
  year: number = currentYear()
): TaxYearConfigResult {
  const config = TAX_YEAR_CONFIGS[year];
  if (config) return config;
  return { taxYear: year, verified: false };
}

export function isVerifiedTaxYearConfig(
  config: TaxYearConfigResult
): config is TaxYearConfig {
  return config.verified;
}
