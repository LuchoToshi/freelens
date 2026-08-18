import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * One secret, two domain-separated keys: HMAC-signs the OAuth `state`
 * param (proves which freelancer's redirect this is, short-lived) and
 * encrypts the refresh token at rest (AES-256-GCM). Same
 * single-secret-does-what's-needed pattern as WAITLIST_SECRET in
 * lib/server/waitlist.ts, but derived separately per use so the two keys
 * are independent even though they share a root secret.
 */
function secret(): string {
  const value = process.env.GMAIL_TOKEN_ENCRYPTION_KEY;
  if (!value) throw new Error("GMAIL_TOKEN_ENCRYPTION_KEY is not set");
  return value;
}

function stateKey(): Buffer {
  return createHmac("sha256", "gmail-oauth-state-key").update(secret()).digest();
}

function tokenKey(): Buffer {
  return createHmac("sha256", "gmail-refresh-token-key").update(secret()).digest();
}

const STATE_TTL_MS = 10 * 60 * 1000;

/** `state` carries the initiating freelancer through the Google redirect round trip. */
export function signState(freelancerId: string): string {
  const payload = `${freelancerId}.${Date.now()}`;
  const mac = createHmac("sha256", stateKey()).update(payload).digest("hex").slice(0, 32);
  return Buffer.from(`${payload}.${mac}`).toString("base64url");
}

/** Returns the freelancer id when the state verifies and has not expired, null otherwise. */
export function verifyState(state: string): string | null {
  let decoded: string;
  try {
    decoded = Buffer.from(state, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const parts = decoded.split(".");
  if (parts.length !== 3) return null;
  const [freelancerId, timestampRaw, mac] = parts;
  const payload = `${freelancerId}.${timestampRaw}`;
  const expected = createHmac("sha256", stateKey()).update(payload).digest("hex").slice(0, 32);
  if (mac.length !== expected.length) return null;
  let valid: boolean;
  try {
    valid = timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  } catch {
    return null;
  }
  if (!valid) return null;
  const timestamp = Number(timestampRaw);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > STATE_TTL_MS) return null;
  return freelancerId;
}

/** `iv.authTag.ciphertext`, each base64url. Never logged, never returned to a client. */
export function encryptRefreshToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((buf) => buf.toString("base64url")).join(".");
}

export function decryptRefreshToken(encrypted: string): string {
  const [ivPart, authTagPart, ciphertextPart] = encrypted.split(".");
  if (!ivPart || !authTagPart || !ciphertextPart) {
    throw new Error("malformed encrypted refresh token");
  }
  const decipher = createDecipheriv("aes-256-gcm", tokenKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(authTagPart, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
