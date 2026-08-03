/**
 * Country profile loading and validation.
 *
 * Profiles are statically imported, so a missing file is a build error rather
 * than a runtime surprise, and the engine never touches the network. Every
 * profile is validated on first use: a null, a missing figure, or an
 * inconsistent table throws immediately. A wrong reserve is worse than no
 * reserve, so we refuse to calculate rather than guess.
 */
import nl2026 from "@/config/countries/nl-2026.json";
import type {
  CountryProfile,
  CreditConfig,
  DeductionConfig,
} from "@/lib/tax/types";

export class TaxProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaxProfileError";
  }
}

const PROFILES: Record<string, unknown> = {
  "NL-2026": nl2026,
};

function profileKey(country: string, taxYear: number): string {
  return `${country.toUpperCase()}-${taxYear}`;
}

/** Every country/year combination this build can calculate. */
export function availableProfiles(): string[] {
  return Object.keys(PROFILES).sort();
}

export const DEFAULT_COUNTRY = "NL";

/**
 * The most recent year this build has verified figures for.
 *
 * Used as a default in the UI so adding a profile is the only step needed to
 * roll the product forward a year. Returns null when a country has none, which
 * callers must handle rather than falling back to a different country.
 */
export function latestProfileYear(country: string): number | null {
  const prefix = `${country.toUpperCase()}-`;
  const years = Object.keys(PROFILES)
    .filter((key) => key.startsWith(prefix))
    .map((key) => Number(key.slice(prefix.length)))
    .filter((year) => Number.isFinite(year));
  return years.length > 0 ? Math.max(...years) : null;
}

const validated = new Set<string>();

/**
 * Returns the profile for a country and tax year.
 *
 * Throws `TaxProfileError` when no profile exists, rather than falling back to
 * another year. Prior-year figures silently applied to the current year is the
 * exact failure this design exists to prevent.
 */
export function loadProfile(country: string, taxYear: number): CountryProfile {
  const key = profileKey(country, taxYear);
  const raw = PROFILES[key];
  if (!raw) {
    throw new TaxProfileError(
      `No verified tax profile for ${country} ${taxYear}. Available: ${availableProfiles().join(", ")}.`
    );
  }
  const profile = raw as CountryProfile;
  if (!validated.has(key)) {
    validateProfile(profile, key);
    validated.add(key);
  }
  return profile;
}

function requireFinite(value: unknown, key: string, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TaxProfileError(
      `${key}: "${field}" is ${value === null ? "null" : String(value)}. ` +
        `It must be verified against the official source before this profile can be used. See NEEDS_VERIFICATION.md.`
    );
  }
  return value;
}

export function validateProfile(profile: CountryProfile, key = "profile"): void {
  if (!profile.configVersion || !profile.configRetrievedAt) {
    throw new TaxProfileError(`${key}: configVersion and configRetrievedAt are required.`);
  }

  validateBrackets(profile, key);
  profile.deductions.forEach((d, i) => validateDeduction(d, i, profile.deductions, key));
  profile.credits.forEach((c) => validateCredit(c, key));

  if (profile.rateAdjustment) {
    requireFinite(profile.rateAdjustment.correctionRate, key, "rateAdjustment.correctionRate");
    requireFinite(profile.rateAdjustment.appliesAboveIncome, key, "rateAdjustment.appliesAboveIncome");
  }

  for (const contribution of profile.socialContributions) {
    requireFinite(contribution.rate, key, `socialContributions.${contribution.id}.rate`);
    if (contribution.cap !== null) {
      requireFinite(contribution.cap, key, `socialContributions.${contribution.id}.cap`);
    }
  }

  for (const vat of profile.vatRates) {
    requireFinite(vat.rate, key, `vatRates.${vat.id}.rate`);
  }

  if (profile.provenance.length === 0) {
    throw new TaxProfileError(`${key}: every profile must record where its figures came from.`);
  }
  for (const entry of profile.provenance) {
    if (!entry.sourceUrl || !entry.retrievedAt) {
      throw new TaxProfileError(
        `${key}: provenance entry for "${entry.field}" is missing a sourceUrl or retrievedAt.`
      );
    }
  }
}

function validateBrackets(profile: CountryProfile, key: string): void {
  const { brackets } = profile;
  if (brackets.length === 0) {
    throw new TaxProfileError(`${key}: brackets must not be empty.`);
  }
  let previousBound = 0;
  brackets.forEach((bracket, index) => {
    requireFinite(bracket.rate, key, `brackets[${index}].rate`);
    const isLast = index === brackets.length - 1;
    if (isLast) {
      if (bracket.upTo !== null) {
        throw new TaxProfileError(`${key}: the final bracket must have "upTo": null.`);
      }
      return;
    }
    const bound = requireFinite(bracket.upTo, key, `brackets[${index}].upTo`);
    if (bound <= previousBound) {
      throw new TaxProfileError(
        `${key}: bracket bounds must ascend, but brackets[${index}].upTo (${bound}) does not exceed ${previousBound}.`
      );
    }
    previousBound = bound;
  });
}

function validateDeduction(
  deduction: DeductionConfig,
  index: number,
  all: DeductionConfig[],
  key: string
): void {
  requireFinite(deduction.value, key, `deductions.${deduction.id}.value`);
  const earlier = new Set(all.slice(0, index).map((d) => d.id));
  for (const dependency of deduction.appliesAfter) {
    if (!earlier.has(dependency)) {
      throw new TaxProfileError(
        `${key}: deduction "${deduction.id}" declares appliesAfter "${dependency}", ` +
          `which must appear earlier in the deductions array.`
      );
    }
  }
  const ids = new Set(all.map((d) => d.id));
  for (const waiver of deduction.capWaivedBy) {
    if (!ids.has(waiver)) {
      throw new TaxProfileError(
        `${key}: deduction "${deduction.id}" declares capWaivedBy "${waiver}", which is not a known deduction.`
      );
    }
  }
}

function validateCredit(credit: CreditConfig, key: string): void {
  if (credit.segments.length === 0) {
    throw new TaxProfileError(`${key}: credit "${credit.id}" has no segments.`);
  }
  credit.segments.forEach((segment, index) => {
    const label = `credits.${credit.id}.segments[${index}]`;
    requireFinite(segment.from, key, `${label}.from`);
    requireFinite(segment.baseAmount, key, `${label}.baseAmount`);
    requireFinite(segment.rate, key, `${label}.rate`);

    const isLast = index === credit.segments.length - 1;
    if (isLast) {
      if (segment.to !== null) {
        throw new TaxProfileError(`${key}: the final segment of "${credit.id}" must have "to": null.`);
      }
      return;
    }
    const to = requireFinite(segment.to, key, `${label}.to`);
    if (to <= segment.from) {
      throw new TaxProfileError(`${key}: ${label} has to (${to}) at or below from (${segment.from}).`);
    }
    const next = credit.segments[index + 1];
    if (next.from !== to) {
      throw new TaxProfileError(
        `${key}: credit "${credit.id}" has a gap or overlap between segment ${index} (to ${to}) ` +
          `and segment ${index + 1} (from ${next.from}). Segments must be contiguous.`
      );
    }
  });
  if (credit.segments[0].from !== 0) {
    throw new TaxProfileError(`${key}: credit "${credit.id}" must start at income 0.`);
  }
}
