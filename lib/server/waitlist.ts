import { createHmac, createHash, timingSafeEqual } from "node:crypto";

/**
 * Waitlist plumbing: tokens, hashes, and the record shape.
 *
 * The confirm token is `id.hmac(id)`: possession of the link proves the email
 * was received, which is the whole of what double opt-in asserts. The id is a
 * UUID, so the token space is unguessable even before the HMAC; the HMAC makes
 * enumeration pointless even if ids ever leaked.
 *
 * Emails are stored inside the record but never appear in a pathname or a log
 * line: pathnames use the id or a hash, so a listing of the store names nobody.
 */
export type Craft =
  | "photographer"
  | "videographer"
  | "designer"
  | "illustrator"
  | "other";

export const CRAFTS: readonly Craft[] = [
  "photographer",
  "videographer",
  "designer",
  "illustrator",
  "other",
];

export interface WaitlistRecord {
  id: string;
  name: string;
  email: string;
  craft: Craft;
  locale: "en" | "nl";
  requestedAt: string;
}

function secret(): string {
  const value = process.env.WAITLIST_SECRET;
  if (!value) throw new Error("WAITLIST_SECRET is not set");
  return value;
}

export function signToken(id: string): string {
  const mac = createHmac("sha256", secret()).update(id).digest("hex").slice(0, 32);
  return `${id}.${mac}`;
}

/** Returns the id when the token verifies, null otherwise. Constant-time. */
export function verifyToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", secret())
    .update(id)
    .digest("hex")
    .slice(0, 32);
  if (mac.length !== expected.length) return null;
  try {
    return timingSafeEqual(Buffer.from(mac), Buffer.from(expected)) ? id : null;
  } catch {
    return null;
  }
}

/** For dedupe pathnames: the address itself never becomes a pathname. */
export function emailHash(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function pendingPath(id: string): string {
  return `waitlist/pending/${id}.json`;
}

export function confirmedPath(id: string): string {
  return `waitlist/confirmed/${id}.json`;
}

export function emailMarkerPath(email: string): string {
  return `waitlist/email/${emailHash(email)}.json`;
}
