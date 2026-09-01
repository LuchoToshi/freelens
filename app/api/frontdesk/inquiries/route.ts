import { isValidHandle } from "@/lib/frontdesk/handles";
import {
  EVENT_TYPE_OTHER,
  EVENT_TYPE_OTHER_MAX,
  isSubmittableEventType,
  needsOtherText,
} from "@/lib/frontdesk/eventTypes";
import { serviceClient } from "@/lib/frontdesk/server/clients";
import { fdDict } from "@/lib/frontdesk/i18n";
import { sendEmail } from "@/lib/server/sendEmail";
import { after } from "next/server";
import { generateAndStoreDraft } from "@/lib/frontdesk/server/draftPipeline";

/**
 * The public inquiry submit. No auth by design — the client of a freelancer
 * has no account — so the guards are: honeypot, per-IP rate limit, strict
 * shape validation with unknown-field rejection, and a size cap read before
 * parsing. Inserts happen with the service role because there are no anon
 * RLS policies at all.
 *
 * Logs carry outcome codes only: never a name, a message body, or an email
 * address.
 */
export const maxDuration = 300;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const MAX_BODY_BYTES = 20_000;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;
const BUDGET_BANDS = new Set(["<1000", "1000-2500", "2500+", "unsure"]);
const SRC_CHANNELS = new Set(["ig", "tt", "li", "sig"]);
const KNOWN_FIELDS = new Set([
  "handle",
  "srcChannel",
  "clientName",
  "clientEmail",
  "eventDate",
  "eventType",
  "budgetBand",
  "message",
  "website",
]);

const GENERIC_OK = { ok: true };

/** The client's name goes into email HTML; it is attacker-controlled text. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ ok: false }, { status: 413 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  if (Object.keys(b).some((k) => !KNOWN_FIELDS.has(k))) {
    return Response.json({ ok: false }, { status: 400 });
  }

  // Honeypot: bots that filled the invisible field get a generic yes and
  // nothing is stored — the waitlist convention.
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return Response.json(GENERIC_OK);
  }

  // Both x-real-ip and the first x-forwarded-for hop are platform-set on
  // Vercel: the edge overwrites this header rather than forwarding whatever
  // a client sends, so neither is client-spoofable here (see Vercel's
  // request-headers docs). The real weakness is per-instance memory, not
  // header trust (see plan).
  const ip =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false }, { status: 429 });
  }

  const handle = typeof b.handle === "string" ? b.handle : "";
  const clientName = typeof b.clientName === "string" ? b.clientName.trim().slice(0, 120) : "";
  const clientEmail =
    typeof b.clientEmail === "string" ? b.clientEmail.trim().toLowerCase() : "";
  const eventDate =
    typeof b.eventDate === "string" && DATE_SHAPE.test(b.eventDate) ? b.eventDate : null;
  const eventType = typeof b.eventType === "string" ? b.eventType : "";
  const eventTypeOther =
    typeof b.eventTypeOther === "string"
      ? b.eventTypeOther.trim().slice(0, EVENT_TYPE_OTHER_MAX)
      : "";
  const budgetBand = typeof b.budgetBand === "string" ? b.budgetBand : "";
  const message =
    typeof b.message === "string" && b.message.trim() ? b.message.trim().slice(0, 5000) : null;
  const srcChannel =
    typeof b.srcChannel === "string" && SRC_CHANNELS.has(b.srcChannel) ? b.srcChannel : null;

  if (
    !isValidHandle(handle) ||
    !clientName ||
    !EMAIL_SHAPE.test(clientEmail) ||
    clientEmail.length > 254 ||
    !isSubmittableEventType(eventType) ||
    needsOtherText(eventType, eventTypeOther) ||
    !BUDGET_BANDS.has(budgetBand)
  ) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const db = serviceClient();
  const { data: freelancer } = await db
    .from("freelancers")
    .select("id, auth_user_id, locale, display_name")
    .eq("handle", handle)
    .maybeSingle();
  if (!freelancer) {
    return Response.json({ ok: false }, { status: 404 });
  }

  const { data: inquiry, error: insertError } = await db
    .from("inquiries")
    .insert({
      freelancer_id: freelancer.id,
      source: "form",
      src_channel: srcChannel,
      client_name: clientName,
      client_email: clientEmail,
      event_date: eventDate,
      event_type: eventType,
      event_type_other: eventType === EVENT_TYPE_OTHER ? eventTypeOther : null,
      budget_band: budgetBand,
      message,
      status: "new",
    })
    .select("id")
    .single();
  if (insertError || !inquiry) {
    console.error("frontdesk/inquiries: insert_failed");
    return Response.json({ ok: false }, { status: 500 });
  }

  // Notification to the freelancer's login address. In-band: it is one fast
  // call, and the boolean is the outcome code.
  const t = fdDict(freelancer.locale).public.notify;
  const { data: userData } = await db.auth.admin.getUserById(freelancer.auth_user_id);
  const to = userData?.user?.email;
  let notified = false;
  if (to) {
    const typeLabel =
      fdDict(freelancer.locale).public.form.types[
        eventType as keyof ReturnType<typeof fdDict>["public"]["form"]["types"]
      ];
    const subject = t.subject
      .replace("{name}", clientName)
      .replace("{type}", typeLabel)
      .replace("{date}", eventDate ?? t.noDate);
    // Trusted origin, not the Host header: a spoofed Host must not be able to
    // point the freelancer's notification link at another site.
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://freelens-mvp.vercel.app";
    notified = await sendEmail({
      to,
      subject,
      html: `<p>${esc(subject)}</p><p><a href="${origin}/inbox">${esc(t.bodyLine)}</a></p>`,
    });
  }
  console.log(`frontdesk/inquiries: created notified:${notified}`);

  // Draft generation runs after the response: the client's confirmation never
  // waits on a model. Failures are logged as codes; the inbox renders a
  // draft-less inquiry as "pending" with a regenerate action.
  after(async () => {
    const outcome = await generateAndStoreDraft(inquiry.id, "reply").catch(() => "generation_failed");
    console.log(`frontdesk/inquiries: draft:${outcome}`);
  });

  return Response.json(GENERIC_OK);
}
