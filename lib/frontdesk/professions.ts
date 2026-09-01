import type { FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * What a freelancer calls the work they do.
 *
 * Two rules shape this list. It is long enough that most people find
 * themselves in it, including trades the product was not originally written
 * for, and it is open: anything missing can be typed and is kept in the
 * freelancer's own words. A picker that silently files a hairdresser under
 * "creative freelancer" is telling their clients something they did not say.
 *
 * The catalogue lives here rather than in the UI dictionary because these are
 * a person's job titles, not product copy: they are looked up by stored value,
 * they may be typed by hand, and the parity rules that govern interface
 * language do not apply to them.
 */
export interface ProfessionOption {
  value: string;
  en: string;
  nl: string;
  /** The freelancers.craft value this maps to; anything else is "other". */
  craft: "photographer" | "videographer" | "designer" | "illustrator" | "other";
}

export const PROFESSION_CATALOGUE: readonly ProfessionOption[] = [
  // Image and film
  { value: "photographer", en: "Photographer", nl: "Fotograaf", craft: "photographer" },
  { value: "videographer", en: "Videographer", nl: "Videograaf", craft: "videographer" },
  { value: "filmmaker", en: "Filmmaker", nl: "Filmmaker", craft: "videographer" },
  { value: "video_editor", en: "Video editor", nl: "Videomonteur", craft: "videographer" },
  { value: "drone_operator", en: "Drone operator", nl: "Dronepiloot", craft: "videographer" },
  { value: "photo_editor", en: "Photo editor", nl: "Fotobewerker", craft: "photographer" },

  // Design and illustration
  { value: "graphic_designer", en: "Graphic designer", nl: "Grafisch ontwerper", craft: "designer" },
  { value: "brand_designer", en: "Brand designer", nl: "Merkontwerper", craft: "designer" },
  { value: "web_designer", en: "Web designer", nl: "Webontwerper", craft: "designer" },
  { value: "ux_designer", en: "UX designer", nl: "UX-ontwerper", craft: "designer" },
  { value: "interior_designer", en: "Interior designer", nl: "Interieurontwerper", craft: "designer" },
  { value: "illustrator", en: "Illustrator", nl: "Illustrator", craft: "illustrator" },
  { value: "animator", en: "Animator", nl: "Animator", craft: "illustrator" },
  { value: "motion_designer", en: "Motion designer", nl: "Motion designer", craft: "designer" },
  { value: "art_director", en: "Art director", nl: "Art director", craft: "designer" },
  { value: "tattoo_artist", en: "Tattoo artist", nl: "Tatoeëerder", craft: "illustrator" },

  // Sound and stage
  { value: "dj", en: "DJ", nl: "DJ", craft: "other" },
  { value: "musician", en: "Musician", nl: "Muzikant", craft: "other" },
  { value: "band", en: "Band", nl: "Band", craft: "other" },
  { value: "music_producer", en: "Music producer", nl: "Muziekproducent", craft: "other" },
  { value: "sound_engineer", en: "Sound engineer", nl: "Geluidstechnicus", craft: "other" },
  { value: "voice_actor", en: "Voice actor", nl: "Stemacteur", craft: "other" },
  { value: "host", en: "Host or MC", nl: "Presentator of ceremoniemeester", craft: "other" },
  { value: "dancer", en: "Dancer", nl: "Danser", craft: "other" },

  // Hair, beauty and body
  { value: "hairdresser", en: "Hairdresser", nl: "Kapper", craft: "other" },
  { value: "barber", en: "Barber", nl: "Barbier", craft: "other" },
  { value: "makeup_artist", en: "Make-up artist", nl: "Visagist", craft: "other" },
  { value: "nail_artist", en: "Nail artist", nl: "Nagelstylist", craft: "other" },
  { value: "beautician", en: "Beautician", nl: "Schoonheidsspecialist", craft: "other" },
  { value: "stylist", en: "Stylist", nl: "Stylist", craft: "other" },
  { value: "personal_trainer", en: "Personal trainer", nl: "Personal trainer", craft: "other" },
  { value: "yoga_teacher", en: "Yoga teacher", nl: "Yogadocent", craft: "other" },
  { value: "massage_therapist", en: "Massage therapist", nl: "Masseur", craft: "other" },

  // Events and food
  { value: "event_planner", en: "Event planner", nl: "Eventplanner", craft: "other" },
  { value: "wedding_planner", en: "Wedding planner", nl: "Weddingplanner", craft: "other" },
  { value: "caterer", en: "Caterer", nl: "Cateraar", craft: "other" },
  { value: "chef", en: "Private chef", nl: "Privékok", craft: "other" },
  { value: "bartender", en: "Bartender", nl: "Bartender", craft: "other" },
  { value: "florist", en: "Florist", nl: "Bloemist", craft: "other" },
  { value: "decorator", en: "Decorator", nl: "Decorateur", craft: "other" },

  // Words and marketing
  { value: "copywriter", en: "Copywriter", nl: "Copywriter", craft: "other" },
  { value: "translator", en: "Translator", nl: "Vertaler", craft: "other" },
  { value: "social_media_manager", en: "Social media manager", nl: "Socialmediamanager", craft: "other" },
  { value: "content_creator", en: "Content creator", nl: "Contentmaker", craft: "other" },
  { value: "marketing_consultant", en: "Marketing consultant", nl: "Marketingadviseur", craft: "other" },

  // Making and building
  { value: "artist", en: "Artist", nl: "Kunstenaar", craft: "illustrator" },
  { value: "ceramicist", en: "Ceramicist", nl: "Keramist", craft: "other" },
  { value: "carpenter", en: "Carpenter", nl: "Timmerman", craft: "other" },
  { value: "set_builder", en: "Set builder", nl: "Decorbouwer", craft: "other" },
  { value: "model", en: "Model", nl: "Model", craft: "other" },
];

const BY_VALUE = new Map(PROFESSION_CATALOGUE.map((p) => [p.value, p]));

/**
 * How a stored profession reads. A value typed by the freelancer is not in the
 * catalogue, and is returned as they wrote it: their own word for their own
 * work is the best label there is.
 */
export function professionLabel(value: string, locale: FrontdeskLocale): string {
  const known = BY_VALUE.get(value);
  return known ? known[locale] : value;
}

export function isKnownProfession(value: string): boolean {
  return BY_VALUE.has(value);
}

/**
 * The craft column still exists and is still constrained to five values, so a
 * profession outside those five maps to "other" for storage while the real
 * profession is kept in `professions` and is what every surface displays.
 */
export function craftForProfession(value: string): ProfessionOption["craft"] {
  return BY_VALUE.get(value)?.craft ?? "other";
}

/** Catalogue entries matching a typed query, in catalogue order. */
export function searchProfessions(query: string, locale: FrontdeskLocale): ProfessionOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...PROFESSION_CATALOGUE];
  return PROFESSION_CATALOGUE.filter((p) => p[locale].toLowerCase().includes(q));
}

/**
 * A typed profession, normalized for storage: trimmed, length-capped, and kept
 * in the freelancer's own casing. Returns the catalogue value when the typed
 * text matches a known label, so "Hairdresser" does not become a second,
 * private copy of a profession the catalogue already knows.
 */
export function normalizeTypedProfession(input: string, locale: FrontdeskLocale): string | null {
  const text = input.trim().slice(0, 60);
  if (!text) return null;
  const match = PROFESSION_CATALOGUE.find((p) => p[locale].toLowerCase() === text.toLowerCase());
  return match ? match.value : text;
}
