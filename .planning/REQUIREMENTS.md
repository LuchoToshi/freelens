# Requirements: Freelens

**Defined:** 2026-04-06
**Core Value:** A freelancer with money in their account should be able to know exactly what they can spend without fear — not guess, not worry, know.

## v1 Requirements

### Calculator

- [ ] **CALC-01**: User can enter current balance as a currency amount
- [ ] **CALC-02**: User can set estimated tax rate via slider (range: 15–50%)
- [ ] **CALC-03**: User can set desired runway in months and enter monthly expenses (both inputs required for runway buffer calculation)
- [ ] **CALC-04**: Calculator updates output reactively on every input change (no submit button)
- [ ] **CALC-05**: Calculator outputs a single "safe to spend" number as the primary result
- [ ] **CALC-06**: Calculator displays full math breakdown: Balance → Tax Reserve → Runway Buffer → Safe to Spend
- [ ] **CALC-07**: Calculator handles edge case where tax reserve + runway buffer exceeds balance (safe to spend clamps to $0 with explanatory message)

### Trust Layer

- [x] **TRUST-01**: Tax rate slider includes inline guidance: "Most US freelancers: 30–40% total (income tax + 15.3% self-employment tax)"
- [x] **TRUST-02**: Each breakdown line has a plain-English label explaining what it represents and what it protects against
- [x] **TRUST-03**: Calculator displays an honest limits callout: "This doesn't account for upcoming large expenses or invoices not yet in your balance"

### UX

- [ ] **UX-01**: Input validation catches nonsense values (negative balance, 0% tax with no warning, 0-month runway) with inline error messages — not alert dialogs
- [ ] **UX-02**: Layout is mobile-responsive and all inputs are usable on a real touch device
- [ ] **UX-03**: Page loads instantly with no login, no spinner, no backend request
- [ ] **UX-04**: Number formatting uses locale-appropriate currency display (US: $3,200)

## v2 Requirements

### Sharing

- **SHARE-01**: User can share a URL that pre-populates the calculator with their inputs
- **SHARE-02**: User can copy a pre-formatted text snippet with their current result to paste into a message

### Trust Enhancements

- **TRUST-04**: Verbal output alongside the number: one plain-English sentence summarizing the result in context
- **TRUST-05**: Optional "Help me estimate" modal for users who don't know their effective tax rate

### Advanced Inputs

- **ADV-01**: Optional "known large expenses in the next 90 days" field added to runway buffer calculation
- **ADV-02**: Optional 3-month average income input to anchor calculation in trend rather than point-in-time balance

## Out of Scope

| Feature | Reason |
|---------|--------|
| Bank account sync / Plaid | OAuth + backend + privacy overhead before core value is validated |
| Login / accounts / saved state | Destroys zero-friction load; retention optimization is premature |
| Multiple outputs (projections, savings rate, cash flow) | Dilutes single-output clarity; validate primary output before adding more |
| Income tracking / expense logging | Different product; bookkeeping is not the job |
| Tax bracket / jurisdiction calculation | Requires filing status, deductions — rabbit hole that doesn't improve output enough |
| Charts and visualizations | Visual complexity without improving the core spending decision |
| Freemium gate | Kills word-of-mouth before value is proven |
| Mobile app | Web-first; mobile is a distribution decision for later |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CALC-01 | Phase 1 | Pending |
| CALC-02 | Phase 1 | Pending |
| CALC-03 | Phase 1 | Pending |
| CALC-04 | Phase 1 | Pending |
| CALC-05 | Phase 1 | Pending |
| CALC-06 | Phase 1 | Pending |
| CALC-07 | Phase 1 | Pending |
| TRUST-01 | Phase 2 | Complete |
| TRUST-02 | Phase 2 | Complete |
| TRUST-03 | Phase 2 | Complete |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 3 | Pending |
| UX-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after roadmap creation (phase assignments finalized)*
