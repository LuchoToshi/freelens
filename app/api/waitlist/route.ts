import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import {
  CRAFTS,
  EMAIL_SHAPE,
  emailMarkerPath,
  pendingPath,
  signToken,
  type Craft,
  type WaitlistRecord,
} from "@/lib/server/waitlist";
import { sendEmail } from "@/lib/server/sendEmail";

/**
 * Waitlist signup, double opt-in.
 *
 * Every response a caller can distinguish is the same generic success, on
 * purpose: a duplicate address, a honeypot hit and a fresh signup all read
 * identically from outside, so the endpoint confirms nothing about who is on
 * the list. Real failures (invalid input, rate limit, storage down) are the
 * only non-200s.
 *
 * Rate limiting: a per-instance in-memory window per IP (Fluid Compute reuses
 * instances, so this holds for bursts, which is what abuse looks like) plus a
 * hard per-email dedupe in storage (`allowOverwrite: false`), which holds
 * across instances forever. No log line ever contains the address.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 10_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const GENERIC_OK = { ok: true };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  // Honeypot: a filled hidden field is a bot. Generic success, nothing stored.
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return Response.json(GENERIC_OK);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false }, { status: 429 });
  }

  const name = typeof b.name === "string" ? b.name.trim().slice(0, 80) : "";
  const email =
    typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const craft = CRAFTS.includes(b.craft as Craft) ? (b.craft as Craft) : null;
  const locale = b.locale === "nl" ? "nl" : "en";

  if (!name || !craft || !email || email.length > 254 || !EMAIL_SHAPE.test(email)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  // Hard dedupe per address: the marker write fails if it already exists, and
  // the caller learns nothing either way.
  try {
    await put(emailMarkerPath(email), JSON.stringify({ at: new Date().toISOString() }), {
      access: "private",
      allowOverwrite: false,
      contentType: "application/json",
    });
  } catch {
    return Response.json(GENERIC_OK);
  }

  const record: WaitlistRecord = {
    id: randomUUID(),
    name,
    email,
    craft,
    locale,
    requestedAt: new Date().toISOString(),
  };

  try {
    await put(pendingPath(record.id), JSON.stringify(record), {
      access: "private",
      contentType: "application/json",
    });
  } catch (error) {
    console.error("waitlist: pending write failed", error instanceof Error ? error.message : "");
    return Response.json({ ok: false }, { status: 502 });
  }

  const confirmUrl = `${new URL(request.url).origin}/api/waitlist/confirm?token=${signToken(record.id)}`;
  const sent = await sendEmail(
    locale === "nl"
      ? {
          to: email,
          subject: "Bevestig je plek op de Freelens-wachtlijst",
          html: `<p>Hoi ${escapeHtml(name)},</p><p>Nog één klik en je staat op de wachtlijst voor Freelens Rebooking. Zo weten we zeker dat dit adres van jou is.</p><p><a href="${confirmUrl}">Bevestig mijn aanmelding</a></p><p>Niet aangemeld? Dan kun je deze mail negeren; zonder bevestiging bewaren we niets blijvend.</p>`,
        }
      : {
          to: email,
          subject: "Confirm your spot on the Freelens waitlist",
          html: `<p>Hi ${escapeHtml(name)},</p><p>One click left and you are on the waitlist for Freelens Rebooking. This is how we know this address is yours.</p><p><a href="${confirmUrl}">Confirm my signup</a></p><p>Didn't sign up? Ignore this mail; without confirmation nothing is kept for good.</p>`,
        }
  );
  if (!sent) {
    // Stored as pending; the confirmation cannot arrive until the provider is
    // configured. Logged without the address, answered generically.
    console.error("waitlist: confirmation mail not sent for a new signup");
  }

  return Response.json(GENERIC_OK);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
