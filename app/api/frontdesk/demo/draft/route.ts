import { fdDict } from "@/lib/frontdesk/i18n";
import { detectLanguage } from "@/lib/frontdesk/draftGuards";
import { FrontdeskGenerationError, generateFrontdeskDraft } from "@/lib/frontdesk/generateDraft";
import {
  DEMO_BUDGET_BAND,
  DEMO_CLIENT_FIRST_NAME,
  DEMO_DISPLAY_NAME,
  DEMO_EVENT_TYPE,
  DEMO_PACKAGES,
  DEMO_SIGN_OFF,
  DEMO_VOICE_PROFILE,
  demoEventDate,
} from "@/lib/frontdesk/demoFixture";

/**
 * The demo's one live network call (spec §3). No auth, no session, no row
 * anywhere: the fixture inquiry is hardcoded, the generator is called
 * directly rather than through `generateAndStoreDraft`, and nothing is
 * inserted or selected. Same isolation shape as `/api/try/draft`.
 *
 * The visitor supplies nothing but which fixture copy they're looking at
 * (`locale`) — there is no free-text field here for a public endpoint to
 * smuggle arbitrary content into a model prompt.
 */
export const maxDuration = 300;

const WINDOW_MS = 24 * 60 * 60 * 1000;
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

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const locale = b.locale === "nl" ? "nl" : "en";

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, reason: "limit" }, { status: 429 });
  }

  const message = fdDict(locale).sample.message;
  const language = detectLanguage(message, locale);

  try {
    const { body: draftBody } = await generateFrontdeskDraft({
      kind: "reply",
      voiceProfile: DEMO_VOICE_PROFILE,
      packages: DEMO_PACKAGES,
      inquiry: {
        clientFirstName: DEMO_CLIENT_FIRST_NAME,
        eventType: DEMO_EVENT_TYPE,
        eventDate: demoEventDate(),
        budgetBand: DEMO_BUDGET_BAND,
        message,
      },
      displayName: DEMO_DISPLAY_NAME,
      signOff: DEMO_SIGN_OFF,
      targetLanguage: language,
    });
    return Response.json({ ok: true, body: draftBody });
  } catch (error) {
    if (error instanceof FrontdeskGenerationError) {
      console.error("frontdesk/demo: generation_failed attempts:", error.attempts);
      return Response.json({ ok: false }, { status: 502 });
    }
    console.error("frontdesk/demo: unexpected_failure");
    return Response.json({ ok: false }, { status: 500 });
  }
}
