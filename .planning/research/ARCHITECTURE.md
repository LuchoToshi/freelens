# Architecture Research

**Project:** Freelens — safe-to-spend calculator
**Confidence:** HIGH — stable, well-established pattern for no-backend SPA calculators

## Component Structure

Five components with hard boundaries.

**1. Input Layer**
Responsibility: capture and validate user input before anything downstream sees it.
- Three fields: balance (currency), tax rate (%), runway months (integer)
- Validation lives here, not in the math layer — bad input stops at the boundary
- Emits a single typed object: `{ balance: number, taxRate: number, runwayMonths: number }`
- Recalculates on every change (no submit button — reactive)

**2. Calculation Engine**
Responsibility: pure math. No UI concerns, no state, no side effects.

Single pure function: `calculate(inputs) → result`

```js
// result shape
{
  taxReserve: number,     // balance * (taxRate / 100)
  runwayBuffer: number,   // balance * (runwayMonths / 12)
  safeToSpend: number,    // balance - taxReserve - runwayBuffer, clamped to 0
}
```

**Critical note on runway model:** `runwayBuffer = balance * (runwayMonths / 12)` is the simplest defensible version (reserves a fraction of balance proportional to months as a share of a year, assuming balance approximates annual income). If validation reveals freelancers need to input their expected monthly spend instead, this becomes `runwayBuffer = monthlyBurn * runwayMonths` and the input layer grows to 4 fields. Decide this in user interviews before building.

**3. Output / Display Layer**
Responsibility: render the result object. No math.
- Primary number (safe to spend) — dominant visual hierarchy
- Breakdown (tax reserve, runway buffer) — secondary
- Plain-English explanations per line item
- All formatting (currency, rounding, locale) lives here only

**4. State Container**
Responsibility: single source of truth for inputs and derived result.

```js
{ inputs: { balance, taxRate, runwayMonths }, result: { taxReserve, runwayBuffer, safeToSpend } }
```

React `useState` handles this cleanly. No Redux, Zustand, or Context needed — no state complexity to justify it.

**5. URL Sync Layer**
Thin adapter. Encodes state to URL on input change, decodes on load. Not part of core state — an enhancement.

## Data Flow

```
User types
    → Input Layer validates
    → Calculation Engine (pure fn)
    → State Container updates
    → Display Layer re-renders
    → URL Sync encodes (debounced 300ms)
```

On page load with URL params:
```
URL params present?
  YES → URL Sync decodes → pre-populate inputs → engine runs → display renders
  NO  → default/empty state
```

Entire flow is synchronous. No async, no loading states, no API calls.

## Sharing Strategy

**URL query params** (not hash fragments).

```
https://freelens.app/?balance=8000&tax=25&runway=3
```

```js
// Sync on input change (debounced ~300ms)
function syncToURL(inputs) {
  const params = new URLSearchParams({ balance: inputs.balance, tax: inputs.taxRate, runway: inputs.runwayMonths });
  window.history.replaceState({}, '', `?${params}`);
}

// Decode on load
function readFromURL() {
  const p = new URLSearchParams(window.location.search);
  return {
    balance: parseFloat(p.get('balance')) || 0,
    taxRate: parseFloat(p.get('tax')) || 0,
    runwayMonths: parseInt(p.get('runway')) || 0,
  };
}
```

Use `replaceState` not `pushState` — every keystroke must not pollute browser history.

Validate decoded values through the same input validation path as user-typed values.

"Copy link" button: `navigator.clipboard.writeText(window.location.href)` — no library needed.

## Build Order

Build in dependency order. Each layer depends only on what's below it.

1. **Calculation Engine first.** Write `calculate()` and its test cases before touching the UI. If the math is wrong, everything else is wrong. Also forces clarity on whether the runway model needs a monthly burn input.
2. **Input Layer.** Wire fields to produce validated inputs object.
3. **State Container.** Connect inputs → engine → result. Calculator is functionally complete here.
4. **Display Layer.** Render the result. No new logic — formatting and layout only.
5. **URL Sync last.** Add after core loop is confirmed working. It's an enhancement. If it breaks, the calculator still works.

## Open Questions

- **Runway model:** Does `balance * (months/12)` resonate with freelancers, or do they need to input monthly spend? Most important unknown — changes input count and math.
- **Negative safe-to-spend:** What to show when tax + runway exceeds balance? Clamp to zero plus a warning message is the right default.
- **Locale:** If US-only in v1, `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` handles formatting with no library.
