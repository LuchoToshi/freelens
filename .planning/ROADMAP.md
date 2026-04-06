# Roadmap: Freelens

## Overview

Three phases to ship a trustworthy calculator. First, get the math right — build the pure calculation function and wire it to reactive inputs so the number appears. Second, add the transparency layer that makes freelancers trust the number they see. Third, harden the UX so the product works on any device, handles bad input gracefully, and loads instantly with no friction.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Calculation Engine** - Pure function + reactive inputs + single output on screen
- [x] **Phase 2: Trust Layer** - Guidance copy, breakdown labels, and honest limits callout (completed 2026-04-06)
- [ ] **Phase 3: Production Polish** - Input validation, mobile responsiveness, formatting, instant load

## Phase Details

### Phase 1: Calculation Engine
**Goal**: A freelancer can enter three numbers and see one trustworthy result update in real time
**Depends on**: Nothing (first phase)
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07
**Success Criteria** (what must be TRUE):
  1. User can type a balance, adjust a tax rate slider, and set runway months — and see "safe to spend" update on every keystroke without hitting submit
  2. The full math breakdown is visible: Balance, Tax Reserve, Runway Buffer, Safe to Spend — in that order
  3. When tax reserve plus runway buffer exceeds the balance, safe to spend shows $0 with a message explaining why — not a negative number
**Plans**: 3 plans
  - [x] 01-01-PLAN.md — Scaffold Vite + React + TS + Tailwind v4
  - [x] 01-02-PLAN.md — calculate() + Calculator component (CALC-01..07)
  - [x] 01-03-PLAN.md — Human verify in browser
**UI hint**: yes

### Phase 2: Trust Layer
**Goal**: The number feels credible — freelancers understand what it means, how it was calculated, and what it doesn't account for
**Depends on**: Phase 1
**Requirements**: TRUST-01, TRUST-02, TRUST-03
**Success Criteria** (what must be TRUE):
  1. The tax rate slider shows inline guidance ("Most US freelancers: 30–40% total") so users know what rate to enter
  2. Every breakdown line has a plain-English label explaining what it is and what it protects against — no financial jargon
  3. A visible callout tells the user what the calculator does not account for (large upcoming expenses, uninvoiced income)
**Plans**: 1 plan
  - [x] 02-01-PLAN.md — Trust Layer copy: tax guidance, breakdown sublabels, limits callout (TRUST-01..03)
**UI hint**: yes

### Phase 3: Production Polish
**Goal**: The calculator works correctly for every input, on any device, with zero friction to load
**Depends on**: Phase 2
**Requirements**: UX-01, UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. Entering a negative balance, 0% tax, or 0-month runway shows an inline error message — no alert dialogs, no broken output
  2. All inputs are tappable and usable on a real phone — not just on desktop
  3. The page loads with no login screen, no spinner, and no network request — inputs are immediately available
  4. Numbers display with locale-appropriate formatting ($3,200 not 3200)
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Calculation Engine | 3/3 | ✓ Complete | 2026-04-06 |
| 2. Trust Layer | 1/1 | Complete   | 2026-04-06 |
| 3. Production Polish | 0/? | Not started | - |
