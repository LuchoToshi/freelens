---
phase: 3
slug: production-polish
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-07
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — CLAUDE.md explicitly defers test suite for this validation prototype |
| **Config file** | none |
| **Quick run command** | `npm run build` (compile check only) |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (TypeScript compile check)
- **After every plan wave:** Run `npm run build` + manual browser verification
- **Before `/gsd-verify-work`:** All manual checks below must pass
- **Max feedback latency:** ~30 seconds (build + visual check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | UX-01 | — | N/A | manual | `npm run build` | ✅ | ⬜ pending |
| 3-01-02 | 01 | 1 | UX-01 | — | N/A | manual | `npm run build` | ✅ | ⬜ pending |
| 3-01-03 | 01 | 1 | UX-01 | — | N/A | manual | `npm run build` | ✅ | ⬜ pending |
| 3-02-01 | 02 | 1 | UX-02 | — | N/A | manual | `npm run build` | ✅ | ⬜ pending |
| 3-03-01 | 03 | 1 | UX-03 | — | N/A | manual | — | ✅ | ⬜ pending |
| 3-04-01 | 04 | 1 | UX-04 | — | N/A | manual | — | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — existing infrastructure (TypeScript compiler via `npm run build`) covers all compile-time checks. All behavioral requirements for this phase require manual browser/device verification per project constraints (CLAUDE.md: "Don't set up a test suite for a validation prototype").

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blur validation: negative balance shows error | UX-01 | UI behavior — no test framework | Enter `-100`, tab out → see "Vul een positief saldo in" below the input |
| Blur validation: 0-month runway shows error | UX-01 | UI behavior — no test framework | Type `0` in runway field, tab out → see "Voer minimaal 1 maand buffer in" |
| 0% tax soft warning shows (not hard error) | UX-01 | UI behavior — no test framework | Slide tax to 0% → see soft warning below slider; calculation still shows output |
| Error clears on correction | UX-01 | UI behavior | After seeing error, correct the value and tab out → error disappears |
| Runway input full-width on mobile | UX-02 | Requires real device or responsive DevTools | Open on iPhone/Android or DevTools mobile → runway input matches balance/expenses width |
| All inputs tappable on mobile | UX-02 | Requires real device | Tap each input on phone → opens keyboard, accepts input |
| Page loads with zero network requests | UX-03 | Browser DevTools | Open Network tab, hard refresh → zero XHR/fetch calls, no spinner |
| Currency displays as €3.200 not 3200 | UX-04 | Visual inspection | Enter 3200, confirm output shows `€3.200` (Dutch notation) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
