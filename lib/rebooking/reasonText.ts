/**
 * The reason, as a sentence a person reads before deciding to send.
 *
 * Deterministic templates in both locales. This is the line that converts
 * discomfort into a two-click act, so it names facts (months, the project,
 * the season) and never flatters or pressures. The model never writes these.
 */
import type { RankedTouchSuggestion } from "@/lib/rebooking/ranking";
import type { ReasonCode, Relationship } from "@/lib/rebooking/types";
import type { SeasonReason } from "@/lib/rebooking/seasonality";

type Locale = "en" | "nl";

const SEASON_LINES: Record<SeasonReason, Record<Locale, string>> = {
  "spring-campaign-briefing": {
    en: "Spring and summer campaigns are being briefed around now.",
    nl: "Voorjaars- en zomercampagnes worden nu gebrieft.",
  },
  "autumn-campaign-briefing": {
    en: "Autumn campaigns are being briefed around now.",
    nl: "Najaarscampagnes worden nu gebrieft.",
  },
  "headshot-refresh": {
    en: "New year, new hires: team photos age fastest around now.",
    nl: "Nieuw jaar, nieuwe collega's: teamfoto's verouderen nu het hardst.",
  },
  "next-season-booking": {
    en: "Next season is being booked around now.",
    nl: "Het komende seizoen wordt nu geboekt.",
  },
  "editorial-rolling": {
    en: "Editorial calendars are always filling.",
    nl: "Redactionele kalenders lopen altijd door.",
  },
};

export function reasonTextFor(
  suggestion: Pick<RankedTouchSuggestion, "monthsSince" | "seasonReason"> & {
    reasonCode: ReasonCode;
  },
  relationship: Relationship,
  locale: Locale
): string {
  const name = relationship.clientName;
  const project = relationship.lastProjectTitle;

  switch (suggestion.reasonCode) {
    case "anniversary": {
      const months = suggestion.monthsSince ?? 12;
      if (locale === "nl") {
        return project
          ? `Bijna een jaar geleden: ${project} voor ${name}. Dit is het natuurlijke moment.`
          : `Bijna een jaar sinds de laatste klus voor ${name} (${months} maanden). Dit is het natuurlijke moment.`;
      }
      return project
        ? `Almost a year since ${project} for ${name}. This is the natural moment.`
        : `Almost a year since the last job for ${name} (${months} months). This is the natural moment.`;
    }
    case "season": {
      const line = SEASON_LINES[suggestion.seasonReason ?? "spring-campaign-briefing"][locale];
      return locale === "nl"
        ? `${line} ${name} hoort nu van je, niet als het al vergeven is.`
        : `${line} ${name} should hear from you now, not after it is all assigned.`;
    }
    case "gap": {
      const months = suggestion.monthsSince ?? 6;
      return locale === "nl"
        ? `${months} maanden stil met ${name}. Lang genoeg dat een berichtje een gebeurtenis is, kort genoeg dat het warm is.`
        : `${months} months of quiet with ${name}. Long enough that a note is an event, short enough that it is still warm.`;
    }
    case "manual":
      return locale === "nl" ? `Door jou gekozen.` : `Picked by you.`;
  }
}
