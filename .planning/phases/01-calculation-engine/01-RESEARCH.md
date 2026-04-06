# Phase 1: Calculation Engine — Research

**Researched:** 2026-04-06
**Domain:** React SPA, pure calculation function, reactive inputs, Tailwind CSS v4
**Confidence:** HIGH — all primary claims verified against npm registry and existing project research

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Runway buffer formula: `monthlyExpenses × runwayMonths` (NOT `balance × months/12`)
- **D-02:** 4 inputs total: current balance, tax rate, estimated monthly expenses, desired runway (months)
- **D-03:** Formula: `taxReserve = balance × (taxRate / 100)`, `runwayBuffer = monthlyExpenses × runwayMonths`, `safeToSpend = max(0, balance - taxReserve - runwayBuffer)`
- **D-04:** CALC-03 in REQUIREMENTS.md assumed 3 inputs — planner must update CALC-03 and add CALC-03b for the 4th input (monthly expenses)
- **D-05:** Empty state shows breakdown structure immediately with dashes (—) per line until all inputs are filled
- **D-06:** Breakdown always shows all four lines from page load: Balance, Tax Reserve, Runway Buffer, Safe to Spend
- **D-07:** Over-reserved message: "Your tax reserve and runway buffer use up your full balance. Nothing left to spend freely."
- **D-08:** No alarm styling on over-reserved state — calm, factual, no red

### Claude's Discretion

- Tax rate pre-populated at 30%; balance and monthly expenses start empty; runway defaults to 3 months
- Runway input: number field (not slider) — integer months, faster to type, more precise
- Balance input: plain number field, no in-place currency formatting while typing

### Deferred Ideas (OUT OF SCOPE)

- Tax rate "Help me estimate" modal (v2 — TRUST-05)
- Shareable URL encoding (v2 — SHARE-01)
- Verbal output sentence (v2 — TRUST-04)
- Optional "known large expenses" field (v2 — ADV-01)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CALC-01 | User can enter current balance as a currency amount | `<input type="text" inputmode="decimal">` pattern; parse with `parseFloat`, guard NaN |
| CALC-02 | User can set tax rate via slider (range: 15–50%) | `<input type="range" min="15" max="50" step="1">` with live `%` display; default 30 per D-35 |
| CALC-03 | User can set desired runway in months (UPDATE: now also requires CALC-03b for monthly expenses) | `<input type="number" min="1" max="24">` default 3; monthly expenses uses same text/decimal pattern as balance |
| CALC-04 | Calculator updates output reactively on every input change | `onChange` on every field → recompute inline; no submit, no debounce needed (sync calc) |
| CALC-05 | Calculator outputs a single "safe to spend" number as the primary result | Pure function return; render at Display size (36px/600) per UI-SPEC |
| CALC-06 | Calculator displays full math breakdown: Balance → Tax Reserve → Runway Buffer → Safe to Spend | Four-line breakdown component; always rendered; dashes when incomplete |
| CALC-07 | Edge case: tax reserve + runway buffer exceeds balance → $0 with explanatory message | `max(0, ...)` clamp in pure function; conditional message render below output |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield React SPA. No existing code. The entire phase is: scaffold the project, implement one pure calculation function, wire four controlled inputs to it, and render a four-line breakdown that updates synchronously on every keystroke.

The calculation is trivial math. The implementation complexity is entirely in the React wiring and the edge case rendering — specifically the incomplete-input dash state and the over-reserved $0 state. Both are straightforward conditional renders.

The project context has resolved all meaningful open questions before this phase: the runway formula uses monthly expenses (not balance fraction), the input set is 4 fields, and the empty state uses dashes rather than zero-values. Nothing in this phase requires external libraries beyond the decided stack.

**Primary recommendation:** Scaffold with `npm create vite@latest`, add Tailwind v4 via the Vite plugin, build `calculate()` as a pure TypeScript function first, then wire inputs and render breakdown. Total implementation is one component file, one utility file, and one CSS import.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.4 | UI rendering, controlled inputs, state | Decided in CLAUDE.md and STACK.md |
| react-dom | 19.2.4 | DOM rendering | Paired with react |
| typescript | 6.0.2 | Type safety on formula inputs/outputs | Decided in CLAUDE.md; prevents silent taxRate unit bugs |
| vite | 8.0.4 | Dev server, production build | Decided in CLAUDE.md and STACK.md |
| tailwindcss | 4.2.2 | Utility styling — no config file | Decided in CLAUDE.md and STACK.md |
| @tailwindcss/vite | 4.2.2 | Vite plugin for Tailwind v4 | Required for v4 integration pattern |

[VERIFIED: npm registry — versions confirmed 2026-04-06]

### Alternatives Considered

All alternatives were already decided against in CLAUDE.md and STACK.md. Research does not revisit them.

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useState` | Zustand/Jotai | No benefit for 4 inputs — adds a dependency for zero gain |
| `<input type="range">` | Custom slider | Custom slider is weeks of work; native slider works with CSS styling |
| `<input type="text" inputmode="decimal">` | `<input type="number">` | `type="number"` shows browser spinners, interferes with mobile keyboards; `text+inputmode` is correct for currency |

**Installation (after scaffold):**
```bash
npm create vite@latest freelens -- --template react-ts
cd freelens
npm install tailwindcss @tailwindcss/vite
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── App.tsx                  # Root — renders Calculator
├── components/
│   └── Calculator.tsx       # All UI: inputs + breakdown (single component for Phase 1)
├── lib/
│   └── calculate.ts         # Pure function: calculate(inputs) → result
├── types/
│   └── calculator.ts        # CalcInputs, CalcResult TypeScript interfaces
├── index.css                # @import "tailwindcss"
└── main.tsx                 # Vite entry point
```

Phase 2 (Trust Layer) will annotate the breakdown. Keep `Calculator.tsx` structured so the breakdown section can receive annotation props without restructuring the data flow.

### Pattern 1: Pure Calculation Function

The formula is isolated from React entirely. This makes it testable in isolation and prevents any re-render behavior from affecting correctness.

```typescript
// src/lib/calculate.ts
// Source: CONTEXT.md D-03

export interface CalcInputs {
  balance: number;
  taxRate: number;          // percent, e.g. 30 means 30%
  monthlyExpenses: number;
  runwayMonths: number;
}

export interface CalcResult {
  taxReserve: number;
  runwayBuffer: number;
  safeToSpend: number;
  isOverReserved: boolean;
}

export function calculate(inputs: CalcInputs): CalcResult {
  const { balance, taxRate, monthlyExpenses, runwayMonths } = inputs;
  const taxReserve = balance * (taxRate / 100);
  const runwayBuffer = monthlyExpenses * runwayMonths;
  const raw = balance - taxReserve - runwayBuffer;
  const safeToSpend = Math.max(0, raw);
  return {
    taxReserve,
    runwayBuffer,
    safeToSpend,
    isOverReserved: raw < 0,
  };
}
```

### Pattern 2: Controlled Inputs with String State

Balance and monthly expenses are text inputs. Store them as strings in state during editing; parse to number only when computing. This prevents the `0` flash when a user clears a field.

```typescript
// Source: React controlled input best practice [ASSUMED — standard React pattern]
const [balanceStr, setBalanceStr] = useState('');
const [taxRate, setTaxRate] = useState(30);
const [monthlyExpensesStr, setMonthlyExpensesStr] = useState('');
const [runwayMonths, setRunwayMonths] = useState(3);

// Parse at compute time:
const balance = parseFloat(balanceStr) || 0;
const monthlyExpenses = parseFloat(monthlyExpensesStr) || 0;
```

### Pattern 3: Incomplete-State Detection

A breakdown line shows `—` when its required inputs are missing. "Missing" means the string field is empty string or the parsed value is 0 for balance/expenses (since $0 is not a useful input).

```typescript
// Source: derived from CONTEXT.md D-05/D-06
const hasBalance = balanceStr !== '' && balance > 0;
const hasExpenses = monthlyExpensesStr !== '' && monthlyExpenses > 0;
const allInputsValid = hasBalance && hasExpenses; // taxRate and runwayMonths always have defaults

// In breakdown render:
const displayTaxReserve = hasBalance ? formatCurrency(result.taxReserve) : '—';
const displayRunwayBuffer = (hasBalance && hasExpenses) ? formatCurrency(result.runwayBuffer) : '—';
const displaySafeToSpend = allInputsValid ? formatCurrency(result.safeToSpend) : '—';
```

### Pattern 4: Currency Formatting (Output Only)

Format display values with `Intl.NumberFormat`. No library needed. Per UI-SPEC and CLAUDE.md, input fields show raw numbers — formatting is output-only.

```typescript
// Source: MDN Intl.NumberFormat [VERIFIED: standard Web API]
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
```

### Pattern 5: Tax Rate Slider with Live Display

```tsx
// Source: derived from UI-SPEC slider spec
<div>
  <label htmlFor="taxRate">Tax rate</label>
  <div>
    <input
      id="taxRate"
      type="range"
      min={15}
      max={50}
      step={1}
      value={taxRate}
      onChange={(e) => setTaxRate(Number(e.target.value))}
    />
    <span>{taxRate}%</span>
  </div>
</div>
```

### Pattern 6: Custom Slider Track Styling (Tailwind v4)

Tailwind v4 uses CSS custom properties for theming. Native range slider track styling requires vendor-prefixed pseudo-elements. Use a `@layer` block in `index.css`.

```css
/* src/index.css — Source: [ASSUMED — standard CSS technique for range inputs] */
@import "tailwindcss";

@layer components {
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    background: linear-gradient(
      to right,
      #18181B var(--range-progress, 30%),
      #E4E4E7 var(--range-progress, 30%)
    );
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 44px; /* WCAG 2.5.5 minimum touch target per UI-SPEC */
    background: #18181B;
    cursor: pointer;
  }
}
```

The `--range-progress` custom property must be updated via inline style or JS on each slider change to reflect the filled track position accurately.

### Anti-Patterns to Avoid

- **Computing in the render body without a pure function:** Inline math mixed with JSX makes the formula invisible and untestable. The `calculate()` function must live in `lib/calculate.ts`.
- **Storing parsed numbers for text inputs:** Store balance/expenses as strings; parse on use. Storing numbers loses the empty string distinction.
- **Debouncing the calculation:** Calculation is synchronous microsecond math. Debouncing adds visible lag with zero benefit.
- **Showing `$0` for empty fields:** The dashes (—) rule from D-05 is deliberate. `$0` implies the user entered 0. `—` signals "not yet computed."
- **`type="number"` for balance/expenses:** Browser spinners, inconsistent mobile keyboards. Use `type="text" inputmode="decimal"`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency display | Custom format function | `Intl.NumberFormat` | Handles locale, rounding, currency symbol — built into every browser |
| Slider touch target sizing | Custom slider component | Native `<input type="range">` + CSS padding | A custom slider is 200+ lines for a problem CSS solves in 10 |
| Reactive state | Custom observable/event system | `useState` | React's built-in diffing handles this; anything else is overhead |

**Key insight:** This phase has no problems complex enough to warrant a library. The risks are in formula correctness and state typing — both solved by TypeScript, not by dependencies.

---

## Common Pitfalls

### Pitfall 1: taxRate stored as fraction vs. percent

**What goes wrong:** If `taxRate` state is `0.30` but formula uses `balance * (taxRate / 100)`, the reserve is `0.3%` of balance, not `30%`. Catastrophically wrong output with no error.

**Why it happens:** JavaScript has no "percentage" type. The convention is ambiguous.

**How to avoid:** Store taxRate as the integer percent (`30`, not `0.30`). The formula `balance * (taxRate / 100)` converts it. Name the type `taxRatePercent` in the interface to make the unit explicit.

**Warning signs:** Safe-to-spend comes out almost equal to balance for any realistic input.

### Pitfall 2: Empty string parsed as NaN, NaN propagating silently

**What goes wrong:** `parseFloat('') === NaN`. Any arithmetic on NaN returns NaN. The breakdown renders `NaN` or `$NaN` instead of `—`.

**Why it happens:** JavaScript's type coercion hides this until runtime.

**How to avoid:** Use the `|| 0` fallback: `parseFloat(balanceStr) || 0`. Guard dash display by checking whether the string field is empty before displaying a computed value.

### Pitfall 3: Over-reserved detection uses the wrong comparison

**What goes wrong:** Checking `safeToSpend === 0` misses cases where `raw === 0` exactly — which is not over-reserved, just fully allocated.

**How to avoid:** Track `isOverReserved` separately in the result: `raw < 0`. `safeToSpend` is clamped to 0 either way, but the message only appears when `isOverReserved` is true.

### Pitfall 4: Slider filled track not updating visually

**What goes wrong:** CSS `linear-gradient` on the slider track background is static — it won't move with the thumb unless the gradient position is updated dynamically.

**How to avoid:** Set an inline style `style={{ '--range-progress': `${((taxRate - 15) / 35) * 100}%` }}` on the slider element and reference that custom property in the CSS gradient. The denominator is `50 - 15 = 35` (the range span).

### Pitfall 5: Vite scaffold includes default styles that conflict

**What goes wrong:** `npm create vite` generates `App.css` and imports it in `App.tsx`. Default styles (flex centering, logo animation) conflict with the calculator layout.

**How to avoid:** Delete `App.css`, `src/assets/react.svg`, and the default logo SVG immediately after scaffolding. Keep only `index.css` with the Tailwind import.

### Pitfall 6: Tailwind v4 class not applying (missing plugin)

**What goes wrong:** Tailwind classes are written but the page renders unstyled. The build completes without error.

**Why it happens:** v4 requires the Vite plugin — there is no PostCSS config or `tailwind.config.js`. Forgetting to add `tailwindcss()` to `vite.config.ts` plugins causes silent no-op.

**How to avoid:** Verify `vite.config.ts` includes `import tailwindcss from '@tailwindcss/vite'` and `plugins: [react(), tailwindcss()]`. Verify `index.css` starts with `@import "tailwindcss"` (v4 syntax — not `@tailwind base; @tailwind components; @tailwind utilities`).

---

## Code Examples

### Vite Config with Tailwind v4

```typescript
// vite.config.ts — Source: STACK.md (verified against official Tailwind v4 docs)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### index.css

```css
/* src/index.css — v4 syntax */
@import "tailwindcss";
```

### Full calculate() function

```typescript
// src/lib/calculate.ts
export interface CalcInputs {
  balance: number;
  taxRatePercent: number;   // e.g. 30 = 30%
  monthlyExpenses: number;
  runwayMonths: number;
}

export interface CalcResult {
  taxReserve: number;
  runwayBuffer: number;
  safeToSpend: number;
  isOverReserved: boolean;
}

export function calculate(inputs: CalcInputs): CalcResult {
  const { balance, taxRatePercent, monthlyExpenses, runwayMonths } = inputs;
  const taxReserve = balance * (taxRatePercent / 100);
  const runwayBuffer = monthlyExpenses * runwayMonths;
  const raw = balance - taxReserve - runwayBuffer;
  const safeToSpend = Math.max(0, raw);
  return { taxReserve, runwayBuffer, safeToSpend, isOverReserved: raw < 0 };
}
```

### Over-Reserved Conditional Render

```tsx
{/* Source: CONTEXT.md D-07/D-08 */}
<div>
  <span className="text-[36px] font-semibold text-[#18181B]">
    {allInputsValid ? formatCurrency(result.safeToSpend) : '—'}
  </span>
  {allInputsValid && result.isOverReserved && (
    <p className="text-[14px] text-[#3F3F46] mt-2">
      Your tax reserve and runway buffer use up your full balance. Nothing left to spend freely.
    </p>
  )}
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PostCSS-based Tailwind config | Vite plugin, zero config | Tailwind v4 (2025) | Simpler setup; `@import "tailwindcss"` replaces three directives |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4 | Breaking change — old syntax silently fails in v4 |
| Create React App | Vite | ~2022 | CRA deprecated by React team |
| React class components | Function components + hooks | React 16.8+ | Class components still work but are not idiomatic |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Storing text input values as strings (not numbers) is the standard React controlled input pattern | Architecture Patterns #2 | Low — this is universal React practice, but if wrong, minor refactor |
| A2 | CSS `linear-gradient` with dynamic custom property is the standard way to style the filled track on native `<input type="range">` | Architecture Patterns #6 / Pitfalls #4 | Low — if browser support is an issue, alternative is overlapping div hack; same outcome |
| A3 | `--range-progress` denominator of 35 (`max 50 - min 15`) correctly maps slider position to gradient percent | Code Examples | Medium — formula must be verified when slider is implemented; off-by-one errors in range math are common |

---

## Open Questions (RESOLVED)

1. **CALC-03 / CALC-03b update in REQUIREMENTS.md**
   - What we know: D-04 mandates updating CALC-03 (which assumed 3 inputs) and adding CALC-03b for monthly expenses
   - What's unclear: Whether the planner updates REQUIREMENTS.md as a task or whether it's handled separately
   - Recommendation: Include it as Wave 0 task — the requirements doc is the source of truth and must reflect the 4-input model before implementation begins

2. **Slider filled-track browser support**
   - What we know: Vendor-prefixed pseudo-elements (`-webkit-slider-thumb`, `-moz-range-thumb`) are required for cross-browser range styling
   - What's unclear: Firefox support level in 2026 for `-webkit-` prefixes
   - Recommendation: Test slider appearance in Firefox during implementation; if broken, fall back to a percentage-width overlay div approach

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite scaffold, npm | Yes | v25.9.0 | — |
| npm | Package install | Yes | 11.12.1 | — |
| react (npm) | UI framework | Available on registry | 19.2.4 | — |
| vite (npm) | Build tool | Available on registry | 8.0.4 | — |
| typescript (npm) | Type checking | Available on registry | 6.0.2 | — |
| tailwindcss (npm) | Styling | Available on registry | 4.2.2 | — |
| @tailwindcss/vite (npm) | Tailwind v4 Vite plugin | Available on registry | 4.2.2 | — |

[VERIFIED: npm registry 2026-04-06]

No missing dependencies. No blockers.

---

## Validation Architecture

Per CLAUDE.md (STACK.md notes): "Don't set up a test suite for a validation prototype. Add when the formula grows complex enough to warrant it." Testing is deferred.

The one exception: `calculate()` is a pure function. If the planner elects to add a test, it requires zero framework setup — a single Node script suffices. No Wave 0 gaps to address.

**Phase gate:** Manual smoke test — enter known values, verify output matches hand-calculated result.

---

## Security Domain

No security surface in Phase 1. This is a client-side static SPA with no backend, no auth, no persistence, no user data sent anywhere. ASVS categories do not apply.

---

## Project Constraints (from CLAUDE.md)

| Constraint | Source | Impact on Phase 1 |
|------------|--------|-------------------|
| React 19 + Vite 6 + TypeScript 5 + Tailwind v4 | CLAUDE.md | Non-negotiable stack; already reflected in Standard Stack |
| No component libraries (shadcn, MUI, Chakra) | CLAUDE.md | All inputs and breakdown written as plain Tailwind |
| No external state library | CLAUDE.md | `useState` only |
| No test suite for prototype | CLAUDE.md | No Vitest/Jest setup in Phase 1 |
| No backend, no persistence | CLAUDE.md / PROJECT.md | Phase 1 is pure client-side; no API calls |
| No number formatting while typing | CONTEXT.md Claude's Discretion | Input fields show raw user input; output display formats |
| GSD workflow enforcement | CLAUDE.md | All file changes go through GSD entry points |

---

## Sources

### Primary (HIGH confidence)
- npm registry — react@19.2.4, vite@8.0.4, typescript@6.0.2, tailwindcss@4.2.2, @tailwindcss/vite@4.2.2 verified 2026-04-06
- `.planning/research/STACK.md` — Stack decisions and rationale
- `.planning/research/ARCHITECTURE.md` — Component structure and data flow
- `.planning/research/PITFALLS.md` — Pitfalls 1–8 directly relevant to Phase 1
- `.planning/phases/01-calculation-engine/01-CONTEXT.md` — Locked decisions D-01 through D-08
- `.planning/phases/01-calculation-engine/01-UI-SPEC.md` — Component inventory, spacing, color, interaction contract

### Secondary (MEDIUM confidence)
- `Intl.NumberFormat` — MDN Web API, universally supported in modern browsers

### Tertiary (LOW confidence — flagged in Assumptions Log)
- CSS range slider track styling pattern (A2) — standard technique but not verified against current Firefox behavior

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against npm registry; decisions locked in CLAUDE.md and prior research
- Architecture: HIGH — derived directly from locked decisions and prior ARCHITECTURE.md research
- Pitfalls: HIGH — formula pitfalls verified against locked formula; implementation pitfalls are standard React/CSS patterns

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stack is stable; Tailwind v4 and React 19 are not in active breaking-change cycles)
