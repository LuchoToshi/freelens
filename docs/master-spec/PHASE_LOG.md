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
