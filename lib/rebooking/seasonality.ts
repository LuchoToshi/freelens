/**
 * The seasonality table: when client budgets actually move, per craft.
 *
 * Versioned config, not code. The ranking engine reads windows from here and
 * nothing else, so a country variant is a new object with a different
 * `country`, added without touching the scorer. v1 is the table from the
 * Phase B brief plus the concierge hook library it was validated against.
 *
 * A window says: in these months, clients of this kind are briefing or
 * booking, so a message from this craft has a season-shaped reason. The
 * `reason` key picks the deterministic sentence in `reasonText.ts`.
 */
import type { Craft } from "@/lib/rebooking/types";

export interface SeasonWindow {
  /** 1–12, the months the window covers. */
  months: readonly number[];
  /** Which seasonal sentence this window justifies. */
  reason: SeasonReason;
}

export type SeasonReason =
  | "spring-campaign-briefing"
  | "autumn-campaign-briefing"
  | "headshot-refresh"
  | "next-season-booking"
  | "editorial-rolling";

export interface SeasonalityConfig {
  version: string;
  country: string;
  windows: Readonly<Record<Craft, readonly SeasonWindow[]>>;
}

export const SEASONALITY_NL_V1: SeasonalityConfig = {
  version: "nl-seasons.v1",
  country: "NL",
  windows: {
    photographer: [
      { months: [1, 2], reason: "spring-campaign-briefing" },
      { months: [8, 9], reason: "autumn-campaign-briefing" },
      { months: [1, 9], reason: "headshot-refresh" },
      { months: [10, 11, 12, 1, 2], reason: "next-season-booking" },
    ],
    videographer: [
      { months: [1, 2], reason: "spring-campaign-briefing" },
      { months: [8, 9], reason: "autumn-campaign-briefing" },
      { months: [10, 11, 12, 1, 2], reason: "next-season-booking" },
    ],
    designer: [
      { months: [1, 2], reason: "spring-campaign-briefing" },
      { months: [8, 9], reason: "autumn-campaign-briefing" },
    ],
    illustrator: [{ months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], reason: "editorial-rolling" }],
    other: [
      { months: [1, 2], reason: "spring-campaign-briefing" },
      { months: [8, 9], reason: "autumn-campaign-briefing" },
    ],
  },
};

/** The first window covering `month`, or null. Order in config is priority. */
export function seasonWindowFor(
  config: SeasonalityConfig,
  craft: Craft,
  month: number
): SeasonWindow | null {
  for (const window of config.windows[craft]) {
    if (window.months.includes(month)) return window;
  }
  return null;
}
