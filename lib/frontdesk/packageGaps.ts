/**
 * Package gap detection (master spec §6.5): deterministic observations about
 * the package list, derived at read time. Every gap carries an i18n key and,
 * where it concerns one inquiry type, the type — no scores, no AI, and never
 * a blocker: gaps inform, the readiness model gates.
 */

export interface GapPackage {
  label: string;
  price_from_eur: number | null;
  notes: string | null;
}

export interface GapInquiry {
  event_type: string;
  source: string;
}

export interface PackageGap {
  /** i18n key under inbox.readiness.gaps.<key>. */
  key: "noPackages" | "unpricedPackage" | "uncoveredType";
  /** For unpricedPackage: the package's label. For uncoveredType: the type. */
  detail?: string;
}

/**
 * Words that tie a package to an inquiry type, in both product languages —
 * matching is case-insensitive against label and notes. Deliberately coarse:
 * a missed match produces a hint the freelancer can ignore, never a block.
 */
const TYPE_WORDS: Record<string, string[]> = {
  wedding: ["wedding", "bruiloft", "trouw", "married", "marry", "engag", "huwelijk"],
  event: [
    "event",
    "evenement",
    "party",
    "feest",
    "verjaardag",
    "birthday",
    "corporate",
    "offsite",
    "zakelijk",
    "bedrijf",
    "conference",
    "congres",
  ],
  brand_film: ["brand film", "merkfilm", "commercial", "reclame", "campagne", "campaign"],
  music_video: ["music video", "videoclip", "muziekvideo", "clip"],
  real_estate: ["real estate", "vastgoed", "makelaar", "woning", "interieur", "interior"],
  social_content: ["social", "instagram", "tiktok", "reels", "content", "socials"],
  // Legacy types keep their words so an older inquiry still matches a package;
  // nothing infers them any more, because the form no longer offers them.
  party: ["party", "feest", "verjaardag", "birthday"],
  business: ["business", "zakelijk", "bedrijf", "corporate", "offsite"],
  portrait: ["portrait", "portret", "headshot"],
};

/** The types inference may produce: what the form offers, nothing retired. */
const INFERABLE_TYPES = [
  "wedding",
  "event",
  "brand_film",
  "music_video",
  "real_estate",
  "social_content",
] as const;

/** How many real inquiries of one type it takes before a gap is worth naming. */
const UNCOVERED_THRESHOLD = 2;

export function detectPackageGaps(
  packages: readonly GapPackage[],
  inquiries: readonly GapInquiry[]
): PackageGap[] {
  if (packages.length === 0) return [{ key: "noPackages" }];

  const gaps: PackageGap[] = [];
  for (const p of packages) {
    if (typeof p.price_from_eur !== "number" || p.price_from_eur <= 0) {
      gaps.push({ key: "unpricedPackage", detail: p.label });
    }
  }

  const haystack = packages
    .map((p) => `${p.label} ${p.notes ?? ""}`)
    .join(" ")
    .toLowerCase();
  const counts = new Map<string, number>();
  for (const inquiry of inquiries) {
    if (inquiry.source === "sample") continue;
    counts.set(inquiry.event_type, (counts.get(inquiry.event_type) ?? 0) + 1);
  }
  for (const [type, count] of counts) {
    const words = TYPE_WORDS[type];
    if (!words || count < UNCOVERED_THRESHOLD) continue;
    if (!words.some((w) => haystack.includes(w))) {
      gaps.push({ key: "uncoveredType", detail: type });
    }
  }
  return gaps;
}

/**
 * Deterministic occasion inference from the client's own words (§3: the
 * message is the brief; the desk never asks what it already knows). Returns
 * null when nothing matches — the conversation then asks, with a why-line.
 */
export function inferEventType(message: string | null): string | null {
  if (!message) return null;
  const haystack = message.toLowerCase();
  for (const type of INFERABLE_TYPES) {
    if (TYPE_WORDS[type].some((w) => haystack.includes(w))) return type;
  }
  return null;
}
