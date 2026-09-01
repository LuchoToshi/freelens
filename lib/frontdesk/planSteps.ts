import { findPriceMentions } from "@/lib/frontdesk/draftGuards";

/**
 * The plan behind a draft (handoff §8.8): what was read, what was matched,
 * what was checked, what was written. Every step resolves against real data,
 * so a step can report that it found nothing rather than implying work that
 * did not happen. The date step is the clearest case: there is no calendar
 * integration, so the honest line is that nothing was claimed, not that a
 * date was verified.
 *
 * The module returns keys and values; the component turns them into copy, so
 * both locales say the same thing and the derivation stays testable.
 */
export interface PlanPackage {
  label: string;
  price_from_eur: number | null;
}

export type PlanDetailKey =
  | "readWithDate"
  | "readWithoutDate"
  | "matchedPackage"
  | "matchedNoNumber"
  | "matchedNoPackages"
  | "dateNoCalendar"
  | "dateNone"
  | "draftedVoice";

export interface PlanStep {
  key: "read" | "matched" | "date" | "drafted";
  detailKey: PlanDetailKey;
  values: Record<string, string>;
}

/** The package whose price the draft actually quotes, if any. */
export function matchedPackage(
  body: string,
  packages: readonly PlanPackage[],
): { label: string; asWritten: string } | null {
  const mentions = findPriceMentions(body);
  if (mentions.length === 0) return null;
  for (const mention of mentions) {
    const hit = packages.find(
      (p) => p.price_from_eur !== null && String(p.price_from_eur) === mention.digits,
    );
    if (hit) return { label: hit.label, asWritten: mention.asWritten };
  }
  return null;
}

export function planSteps({
  body,
  packages,
  eventType,
  eventDate,
}: {
  body: string;
  packages: readonly PlanPackage[];
  eventType: string;
  eventDate: string | null;
}): PlanStep[] {
  const match = matchedPackage(body, packages);

  return [
    {
      key: "read",
      detailKey: eventDate ? "readWithDate" : "readWithoutDate",
      values: { type: eventType, date: eventDate ?? "" },
    },
    {
      key: "matched",
      detailKey: match
        ? "matchedPackage"
        : packages.length === 0
          ? "matchedNoPackages"
          : "matchedNoNumber",
      values: match ? { package: match.label, price: match.asWritten } : {},
    },
    {
      key: "date",
      // No calendar integration exists, in either branch. The difference is
      // only whether there was a date in the inquiry to say that about.
      detailKey: eventDate ? "dateNoCalendar" : "dateNone",
      values: { date: eventDate ?? "" },
    },
    { key: "drafted", detailKey: "draftedVoice", values: {} },
  ];
}
