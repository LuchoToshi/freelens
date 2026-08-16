# Rebooking concierge: two weeks, zero code

The validation experiment from the blue-ocean document, made runnable. The
question it answers is the only one that matters and the only one no document
can: **when the note is already written, do freelancers press send?**

## The bars (write them down before you start: a gate you can renegotiate is not a gate)

Volume per participant is **not fixed at three.** It follows the agent's
judgment policy (`PLANS/FREELENS_JUDGMENT_POLICY.md`, sourced from
`lib/rebooking/ranking.ts`): 2–4 qualifying clients per person, and zero is a
valid, loggable outcome if nobody clears the floor. Testing a fixed-three
rule would validate a policy the agent will never run.

| Notes prepared for a participant | Minimum sent to pass the discomfort test |
|---|---|
| 1 | 1 |
| 2 | 2 |
| 3 | 2 |
| 4 | 3 |

| Measure | Bar |
|---|---|
| Participants who hit their minimum-sent row above | **4 / 5**, the discomfort test |
| Reply rate on sent notes | ≥ 30% |
| Meetings or bookings across the pool | ≥ 2 |
| Verbal yes to "would you pay €19/month for this weekly?" | ≥ 3 / 5 |

A participant with **zero** qualifying clients is excluded from the
discomfort-test denominator (nothing to send is not nerve failing), but is
still logged in full. If more than 1 of 5 lands at zero, that is a signal
about client-list composition or recruiting, not about the product, flag it
before it's read as a failed test.

**Stop condition:** fewer than 3 of 5 (of those with at least one qualifying
client) hit their minimum-sent row. Then the discomfort is stronger than the
product, no interface fixes it, and the direction dies for the price of two
weeks of writing.

## Recruiting source (updated 2026-08-16: the "interview pool" never existed)

This experiment originally assumed a pool of prior interview participants to recruit
from. It doesn't exist: 10 cold outreach messages went out in 2026-04 for the earlier
calculator product, zero became interviews. Recruiting for these five slots draws
instead from, in priority order:

1. **Warm network (slots 1–3):** 3–5 photographers/videographers Shrf knows personally,
   pending names from Shrf.
2. **Site waitlist (slots 4–6):** confirmed opted-in signups, warmest strangers
   available, pending export/count from Shrf or Ops. Currently empty: 0 real
   external signups as of 2026-08-18, all 8 stored rows are test data or
   Shrf's own. Recruiting in practice runs on warm network + cold only until
   that changes.
3. **Referrals (slots 7–8):** activated once slots 1–6 produce first yeses.
4. **Cold fallback (slots 9–10):** Dutch ZZP Facebook groups + direct LinkedIn outreach,
   screener applied (≥2 years freelancing, ≥10 nameable past clients, b2b/repeat-capable
   client base), 15-minute trust call before the intake ask. Message drafted and staged
   in `recruit-message.md`, screened shortlist ready, blocked only on a named human
   with FB/LinkedIn send access to actually post (org-wide constraint, not specific to
   this experiment).

Full sourcing detail and screener criteria: `~/.buzz/OUTBOX/freelens-p1-4-recruiting-package.md`.

## Day by day

| Day | What happens |
|---|---|
| 1–2 | Recruit five per the sourcing tiers above, photographer/videographer-weighted. Message in `recruit-message.md`. |
| 2–4 | Each sends you their intake (`intake.md`): ten past clients + two old sent emails for voice. |
| 4–7 | You write notes for whichever of their clients qualify: 2 to 4, occasionally 0 or 1. Use `hook-library.md` for the reason, `draft-templates.md` for the skeleton, their own emails for the voice. Deliver as a doc per person. |
| 7–14 | They send from their own mail, on their own account, and report every reply to you. You log everything in `tracking.csv`. |
| 14 | Score against the bars. Ask the €19 question **after** they have seen replies, never before. |

## Rules that protect the result

- **You never send anything.** The moment you send on their behalf, you are
  measuring your nerve instead of theirs, and the experiment measures nothing.
- **Every note carries a concrete reason** from the hook library. If no honest
  reason exists for a client, that client is skipped: "just checking in" is
  the control group, and it already runs everywhere, for free, forever.
- **No invented facts.** Every claim in a note traces to the intake sheet.
- **Don't coach past the discomfort.** If someone stalls on sending, note it,
  that stall is the data.
- Participants' client lists are used for this experiment and nothing else,
  and are deleted when it ends. Say so unprompted.

## What already-built assets do here

Nothing, on purpose. The tax engine, the quote record and the site keep
running untouched: the calculators keep earning search traffic and the quote
record keeps accruing whatever it accrues. If the concierge passes, one line
of the engine re-enters as garnish on a won rebooking ("na btw en reservering
is deze klus ongeveer €X voor jou"). If it fails, nothing was torn up waiting.
