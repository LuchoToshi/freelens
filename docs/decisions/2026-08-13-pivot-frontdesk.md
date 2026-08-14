# Decision: Freelens is FrontDesk

**Date:** 2026-08-13
**Owner:** Shrf (decision) · Freelens Product Manager (record)
**Status:** Approved — in execution
**Review date:** 2026-09-13, or earlier if the concierge validation returns a kill signal

## Decision

1. **FrontDesk is the product.** AI reply-drafting for creative freelancers: a client submits an inquiry on the freelancer's public page, and a draft reply is generated in the freelancer's own voice for them to review and send.
2. **The calculator and everything tax-related is removed.** Routes /tarief, /tool, /rekentools, /offertes, /accuracy, /methodology; `lib/tax/` and the VAT/reserve/allocation domain; `config/countries/nl-2026.json`; tax test files; tax strings in the EN/NL dictionaries; NEEDS_VERIFICATION.md and OLD_VS_NEW.md. Removal ships as one reviewable PR — everything stays recoverable in git history.
3. **Target broadens from Dutch creative freelancers to creative freelancers generally.** EN/NL i18n stays (the Dutch market remains in scope, not exclusive); copy claiming Dutch specificity is rewritten; no architecture change.
4. **Rebooking stays** (private beta at /app, /try demo). It shares the inquiry→draft engine and users with FrontDesk, is publicly invisible (noindex), and carries the only designed validation experiment (rebooking-concierge, pre-agreed kill criterion). Revisit if it distracts from FrontDesk.

## Context

The repo (`~/Developer/freelens`) had drifted into three products: the original NL tax calculator (mature, tested, de-emphasized), FrontDesk (all recent work), and Rebooking (private beta). The pivot from calculator to FrontDesk had happened in practice — 17 straight commits — but was never recorded. The calculator's core value ("what can I safely spend today?") was validated only by secondary research; 0 of 10 planned interviews ever happened. FrontDesk is where founder conviction and momentum are.

## Alternatives considered

- **Keep the calculator alongside FrontDesk:** rejected — three products in one codebase and one nav dilute focus, and the tax engine carries a permanent NL-specific accuracy limitation and annual maintenance burden (yearly bracket updates) for a de-emphasized surface.
- **Cut Rebooking in the same sweep:** deferred — it is cheap to keep, invisible publicly, and its concierge experiment is the only designed validation of the inquiry→draft direction.

## Tradeoffs accepted

- ~Half the codebase (and its 439-case test suite's tax portion) is deleted; the sunk engineering is written off.
- The NL-specific trust surface (/accuracy, /methodology) goes with it; FrontDesk needs its own trust story.
- Broadening the audience weakens the sharp ICP that the earlier research was built on; validation (concierge experiment) now covers the broader target.

## What unblocks

- One product story: nav, landing, and copy all sell FrontDesk.
- The permanent tax-accuracy caveat disappears from the product.
- No more yearly tax-config maintenance.

## Execution

Phase 0: push main, back up research vault, this record. Phase 1: suite green, CI, Vercel env/alias check. Phase 2: tax-removal PR, copy broadening, branch pruning, smoke tests, baseline metrics, hero asset brief. Validation recruiting runs in parallel (drafts gated on Shrf sign-off before outreach).
