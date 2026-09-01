import { asUserClient } from "@/lib/frontdesk/server/clients";
import { extractPrefill, fetchSourceText } from "@/lib/frontdesk/server/prefill";

/**
 * Setup prefill (addendum §4): read a public page or pasted text and return
 * a PROPOSAL. This route writes nothing — the wizard's confirm step is the
 * only thing that saves, so "nothing saves before the confirm gate" is
 * structural, not a promise.
 */
export const maxDuration = 300;

export async function POST(request: Request) {
  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 401 });
  const asUser = asUserClient(jwt);
  const { data: userData, error } = await asUser.auth.getUser(jwt);
  if (error || !userData?.user) return Response.json({ ok: false }, { status: 401 });

  let body: { url?: unknown; text?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  const pasted = typeof body.text === "string" ? body.text.trim() : "";

  let sourceText = "";
  let source: "url" | "text" = "text";
  if (url) {
    const fetched = await fetchSourceText(url);
    if (!fetched) {
      console.log("frontdesk/prefill: unreadable_source");
      return Response.json({ ok: false, reason: "unreadable" }, { status: 200 });
    }
    sourceText = fetched;
    source = "url";
  } else if (pasted) {
    sourceText = pasted;
  } else {
    return Response.json({ ok: false, reason: "empty" }, { status: 200 });
  }

  const prefill = await extractPrefill(sourceText, source);
  if (!prefill) {
    console.log("frontdesk/prefill: extraction_failed");
    return Response.json({ ok: false, reason: "extraction_failed" }, { status: 200 });
  }
  console.log(`frontdesk/prefill: read source:${source} packages:${prefill.packages.length}`);
  return Response.json({ ok: true, prefill });
}
