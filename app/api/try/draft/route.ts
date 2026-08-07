import { rankQueue } from "@/lib/rebooking/ranking";
import { SEASONALITY_NL_V1 } from "@/lib/rebooking/seasonality";
import { reasonTextFor } from "@/lib/rebooking/reasonText";
import { generateDraft, DraftGenerationError } from "@/lib/rebooking/generateDraft";
import type { Craft, Relationship } from "@/lib/rebooking/types";
import { CRAFTS } from "@/lib/server/waitlist";
import { salutationFor } from "@/lib/rebooking/salutation";

/**
 * The one server round-trip of the anonymous trial.
 *
 * No auth, no storage: the caller sends a single client record (name, project,
 * month — never an email address, never money), the reason is recomputed
 * server-side by the same deterministic engine as everywhere else, and the
 * draft comes back through the same guards the real app uses. Nothing is
 * written anywhere; a log line never contains a name.
 *
 * The free tier is the rate limit: a few drafts per IP per day, in-memory per
 * instance like the waitlist limiter. Generous enough for shared IPs, tight
 * enough that the model budget stays bounded.
 */
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const MONTH_SHAPE = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  // Honeypot, same convention as the waitlist: bots get a generic no.
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return Response.json({ ok: false }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, reason: "limit" }, { status: 429 });
  }

  const name = typeof b.name === "string" ? b.name.trim().slice(0, 120) : "";
  const project =
    typeof b.project === "string" ? b.project.trim().slice(0, 200) : "";
  const month = typeof b.month === "string" ? b.month.trim() : "";
  const craft: Craft = CRAFTS.includes(b.craft as Craft)
    ? (b.craft as Craft)
    : "other";
  const formality =
    b.formality === "je" || b.formality === "u" ? b.formality : undefined;
  const greeting =
    typeof b.greeting === "string" && b.greeting.trim()
      ? b.greeting.trim().slice(0, 40)
      : undefined;
  const signoff =
    typeof b.signoff === "string" && b.signoff.trim()
      ? b.signoff.trim().slice(0, 40)
      : undefined;
  const locale = b.locale === "nl" ? "nl" : "en";
  const clientType = b.clientType === "private" ? ("private" as const) : ("direct" as const);
  // The salutation arrives precomputed from the same deterministic rule the
  // client ran; a missing or malformed one is rederived here, never trusted.
  const sentSalutation =
    typeof b.salutation === "string" &&
    b.salutation.trim().length > 0 &&
    b.salutation.length <= 60 &&
    !b.salutation.includes("\n")
      ? b.salutation.trim()
      : null;

  const today = new Date().toISOString().slice(0, 10);
  if (!name || !MONTH_SHAPE.test(month) || `${month}-01` > today) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const now = new Date().toISOString();
  const relationship: Relationship = {
    id: "trial",
    userId: "trial",
    clientName: name,
    clientType,
    lastProjectTitle: project || undefined,
    lastProjectDate: `${month}-01`,
    temperature: "cold",
    createdAt: now,
    updatedAt: now,
  };

  const [ranked] = rankQueue({
    relationships: [relationship],
    craft,
    config: SEASONALITY_NL_V1,
    today,
  });
  const suggestion = ranked ?? {
    relationshipId: relationship.id,
    reasonCode: "manual" as const,
    monthsSince: undefined,
    seasonReason: undefined,
    score: 0,
  };
  const reasonText = reasonTextFor(suggestion, relationship, locale);

  try {
    const draft = await generateDraft({
      relationship,
      suggestion: { ...suggestion, reasonCode: suggestion.reasonCode as never },
      reasonText,
      voice: { craft, greeting, signoff, formality },
      locale,
      salutation:
        sentSalutation ??
        salutationFor({
          clientName: name,
          formality: formality ?? "je",
          locale,
          greetingOverride: greeting,
        }),
    });
    return Response.json({ ok: true, subject: draft.subject, body: draft.body });
  } catch (error) {
    if (error instanceof DraftGenerationError) {
      console.error("try/draft: generation failed after", error.attempts, "attempts");
      return Response.json({ ok: false }, { status: 502 });
    }
    console.error("try/draft: unexpected failure");
    return Response.json({ ok: false }, { status: 500 });
  }
}
