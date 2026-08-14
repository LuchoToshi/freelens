import { describe, expect, it } from "vitest";
import { asCentsUnsafe, fromCents, toCents } from "@/lib/domain/money";
import { detectBracketCrossing } from "@/lib/tax/bracketCrossing";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { loadProfile } from "@/lib/tax/loadProfile";

const profile = loadProfile("NL", 2026);

/**
 * Taxable income at a given profit, straight from the engine. The crossing
 * detector is handed this rather than deriving it, so the tests below are
 * checking the detector against the engine, not against itself.
 */
function taxableIncomeAt(profitCents: number, hours = true, starter = false) {
  return calculateTaxReserve({
    taxYear: 2026,
    country: "NL",
    projectedAnnualProfit: profitCents / 100,
    ytdReserved: 0,
    meetsHoursCriterion: hours,
    isStarter: starter,
  }).taxableIncome;
}

const measure = (profit: number) => taxableIncomeAt(profit);

describe("thresholds are taxable-income thresholds, not profit thresholds", () => {
  it("needs more than a euro of profit to add a euro of taxable income", () => {
    // The whole reason this module exists. At €36.000 of profit with the hours
    // criterion met, taxable income is (36.000 - 1.200) x 0,873 = €30.380,40.
    // Reaching the €38.883 threshold takes €8.502,60 more taxable income but
    // €9.739,50 more profit, because the MKB-winstvrijstelling takes 12,7% of
    // every euro on the way. A detector that compared the threshold against
    // profit would fire €1.236,90 too early.
    const before = taxableIncomeAt(toCents(36_000));
    expect(before).toBe(toCents(30_380.4));

    const crossing = detectBracketCrossing(
      toCents(36_000),
      toCents(60_000),
      profile.brackets,
      measure
    );
    expect(crossing).not.toBeNull();
    if (!crossing) return;

    const crossingProfit = asCentsUnsafe(toCents(36_000) + crossing.amountBelow);
    // Hand-derived: (P - 1.200) x 0,873 = 38.883  ->  P = €45.739,50.
    expect(fromCents(crossing.amountBelow)).toBeCloseTo(9739.5, 0);
    expect(fromCents(crossingProfit)).toBeCloseTo(45_739.5, 0);

    const taxableDistance = toCents(38_883) - before;
    expect(crossing.amountBelow).toBeGreaterThan(taxableDistance);
  });

  it("lands on the first profit where taxable income reaches the threshold", () => {
    const crossing = detectBracketCrossing(
      toCents(36_000),
      toCents(60_000),
      profile.brackets,
      measure
    );
    if (!crossing) throw new Error("expected a crossing");
    const crossingProfit = toCents(36_000) + crossing.amountBelow;

    // At the crossing point taxable income has reached the threshold, and one
    // euro of profit lower it has not. That pins the boundary from both sides.
    expect(taxableIncomeAt(crossingProfit)).toBeGreaterThanOrEqual(toCents(38_883));
    expect(taxableIncomeAt(crossingProfit - 100)).toBeLessThan(toCents(38_883));
  });
});

describe("detecting a crossing", () => {
  it("returns null when the whole job stays inside one bracket", () => {
    expect(
      detectBracketCrossing(toCents(20_000), toCents(25_000), profile.brackets, measure)
    ).toBeNull();
  });

  it("returns null when there is no job", () => {
    expect(
      detectBracketCrossing(toCents(40_000), toCents(40_000), profile.brackets, measure)
    ).toBeNull();
    expect(
      detectBracketCrossing(toCents(40_000), toCents(30_000), profile.brackets, measure)
    ).toBeNull();
  });

  it("splits the job into the parts either side of the threshold", () => {
    const before = toCents(36_000);
    const after = toCents(60_000);
    const crossing = detectBracketCrossing(before, after, profile.brackets, measure);
    if (!crossing) throw new Error("expected a crossing");

    expect(crossing.crossed).toBe(true);
    expect(crossing.threshold).toBe(38_883);
    // Conservation: the two parts are the whole job and nothing but the job.
    expect(crossing.amountBelow + crossing.amountAbove).toBe(after - before);
    expect(crossing.amountBelow).toBeGreaterThan(0);
    expect(crossing.amountAbove).toBeGreaterThan(0);
  });

  it("reports the statutory rates either side, read from the config table", () => {
    const low = detectBracketCrossing(
      toCents(36_000),
      toCents(50_000),
      profile.brackets,
      measure
    );
    expect(low?.rateBelow).toBe(profile.brackets[0].rate);
    expect(low?.rateAbove).toBe(profile.brackets[1].rate);

    const high = detectBracketCrossing(
      toCents(88_000),
      toCents(100_000),
      profile.brackets,
      measure
    );
    expect(high?.threshold).toBe(78_426);
    expect(high?.rateBelow).toBe(profile.brackets[1].rate);
    expect(high?.rateAbove).toBe(profile.brackets[2].rate);
  });

  it("reports the highest threshold when a job crosses two", () => {
    // €20.000 to €120.000 of profit passes both €38.883 and €78.426.
    const crossing = detectBracketCrossing(
      toCents(20_000),
      toCents(120_000),
      profile.brackets,
      measure
    );
    if (!crossing) throw new Error("expected a crossing");
    expect(crossing.threshold).toBe(78_426);
    // amountBelow spans everything under the top threshold, including the
    // lower bracket, so the two parts still account for the whole job.
    expect(crossing.amountBelow + crossing.amountAbove).toBe(
      toCents(120_000) - toCents(20_000)
    );
  });

  it("fires exactly at the boundary, not one euro either side", () => {
    // Profit €45.739,50 is where taxable income reaches €38.883.
    const justBelow = toCents(45_000);
    const justAbove = toCents(46_000);
    expect(
      detectBracketCrossing(toCents(40_000), justBelow, profile.brackets, measure)
    ).toBeNull();
    expect(
      detectBracketCrossing(toCents(40_000), justAbove, profile.brackets, measure)
    ).not.toBeNull();
  });

  it("moves with the deductions, because they move taxable income", () => {
    // A starter has €3.323 of deductions instead of €1.200, so taxable income
    // is lower at the same profit and the crossing happens later.
    const plain = detectBracketCrossing(
      toCents(36_000),
      toCents(60_000),
      profile.brackets,
      (p) => taxableIncomeAt(p, true, false)
    );
    const starter = detectBracketCrossing(
      toCents(36_000),
      toCents(60_000),
      profile.brackets,
      (p) => taxableIncomeAt(p, true, true)
    );
    if (!plain || !starter) throw new Error("expected crossings");
    expect(starter.amountBelow).toBeGreaterThan(plain.amountBelow);
  });
});
