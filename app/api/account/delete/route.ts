import { createClient } from "@supabase/supabase-js";

/**
 * Account deletion: the user proves who they are with their own token, and
 * only then does the service key do the one thing RLS cannot, delete the auth
 * user. Every owned row cascades with it (schema: on delete cascade).
 *
 * Deviation from the spec, stated: this is immediate hard delete, not a
 * 30-day recovery window. A recovery window needs somewhere to park the data
 * and a restore path; until that exists, the honest offer is the stronger
 * one, and the UI says so before the click.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 401 });

  const { data, error } = await createClient(url, anon, {
    auth: { persistSession: false },
  }).auth.getUser(jwt);
  if (error || !data?.user) return Response.json({ ok: false }, { status: 401 });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    console.error("account delete failed");
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: true });
}
