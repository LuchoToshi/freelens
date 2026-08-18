/**
 * Google OAuth for Track B's Gmail connect. Plain REST against Google's
 * endpoints, no SDK: this codebase has no existing googleapis dependency and
 * the flow is two HTTP calls (authorize redirect, token exchange).
 *
 * Scope is `gmail.readonly` only, requested at connect. `gmail.send` is
 * requested separately, at the instant of a user-approved send (execution
 * package's locked guardrail, PLANS/FRONTDESK_TRACKB_EXECUTION_PACKAGE_V2.md)
 * - not part of this flow.
 */
const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://freelens-mvp.vercel.app";
}

export function redirectUri(): string {
  return `${siteUrl()}/api/auth/google/callback`;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: READONLY_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export class OAuthExchangeError extends Error {}

/** Throws OAuthExchangeError on any non-2xx response; never logs the body (it can carry token material). */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GMAIL_CLIENT_ID ?? "",
      client_secret: process.env.GMAIL_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) {
    throw new OAuthExchangeError(`token exchange failed: ${response.status}`);
  }
  return response.json();
}
