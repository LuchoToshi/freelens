# Phase 3: Production Polish - Research

**Researched:** 2026-04-07
**Domain:** React input validation, mobile touch UX, locale formatting
**Confidence:** HIGH

## Summary

This phase is almost entirely a `Calculator.tsx` edit. The stack, patterns, and formatting layer are already in place — research confirms zero new dependencies are needed. The work is: add blur-triggered validation state, fix the runway input width, and verify the SPA loads with no network requests.

The CONTEXT.md decisions are precise and complete. Every design choice (error copy, trigger timing, visual treatment, soft vs. hard errors) is already resolved. Research below confirms the React patterns that implement those decisions correctly.

**Primary recommendation:** Add a `touched` flags object and a derived `errors` object to `Calculator.tsx`. No new files, no new libraries.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Validation errors show on blur only — not on every keystroke
- **D-02:** The reactive calculation continues underneath; error messages are UI annotations, not blockers
- **D-03:** Error clears on next blur when corrected (or on valid input if focused)
- **D-04:** Negative balance error copy: `"Vul een positief saldo in"`
- **D-05:** 0-month runway error copy: `"Voer minimaal 1 maand buffer in"`
- **D-06:** 0% tax rate is a soft warning (not hard error): `"Controleer je belastingtarief — 0% is ongebruikelijk voor ZZP'ers."` — show warning, do not block calculation
- **D-07:** Error messages appear as inline text below the relevant input — no alert dialogs, no toasts
- **D-08:** Runway input goes full-width (same as balance and monthly expenses inputs)
- **D-09:** No stepper buttons on runway input
- **D-10:** Remove `w-24` from runway input; apply full-width with `py-4` padding
- **D-11:** `nl-NL` locale stays — `€3.200` formatting
- **D-12:** `format.ts` already correctly implements nl-NL — no changes needed
- **D-13:** UX-04 is satisfied by existing `format.ts` — no implementation work

### Claude's Discretion

- Error state visual treatment: small red/warning text below the input (12–13px), consistent with sublabel styling — no border color changes unless trivially achievable
- Slider at 0%: soft warning (D-06) shows below the slider, not below the number display
- Balance negative via keyboard (e.g., "-100"): blur validation catches this and shows D-04 copy
- 0-month runway via keyboard: `min={1}` prevents arrow keys below 1, but typed "0" still needs blur validation catch

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | Input validation catches nonsense values (negative balance, 0% tax with no warning, 0-month runway) with inline error messages — not alert dialogs | Blur-triggered `touched` + `errors` pattern in React `useState`; soft vs. hard error distinction handled via separate warning check |
| UX-02 | Layout is mobile-responsive and all inputs are usable on a real touch device | Remove `w-24` from runway input; `py-4` padding already on other inputs gives 44px+ touch target; existing `inputMode="decimal"` already correct for mobile keyboards |
| UX-03 | Page loads instantly with no login, no spinner, no backend request | Confirmed by stack: React + Vite SPA, no `useEffect` with fetch, no auth layer — needs only a dev-server verification, not code changes |
| UX-04 | Number formatting uses locale-appropriate currency display | Confirmed satisfied: `format.ts` uses `Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })` — outputs `€3.200` |
</phase_requirements>

## Standard Stack

### Core (no additions needed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| React | 19 | Component state, event handling | Already installed [VERIFIED: codebase] |
| TypeScript | 5 | Type safety | Already installed [VERIFIED: codebase] |
| Tailwind CSS | v4 | Utility styling for error text | Already installed [VERIFIED: codebase] |

**No new dependencies.** All validation state is React `useState`. All error styling is Tailwind utility classes already in use.

**Installation:** None required.

## Architecture Patterns

### Recommended Project Structure

No structural changes. All changes are contained in `src/components/Calculator.tsx`.

### Pattern 1: Blur-Triggered Validation with `touched` Flags

**What:** Track which fields the user has interacted with (`touched`), then compute error strings from current values. Only show errors for touched fields.

**When to use:** Exactly this case — validate on blur, clear on correction, don't annoy users on first load.

**Example:**

```typescript
// Source: React docs — controlled inputs + event handlers [ASSUMED: pattern from training, standard React]

// State
const [touched, setTouched] = useState({ balance: false, taxRate: false, runway: false });

// Derived errors (computed inline, not stored)
const errors = {
  balance: touched.balance && balance < 0 ? 'Vul een positief saldo in' : null,
  taxRate: taxRatePercent === 0 ? 'Controleer je belastingtarief — 0% is ongebruikelijk voor ZZP\'ers.' : null,
  runway: touched.runway && runwayMonths < 1 ? 'Voer minimaal 1 maand buffer in' : null,
};

// On each input: onBlur={() => setTouched(prev => ({ ...prev, balance: true }))}
```

**Key distinction for D-06:** `taxRate` warning is NOT gated on `touched.taxRate` — the slider starts at 37%, so 0% only happens via deliberate user action. The warning shows whenever `taxRatePercent === 0`, regardless of touched state. This is a soft warning: the calculation still runs and displays.

**D-03 (error clears on correction):** Because `errors` is derived from current input values on every render, fixing the value and blurring again naturally clears the error. No extra clearing logic needed.

### Pattern 2: Inline Error Rendering Below Input

**What:** Render error text in a `<p>` tag immediately after the input element, sized at 12–13px, matching the sublabel pattern established in Phase 2.

**Example:**

```typescript
// Source: Established in Phase 2 via BreakdownRow sublabel [VERIFIED: codebase]
// Error text matches sublabel style: text-[13px] leading-[1.4] text-[#A1A1AA]
// For errors, swap color to red — use Tailwind's red-500 or a project-appropriate token

{errors.balance && (
  <p className="text-[13px] leading-[1.4] text-red-500">{errors.balance}</p>
)}
```

**Color choice:** The project uses zinc tokens; `text-red-500` is Tailwind's standard red and requires no new config in Tailwind v4. [ASSUMED: red-500 is available in Tailwind v4 default palette — highly likely but not verified against v4 docs]

**D-06 soft warning:** Use same size/position but use a warning color (amber or muted zinc, not red) to signal "notice" vs. "error." Or use zinc-400 (already in the palette) for a calm, non-alarming tone consistent with D-08 from Phase 1.

### Pattern 3: Runway Input Width Fix (D-08/D-10)

**What:** Remove `w-24` constraint. Apply same full-width treatment as other inputs.

**Current code (line 111):**
```typescript
className="bg-white border border-[#E4E4E7] rounded-md p-4 text-[16px] text-[#3F3F46] w-24 focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
```

**Fixed code:**
```typescript
className="bg-white border border-[#E4E4E7] rounded-md p-4 text-[16px] text-[#3F3F46] w-full focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
```

One token change: `w-24` → `w-full`. The `p-4` already provides adequate touch target height (matches `py-4` on other inputs).

### Pattern 4: UX-03 Verification (No Code Change)

**What:** Confirm the page loads with no network requests in the critical path.

**Evidence from codebase:**
- `Calculator.tsx` has no `useEffect` with fetch calls [VERIFIED: codebase]
- `format.ts` uses `Intl.NumberFormat` — browser built-in, no network [VERIFIED: codebase]
- No auth layer, no spinner component, no loading state [VERIFIED: codebase]

**Implementation:** This is a verification task, not a code task. Dev-tools Network tab check with cache disabled confirms zero requests on load.

### Anti-Patterns to Avoid

- **Real-time validation (onChange):** D-01 locks this to blur only. onChange validation on text inputs annoys users who are mid-typing.
- **Alert dialogs for validation:** D-07 explicitly prohibits. Never `window.alert()` or modal for input errors.
- **Storing errors in state:** Derive errors from input values + touched flags. Stored error state goes stale and requires manual clearing logic.
- **Blocking the calculation on soft warning:** D-06 + D-02 — the 0% tax warning is advisory. The calculation still runs.
- **Border-color validation indicators:** CONTEXT.md discretion says "no border color changes unless trivially achievable." Skip it — inline text is sufficient.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Validation state management | Custom validation hook | Direct `useState` with derived errors | Overkill for 3 fields; a hook adds indirection with no benefit |
| Form library | React Hook Form / Formik | Plain `onBlur` handlers | Zero forms in this app — a form library introduces 5KB+ for no gain |
| Currency formatting | Custom number formatter | Existing `formatCurrency()` in `format.ts` | Already correct, already tested by the calculation output |

**Key insight:** This is a 3-field calculator. Form libraries, validation libraries, and custom hooks all add complexity that a 10-line derived `errors` object replaces entirely.

## Common Pitfalls

### Pitfall 1: Runway Value Parsed as 0 When Empty

**What goes wrong:** `runwayMonths` is a `number` state. If the user clears the input, `Number('')` = `0`, which triggers the error. But the current `onChange` handler uses `Number(e.target.value) || 0` — this coerces empty string to 0, which is then a validatable state.

**Why it happens:** Number inputs with controlled state snap to 0 on clear.

**How to avoid:** The blur validation catches `runwayMonths < 1` and shows D-05 copy. This is correct behavior — an empty/0 runway IS an error. The `min={1}` attribute prevents arrow-key decrement below 1, but keyboard-typed "0" still lands here and needs the blur catch.

**Warning signs:** Testing by clearing the runway field should show D-05 error on blur.

### Pitfall 2: Balance Negative Check on Empty String

**What goes wrong:** `balance = parseFloat(balanceStr.replace(',', '.')) || 0` — an empty string produces `0`, not a negative number. Typing "-100" produces `-100`. The error check needs to be `balance < 0`, not `balanceStr.startsWith('-')`.

**How to avoid:** Use the already-parsed `balance` numeric value for validation, not the raw string.

### Pitfall 3: Tax Soft Warning Appearing on First Load

**What goes wrong:** If the warning for `taxRatePercent === 0` is shown unconditionally, it can flash on first render if the slider somehow initializes at 0. Current state initializes at 37 — this is not a real risk, but defensive: only show the tax warning when `taxRatePercent === 0`.

**How to avoid:** The condition `taxRatePercent === 0` is false on initial render (starts at 37). No `touched` gate needed for the soft warning.

### Pitfall 4: Red Color Not in Tailwind v4 Config

**What goes wrong:** Tailwind v4 uses a CSS-first config. If for any reason the project has a restrictive config that excludes the red palette, `text-red-500` would not compile.

**How to avoid:** Tailwind v4's default palette includes red. Verify `text-red-500` renders correctly in dev before committing. If it doesn't appear, use an inline style or a hardcoded hex (`#EF4444` = Tailwind red-500). [ASSUMED: red-500 available in v4 default palette]

## Code Examples

### Full Validation State Pattern

```typescript
// Source: Standard React controlled-input pattern [ASSUMED: training knowledge, standard React]

// Add to Calculator component state
const [touched, setTouched] = useState({
  balance: false,
  runway: false,
});

// Derived — no useState needed, recomputes on every render
const errors = {
  balance: touched.balance && balance < 0 ? 'Vul een positief saldo in' : null,
  runway: touched.runway && runwayMonths < 1 ? 'Voer minimaal 1 maand buffer in' : null,
};

// Soft warning — not gated on touched (only shows if user drags to 0)
const taxWarning =
  taxRatePercent === 0
    ? "Controleer je belastingtarief — 0% is ongebruikelijk voor ZZP'ers."
    : null;
```

### Balance Input with Blur Handler and Error

```typescript
// Source: Derived from existing Calculator.tsx pattern [VERIFIED: codebase]

<div className="flex flex-col gap-2">
  <label htmlFor="balance" className="text-[14px] leading-[1.5] text-[#3F3F46]">
    Huidig saldo
  </label>
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#A1A1AA] select-none">€</span>
    <input
      id="balance"
      type="text"
      inputMode="decimal"
      placeholder="0"
      value={balanceStr}
      onChange={(e) => setBalanceStr(e.target.value)}
      onBlur={() => setTouched((prev) => ({ ...prev, balance: true }))}
      className="bg-white border border-[#E4E4E7] rounded-md pl-8 pr-4 py-4 text-[16px] text-[#3F3F46] w-full focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
    />
  </div>
  {errors.balance && (
    <p className="text-[13px] leading-[1.4] text-red-500">{errors.balance}</p>
  )}
</div>
```

### Runway Input Width Fix

```typescript
// Source: Existing Calculator.tsx line 111 [VERIFIED: codebase]
// Change: w-24 → w-full

<input
  id="runwayMonths"
  type="number"
  min={1}
  max={24}
  step={1}
  value={runwayMonths}
  onChange={(e) => setRunwayMonths(Number(e.target.value) || 0)}
  onBlur={() => setTouched((prev) => ({ ...prev, runway: true }))}
  className="bg-white border border-[#E4E4E7] rounded-md p-4 text-[16px] text-[#3F3F46] w-full focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
/>
{errors.runway && (
  <p className="text-[13px] leading-[1.4] text-red-500">{errors.runway}</p>
)}
```

### Tax Soft Warning Below Slider

```typescript
// Soft warning: not red, calmer tone — use zinc-500 or amber-600
{taxWarning && (
  <p className="text-[13px] leading-[1.4] text-[#A1A1AA]">{taxWarning}</p>
)}
```

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None currently — CLAUDE.md explicitly states "don't set up a test suite for a validation prototype" |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| UX-01 | Validation errors show on blur, not on load | manual | — | Project explicitly defers testing per CLAUDE.md |
| UX-02 | Runway input full-width on mobile | manual | — | Real device test required |
| UX-03 | Page loads with no network requests | manual | — | Browser DevTools Network tab verification |
| UX-04 | nl-NL currency format displays correctly | manual | — | Visual inspection in browser |

**Note:** `nyquist_validation` is enabled in config.json, but CLAUDE.md for this project states "Don't set up a test suite for a validation prototype. Add when the formula grows complex enough to warrant it." These requirements are all UI/behavioral — manual verification is the correct approach at this stage. No Wave 0 test gaps to create.

### Wave 0 Gaps

None — manual verification is the correct testing approach per project constraints. No test infrastructure should be created for this phase.

## Environment Availability

Step 2.6: SKIPPED — no external dependencies. All changes are pure TypeScript/React edits. No new tools, services, or CLIs required.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Validate on submit | Validate on blur | React ecosystem standard | Better UX — errors appear when user leaves field, not before |
| Form libraries for all validation | Inline derived state for simple forms | ~2022 (React hooks maturity) | Fewer dependencies, less abstraction overhead |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `text-red-500` is available in Tailwind v4 default palette | Common Pitfalls, Code Examples | Error text color won't apply — fallback to `style={{ color: '#EF4444' }}` |
| A2 | Blur-triggered validation pattern with `touched` flags is the standard React approach | Architecture Patterns | Negligible — this is the established React controlled-input pattern |

## Open Questions (RESOLVED)

1. **Soft warning color for 0% tax**
   - What we know: CONTEXT.md says "calm, factual, no alarm" consistent with D-08
   - What's unclear: Should the soft warning use zinc-400 (same as muted sublabels) or amber for visual distinction from normal sublabels?
   - Recommendation: Use zinc-400 (`#A1A1AA`) — matches existing palette, stays calm. If the planner wants visual distinction, amber-600 is a reasonable alternative.
   - **RESOLVED:** Use zinc-400 (`#A1A1AA`) per Plan 03-01 Task 2 — matches existing palette, stays calm, consistent with D-08 tone.

## Sources

### Primary (HIGH confidence)
- `src/components/Calculator.tsx` — Existing input structure, state patterns, className conventions [VERIFIED: codebase read]
- `src/lib/format.ts` — Confirmed nl-NL Intl.NumberFormat, UX-04 already satisfied [VERIFIED: codebase read]
- `.planning/phases/03-production-polish/03-CONTEXT.md` — All design decisions, error copy, locked choices [VERIFIED: file read]

### Secondary (MEDIUM confidence)
- React controlled input documentation pattern — blur validation with touched flags [ASSUMED: training knowledge, standard React pattern]

### Tertiary (LOW confidence)
- Tailwind v4 default red palette inclusion — not verified against v4 docs [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, existing stack fully sufficient
- Architecture: HIGH — patterns are direct derivations from existing code + CONTEXT.md locked decisions
- Pitfalls: HIGH — identified from direct code inspection, not speculation
- Validation approach: HIGH — explicitly deferred per CLAUDE.md project constraint

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable React patterns, no fast-moving ecosystem concerns)
