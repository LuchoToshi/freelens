# Freelens Claude Code Master Prompt

## How to use this

1. Open Terminal and run:

   ```bash
   cd ~/Developer/freelens
   claude
   ```

2. Switch Claude Code to **Plan mode** with `Shift+Tab` before pasting the prompt.
3. Paste everything between **MASTER PROMPT START** and **MASTER PROMPT END**.
4. Review Claude's plan before allowing edits. Keep approval mode on; do not use `--dangerously-skip-permissions`.

---

# MASTER PROMPT START

You are acting as a senior product designer, design-systems lead, motion designer, accessibility specialist, and frontend engineer working on Freelens.

Your task is to implement a complete visual and UX elevation of the existing Freelens landing page and calculator app for design-conscious Dutch creative freelancers, while preserving the product's current financial correctness, privacy model, cautious claims, and accessibility baseline.

Do not jump straight into coding. Follow the Explore -> Plan -> Code -> Verify -> Review -> Commit loop described below.

## 1. First: read and understand the existing project

Before proposing changes:

1. Read `CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md`, `README.md`, `package.json`, and all relevant design, app, component, styling, test, and domain files.
2. Inspect the full application structure and identify:
   - Landing-page sections and shared layout components.
   - The `/tool` shell and its four modes: Overview, Money arrived, Weekly check-in, and Check a decision.
   - The `/accuracy` page.
   - Typography, color tokens, spacing, breakpoints, motion, and reusable components.
   - Financial/domain logic and tests that must remain untouched.
   - Persistence and localStorage behavior that must remain untouched.
3. Run the current targeted tests, lint, typecheck, and production build to establish a clean baseline.
4. Capture or inspect the current UI at approximately 1440 px desktop and 375 px mobile.
5. Read the design audit and user draft notes if your environment can access them:
   - `/Users/shariffshariff/Library/Application Support/Clicky/projects/freelens-design-audit/output/reports/freelens-design-audit/Freelens-Design-UX-Audit.md`
   - `/Users/shariffshariff/Library/Application Support/Clicky/projects/freelens-design-audit/output/reports/freelens-design-audit/user-provided-notes.txt`

If an external audit file is inaccessible, continue using the complete requirements in this prompt. Do not block on it.

## 2. Product and audience context

Freelens is a planning and allocation product for Dutch freelancers and ZZP'ers. It helps users separate VAT, protect an income-tax/Zvw reserve, cover business costs, understand runway, evaluate a purchase, and see what may be available for personal payout.

It is not a final tax calculator and must never imply that it calculates a user's final tax bill. It is a cautious planning tool, not tax advice.

The core audience is creative freelancers, including:

- Creative directors
- Photographers
- Videographers and video editors
- DJs and music professionals
- Models
- Hairdressers and stylists
- Dancers and performers
- Designers, makers, and other independent creatives

These users value aesthetics and beautiful tools. The current product is calm, responsible, legible, and trustworthy, but it still feels too much like a well-designed banking or bookkeeping form. The redesign must feel dynamic, editorial, tactile, distinctive, and culturally relevant to creative work without making the numbers harder to understand.

## 3. Design north star

Use this principle to judge every decision:

> An editorial creative studio on the outside, a precise permission machine on the inside.

The surrounding experience may be expressive, cinematic, colorful, and alive. Inputs, calculations, labels, financial results, warnings, and trust information must remain stable, exact, readable, and calm.

The emotional payoff is not "calculation complete." It is:

> I know what I can safely do next.

## 4. Non-negotiable constraints

### Financial and product integrity

- Do not change financial formulas, calculation behavior, reserve logic, VAT logic, domain types, fiscal assumptions, migrations, or existing tested outcomes unless I explicitly approve a separate financial change.
- Do not rename a reserve percentage or estimate in a way that implies a final tax calculation.
- Preserve the cautious language: planning estimate, not tax advice, and not a final assessment.
- Preserve all existing tax-year/reference-value behavior and official-source links.
- Preserve the app's current routes and core user journeys.

### Privacy and architecture

- Preserve the local-first privacy model.
- Do not add accounts, authentication, a backend, bank connections, tracking, analytics, third-party data collection, or uploads.
- User numbers must continue to stay in the browser/on the device.
- Preserve SSR safety, hydration safety, persistence behavior, and localStorage migration behavior.

### Accessibility

- Preserve or improve WCAG 2.1 AA compliance.
- Maintain visible keyboard focus for every interactive element.
- Do not use color as the only communication channel.
- Keep semantic HTML, accessible names, tab roles, labels, error messages, and live-region behavior correct.
- Respect `prefers-reduced-motion` globally.
- Keep interactive controls usable at 200% zoom and increased text size.
- Aim for at least 44 px touch targets for important mobile controls and links.
- Ensure animation never delays or hides the current financial value.

### Responsive and performance

- Design and test mobile at 375 px, plus a narrow 320 px sanity check.
- No horizontal overflow.
- The creative visual direction must not become noisy or illegible on mobile.
- Avoid large client-side performance regressions.
- Optimize hero media for LCP and use responsive images.
- Lazy-load below-the-fold media and expensive effects.
- Any 3D or continuous motion must have a lightweight mobile/reduced-motion fallback.
- Do not add a new dependency unless it materially improves the implementation and you explain why the existing stack cannot handle it.

### Visual integrity

- Avoid generic fintech imagery, stock photos of laptops and coffee, piggy banks, coins, calculators, bank buildings, dashboards-for-dashboard's-sake, neon crypto aesthetics, or generic AI gradients.
- Avoid turning every section into a rounded white card.
- Do not sacrifice clarity for decoration.
- Use real creative-work references and specific project language, but do not introduce unlicensed production assets. If final assets are unavailable, build a clear placeholder system and provide an asset brief.

## 5. Working method and approval gates

Do not implement everything in one uncontrolled pass.

### Step A - Explore and report

After reading the code, give me:

1. A concise map of the relevant files and components.
2. The current design system and where it is defined.
3. Any technical risks or coupling with financial logic.
4. Existing dependencies that can support the work, especially Framer Motion or current animation utilities.
5. The exact validation commands you intend to run.

### Step B - Propose the implementation plan

Create a phased plan using the phases below. For each phase, list:

- User-facing outcome
- Components/files likely to change
- Reusable primitives to create
- Accessibility considerations
- Mobile behavior
- Tests or validation
- Risk level

Then stop and wait for my approval before editing files.

### Step C - Implement one approved phase at a time

For every phase:

1. Make focused, minimal changes consistent with the existing code style.
2. Do not modify unrelated code.
3. Show a concise summary of what changed.
4. Run the most relevant tests and checks.
5. Perform desktop and 375 px visual QA.
6. Show `git diff --stat` and call out any unexpected changes.
7. Stop for my review before beginning the next phase.

Do not push, deploy, merge, or commit without my explicit approval. When a phase is ready, propose one clear commit message so I can approve a commit-per-phase workflow.

## 6. Required visual system

### Typography

- Keep the existing Fraunces and Geist pairing unless inspection reveals a compelling technical reason not to.
- Use Fraunces for major brand moments, emotionally important headlines, large result numbers, and selected oversized labels.
- Use Geist for controls, supporting copy, dense information, helper text, and financial detail.
- Increase the scale contrast between expressive headlines/results and utility text.
- Use tabular numerals for financial values so animated or changing amounts do not jump horizontally.
- Keep explanatory copy at readable line lengths.

### Color

Retain the existing deep navy and warm off-white canvas as the trust foundation. Build a controlled functional palette for allocation and mode identity.

The exact final hex values should be derived and contrast-tested in the codebase, but the semantic mapping should be:

- VAT: warm gold
- Income-tax/Zvw reserve: blue or indigo
- Business costs: terracotta
- Personal payout: green
- Decision/forecast state: violet or coral

Use saturated colors for active states, allocation segments, and intentional section fields. Use quiet tints for backgrounds. Keep the same semantic color meaning everywhere.

### Surfaces and depth

- Define three primary levels: canvas, working surface, highlighted result stage.
- Reduce repeated white bordered cards.
- Use larger radii selectively for interactive/result objects, not every section.
- Use soft shadows rarely. Prefer composition, contrast, overlap, and color for depth.

### Controls

- Create clear resting, hover, focus, selected, valid, warning, and disabled states.
- Selected states must use at least two cues, such as fill plus border or fill plus icon.
- Add a visible focus ring or restrained accent glow with sufficient contrast.
- Keep destructive actions, including clearing saved data, in a secondary settings/privacy area.

### Motion grammar

Create reusable motion tokens/variants rather than bespoke animations everywhere:

- Arrive: 350-500 ms ease-out with a slight upward settle.
- Allocate: 500-700 ms spring as money divides into segments.
- Protect: a short snap/lock motion for VAT and reserve.
- Permission: the personal payout value settles last and receives the strongest emphasis.
- Navigate: a shared-axis transition between calculator modes.

Reduced-motion mode must use instant state changes or restrained opacity transitions. Financial values must be correct immediately, regardless of animation.

## 7. Signature reusable components to create

Build these as reusable primitives where appropriate rather than one-off page code:

### A. Signature allocation bar

- Replace the current thin line with a 24-40 px tall segmented allocation object.
- Use the same semantic order and color mapping everywhere.
- Animate segments into place when values change.
- Reveal label, percentage, and euro amount on hover, keyboard focus, or tap.
- Provide a text/legend equivalent and never rely on color alone.
- Use it on the landing-page preview, Money arrived, Overview, Weekly check-in where useful, and decision/result states where it clarifies consequences.
- Ensure zero-value and tiny-segment states remain understandable.

### B. Animated financial number

- Create a reusable count-up/spring result component for emotionally important numbers.
- It must preserve tabular numerals and locale formatting.
- It must not announce every animation frame to assistive technology.
- In reduced-motion mode, update immediately.

### C. Confidence block

- Consolidate repeated fine-print-style disclaimers into a warm, designed trust component.
- Use a small shield/lock/info mark, one warm plain-language sentence, and optional expandable detail.
- It should frame transparency and local privacy as product features, not legal noise.
- Do not remove necessary caveats.

### D. Mode card/tab

- Create accessible, reusable mode cards for the four calculator modes.
- Support icon, number, title, description, accent color, active state, hover, focus, and reduced-motion behavior.
- Preserve correct tab semantics and keyboard navigation.

## 8. Implementation phases

## Phase 1 - Design-system foundation and signature components

Implement the foundation before page-specific redesigns:

1. Extend or refine design tokens for functional colors, tints, spacing, type scale, focus, radii, surfaces, and motion.
2. Build the signature allocation bar.
3. Build the animated financial number.
4. Build the confidence block.
5. Build the reusable mode card/tab component.
6. Add reduced-motion behavior and accessible focus states.
7. Document usage rules briefly in the most appropriate existing design-system or project documentation file.

Acceptance criteria:

- Components are reusable and do not contain business logic.
- Semantic colors remain consistent.
- Keyboard and reduced-motion behavior work.
- Existing tests still pass.
- No route or calculation output changes.

## Phase 2 - Landing-page hero and first viewport

Redesign the hero to feel art-directed and immediately relevant to creative freelancers.

Required direction:

- Use a bold 55/45 or similarly asymmetric composition.
- Let the expressive side carry a full-bleed editorial image, short muted loop, or well-designed media placeholder showing a real creative at work: dancer, hairdresser, photographer, DJ, stylist, videographer, or similar.
- Keep the calculator/result card on a clean, highly legible surface that floats over or alongside the visual.
- Preserve the current trustworthy calculator example and values.
- Make the product result feel like a designed object rather than a small embedded widget.
- Keep the primary CTA dominant and "See how it works" secondary.
- Turn "Free to try. No account. Your numbers stay on this device." into a compact trust row or confidence treatment.
- On mobile, show the value proposition and product result before decorative media becomes a long scroll obstacle.
- Test at 375 px so the visual does not turn into background noise.

Living headline direction:

- Keep "Money arrived" or the core promise stable.
- Use a masked reveal or elegant word-swap for creative contexts such as:
  - From a shoot.
  - From a gig.
  - From a client.
  - From a campaign.
  - From a production day.
- Resolve to or retain "Know what happens next."
- Do not use a typewriter effect.
- Keep the static/reduced-motion version equally strong.

Preserve the meaning of the current copy:

- For Dutch freelancers and ZZP'ers
- Money arrived. Know what happens next.
- Freelens helps you separate VAT, protect a tax reserve, cover business costs, and see what may be available to pay yourself.
- Process a payment
- See how it works
- Free to try. No account. Your numbers stay on this device.

Do not rewrite final product claims without presenting the proposed copy change for approval.

## Phase 3 - Landing-page story, privacy, FAQ, CTA, and footer

Turn the long landing page into an editorial sequence rather than a stack of similarly weighted text sections.

### "Your bank balance is not your salary"

- Keep the strong message.
- Improve hierarchy and visual explanation.
- Use the allocation language to show what belongs to VAT, reserve, costs, buffer, and personal payout.

### "Every payment, given a job"

Transform the four steps into alternating editorial scenes with oversized numbering, bolder color fields, concise copy, and a visual demonstration:

1. Money arrives: a payment enters and divides into jobs.
2. Weekly check-in: protected money and runway settle into a calm overview.
3. Check a decision: a planned purchase changes the runway before approval.
4. Peace of mind: the allocation system locks into place.

### Privacy section

- Keep "Your financial data never leaves your browser" as a major trust moment.
- Add a visual concept such as a closed local loop, device orbit, or numbers visibly remaining inside the browser/device.
- Keep the section calm and premium, not technical or frightening.

### Accuracy and caveat section

- Use the confidence block.
- Keep necessary cautious language and link to the accuracy page.

### FAQ

- Reduce the long home-page footprint.
- Group questions into "Your number," "VAT and reserve," and "Privacy and safety."
- Show the most important questions first and move the full source library to the accuracy page where appropriate.
- Preserve all valuable content and routes.

### Closing CTA and footer

- Create a full-width color-band closing moment.
- Use an oversized Freelens wordmark, a concise trust line, and one clear CTA.
- Make it feel like the final page of a creative portfolio, not dead space.

## Phase 4 - Calculator app shell and Overview

Redesign the `/tool` shell so it feels like a creative operating system rather than a settings page.

### Four modes

Turn the four existing modes into bold, differentiated portfolio-style cards:

- 01 Overview: deep navy; compass/horizon concept.
- 02 Money arrived: warm amber; incoming pulse concept.
- 03 Weekly check-in: green; rhythm/calendar concept.
- 04 Check a decision: violet or coral; fork/scale concept.

Requirements:

- Each mode has its own accent, number, concise title, helper line, and restrained animated icon/mark.
- Desktop may use a horizontal portfolio strip or left rail, based on the existing layout.
- Mobile should use a compact 2x2 card grid or an accessible sticky mode switcher if that is clearly more usable.
- Preserve correct ARIA tab semantics and keyboard navigation.

### Overview empty state

- Replace the settings-page feeling with a visually rewarding sample state clearly labeled as an example.
- Keep setup and process-payment actions obvious.
- Move "Clear saved data" away from the primary flow into settings/privacy.
- Use the confidence block for privacy and planning caveats.

### Overview populated state

Lead with:

1. May be available to pay yourself - hero number.
2. Protected - VAT and reserve.
3. Runway - months and direction.
4. Next best action - process a payment, top up reserve, or hold a purchase.

The screen should feel like opening a calm, beautifully designed studio control panel.

## Phase 5 - Money arrived flow

This is the product's strongest emotional moment and should receive the highest interaction quality.

### Layout

- On desktop, create a two-column stage: inputs on the left and a sticky live result canvas on the right.
- Visually distinguish the result stage with a controlled color field or elevated surface.
- On mobile, stack logically and keep a compact result summary close to the field being edited. Consider a sticky/collapsible summary only if it does not obscure inputs or the keyboard.

### Inputs

- Make the amount field large and prominent with an inline euro treatment.
- Give form sections more rhythm with stronger labels and generous spacing.
- Use Fraunces selectively for major field labels, not every helper line.
- Add soft, accessible accent focus states.
- Make "Includes VAT / Excludes VAT" a satisfying pill switch with a sliding/spring selected state.
- Keep the common VAT paths calm and obvious.
- Consider progressive disclosure for less common VAT treatments, but preserve every current option and accessible label.
- Keep optional business costs collapsed or visually secondary until requested.
- Use creative example labels such as "Editorial shoot," "Friday DJ set," or "Campaign deposit" only as examples/placeholders, never as stored defaults.

### Result hierarchy

- Make "Available for personal payout" or the current equivalent the emotional payoff.
- Use a much larger Fraunces number with tabular numerals and count-up/spring behavior.
- Animate the allocation bar first; settle the payout number last.
- Use plain-language labels such as protected, reserved, costs, and yours where fiscally accurate.
- Keep payment received, VAT, reserve, business costs, and payout fully readable.
- Preserve exact calculation results and formatting.
- Keep the confidence block nearby without visually competing with the result.

## Phase 6 - Weekly check-in

The current experience is accurate but too much like a series of zero-value financial fields.

Required changes:

- Create a short progress rhythm: Balance -> Protected -> Costs -> Buffer.
- Show useful visual feedback as the user types.
- Add a calm runway visualization such as a horizon, stacked months, or similarly understandable treatment.
- Avoid a generic dashboard gauge if it does not improve comprehension.
- Keep the 1/2/3/6 month buffer choices accessible and clearly selected.
- End with one plain-language interpretation of the result, for example: "You have 2.4 months protected. A personal payout of X keeps you above your target," only when supported by the existing logic.
- Avoid red unless there is a genuinely urgent shortfall. Use text and iconography in addition to color.
- Keep the privacy and estimate explanation concise through the confidence block.

## Phase 7 - Check a decision

The pre-check-in state should not feel like a dead end.

Required changes:

- Explain the dependency visually: weekly position -> optional spending room -> decision.
- Show a small inline example rather than requiring a separate action to understand the feature.
- Preserve the option to complete a weekly check-in.
- In the populated state, use a simple purchase/decision card, before/after runway comparison, and a clear verdict such as "Fits," "Tight," or "Wait," only if those labels accurately map to existing logic.
- Pair every verdict color with text and an icon.
- Keep the first implementation focused; do not add multi-scenario comparison unless it falls naturally out of existing architecture and I approve it.

## Phase 8 - Accuracy and sources

Keep the page substantively conservative while improving information design.

Required changes:

- Add a plain-language top summary.
- Clearly separate:
  - What Freelens is.
  - What Freelens is not.
  - Calculation/reserve rules.
  - Reference values.
  - Official sources.
- Add a visible tax year and exact "last reviewed" date sourced from the existing data/content, not invented dynamically.
- Present source links as structured cards or rows showing what each source supports and the official publisher.
- Add clear states for verified/source-backed, context only, and needs annual review if those distinctions are supported by current content.
- Give "What Freelens is not" a designed caution treatment rather than one dense paragraph.
- Keep external links and mobile source rows comfortably tappable.
- Do not alter tax claims or source URLs without explicit approval.

## Phase 9 - Final integration and polish

After all approved phases:

- Check typography, spacing, surface treatment, radii, color meaning, focus behavior, and motion consistency across all pages.
- Remove redundant one-off styles and consolidate repeated patterns.
- Confirm the allocation bar and confidence block behave consistently everywhere.
- Confirm the footer and header feel coherent with the new system.
- Ensure the app still feels calm and trustworthy when animations are disabled.
- Ensure creative imagery never competes with numbers or controls.

## 9. Asset strategy

Do not silently choose generic stock imagery.

If final creative media is not already present:

1. Implement a structurally complete media component with an intentional temporary placeholder.
2. Create a concise asset brief specifying:
   - Subject and creative discipline.
   - Editorial composition.
   - Lighting and palette.
   - Required desktop/mobile crops.
   - Still, loop, and poster-frame requirements.
   - Rights/licensing requirements.
   - Performance budget.
3. Make the layout production-ready so the asset can be swapped without redesigning the page.

If a planned 3D element exists in the codebase, inspect it before deciding whether to use it. Do not add 3D merely because it is visually impressive. It must support the allocation concept and have a mobile/reduced-motion fallback.

## 10. Testing and verification requirements

Detect and use the project's actual package manager and scripts. At minimum, after relevant phases and at the end, run the equivalent of:

- Unit/domain tests
- Component tests where present
- Lint
- Typecheck
- Production build

Do not claim success if a command was not run. If a command fails for an unrelated pre-existing reason, report it separately and do not "fix" unrelated problems.

### Manual visual QA matrix

Test at minimum:

- Desktop around 1440 px.
- Mobile at 375 px.
- Narrow mobile at 320 px.
- Keyboard-only navigation.
- `prefers-reduced-motion: reduce`.
- 200% browser zoom.
- Long labels and wrapped copy.
- Empty/default state.
- Example state.
- Populated state where local test data or the app permits.

Check:

- No horizontal overflow.
- No clipped content.
- No unreadable text over images.
- No layout jumping when numbers update.
- No focus traps.
- No color-only meaning.
- No accidental changes to financial results.
- No hydration or console errors.
- No broken local persistence.
- No motion that makes editing harder.

### Accessibility validation

- Run the project's existing accessibility checks if available.
- If an automated accessibility tool is already installed, run it on `/`, `/tool` states, and `/accuracy` at desktop and mobile.
- Do not add a heavy testing dependency solely for this task without approval.
- Manually verify focus visibility, tab order, headings, form labels, error communication, contrast, and reduced motion.

## 11. Regression protection

Create or update tests only where they protect meaningful behavior introduced by the redesign.

Prioritize tests for:

- Allocation-bar segment calculation/render mapping without duplicating domain formulas.
- Accessible tab/mode behavior.
- Reduced-motion behavior where practical.
- Financial number formatting and immediate final value.
- Existing financial/domain outputs remaining unchanged.

Do not rewrite stable financial tests to match an accidental UI regression.

## 12. Definition of done

The redesign is done only when:

- The product no longer feels like a generic bank or bookkeeping form.
- The landing page visibly speaks to creative freelancers.
- The allocation bar is a memorable, repeated brand signature.
- The personal payout is the emotional and visual payoff.
- The four calculator modes feel distinct but part of one system.
- Forms feel tactile and premium without becoming confusing.
- Privacy and caveats feel like confident transparency, not fine print.
- The footer creates a strong final brand moment.
- Desktop and 375 px mobile both feel intentionally designed.
- Reduced-motion mode remains polished.
- WCAG AA is preserved or improved.
- All current financial behavior, privacy behavior, routes, persistence, and tests remain correct.
- Lint, typecheck, tests, and production build pass, except clearly documented unrelated pre-existing failures.
- No deployment, push, merge, or commit occurs without my explicit approval.

## 13. Your first response to this prompt

Do not edit code yet.

Your first response must contain only:

1. A concise summary of your understanding of the redesign goal.
2. The relevant codebase map and existing design-system findings.
3. The key technical and product risks.
4. A proposed phase-by-phase implementation plan.
5. The validation commands and QA approach.
6. Any decisions that genuinely require my input before implementation.

Then stop and wait for approval.

# MASTER PROMPT END

