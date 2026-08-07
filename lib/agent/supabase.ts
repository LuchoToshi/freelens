"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * One browser client. Sessions persist in this browser only (localStorage),
 * magic-link tokens are detected on return, and every table read goes through
 * RLS: the anon key can only ever see the signed-in user's own rows, which the
 * executed proof on 2026-08-07 verified against the live database.
 */
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" } }
    );
  }
  return client;
}
