/**
 * The Rebooking domain, exactly as specified in the Phase B brief.
 *
 * Everything money- or date-shaped in here is produced by deterministic code.
 * The only fields a model ever writes are `draftSubject` and `draftBody` on a
 * Touch, and even those pass through the guards in `draftGuards.ts` before a
 * user sees them.
 *
 * Privacy by minimisation, enforced by shape: there is no field for a client
 * address, phone number, KvK or VAT number, so none can be collected.
 */
export type Craft =
  | "photographer"
  | "videographer"
  | "designer"
  | "illustrator"
  | "other";

export type ClientType = "direct" | "agency" | "brand" | "editorial" | "other";

export type Temperature = "warm" | "cooling" | "cold";

export interface Relationship {
  id: string;
  userId: string;
  clientName: string;
  clientEmail?: string;
  company?: string;
  clientType?: ClientType;
  lastProjectTitle?: string;
  /** ISO date. */
  lastProjectDate?: string;
  approxValueCents?: number;
  /** Free text, shown to the user only; may feed a draft as a fact source. */
  notes?: string;
  /** Derived by `deriveTemperature`, stored for query speed, never authored. */
  temperature: Temperature;
  /** ISO date. While in the future, the ranking skips this relationship. */
  snoozedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReasonCode = "anniversary" | "season" | "gap" | "manual";

export type TouchStatus =
  | "suggested"
  | "edited"
  | "sent_by_user"
  | "skipped"
  | "snoozed";

export interface Touch {
  id: string;
  userId: string;
  relationshipId: string;
  suggestedAt: string;
  reasonCode: ReasonCode;
  /** Human-readable why, rendered deterministically in the user's locale. */
  reasonText: string;
  draftSubject: string;
  draftBody: string;
  status: TouchStatus;
  statusAt: string;
}

export type OutcomeResult =
  | "reply_positive"
  | "reply_neutral"
  | "reply_negative"
  | "booked"
  | "no_reply";

export interface Outcome {
  id: string;
  userId: string;
  touchId: string;
  result: OutcomeResult;
  bookedValueCents?: number;
  note?: string;
  recordedAt: string;
}
