"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * One browser client. Sessions are per-device (addendum §1.1): the freelancer
 * chooses between the 30-day idle default and end-with-browser; the choice
 * lives in localStorage and steers which store holds the auth token. A device
 * idle past the cap is signed out on the next visit, client-side, regardless
 * of the token's own lifetime. Every table read goes through RLS: the anon
 * key can only ever see the signed-in user's own rows.
 */
const POLICY_KEY = "fd-session-policy"; // "device" (default) | "browser"
const LAST_ACTIVE_KEY = "fd-last-active";
const IDLE_CAP_MS = 30 * 24 * 60 * 60 * 1000;

export function sessionPolicy(): "device" | "browser" {
  try {
    return localStorage.getItem(POLICY_KEY) === "browser" ? "browser" : "device";
  } catch {
    return "device";
  }
}

/** Applies from the next sign-in on this device; the UI says so. */
export function setSessionPolicy(policy: "device" | "browser") {
  try {
    localStorage.setItem(POLICY_KEY, policy);
  } catch {
    // Storage unavailable: the default policy applies.
  }
}

function activeStore(): Storage {
  return sessionPolicy() === "browser" ? sessionStorage : localStorage;
}

const dynamicStorage = {
  getItem: (key: string) => activeStore().getItem(key),
  setItem: (key: string, value: string) => {
    activeStore().setItem(key, value);
    try {
      localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    } catch {
      // Best effort; the idle cap simply doesn't advance.
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

function enforceIdleCap() {
  try {
    const last = Number(localStorage.getItem(LAST_ACTIVE_KEY) ?? 0);
    if (last && Date.now() - last > IDLE_CAP_MS) {
      for (const store of [localStorage, sessionStorage]) {
        for (let i = store.length - 1; i >= 0; i--) {
          const key = store.key(i);
          if (key && key.startsWith("sb-")) store.removeItem(key);
        }
      }
      localStorage.removeItem(LAST_ACTIVE_KEY);
    }
  } catch {
    // Storage unavailable: nothing persisted, nothing to cap.
  }
}

let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    enforceIdleCap();
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          flowType: "pkce",
          storage: dynamicStorage,
        },
      }
    );
  }
  return client;
}
