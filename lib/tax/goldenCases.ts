/**
 * The ten cases the engine is pinned to.
 *
 * Shared between the assertion suite (engine.test.ts) and the comparison table
 * generator (oldVsNew.test.ts), so the evidence and the tests can never drift
 * apart. Revenue and costs are stated separately even where costs are zero,
 * because the old model taxed revenue and the comparison needs both.
 */
import type { TaxInput } from "@/lib/tax/types";

export interface GoldenCase {
  id: number;
  name: string;
  revenueExVat: number;
  costsExVat: number;
  meetsHoursCriterion: boolean;
  isStarter: boolean;
  otherIncome: number;
  /** Loonheffing already withheld on `otherIncome`. Zero for every case but the hybrid. */
  otherIncomeTaxWithheld?: number;
  note: string;
}

export const GOLDEN_CASES: GoldenCase[] = [
  {
    id: 1,
    name: "Starter, €25.000 profit",
    revenueExVat: 25_000,
    costsExVat: 0,
    meetsHoursCriterion: true,
    isStarter: true,
    otherIncome: 0,
    note: "Credits wipe out income tax completely. Only Zvw is owed.",
  },
  {
    id: 2,
    name: "Starter, €31.500 profit",
    revenueExVat: 31_500,
    costsExVat: 0,
    meetsHoursCriterion: true,
    isStarter: true,
    otherIncome: 0,
    note: "Income tax just breaks the surface. Zvw is still the larger bill.",
  },
  {
    id: 3,
    name: "Established, €40.000 profit",
    revenueExVat: 40_000,
    costsExVat: 0,
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncome: 0,
    note: "The typical full-time freelance year.",
  },
  {
    id: 4,
    name: "Established, €50.000 profit",
    revenueExVat: 50_000,
    costsExVat: 0,
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncome: 0,
    note: "Past the arbeidskorting peak, so the marginal rate jumps.",
  },
  {
    id: 5,
    name: "Established, €50.000 profit, hours criterion not met",
    revenueExVat: 50_000,
    costsExVat: 0,
    meetsHoursCriterion: false,
    isStarter: false,
    otherIncome: 0,
    note: "Same profit as case 4, no entrepreneur deductions.",
  },
  {
    id: 6,
    name: "Established, €75.000 profit",
    revenueExVat: 75_000,
    costsExVat: 0,
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncome: 0,
    note: "Both credits are deep into their phase-out.",
  },
  {
    id: 7,
    name: "Established, €95.000 profit",
    revenueExVat: 95_000,
    costsExVat: 0,
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncome: 0,
    note: "Crosses the top bracket, triggers the rate adjustment, caps Zvw.",
  },
  {
    id: 8,
    name: "Hybrid, €20.000 profit plus €30.000 employment income",
    revenueExVat: 20_000,
    costsExVat: 0,
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncome: 30_000,
    note: "The job pushes the freelance profit into a much higher bracket. Shown with no loonheffing entered, which is the cautious reading.",
  },
  {
    id: 9,
    name: "High-cost, €80.000 revenue minus €35.000 costs",
    revenueExVat: 80_000,
    costsExVat: 35_000,
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncome: 0,
    note: "Where taxing revenue instead of profit does the most damage.",
  },
  {
    id: 10,
    name: "Loss year, €15.000 revenue minus €20.000 costs",
    revenueExVat: 15_000,
    costsExVat: 20_000,
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncome: 0,
    note: "No income tax and no Zvw. The loss carry-forward is not modelled.",
  },
];

export function profitOf(testCase: GoldenCase): number {
  return testCase.revenueExVat - testCase.costsExVat;
}

export function inputFor(testCase: GoldenCase, ytdReserved = 0): TaxInput {
  return {
    taxYear: 2026,
    country: "NL",
    projectedAnnualProfit: profitOf(testCase),
    ytdReserved,
    meetsHoursCriterion: testCase.meetsHoursCriterion,
    isStarter: testCase.isStarter,
    otherIncome: testCase.otherIncome,
    otherIncomeTaxWithheld: testCase.otherIncomeTaxWithheld ?? 0,
  };
}
