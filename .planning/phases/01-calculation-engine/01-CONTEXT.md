# Phase 1: Calculation Engine - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the reactive calculation engine and input layer. Three inputs (balance, tax rate, monthly expenses, runway months — see formula decision below) feed a pure calculation function. Output is a single "safe to spend" number plus a full math breakdown. No trust copy, no UX polish — that's Phase 2 and 3. This phase is done when the math works, the breakdown renders, and the edge case is handled.

</domain>

<decisions>
## Implementation Decisions

### Runway Formula

- **D-01:** Use `monthlyExpenses × runwayMonths` for the runway buffer — NOT `balance × (months/12)`
- **D-02:** This means 4 inputs total: current balance, tax rate, estimated monthly expenses, desired runway (months)
- **D-03:** Formula: `taxReserve = balance × (taxRate / 100)`, `runwayBuffer = monthlyExpenses × runwayMonths`, `safeToSpend = max(0, balance - taxReserve - runwayBuffer)`
- **D-04:** Note: REQUIREMENTS.md CALC-03 assumed 3 inputs. This decision adds a 4th input (monthly expenses). The planner should update CALC-03 and add CALC-03b accordingly.

### Empty / Incomplete State

- **D-05:** Show placeholder breakdown with dashes (—) for each line until all inputs are filled. Structure is visible immediately; the user understands what's coming before they fill anything in.
- **D-06:** The breakdown shows: Balance, Tax Reserve, Runway Buffer, Safe to Spend — each line present from the start, value shows — until its inputs are available.

### Over-Reserved State (CALC-07)

- **D-07:** Neutral/informative tone when tax + runway exceeds balance. Safe to spend shows $0. Message: "Your tax reserve and runway buffer use up your full balance. Nothing left to spend freely."
- **D-08:** No alarm styling — don't make the user feel they've done something wrong. Calm, factual.

### Claude's Discretion

- Input defaults: pre-populate tax rate with 30% as sensible US freelancer default; balance and monthly expenses start empty; runway defaults to 3 months. Rationale: pre-populated tax rate removes the #1 friction point; other fields are too personal to guess.
- Runway input control: number field (not slider). Runway is an integer months value (1–24), not a continuous range — a number input is faster to type and more precise than a slider for this.
- Balance input: plain number field, no in-place currency formatting while typing (too finicky on mobile). Format the output display, not the input.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/REQUIREMENTS.md` §Calculator — CALC-01 through CALC-07 (note: CALC-03 needs updating for 4-input model per D-04)

### Project context
- `.planning/PROJECT.md` — Core value, constraints, out-of-scope boundaries
- `.planning/research/ARCHITECTURE.md` — Component structure, data flow, build order guidance
- `.planning/research/STACK.md` — React + Vite + TypeScript + Tailwind CSS v4 setup
- `.planning/research/PITFALLS.md` — Pitfalls 1–4 are directly relevant to this phase's calculation logic

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No existing code.

### Established Patterns
- Stack is decided: React 19 + Vite 6 + TypeScript 5 + Tailwind CSS v4
- State management: `useState` only — no external state library
- Calculation engine should be a pure function (`calculate(inputs) → result`) with no React dependencies

### Integration Points
- Phase 2 (Trust Layer) will annotate the breakdown output this phase produces — don't couple the breakdown structure to visual styling; render data, not presentation
- Phase 3 (UX Polish) adds validation and mobile hardening on top of Phase 1 inputs

</code_context>

<specifics>
## Specific Ideas

- No specific UI references given — open to standard approaches for input layout
- Placeholder breakdown with dashes is the distinguishing UX choice for the empty state

</specifics>

<deferred>
## Deferred Ideas

- Tax rate "Help me estimate" modal (v2 — TRUST-05)
- Shareable URL encoding inputs (v2 — SHARE-01)
- Verbal output sentence (v2 — TRUST-04)
- Optional "known large expenses" field (v2 — ADV-01)

None of these affect Phase 1 implementation.

</deferred>

---

*Phase: 01-calculation-engine*
*Context gathered: 2026-04-06*
