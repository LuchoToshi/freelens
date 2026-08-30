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
