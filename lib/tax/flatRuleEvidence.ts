/**
 * The two cases the site cites when it says the old flat rule was wrong.
 *
 * Both come from OLD_VS_NEW.md, which `./oldVsNew.test.ts` generates from the
 * live engine. They are restated here as data rather than parsed out of the
 * markdown, and `./flatRuleEvidence.test.ts` checks them back against the
 * engine. A config change that moves either figure fails the test instead of
 * leaving a stale number on a page that claims to be evidence.
 *
 * One case where the flat rule takes far too much, one where it takes too
 * little. The claim is that it errs in both directions, so it has to show both.
 */
import { toCents, type Cents } from "@/lib/domain/money";

export interface FlatRuleCase {
  revenue: Cents;
  costs: Cents;
  profit: Cents;
  /** What 30% of revenue would have set aside. */
  oldReserve: Cents;
  /** What the engine says is actually owed. */
  realBill: Cents;
}

/** Case 9: high costs, so a rule that taxes revenue over-reserves badly. */
export const HIGH_COST_CASE: FlatRuleCase = {
  revenue: toCents(80_000),
  costs: toCents(35_000),
  profit: toCents(45_000),
  oldReserve: toCents(24_000),
  realBill: toCents(7_279.8),
};

/** Case 7: top bracket, where a flat rule stops keeping up. */
export const HIGH_EARNER_CASE: FlatRuleCase = {
  revenue: toCents(95_000),
  costs: toCents(0),
  profit: toCents(95_000),
  oldReserve: toCents(28_500),
  realBill: toCents(33_414.9),
};

/** How far the old rule missed, positive either way. */
export function flatRuleError(c: FlatRuleCase): Cents {
  return Math.abs(c.oldReserve - c.realBill) as Cents;
}
