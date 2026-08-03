import { describe, expect, it } from "vitest";
import { toCents, type Cents } from "@/lib/domain/money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { GOLDEN_CASES, inputFor, profitOf } from "@/lib/tax/goldenCases";
import { referenceAnnualLiability } from "@/lib/tax/__testkit/referenceLiability";
import type { TaxInput } from "@/lib/tax/types";

const nl = (overrides: Partial<TaxInput>): TaxInput => ({
  taxYear: 2026,
  country: "NL",
  projectedAnnualProfit: 0,
  ytdReserved: 0,
  meetsHoursCriterion: true,
  isStarter: false,
  otherIncome: 0,
  ...overrides,
});


/**
 * The engine rounds every line in the direction that increases the amount set
 * aside, so it must always land at or just above the exact figure. Across the
 * ten golden cases the gap is at most a few cents; anything larger is a real
 * disagreement, not rounding.
 */
const ROUNDING_SLACK_CENTS = 20;

/**
 * Exact pins for the three cases verified by hand against the Belastingdienst
 * tables. The arithmetic is written out above each one so a reviewer can check
 * it without running anything. The other seven cases are checked against
 * `referenceAnnualLiability` plus the structural invariants below, which is a
 * stronger check than a pinned number copied out of the engine.
 */
const HAND_VERIFIED: Record<
  number,
  {
    grossTax: number;
    credits: number;
    netTax: number;
    zvw: number;
    totalLiability: number;
    effectiveRate: number;
    marginalRate: number;
  }
> = {
  // CASE 1, starter, €25.000 profit, hours criterion met.
  //   zelfstandigenaftrek        25.000     - 1.200    = 23.800
  //   startersaftrek             23.800     - 2.123    = 21.677
  //   MKB 12,7% x 21.677 = 2.752,979, floored           = 2.752,97
  //   belastbare winst           21.677     - 2.752,97 = 18.924,03
  //   bracket 1  35,75% x 18.924,03 = 6.765,3407, up    = 6.765,35
  //   AHK  (18.924,03 <= 29.736)                        = 3.115,00
  //   arbeidskorting on 25.000: 996 + 31,009% x 13.035  = 5.038,02
  //   credits 8.153,02 exceed the tax, so capped at     = 6.765,35
  //   income tax                                        = 0
  //   Zvw  4,85% x 18.924,03 = 917,8154, up             = 917,82
  //   effective 917,82 / 25.000 = 3,6713%
  //   marginal: +€100 profit adds €87,30 of belastbare winst; credits still
  //   exceed the tax so only Zvw moves: 4,85% x 87,30 = €4,23 per €100 = 4,23%
  1: {
    grossTax: 676535,
    credits: 676535,
    netTax: 0,
    zvw: 91782,
    totalLiability: 91782,
    effectiveRate: 0.036713,
    marginalRate: 0.0423,
  },
  // CASE 3, established, €40.000 profit, hours criterion met.
  //   zelfstandigenaftrek        40.000     - 1.200    = 38.800
  //   MKB 12,7% x 38.800                                = 4.927,60
  //   belastbare winst           38.800     - 4.927,60 = 33.872,40
  //   bracket 1  35,75% x 33.872,40 = 12.109,383, up    = 12.109,39
  //   AHK  3.115 - 6,398% x (33.872,40 - 29.736)
  //        = 3.115 - 264,6469, floored                  = 2.850,35
  //   arbeidskorting  5.300 + 1,95% x (40.000 - 25.845)
  //        = 5.300 + 276,0225, floored                  = 5.576,02
  //   credits                                           = 8.426,37
  //   income tax 12.109,39 - 8.426,37                   = 3.683,02
  //   Zvw  4,85% x 33.872,40 = 1.642,8114, up           = 1.642,82
  //   total                                             = 5.325,84
  //   effective 5.325,84 / 40.000 = 13,3146%
  //   marginal per €100: bracket 35,75% x 87,30 = 31,21
  //                    + AHK taper 6,398% x 87,30 = 5,59
  //                    - arbeidskorting build-up 1,95% x 100 = 1,95
  //                    + Zvw 4,85% x 87,30 = 4,23          => 39,08%
  3: {
    grossTax: 1210939,
    credits: 842637,
    netTax: 368302,
    zvw: 164282,
    totalLiability: 532584,
    effectiveRate: 0.133146,
    marginalRate: 0.3908,
  },
  // CASE 7, established, €95.000 profit, hours criterion met.
  //   zelfstandigenaftrek        95.000     - 1.200     = 93.800
  //   MKB 12,7% x 93.800                                 = 11.912,60
  //   belastbare winst           93.800     - 11.912,60 = 81.887,40
  //   bracket 1  35,75% x 38.883 = 13.900,6725, up       = 13.900,68
  //   bracket 2  37,56% x 39.543 = 14.852,3508, up       = 14.852,36
  //   bracket 3  49,50% x 3.461,40 = 1.713,393, up       = 1.713,40
  //   bracket tax                                        = 30.466,44
  //   tariefsaanpassing 11,94% x min(13.112,60; 16.574)
  //        = 11,94% x 13.112,60 = 1.565,6444, up         = 1.565,65
  //   gross tax                                          = 32.032,09
  //   AHK  (81.887,40 > 78.426)                          = 0
  //   arbeidskorting 5.685 - 6,51% x (95.000 - 45.592)
  //        = 5.685 - 3.216,4608, floored                 = 2.468,53
  //   income tax 32.032,09 - 2.468,53                    = 29.563,56
  //   Zvw base capped: 4,85% x 79.409 = 3.851,3365, up   = 3.851,34
  //   total                                              = 33.414,90
  //   effective 33.414,90 / 95.000 = 35,1736%
  //   marginal per €100: bracket 49,5% x 87,30 = 43,21
  //                    + tariefsaanpassing 11,94% x 12,70 = 1,52
  //                    + arbeidskorting taper 6,51% x 100 = 6,51
  //                    + Zvw 0 (capped)                    => 51,24%
  7: {
    grossTax: 3203209,
    credits: 246853,
    netTax: 2956356,
    zvw: 385134,
    totalLiability: 3341490,
    effectiveRate: 0.351736,
    marginalRate: 0.5124,
  },
};

describe("golden cases", () => {
  for (const testCase of GOLDEN_CASES) {
    it(`case ${testCase.id}: ${testCase.name}`, () => {
      const result = calculateTaxReserve(inputFor(testCase));

      // Check one: agreement with an independent implementation.
      const reference = referenceAnnualLiability({
        profit: profitOf(testCase),
        otherIncome: testCase.otherIncome,
        hours: testCase.meetsHoursCriterion,
        starter: testCase.isStarter,
        withheld: testCase.otherIncomeTaxWithheld,
      });
      expect(result.totalLiability).toBeGreaterThanOrEqual(reference - 1);
      expect(result.totalLiability - reference).toBeLessThanOrEqual(
        ROUNDING_SLACK_CENTS
      );

      // Check two: exact figures, for the cases verified by hand above.
      const pinned = HAND_VERIFIED[testCase.id];
      if (pinned) {
        expect(result.grossTax).toBe(pinned.grossTax);
        expect(result.credits).toBe(pinned.credits);
        expect(result.netTax).toBe(pinned.netTax);
        expect(result.zvw).toBe(pinned.zvw);
        expect(result.totalLiability).toBe(pinned.totalLiability);
        expect(result.effectiveRate).toBeCloseTo(pinned.effectiveRate, 5);
        expect(result.marginalRate).toBeCloseTo(pinned.marginalRate, 4);
      }

      // Check three: invariants a wrong constant cannot satisfy.
      expect(result.netTax + result.zvw).toBe(result.totalLiability);
      expect(result.netTax).toBe(
        Math.max(0, result.grossTax - result.credits - result.taxAlreadyWithheld)
      );
      expect(result.credits).toBeLessThanOrEqual(result.grossTax);
      expect(result.reserveGap % 100).toBe(0);
      expect(result.reserveGap).toBeGreaterThanOrEqual(result.totalLiability);
      expect(result.reserveGap - result.totalLiability).toBeLessThan(100);
      expect(result.configVersion).toBe("nl-2026.1");
      expect(result.configRetrievedAt).toBe("2026-08-03");
      expect(result.assumptions.length).toBeGreaterThan(5);
      expect(result.safeToSpend).toBeNull();
    });
  }

  it("agrees with the independent implementation across the whole profit range", () => {
    // Not just the ten cases: sweep the curve so a wrong bracket edge, credit
    // boundary, deduction cap or contribution ceiling cannot hide between them.
    const shapes = [
      { hours: true, starter: false, otherIncome: 0, withheld: 0 },
      { hours: false, starter: false, otherIncome: 0, withheld: 0 },
      { hours: true, starter: true, otherIncome: 0, withheld: 0 },
      { hours: true, starter: false, otherIncome: 30_000, withheld: 0 },
      { hours: true, starter: false, otherIncome: 30_000, withheld: 2250 },
    ];
    for (let profit = -5_000; profit <= 150_000; profit += 500) {
      for (const shape of shapes) {
        const result = calculateTaxReserve(
          nl({
            projectedAnnualProfit: profit,
            meetsHoursCriterion: shape.hours,
            isStarter: shape.starter,
            otherIncome: shape.otherIncome,
            otherIncomeTaxWithheld: shape.withheld,
          })
        );
        const reference = referenceAnnualLiability({ profit, ...shape });
        expect(result.totalLiability).toBeGreaterThanOrEqual(reference - 1);
        expect(result.totalLiability - reference).toBeLessThanOrEqual(
          ROUNDING_SLACK_CENTS
        );
      }
    }
  });

  it("case 1 owes Zvw even though income tax is zero", () => {
    const result = calculateTaxReserve(inputFor(GOLDEN_CASES[0]));
    expect(result.netTax).toBe(0);
    expect(result.zvw).toBeGreaterThan(0);
    // The flat model folded Zvw into one number, which hid exactly this.
    expect(result.breakdown.find((l) => l.id === "contribution-zvw")?.amount).toBe(result.zvw);
  });

  it("case 5 costs more than case 4 purely for missing the hours criterion", () => {
    const withHours = calculateTaxReserve(inputFor(GOLDEN_CASES[3]));
    const without = calculateTaxReserve(inputFor(GOLDEN_CASES[4]));
    expect(without.totalLiability).toBeGreaterThan(withHours.totalLiability);
    expect(without.assumptions.some((a) => a.includes("hours criterion"))).toBe(true);
  });

  it("case 7 caps Zvw at the maximum contribution base", () => {
    const result = calculateTaxReserve(inputFor(GOLDEN_CASES[6]));
    // 4,85% of the published €79.409 ceiling, rounded up to the cent.
    expect(result.zvw).toBe(Math.ceil(toCents(79_409) * 0.0485));
    // Doubling the profit cannot raise the contribution any further.
    const doubled = calculateTaxReserve(nl({ projectedAnnualProfit: 190_000 }));
    expect(doubled.zvw).toBe(result.zvw);
  });

  it("case 7 applies the top-bracket rate adjustment", () => {
    const result = calculateTaxReserve(inputFor(GOLDEN_CASES[6]));
    const line = result.breakdown.find((l) => l.id === "rate-adjustment");
    expect(line).toBeDefined();
    // 11,94% of the €13.112,60 of deductions that sat above €78.426.
    expect(line!.amount).toBe(Math.ceil(toCents(13_112.6) * 0.1194));
  });
});

describe("case 8, with and without loonheffing", () => {
  const hybrid = (otherIncomeTaxWithheld: number) =>
    calculateTaxReserve(
      nl({
        projectedAnnualProfit: 20_000,
        otherIncome: 30_000,
        otherIncomeTaxWithheld,
      })
    );

  // CASE 8 by hand, €20.000 profit + €30.000 salary, hours criterion met.
  //   zelfstandigenaftrek       20.000    - 1.200     = 18.800
  //   MKB 12,7% x 18.800                               = 2.387,60
  //   belastbare winst          18.800    - 2.387,60  = 16.412,40
  //   taxable income            16.412,40 + 30.000    = 46.412,40
  //   bracket 1  35,75% x 38.883 = 13.900,6725, up     = 13.900,68
  //   bracket 2  37,56% x 7.529,40 = 2.828,0426, up    = 2.828,05
  //   gross tax                                        = 16.728,73
  //   AHK  3.115 - 6,398% x 16.676,40 = 3.115 - 1.066,9561, floored = 2.048,04
  //   arbeidskorting on €50.000 arbeidsinkomen:
  //        5.685 - 6,51% x 4.408 = 5.398,0392, floored = 5.398,03
  //   credits                                          = 7.446,07
  //   income tax 16.728,73 - 7.446,07                  = 9.282,66
  //   Zvw  4,85% x 16.412,40 = 796,0014, up            = 796,01
  //   total                                            = 10.078,67
  it("with nothing entered, reserves the full combined bill", () => {
    const result = hybrid(0);
    expect(result.taxAlreadyWithheld).toBe(0);
    expect(result.netTax).toBe(toCents(9282.66));
    expect(result.totalLiability).toBe(toCents(10_078.67));
    // Says out loud that this is too high rather than quietly over-reserving.
    expect(result.assumptions.some((a) => a.includes("loonheffing"))).toBe(true);
  });

  it("with a realistic €2.250 withheld, subtracts it euro for euro", () => {
    // €2.250 is about what an employer withholds on €30.000 of salary in 2026:
    // the engine puts the tax on that income alone at €2.245,88.
    const result = hybrid(2250);
    expect(result.taxAlreadyWithheld).toBe(toCents(2250));
    // €9.282,66 of income tax, less the €2.250 already paid over.
    expect(result.netTax).toBe(toCents(9282.66 - 2250));
    expect(result.totalLiability).toBe(toCents(10_078.67 - 2250));
    // Unchanged: Zvw is charged on business profit only, never on the salary.
    expect(result.zvw).toBe(toCents(796.01));
    expect(result.breakdown.find((l) => l.id === "tax-already-withheld")?.amount).toBe(
      toCents(2250)
    );
  });

  it("never turns over-withholding into a negative bill", () => {
    const result = hybrid(50_000);
    expect(result.netTax).toBe(0);
    // Zvw is a separate liability and is still owed.
    expect(result.totalLiability).toBe(result.zvw);
    expect(result.reserveGap).toBeGreaterThan(0);
  });

  it("ignores withheld tax when there is no employment income to have withheld it", () => {
    const clean = calculateTaxReserve(nl({ projectedAnnualProfit: 40_000 }));
    const strayFigure = calculateTaxReserve(
      nl({ projectedAnnualProfit: 40_000, otherIncomeTaxWithheld: 5000 })
    );
    // A mistyped figure here would otherwise wipe out real tax and under-reserve
    // the user, which is the one direction this engine must never fail in.
    expect(strayFigure.taxAlreadyWithheld).toBe(0);
    expect(strayFigure.totalLiability).toBe(clean.totalLiability);
  });
});

describe("breakdown", () => {
  it("reconciles with the headline figures", () => {
    const result = calculateTaxReserve(inputFor(GOLDEN_CASES[2], 2000));
    const line = (id: string) => result.breakdown.find((l) => l.id === id)!;

    expect(line("gross-profit").amount).toBe(toCents(40_000));
    expect(line("taxable-profit").amount).toBe(toCents(33_872.4));
    expect(line("net-tax").amount).toBe(result.netTax);
    expect(line("contribution-zvw").amount).toBe(result.zvw);
    expect(line("total-liability").amount).toBe(result.totalLiability);
    expect(line("already-reserved").amount).toBe(toCents(2000));
    expect(line("reserve-gap").amount).toBe(result.reserveGap);

    // Bracket slices must add up to the bracket tax, which with no rate
    // adjustment is the whole gross tax.
    const slices = result.breakdown.filter((l) => l.id.startsWith("bracket-"));
    expect(slices.reduce((sum, l) => sum + l.amount, 0)).toBe(result.grossTax);
  });

  it("explains a deduction that was not applied rather than hiding it", () => {
    const result = calculateTaxReserve(nl({ projectedAnnualProfit: 50_000, meetsHoursCriterion: false }));
    const line = result.breakdown.find((l) => l.id === "deduction-zelfstandigenaftrek")!;
    expect(line.label).toContain("not applied");
    expect(line.explanation).toMatch(/hours criterion/);
    expect(line.amount).toBe(0);
  });

  it("shows credits that could not be used", () => {
    const result = calculateTaxReserve(inputFor(GOLDEN_CASES[0]));
    const line = result.breakdown.find((l) => l.id === "credits-limited");
    expect(line).toBeDefined();
    expect(line!.amount).toBeGreaterThan(0);
  });
});

describe("reserve gap", () => {
  it("subtracts what is already set aside", () => {
    const full = calculateTaxReserve(nl({ projectedAnnualProfit: 40_000 }));
    const partial = calculateTaxReserve(nl({ projectedAnnualProfit: 40_000, ytdReserved: 2000 }));
    expect(partial.reserveGap).toBe(full.reserveGap - toCents(2000));
  });

  it("never goes negative when over-reserved", () => {
    const result = calculateTaxReserve(nl({ projectedAnnualProfit: 40_000, ytdReserved: 50_000 }));
    expect(result.reserveGap).toBe(0);
  });

  it("always rounds up, never down", () => {
    for (let profit = 20_000; profit <= 60_000; profit += 313) {
      const result = calculateTaxReserve(nl({ projectedAnnualProfit: profit }));
      expect(result.reserveGap).toBeGreaterThanOrEqual(result.totalLiability);
    }
  });
});

describe("safe to spend", () => {
  it("allocates this payment's share of what is still owed for the year", () => {
    const result = calculateTaxReserve(
      nl({ projectedAnnualProfit: 40_000, paymentReceived: 2000 })
    );
    // Case 3 hand-verified above: €5.325,84 owed for the year, nothing set
    // aside yet, spread across €40.000 of expected income.
    //   €2.000 / €40.000 x €5.325,84 = €266,292, up to the euro = €267
    expect(result.reserveFromThisPayment).toBe(toCents(267));
    expect(result.safeToSpend).toBe(toCents(2000 - 267));
  });

  it("reserves near the average rate, NOT the marginal rate", () => {
    const result = calculateTaxReserve(
      nl({ projectedAnnualProfit: 40_000, paymentReceived: 1240 })
    );
    const rate = result.reserveFromThisPayment! / toCents(1240);
    // The marginal rate is ~39%. Charging it on every payment would reserve
    // roughly three times the real bill over a full year. This is the exact
    // failure the flat 30% model had, and it must not come back.
    expect(rate).toBeCloseTo(result.effectiveRate, 2);
    expect(rate).toBeLessThan(result.marginalRate / 2);
  });

  it("self-corrects to zero once the year is already covered", () => {
    const result = calculateTaxReserve(
      nl({ projectedAnnualProfit: 40_000, ytdReserved: 6000, paymentReceived: 10_000 })
    );
    expect(result.reserveGap).toBe(0);
    expect(result.reserveFromThisPayment).toBe(0);
    expect(result.safeToSpend).toBe(toCents(10_000));
  });

  it("takes less later when too much was set aside early", () => {
    const untouched = calculateTaxReserve(
      nl({ projectedAnnualProfit: 40_000, ytdProfit: 20_000, paymentReceived: 2000 })
    );
    const overReserved = calculateTaxReserve(
      nl({
        projectedAnnualProfit: 40_000,
        ytdProfit: 20_000,
        ytdReserved: 4000,
        paymentReceived: 2000,
      })
    );
    expect(overReserved.reserveFromThisPayment!).toBeLessThan(
      untouched.reserveFromThisPayment!
    );
  });

  it("falls back to the marginal rate when the year is already fully earned", () => {
    const result = calculateTaxReserve(
      nl({ projectedAnnualProfit: 40_000, ytdProfit: 40_000, paymentReceived: 2000 })
    );
    // No projected income left to spread the bill across, so the only honest
    // answer for an unexpected payment is what the next euro actually costs.
    // Case 3 hand-verified marginal rate is 39,08%:
    //   €2.000 x 39,08% = €781,60, up to the euro = €782
    expect(result.reserveFromThisPayment).toBe(toCents(782));
    expect(result.assumptions.some((a) => a.includes("already earned"))).toBe(true);
  });

  it("flags a payment larger than the profit still expected", () => {
    const result = calculateTaxReserve(
      nl({ projectedAnnualProfit: 40_000, ytdProfit: 39_000, paymentReceived: 2000 })
    );
    expect(result.assumptions.some((a) => a.includes("larger than the profit"))).toBe(true);
  });

  it("never holds back more than the payment itself", () => {
    const result = calculateTaxReserve(
      nl({ projectedAnnualProfit: 40_000, ytdProfit: 39_900, paymentReceived: 500 })
    );
    expect(result.reserveFromThisPayment).toBe(toCents(500));
    expect(result.safeToSpend).toBe(0);
    expect(result.assumptions.some((a) => a.includes("not enough to cover"))).toBe(true);
  });

  it("holds back nothing in a loss year", () => {
    const result = calculateTaxReserve(
      nl({ projectedAnnualProfit: -5000, paymentReceived: 3000 })
    );
    expect(result.reserveFromThisPayment).toBe(0);
    expect(result.safeToSpend).toBe(toCents(3000));
  });

  it("is null when no payment was supplied", () => {
    const result = calculateTaxReserve(nl({ projectedAnnualProfit: 40_000 }));
    expect(result.safeToSpend).toBeNull();
    expect(result.reserveFromThisPayment).toBeNull();
  });
});

describe("a full year of payments", () => {
  /**
   * The property that matters most: run a year through the engine one payment
   * at a time, accumulating profit and reserves, and the total set aside must
   * land on the annual bill. Any per-payment rule that is a fixed rate fails
   * this, which is how both the flat 30% and the marginal-rate version were
   * caught.
   */
  function runYear(payments: number[], projectedAnnualProfit: number) {
    let ytdProfit = 0;
    let ytdReserved = 0;
    const reserves: number[] = [];
    for (const payment of payments) {
      const result = calculateTaxReserve(
        nl({
          projectedAnnualProfit,
          ytdProfit,
          ytdReserved: ytdReserved / 100,
          paymentReceived: payment,
        })
      );
      const held = result.reserveFromThisPayment!;
      reserves.push(held);
      ytdReserved += held;
      ytdProfit += payment;
    }
    return { reserves, totalReserved: ytdReserved };
  }

  it("twelve equal payments totalling €40.000 reserve the annual bill", () => {
    const annual = calculateTaxReserve(nl({ projectedAnnualProfit: 40_000 }));
    const { totalReserved } = runYear(Array(12).fill(40_000 / 12), 40_000);

    expect(totalReserved).toBeGreaterThanOrEqual(annual.totalLiability);
    // Rounding is up-only and applied once per payment, so the overshoot is
    // bounded by one euro per payment and in practice far below that.
    expect(totalReserved - annual.totalLiability).toBeLessThanOrEqual(toCents(12));
    expect(totalReserved).toBe(annual.reserveGap);
  });

  it("uneven payments across a lumpy year still land on the bill", () => {
    const payments = [8000, 1200, 400, 6500, 2300, 9100, 750, 3200, 4550, 4000];
    const total = payments.reduce((a, b) => a + b, 0);
    const annual = calculateTaxReserve(nl({ projectedAnnualProfit: total }));
    const { totalReserved } = runYear(payments, total);

    expect(totalReserved).toBeGreaterThanOrEqual(annual.totalLiability);
    expect(totalReserved - annual.totalLiability).toBeLessThanOrEqual(
      toCents(payments.length)
    );
  });

  it("absorbs an early over-reserve instead of compounding it", () => {
    const annual = calculateTaxReserve(nl({ projectedAnnualProfit: 40_000 }));
    let ytdProfit = 10_000;
    // Someone set aside 30% of their first €10.000 under the old rule of thumb.
    let ytdReserved: number = toCents(3000);
    const later: Cents[] = [];
    for (const payment of [10_000, 10_000, 10_000]) {
      const result = calculateTaxReserve(
        nl({
          projectedAnnualProfit: 40_000,
          ytdProfit,
          ytdReserved: ytdReserved / 100,
          paymentReceived: payment,
        })
      );
      later.push(result.reserveFromThisPayment!);
      ytdReserved += result.reserveFromThisPayment!;
      ytdProfit += payment;
    }
    // The year still lands on the bill, and every later payment gives back
    // more than the old 30% rule would have taken.
    expect(ytdReserved).toBe(annual.reserveGap);
    for (const held of later) {
      expect(held).toBeLessThan(toCents(10_000 * 0.3));
    }
  });
});

describe("edge cases", () => {
  it("owes nothing at zero profit", () => {
    const result = calculateTaxReserve(nl({ projectedAnnualProfit: 0 }));
    expect(result.totalLiability).toBe(0);
    expect(result.reserveGap).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it("owes nothing on a loss, and does not invent a refund", () => {
    const result = calculateTaxReserve(nl({ projectedAnnualProfit: -12_000 }));
    expect(result.grossTax).toBe(0);
    expect(result.netTax).toBe(0);
    expect(result.zvw).toBe(0);
    expect(result.totalLiability).toBe(0);
  });

  it("never lets the total liability fall as profit rises", () => {
    let previous = -1;
    for (let profit = 0; profit <= 150_000; profit += 500) {
      const result = calculateTaxReserve(nl({ projectedAnnualProfit: profit }));
      expect(result.totalLiability).toBeGreaterThanOrEqual(previous);
      previous = result.totalLiability;
    }
  });

  it("never takes more than the extra euro at the margin", () => {
    for (let profit = 0; profit <= 150_000; profit += 500) {
      const result = calculateTaxReserve(nl({ projectedAnnualProfit: profit }));
      expect(result.marginalRate).toBeGreaterThanOrEqual(0);
      expect(result.marginalRate).toBeLessThan(1);
    }
  });

  it("keeps the effective rate below the marginal rate on a rising curve", () => {
    for (const profit of [25_000, 40_000, 60_000, 95_000]) {
      const result = calculateTaxReserve(nl({ projectedAnnualProfit: profit }));
      expect(result.effectiveRate).toBeLessThan(result.marginalRate);
    }
  });

  it("is deterministic", () => {
    const first = calculateTaxReserve(nl({ projectedAnnualProfit: 47_318.44 }));
    const second = calculateTaxReserve(nl({ projectedAnnualProfit: 47_318.44 }));
    expect(first).toEqual(second);
  });

  it("refuses a year it has no verified figures for", () => {
    expect(() => calculateTaxReserve(nl({ taxYear: 2031, projectedAnnualProfit: 40_000 }))).toThrow();
  });
});
