/**
 * The scored queue: who is worth a message this week, and why.
 *
 * Deterministic end to end, per the hard rule: `today` is an input, every
 * score is arithmetic over record fields and the seasonality config, and no
 * model output can reach this module because nothing here accepts text.
 *
 * The shape of the scoring, and why:
 *
 *   anniversary  strongest. 10–14 months after the last project is the one
 *                moment a note is an event rather than an interruption, and
 *                "a year since X" is the most natural sentence in outreach.
 *   season       the craft's briefing windows. True for whole months, so it
 *                ranks below a personal anniversary but above a bare gap.
 *   gap          time itself. From six months of silence it grows, capped at
 *                two years, past which a relationship is cold rather than
 *                cooling and the honest reason is the season, not the gap.
 *
 * Value nudges, never decides: a €4.000 relationship outranks a €400 one at
 * the same recency, but no value can conjure a reason where none exists.
 */
import type { Craft, ReasonCode, Relationship, Temperature } from "@/lib/rebooking/types";
import {
  seasonWindowFor,
  type SeasonalityConfig,
  type SeasonReason,
} from "@/lib/rebooking/seasonality";

export interface RankedTouchSuggestion {
  relationshipId: string;
  reasonCode: Exclude<ReasonCode, "manual">;
  /** Set when reasonCode is "season". */
  seasonReason?: SeasonReason;
  /** Whole months since the last project, when a date exists. */
  monthsSince?: number;
  score: number;
}

export interface RankInput {
  relationships: readonly Relationship[];
  craft: Craft;
  config: SeasonalityConfig;
  /** ISO date. Passed in, never read from a clock. */
  today: string;
  /** Relationship ids touched recently enough that this week skips them. */
  recentlyTouchedIds?: readonly string[];
}

/** Under this many whole months since the last project, silence is the advice. */
export const RECENCY_FLOOR_MONTHS = 6;

export const WEEKLY_MIN = 2;
export const WEEKLY_MAX = 4;

/** Below this a suggestion is noise; a quiet week stays quiet. */
const SCORE_FLOOR = 30;

export function rankQueue(input: RankInput): RankedTouchSuggestion[] {
  const touched = new Set(input.recentlyTouchedIds ?? []);
  const month = monthOf(input.today);

  const scored = input.relationships
    .filter((r) => !isSnoozed(r, input.today) && !touched.has(r.id))
    .map((r) => scoreOne(r, input.craft, input.config, input.today, month))
    .filter((s): s is RankedTouchSuggestion => s !== null && s.score >= SCORE_FLOOR)
    .sort(byScoreThenStableId);

  return scored.slice(0, WEEKLY_MAX);
}

function scoreOne(
  r: Relationship,
  craft: Craft,
  config: SeasonalityConfig,
  today: string,
  month: number
): RankedTouchSuggestion | null {
  const monthsSince = r.lastProjectDate
    ? wholeMonthsBetween(r.lastProjectDate, today)
    : undefined;

  // A future project date is data entry, not time travel; it cannot rank.
  if (monthsSince !== undefined && monthsSince < 0) return null;

  // The recency floor: fresher than six whole months is never "worth a
  // message" — not even in a season window. Declining to suggest is the
  // judgment this product sells. A client without a date cannot prove
  // dormancy, so it cannot rank either.
  if (monthsSince === undefined || monthsSince < RECENCY_FLOOR_MONTHS) return null;

  const isPrivate = r.clientType === "private";
  const window = seasonWindowFor(config, craft, month);

  let reasonCode: RankedTouchSuggestion["reasonCode"] | null = null;
  let base = 0;

  if (monthsSince >= 10 && monthsSince <= 14) {
    reasonCode = "anniversary";
    base = 100;
  } else if (window && !isPrivate) {
    // Season windows are trade talk — briefing calendars, campaign planning.
    // A consumer who booked a wedding has no autumn campaign; a seasonal
    // reason on a private client is structurally impossible now.
    reasonCode = "season";
    base = 70;
  } else {
    // Six months or more of silence, no better reason. For a private client
    // the honest angle is gratitude plus a referral, not "the season".
    reasonCode = isPrivate ? "referral" : "gap";
    // 6 months → 40, growing to 60 at 24 months, flat past that.
    base = 40 + Math.min(monthsSince - 6, 18) * (20 / 18);
  }

  if (reasonCode === null) return null;

  // Season on top of a real gap beats season alone: the reason is the season,
  // the urgency is the silence.
  if (reasonCode === "season") {
    base += Math.min(monthsSince - 6, 12);
  }

  return {
    relationshipId: r.id,
    reasonCode,
    seasonReason: reasonCode === "season" ? window!.reason : undefined,
    monthsSince,
    score: Math.round(base * valueMultiplier(r.approxValueCents)),
  };
}

/**
 * 1.0 at unknown or €0, up to 1.3 at €10.000+. Logarithmic so a whale cannot
 * drown a reason-rich smaller client.
 */
function valueMultiplier(cents: number | undefined): number {
  if (!cents || cents <= 0) return 1;
  const euros = cents / 100;
  return 1 + Math.min(Math.log10(euros / 100) / 6.7, 0.3);
}

function byScoreThenStableId(a: RankedTouchSuggestion, b: RankedTouchSuggestion): number {
  if (b.score !== a.score) return b.score - a.score;
  return a.relationshipId.localeCompare(b.relationshipId);
}

export function isSnoozed(r: Relationship, today: string): boolean {
  return !!r.snoozedUntil && r.snoozedUntil > today;
}

/**
 * Relationship temperature, derived from the last contact of any kind.
 *
 *   warm     touched or worked with inside 9 months
 *   cooling  9–18 months: the prime rebooking band
 *   cold     beyond 18 months, or no date at all
 */
export function deriveTemperature(
  lastContactDate: string | undefined,
  today: string
): Temperature {
  if (!lastContactDate) return "cold";
  const months = wholeMonthsBetween(lastContactDate, today);
  if (months < 0) return "warm";
  if (months < 9) return "warm";
  if (months <= 18) return "cooling";
  return "cold";
}

/** Whole calendar months from `from` to `to`; negative when `from` is later. */
export function wholeMonthsBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  let months = (ty - fy) * 12 + (tm - fm);
  if (td < fd) months -= 1;
  return months;
}

function monthOf(iso: string): number {
  return Number(iso.slice(5, 7));
}
