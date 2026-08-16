# Runbook: Gmail outreach OAuth re-consent

Owns: Ops and Reliability. Applies to the internal recruiting-outreach tool
(`app/api/outreach/admin/route.ts`, `lib/server/outreach/gmail.ts`), not the
customer-facing product. See "Why not just fix this properly" below for why
the app stays in Testing mode.

## The constraint

The Freelens outreach Gmail OAuth app (`gmail.send` scope only) is in
Google's **Testing** publishing status, not Verified. Testing-mode refresh
tokens expire after a period of inactivity — observed in practice as ~6 days.
When the token expires, `GMAIL_REFRESH_TOKEN` in Vercel goes stale and every
send fails at `sendOutreachMessage()` in `lib/server/outreach/gmail.ts`.

The route does not fail silently: `POST /api/outreach/admin` catches the
Gmail client error and returns `502` with the underlying message instead of
marking the draft sent (see the `try/catch` around `sendOutreachMessage` in
`route.ts`). But nothing *watches* for that 502 — the first sign is an
approver clicking send on a real recruiting email and getting an error.

## The rule

**Re-consent immediately before every send batch. Not on a calendar
cadence.**

A calendar reminder (e.g. "renew every 5 days") still leaves a window where
the token can expire between the reminder and the actual send. Collapsing
consent-to-send to minutes removes that window entirely — there is no
meaningful gap left for the token to expire in.

Do this every time, immediately before opening the admin route to approve
drafts:

1. Open the OAuth Playground (or the app's own consent URL) for the
   dedicated outreach Gmail account, scope `https://www.googleapis.com/auth/gmail.send`.
2. Complete consent, exchange for a fresh refresh token.
3. Update `GMAIL_REFRESH_TOKEN` in Vercel for both `Preview` and
   `Production` (`vercel env rm GMAIL_REFRESH_TOKEN production && vercel env add GMAIL_REFRESH_TOKEN production`,
   same for `preview`).
4. Redeploy is not required — the route reads `process.env` at request time
   on the current deployment, but Vercel env var changes only apply to *new*
   deployments/functions cold starts on most plans. If a send still fails
   with an auth error after updating the var, trigger a redeploy
   (`vercel deploy --prod` or push an empty commit) before assuming the
   token itself is bad.
5. Only then start approving/sending drafts via `POST /api/outreach/admin`
   (`action: "approve"`).

If a send batch is expected to take longer than ~30 minutes end to end,
re-consent again partway through rather than assuming the token from step 1
still holds.

## Verifying it worked

`GET /api/outreach/admin` (with the `OUTREACH_ADMIN_SECRET` bearer token)
lists all drafts with their status. After a send, confirm the message moved
from `draft` to `sent` with a populated `gmail_thread_id` — a 502 leaves it
at `draft`, so a stuck `draft` after an approve action is the signal
something needs re-consenting.

## Why not just fix this properly (verify the app / widen scope handling)

Publishing the app as Verified would remove the expiry problem, but Google
requires OAuth verification review, and any Restricted scope (not the case
here — `gmail.send` is Sensitive, not Restricted) would additionally require
a CASA security assessment. For a single internal account sending a handful
of recruiting emails, that process is disproportionate. Testing mode plus
the re-consent-before-send discipline above is the accepted tradeoff for
this tool at this volume — see also `lib/server/outreach/gmail.ts` header
comment and the shared-secret admin-auth rationale in `route.ts`.

This does **not** transfer to the customer-facing Gmail Wizard-of-Oz probe
under consideration separately. That flow would need `gmail.readonly`
(Restricted, not Sensitive) granted by each external participant, not by us:

- Each participant would hit Google's "Google hasn't verified this app"
  interstitial before granting access to their own inbox — a much harder
  trust ask for a freelancer than an internal tool nobody outside Freelens
  ever sees.
- If kept in Testing mode to dodge verification, the 100-test-user cap and
  the same ~6-day refresh expiry would apply *per participant*, not once for
  us — every participant would need to personally redo OAuth consent
  mid-probe, which is unworkable for a study, not just inconvenient.
- Restricted scopes are also the trigger for Google's CASA Tier 2 audit
  requirement (4-8 weeks, external assessor), independent of the Testing
  vs. Verified question — already the stated reason `gmail.readonly` was
  ruled out for this integration.

So the gate is not the same gate: our own tooling clears it with an
operational workaround; the customer-facing probe does not, and needs either
a different mechanism (not OAuth-based inbox read) or the CASA process
before it can ship.
