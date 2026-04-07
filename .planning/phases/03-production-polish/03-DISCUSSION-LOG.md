# Phase 3: Production Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-07
**Phase:** 03-production-polish
**Mode:** discuss
**Areas discussed:** Validation trigger, Error copy (Dutch), Mobile: runway input, Locale format confirmation

## Areas Discussed

### Validation Trigger
| Question | User Selection |
|----------|---------------|
| When do error messages appear? | On blur only (not on every keystroke) |

### Error Copy (Dutch)
| Question | User Selection |
|----------|---------------|
| What Dutch copy for invalid states? | Calm / protective framing |

**User correction applied:** Added a soft warning for 0% tax rate. User specified that 0% is technically valid but produces a misleading result for any Dutch ZZP'er — a soft inline warning (not a hard error) should show. Exact copy confirmed: `"Controleer je belastingtarief — 0% is ongebruikelijk voor ZZP'ers."`

### Mobile: Runway Input
| Question | User Selection |
|----------|---------------|
| Runway input width on mobile? | Full-width, same as other inputs |

### Locale Format Confirmation
| Question | User Selection |
|----------|---------------|
| Confirm nl-NL (€3.200) or switch? | Confirmed nl-NL (€3.200) |

## Decisions Summary

| ID | Area | Decision |
|----|------|----------|
| D-01 | Validation trigger | On blur only |
| D-02 | Validation behavior | Reactive calc continues; error is a UI annotation |
| D-03 | Error clearing | Clears on next blur after correction |
| D-04 | Error: negative balance | "Vul een positief saldo in" |
| D-05 | Error: 0-month runway | "Voer minimaal 1 maand buffer in" |
| D-06 | Warning: 0% tax | Soft warning, not hard error: "Controleer je belastingtarief — 0% is ongebruikelijk voor ZZP'ers." |
| D-07 | Error display | Inline below input — no alert dialogs |
| D-08 | Runway input width | Full-width (remove w-24) |
| D-09 | Stepper buttons | No — keep consistent with other inputs |
| D-10 | Touch target | py-4 padding, full-width |
| D-11 | Locale format | nl-NL confirmed (€3.200) |
| D-12 | format.ts | No changes needed |
| D-13 | UX-04 status | Already satisfied by format.ts |

## No Corrections

All selections matched the calm/protective tone established in Phase 1 (D-08). One user addition (soft 0% tax warning) extended the scope of UX-01 beyond what was specified but within phase boundary.

## No Deferred Ideas

Discussion stayed within phase scope.
