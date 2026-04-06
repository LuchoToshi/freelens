---
phase: 02-trust-layer
plan: "01"
subsystem: calculator-ui
tags: [trust-copy, ux, tailwind, react]
dependency_graph:
  requires: [01-calculator-core]
  provides: [TRUST-01, TRUST-02, TRUST-03]
  affects: [src/components/Calculator.tsx]
tech_stack:
  added: []
  patterns:
    - optional sublabel prop pattern on BreakdownRow (items-start flex-col layout)
    - always-visible contextual copy (no conditional wrapping)
key_files:
  modified:
    - src/components/Calculator.tsx
decisions:
  - sublabel uses 13px/1.4 (not 14px) per Claude's discretion note in CONTEXT.md — distinguishes from label without needing a separate color token
  - items-start (not items-baseline) on BreakdownRow container so value column top-aligns with label, not sublabel
  - limits callout is unconditional — visible in empty, valid, and over-reserved states per RESEARCH.md Pitfall 4
metrics:
  duration: ~10 minutes
  completed: "2026-04-06"
  tasks_completed: 3
  tasks_total: 4
  files_changed: 1
---

# Phase 2 Plan 01: Trust Layer Copy Summary

Phase 2 trust copy added to Calculator.tsx — tax rate guidance for Dutch ZZP'ers, plain-English sublabels on Tax reserve and Runway buffer breakdown rows, and an always-visible limits callout — using an extended optional `sublabel` prop on BreakdownRow with `items-start` alignment fix.

## What Was Built

Three trust additions, one alignment fix, all in `src/components/Calculator.tsx`:

**TRUST-01 — Tax guidance below slider**
`<p className="mt-1 text-[16px] leading-[1.5] text-[#3F3F46]">` inserted directly after the range input, always visible regardless of slider position. Copy: "Typical Dutch ZZP'ers: 25–35% after deductions"

**TRUST-02 — Breakdown sublabels**
`BreakdownRow` extended with optional `sublabel?: string` prop. Tax reserve gets static sublabel "Set aside in case your tax bill hits". Runway buffer gets dynamic sublabel using template literal: `Covers ${runwayMonths} months if work goes quiet`. Balance row has no sublabel. Safe to spend block is not a BreakdownRow and has no sublabel.

**TRUST-03 — Limits callout**
Unconditional `<p className="mt-4 text-[16px] leading-[1.5] text-[#3F3F46]">` after the over-reserved conditional block, before closing breakdown div. Copy: "This doesn't account for upcoming large expenses or invoices not yet in your balance."

**Alignment fix (BreakdownRow)**
Container changed from `items-baseline` to `items-start` so the value column top-aligns with the label row rather than the sublabel baseline.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 2b9db79 | feat(02-01): extend BreakdownRow with sublabel prop and fix alignment |
| 2 | 975d196 | feat(02-01): add tax guidance copy and breakdown sublabels (TRUST-01, TRUST-02) |
| 3 | 86263c6 | feat(02-01): add unconditional limits callout below breakdown (TRUST-03) |

## Verification Results

- `grep -c "sublabel?: string"` → 1
- `grep -c "items-start justify-between"` → 1 (BreakdownRow)
- `grep -c "items-baseline justify-between"` → 1 (Safe to spend inline div — correct, unchanged)
- Tax guidance string present with en-dash U+2013
- Tax reserve sublabel present as static string
- Runway buffer sublabel present as template literal
- Callout is NOT inside any `&&` conditional — previous line is `)}` closing over-reserved block
- `npx tsc --noEmit` → exit 0
- `npx vite build` → exit 0, 199kb JS bundle

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All copy strings are final, all props are wired to live state.

## Threat Flags

No new network endpoints, auth paths, file access, or schema changes introduced. All additions are static string literals and a JSX template literal rendered via React's auto-escaping (no `dangerouslySetInnerHTML`). T-02-03 mitigation confirmed — no `dangerouslySetInnerHTML` present in file.

## Checkpoint

Task 4 is a `checkpoint:human-verify` requiring browser confirmation that:
- All three trust copy elements are visible
- Runway buffer sublabel updates live with runwayMonths input
- Limits callout persists in over-reserved state
- Value column top-aligns with label row (not sublabel)

Run `npm run dev` and open `http://localhost:5173` to verify.

## Self-Check: PASSED

- `src/components/Calculator.tsx` — FOUND, 178 lines
- Commit 2b9db79 — FOUND
- Commit 975d196 — FOUND
- Commit 86263c6 — FOUND
