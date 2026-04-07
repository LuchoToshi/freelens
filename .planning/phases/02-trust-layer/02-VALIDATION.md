---
phase: 2
slug: trust-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — validation prototype, no test suite per CLAUDE.md |
| **Config file** | none |
| **Quick run command** | `open http://localhost:5173` (visual check) |
| **Full suite command** | Visual inspection in browser |
| **Estimated runtime** | ~2 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Open in browser, visually confirm the changed element
- **After every plan wave:** Full manual checklist below
- **Before `/gsd-verify-work`:** All manual checks must pass
- **Max feedback latency:** N/A — manual only

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | TRUST-01 | — | N/A | manual | visual inspection | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | TRUST-02 | — | N/A | manual | visual inspection | ✅ | ⬜ pending |
| 02-01-03 | 01 | 1 | TRUST-03 | — | N/A | manual | visual inspection | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test infrastructure needed. All validation is manual/visual per CLAUDE.md ("Don't set up a test suite for a validation prototype").

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tax guidance text appears below slider | TRUST-01 | No test suite | Load calculator, confirm "Most US freelancers: 30–40% total" is visible below the tax rate slider |
| Tax reserve sublabel visible | TRUST-02 | No test suite | Confirm "Set aside in case your tax bill hits" appears under Tax reserve row |
| Runway buffer sublabel dynamic | TRUST-02 | No test suite | Change runway months input, confirm sublabel updates to "Covers [N] months if work goes quiet" |
| No sublabels on Safe to spend / Balance | TRUST-02 | No test suite | Confirm Safe to spend and Balance rows have no sublabels |
| BreakdownRow value aligns to label (not sublabel) | TRUST-02 | No test suite | Confirm value column top-aligns with label, not sublabel |
| Limits callout always visible | TRUST-03 | No test suite | Confirm callout with "what this doesn't account for" is visible at all times, including when over-reserved |

---

## Validation Sign-Off

- [ ] All tasks have manual verify steps documented above
- [ ] Browser visual check completed after each wave
- [ ] No automated suite needed (design decision)
- [ ] `nyquist_compliant: true` set in frontmatter after execution

**Approval:** pending
