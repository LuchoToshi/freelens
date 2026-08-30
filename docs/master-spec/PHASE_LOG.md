# Master spec implementation log

Working document required by the master specification (§2, rule 10).
Spec: "Master Product Design & Agentic FrontDesk Implementation Specification",
30 Aug 2026. One entry per phase; decisions taken on safe defaults are recorded
here so they are auditable and reversible.

## Phase 0 — audit and baseline (30 Aug 2026)

**Test commands** (spec [VERIFY], resolved from `package.json`): `npm test`
(vitest run), `npx tsc --noEmit`, `npx eslint`, `npm run build`.
Baseline before Phase 1: 38 files, 500 tests, all green.

**Reconciliation — what the spec could not know:**

1. Branch `claude/frontdesk-inbox-audit-u9b50e` (three commits: reveal motion,
   TrustNote, 44px targets; two-pane inbox with focus management; next/image
   avatars) was unmerged when the spec was written from `main`. Phase 1 is
   stacked on top of it, because both touch `inbox-app.tsx` and the two-pane
   work overlaps spec §7. Merge order: audit branch, then this.
2. The spec's §7 two-pane requirement is therefore PARTIALLY DONE before
   Phase 2 starts. Phase 2 planning must diff against that branch, not main.
3. No other stale paths found: every [SOURCE] path named in §10/§11/§24
   exists at `main` as written.

**Decisions taken on the spec's own safe defaults (all reversible):**
- DEC-13 → (a): minimum-usefulness reuses the 40-word floor, plus greeting,
  sign-off, placeholder and substance rules (see `draftGuards.ts`).
- DEC-3 → (a): no "sent externally" state anywhere.
- D20 applied: all "ready to send" copy renamed "ready for review" (EN + NL).

## Phase 1 — P0 trust and data integrity (30 Aug 2026)

**Shipped in this branch** (`claude/master-spec-phase1-trust`):
- `draftGuards.ts`: full deterministic check set (§10.5) returning
  `{ ok, failures[] }`; the retry loop now corrects greetings, sign-offs,
  placeholders and date mismatches too. `deriveValidationStatus()` maps
  failures to the stored status; `recipient-missing` is the one soft failure
  (model cannot fix it) and yields `needs_review`.
- Migration `0010`: `drafts.validation_status` / `validation_failures` /
  `validated_at`; backfill to `needs_review` (never `ready_for_review`).
- `draftPipeline.ts`: every write path (submit, regenerate, nudge cron —
  all three already funnel through this one function) persists a server-side
  verdict; a 3-attempts failure now stores a `failed` row with an EMPTY body
  and named failures, so a never-valid draft is not viewable (§10.4/§10.7).
- Inbox renders the stored status: passed-checks line when ready (A2),
  needs-review reasons, and a failed panel naming the checks, with
  regenerate. All copy EN + NL (DEC-10 honoured).
- Tests: 511 passing (11 net new). The new matrix caught and fixed two real
  guard defects during development: a year/price digit collision (1950 is
  both a package price and a year shape) and prose containing "best" being
  stripped as a closing formula.

**Defects found (spec §2 rule 10):**
- D-1: date check flagged package prices as years — fixed, mirror of the
  price guard's year exclusion.
- D-2: closing-formula detection matched mid-sentence words on long lines —
  fixed by gating on line length.

**GATE — before this branch merges:**
1. Apply migration 0010 (additive; standing additive-only permission of
   21 Aug applies; same apply-before-merge discipline as 0008/0009). The
   inbox select references the new columns: MERGING BEFORE APPLYING BREAKS
   DRAFT LOADING.
2. Re-run `scripts/verify-frontdesk-rls.mjs --yes` after the migration
   (spec §24.5). Not run now: the script creates/deletes production test
   users and the schema is unchanged until 0010 lands.

## Phase 2 — shell, queue, workspace, accessibility baseline (30 Aug 2026)

**Decisions applied** (owner said "go on" against the register's stated
options): DEC-2 (a) `/inbox` stays canonical; DEC-4 (a) `freelancers.timezone`
added (migration 0011, nullable, Europe/Amsterdam fallback); DEC-6 safe
default (a) `?i=<id>` deep links, plus `?queue=<key>`.

**Shipped:**
- `lib/frontdesk/queue.ts`: the fixed seven-queue priority model as a pure
  function — `now` injected (D23), overdue derived at read time in the
  freelancer's timezone (D22/DEC-4), every placement carries a reason key
  and an action key. 10 unit tests including a timezone-midnight case.
- Migration 0011: `freelancers.timezone` + `inquiries.snoozed_until`.
  Additive, reversible. SAME GATE AS 0010: apply before merge.
- `AppShell`: five destinations, left rail ≥ lg, bottom bar below.
  `/clients` and `/follow-ups` exist as honest not-built-yet destinations
  with scope, the blocking decision named, and a real next action —
  registered in `chromeVariant` so no Freelens chrome leaks (spec §"what
  would break").
- Inbox: queue tabs with real counts (all seven, zero included); search /
  sort (urgency, newest, event date) / type filter / reset; rows lead with
  the plain-language next action, carry who/what/when/value, the due label
  in relative words PLUS the exact date, and the reason the item is there;
  per-queue and filtered empty states, each with a next action.
- Detail: Schedule group (snooze 3 days / unsnooze); booked/lost now
  two-step confirmed inline (§7.7: outcomes are never one accidental
  click); "Why this draft" disclosure naming language detection and the
  deterministic checks.
- §26.1 height chain: at lg the page is `h-dvh overflow-hidden` and each
  pane scrolls internally with `min-h-0`.

**Deviations, recorded:**
- Breakpoint is lg (1024px), not the spec's 860px — the audit branch's
  two-pane already breaks at lg and one boundary beats two.
- Value sort omitted from the sort menu for now (budget_band is a coarse
  4-value enum; the sorter exists in code).
- "Agent monitoring" holds only freshly-submitted inquiries while their
  draft generates; nothing else produces that state yet, and its empty
  state says so rather than inventing occupants.
- No DOM-level regression test for the height chain: the repo has no
  component-test environment. The queue model carries the behavioural
  tests; the height chain needs the manual pass below.

**GATE — before merge (cumulative with Phase 1):** apply 0010 AND 0011,
then re-run the RLS script. Manual visual pass on /inbox at 1440px and
375px (tabs, two-pane scrolling, snooze, confirm flow) — still nobody has
seen these pixels.

---

## Phase 2 gates — executed 2026-08-30

**Gate 1 — migrations 0010 + 0011 applied to production.**
Path: `supabase link --project-ref sdtkwzuzfkhjfluxujkk` then
`supabase db push` (CLI authenticates via its own login role; no DB
password on this machine). `--dry-run` first confirmed exactly the two
pending migrations. Evidence:
- `supabase migration list --linked`: 0001–0009 already remote; after
  push 0010 and 0011 both recorded remote.
- Schema dump (`supabase db dump --linked -s public`) shows
  `drafts.validation_status/validation_failures/validated_at` with the
  intended CHECK, `freelancers.timezone` with its length check,
  `inquiries.snoozed_until` — and the 8 RLS policies (own drafts / own
  freelancer row / own inquiries / own packages …) byte-identical intact,
  RLS still enabled on all core tables.
- Additive only: prod `main` references none of the new columns;
  frlns.com loads clean post-migration (checked in browser, zero console
  errors).

**Gate 2 — RLS suite re-run against production, post-migration.**
`node scripts/verify-frontdesk-rls.mjs --yes` with keys fetched
ephemerally from `supabase projects api-keys` (never written to disk).
Result: **12/12 PASS, 0 FAIL, exit 0** — run twice, identical. Covers:
A sees exactly own rows on all four tables, zero of B's, cross-tenant
update touches 0 rows, anon sees zero rows everywhere and cannot insert,
pre-existing `relationships` unchanged.

**Gate 3 — manual visual QA at 1440×900 and 375×812.**
Deviation, recorded: the authenticated pass ran against the SAME COMMIT
served locally (`next dev` + local `supabase start` with all 11
migrations and a disposable seeded freelancer — see
`scripts/qa-gate3-seed.mjs`), because creating a throwaway auth user in
the production DB for preview QA was blocked by the session's permission
policy. The deployed preview was verified unauthenticated (login screen
on /inbox, /clients, /follow-ups at both widths; no chrome leak; zero
console errors) at
`freelens-3da1xgzpq-28cvmfvmm5-2843s-projects.vercel.app`.

Verified working, with a seeded occupant per queue:
- Queue tabs with live counts summing to the inventory; default tab =
  first non-empty queue; deep links `?queue=waiting` / `?queue=monitoring`
  select the right tab.
- Pane scrolling at 1440: detail pane scrolls internally, list column
  and rail stay put (§26.1 chain works); no document-level horizontal
  scroll at any width tested.
- Follow-up due labels: "overdue by 3 days (2026-08-27)" — relative
  wording plus exact date, derived at read time; snoozed rows show
  "snoozed until 2026-09-02".
- Snooze / Remove snooze both write and re-place the row live.
- Outcome flow is two-step (group "Confirm: mark as booked?" with
  consequence sentence); Cancel restores; Yes moves the row to Recently
  completed and updates counts; GO LIVE checklist reacted ("first real
  reply" ticked).
- needs_review panel names the soft failure in plain language; failed
  drafts show "No usable draft yet" with every failed check named and a
  Regenerate button — never an empty editable draft. "Ready for review"
  wording throughout (D20).
- Monitoring: an item aged past the 10-minute grace window during QA and
  moved to Missing information on the next render — live proof placement
  is derived, never stored (D22/D23). Per-queue empty state shown.
- Filtered-empty state with "Reset search and filters"; keyboard focus
  lands on real controls with a visible ring, distinct from the active
  tab; contrast: body ~19:1, muted slate on white ≈5.5:1 (AA).
- Mobile 375: tabs wrap, toolbar stacks, list→detail stacks, bottom bar
  carries all five destinations, outcome buttons reachable above it.

**Defects:**
- P1 (fixed, f4d9fde): unbroken long tokens (pasted URLs) in a client
  message overflowed the message box at every width — `break-words`
  added to both message renderers (inbox detail + reveal step); verified
  wrapped afterwards.
- P2 (open): a completed inquiry's detail still offers Mark as
  booked/lost and Snooze — harmless but redundant after an outcome.
- P2 (open): "Follow-ups" label wraps to two lines in the 375px bottom
  bar.

All three gates green. Not merged — per instruction.

---

## Phase 3 — Onboarding, packages, voice, connection health (§14, §15, §6.5, §6.6)

**DECISION GATE, DEC-8:** safe default **(a) conservative** recorded. The
permission matrix itself is Phase 4 surface; nothing in Phase 3 needed a
permission level because no agent action is autonomous yet. Nothing
client-facing runs above "prepare a draft for review".

**Scope shipped, in dependency order (one commit per unit):**
1. `lib/frontdesk/readiness.ts` — §14 named-requirements model, derived
   at read time: three required items gate go-live, optional items never
   gate; no percentage exists anywhere. + tests.
2. `lib/frontdesk/packageGaps.ts` — §6.5 deterministic gap observations
   (no packages / unpriced package / ≥2 real inquiries of a type no
   package covers, EN+NL keyword match). Gaps inform, never block. + tests.
3. Migration **0012** (additive): `packages.addons jsonb`,
   `freelancers.voice_learning_paused`, `freelancers.voice_proposal_decisions`.
   Add-on prices join the price guard's allowed digit set and the prompt's
   package table (the §2.1 contract extends to add-ons, never weakens:
   test proves a configured add-on price passes and an invented one still
   fails). Wizard packages step edits add-ons; hint names the boundary.
4. `lib/frontdesk/voiceLearning.ts` — §6.6 proposals derived from the
   freelancer's own `edited` drafts: sign-off replacement, emoji
   added/stripped, substantial shortening. Never from a single edit;
   pause honored; decisions persist under stable keys so rejections never
   resurface. + tests (incl. partial-profile regression).
5. `lib/frontdesk/connectionHealth.ts` — §15 state vocabulary; derives
   connected/stale/revoked/disconnected from `agent_gmail_connections`;
   states with no producing signal are never invented. + tests.
6. `components/frontdesk/readiness-checklist.tsx` — ReadinessCard
   (required band with why-lines naming what each item unblocks, optional
   band, gaps), VoiceLearningCard (accept / reject / pause / resume),
   ConnectionHealthCard (§15.2: what happened, affected, NOT affected,
   next step, last sync — full EN+NL copy for all nine states). Replaces
   the old Go-live card; same disappearance rule plus gaps.
7. Test mode (§14.4): `/inbox?test=1` swaps loaders for a client-built
   fictional fixture (ids `test-`, names marked fictional, EN+NL); every
   write becomes a local-state mutation; real-account cards hide behind a
   labeled banner with an exit; the empty state offers the mode.
   Verified at the network layer: zero write requests during a full
   fictional outcome flow.

**Verification:** 547 tests green (added readiness 7, gaps 6, voice 8,
connection 4, guard add-on case); tsc clean; eslint clean (one
pre-existing warning in components/home/worked-example.tsx, untouched).
Live check on the same commit against the local stack: readiness card
renders required/optional/gaps; test mode enter/exit, fictional outcome,
counts. One crash found live and fixed with a regression test (partial
voice_profile jsonb). Migration 0012 applied to production (additive,
`db push`, dry-run first) and the RLS suite re-run: **12/12 PASS**.

**Deviations / flagged ambiguities (chosen safe, not guessed silently):**
- "VoiceProfileEditor" as a distinct page does not exist: the nine
  dimensions were already editable across wizard step 1 (sign_off) and
  the voice mirror (the other eight); Phase 3 adds the missing learning
  layer (proposals + pause) in the inbox where the evidence lives.
- Learning proposals are deterministic comparisons, not an LLM analysis
  pass — the spec mandates evidence counts and accept/reject/pause, not
  a mechanism; deterministic keeps §2.1 trust properties checkable.
- ConnectionHealth ships fully copy-complete while
  `GMAIL_CONNECT_ENABLED` stays false (CASA): connecting / partial /
  rate-limited / reconnecting / expired have no producing signal yet and
  are therefore unreachable, by design, not invented.
- Calendar (§6.8) is not in the Phase 3 scope line and no calendar code
  exists; the readiness optional band lists Gmail only while available.
- Go-live gating is expressed in the readiness surface and by the
  existing structural gates (wizard requires packages + voice before
  /inbox); the public page is NOT disabled for not-ready accounts, which
  would break live users.

**Not merged.** Cumulative gate for merge: none remaining beyond review —
0010–0012 are applied, RLS is green, visual pass done at both widths for
Phases 2 and 3 surfaces.

---

## Phase 4 — Provenance, approval, permissions, activity (§8, §9, §28)

**DECISION GATES:** DEC-1 **(a) cap at 3** for confirm-a-date, state-a-price
and close-a-lead (recommended = safe default; encoded as unraisable
ceilings in `lib/frontdesk/permissions.ts`). DEC-16 **(a) never** — the
safe default, and moot in code: nothing queues a send today; the mailto
model means Freelens never sends at all, and the approval contract says
exactly that before the buttons.

**Shipped, in dependency order (one commit per unit):**
1. `lib/frontdesk/permissions.ts` — five levels per action, ceilings per
   §8.4, DEC-8 conservative defaults. Enforcement is at CONSUMPTION:
   `effectiveLevel()` clamps whatever is stored, so a raw API write of
   level 5 never takes effect — that is the §30 security property.
   Security tests cover tampered values, garbage jsonb, and every
   ceiling. Verified live: with `prepare_reply` stored at 1, the
   regenerate API refuses with `not_permitted` (server-side, in the
   single draft funnel, so submit and cron are covered identically).
2. Migration **0013** (additive): `freelancers.permission_levels`,
   `drafts.dismiss_reason` (the 0005 vocabulary). Applied to production
   via `db push` (dry-run first); RLS suite re-run: **12/12 PASS**.
   Skipping a draft now requires one of the four §6.11 reasons — the UI
   cannot record a skip without one; verified persisted
   (`skipped | wrong_timing`).
3. `lib/frontdesk/provenance.ts` — the eight §9 kinds; inquiry fields
   carry `inquiry`, absences are `missing` ("Not stated", never blank or
   inferred), extractions are `interpretation` with whole-percent
   confidence, and an extraction contradicting a typed field is a
   `conflict` carrying both sides. + tests.
4. `lib/frontdesk/activity.ts` — §28 entries derived at read time from
   existing rows: the no-sensitive-content rule is structural (nothing is
   stored, nothing sensitive is ever put in), and no event gets an
   invented timestamp. + tests.
5. `components/frontdesk/agent-surfaces.tsx` — ProvenanceChip (label +
   monospace glyph + aria, never colour alone) and EvidenceList in the
   detail pane; the §8.5 ApprovalContract (what happens on send, what
   stays with the user, reversibility) above the never-pre-selected
   buttons; AgentProgress naming real stages in the pending and failed
   draft states; PermissionMatrixCard (all nine actions, selects
   physically end at the ceiling — verified in-browser: send max 4,
   date/price/close max 3); ActivityLogCard, filterable, entries
   deep-link into the inquiry. Full EN/NL; parity walker green (one
   loanword allowlisted: "Budget").

**Verification:** 563 tests green (permissions 6, provenance 6, activity
4, plus the dismiss-flow wiring); tsc and eslint clean. Live pass on the
local stack: evidence list with chips on a real inquiry, approval
contract rendered, dismiss flow end-to-end (reason required → stored →
activity entry "(not the right moment)"), matrix ceilings in the DOM,
permission enforcement refusing a level-1 regenerate.

**Deviations / flagged ambiguities:**
- `agent_project_evidence` is deny-all for clients (RLS with no user
  policy, by design — Track B is server-side). The EvidenceList
  therefore renders the readable kinds today (inquiry / missing /
  conflict-capable) and consumes evidence-shaped rows through the same
  renderer the moment a server surface supplies them; `connected` and
  `suggestion` have no producer while Gmail is CASA-gated.
- PermissionMatrix and ActivityLog live as collapsible cards in the
  inbox list column — the shell has no separate settings page beyond the
  setup wizard; recorded rather than inventing a new route.
- `status.changed` for booked/lost is not narrated: `inquiries` stores
  no timestamp for it, and the log never invents one. Candidate for a
  future additive column.
- The §30 "revocation cancels queued actions" test has no subject:
  nothing queues actions yet. Revocation today = lowering a level, which
  takes effect on the very next pipeline call (verified live).

**Not merged.** Migrations 0010–0013 applied; RLS green after each.

---

## Phase 5 — Follow-ups, learning, memory (§11, §12)

**DECISION GATES:** DEC-7 **(a) 3 occurrences within the last 5
comparable drafts** (recommended = safe default; encoded as the window in
`voiceLearning.ts`). DEC-11 recorded as **(a) email match + (c) manual
merge** per the register's resolution — its subject (the Clients area) is
not in the Phase 5 scope line and remains the honest not-built page;
nothing implemented against it.

**Shipped, in dependency order:**
1. `lib/frontdesk/followups.ts` — the eligibility verdict extracted from
   the cron, pure and tested: per-freelancer quiet window (migration
   0014: `followup_quiet_days` 1–14, `followups_paused`), the 2-nudge
   cap, the global pause, the per-inquiry snooze (a real gap: the old
   sweep ignored `snoozed_until` entirely), sample exclusion, and the
   structural idempotency guard (§11.7 test: once nudge_due, never a
   candidate). The cron now consults the freelancer join and the verdict.
2. DEC-7 in `voiceLearning.ts`: proposals need 3 of the last 5 edited
   drafts (window test proves old habits outside the window cannot
   vote); decisions upgraded to objects retaining the prior value
   (§12.6 reversibility) and the evidence count — Phase 3's bare-string
   shape still reads; `never:<dimension>` blocks a dimension for good.
3. `lib/frontdesk/memory.ts` + `MemoryListCard` — settings and learned
   preferences visually distinct (§12.3), learned items carry evidence
   counts and offer revert ("that was a one-off"), never-learn, pause /
   resume, and a two-step reset that reverts every accepted value to its
   retained prior and never touches typed settings. A hand-edited
   dimension counts as a setting again (tested).
4. `FollowupScheduleCard` in the detail pane for replied/nudge_due
   inquiries: cap usage, current state (§11.2 vocabulary where a
   producer exists), why-this-timing naming the freelancer's own
   cadence, and the standing brakes. `FollowupSettingsCard`: cadence
   select (1–14 days) and the global pause. Queue placement uses the
   same cadence, so due labels and the cron agree.

**Verification:** 578 tests green (followups 9, memory 4, voice-learning
rewritten for DEC-7); tsc and eslint clean. Live pass: schedule card
rendering cap/state/brakes on a real nudge_due inquiry; changing the
cadence to 7 updated the why-line immediately and persisted
(`followup_quiet_days: 7` read back); memory list rendered settings with
badges on a partial profile; all four collapsible cards coexist.
Migration 0014 applied to production (dry-run first); RLS suite:
**12/12 PASS**.

**Deviations / flagged ambiguities:**
- "Client replies" and "client declines" stop conditions need Gmail
  (CASA) and NLP ([PROPOSED]); per §11.4 the cap and manual approval
  remain the safety net. `sent`/`scheduled`/`approved` timeline states
  with no producer are not invented.
- Working hours and timezone-aware cron comparisons (§11.5): the sweep
  still compares in UTC; the freelancer-facing due labels are
  timezone-aware (Phase 2). Recorded, not silently fixed — a cron
  re-run per timezone is a larger change than this phase warrants.
- Learned-preference detection stays deterministic (sign-off, emoji,
  length); `agent_user_corrections` (0005) as the long-term home is
  deferred until a server-side learning pass exists.

**Not merged.** Migrations 0010–0014 applied; RLS green after each.
