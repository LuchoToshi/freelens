# Research Summary: Freelens

## Recommended Stack

React 19 + Vite 6 + TypeScript 5 + Tailwind CSS v4, deployed to Vercel. Bootstrap with `npm create vite@latest freelens -- --template react-ts`. No router, no state library, no component library — three `useState` calls and a pure calculation function is all this product needs.

## Table Stakes Features

- Instant client-side calculation (reactive, no submit button)
- Single prominent "safe to spend" number — large, above the fold
- Visible math breakdown: Balance → Tax Reserve → Runway Buffer → Safe to Spend
- Plain-English labels for each line item (no financial jargon)
- Input validation with inline error states (not alert dialogs)
- Mobile-responsive layout (test on a real device, not emulator)
- Zero-friction load — no login, no spinner, no backend
- Shareable URL with encoded inputs via query string params

## Key Differentiators to Include in v1

**Verbal output** — one sentence in plain English alongside the number: "You can safely spend $3,200. That leaves 4 months of runway and sets aside $1,800 for taxes." This is copy work, not engineering, and it's the clearest signal the product understands the user's situation rather than just running math.

**Tax rate slider with guidance** — replace free-form percentage input with a slider (15–50%) and inline reference: "Most US freelancers owe 30–40% total — income tax plus 15.3% self-employment tax." Prevents the most common silent error (users entering only their income tax bracket).

**Honest limits disclosure** — small callout: "This doesn't account for upcoming large expenses or invoices not yet in your balance." Builds trust by acknowledging what the tool doesn't know.

## Critical Pitfalls to Avoid

1. **Tax on full balance** — applying the rate to the entire balance over-reserves; money already taxed or saved shouldn't be included
2. **SE tax omission** — most US freelancers forget the 15.3% self-employment tax on top of income tax; a 25% rate is systematically under-reserved
3. **Runway model assumption** — `balance × (months/12)` assumes balance ≈ annual income; validate this framing in interviews before building
4. **Second output creep** — adding projections, savings rate, or cash flow before safe-to-spend is validated produces a product that's harder to explain and harder to learn from
5. **Opinion-based testing** — "Would you use this?" is not validation; the only signal that matters is a user acting on the number to make a real spending decision

## Architecture Decision

Five-component SPA: Input Layer → Calculation Engine (pure function) → State Container → Display Layer → URL Sync. Build the calculation engine and its tests first — before any UI. If the math is wrong, everything else is wrong. URL sync goes last; it's an enhancement, not a dependency.

The key unresolved architecture question: does `runwayBuffer = balance × (months/12)` resonate with freelancers, or do they need to input monthly burn directly? This changes the input count and formula shape. Resolve in user interviews before writing a line of code.

## Open Questions for User Testing

- Does `balance × (months/12)` make intuitive sense as a runway reserve, or do freelancers think in monthly burn rate?
- Do freelancers know their effective tax rate (including SE tax), or do they need guided estimation?
- Does the verbal output increase trust, or does it feel patronizing to financially literate users?
- What's the right framing for negative safe-to-spend (tax + runway exceeds balance)? What copy doesn't cause panic?
- Is the core anxiety moment "I have money and I'm afraid to spend it" universal to creative freelancers, or segment-specific?
