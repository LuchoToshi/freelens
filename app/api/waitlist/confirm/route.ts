import { del, get, put } from "@vercel/blob";
import {
  confirmedPath,
  pendingPath,
  verifyToken,
  type WaitlistRecord,
} from "@/lib/server/waitlist";

/**
 * The second half of double opt-in: possession of the link is the proof.
 *
 * Idempotent by construction. First click moves pending → confirmed; a second
 * click finds the confirmed record and shows the same page; a bad or stale
 * token shows a neutral failure that reveals nothing about who is on the list.
 * The response is a tiny HTML page in the locale the signup chose.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const id = verifyToken(token);
  if (!id) return page("invalid", "en");

  try {
    const confirmed = await get(confirmedPath(id), {
      access: "private",
      useCache: false,
    });
    if (confirmed && confirmed.statusCode === 200) {
      const record = JSON.parse(
        await new Response(confirmed.stream).text()
      ) as WaitlistRecord;
      return page("already", record.locale);
    }

    const pending = await get(pendingPath(id), {
      access: "private",
      useCache: false,
    });
    if (!pending || pending.statusCode !== 200) return page("invalid", "en");

    const record = JSON.parse(
      await new Response(pending.stream).text()
    ) as WaitlistRecord;

    await put(
      confirmedPath(id),
      JSON.stringify({ ...record, confirmedAt: new Date().toISOString() }),
      { access: "private", contentType: "application/json", allowOverwrite: true }
    );
    await del(pendingPath(id));

    return page("confirmed", record.locale);
  } catch (error) {
    console.error("waitlist confirm failed", error instanceof Error ? error.message : "");
    return page("invalid", "en");
  }
}

const COPY = {
  confirmed: {
    nl: ["Je staat op de lijst.", "We mailen je zodra we de eerste 25 onboarden. Tot dan: je hoort niets van ons."],
    en: ["You are on the list.", "We will email you when we onboard the first 25. Until then, you will not hear from us."],
  },
  already: {
    nl: ["Je stond al op de lijst.", "Niets meer te doen. We mailen je zodra het zover is."],
    en: ["You were already on the list.", "Nothing more to do. We will email you when it is time."],
  },
  invalid: {
    nl: ["Deze link werkt niet meer.", "Meld je opnieuw aan op de homepage; dat kost tien seconden."],
    en: ["This link no longer works.", "Sign up again on the homepage; it takes ten seconds."],
  },
} as const;

function page(kind: keyof typeof COPY, locale: "en" | "nl") {
  const [title, body] = COPY[kind][locale];
  const back = locale === "nl" ? "Terug naar Freelens" : "Back to Freelens";
  return new Response(
    `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>body{font-family:ui-sans-serif,system-ui,sans-serif;background:#faf9f5;color:#122540;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:26rem;text-align:center}h1{font-size:1.5rem;margin:0 0 .75rem}p{color:#5a6b82;line-height:1.6;margin:0 0 1.5rem}a{color:#122540;font-weight:500}</style></head><body><main><h1>${title}</h1><p>${body}</p><a href="/">${back}</a></main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
