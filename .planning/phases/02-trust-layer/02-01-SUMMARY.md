---
phase: 02-trust-layer
plan: "01"
subsystem: calculator-ui
tags: [trust-copy, ux, tailwind, react, i18n, eur, dutch]
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
    - src/lib/format.ts
decisions:
  - sublabel uses 13px/1.4 (not 14px) per Claude's discretion note in CONTEXT.md — distinguishes from label without needing a separate color token
  - items-start (not items-baseline) on BreakdownRow container so value column top-aligns with label, not sublabel
  - limits callout is unconditional — visible in empty, valid, and over-reserved states per RESEARCH.md Pitfall 4
  - currency switched to EUR with nl-NL locale (Dutch format: €1.234 with period thousands separator)
  - all UI copy translated to Dutch to fit ZZP'er / creative freelancer context
  - default tax rate changed from 30% to 37% (typical IB box 1 rate for ZZP'ers after aftrekposten)
metrics:
  duration: ~15 minutes
  completed: "2026-04-06"
  tasks_completed: 4
  tasks_total: 4
  files_changed: 2
---

# Phase 2 Plan 01: Trust Layer Copy Summary

Phase 2 trust copy added to Calculator.tsx — Dutch-language tax rate guidance for ZZP'ers with IB/aftrekposten context, Dutch sublabels on breakdown rows, unconditional limits callout — plus EUR currency (nl-NL locale) throughout and full Dutch UI copy replacing all English labels.

## What Was Built

Three trust additions, one alignment fix, EUR localization, and full Dutch copy — across `src/components/Calculator.tsx` and `src/lib/format.ts`:

**TRUST-01 — Tax guidance below slider**
`<p className="mt-1 text-[16px] leading-[1.5] text-[#3F3F46]">` directly after the range input, always visible. Copy: "Typisch voor ZZP'ers: 25–45% na aftrekposten (MKB-winstvrijstelling, zelfstandigenaftrek)"

**TRUST-02 — Breakdown sublabels**
`BreakdownRow` extended with optional `sublabel?: string` prop. Tax reserve (Belastingreserve): "Opzij voor de inkomstenbelasting". Runway buffer (Maandenbuffer): `Dekt ${runwayMonths} maanden als opdrachten uitblijven`. Balance and Safe to spend rows have no sublabels.

**TRUST-03 — Limits callout**
Unconditional `<p className="mt-4 text-[16px] leading-[1.5] text-[#3F3F46]">` after the over-reserved block. Copy: "Dit houdt geen rekening met grote aankomende uitgaven of facturen die nog niet op je rekening staan."

**Alignment fix (BreakdownRow)**
Container changed from `items-baseline` to `items-start` so the value column top-aligns with the label row.

**EUR localization**
`src/lib/format.ts` switched from `en-US`/`USD` to `nl-NL`/`EUR` — produces Dutch format (€ 1.234 with period thousands separator). Inline € prefix added to balance and monthly expenses inputs. Input parsing handles Dutch comma decimal separator via `.replace(',', '.')`.

**Dutch UI copy**
All labels, headings, sublabels, and messages translated: "Wat kan ik veilig uitgeven?", "Huidig saldo", "Belastingtarief (IB)", "Maandelijkse vaste lasten", "Buffer (maanden)", "Veilig te besteden", over-reserved message in Dutch.

**Default tax rate**
Changed from 30% to 37% — more representative of IB box 1 rates for ZZP'ers after standard aftrekposten.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 2b9db79 | feat(02-01): extend BreakdownRow with sublabel prop and fix alignment |
| 2 | 975d196 | feat(02-01): add tax guidance copy and breakdown sublabels (TRUST-01, TRUST-02) |
| 3 | 86263c6 | feat(02-01): add unconditional limits callout below breakdown (TRUST-03) |
| EUR+NL fix | cfcea0d | fix: switch to EUR currency and Dutch creative freelancer context |

## Verification Results

- `npx tsc --noEmit` → exit 0
- `npx vite build` → exit 0, 199kb JS bundle
- nl-NL/EUR locale wired in format.ts
- All UI labels in Dutch
- Tax guidance references IB, MKB-winstvrijstelling, zelfstandigenaftrek
- Breakdown sublabels in Dutch with live runwayMonths interpolation
- Limits callout unconditional, in Dutch
- No `dangerouslySetInnerHTML` present

## Deviations from Plan

**1. [User feedback — EUR + Dutch context] Switch currency and localize UI**
- Found during: Task 4 (browser verify — not approved)
- Issue: Calculator showed USD ($) and English copy; user requires EUR and Dutch creative freelancer context
- Fix: Rewrote format.ts to use nl-NL/EUR locale; translated all Calculator.tsx labels, copy, and sublabels to Dutch; updated tax guidance to reference IB/aftrekposten; changed default tax rate to 37%
- Files modified: src/components/Calculator.tsx, src/lib/format.ts
- Commit: cfcea0d

## Known Stubs

None. All copy strings are final, all props are wired to live state.

## Threat Flags

No new network endpoints, auth paths, file access, or schema changes introduced. T-02-03 mitigation confirmed — no `dangerouslySetInnerHTML` present.

## Self-Check: PASSED

- src/components/Calculator.tsx — FOUND
- src/lib/format.ts — FOUND
- Commit 2b9db79 — FOUND
- Commit 975d196 — FOUND
- Commit 86263c6 — FOUND
- Commit cfcea0d — FOUND
