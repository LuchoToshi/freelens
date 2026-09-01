/**
 * What a client can say the work is (handoff §9).
 *
 * Two lists, on purpose. INTAKE_EVENT_TYPES is what the form offers today and
 * what the API accepts from a new submission. LEGACY_EVENT_TYPES is what older
 * rows already hold: they are never offered again, but every surface must keep
 * rendering them, because an inquiry does not stop existing when the question
 * changes. STORED_EVENT_TYPES is the union the database constraint allows.
 */
export const INTAKE_EVENT_TYPES = [
  "wedding",
  "event",
  "brand_film",
  "music_video",
  "real_estate",
  "social_content",
  "other",
] as const;

export const LEGACY_EVENT_TYPES = ["party", "business", "portrait"] as const;

/**
 * What the hybrid thread stores when the client never answered the question.
 * It is deliberately not "other": "the client did not say" and "the client
 * said it is something else" are different facts, and collapsing them would
 * make the desk claim an answer nobody gave.
 */
export const UNSPECIFIED_EVENT_TYPE = "unspecified";

export type IntakeEventType = (typeof INTAKE_EVENT_TYPES)[number];
export type StoredEventType =
  | IntakeEventType
  | (typeof LEGACY_EVENT_TYPES)[number]
  | typeof UNSPECIFIED_EVENT_TYPE;

export const STORED_EVENT_TYPES: readonly StoredEventType[] = [
  ...INTAKE_EVENT_TYPES,
  ...LEGACY_EVENT_TYPES,
  UNSPECIFIED_EVENT_TYPE,
];

/** The type that requires the client to say what the project actually is. */
export const EVENT_TYPE_OTHER: IntakeEventType = "other";

export const EVENT_TYPE_OTHER_MAX = 120;

export function isIntakeEventType(value: string): value is IntakeEventType {
  return (INTAKE_EVENT_TYPES as readonly string[]).includes(value);
}

/** What the API accepts from a new submission: the form's options, or silence. */
export function isSubmittableEventType(value: string): boolean {
  return isIntakeEventType(value) || value === UNSPECIFIED_EVENT_TYPE;
}

/**
 * The one validation rule the conditional field adds: choosing "Something
 * else" without saying what it is leaves the freelancer with an inquiry that
 * names no work, so it is not a submission the product accepts.
 */
export function needsOtherText(eventType: string, otherText: string): boolean {
  return eventType === EVENT_TYPE_OTHER && otherText.trim().length === 0;
}

/**
 * How a stored type reads on screen. "Something else" renders as the words
 * the client typed, because their own description of the work is more use to
 * the freelancer than the word "other"; everything else takes its label from
 * the dictionary, including values the form no longer offers.
 */
export function eventTypeLabel(
  eventType: string,
  eventTypeOther: string | null | undefined,
  labels: Record<string, string>,
): string {
  if (eventType === EVENT_TYPE_OTHER && eventTypeOther?.trim()) return eventTypeOther.trim();
  return labels[eventType] ?? eventType;
}
