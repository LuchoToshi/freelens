/**
 * Server-side Supabase clients for FrontDesk routes. Copied from the inline
 * patterns in the existing API routes (app/api/draft, app/api/cron/weekly)
 * rather than importing them — the shared originals stay untouched.
 *
 * Server modules only. The service key must never reach a client bundle;
 * nothing under components/ may import from this file.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function serviceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * An anon client bound to the caller's JWT: queries made with it run under
 * RLS exactly as they would in the browser. Verify the token with
 * `client.auth.getUser(jwt)` before trusting it.
 */
export function asUserClient(jwt: string): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    }
  );
}
