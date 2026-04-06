# Phase 2: Trust Layer - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Add the copy, guidance, and callout that make the calculator number feel credible. Three requirements: tax guidance under the slider (TRUST-01), plain-English sublabels on each breakdown line (TRUST-02), and a visible callout about what the calculator doesn't account for (TRUST-03). No new inputs, no new outputs, no visual redesign — this phase adds trust copy on top of the Phase 1 component structure.

</domain>

<decisions>
## Implementation Decisions

### Breakdown Sublabels (TRUST-02)

- **D-01:** Sublabels are always visible — small muted text under each label, no hover/tap interaction required
- **D-02:** Use protects-against framing, not definition framing — each sublabel says what the number guards the freelancer against
- **D-03:** Copy targets:
  - **Tax reserve** → "Set aside in case your tax bill hits"
  - **Runway buffer** → "Covers [N] months if work goes quiet" (N = the runwayMonths input value, injected dynamically)
  - **Balance** → no sublabel needed
  - **Safe to spend** → no sublabel (the primary output needs no explanation)
- **D-04:** Sublabels render as body-sized (14–16px) muted text below the label, within the existing BreakdownRow layout

### Tax Rate Guidance (TRUST-01)

- **D-05:** Guidance always shows below the slider — not conditional on the slider value
- **D-06:** Copy: "Typical Dutch ZZP'ers: 25–35% after deductions"
- **D-07:** Replaces the US-specific requirement text ("Most US freelancers: 30–40%…") — the target user is Dutch creative freelancers

### Target Market

- **D-08:** First-market focus is Dutch creative freelancers (ZZP'ers) — copy, tax guidance, and framing should reflect the Dutch self-employment context throughout
- **D-09:** Tax rate slider default remains 30% (still appropriate: within the Dutch 25–35% range)
- **D-10:** Currency will need EUR formatting — note for Phase 3 (UX-04) that the locale should target nl-NL (€3.200 format) or en-NL (€3,200) — decision deferred to Phase 3

### Limits Callout (TRUST-03)

- **D-11:** This area was not discussed — implement per the requirements spec: visible callout below the result reading "This doesn't account for upcoming large expenses or invoices not yet in your balance"
- **D-12:** Tone: calm and factual, consistent with D-08 from Phase 1 (no alarm styling)

### Claude's Discretion

- Sublabel text size: 12–13px muted (zinc-400 or zinc-500), sitting below the label within each BreakdownRow
- BreakdownRow component: add optional `sublabel` prop — only rendered when provided
- Runway buffer sublabel: inject `runwayMonths` dynamically, e.g. "Covers 3 months if work goes quiet" — the number should reflect the actual input value
- Limits callout styling: consistent with Phase 1 over-reserved message style — 14px, zinc-700, no border or background box needed. A simple paragraph below the breakdown is fine.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/REQUIREMENTS.md` §Trust Layer — TRUST-01, TRUST-02, TRUST-03 (note: TRUST-01 copy is superseded by D-06 in this context file)

### Phase 1 foundation
- `.planning/phases/01-calculation-engine/01-CONTEXT.md` — Prior decisions including D-08 (calm tone), component patterns, and the BreakdownRow structure this phase extends
- `.planning/phases/01-calculation-engine/01-UI-SPEC.md` — Design system: spacing scale, typography roles, color palette. Body text role is reserved for Phase 2 trust copy.

### Project context
- `.planning/PROJECT.md` — Core value ("trust mechanism: transparency"), out-of-scope boundaries

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/Calculator.tsx:135` — `BreakdownRow` component takes `label`, `value`, `computed` props. Add optional `sublabel?: string` prop to support TRUST-02 sublabels without changing existing call sites.
- `src/lib/calculate.ts` — Pure calculation function. No changes needed for Phase 2.
- `src/index.css` — Tailwind v4 CSS file. Any new utility variants (e.g., custom slider styles) would go here.

### Established Patterns
- All styling via Tailwind CSS v4 utility classes directly — no component library
- Colors: zinc-400 (`#A1A1AA`) for muted text, zinc-700 (`#3F3F46`) for body/label text
- Typography: 14px labels, 16px body — trust copy uses body or label scale
- `useState` only — no external state needed for this phase

### Integration Points
- Phase 2 annotations live inside the existing Calculator.tsx component — no new files needed unless sublabel logic is extracted
- Tax guidance text sits directly below the slider's `<input>` element in the JSX
- Limits callout goes after the full breakdown section, before the component closes

</code_context>

<specifics>
## Specific Ideas

- Runway buffer sublabel should be dynamic: "Covers 3 months if work goes quiet" — not a static string. The 3 reflects the actual `runwayMonths` value.
- Dutch framing: "ZZP'ers" is the right term (not "freelancers") in the tax guidance copy — that's what Dutch self-employed people call themselves.

</specifics>

<deferred>
## Deferred Ideas

- EUR locale formatting (nl-NL vs en-NL) — deferred to Phase 3 (UX-04). Decision: pick up in Phase 3 context, which should clarify whether to use nl-NL convention (€3.200) or en-NL (€3,200).
- Limits callout placement discussion — not discussed. Implement per spec; revisit if visual testing reveals issues.
- TRUST-04 (verbal output sentence) and TRUST-05 (tax estimation modal) — v2 scope, not this phase.

</deferred>

---

*Phase: 02-trust-layer*
*Context gathered: 2026-04-06*
