# Features Research

**Project:** Freelens — Safe to Spend Calculator
**Confidence:** Table stakes HIGH, differentiators MEDIUM, anti-features HIGH

## Table Stakes

Features every calculator in this category must have. Missing any makes the product feel broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Instant client-side calculation | Any delay breaks the "try it" moment | Low | Pure JS, no backend |
| Single prominent output number | Users came for an answer; buried outputs create confusion | Low | One number, large, above the fold |
| Visible math breakdown | Freelancers distrust black-box numbers; they need to verify the logic | Low | Show: tax reserve + runway buffer + safe to spend |
| Plain-English labels | Financial jargon alienates creative freelancers | Low | "What this protects against" framing |
| Input validation and guardrails | Nonsense inputs produce nonsense outputs — must warn inline | Low | Inline error copy, not alert dialogs |
| Mobile-responsive layout | ~60% of casual tool visits are mobile; broken mobile kills trust | Low | CSS only, no behavior changes |
| Zero-friction load (no login, no spinner) | Any friction before the value moment destroys conversion | Low | Static page, no backend needed |
| Shareable URL with encoded inputs | "Send to your accountant" is a natural use case and free distribution | Low-Med | Query string params encode inputs |

## Differentiators

Features that create "this tool actually gets me" moments. Not expected, but valued when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Slow-period framing in the breakdown | Names the anxiety the number protects against: "This runway buffer means you can go 3 months with $0 income." | Low | Copy, not engineering |
| Pre-populated tax rate with rationale | Default of 25–30% with a one-liner why — removes the "I don't know my rate" blocker | Low | Static; region-agnostic to start |
| Runway as a slider, not just text input | Makes the spending/safety tradeoff feel interactive | Low | Range input, same underlying logic |
| Verbal output alongside the number | "You can safely spend $3,200. That leaves 4 months of runway and covers your estimated taxes." | Low | Template string off the calculation |
| Visible honesty about what the tool doesn't know | "This doesn't account for upcoming invoices or known expenses" — builds trust by acknowledging limits | Low | Copy only |
| Copy-friendly output for sharing | Pre-formatted text snippet to paste into a message to a partner or accountant | Low | Single button, template string |

**Strongest differentiator to include in v1:** Verbal output. One sentence in plain English. This is copy work, not engineering, and it's the clearest signal the product understands the user's situation rather than just running math.

## Anti-Features (v1)

Build none of these.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Bank account sync / Plaid | OAuth + backend + privacy overhead — all before core output is validated | Let users type their balance. Sync is a v2 question. |
| Login / accounts / saved state | Destroys the "try it in 10 seconds" moment | Shareable URL covers the "come back to it" case |
| Multiple outputs (projections, cash flow) | Each additional output competes with the primary one | One output. Let user feedback drive what comes next. |
| Income inputs (monthly, annual) | Adds ambiguity (gross? net? average?). Balance-based model sidesteps this. | Keep inputs to: balance, tax rate, runway. |
| Expense tracking | This is bookkeeping. Completely different job. | Stay out of bookkeeping market in v1. |
| Tax bracket / jurisdiction logic | Accurate tax requires jurisdiction, filing status, deductions — a rabbit hole | User-entered effective rate is simpler and more trusted. |
| Charts and visualizations | Visual complexity without improving the core decision | Plain numbers with clear labels. |
| Freemium gate | Kills word-of-mouth before value is proven | Free, no gate. Validate first. |
| Social proof / testimonials in v1 | You don't have real ones yet. Creative freelancers spot manufactured credibility. | Ship without. Add real quotes after users respond. |

## Feature Dependencies

```
Shareable URL → inputs encoded in query string params
Verbal output → core calculation (safe to spend number)
Slow-period framing → verbal output (uses the same number)
Copy-friendly output → verbal output (formats same string)
Pre-populated tax rate default → input validation guardrails
Runway slider → no additional logic; same calculation as text input
```

No circular dependencies. All differentiators layer on top of table stakes.

## Open Questions

- Do freelancers self-report tax rate accurately enough, or do they need a guided estimate?
- Is the "slow-period framing" copy more effective as part of the breakdown or as a separate callout?
- Does the verbal output increase trust or feel patronizing to financially literate freelancers?
