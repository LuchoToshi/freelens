import { describe, expect, it } from "vitest";
import { fromCents, toCents } from "@/lib/domain/money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { rateForTargetAnnualNet, RateInputError, type RateRequest } from "@/lib/tax/rate";
import { referenceAnnualLiability } from "@/lib/tax/__testkit/referenceLiability";

const request = (overrides: Partial<RateRequest> = {}): RateRequest => ({
  taxYear: 2026,
  country: "NL",
  targetAnnualNet: 40_000,
  billableUnitsPerYear: 140,
  annualBusinessCosts: 0,
  meetsHoursCriterion: true,
  isStarter: false,
  ...overrides,
});

function forwardLiability(profit: number, req: RateRequest): number {
  return calculateTaxReserve({
    taxYear: req.taxYear,
    country: req.country,
    projectedAnnualProfit: profit,
    ytdReserved: 0,
    meetsHoursCriterion: req.meetsHoursCriterion,
    isStarter: req.isStarter,
    otherIncome: req.otherIncome ?? 0,
    otherIncomeTaxWithheld: req.otherIncomeTaxWithheld ?? 0,
  }).totalLiability;
}

function referenceLiability(profit: number, req: RateRequest): number {
  return referenceAnnualLiability({
    profit,
    otherIncome: req.otherIncome ?? 0,
    hours: req.meetsHoursCriterion,
    starter: req.isStarter,
    withheld: req.otherIncomeTaxWithheld ?? 0,
  });
}

const ONE_EURO = 100;
/** The engine rounds up at every line; the reference does not round at all. */
const REFERENCE_SLACK = 100;

const SHAPES: { name: string; overrides: Partial<RateRequest> }[] = [
  { name: "established, hours met", overrides: {} },
  { name: "hours not met", overrides: { meetsHoursCriterion: false } },
  { name: "starter", overrides: { isStarter: true } },
  {
    name: "alongside a salary",
    overrides: { otherIncome: 30_000, otherIncomeTaxWithheld: 8_000 },
  },
];

describe("round trip: run the required revenue back through the forward engine", () => {
  it("leaves the target take-home for every shape, target and cost level", () => {
    for (const shape of SHAPES) {
      for (const target of [15_000, 40_000, 75_000, 120_000]) {
        for (const costs of [0, 6_000]) {
          const req = request({
            ...shape.overrides,
            targetAnnualNet: target,
            annualBusinessCosts: costs,
          });
          const result = rateForTargetAnnualNet(req);

          const profit = fromCents(result.requiredGrossRevenue) - costs;
          const taxFromBusiness =
            forwardLiability(profit, req) - forwardLiability(0, req);
          const kept = toCents(profit) - taxFromBusiness;

          const label = `${shape.name} target=${target} costs=${costs}`;
          expect(kept, label).toBeGreaterThanOrEqual(toCents(target));
          expect(kept - toCents(target), label).toBeLessThanOrEqual(ONE_EURO);
        }
      }
    }
  });

  it("still leaves the target when the bill comes from the independent reference", () => {
    for (const shape of SHAPES) {
      for (const target of [15_000, 40_000, 120_000]) {
        const req = request({ ...shape.overrides, targetAnnualNet: target });
        const result = rateForTargetAnnualNet(req);
        const profit = fromCents(result.projectedProfit);
        const taxFromBusiness =
          referenceLiability(profit, req) - referenceLiability(0, req);
        const kept = toCents(profit) - taxFromBusiness;

        const label = `${shape.name} target=${target}`;
        expect(kept, label).toBeGreaterThan(toCents(target) - REFERENCE_SLACK);
        expect(kept - toCents(target), label).toBeLessThanOrEqual(
          ONE_EURO + REFERENCE_SLACK
        );
      }
    }
  });

  it("reports a take-home that matches the round trip it promises", () => {
    const req = request({ targetAnnualNet: 40_000, annualBusinessCosts: 6_000 });
    const result = rateForTargetAnnualNet(req);
    expect(result.takeHome).toBe(result.projectedProfit - result.totalTaxLiability);
    expect(result.takeHome).toBeGreaterThanOrEqual(toCents(40_000));
    expect(result.projectedProfit).toBe(
      result.requiredGrossRevenue - result.annualBusinessCosts
    );
  });
});

describe("this is a whole-year solve, not a marginal one", () => {
  it("costs far less than the marginal rate would suggest", () => {
    // The trap: take the marginal rate at the answer and apply it to the whole
    // year. Every euro from the first one gets priced as if it were the last,
    // which grossly overstates the tax and inflates the rate.
    const req = request({ targetAnnualNet: 40_000 });
    const result = rateForTargetAnnualNet(req);

    const marginalAtAnswer = calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: fromCents(result.projectedProfit),
      ytdReserved: 0,
      meetsHoursCriterion: true,
      isStarter: false,
    }).marginalRate;

    // The real average across the year is well below the rate on the last euro.
    expect(result.effectiveRate).toBeLessThan(marginalAtAnswer);

    // What the shortcut would have produced, and what it would really leave.
    const shortcutProfit = 40_000 / (1 - marginalAtAnswer);
    const shortcutKept =
      toCents(shortcutProfit) - (forwardLiability(shortcutProfit, req) - forwardLiability(0, req));
    // It overshoots: the freelancer is told to charge for tax they never owe.
    expect(shortcutProfit).toBeGreaterThan(fromCents(result.projectedProfit));
    expect(shortcutKept).toBeGreaterThan(toCents(40_000));
  });

  it("charges a rising average rate as the target climbs", () => {
    // A genuine progressive curve: doubling the target more than doubles the
    // tax. A flat percentage cannot produce this and neither can one marginal
    // rate applied to the whole year.
    const low = rateForTargetAnnualNet(request({ targetAnnualNet: 25_000 }));
    const mid = rateForTargetAnnualNet(request({ targetAnnualNet: 60_000 }));
    const high = rateForTargetAnnualNet(request({ targetAnnualNet: 120_000 }));

    expect(low.effectiveRate).toBeLessThan(mid.effectiveRate);
    expect(mid.effectiveRate).toBeLessThan(high.effectiveRate);
    expect(high.totalTaxLiability).toBeGreaterThan(low.totalTaxLiability * 4);
  });
});

describe("annual business costs", () => {
  it("raise the required revenue by exactly the costs, because they are deductible", () => {
    // Same relationship as job costs in a quote: deductible costs come off the
    // profit, so they change the revenue one for one and leave the solve alone.
    const without = rateForTargetAnnualNet(request({ annualBusinessCosts: 0 }));
    for (const costs of [1_200, 6_000, 25_000]) {
      const with_ = rateForTargetAnnualNet(request({ annualBusinessCosts: costs }));
      expect(with_.requiredGrossRevenue, `costs=${costs}`).toBe(
        without.requiredGrossRevenue + toCents(costs)
      );
      expect(with_.projectedProfit).toBe(without.projectedProfit);
      expect(with_.totalTaxLiability).toBe(without.totalTaxLiability);
    }
  });

  it("still charges for the costs when the target take-home is zero", () => {
    // A year that only has to break even still has to pay for its software.
    const result = rateForTargetAnnualNet(
      request({ targetAnnualNet: 0, annualBusinessCosts: 6_000, billableUnitsPerYear: 100 })
    );
    expect(result.requiredGrossRevenue).toBe(toCents(6_000));
    expect(result.projectedProfit).toBe(0);
    expect(result.totalTaxLiability).toBe(0);
    expect(result.requiredRatePerUnit).toBe(toCents(60));
  });

  it("ignores negative costs rather than discounting the rate", () => {
    const plain = rateForTargetAnnualNet(request({ annualBusinessCosts: 0 }));
    const negative = rateForTargetAnnualNet(request({ annualBusinessCosts: -5_000 }));
    expect(negative.requiredGrossRevenue).toBe(plain.requiredGrossRevenue);
    expect(negative.annualBusinessCosts).toBe(0);
  });
});

describe("billable units", () => {
  it("divides the year's revenue over the days, rounding up", () => {
    const result = rateForTargetAnnualNet(request({ billableUnitsPerYear: 140 }));
    const exact = result.requiredGrossRevenue / 140;
    expect(result.requiredRatePerUnit).toBe(Math.ceil(exact / 100) * 100);
    // Rounding up means the year clears its target, never lands just under it.
    expect(result.requiredRatePerUnit * 140).toBeGreaterThanOrEqual(
      result.requiredGrossRevenue
    );
  });

  it("halves the rate when the billable days double", () => {
    const few = rateForTargetAnnualNet(request({ billableUnitsPerYear: 100 }));
    const many = rateForTargetAnnualNet(request({ billableUnitsPerYear: 200 }));
    expect(few.requiredGrossRevenue).toBe(many.requiredGrossRevenue);
    expect(Math.abs(many.requiredRatePerUnit * 2 - few.requiredRatePerUnit)).toBeLessThanOrEqual(
      2 * ONE_EURO
    );
  });

  it("prices the optimism gap: 140 real days against 220 hoped-for ones", () => {
    // The failure this default exists to prevent. Someone who sets their rate
    // for 220 days and bills 140 is not slightly short, they are a third short.
    const honest = rateForTargetAnnualNet(request({ billableUnitsPerYear: 140 }));
    const optimistic = rateForTargetAnnualNet(request({ billableUnitsPerYear: 220 }));

    const earnedAtOptimisticRate = optimistic.requiredRatePerUnit * 140;
    expect(earnedAtOptimisticRate).toBeLessThan(honest.requiredGrossRevenue);
    // Over a third of the year's revenue simply never arrives.
    const shortfall =
      1 - earnedAtOptimisticRate / honest.requiredGrossRevenue;
    expect(shortfall).toBeGreaterThan(0.3);
  });

  it("works in hours as readily as in days", () => {
    const days = rateForTargetAnnualNet(request({ billableUnitsPerYear: 140 }));
    const hours = rateForTargetAnnualNet(request({ billableUnitsPerYear: 140 * 8 }));
    expect(hours.requiredGrossRevenue).toBe(days.requiredGrossRevenue);
    expect(hours.requiredRatePerUnit * 8).toBeGreaterThanOrEqual(
      days.requiredRatePerUnit - 8 * ONE_EURO
    );
  });

  it("refuses to divide by zero days", () => {
    expect(() => rateForTargetAnnualNet(request({ billableUnitsPerYear: 0 }))).toThrow(
      RateInputError
    );
    expect(() => rateForTargetAnnualNet(request({ billableUnitsPerYear: -5 }))).toThrow(
      RateInputError
    );
    expect(() =>
      rateForTargetAnnualNet(request({ billableUnitsPerYear: Number.NaN }))
    ).toThrow(RateInputError);
  });
});

describe("shape and output", () => {
  it("rises with the target", () => {
    let previous = 0;
    for (const target of [10_000, 25_000, 50_000, 100_000]) {
      const result = rateForTargetAnnualNet(request({ targetAnnualNet: target }));
      expect(result.requiredRatePerUnit).toBeGreaterThan(previous);
      previous = result.requiredRatePerUnit;
    }
  });

  it("asks for more from someone who does not meet the hours criterion", () => {
    const withDeduction = rateForTargetAnnualNet(request({ meetsHoursCriterion: true }));
    const without = rateForTargetAnnualNet(request({ meetsHoursCriterion: false }));
    expect(without.requiredGrossRevenue).toBeGreaterThan(withDeduction.requiredGrossRevenue);
  });

  it("asks for more from someone who already has a salary", () => {
    // The salary uses up the low brackets and the credits, so the same
    // freelance take-home has to be earned at a higher rate.
    const soleTrader = rateForTargetAnnualNet(request({ targetAnnualNet: 40_000 }));
    const alongsideJob = rateForTargetAnnualNet(
      request({ targetAnnualNet: 40_000, otherIncome: 30_000, otherIncomeTaxWithheld: 8_000 })
    );
    expect(alongsideJob.requiredGrossRevenue).toBeGreaterThan(soleTrader.requiredGrossRevenue);
  });

  it("breaks down to figures that reconcile", () => {
    const result = rateForTargetAnnualNet(
      request({ targetAnnualNet: 40_000, annualBusinessCosts: 6_000 })
    );
    const line = (id: string) =>
      result.breakdown.find((l) => l.id === id)?.amount ?? Number.NaN;

    expect(line("rate-gross-revenue") - line("rate-business-costs")).toBe(line("rate-profit"));
    expect(line("rate-profit") - line("rate-tax")).toBe(line("rate-take-home"));
    expect(line("rate-per-unit")).toBe(result.requiredRatePerUnit);
  });

  it("carries the config version and the caveat that this is a floor", () => {
    const result = rateForTargetAnnualNet(request());
    expect(result.configVersion).toMatch(/^nl-2026/);
    expect(result.assumptions[0]).toContain("not what you can charge");
    expect(result.assumptions[1]).toContain("140 billable days");
    expect(result.assumptions.some((a) => a.includes("planning estimate"))).toBe(true);
  });
});
