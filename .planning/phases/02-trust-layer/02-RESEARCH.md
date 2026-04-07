# Phase 2: Trust Layer — Research

**Researched:** 2026-04-06
**Domain:** React component annotation — copy, sublabels, and static callout text in Tailwind CSS v4
**Confidence:** HIGH

---

## Summary

Phase 2 is a pure annotation phase. No new logic, no new files, no new state. Every change is a copy addition to `Calculator.tsx`: one `<p>` below the slider, two `sublabel` props on existing `BreakdownRow` calls, and one `<p>` below the breakdown. The BreakdownRow component needs one optional prop added (`sublabel?: string`), and its layout needs a minor adjustment so the value column aligns to the label row (not the sublabel row) when a sublabel is present.

The only technically interesting decision is the BreakdownRow layout change. The current implementation uses `items-baseline` on the row container. Adding a sublabel introduces a two-line left column, which breaks the baseline alignment assumption — the value will align to the label, not the sublabel. This needs `items-start` on the row container, not `items-baseline`, once sublabels are introduced on any row.

The runway buffer sublabel is dynamic: `"Covers ${runwayMonths} months if work goes quiet"`. The `runwayMonths` value is already in component scope as a `useState` variable — no prop threading or new state needed.

**Primary recommendation:** One task: add the sublabel prop to BreakdownRow, fix the alignment, insert the three copy additions in Calculator.tsx, verify in browser.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Sublabels are always visible — small muted text under each label, no hover/tap interaction required
- **D-02:** Use protects-against framing — each sublabel says what the number guards against
- **D-03:** Copy targets:
  - Tax reserve → "Set aside in case your tax bill hits"
  - Runway buffer → "Covers [N] months if work goes quiet" (N = runwayMonths, dynamic)
  - Balance → no sublabel
  - Safe to spend → no sublabel
- **D-04:** Sublabels render as 14–16px muted text below the label, within the existing BreakdownRow layout
- **D-05:** Tax guidance always shows below the slider — not conditional
- **D-06:** Copy: "Typical Dutch ZZP'ers: 25–35% after deductions"
- **D-07:** Replaces US-specific text from REQUIREMENTS.md — Dutch target market applies
- **D-08:** First-market focus is Dutch creative freelancers (ZZP'ers)
- **D-09:** Tax rate slider default remains 30%
- **D-10:** Currency formatting deferred to Phase 3
- **D-11:** Limits callout implemented per spec: "This doesn't account for upcoming large expenses or invoices not yet in your balance"
- **D-12:** Tone: calm and factual, no alarm styling

### Claude's Discretion

- Sublabel text size: 12–13px muted (zinc-400 or zinc-500), sitting below the label within each BreakdownRow
- BreakdownRow component: add optional `sublabel` prop — only rendered when provided
- Runway buffer sublabel: inject `runwayMonths` dynamically
- Limits callout styling: consistent with Phase 1 over-reserved message style — 14px, zinc-700, no border or background box

### Deferred Ideas (OUT OF SCOPE)

- EUR locale formatting (nl-NL vs en-NL) — Phase 3 UX-04
- Limits callout placement discussion — implement per spec, revisit only if visual testing reveals issues
- TRUST-04 (verbal output sentence) — v2
- TRUST-05 (tax estimation modal) — v2
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRUST-01 | Tax rate slider includes inline guidance for Dutch ZZP'ers | Static `<p>` element inserted below `<input type="range">` in Calculator.tsx. No logic needed — always visible. Copy locked in D-06. |
| TRUST-02 | Each breakdown line has a plain-English sublabel explaining what it protects against | `BreakdownRow` gets optional `sublabel?: string` prop. Two call sites pass it (Tax reserve, Runway buffer). Runway buffer value is dynamic from `runwayMonths` state. |
| TRUST-03 | Calculator displays an honest limits callout about what it doesn't account for | Static `<p>` element inserted after the breakdown section, before the closing card div. Always visible. Copy locked in D-11. |
</phase_requirements>

---

## Standard Stack

No new dependencies. Phase 2 uses what Phase 1 already installed.

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| React 19 | 19.x | Component rendering | Already installed [VERIFIED: codebase] |
| TypeScript 5 | 5.x | Type safety | Already installed [VERIFIED: codebase] |
| Tailwind CSS v4 | 4.x | Utility styling | Already installed [VERIFIED: codebase] |

**Installation:** None required.

---

## Architecture Patterns

### What Phase 2 Touches

Only one file changes: `src/components/Calculator.tsx`.

Three insertion points:

1. **Below the tax rate `<input type="range">` (line ~68):** Add `<p>` with tax guidance text
2. **BreakdownRow component definition (line 135+):** Add optional `sublabel?: string` prop, update layout, render sublabel when provided
3. **BreakdownRow call sites (lines 109–111):** Pass `sublabel` prop to Tax reserve and Runway buffer rows
4. **After the breakdown section, before closing card div (line ~129):** Add `<p>` limits callout

### BreakdownRow Layout Fix

Current implementation:

```tsx
// VERIFIED: src/components/Calculator.tsx:145
<div className="flex items-baseline justify-between">
  <span className="text-[14px] leading-[1.5] text-[#3F3F46]">{label}</span>
  <span ...>{value}</span>
</div>
```

`items-baseline` aligns the value to the text baseline of the label. This works fine with a single-line left column. When a sublabel is added (two lines in the left column), `items-baseline` aligns the value to the sublabel's baseline — visually wrong.

**Fix:** Change `items-baseline` to `items-start` on the row container. The value stays top-aligned with the label, which is correct. [VERIFIED: Tailwind CSS v4 flex alignment behavior — standard CSS]

Updated BreakdownRow:

```tsx
// Source: derived from Calculator.tsx:135 + UI-SPEC.md layout contract
function BreakdownRow({
  label,
  value,
  computed,
  sublabel,
}: {
  label: string;
  value: string;
  computed: boolean;
  sublabel?: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-[14px] leading-[1.5] text-[#3F3F46]">{label}</span>
        {sublabel && (
          <span className="text-[13px] leading-[1.4] text-[#A1A1AA]">{sublabel}</span>
        )}
      </div>
      <span
        className={`text-[14px] leading-[1.5] ${computed ? 'text-[#3F3F46]' : 'text-[#A1A1AA]'}`}
      >
        {value}
      </span>
    </div>
  );
}
```

Key choices:
- `gap-1` = 4px (xs token from UI-SPEC spacing scale) between label and sublabel [VERIFIED: 02-UI-SPEC.md spacing scale]
- `text-[13px]` (within the 12–13px discretion range from CONTEXT.md)
- `text-[#A1A1AA]` = zinc-400 (muted text color from design system) [VERIFIED: 02-UI-SPEC.md color table]
- The existing call sites (Balance, Safe to spend) pass no `sublabel` — they render identically to Phase 1

### Tax Guidance Insertion

```tsx
// Source: 02-CONTEXT.md D-05, D-06 + 02-UI-SPEC.md component spec
<input
  id="taxRate"
  type="range"
  ...
/>
<p className="mt-1 text-[16px] leading-[1.5] text-[#3F3F46]">
  Typical Dutch ZZP'ers: 25–35% after deductions
</p>
```

`mt-1` = 4px (xs) margin-top, as specified in UI-SPEC. [VERIFIED: 02-UI-SPEC.md component spec]

### Limits Callout Insertion

```tsx
// Source: 02-CONTEXT.md D-11, D-12 + 02-UI-SPEC.md component spec
{allInputsValid && result.isOverReserved && (
  <p className="mt-2 text-[14px] leading-[1.5] text-[#3F3F46]">
    Your tax reserve and runway buffer use up your full balance. Nothing left to spend freely.
  </p>
)}
<p className="mt-4 text-[16px] leading-[1.5] text-[#3F3F46]">
  This doesn't account for upcoming large expenses or invoices not yet in your balance.
</p>
```

`mt-4` = 16px (md token). [VERIFIED: 02-UI-SPEC.md spacing scale, "Margin-top: 16px (md) above the callout"]

The limits callout is always visible — not conditional on `allInputsValid`. [VERIFIED: 02-UI-SPEC.md interaction contract]

### Runway Buffer Sublabel — Dynamic Value

`runwayMonths` is already in scope as a `useState` variable at the top of the Calculator component. The sublabel uses it directly via template literal:

```tsx
// Source: 02-CONTEXT.md D-03, specifics section
sublabel={`Covers ${runwayMonths} months if work goes quiet`}
```

No prop threading, no derived state, no memoization needed. [VERIFIED: Calculator.tsx line 9]

---

## Don't Hand-Roll

No external problems to solve in this phase. Everything is HTML + Tailwind CSS.

---

## Common Pitfalls

### Pitfall 1: items-baseline breaks with multi-line left column
**What goes wrong:** The value column aligns to the sublabel baseline instead of the label baseline — visually the value "drops" on rows with sublabels.
**Why it happens:** `items-baseline` picks the deepest text baseline in a flex container. Adding a sublabel makes the left column two lines tall, so the deepest baseline is the sublabel's.
**How to avoid:** Switch BreakdownRow container to `items-start`. Wrap label + sublabel in a column div. Value stays top-aligned.

### Pitfall 2: Sublabel visible even when value shows "—"
**What goes wrong:** Hiding the sublabel when the value is `—` seems logical but is explicitly not correct — D-01 says sublabels are always visible.
**Why it happens:** Developer instinct to suppress copy when values are unavailable.
**How to avoid:** Sublabel renders unconditionally when the prop is provided. No visibility logic tied to `computed` or `hasBalance`.

### Pitfall 3: Using hover or tooltip for sublabels
**What goes wrong:** Implementing sublabels as tooltip or on-hover text to save visual space.
**Why it happens:** Copy visible at all times feels "crowded" to some developers.
**How to avoid:** D-01 explicitly locks always-visible. Trust the design — the sublabels are short and muted enough to not compete.

### Pitfall 4: Limits callout conditionally rendered
**What goes wrong:** Wrapping the callout in `{allInputsValid && ...}` so it only shows when the calculator has output.
**Why it happens:** Looks cleaner in the empty state.
**How to avoid:** UI-SPEC interaction contract says "limits callout still visible below" even in the over-reserved state. Callout is always present.

---

## Code Examples

### Final BreakdownRow call sites

```tsx
// Source: 02-UI-SPEC.md component inventory
<BreakdownRow label="Balance" value={displayBalance} computed={hasBalance} />
<BreakdownRow
  label="Tax reserve"
  value={displayTaxReserve}
  computed={hasBalance}
  sublabel="Set aside in case your tax bill hits"
/>
<BreakdownRow
  label="Runway buffer"
  value={displayRunwayBuffer}
  computed={hasExpenses}
  sublabel={`Covers ${runwayMonths} months if work goes quiet`}
/>
```

---

## Runtime State Inventory

Not applicable. Phase 2 is a pure front-end annotation change. No stored data, services, OS registrations, secrets, or build artifacts are affected.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 2 has no external dependencies beyond the project's existing React/Vite/Tailwind stack, which is already installed and verified from Phase 1.

---

## Validation Architecture

No test suite exists for this project per CLAUDE.md ("Don't set up a test suite for a validation prototype"). Validation for this phase is visual/manual:

- Load the calculator in browser
- Confirm tax guidance text appears below the slider
- Confirm Tax reserve and Runway buffer rows show sublabels
- Confirm sublabels remain visible when inputs are empty (values show "—")
- Change Runway Months input — confirm sublabel updates dynamically
- Confirm limits callout appears below the breakdown at all times
- Confirm Safe to spend and Balance rows have no sublabels

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `items-start` correctly top-aligns the value column to the label when sublabel is present | Architecture Patterns | Minor visual misalignment — fix is trivial |

All other claims are verified directly from the codebase or locked CONTEXT.md decisions.

---

## Open Questions

None. All three requirements have locked copy, locked placement, and clear implementation paths verified against the existing code.

---

## Sources

### Primary (HIGH confidence)
- `src/components/Calculator.tsx` — verified component structure, prop signatures, existing Tailwind classes, state variable names
- `.planning/phases/02-trust-layer/02-CONTEXT.md` — locked decisions D-01 through D-12
- `.planning/phases/02-trust-layer/02-UI-SPEC.md` — verified spacing, typography, color, and component layout contract

### Secondary
- `.planning/phases/01-calculation-engine/01-CONTEXT.md` — tone decisions (D-08) that carry forward

---

## Metadata

**Confidence breakdown:**
- What to build: HIGH — context is fully specified, code is readable, no ambiguity
- How to build it: HIGH — verified against actual Calculator.tsx implementation
- Pitfalls: HIGH — items-baseline issue is a standard CSS behavior, verified

**Research date:** 2026-04-06
**Valid until:** Indefinite — this phase is closed-scope with locked decisions. No external dependencies to go stale.
