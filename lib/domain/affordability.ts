/**
 * "Check a decision": does a planned purchase fit within the discretionary
 * spending room from a weekly position, and what does it do to runway?
 *
 * A null position means no personal financial state has been saved yet, the
 * caller should offer an example/demo instead of computing against zeroed data.
 */
import { subtractCents, type Cents } from "@/lib/domain/money";
import type { WeeklyPositionResult } from "@/lib/domain/allocation";
import { calculateRunwayMonths } from "@/lib/domain/runway";

export type DecisionKind = "business" | "personal";
export type DecisionTiming = "now" | "later";

export interface DecisionInput {
  amountCents: Cents;
  description?: string;
  kind: DecisionKind;
  timing: DecisionTiming;
}

export type DecisionOutcome =
  | "fits-comfortably"
  | "fits-uses-most-room"
  | "does-not-fit"
  | "incomplete-data";

export interface DecisionResult {
  outcome: DecisionOutcome;
  amountCents: Cents;
  optionalSpendingRoomCents: Cents | null;
  /** Share of optional room this would use (0–1+), null when no position. */
  roomUsedFraction: number | null;
  /** Amount over the available room, when it doesn't fit. */
  overageCents: Cents | null;
  /** Room left after the decision, when it fits. */
  remainingRoomCents: Cents | null;
  runwayBeforeMonths: number | null;
  runwayAfterMonths: number | null;
}

// Leaves a visible 25% margin for timing slippage / forecast error.
const USES_MOST_ROOM_THRESHOLD = 0.75;

export function checkDecision(
  input: DecisionInput,
  position: WeeklyPositionResult | null
): DecisionResult {
  if (position === null) {
    return {
      outcome: "incomplete-data",
      amountCents: input.amountCents,
      optionalSpendingRoomCents: null,
      roomUsedFraction: null,
      overageCents: null,
      remainingRoomCents: null,
      runwayBeforeMonths: null,
      runwayAfterMonths: null,
    };
  }

  const room = position.optionalSpendingRoomCents;
  const runwayBeforeMonths = position.runwayMonths;

  // Runway impact: only "now" spends the money immediately.
  let runwayAfterMonths = runwayBeforeMonths;
  if (input.timing === "now" && position.essentialMonthlyCostsCents !== null) {
    const reserveAfter = subtractCents(
      position.operatingReserveCents,
      input.amountCents
    );
    runwayAfterMonths = calculateRunwayMonths(
      reserveAfter,
      position.essentialMonthlyCostsCents
    );
  }

  // No room (or negative): any positive amount does not fit.
  if (room <= 0) {
    return {
      outcome: "does-not-fit",
      amountCents: input.amountCents,
      optionalSpendingRoomCents: room,
      roomUsedFraction: input.amountCents > 0 ? Infinity : 0,
      overageCents: subtractCents(input.amountCents, room),
      remainingRoomCents: null,
      runwayBeforeMonths,
      runwayAfterMonths,
    };
  }

  const fraction = input.amountCents / room;

  if (input.amountCents > room) {
    return {
      outcome: "does-not-fit",
      amountCents: input.amountCents,
      optionalSpendingRoomCents: room,
      roomUsedFraction: fraction,
      overageCents: subtractCents(input.amountCents, room),
      remainingRoomCents: null,
      runwayBeforeMonths,
      runwayAfterMonths,
    };
  }

  const remainingRoomCents = subtractCents(room, input.amountCents);
  const outcome: DecisionOutcome =
    fraction > USES_MOST_ROOM_THRESHOLD
      ? "fits-uses-most-room"
      : "fits-comfortably";

  return {
    outcome,
    amountCents: input.amountCents,
    optionalSpendingRoomCents: room,
    roomUsedFraction: fraction,
    overageCents: null,
    remainingRoomCents,
    runwayBeforeMonths,
    runwayAfterMonths,
  };
}
