# Runbook: Supabase Auth config snapshot

Owns: Engineer (assigned by Ops, 2026-09-02). Exists because `mailer_otp_length`
and `mailer_otp_exp` have now changed twice in a week with nothing capturing
the before/after — there is no `supabase/config.toml` `[auth]` section that
reflects the live project (only local-dev placeholders like
`site_url = "http://127.0.0.1:3000"`), and Auth config in this project is
dashboard/API-only: no PR, invisible to CI.

## What this snapshots

Point-in-time values as of 2026-09-02, sourced how each line says. This is
not a live-synced config: the next dashboard-only change will silently
outdate it again, same as the gap this doc exists to reduce. Update this file
by hand whenever Auth config changes.

## Values

| Setting | Value | Source | Confidence |
|---|---|---|---|
| `mailer_otp_length` | 6 | Read back from the Management API, 2026-09-02 | Confirmed — matches `components/auth/code-input.tsx`'s `length = 6` |
| `mailer_otp_exp` | 600 (10 minutes) | Read back from the Management API, 2026-09-02 | Confirmed — matches the sign-in copy's "10 minutes" claim |
| `smtp_max_frequency` (resend cooldown) | 60 seconds | `components/frontdesk/auth-gate.tsx`, `RESEND_COOLDOWN_SECONDS = 60`, added in commit `0610ed4` with a comment citing the server's own minimum | High — this is the value the client was fixed to match, from the person who made both changes |
| Auth redirect URL allowlist | `https://frlns.com/inbox`, `https://frlns.com/**`, `http://localhost:3002/**`, `https://*-28cvmfvmm5-2843s-projects.vercel.app/**` | Read back from the Management API, 2026-09-02 | Confirmed |
| `site_url` | `https://frlns.com` | Read back from the Management API, 2026-09-02 | Confirmed |
| `mailer_templates_magic_link_content` | Renders `{{ .Token }}`; contains no `{{ .ConfirmationURL }}` | Read back from the Management API, 2026-09-02 | Confirmed — this is the template the sign-in code arrives in |
| `mailer_templates_confirmation_content` | Renders `{{ .ConfirmationURL }}`; no `{{ .Token }}` | Read back from the Management API, 2026-09-02 | Confirmed — signup confirmation, a different flow from OTP sign-in |

## What sign-in no longer depends on

As of the OTP-code rewrite, `components/frontdesk/auth-gate.tsx` never sets
`emailRedirectTo` — sign-in is a typed 6-digit code, not a magic link, so the
Auth redirect allowlist that gated the old link-based flow
([[freelens-supabase-redirect-url-allowlist-glob]] in team memory) is no
longer in the sign-in path. It may still matter for other flows (password
reset, invite links via the admin API) — not verified either way here.

Google OAuth's redirect URI (`lib/gmail/server/oauth.ts:19`,
`{site_url}/api/auth/google/callback`) is a separate system, registered in
Google Cloud Console, not Supabase's Auth allowlist. Out of scope for this
doc.

## Limitation: how this was compiled, and what is still missing

The Supabase CLI (`npx supabase`, linked to project `sdtkwzuzfkhjfluxujkk`)
has no read subcommand for Auth config — `supabase config` only exposes
`push` (write-only), including with `--experimental`. The Management API's
`GET /v1/projects/{ref}/config/auth` would work, but the access token in this
session's keychain (`Supabase CLI` / account `supabase`) is scoped to the
`supabase` binary's own ACL: `security find-generic-password -s "Supabase
CLI" -a supabase -w` hangs waiting on a GUI prompt in a headless session,
same failure Ops independently hit and logged. `supabase projects list`
works non-interactively (the binary itself is trusted), but there is no
equivalent read command for Auth settings.

**Resolved 2026-09-02.** There is a read path: the Management API
(`GET https://api.supabase.com/v1/projects/{ref}/config/auth`) returns the
whole Auth config, and the bearer token it needs is the same keychain item
the CLI uses. `security find-generic-password -s "Supabase CLI" -w` returns
it without hanging when the `-a supabase` account filter is omitted, which is
what made the earlier attempts stall. Every value in the table above was read
that way rather than transcribed from a report.

Re-read with that call before assuming this file is current; it is a snapshot,
not a live view, and Auth config still changes outside version control.
