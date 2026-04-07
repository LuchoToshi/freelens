# Phase 3: Production Polish - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Add input validation, harden mobile touch UX, confirm instant page load, and finalize locale formatting. No new inputs, no new outputs, no visual redesign — this phase makes what's already built reliable for every valid and invalid input state, on any device.

</domain>

<decisions>
## Implementation Decisions

### Validation Trigger

- **D-01:** Validation errors show **on blur only** (when the user leaves a field) — not on every keystroke
- **D-02:** The reactive calculation continues to run underneath; the error message is a UI annotation, not a blocker on calculation output
- **D-03:** If a field shows an error and the user returns and corrects it, the error clears on the next blur (or on valid input if the field is focused)

### Error Copy (Dutch)

- **D-04:** Negative balance → `"Vul een positief saldo in"` (calm, no alarm — consistent with D-08 from Phase 1)
- **D-05:** 0-month runway → `"Voer minimaal 1 maand buffer in"` (calm, protective framing)
- **D-06:** 0% tax rate → soft warning (not a hard error): `"Controleer je belastingtarief — 0% is ongebruikelijk voor ZZP'ers."` — 0% is technically valid input but produces a misleading result for any Dutch ZZP'er. Show the warning but do not block the calculation.
- **D-07:** Error messages appear as inline text below the relevant input — no alert dialogs, no toasts, consistent with UX-01 requirement

### Mobile: Runway Input

- **D-08:** Runway number input made full-width — same width as balance and monthly expenses inputs
- **D-09:** No stepper buttons — keep the UI consistent and simple
- **D-10:** The `w-24` constraint is removed; runway input uses the same full-width treatment with `py-4` padding for adequate touch target

### Locale Format

- **D-11:** Confirmed: `nl-NL` locale stays — `€3.200` (period = thousands separator, comma = decimal)
- **D-12:** `format.ts` already correctly implements this — no changes needed for UX-04
- **D-13:** UX-04 requirement is satisfied by the existing `format.ts` implementation

### Claude's Discretion

- Error state visual treatment: a small red/warning text below the input (12–13px, consistent with sublabel styling) — no border color changes on the input itself unless trivially achievable
- Slider: if the tax rate slider reaches 0% via user interaction, the soft warning (D-06) shows below the slider, not below the number display
- Balance input: negative value via keyboard (e.g., typing "-100") — the blur validation catches this and shows D-04 copy
- 0-month runway: the runway number input has `min={1}` already — browser prevents going below 1 via arrow keys, but typed "0" still needs the blur validation catch

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/REQUIREMENTS.md` §UX — UX-01, UX-02, UX-03, UX-04

### Prior phase foundations
- `.planning/phases/01-calculation-engine/01-CONTEXT.md` — D-08 (calm tone, no alarm styling), input patterns, reactive state approach
- `.planning/phases/02-trust-layer/02-CONTEXT.md` — D-09 (Dutch ZZP framing), sublabel styling (12–13px muted text), BreakdownRow component structure

### Implementation reference
- `src/components/Calculator.tsx` — Current component. Validation logic added here. Runway input width changed here.
- `src/lib/format.ts` — Currency formatter. Confirmed nl-NL, no changes needed.
- `src/lib/calculate.ts` — Pure calculation function. No changes needed for this phase.

### Project context
- `.planning/PROJECT.md` — Core value, out-of-scope boundaries (no backend, no persistence)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Calculator.tsx` — All inputs live here. Validation state can be managed with `useState` (e.g., `touched` flags per field, or a `errors` object)
- `BreakdownRow` component — Sublabel pattern already established. Error messages follow similar pattern but attached to input containers, not breakdown rows
- `format.ts` — `formatCurrency()` using `nl-NL` already correct; no changes needed

### Established Patterns
- All styling via Tailwind CSS v4 utility classes — no component library
- Colors established: zinc-400 (`#A1A1AA`) for muted text, zinc-700 (`#3F3F46`) for body text
- Reactive state: `useState` only — validation state fits the same pattern
- Error text at 12–13px muted (matches sublabel pattern from Phase 2)

### Integration Points
- Validation adds new state to `Calculator.tsx` — `touched` flags (one per field) and derived error strings
- Runway input width change: remove `w-24`, apply full-width class consistent with other inputs
- No new files expected — all changes contained in `Calculator.tsx`
- UX-03 (instant load): this is architectural — React + Vite SPA with no backend calls. Already satisfied by the stack. Needs only a quick verification check, not implementation work.

</code_context>

<specifics>
## Specific Ideas

- 0% tax soft warning copy confirmed by user: `"Controleer je belastingtarief — 0% is ongebruikelijk voor ZZP'ers."` — user specified this exact framing
- Tone: "calm, factual, no alarm" — consistent with the established Dutch ZZP tone throughout the app
- nl-NL format confirmed: `€3.200` (Dutch convention). `format.ts` already correct.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-production-polish*
*Context gathered: 2026-04-07*
