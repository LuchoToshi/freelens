import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Connectivity diagnostic for Supabase, runnable only from inside a
 * deployment.
 *
 * It exists because Vercel's "sensitive" environment variables are write-only:
 * neither `vercel env pull` nor the REST API can read them back, so the only
 * honest way to prove a value is correct is to use it from the runtime that
 * holds it.
 *
 * Never returns a value, only shapes and outcomes: presence, length, host, and
 * what the database said. Gated on WAITLIST_SECRET so the environment
 * inventory is not public.
 */
export const dynamic = "force-dynamic";

function authorised(request: Request): boolean {
  // A dedicated key, not WAITLIST_SECRET: signing secrets should not double as
  // access credentials, and this one is kept where `vercel env pull` cannot
  // overwrite the local copy.
  const secret = process.env.HEALTH_KEY;
  if (!secret) return false;
  const offered = request.headers.get("x-health-key") ?? "";
  const a = createHash("sha256").update(offered).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return Response.json({ ok: false }, { status: 404 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: { present: url.length > 0, length: url.length, host: safeHost(url) },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: { present: anon.length > 0, length: anon.length },
    SUPABASE_SERVICE_ROLE_KEY: { present: service.length > 0, length: service.length },
    ANTHROPIC_API_KEY: { present: (process.env.ANTHROPIC_API_KEY ?? "").length > 0 },
    RESEND_API_KEY: { present: (process.env.RESEND_API_KEY ?? "").length > 0 },
  };

  if (!url || !anon || !service) {
    return Response.json({ ok: false, stage: "env", env });
  }

  const checks: Record<string, unknown> = {};

  checks.authHealth = await probe(`${url}/auth/v1/health`, { apikey: anon });
  checks.restRoot = await probe(`${url}/rest/v1/`, {
    apikey: service,
    Authorization: `Bearer ${service}`,
  });
  // Does the migration exist yet? 200 = table present, 404 = not migrated.
  checks.relationshipsTable = await probe(
    `${url}/rest/v1/relationships?select=id&limit=1`,
    { apikey: service, Authorization: `Bearer ${service}` }
  );
  // RLS proof: the anon key must NOT read rows. 200 with data would be a leak.
  checks.anonBlockedByRls = await probe(
    `${url}/rest/v1/relationships?select=id&limit=1`,
    { apikey: anon, Authorization: `Bearer ${anon}` }
  );

  return Response.json({ ok: true, env, checks });
}

async function probe(target: string, headers: Record<string, string>) {
  try {
    const response = await fetch(target, { headers, cache: "no-store" });
    const body = (await response.text()).slice(0, 300);
    return { status: response.status, body };
  } catch (error) {
    return { status: 0, error: error instanceof Error ? error.message : "failed" };
  }
}

function safeHost(value: string): string | null {
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}
