import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";

/** One click from the weekly email and it stops. Possession of the signed
 * link is the proof; the token grants exactly one narrow write. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return page(false);
  const userId = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", process.env.WAITLIST_SECRET ?? "")
    .update(`optout:${userId}`)
    .digest("hex")
    .slice(0, 32);
  let valid = false;
  try {
    valid = mac.length === expected.length && timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  } catch {
    valid = false;
  }
  if (!valid) return page(false);

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { error } = await admin
    .from("voice_profiles")
    .update({ weekly_email: false })
    .eq("user_id", userId);
  if (error) console.error("weekly optout: update failed");
  return page(!error);
}

function page(ok: boolean) {
  const title = ok ? "Gestopt." : "Deze link werkt niet.";
  const body = ok
    ? "Je krijgt de wekelijkse mail niet meer. Weer aanzetten kan in de app."
    : "Log in op de app en zet de wekelijkse mail daar uit.";
  return new Response(
    `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>body{font-family:ui-sans-serif,system-ui,sans-serif;background:#faf9f5;color:#122540;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:26rem;text-align:center}h1{font-size:1.5rem}p{color:#5a6b82;line-height:1.6}</style></head><body><main><h1>${title}</h1><p>${body}</p><a href="/">Freelens</a></main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
