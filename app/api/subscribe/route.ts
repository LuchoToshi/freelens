import { put } from "@vercel/blob";

/**
 * The one write endpoint in the product, and the whole of what it accepts.
 *
 * An email address, given voluntarily, for one purpose: to be told when the
 * verified tax config changes. It lands in a private Vercel Blob store, one
 * small JSON file per signup, readable only with the store token. No cookie is
 * set, nothing else from the request is kept, and the financial figures on the
 * client never touch this route.
 *
 * Deliberately boring: no double-opt-in flow, no mail provider, no list
 * management. Those become worth their weight when there is a list worth
 * managing; today the job is not losing the first hundred addresses.
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const email =
    body && typeof body === "object" && "email" in body
      ? String((body as { email: unknown }).email).trim().toLowerCase()
      : "";
  const locale =
    body && typeof body === "object" && "locale" in body
      ? String((body as { locale: unknown }).locale).slice(0, 5)
      : "";

  if (!email || email.length > 254 || !EMAIL_SHAPE.test(email)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  try {
    await put(
      `signups/${new Date().toISOString().slice(0, 10)}-signup.json`,
      JSON.stringify({ email, locale, receivedAt: new Date().toISOString() }),
      {
        access: "private",
        addRandomSuffix: true,
        contentType: "application/json",
      }
    );
  } catch (error) {
    // The token is missing in local dev without `vercel env pull`, and Blob
    // can be briefly unavailable. Either way the visitor gets an honest retry
    // prompt, not a false "you're on the list". The log line is the route's
    // only observability, and it must never include the email.
    console.error("subscribe: blob write failed", error);
    return Response.json({ ok: false }, { status: 502 });
  }

  return Response.json({ ok: true });
}
