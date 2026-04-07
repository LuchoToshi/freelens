---
phase: 03-production-polish
plan: 01
subsystem: calculator-ui
tags: [validation, ux, mobile, tailwind]
dependency_graph:
  requires: []
  provides: [blur-validation, runway-width-fix, spinner-suppression]
  affects: [src/components/Calculator.tsx]
tech_stack:
  added: []
  patterns: [blur-triggered-touched-flags, derived-errors-not-stored]
key_files:
  created: []
  modified:
    - src/components/Calculator.tsx
decisions:
  - "Errors derived on every render (not stored in useState) — avoids stale state and manual clearing logic"
  - "taxWarning not gated on touched flag — slider starts at 37%, 0% only reachable by deliberate user action"
  - "Spinner suppression via Tailwind arbitrary variants ([appearance:textfield], ::-webkit-*-spin-button) — no global CSS needed"
  - "Task 1 and Task 2 committed together — Task 1 alone fails TS6133 (unused vars); both tasks are a single atomic unit"
metrics:
  duration: ~8 minutes
  completed: 2026-04-07
  tasks_completed: 2
  files_modified: 1
requirements: [UX-01, UX-02, UX-04]
---

# Phase 03 Plan 01: Input Validation and Runway Width Fix Summary

Blur-triggered validation for balance and runway inputs, soft 0% tax warning below slider, and runway input made full-width with native number spinners suppressed — all contained in a single Calculator.tsx edit.

## What Was Built

**UX-01 — Input validation:**
- `touched` state (balance, runway) tracks which fields the user has left
- `errors` object derived on every render — `balance < 0` and `runwayMonths < 1` conditions
- Inline `<p>` error text below each input: `text-[13px] leading-[1.4] text-red-500`
- Error clears automatically on next blur when value is corrected (derived, no manual clearing needed)
- `taxWarning` derived when `taxRatePercent === 0`, rendered below slider in zinc-400 (calm tone per D-06)

**UX-02 — Runway mobile width fix:**
- Removed `w-24` from runway input className
- Applied `w-full` — matches balance and monthly expenses inputs
- Native number spinners suppressed via `[appearance:textfield]`, `[&::-webkit-inner-spin-button]:appearance-none`, `[&::-webkit-outer-spin-button]:appearance-none` (D-09)

**UX-04 — Locale formatting:**
- No changes — `format.ts` already implements `Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })` correctly (D-12/D-13)

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add validation state and derived errors | e529729 | src/components/Calculator.tsx |
| 2 | Wire handlers, render errors/warning, fix runway | e529729 | src/components/Calculator.tsx |

Note: Tasks 1 and 2 committed together — Task 1 alone produces TS6133 unused variable errors that block the build. Combined into one atomic commit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Task 1 build failure due to TS6133 unused variables**
- **Found during:** Task 1 verification (`npm run build`)
- **Issue:** TypeScript strict mode treats unused `setTouched`, `errors`, and `taxWarning` as errors (TS6133). Task 1 plan says "build passes" but the state additions without JSX wiring cannot satisfy that criterion.
- **Fix:** Executed Task 2 immediately after Task 1 edits before committing, so the single commit contains both tasks in a buildable state.
- **Files modified:** src/components/Calculator.tsx
- **Commit:** e529729

## Known Stubs

None — no placeholder text or hardcoded empty values introduced. All error strings are real copy (D-04/D-05/D-06).

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced.

T-03-01 (XSS via inline error rendering) — mitigated: error strings are hardcoded string literals, never interpolated with user input. React JSX `{}` auto-escapes text content. `dangerouslySetInnerHTML` not used anywhere in this change.

## Self-Check: PASSED

- [x] `src/components/Calculator.tsx` exists and contains all required patterns
- [x] Commit e529729 exists
- [x] `npm run build` exits 0
- [x] `w-24` absent from Calculator.tsx
- [x] All three Dutch copy strings present verbatim
- [x] `errors` is derived (not in useState)
- [x] `taxWarning` condition is `taxRatePercent === 0` (no touched gate)
