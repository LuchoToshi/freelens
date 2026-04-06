# Freelens

## What This Is

A web calculator for creative freelancers with irregular income. Takes three inputs — current balance, tax rate, runway target — and returns one number: what's safe to spend right now. Shows the math transparently so freelancers trust the output and act on it.

## Core Value

A freelancer with money in their account should be able to know exactly what they can spend without fear — not guess, not worry, know.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can enter current balance, estimated tax rate, and desired runway (months)
- [ ] Calculator outputs a single "safe to spend" number
- [ ] Breakdown shows: tax reserve, runway buffer, and safe to spend — so the math is transparent
- [ ] Plain-English explanation of what each number means and what it protects against
- [ ] No login required — works as a shareable URL

### Out of Scope

- Account sync / bank integration — adds friction, complexity, and trust burden before the core value is validated
- Multi-output view (cash flow, reserve targets, projections) — one clear output is the product; adding more dilutes it
- Mobile app — web-first; mobile is a distribution decision for later
- Recurring use / saved state — validate single-use trust before optimizing for retention

## Context

- Target user: Creative freelancers (designers, writers, photographers) — project-based work, inconsistent timing, lumpy income
- Core anxiety: "I have $8k in my account but I'm scared to spend any of it" — the slow period fear
- Trust mechanism: Transparency. Show the math. Freelancers dismiss black-box numbers; they trust ones they can verify
- Current status: No code. Design/planning phase. Prototype to test trust and usefulness at maximum simplicity
- Prior research: Trend analysis and user interviews in progress (targeting 10 conversations across 2-3 creative segments)
- Key open question: Do freelancers act on the number, or do they just feel reassured? Validation goal is action, not just comprehension

## Constraints

- **Scope**: No accounts, no persistence, no integrations — validate core value with zero backend first
- **Output**: One number only in v1 — resist the pull to add more outputs before the primary one is trusted
- **Stack**: TBD — web, simple, fast to ship; no premature infrastructure

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| "Safe to spend" as the primary output | Three candidates evaluated (safe to spend / reserve target / true cash position). Safe to spend most directly resolves the slow-period anxiety moment | — Pending |
| Web calculator, not web app | No login, no accounts — removes friction barrier during validation phase | — Pending |
| Creative freelancers as initial ICP | Most homogeneous anxiety pattern; project-based income creates the clearest "what do I actually have?" gap | — Pending |
| Transparent math as trust mechanism | Users see the breakdown, not just the answer — addresses distrust of black-box financial tools | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-06 after initialization*
