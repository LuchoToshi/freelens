---
phase: 1
slug: calculation-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — CLAUDE.md defers test setup for validation prototype |
| **Config file** | none — Wave 0 installs Vite dev server only |
| **Quick run command** | `npm run build` (type-check + bundle) |
| **Full suite command** | `npm run build && npm run dev` (manual browser check) |
| **Estimated runtime** | ~10 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual browser smoke test
- **Before `/gsd-verify-work`:** Build must exit 0; all manual verifications complete
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | CALC-01 | — | N/A | build | `npm run build` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 0 | CALC-01 | — | N/A | build | `npm run build` | ❌ W0 | ⬜ pending |
| 1-02-01 | 01 | 1 | CALC-02 | — | N/A | manual | open localhost, type values | ❌ W0 | ⬜ pending |
| 1-02-02 | 01 | 1 | CALC-03 | — | N/A | manual | adjust slider, verify live update | ❌ W0 | ⬜ pending |
| 1-02-03 | 01 | 1 | CALC-04 | — | N/A | manual | check math breakdown display | ❌ W0 | ⬜ pending |
| 1-02-04 | 01 | 1 | CALC-05 | — | N/A | manual | enter balance < reserves, verify $0 + message | ❌ W0 | ⬜ pending |
| 1-02-05 | 01 | 2 | CALC-06 | — | N/A | manual | verify slider track fill updates | ❌ W0 | ⬜ pending |
| 1-02-06 | 01 | 2 | CALC-07 | — | N/A | manual | verify responsive on mobile viewport | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — Vite + React + TypeScript + Tailwind scaffold
- [ ] `src/` directory with entry point
- [ ] `npm run build` exits 0

*Existing infrastructure: none — greenfield project.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Safe to spend updates on every keystroke | CALC-02 | No test framework; pure React state behavior | Open dev server, type in balance field, confirm output changes without submitting |
| Tax Reserve + Runway Buffer math breakdown visible | CALC-04 | Visual layout check | Confirm 4-row breakdown: Balance, Tax Reserve, Runway Buffer, Safe to Spend |
| $0 floor with explanatory message | CALC-05 | Conditional UI branch | Enter balance=500, tax=30%, expenses=300, runway=3 — reserves exceed balance, verify $0 + reason message |
| Slider track fills proportionally | CALC-06 | CSS visual check | Adjust tax rate slider, confirm left-of-thumb track is filled (custom property approach) |
| Mobile responsive layout | CALC-07 | Browser DevTools check | Open DevTools mobile emulator at 375px width, verify no overflow or truncation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
