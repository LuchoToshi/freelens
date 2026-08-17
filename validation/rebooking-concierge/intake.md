# Intake: per participant

One sheet per participant. Ten rows is enough; fewer than six and ranking
loses meaning.

## Client list

| # | Naam | Bedrijf / type klant | Wat deed je voor ze | Wanneer (maand + jaar) | Bedrag (ongeveer) | Iets persoonlijks dat je nog weet |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |

The last column matters more than it looks: "ze verhuisden naar een nieuw
pand" or "campagne won een award" is tomorrow's honest opening line. Ask for
it explicitly; nobody volunteers it.

## Voice sample

Two emails they actually sent to a client, any subject, ideally one short
and businesslike, one warmer. What you are extracting:

- Greeting and sign-off ("Hoi"/"Beste"/"Hey", "Groet"/"Groetjes"/"Liefs")
- je/u: never guess this
- Sentence length, emoji or none, exclamation marks or none
- Whether they open with the client or with themselves

## Ranking the ten (you do this, before writing)

This follows the agent's actual eligibility rule (`lib/rebooking/ranking.ts`,
see `PLANS/FREELENS_JUDGMENT_POLICY.md`), not a rough band, the point of the
test is to evaluate the policy the agent will really run.

**First, drop anyone who fails the floor:**

- **Under 6 months since the last project.** Too recent, silence is the
  honest advice, not a note.
- **Over 24 months.** The relationship reads as cold, not cooling; the honest
  angle there is a fresh pitch, not a rebooking note.
- **No honest hook available**: check `hook-library.md`. No hook, no note,
  no exception.

**Then rank whoever is left:**

1. **Anniversary, 10–14 months since the last project**, strongest. The one
   moment a note is an event rather than an interruption.
2. **Season fit**: does this client's world have a briefing window right now
   (annual campaigns, seasonal content)? Outranks a bare gap, not an
   anniversary.
3. **Gap alone**: 6 to 24 months of silence with no better reason. Weakest,
   but still real.

Write notes for whoever clears the floor **and** has a hook, up to four.
Expect 2–4 most of the time; 0 or 1 is a valid outcome if this client list
happens to be recent or already cold, don't force a note where the policy
would refuse one.
