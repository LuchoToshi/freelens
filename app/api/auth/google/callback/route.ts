import { serviceClient } from "@/lib/frontdesk/server/clients";
import { exchangeCodeForTokens, OAuthExchangeError } from "@/lib/gmail/server/oauth";
import { encryptRefreshToken, verifyState } from "@/lib/gmail/server/tokens";

/**
 * Google redirects the browser here with no session cookie available, so
 * trust comes from `state` (signed in /connect, 10min TTL) rather than a
 * bearer token. Runs under the service-role client for that reason - see
 * migration 0006's RLS note.
 *
 * No retry/backoff here: a failed exchange sends the freelancer back to
 * /inbox to try connecting again, same as any other broken OAuth redirect.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://freelens-mvp.vercel.app";

  if (!code || !state) {
    return Response.redirect(`${appUrl}/inbox?gmail=error`, 302);
  }

  const freelancerId = verifyState(state);
  if (!freelancerId) {
    return Response.redirect(`${appUrl}/inbox?gmail=error`, 302);
  }

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (error) {
    console.error("auth/google/callback: exchange_failed", error instanceof OAuthExchangeError ? error.message : "unexpected");
    return Response.redirect(`${appUrl}/inbox?gmail=error`, 302);
  }

  if (!tokens.refresh_token) {
    // No refresh_token on a re-consent without prompt=consent, or if the
    // user already has a live grant. buildAuthUrl always sends
    // prompt=consent, so this means Google withheld it - treat as failure
    // rather than storing a connection with nothing to sync from.
    console.error("auth/google/callback: no_refresh_token");
    return Response.redirect(`${appUrl}/inbox?gmail=error`, 302);
  }

  const supabase = serviceClient();
  const { error } = await supabase.from("agent_gmail_connections").upsert(
    {
      freelancer_id: freelancerId,
      encrypted_refresh_token: encryptRefreshToken(tokens.refresh_token),
      granted_scopes: tokens.scope.split(" ").filter(Boolean),
      connected_at: new Date().toISOString(),
      revoked_at: null,
    },
    { onConflict: "freelancer_id" }
  );
  if (error) {
    console.error("auth/google/callback: store_failed");
    return Response.redirect(`${appUrl}/inbox?gmail=error`, 302);
  }

  return Response.redirect(`${appUrl}/inbox?gmail=connected`, 302);
}
