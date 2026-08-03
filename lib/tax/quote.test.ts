import { describe, expect, it } from "vitest";
import { fromCents, toCents } from "@/lib/domain/money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { quoteForTargetNet, type QuoteRequest } from "@/lib/tax/quote";
import { referenceAnnualLiability } from "@/lib/tax/__testkit/referenceLiability";

const request = (overrides: Partial<QuoteRequest> = {}): QuoteRequest => ({
  taxYear: 2026,
  country: "NL",
  targetNet: 2000,
  currentProjectedProfit: 40_000,
  vatRate: 21,
  meetsHoursCriterion: true,
  isStarter: false,
  otherIncome: 0,
  ...overrides,
});

/** The forward engine's annual bill, used to close the round trip. */
function forwardLiability(profit: number, req: QuoteRequest): number {
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

/** The same bill from the independent reference, in cents. */
function referenceLiability(profit: number, req: QuoteRequest): number {
  return referenceAnnualLiability({
    profit,
    otherIncome: req.otherIncome ?? 0,
    hours: req.meetsHoursCriterion,
    starter: req.isStarter,
    withheld: req.otherIncomeTaxWithheld ?? 0,
  });
}

const ONE_EURO = 100;

/**
 * The engine rounds every line in the direction that increases the amount set
 * aside, so a round trip closed through the reference can sit a few cents under
 * the one closed through the engine. Anything past a euro is a real
 * disagreement, not rounding.
 */
const REFERENCE_SLACK = 100;

const SHAPES: { name: string; overrides: Partial<QuoteRequest> }[] = [
  { name: "established, hours met", overrides: {} },
  { name: "hours not met", overrides: { meetsHoursCriterion: false } },
  { name: "starter", overrides: { isStarter: true } },
  {
    name: "hybrid with a salary",
    overrides: { otherIncome: 30_000, otherIncomeTaxWithheld: 8_000 },
  },
];

const BASE_PROFITS = [-20_000, 0, 10_000, 36_000, 40_000, 78_000, 95_000, 140_000];

describe("round trip: quote, then run the price back through the forward engine", () => {
  it("lands on the target for every base profit, target and taxpayer shape", () => {
    for (const shape of SHAPES) {
      for (const base of BASE_PROFITS) {
        for (const target of [500, 2000, 10_000, 45_000]) {
          const req = request({
            ...shape.overrides,
            currentProjectedProfit: base,
            targetNet: target,
          });
          const quote = quoteForTargetNet(req);

          // Close the loop the way the app will: the job is won, the projection
          // rises by the taxable part of the job, and the year is recalculated.
          const newProfit = base + fromCents(quote.taxableDelta);
          const added = forwardLiability(newProfit, req) - forwardLiability(base, req);
          const kept = quote.quoteExVat - quote.jobCosts - added;

          const label = `${shape.name} base=${base} target=${target}`;
          expect(kept, label).toBeGreaterThanOrEqual(toCents(target));
          expect(kept - toCents(target), label).toBeLessThanOrEqual(ONE_EURO);
        }
      }
    }
  });

  it("still lands on the target when the bill comes from the independent reference", () => {
    // The engine and the reference are two separate routes to the annual bill.
    // A quote that only closes against the engine proves the bisection is
    // self-consistent; closing it against the reference proves it is right.
    for (const shape of SHAPES) {
      for (const base of BASE_PROFITS) {
        const req = request({
          ...shape.overrides,
          currentProjectedProfit: base,
          targetNet: 2000,
        });
        const quote = quoteForTargetNet(req);
        const newProfit = base + fromCents(quote.taxableDelta);
        const added = referenceLiability(newProfit, req) - referenceLiability(base, req);
        const kept = quote.quoteExVat - quote.jobCosts - added;

        const label = `${shape.name} base=${base}`;
        expect(kept, label).toBeGreaterThan(toCents(2000) - REFERENCE_SLACK);
        expect(kept - toCents(2000), label).toBeLessThanOrEqual(ONE_EURO + REFERENCE_SLACK);
      }
    }
  });

  it("reports a take-home that matches the round trip it promises", () => {
    const req = request({ currentProjectedProfit: 40_000, targetNet: 2000, jobCosts: 750 });
    const quote = quoteForTargetNet(req);
    const added =
      forwardLiability(40_000 + fromCents(quote.taxableDelta), req) -
      forwardLiability(40_000, req);
    expect(quote.takeHome).toBe(quote.quoteExVat - quote.jobCosts - added);
    expect(quote.takeHome).toBeGreaterThanOrEqual(toCents(2000));
  });
});

describe("job costs", () => {
  it("raises the quote by exactly the costs, because they are not taxed", () => {
    // Deductible costs come off the profit the job produces, so they change the
    // price one for one and leave the tax solve untouched. Any other
    // relationship means the order of operations is wrong.
    for (const base of [0, 40_000, 95_000]) {
      const withoutCosts = quoteForTargetNet(
        request({ currentProjectedProfit: base, targetNet: 2000 })
      );
      for (const costs of [1, 500, 5000]) {
        const withCosts = quoteForTargetNet(
          request({ currentProjectedProfit: base, targetNet: 2000, jobCosts: costs })
        );
        expect(withCosts.quoteExVat, `base=${base} costs=${costs}`).toBe(
          withoutCosts.quoteExVat + toCents(costs)
        );
        expect(withCosts.taxableDelta).toBe(withoutCosts.taxableDelta);
        expect(withCosts.additionalLiability).toBe(withoutCosts.additionalLiability);
      }
    }
  });

  it("beats the under-quote that comes from leaving costs out", () => {
    // The failure this guards against: quote as if the job had no costs, then
    // pay the costs out of the proceeds. The costs become a silent discount.
    const costs = 500;
    const req = request({ currentProjectedProfit: 40_000, targetNet: 2000, jobCosts: costs });
    const correct = quoteForTargetNet(req);
    const ignoringCosts = quoteForTargetNet({ ...req, jobCosts: 0 });

    const keptIfCostsIgnored =
      ignoringCosts.quoteExVat -
      toCents(costs) -
      (forwardLiability(40_000 + fromCents(ignoringCosts.taxableDelta), req) -
        forwardLiability(40_000, req));

    expect(keptIfCostsIgnored).toBe(toCents(2000) - toCents(costs));
    expect(correct.takeHome - keptIfCostsIgnored).toBe(toCents(costs));
  });

  it("beats the over-quote that comes from grossing costs up for tax", () => {
    // The opposite failure: treat the costs as extra profit to be earned, and
    // solve for target + costs. That taxes money which goes straight out again.
    const costs = 5000;
    const req = request({ currentProjectedProfit: 40_000, targetNet: 2000, jobCosts: costs });
    const correct = quoteForTargetNet(req);
    const grossedUp = quoteForTargetNet({ ...req, jobCosts: 0, targetNet: 2000 + costs });

    expect(grossedUp.quoteExVat).toBeGreaterThan(correct.quoteExVat);
    // The overshoot is the tax charged on the costs, which is real money the
    // client is asked for and the freelancer never owes.
    const overshoot = grossedUp.quoteExVat - correct.quoteExVat;
    expect(overshoot).toBeGreaterThan(toCents(1500));
  });

  it("quotes the costs even when nothing is left over", () => {
    // A job done at cost still has to be paid for. Quoting zero here would hand
    // the client the costs as a discount.
    const atCost = quoteForTargetNet(request({ targetNet: 0, jobCosts: 800 }));
    expect(atCost.quoteExVat).toBe(toCents(800));
    expect(atCost.taxableDelta).toBe(0);
    expect(atCost.additionalLiability).toBe(0);
    expect(atCost.takeHome).toBe(0);
  });

  it("ignores a negative cost rather than discounting the quote", () => {
    const plain = quoteForTargetNet(request({ targetNet: 2000 }));
    const negative = quoteForTargetNet(request({ targetNet: 2000, jobCosts: -500 }));
    expect(negative.quoteExVat).toBe(plain.quoteExVat);
    expect(negative.jobCosts).toBe(0);
  });

  it("charges btw on the whole invoice, costs included", () => {
    const quote = quoteForTargetNet(request({ targetNet: 2000, jobCosts: 500 }));
    expect(quote.vat).toBe(Math.round(quote.quoteExVat * 0.21));
    expect(quote.quoteInclVat).toBe(quote.quoteExVat + quote.vat);
    // The recharged costs are part of the taxable supply, so they carry btw too.
    const withoutCosts = quoteForTargetNet(request({ targetNet: 2000 }));
    expect(quote.vat).toBeGreaterThan(withoutCosts.vat);
  });
});

describe("why the marginal rate is not used", () => {
  it("the marginal-rate shortcut under-quotes a job that crosses a bracket", () => {
    // target / (1 - marginalRate) is what every flat calculator does. It prices
    // the whole job at the rate on the first euro of it, so a job that pushes
    // the freelancer into a higher bracket is priced for the lower one.
    const base = 36_000;
    const target = 10_000;
    const req = request({ currentProjectedProfit: base, targetNet: target });

    const marginalRate = calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: base,
      ytdReserved: 0,
      meetsHoursCriterion: true,
      isStarter: false,
    }).marginalRate;

    const shortcut = toCents(target / (1 - marginalRate));
    const correct = quoteForTargetNet(req).quoteExVat;

    expect(shortcut).toBeLessThan(correct);

    // What the shortcut would actually leave in the freelancer's pocket.
    const keptByShortcut =
      shortcut -
      (forwardLiability(base + fromCents(shortcut), req) - forwardLiability(base, req));
    expect(keptByShortcut).toBeLessThan(toCents(target));
    // Not a rounding difference: this is over a thousand euros of shortfall.
    expect(toCents(target) - keptByShortcut).toBeGreaterThan(toCents(500));
  });

  it("agrees with the shortcut when the job stays inside one regime", () => {
    // Where the curve really is flat, the two must coincide. That is the check
    // that the bisection is not simply producing a different number.
    const base = 50_000;
    const req = request({ currentProjectedProfit: base, targetNet: 100 });
    const marginalRate = calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: base,
      ytdReserved: 0,
      meetsHoursCriterion: true,
      isStarter: false,
    }).marginalRate;

    const shortcut = toCents(100 / (1 - marginalRate));
    const correct = quoteForTargetNet(req).quoteExVat;
    expect(Math.abs(correct - shortcut)).toBeLessThanOrEqual(ONE_EURO);
  });

  it("reports a job rate that is a blend, not the rate at any single point", () => {
    // A job spanning €70.000 to roughly €110.000 of profit crosses the top
    // bracket edge, the end of the algemene heffingskorting phase-out and the
    // start of the tariefsaanpassing. The blended rate must sit between the
    // lowest and highest marginal rate ANYWHERE in that span, which is not the
    // same as between the rates at its two ends: the curve peaks in the middle,
    // so both endpoints are below the peak.
    const base = 70_000;
    const quote = quoteForTargetNet(request({ currentProjectedProfit: base, targetNet: 20_000 }));
    const top = base + fromCents(quote.taxableDelta);

    const rateAt = (profit: number) =>
      calculateTaxReserve({
        taxYear: 2026,
        country: "NL",
        projectedAnnualProfit: profit,
        ytdReserved: 0,
        meetsHoursCriterion: true,
        isStarter: false,
      }).marginalRate;

    const sampled: number[] = [];
    for (let step = 0; step <= 40; step += 1) {
      sampled.push(rateAt(base + ((top - base) * step) / 40));
    }
    const lo = Math.min(...sampled);
    const hi = Math.max(...sampled);

    expect(quote.effectiveJobRate).toBeGreaterThanOrEqual(lo);
    expect(quote.effectiveJobRate).toBeLessThanOrEqual(hi);
    // The point of the exercise: neither endpoint rate would have priced it.
    expect(quote.effectiveJobRate).toBeGreaterThan(rateAt(base));
    expect(quote.effectiveJobRate).toBeGreaterThan(rateAt(top));
  });
});

describe("the quote connects to the running balance", () => {
  it("winning the job raises the year's reserve by exactly the tax it quoted for", () => {
    // The quote promises "this job adds €X of tax". Once the projection is
    // raised, the year's reserve must rise by that same €X, or the two halves
    // of the product are telling the freelancer different things.
    const base = 40_000;
    const req = request({ currentProjectedProfit: base, targetNet: 5000, jobCosts: 400 });
    const quote = quoteForTargetNet(req);

    const before = calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: base,
      ytdReserved: 0,
      meetsHoursCriterion: true,
      isStarter: false,
    });
    const after = calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: base + fromCents(quote.taxableDelta),
      ytdReserved: 0,
      meetsHoursCriterion: true,
      isStarter: false,
    });

    expect(after.totalLiability - before.totalLiability).toBe(quote.additionalLiability);
    // And the headline figure the user is shown moves with it, to the euro.
    expect(after.reserveGap - before.reserveGap).toBeGreaterThanOrEqual(
      quote.additionalLiability - ONE_EURO
    );
  });

  it("is unaffected by what has already been reserved or earned this year", () => {
    // The quote is an annual-level question: what does this job cost me in tax.
    // Money already set aside changes when the bill is paid, not how big it is.
    const quote = quoteForTargetNet(request({ targetNet: 3000 }));
    const midYear = calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: 40_000,
      ytdProfit: 25_000,
      ytdReserved: 4000,
      meetsHoursCriterion: true,
      isStarter: false,
      paymentReceived: 3000,
    });
    const freshYear = calculateTaxReserve({
      taxYear: 2026,
      country: "NL",
      projectedAnnualProfit: 40_000,
      ytdReserved: 0,
      meetsHoursCriterion: true,
      isStarter: false,
    });
    // Same annual bill either way, which is the only thing the quote reads.
    expect(midYear.totalLiability).toBe(freshYear.totalLiability);
    expect(quote.additionalLiability).toBeGreaterThan(0);
  });
});

describe("shape and edges", () => {
  it("quotes more than the target, because the extra profit is taxed", () => {
    const quote = quoteForTargetNet(request({ targetNet: 5000 }));
    expect(quote.quoteExVat).toBeGreaterThan(toCents(5000));
    expect(quote.additionalLiability).toBeGreaterThan(0);
    expect(quote.effectiveJobRate).toBeGreaterThan(0.3);
    expect(quote.effectiveJobRate).toBeLessThan(0.6);
  });

  it("handles a zero btw rate", () => {
    const quote = quoteForTargetNet(request({ targetNet: 5000, vatRate: 0 }));
    expect(quote.vat).toBe(0);
    expect(quote.quoteInclVat).toBe(quote.quoteExVat);
  });

  it("asks for more when the year is already further along", () => {
    const early = quoteForTargetNet(request({ currentProjectedProfit: 10_000 }));
    const late = quoteForTargetNet(request({ currentProjectedProfit: 90_000 }));
    expect(late.quoteExVat).toBeGreaterThan(early.quoteExVat);
  });

  it("charges nothing on a job that only fills a loss", () => {
    // At €20.000 of projected loss the next €5.000 of profit is untaxed, so the
    // quote is the target exactly. Any markup here is money taken for a bill
    // that does not exist.
    const quote = quoteForTargetNet(
      request({ currentProjectedProfit: -20_000, targetNet: 5000 })
    );
    expect(quote.quoteExVat).toBe(toCents(5000));
    expect(quote.additionalLiability).toBe(0);
    expect(quote.effectiveJobRate).toBe(0);
  });

  it("returns zero for a zero or negative target with no costs", () => {
    expect(quoteForTargetNet(request({ targetNet: 0 })).quoteExVat).toBe(0);
    expect(quoteForTargetNet(request({ targetNet: -500 })).quoteExVat).toBe(0);
  });

  it("rises with the target", () => {
    let previous = 0;
    for (const target of [100, 1000, 5000, 20_000, 75_000]) {
      const quote = quoteForTargetNet(request({ targetNet: target }));
      expect(quote.quoteExVat).toBeGreaterThan(previous);
      previous = quote.quoteExVat;
    }
  });

  it("converges well inside the iteration budget", () => {
    for (const target of [500, 1500, 5000, 20_000, 75_000, 400_000]) {
      expect(quoteForTargetNet(request({ targetNet: target })).iterations).toBeLessThan(60);
    }
  });

  it("carries the config version and the caveat that this is a floor", () => {
    const quote = quoteForTargetNet(request({ targetNet: 2000, jobCosts: 300 }));
    expect(quote.configVersion).toMatch(/^nl-2026/);
    expect(quote.assumptions[0]).toContain("not what the market will pay");
    expect(quote.assumptions.some((a) => a.includes("deductible"))).toBe(true);
    expect(quote.assumptions.some((a) => a.includes("planning estimate"))).toBe(true);
  });

  it("breaks down to figures that reconcile", () => {
    const quote = quoteForTargetNet(request({ targetNet: 2000, jobCosts: 500 }));
    const line = (id: string) =>
      quote.breakdown.find((l) => l.id === id)?.amount ?? Number.NaN;

    expect(line("quote-ex-vat") + line("quote-vat")).toBe(line("quote-incl-vat"));
    expect(line("quote-ex-vat") - line("quote-job-costs")).toBe(line("quote-taxable-delta"));
    expect(
      line("quote-taxable-delta") - line("quote-additional-liability")
    ).toBe(line("quote-take-home"));
  });
});
