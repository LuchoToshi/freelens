# Implementation handoff: Freelens Agent Experience
**Date:** 2026-09-01 · **Repo:** `LuchoToshi/freelens` @ `main` · **Status:** design approved, implementation not started

**Visual source of truth:** the approved mockup board `Freelens Agent Mockups.dc.html` in the design project (option ids `1a`–`1n`, `2a`–`2b`), built on the bound Freelens Design System (`_ds/freelens-design-system-…`, tokens + `FreelensDesignSystem_12da41` components). The mockups are HTML design references, not production code: recreate them in the repo's existing Next.js + Tailwind + token environment using its established patterns.

**Fidelity:** high-fidelity for layout, hierarchy, spacing and copy. Colors and type come from the repo's own tokens in `app/globals.css` (`--fd-*`); do not introduce new hues beyond the Page Appearance accent set in §11.

**Tag legend used throughout:**
- **[REQ]** approved requirement (locked)
- **[REC]** recommended implementation (change if the repo argues otherwise)
- **[FACT]** verified current repository fact (as of `main`, 2026-09-01)
- **[ASSUME]** technical assumption to verify in Phase 0
- **[OPEN]** unresolved question — surface in the Phase 0 report
- **[FUTURE]** explicitly out of version-one scope

---

---

## 0. Amendments — owner decisions, 1 Sep 2026 (binding)

These supersede the tagged text below wherever they conflict.

### 0.1 Phase 1 requirements (firm, not recommendations)
1. **Automation levels 4 and 5 are removed from the UI entirely.** `isPermitted`
   is only ever called with level 3, so 4 and 5 changed nothing while implying
   autonomy that does not exist. **Done in Phase 1.**
2. **The word "auto-run" is removed everywhere**, including dictionary strings.
   **Done in Phase 1.**
3. **Only the two functional controls remain**: prepare a reply draft, prepare a
   follow-up draft. Send / confirm a date / quote a price render as fixed
   statements with no interactive handler. **Done in Phase 1.**

### 0.2 Corrections to [FACT] tags (verified against `main`, 1 Sep)
- **§9 is wrong.** `event_type` carries a live CHECK constraint
  (`inquiries_event_type_check`) restricting it to
  `wedding | party | business | portrait | other`. The seven new intake options
  **require a migration**; without one, five of them fail at the database.
- **§3.18 is wrong.** `test2`, `yoi`, `ciao` are not in `testFixture.ts` or
  `demoFixture.ts`. Owner confirms they are test data, to be replaced or
  removed before production; they are not fixture constants.
- **§1 and §8.3 overstate the wait.** Draft generation measured on production
  is **3.0–4.4 s**, not ~20 s. Live marketing copy now says "a few seconds".

### 0.3 Scope removals (executed)
The Dutch tax and quote calculators, their explainer pages, the tax engine and
the legacy rebooking app are **deleted**, not hidden. §4's "`/tool`,
calculators, marketing pages — Untouched" no longer applies. The eight retired
URLs redirect permanently to `/`.

### 0.4 Rejected from the spec
- **"Pause all agent work" (§10) is not built.** There is no safe global stop;
  pausing must target a specific task so unrelated work is not interrupted and
  no workflow is left inconsistent. Ship the individual switches only.
- **Subdomains stay display-only.** Real subdomains are reserved for actual
  accounts. Use `example.frlns.com` as the placeholder in documentation and UI.

## 1. Executive summary

Freelens is an AI front desk for creative freelancers: an inquiry arrives through the freelancer's public page, Freelens drafts a personal reply from their real prices and voice within ~20 seconds, and the freelancer reviews and sends it themselves. The approved direction turns the product's first screen from a form-led dashboard into an **agent-led desk**: the freelancer states outcomes or handles decisions the agent has prepared; the agent prefills, labels its sources, marks missing facts as missing, and never acts externally without approval.

Version-one outcome: a freelancer signs up, reaches a useful, honest draft desk in minutes (draft-first onboarding), works from a two-pane home where decisions come first, reviews and sends replies with full provenance, and controls the agent from a Control Room that shows only what genuinely works today. User problems solved: slow replies lose jobs; forms re-ask what the product already knows; AI products overclaim. Freelens wins by being fast **and** verifiably honest.

Three rules govern everything: the agent proposes and the freelancer decides; every number and inference carries its source; a missing fact is shown as missing, never filled in.

---

## 2. Approved scope

Desktop experience and key states for:

| Surface | Primary mockup | Supporting mockups |
|---|---|---|
| Front Desk home (first authenticated screen) | `1b` two-pane desk | `1a` capability summary + Recently done, `1c` (styling cues only) |
| Agent-led onboarding | `1e` decision queue + live preview | `1f` provenance-labeled field patterns, `1g` (conversation variant, [FUTURE]) |
| Inquiry review → plan → approval → send | `1h` plan rail + draft with sources | `1i` approval-card anatomy |
| Client-facing intake | `1l` option set + conditional field (desktop equivalent) | `1k` conversation thread (reuse existing `IntakeThread` where shipped) |
| Control Room | `1m` (post-revision: no sessions, no level matrix) | `1n` pause/takeover/activity patterns |
| Page Appearance (limited) | `2a` | `2b` dark client view |

Include for every surface: empty, loading, missing-information, error, and returning-user states (§5).

**Excluded this round:** mobile variants (`1d`, `1j`, `1l` phone frames are reference only) — but existing responsive behavior must not break: `AppShell` renders a bottom bar below `lg` and the inbox is already two-pane at `lg` [FACT `components/frontdesk/app-shell.tsx`]. Do not remove or regress those breakpoints.

---

## 3. Locked product decisions [REQ]

1. Agent-first, not a conventional multi-step form.
2. Prefill what Freelens genuinely knows; label every value's source; clearly mark missing information; ask only for required decisions.
3. Voice confirmation must not block onboarding: sensible default voice, confirm or edit later.
4. No context → a clearly labeled example desk, never an empty confusing interface.
5. The user stays in control: Freelens may prepare, suggest, watch, summarize; approval-gated actions never happen silently.
6. Prices come only from user-provided package data.
7. Never claim a calendar date is available without verified calendar data (none exists today → drafts claim nothing; see §14).
8. User-provided text, including the sign-off, is preserved exactly — byte for byte.
9. Security & Sessions is removed from onboarding and all agent-related flows.
10. No new Account or Security area this phase ([FUTURE]).
11. No future functionality, disabled placeholders, fake controls, or non-operational permission levels. Not clickable and functional → not visible.
12. Remove "Auto-run this routine" and any implication that unsupported actions run automatically.
13. Control Room shows only capabilities available today.
14. "Send replies" stays a user action. "Hold calendar dates" stays user-only.
15. Follow-ups are prepared as drafts only ([FACT] the nudge engine exists and only drafts, cap 2, never sends — `lib/frontdesk/followups.ts`).
16. Every external action states what will happen, what stays with the user, and whether it is reversible.
17. Lean v1; reach a useful draft quickly.
18. Preserve the current test data (`test2`, `/test`, package `yoi` €58, sign-off `ciao`, Lisa example) only as fixture/demo data (`lib/frontdesk/testFixture.ts`, `demoFixture.ts` [FACT]) — never hard-coded as production values.

---

## 4. Information architecture and route mapping

[FACT] Authenticated shell nav (`app-shell.tsx`): home `/home`, inbox `/inbox`, clients `/clients`, follow-ups `/follow-ups`, tools `/tool`, settings `/setup`. Left rail ≥ `lg`, bottom bar below.

| Route / module | Today [FACT] | Verdict |
|---|---|---|
| `/home` → `components/frontdesk/agent-home.tsx` | Agent home exists: summary line, request bar, Needs you, In motion (work objects), Recently done, scope strip | **Refactor** to the `1b` two-pane layout; keep all existing data wiring (`placeInquiry`, `agent_work_objects`) |
| `/inbox` → `components/frontdesk/inbox-app.tsx` (55 KB) | Full queue + draft review + edit + mailto send + outcome recording | **Reuse + refactor**: extract the decision/draft panel into shared components (§13) consumed by both `/home` right pane and `/inbox`; `/inbox` remains the full editor |
| `/setup` → `setup-wizard.tsx`, `prefill-step.tsx`, `voice-step.tsx`, `reveal-step.tsx`, `share-step.tsx`, `profession-picker.tsx` | 4-step wizard; agent prefill step (step 05) already exists and proposes provenance-labeled values | **Replace the wizard shell** with the `1e` decision queue + live page preview; **reuse** `PrefillStep` extraction logic (`lib/frontdesk/server/prefill.ts`), profession picker options, photo upload, `VoiceStep`/`RevealStep` logic behind the "How your replies sound" decision |
| Security card on `/setup` → `components/auth/security-card.tsx` | Rendered on the setup page (verified in `docs/master-spec/PHASE_LOG.md`) | **Remove from render** everywhere in onboarding/agent surfaces. Do not delete the component; do not build a replacement area ([FUTURE]; [OPEN] where sessions surface later) |
| `/[handle]` public page → `app/(frontdesk)/[handle]/page.tsx`, `public-intake.tsx`, `inquiry-form.tsx`, `intake-thread.tsx` | Public page + inquiry form (+ hybrid thread component) | **Refactor** intake options (§9); **create** appearance rendering (§11) |
| Control Room | Does not exist as a page. Scope strip lives on `/home`; permission model is code-only (`lib/frontdesk/permissions.ts`) | **Create new** route [REC] `/control`, linked from the `/home` capability strip and from `/setup`. Not added to the shell nav in v1 (bottom bar is full; avoid nav churn) |
| Page Appearance | Does not exist | **Create new**: [REC] a section reachable from `/setup` ("Your page · Appearance") — no new nav destination |
| `/clients`, `/follow-ups` | Honest not-built-yet pages | **Reuse** as-is (out of scope) |
| `/tool`, calculators, marketing pages | Separate surface | **Untouched** |
| Legacy `components/frontdesk/agent-surfaces.tsx`, `memory-followups.tsx`, `automation-rules.tsx`, `readiness-checklist.tsx` | Existing agent-adjacent UI | **Audit in Phase 0**: reuse content where it matches §10/§13; hide any control that violates decision 11 |

Do not rename or restructure beyond this table.

---

## 5. Screen-by-screen specification

Shared conventions: warm paper page (`--fd-paper`), white cards with 1 px `--fd-line` hairlines, `rounded-2xl` product corners, Fraunces headings 22–30 px, Geist body, uppercase tracked micro-labels, ≥ 44 px touch targets, agent moments in `--agent-accent` violet only. All copy through `lib/frontdesk/i18n.ts` with EN/NL parity ([FACT] parity is test-enforced).

### 5.1 Front Desk home — `/home` (mockup `1b`, plus `1a` elements)

- **Purpose:** decisions first. See what needs you, act on the selected item without leaving the page, state new outcomes.
- **Entry:** default authenticated landing (existing behavior).
- **Data:** inquiries + latest reply drafts (`placeInquiry` per item), `agent_work_objects` (≤ 20), profile (name, locale). All existing [FACT].
- **Hierarchy:** top bar (wordmark, nav, avatar) → greeting `Morning, {firstName}.` + literal-number summary → request bar with ≤ 3 contextual suggestions → two panes.
- **Left pane (400 px):** "NEEDS YOU · {n}" list ordered by `QUEUE_ORDER` (`decision` → `review` → `missing`) [FACT `lib/frontdesk/queue.ts`]; each row: title, relative time, queue reason line; selected row: `--fd-paper-dim` fill + 3 px ink left border. Below: "IN MOTION · {n}" compact work-object cards with status chip and one-line status note.
- **Right pane:** the selected item's decision detail — action headline, why (plain language from `reasonKey`/`actionKey` vocabulary), sources list (package price → "Yours", client message → "From the inquiry", voice → "Your voice profile"), consequence line, then **the draft exactly as it will send** (subject + body, verbatim), then actions: primary **Review and send** (opens the full editor at `/inbox?i={id}`) or inline **Approve** where the item is a plan approval; secondary Edit; tertiary Skip with a reason.
- **Approval boundaries:** approving a work-object plan runs only `prepare_reply`/`prepare_followup` steps ([FACT] the executor re-checks `isPermitted` server-side and the action vocabulary is closed — `lib/frontdesk/server/agentRequest.ts`). Nothing on this screen sends email.
- **Request bar behavior [FACT `/api/frontdesk/agent/request`]:** submit → thinking state → one of four results rendered inline: direct answer (literal numbers), plan for approval, one focused clarifying question, or an honest "can't do that yet, here's the nearest thing." Suggestions are derived from real queue counts (existing `suggestions` logic in `agent-home.tsx`).
- **Capability summary (from `1a`):** one compact strip at the bottom: "Reads: your inquiry page. May prepare: reply and follow-up drafts. Never: sends, quotes new prices, confirms dates." Link: "Open the Control room". Keep to three lines.
- **States:** loading (existing `dict.auth.loading` pattern); empty queue → "Nothing needs you." + watching summary, request bar stays; no inquiries ever → readiness content (existing `readiness-checklist.tsx`, minus any non-functional rows); request error → existing `requestError` copy; returning user → selection resets to top item.
- **Never show:** send buttons that email directly from this pane; undo controls (§8); autonomy levels; anything about sessions.
- **Repo files:** `agent-home.tsx` (refactor), `queue.ts`, `inbox-app.tsx` (panel extraction), `agentRequest.ts`, i18n `home.*`.

### 5.2 Agent-led onboarding — `/setup` (mockup `1e`; field patterns from `1f`)

- **Purpose:** from sign-up to a working desk through a handful of labeled decisions, not four form steps.
- **Entry:** first authenticated visit without a freelancer row; returning users land on the same queue with confirmed values collapsed.
- **Flow:** welcome (existing copy) → "Tell Freelens what you do": free text + optional URL / pasted text ([FACT] `prefill.ts` fetches public http(s) pages with SSRF guard, extracts only literal values, never invents prices) → decision queue beside a live page preview.
- **Decision cards (in order):**
  1. **Who you are** — display name, profession(s), optional city. Prefilled values carry chips: `Yours` (typed), `Suggested` (extracted, with confidence), `Missing` (dashed chip, e.g. "City — not set. Left off your page until you add it").
  2. **Your prices** — required; "Drafts can only quote prices you set. This is the one thing Freelens never guesses." Extracted package prices are proposals until confirmed; only confirmed packages enter the guard allow-set [FACT].
  3. **How your replies sound** — default voice preselected; sample reply generated from real data (existing `RevealStep` regeneration logic); actions: "Use this voice for now" / "Teach it your voice" (opens `VoiceStep`) / "Try a warmer take". **Never blocks completion** [REQ].
  4. **Your link** — see link rules below.
- **Live preview (right, sticky):** the public page rendered from current values, `state=draft`, watermark-free; missing fields visibly missing. Clicking a value focuses its card [REC]. "Private until you publish."
- **No-context path [REQ]:** "Nothing to share yet? Start from an example desk" → fixture-labeled example (`ExampleBadge` vocabulary; `testFixture.ts`), every example value marked as example and replaced on edit.
- **Manual path:** "Prefer plain forms? Set up by hand" keeps the existing field forms one click away (reuse current wizard form sections as plain editors).
- **Public link name [REQ]:**
  - Display the full format: value + muted suffix, e.g. `test` + `.frlns.com`.
  - Hint: "For example balaola.frlns.com. Lowercase letters, digits and dashes."
  - Validation: existing `isValidHandle` [FACT `lib/frontdesk/handles.ts`].
  - Availability shown **only after a genuine check** ([FACT] uniqueness is enforced on upsert, error code `23505`; [REC] add a debounced availability endpoint or check on blur — until checked, show nothing, not "available").
  - [OPEN] `frlns.com` subdomain serving: current routes are path-based (`/[handle]`). Confirm the production domain plan; if subdomains are not ready, render the format as display copy while links resolve path-based, and say so honestly in the share step.
- **Completion:** "Done deciding" → saved privately → activation: Open desk (drafts prepare) and Publish page are **separate consents**; share = copy button (existing `share-step.tsx` clipboard logic [FACT]).
- **States:** building (progress steps: "Read what you typed / Read {url} / Drafting your page"; cancel returns to input); extraction failed → "Couldn't read that page. Paste text instead, or set up by hand." (never fake values); handle taken → existing `handleTaken` copy; photo upload errors → existing type/size/generic messages [FACT `setup-wizard.tsx`]; returning → confirmed cards collapsed to summary rows.
- **Never show:** Security & Sessions [REQ]; step counters implying a fixed form march; any invented price or availability claim.
- **Repo files:** `setup-wizard.tsx` (replace shell), `prefill-step.tsx` + `server/prefill.ts` (reuse), `voice-step.tsx`, `reveal-step.tsx`, `share-step.tsx`, `profession-picker.tsx`, `security-card.tsx` (remove from render), i18n `setup.*`.

### 5.3 Inquiry review and approval — `/inbox` detail (mockup `1h`; card anatomy `1i`)

Specified fully in §8. Never show: undo (unsupported), autonomy levels, "AI is typing" theatrics.

### 5.4 Client intake — `/[handle]` (mockups `1k`, `1l`)

Specified fully in §9.

### 5.5 Control Room — new `/control` (mockup `1m` post-revision; `1n` patterns)

Specified fully in §10.

### 5.6 Page Appearance (mockup `2a`, `2b`)

Specified fully in §11.

---

## 6. Front Desk requirements (direction `1b`)

- Queue and status groups left; selected decision + evidence right. Order is priority; no scores [FACT `QUEUE_ORDER`].
- Draft shown exactly as it will send: same string the mailto/copy will carry, rendered read-only in the right pane. Editing happens in the full editor.
- Sources always visible for price, client message, and voice; each is a labeled chip row, never color-only.
- Why-this-action is one plain sentence from the queue vocabulary, not model prose.
- Explicit approval before anything leaves: the only sending mechanism is the freelancer's own mail client via mailto/copy (§8).
- **Undo:** unsupported today → no undo UI [REQ visibility rule]. The consequence line reads "Opens your email app. Nothing sends from Freelens itself."
- No decorative actions: every button either navigates, mutates state through an existing API, or does not exist.
- Capability strip from `1a` included once, compact, at the page bottom.

---

## 7. Agent-led onboarding requirements

Covered in §5.2. Additional rules:

- Value labels use exactly four provenance words in v1: **Yours**, **Suggested**, **Learned**, **Missing** [REQ]. (Learned appears only post-onboarding, from `voiceLearning` decisions [FACT].)
- Ask only for unresolved decisions; anything the account, extraction, or defaults already answer is shown, labeled, and editable — not asked.
- Never invent prices or required business information; extraction confidence < 1 renders as `Suggested`, null renders as `Missing`.
- Private until publication; publishing and opening the desk are separate consents.
- Success metric for the phase gate: a new user with a URL reaches a reviewable sample draft in under 3 minutes of active input [REC].

---

## 8. Inquiry and approval flow

Journey (all steps map to existing code unless marked):

1. **Inquiry received** — public form/thread posts to `/api/frontdesk/inquiries` (honeypot `website` field preserved [FACT]).
2. **Facts extracted** — name, email, date, type, budget band, message stored on `inquiries` [FACT schema `0003`].
3. **Draft prepared** — `server/draftPipeline.ts` generates within the ~20 s promise; no voice profile → no draft, queue shows `missing` with "complete setup" action [FACT `queue.ts`].
4. **Checks run** — `lib/frontdesk/draftGuards.ts` [FACT]: price digits must match the confirmed package set; no availability claims; no em dash. Results: `validation_status` ok / `needs_review` (→ decision queue) / `failed` (→ missing queue) with `validation_failures` codes.
5. **Missing information identified** — queue placement + plain reason (e.g. wedding with no matching package → recommend "Add a wedding package, or reply without a number" per mockup `1b`).
6. **Package matched without inventing** — the draft may only reference confirmed package prices; gaps are named, never priced [FACT guard + prompt rules].
7. **Date handled honestly** — no calendar integration exists [FACT] → plan line reads "Checked the date: no calendar connected, so the draft claims nothing"; the guard blocks availability claims regardless.
8. **Review** — plan rail (what was read, matched, checked, drafted — each step inspectable) + draft with per-section source notes; the price sentence's note: "€{price} is your {package} price. Drafts never invent numbers."
9. **Edit or approve** — full text editing in the editor; edits are the freelancer's text and are never rewritten [REQ]. Voice learning may *propose* preferences from edits, accepted explicitly [FACT `voiceLearning.ts`].
10. **Send after approval only** — [FACT] send = `mailto:` link with the edited body + clipboard copy (`inbox-app.tsx`); outcome recorded as `sent_as_is` / `edited` / `skipped`.
11. **Logged** — activity derives from drafts, outcomes, and work objects ([ASSUME] `lib/frontdesk/activity.ts` derives entries; no dedicated table — verify in Phase 0).
12. **Undo** — not supported (the email leaves via the user's own mail client). Show no undo control [REQ]. The mockups' "Undo for 60 seconds" is superseded by this document.

**Sign-off integrity [REQ]:** the sign-off is inserted exactly as stored (`sign_off` column), no casing, punctuation, or whitespace changes; covered by an acceptance test. Validation language uses **"Passed every check"** / "passed every check", rendered in the guard panel visually separate from the email body (the earlier "Best 3 guards" confusion came from adjacent guard copy, not altered user text). Never place validation copy inside or directly abutting the draft text block.

**Follow-ups:** prepared as drafts only, quiet days 1–14 (default 3), cap 2 ever, global pause + per-inquiry snooze, sample data never nudged [FACT `followups.ts`]. Scheduling UI states the honest consequence: "A draft appears for review on {date}. It waits for you, nothing sends itself."

---

## 9. Client intake

Current [FACT `inquiry-form.tsx`]: types `wedding | party | business | portrait | other`; budgets `<1000 | 1000-2500 | 2500+ | unsure`; date optional; required name + email; honeypot; states idle/sending/done/error.

**Changes [REQ]:**

- "What is it for?" options: **Wedding, Event, Brand film, Music video, Real estate, Social content, Something else.**
  - [REC] values: `wedding, event, brand_film, music_video, real_estate, social_content, other`. `event_type` is a text column [FACT], so no migration is strictly required; update API validation in `/api/frontdesk/inquiries/route.ts`, i18n labels (EN + NL), and any display mapping in the inbox. [OPEN] whether to migrate legacy values (`party`→`event`, `business`/`portrait`→ keep for old rows, display labels retained).
- **Something else** selected → reveal a **required** free-text field labeled **"Tell us what kind of project"**. "Something else" without text fails validation with a focused inline error. [REC] store as `event_type_other` text column (one-line migration) or prefix into `message`; prefer the column for clean drafting context — decide in Phase 0.
- Keep: optional date (native date input) with helper "A date lets {name} answer on availability straight away"; optional budget bands (existing four values; labels per i18n); details textarea; privacy copy: "Only {name} sees this. Your email address is never sent to the AI. No account needed." ([FACT] client email is excluded from prompts — keep that guarantee).
- Validation: required name, valid email, type required, other-text required conditionally; submit disabled while sending; error state preserves input.
- Keyboard: chips are buttons with `aria-pressed`, tabbable in DOM order; revealing the conditional field moves focus to it; Enter submits from text inputs only.
- Submission states: sending (label swap), done (existing confirmation card with {name}), error (retryable).
- Where the hybrid `IntakeThread` is live [FACT component exists], apply the same option vocabulary and the same conditional free-text rule to its chips; each desk question keeps its one-line "why" and the thread stays unbranded (ChromeGate).

---

## 10. Control Room — new `/control`

Exclusively agent concerns [REQ]:

- **What Freelens may do today** (list, mockup `1m` revised):
  - Draft replies to new inquiries — toggle. [REC] backed by stored level for `prepare_reply` (on = default 3, off = 1) via existing `effectiveLevel` model [FACT `permissions.ts`]; the UI never shows numbers.
  - Prepare follow-up drafts — toggle → existing global `followupsPaused` switch + quiet-days cadence (1–14) [FACT].
  - Send replies — fixed text: "Always you. Freelens never sends."
  - Hold calendar dates — fixed: "Never. Only you can commit a date."
  - Quote prices — fixed: "Only your set prices. Never invented."
  - Footer: "Only what works today is shown. New permissions appear here when they actually ship, off by default."
- **What it reads / may prepare / never does** — the scope strip (reuse `home` scope copy).
- **What it remembers and why** — from `deriveMemoryItems` [FACT `memory.ts`]: settings vs learned (with evidence counts), per-item revert ("Forget"), reset-all for learned items; resets never touch typed settings [FACT].
- **Pause and takeover:**
  - Pause all agent work — [REC] compose: pause follow-ups + pause active work objects (execute API supports pause/resume/cancel [FACT `/api/frontdesk/agent/execute`]). If a single composite switch is not cleanly implementable, ship the two real switches separately — never a fake master switch.
  - Take over a conversation — v1 mapping [REC]: per-inquiry snooze (stops nudges) + skip-draft-and-write-your-own (existing outcome flow). No new "manual mode" flag exists [FACT]; do not invent one this phase. Hand back = unsnooze.
  - Work-object cards: pause / resume / cancel / edit instructions — existing statuses `understanding … failed` [FACT].
- **Activity and recovery** — chronological list derived from drafts, outcomes, work objects ([ASSUME] §8.11); entries typed read/draft/approve/send/learn/fail; no undo actions offered.
- **Do not include:** Security & Sessions, device management, account management, automation level pickers, future permission rows [REQ].

---

## 11. Page Appearance — deliberately limited (mockups `2a`, `2b`)

- Options, complete list: optional **cover image or background tone** (tones: `#FAF8F4` default, `#F2EEE6`, `#EFE6DA`, `#E8EDE6`); **one accent color** (`#E4572E` default, `#1A1A1A`, `#3F7A4A`, `#C07F16`); **theme** light/dark; **live preview** of the public page.
- Accent applies to the inquiry CTA and small highlights only; never body text or backgrounds behind text. Dark theme keeps the same contrast rules (paper text on ink, hairlines at ~20% paper).
- Freelens retains layout, typography, spacing, accessibility, contrast, responsive behavior, component structure. No font selection, no freeform layout, no per-section styling, no theme editor [REQ].
- **Data (create):** [REC] `appearance jsonb` on `freelancers` (`{cover_url?, tone?, accent?, theme?}`) + one migration; server-side whitelist of the exact palette values (reject anything else). Cover upload reuses the avatar storage pattern (2 MB, jpeg/png/webp) [FACT pattern in `setup-wizard.tsx`; new bucket or prefix].
- **Render:** `/[handle]` reads appearance; missing → current defaults (no visual change for existing pages). Preview = the same public-page component with in-memory values.
- Entry point: `/setup` → "Your page · Appearance". Secondary feature; must not block or precede any onboarding decision.

---

## 12. Content and microcopy

All strings land in `lib/frontdesk/i18n.ts` (EN shown; NL translations required — parity is test-enforced [FACT]). `{braces}` are variables. Source key: M = approved mockup, R = existing repo copy kept, N = new this document.

| Screen | State | Element | English copy | Src |
|---|---|---|---|---|
| Home | default | Greeting | `Morning, {firstName}.` | M `1a` |
| Home | default | Summary | `Freelens found {n} things that need you. {m} threads are being watched on their own.` (singular variants required) | M |
| Home | empty queue | Summary | `Nothing needs you. Freelens is watching {m} threads.` | N |
| Home | default | Request placeholder | `Tell Freelens what you need done…` | M `1b` |
| Home | thinking | Status | `Reading your desk…` | N |
| Home | error | Request error | existing `home.requestError` | R |
| Home | default | Queue header | `NEEDS YOU · {n}` + `decisions first, then reviews` | M |
| Home | default | Capability strip | `Reads: your inquiry page. May prepare: reply and follow-up drafts. Never: sends, quotes new prices, confirms dates.` | M/N |
| Home | default | Strip link | `Open the Control room` | N |
| Decision panel | review | Consequence | `Opens your email app. Nothing sends from Freelens itself.` | N (replaces mockup undo line) |
| Decision panel | any | Source chips | `Yours` / `Suggested` / `Learned` / `Missing` / `From the inquiry` | M |
| Draft checks | passed | Header | `Passed every check` | M rev. |
| Draft checks | passed | Notes | `No invented prices, only €{price} appears` · `No claim that {date} is free` · `No em dash` | M |
| Draft checks | failed | Header | `Rejected by the checks, not shown to anyone` | R (DS) |
| Plan rail | date step | Detail | `No calendar connected, so the draft claims nothing` | M |
| Onboarding | intro | Heading | `Tell Freelens what you do` | M `1g` |
| Onboarding | queue | Heading | `Four decisions, then you're done` | M `1e` |
| Onboarding | prices | Required-why | `Drafts can only quote prices you set. This is the one thing Freelens never guesses.` | M |
| Onboarding | voice | Approve | `Use this voice for now` · secondary `Teach it your voice` | M |
| Onboarding | link | Hint | `For example balaola.frlns.com. Lowercase letters, digits and dashes.` | M rev. |
| Onboarding | link, checked | Availability | `Available` / `Taken — try another` (only after a real check) | N |
| Onboarding | missing city | Chip + value | `Not set` / `Left off your page until you add it` | M `1f` |
| Onboarding | fallback | Example desk link | `Nothing to share yet? Start from an example desk` | M/DS |
| Onboarding | manual | Link | `Prefer plain forms? Set up by hand` | M |
| Onboarding | extraction failed | Error | `Couldn't read that page. Paste text instead, or set up by hand.` | N |
| Intake | default | Type question | `What is it for?` + options `Wedding / Event / Brand film / Music video / Real estate / Social content / Something else` | M rev. |
| Intake | other selected | Field label | `Tell us what kind of project` | M rev. |
| Intake | other empty | Validation | `Tell us a word or two about the project to continue.` | N |
| Intake | default | Date helper | `A date lets {name} answer on availability straight away.` | M |
| Intake | default | Privacy | `Only {name} sees this. Your email address is never sent to the AI. No account needed.` | M/R |
| Control | header | Lead | `What Freelens may do and what it remembers. Change anything, it applies from the next action.` | M rev. |
| Control | list | Fixed rows | `Send replies — Always you. Freelens never sends.` · `Hold calendar dates — Never. Only you can commit a date.` · `Quote prices — Only your set prices. Never invented.` | M rev. |
| Control | footer | Honesty note | `Only what works today is shown. New permissions appear here when they actually ship, off by default.` | M rev. |
| Control | memory | Learned value | `Kept from {n} of your edits` | M/DS |
| Appearance | panel | Lead | `Three choices. Layout, type, contrast and mobile behavior stay with Freelens, so your page always reads professional.` | M `2a` |
| Appearance | panel | Scope note | `That's all of v1, on purpose. No fonts, no layout options, no per-section styling.` | M |
| Follow-ups | schedule | Consequence | `A draft appears for review on {date}. It waits for you, nothing sends itself.` | M rev. |

Terminology, fixed: **Desk** (home), **Needs you**, **In motion**, **Recently done**, **Control room**, **Activity**, statuses per existing `home.status` keys. Never use wording implying unsupported autonomy ("auto-send", "auto-run", "Freelens sent…"). Freelens speaks in first person, no emoji, no em dashes in draft bodies (guard-enforced).

---

## 13. Component inventory

Target: `components/frontdesk/` unless noted. "DS ref" = the design-system component whose anatomy to match.

| Component | DS ref / mockup | Repo status | States |
|---|---|---|---|
| `AppShell` nav | — | Reuse [FACT] | current/idle |
| `QueueList` + `QueueRow` | ActionQueue, `1b` left pane | Refactor out of `inbox-app.tsx` queue rendering | default, selected, empty per group |
| `DecisionPanel` | ApprovalCard + DraftReview, `1h`/`1b` right | **Create** by extraction from `inbox-app.tsx` (draft view, validation panel, action row) | review, decision, missing, loading, error |
| `SourceChip` | ProvenanceChip | Create (small) | yours/suggested/learned/missing/inquiry |
| `DraftPanel` (read-only draft, verbatim) | DraftReview body | Extract | ok, needs_review, failed |
| `GuardPanel` | DraftValidation | Reuse/extract | passed, failed(+codes) |
| `PlanRail` | AgentProgress, `1h` | Create; data = pipeline facts + work-object steps | done/active/pending/blocked steps |
| `WorkObjectCard` | WorkObject | Reuse [FACT in `agent-home.tsx`], restyle to `1b` | plan/working/waiting/needs_you/paused/done/failed |
| `RequestBar` | RequestBar | Reuse existing form; add suggestion chips styling | idle/thinking/error |
| `CapabilityStrip` | AgentScope, `1a` | Refactor existing scope section | single |
| `DecisionCard` (onboarding) | SetupDecisionCard, `1e` | **Create**; wraps existing field editors | suggested, needs_you(required), confirmed, deferred |
| `ProfileValueRow` / `MissingValueRow` | `1f` field patterns | Create | yours/suggested/missing |
| `PagePreview` | DeskPreview | **Create** from the real `/[handle]` render path (one component, two consumers) | draft, published, appearance-applied |
| `IntakeTypeChips` + `ConditionalTextField` | `1l` | Refactor `inquiry-form.tsx` | idle, other-selected, invalid |
| `AppearanceControls` | `2a` | Create | default, dark preview |
| `PauseControls` / `TakeoverRow` | `1n` | Create thin wrappers over existing APIs | active, paused, manual |
| `ActivityList` | ActivityLog, `1n` | Create (derived data) | populated, empty |
| `MemoryList` | MemoryList, `1m` | Create UI over `deriveMemoryItems` [FACT] | setting, learned(+evidence), reverting |
| Loading/empty/error primitives | Notice, EmptyState | Reuse repo patterns (`role="status"`, `role="alert"`) | — |

Remove/hide: `security-card.tsx` render sites; any `automation-rules.tsx` / `agent-surfaces.tsx` UI exposing non-operational levels or rules (audit in Phase 0).

---

## 14. Data and integration requirements

| Value / action | Source of truth | Exists? | Work needed | Fallback / rule |
|---|---|---|---|---|
| Profile, professions, city, sign-off, photo | `freelancers` [FACT `0003`, `0008`] | Yes | None | Missing → `Missing` chip |
| Packages, add-ons | `packages` [FACT] | Yes | None | No package → drafts blocked into `missing` queue (existing) |
| Prefill extraction | `/api/frontdesk/setup/prefill` [FACT] | Yes | UI only | Null fields → `Missing`; API/key absent → manual path only, hide the URL affordance |
| Queue placement | `placeInquiry` [FACT] | Yes | None | — |
| Draft generation + guards | `draftPipeline`, `draftGuards` [FACT] | Yes | None | Failed guards → honest failure copy |
| Send | User's mail client via `mailto:` + clipboard [FACT] | Yes | Keep | **No undo UI**; no in-app send claimed |
| Outcome recording | `drafts.outcome` [FACT] | Yes | None | — |
| Follow-up drafts | nudge engine + `nudge_due` [FACT; [ASSUME] cron wired in deploy] | Yes | Verify cron in Phase 0 | If no cron: hide scheduling promises, keep manual nudge from queue |
| Work objects (request bar) | `agent_work_objects` + request/execute APIs [FACT `0016`] | Yes | UI refactor | API key absent → request bar answers with the honest "can't right now" error state |
| Calendar availability | — | **No** | None this phase | Always "no calendar connected, draft claims nothing" [FUTURE] |
| Gmail reading | `agent_gmail_connections` table exists; no v1 flow [FACT] | Partial | None this phase | Never referenced in UI [FUTURE] |
| Learned voice preferences | `voiceLearning` + decisions [FACT] | Yes | Control-room UI | No accepted proposals → section shows settings only |
| Memory list | `deriveMemoryItems` [FACT] | Yes | UI | — |
| Pause follow-ups / snooze | `followupsPaused`, `snoozed_until` [FACT] | Yes | Control-room UI | — |
| Permission toggles | `permissions` jsonb + `effectiveLevel` [FACT] | Yes (model) | Map two toggles; never render levels | Unclear mapping → ship fixed-text rows only |
| Activity log | Derived [ASSUME `activity.ts`] | Verify | Possibly aggregate query | If not derivable, show Recently done (drafts/outcomes) only |
| Handle availability check | Upsert conflict [FACT] | Partial | [REC] small check endpoint | Until checked: show nothing |
| Appearance | — | **No** | Migration + render + upload (§11) | Absent → current default page |
| Analytics | `track()` exists [FACT] | Yes | Events per §16 allowed | — |

Do not fabricate beyond this table. Anything not listed and not in the repo is [FUTURE].

---

## 15. Implementation phases

**Claude Code must stop after Phase 0 and present its audit and file-level plan for approval before modifying any code.**

Common per-phase gates: `npm run lint`, typecheck, unit tests (Vitest suites in `lib/**` [FACT]), `next build`; i18n parity tests pass (every new key in EN and NL); no console errors on touched routes; visual comparison against the referenced mockups.

- **Phase 0 — Read-only audit and mapping.** Objective: verify every [FACT]/[ASSUME]/[OPEN] here against `main`; inventory render sites of `security-card`, `agent-surfaces`, `automation-rules`, `readiness-checklist`; confirm cron wiring, activity derivation, `IntakeThread` exposure, analytics; produce a file-level plan (reuse/refactor/create/remove per §4/§13) and flag design–capability conflicts. Deliverable: written report. **No code changes.** Gate: user approval.
- **Phase 1 — Foundations.** Extract shared components from `inbox-app.tsx` (`DecisionPanel`, `DraftPanel`, `GuardPanel`, `QueueList`), add `SourceChip`, add i18n keys (EN+NL). Risk: regression in `/inbox` — cover with existing behavior kept identical (snapshot the mailto/copy strings). Excludes: any new features.
- **Phase 2 — Front Desk.** `/home` two-pane per §5.1/§6; capability strip; remove nothing else. Verify queue parity with `/inbox` counts. Excludes: mobile layout work beyond not breaking the bottom bar.
- **Phase 3 — Onboarding.** Decision-queue shell over existing logic; link-name display + availability; example-desk path; security card removed from render. Regression guard: existing freelancers can still edit every field via the manual path. Excludes: Account area, `1g` conversation variant.
- **Phase 4 — Inquiry and approval flow.** Plan rail, source notes, "Passed every check" language, consequence lines; sign-off byte-exactness test; follow-up schedule honesty copy. Excludes: undo, send-from-app, calendar.
- **Phase 5 — Client intake.** §9 options + conditional required field; API validation; i18n; inbox display mapping for new types. Regression: legacy `event_type` rows still render.
- **Phase 6 — Control Room.** `/control` per §10 over existing switches/APIs; memory UI with revert/reset. Excludes: sessions, levels UI, new autonomy.
- **Phase 7 — Page Appearance.** Migration, whitelisted values, upload, render on `/[handle]`, preview, entry from `/setup`. Excludes: everything §11 forbids.
- **Phase 8 — Integration, accessibility, testing, cleanup.** Keyboard paths (queue → panel → actions), focus management on conditional reveals, `prefers-reduced-motion`, contrast on dark appearance, dead-code removal for hidden surfaces, full regression pass, final visual comparison with the board.

Each phase: implement → run gates → show diff → report honestly → wait for approval.

---

## 16. Acceptance criteria (testable)

**Front Desk**
- Landing on `/home` with n queue items shows them in `QUEUE_ORDER`; selecting a row renders its detail without navigation; approving a plan mutates the work object via the execute API and re-renders status.
- The right-pane draft string equals the mailto body string byte-for-byte (test).
- No element on `/home` sends email; no undo control exists anywhere.

**Onboarding**
- New user with only typed text reaches "Done deciding" without ever seeing a Security & Sessions card (DOM assertion) and without being forced through voice confirmation.
- Extracted price appears only as `Suggested` until confirmed; unconfirmed prices never appear in any draft (guard test exists [FACT `draftGuards.test.ts`] — extend with the onboarding path).
- Link field shows format + example; "Available" appears only after the check endpoint/upsert path returns; invalid characters blocked per `isValidHandle`.
- Example desk values all carry example labeling; saving real values removes it.

**Inquiry → send**
- Sign-off `ciao` (fixture) appears in the draft exactly, including case (byte-equality test).
- A draft with an out-of-set price digit lands in `needs_review`/`failed`, never rendered as sendable (existing guard tests remain green).
- Date language never asserts availability (guard test).
- Outcome recording still writes `sent_as_is`/`edited`/`skipped`; existing `/inbox` flows unbroken.

**Client intake**
- Seven type options render; selecting "Something else" reveals a required field; submitting without it fails client- and server-side with the specified message; all seven values accepted by the API; legacy rows still display.
- Honeypot behavior unchanged; client email never included in any prompt payload (existing guarantee preserved).

**Control Room**
- Only the §10 items render (DOM snapshot: no "Auto-run", no level numbers, no session rows).
- Toggles round-trip to their real stores (`permissions` jsonb / `followupsPaused`); fixed rows have no interactive handlers.
- Memory revert restores the retained prior value and drops the decision [FACT `memory.ts` semantics].

**Page Appearance**
- Only whitelisted tones/accents/themes persist (server rejects others); accent renders on the CTA only; dark theme passes AA contrast for all text on `/[handle]`; pages without appearance render unchanged.

**Cross-cutting**
- Every new string exists in EN and NL (parity tests green).
- Keyboard-only traversal covers queue selection, decision actions, intake completion, appearance controls; conditional reveals move focus.
- Loading and failure states render for home data, request bar, prefill, intake submit.
- Analytics: emit events only via the existing `track()`; [REC] `agent_plan_approved`, `onboarding_completed`, `intake_submitted`, `appearance_saved`.
- Auth, profile editing, public page, and inquiry submission flows pass unchanged (regression suite).

---

## 17. Definition of done

- All approved desktop key states from §2/§5 exist and match the board on visual comparison.
- No unsupported control is visible anywhere (undo, auto-run, levels, sessions, calendar claims).
- Every visible action works; approval boundaries enforced server-side, not only in UI.
- Prices and sign-offs come only from authoritative user data; byte-exactness test green.
- Conditional intake behavior works both client- and server-side.
- Control Room contains only genuine agent controls; Page Appearance stays within §11.
- Empty, loading, error, missing-data, returning-user states covered per §5.
- All tests and `next build` pass; i18n parity green.
- No existing authentication, profile, inquiry, or public-page flow broken.
- Test data appears only as labeled fixtures.

---

## 18. Claude Code execution prompt (paste-ready)

```
Read the specification file 2026-09-01_Implementation_Freelens_Agent_Experience.md in full before doing anything else. It is the single source of truth for scope, locked decisions, and phasing. The approved mockups it references are design targets to recreate with this repository's own stack and tokens, not code to copy.

Then:
1. Inspect this repository (LuchoToshi/freelens @ main) and every CLAUDE.md you find. Enter read-only plan mode: make no edits, run no writes.
2. Complete Phase 0 exactly as defined in §15: verify every [FACT], [ASSUME], and [OPEN] tag against the actual code; inventory the render sites the spec asks about; confirm cron wiring, activity derivation, IntakeThread exposure, and analytics.
3. Report, honestly and specifically: (a) every conflict between the spec/designs and actual platform capabilities, (b) files to reuse, refactor, create, and remove, per surface, (c) the smallest coherent implementation sequence consistent with §15, (d) anything in the spec you cannot satisfy without inventing a capability — propose the leanest honest alternative instead.
4. STOP and wait for explicit approval of the Phase 0 report before editing any file.
5. After approval, implement ONE phase at a time. After each phase: run lint, typecheck, the test suite, and next build; show the full diff; state plainly anything unresolved, skipped, or degraded. Wait for approval before the next phase.
6. Hard rules at all times: never display a control that is not clickable and functional; never let a draft contain a price outside confirmed packages or any availability claim; preserve user-provided text (including sign-offs) byte-for-byte; keep Security & Sessions out of onboarding and agent surfaces and do not build an account area; keep all new copy in lib/frontdesk/i18n.ts in both EN and NL; use the existing --fd-* tokens and design-system patterns; treat test2 / yoi / ciao strictly as fixture data.
```

---

*End of specification.*
