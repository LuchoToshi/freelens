"use client";

import { useEffect, useState } from "react";
import { loadAppState } from "@/lib/domain/persistence";
import { asCentsUnsafe, fromCents } from "@/lib/domain/money";
import type { RateProfile } from "@/components/rate/guided-rate-calculator";

export interface RateProfileState {
  profile: RateProfile;
  /** Profit already expected this year. Only the per-job mode needs it. */
  projectedProfit: number;
  hydrated: boolean;
}

const EMPTY: RateProfile = {
  meetsHoursCriterion: false,
  isStarter: false,
  otherIncome: 0,
  otherIncomeTaxWithheld: 0,
};

/**
 * The saved tax profile, read once and never written back.
 *
 * `useAppState` cannot be used here. It autosaves on every state change, so
 * merely mounting it writes a record to localStorage. That is right for the
 * workspace, where the user is editing their own data, and wrong everywhere
 * else: someone reading the homepage or trying a rate has not asked Freelens to
 * remember anything, and the homepage says out loud that nothing is saved.
 *
 * Reading in an effect rather than a lazy initializer keeps the server and the
 * first client render identical, which is what stops a hydration mismatch.
 */
export function useRateProfile(): RateProfileState {
  const [value, setValue] = useState<RateProfileState>({
    profile: EMPTY,
    projectedProfit: 0,
    hydrated: false,
  });

  useEffect(() => {
    const { state } = loadAppState();
    const guided =
      state.setup?.reserveMethod.mode === "guided-estimate"
        ? state.setup.reserveMethod
        : null;

    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setValue({
      profile: {
        meetsHoursCriterion: guided?.meetsHoursCriterion ?? false,
        isStarter: guided?.isStarter ?? false,
        otherIncome: fromCents(guided?.otherIncomeCents ?? asCentsUnsafe(0)),
        otherIncomeTaxWithheld: fromCents(
          guided?.otherIncomeTaxWithheldCents ?? asCentsUnsafe(0)
        ),
      },
      projectedProfit: guided
        ? fromCents(
            asCentsUnsafe(
              guided.expectedAnnualRevenueExVatCents -
                guided.expectedDeductibleCostsExVatCents
            )
          )
        : 0,
      hydrated: true,
    });
  }, []);

  return value;
}
