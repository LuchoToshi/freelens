import { describe, it, expect } from "vitest";
import { toCents } from "./money";
import { evaluateWeeklyPosition } from "./allocation";
import { checkDecision } from "./affordability";

// Position: available for payout = 3000, optional room = 3000,
// operating reserve = 4000, monthly costs = 1000 → runway 4.0.
const position = evaluateWeeklyPosition({
  currentBalanceCents: toCents(5000),
  vatProtectedCents: toCents(0),
  vatProtectedIsActual: false,
  reserveProtectedCents: toCents(1000),
  reserveSource: "own-rule",
  obligations: [],
  bufferTargetCents: toCents(1000),
  essentialMonthlyCostsCents: toCents(1000),
});

describe("checkDecision", () => {
  it("fits comfortably well under 75% of room", () => {
    const r = checkDecision(
      { amountCents: toCents(1000), kind: "personal", timing: "later" },
      position
    );
    expect(r.outcome).toBe("fits-comfortably");
    expect(r.remainingRoomCents).toBe(toCents(2000));
  });

  it("flags using most of the room above 75%", () => {
    const r = checkDecision(
      { amountCents: toCents(2500), kind: "personal", timing: "later" },
      position
    );
    expect(r.outcome).toBe("fits-uses-most-room");
  });

  it("does not fit above the room, with exact overage", () => {
    const r = checkDecision(
      { amountCents: toCents(3500), kind: "business", timing: "later" },
      position
    );
    expect(r.outcome).toBe("does-not-fit");
    expect(r.overageCents).toBe(toCents(500));
  });

  it("returns incomplete-data when there is no saved position", () => {
    const r = checkDecision(
      { amountCents: toCents(500), kind: "personal", timing: "now" },
      null
    );
    expect(r.outcome).toBe("incomplete-data");
    expect(r.optionalSpendingRoomCents).toBeNull();
  });

  it("reduces runway for a 'now' decision but not a 'later' one", () => {
    const now = checkDecision(
      { amountCents: toCents(1000), kind: "business", timing: "now" },
      position
    );
    const later = checkDecision(
      { amountCents: toCents(1000), kind: "business", timing: "later" },
      position
    );
    expect(now.runwayBeforeMonths).toBe(4);
    expect(now.runwayAfterMonths).toBe(3); // (4000-1000)/1000
    expect(later.runwayAfterMonths).toBe(4);
  });

  it("treats any positive amount as not fitting when room is zero or negative", () => {
    const gap = evaluateWeeklyPosition({
      currentBalanceCents: toCents(1000),
      vatProtectedCents: toCents(0),
      vatProtectedIsActual: false,
      reserveProtectedCents: toCents(1000),
      reserveSource: "own-rule",
      obligations: [],
      bufferTargetCents: toCents(1000),
      essentialMonthlyCostsCents: toCents(500),
    });
    const r = checkDecision(
      { amountCents: toCents(100), kind: "personal", timing: "later" },
      gap
    );
    expect(r.outcome).toBe("does-not-fit");
  });
});
