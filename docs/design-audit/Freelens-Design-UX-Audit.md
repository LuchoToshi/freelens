# Freelens Design and UX Audit

**Audience:** Dutch creative freelancers - creative directors, photographers, videographers, DJs, models, hairdressers, dancers, stylists, makers, and other independent creatives.

**Reviewed:** July 22, 2026  
**Scope:** Landing page, all four calculator views, accuracy page, desktop, and 375 px mobile.  
**Method:** Live-site walkthrough, full-page captures, interaction inspection, responsive checks, and automated WCAG A/AA scanning.

---

## Executive verdict

Freelens already succeeds at the difficult foundation: it feels calm, responsible, legible, and trustworthy. The product language is careful, the financial hierarchy is understandable, the privacy promise is strong, and the live pages produced no automated WCAG A/AA violations in the audited states.

But the visual experience currently says **"well-designed financial utility"** more than **"beautiful product made for creative people."** The interface is restrained almost everywhere: cream canvas, navy type, thin borders, white cards, small controls, and long text sections. That restraint builds trust, but there is not yet enough art direction, scale contrast, motion, tactility, cultural specificity, or visual surprise to make a photographer, DJ, stylist, or creative director feel that the product belongs in their world.

The goal should not be to turn Freelens into a loud design showcase. The strongest direction is:

> **An editorial creative studio on the outside, a precise permission machine on the inside.**

Keep the numbers quiet, exact, and trustworthy. Make the surrounding experience expressive, cinematic, tactile, and emotionally rewarding.

### Current experience scorecard

| Dimension | Score | Read |
|---|---:|---|
| Clarity and comprehension | 8/10 | The product purpose and calculations are understandable. |
| Trust and responsibility | 8.5/10 | Privacy, accuracy language, and cautious claims are strong. |
| Visual distinctiveness | 4/10 | The system is coherent but visually generic. |
| Creative-audience resonance | 3.5/10 | Little imagery, culture, movement, or self-expression. |
| Interaction delight | 3.5/10 | Most interactions feel functional rather than rewarding. |
| Mobile structure | 7.5/10 | No horizontal overflow at 375 px, but the experience is long and control-heavy. |
| Accessibility baseline | 8/10 | Automated WCAG A/AA scans passed; several touch targets still deserve improvement. |

---

## What currently feels like a bank form

1. **The visual vocabulary is almost entirely white cards, thin grey rules, navy buttons, and compact form controls.** This is safe, but it is also the same vocabulary used by bookkeeping tools, neobanks, and government portals.
2. **The hero calculator looks like an embedded widget rather than a signature product object.** It is small relative to the available canvas and does not create a memorable first impression.
3. **The app tabs behave like navigation controls, not creative workspaces.** Their equal white-card styling makes the four modes feel administrative and interchangeable.
4. **The payout - the emotional payoff of the product - is not dominant enough.** The user comes for permission and relief, but the result is visually close to the surrounding accounting detail.
5. **The allocation bar is too thin and passive.** It communicates proportion, but it does not feel tactile, ownable, or central to the brand.
6. **Long text blocks create a compliance rhythm.** The landing page is 4,605 px tall on desktop and 5,357 px at 375 px. Much of that length is useful, but the repeated text-first sections flatten momentum.
7. **The accuracy page is credible but reads like documentation.** It strengthens trust, yet it does not express the editorial quality of the rest of the brand.
8. **The empty states lead with setup and disclaimers rather than possibility.** The overview tells the user what the tool is, but does not immediately show the transformation or reward.

---

## The new design north star

### 1. Expressive frame, precise core

Use art direction, photography, oversized typography, bolder color fields, and motion around the experience. Keep inputs, calculations, labels, and financial output clean and stable.

### 2. Make allocation the brand

The segmented allocation bar should become the visual signature of Freelens. Use it in the hero, payment flow, overview, weekly check-in, decision check, loading states, and even subtle brand graphics.

### 3. Design for relief, not administration

The emotional moment is not "calculation complete." It is "I know what I can safely do next." Every result screen should culminate in an unmistakable permission moment.

### 4. Show creative life, not generic entrepreneurship

The product should visibly understand irregular project income: a shoot, a gig, a styling job, a campaign, a residency, a production day, a client deposit. Use real creative situations in imagery, microcopy, examples, and labels.

### 5. Motion should explain money

Animation should not be decorative noise. It should show allocation, protection, movement, and consequence: money arrives, segments slide into place, protected amounts lock, and the available number settles.

---

## Priority roadmap

## Quick wins - high impact, low effort

### Q1. Make the personal payout the visual climax

**Change:** Increase the result number substantially, isolate it with more whitespace, and animate it with a restrained spring/count-up when inputs change.

**Why it matters:** Creative freelancers do not emotionally buy a reserve calculator. They buy confidence and permission. The available-to-pay-yourself number is the product's reward.

**Pattern:** Small label, oversized Fraunces figure, one plain-language sentence: "This is the amount that may be yours to use." Keep reserve and VAT details secondary.

**Accessibility:** Respect `prefers-reduced-motion`; update the number without repeatedly announcing every animation frame to screen readers.

### Q2. Turn the allocation bar into a signature object

**Change:** Replace the thin line with a 24-40 px tall segmented bar with rounded ends, clear color ownership, and labels that reveal amounts on hover/focus/tap.

**Why it matters:** The current bar communicates data but does not create brand memory. A tactile bar makes the product feel designed rather than merely calculated.

**Pattern:** Segments slide from the payment total into VAT, reserve, business costs, and payout. Selected segments can lift by 2-4 px or glow subtly.

**Consistency rule:** The same colors and segment order must be used everywhere.

### Q3. Restyle disclaimers as a confidence block

**Change:** Replace repeated fine-print paragraphs with a calm, designed module using a small shield or lock symbol, one warm sentence, and an expandable "How this estimate works" detail.

**Why it matters:** Repetition makes the product feel legally defensive. The same information can increase trust when it is framed as transparency.

**Suggested copy:** "A planning estimate, never a hidden promise. Your numbers stay on this device."

### Q4. Strengthen focus and selected states

**Change:** Add a visible 2-3 px focus ring or soft brand-colored glow to inputs, toggles, links, and tab cards. Increase the visual contrast between selected and unselected controls.

**Why it matters:** A glowing, responsive field feels more tactile and premium. It also makes keyboard navigation clearer.

**Accessibility:** The ring must not rely on color alone and should maintain at least a 3:1 contrast against adjacent surfaces.

### Q5. Upgrade small mobile tap targets

**Change:** Increase the clickable height of header links, VAT pills, back links, source links, and destructive text actions to at least 44 px where practical.

**Finding:** At 375 px, several visible controls measure roughly 20-34 px high even though the layout has no horizontal overflow.

### Q6. Give the footer a real ending

**Change:** Replace the quiet footer with a full-width color band, oversized Freelens wordmark, concise trust line, and one primary action.

**Why it matters:** The current page fades out. A portfolio-like closing frame leaves the user with a stronger brand impression.

---

## Medium effort - structural design upgrades

### M1. Redesign the four app tabs as creative workspaces

**Current issue:** The four modes use similar white panels and text hierarchy, so they read as navigation rather than distinct jobs.

**Change:** Make them bold, color-coded cards with a number, short title, icon or abstract mark, and distinct active state.

**Example system:**

- **01 Overview:** deep navy / compass or horizon mark
- **02 Money arrived:** warm amber / incoming pulse
- **03 Weekly check-in:** green / rhythm or calendar mark
- **04 Check a decision:** violet or coral / fork or scale mark

On desktop, use a horizontal portfolio strip or left rail. On mobile, use a compact 2x2 card grid or a sticky bottom mode switcher instead of a long stack.

### M2. Build a two-column calculator stage

**Change:** On desktop, place inputs on the left and a sticky, live result canvas on the right. Let the result side have a stronger background or color field so it feels like a distinct stage.

**Why it matters:** The current form-and-result card still resembles a calculator. Separating "what I tell Freelens" from "what Freelens gives me" improves flow and makes the outcome feel more valuable.

**Mobile:** Stack inputs first, then show a sticky or collapsible result summary near the bottom so the payoff remains visible during editing.

### M3. Create expressive field components

**Change:** Use larger value fields, inline euro symbols, clear helper copy, and animated pills for VAT treatment. Reserve advanced VAT options behind progressive disclosure after the common 21%, 9%, and no-VAT choices.

**Why it matters:** The full VAT list is accurate but visually dense. Most users should see a calm common path, with complexity available when needed.

### M4. Turn the landing-page steps into an editorial sequence

**Change:** Replace the four similarly weighted text blocks with full-width, alternating scenes. Pair each step with a bold color, oversized number, short headline, and one visual demonstration.

**Examples:**

- Money arrives: a payment tile drops in and separates.
- Weekly check-in: reserves and runway settle into a calm dashboard.
- Check a decision: a purchase card moves the runway meter before approval.
- Peace of mind: the full allocation bar locks into place.

**Why it matters:** Creative audiences respond to visual narrative and sequencing. The current content is good, but it reads rather than performs.

### M5. Make privacy an art-directed feature

**Change:** Keep the dark privacy section, but give it a visual concept: a local-device orbit, a closed loop, or numbers visibly staying inside the browser frame.

**Why it matters:** "Your numbers never leave your browser" is both a trust claim and a differentiator. It deserves the same design emphasis as the payout.

### M6. Rework the FAQ into guided reassurance

**Current issue:** The large FAQ list contributes heavily to page length and creates a documentation feel.

**Change:** Group questions into three filters: "Your number," "VAT and reserve," and "Privacy and safety." Show the three most important by default and move the full library to the accuracy page.

### M7. Give the accuracy page an editorial trust system

**Change:** Introduce a clear top summary with "What Freelens does / does not do," a "Last reviewed July 2026" badge, and source cards grouped by topic.

**Pattern:** Each source card shows status, what it supports, official publisher, and a clear external-link treatment. Use callout colors sparingly: verified, context only, and needs annual review.

**Why it matters:** The current page is responsible but text-heavy. Better information design can make caution feel premium rather than bureaucratic.

---

## Larger redesign ideas

### L1. Art-direct the hero around real creative work

**Direction:** Use a full-bleed editorial photograph or short muted loop featuring a real creative at work - backstage, on set, in a salon, in a studio, at a console, or editing at night. Let the calculator card float over or beside the image on a clean surface.

**Avoid:** Generic stock images of laptops, invoices, coffee, or smiling office workers.

**Why it matters:** Recognition is immediate. The user should know within one second that Freelens is built for their kind of working life.

### L2. Add a living headline system

**Direction:** Keep "Money arrived" as the stable opening and rotate a second line with creative contexts:

- From a shoot.
- From a gig.
- From a client.
- From a campaign.
- From a production day.

Then resolve to: "Know what happens next."

Use a masked vertical reveal or word-swap, not a typewriter effect.

### L3. Create a Freelens motion grammar

Define reusable motion tokens rather than animating components independently:

- **Arrive:** 350-500 ms, ease-out, slight upward settle.
- **Allocate:** 500-700 ms spring as segments divide.
- **Protect:** short lock/snap motion for VAT and reserve.
- **Permission:** payout number settles last, with the strongest emphasis.
- **Navigate:** shared-axis transition between the four modes.

Always provide a reduced-motion version using opacity and instant state changes.

### L4. Build an identity around "every euro has a job"

Create a system of modular blocks, labels, stamps, and color fields inspired by production call sheets, gallery captions, booking labels, set lists, contact sheets, and studio tape - used subtly, not as decoration everywhere.

This gives Freelens a creative operating-system feel without sacrificing financial credibility.

### L5. Turn the overview into a beautiful weekly dashboard

After setup, the first screen should lead with:

1. **May be available to pay yourself** - the hero number.
2. **Protected** - VAT and reserve.
3. **Runway** - months and direction.
4. **Next best action** - process a payment, top up reserve, or hold a purchase.

The current welcome state explains the product, but the future state should feel like opening a well-designed studio control panel.

---

## Page-by-page recommendations

## Landing page

### Keep

- Fraunces + Geist pairing.
- Warm off-white canvas and deep navy trust color.
- Clear promise: "Money arrived. Know what happens next."
- Real calculator preview instead of an abstract product screenshot.
- Strong privacy and accuracy positioning.

### Change first

- Increase visual asymmetry and reduce the feeling of two small centered columns floating in a large blank field.
- Let either the creative image or the product result dominate the first viewport.
- Make the primary CTA more visually magnetic; keep "See how it works" clearly secondary.
- Move "Free to try. No account..." into a compact trust row with icons or status marks.
- Introduce one expressive visual move in every major section: image, animation, large color field, or product demonstration.
- Shorten the FAQ footprint on the home page.

### Hero composition recommendation

Use a 55/45 split. The expressive side can carry the creative image and oversized headline. The calculator card can overlap the boundary and use depth, blur, or a restrained shadow. On mobile, place the headline first, then the product result card, then the visual crop - do not make users scroll through decorative media before seeing the value.

## Tool shell and Overview

### Main issue

The tool is clear but visually closer to a settings page than a product people will enjoy returning to weekly.

### Recommendations

- Replace the repeated word "Freelens" heading with a more useful state headline.
- Make the four modes visually distinct and immediately scannable.
- Show a sample populated overview before setup, clearly labeled as an example.
- Turn "Set up Freelens" into a short guided sequence with progress and immediate visual reward.
- Move "Clear saved data" into a secondary settings/privacy area so it does not compete with the main journey.
- Keep the confidence block visible but compact.

## Money arrived

### Main issue

This is the strongest product moment, but the current form gives equal visual weight to setup details and the result.

### Recommendations

- Lead with the amount field at a larger scale.
- Make VAT inclusion a satisfying pill toggle with a sliding selected state.
- Put advanced VAT treatment in a visual picker or progressive disclosure.
- Keep optional business costs collapsed until requested.
- Use the label field to celebrate creative context: "Nikon campaign," "Friday DJ set," "Editorial shoot."
- Make the result panel sticky on desktop and visually dominant.
- Animate the allocation bar first and payout second.
- Use plain language next to numbers: protected, reserved, costs, yours.

## Weekly check-in

### Main issue

The page opens as a series of zero-value financial fields, which feels administrative.

### Recommendations

- Add a one-minute progress indicator: Balance -> Protected -> Costs -> Buffer.
- Show the runway visualization as the user types, not only after completion.
- Use a horizon, stacked months, or calm radial meter instead of another generic progress bar.
- End with one sentence that interprets the result: "You have 2.4 months protected. A personal payout of X keeps you above your target."
- Preserve the calm tone; avoid red unless there is a true urgent shortfall.

## Check a decision

### Main issue

Before a weekly check-in, the screen is mostly a dependency message and two buttons. It feels like a dead end.

### Recommendations

- Show a mini example inline rather than requiring a separate example action.
- Explain the dependency visually: weekly position -> spending room -> decision.
- After setup, use a simple purchase card, before/after runway comparison, and a clear outcome: "Fits," "Tight," or "Wait."
- Never use color alone for the verdict; pair color with text and an icon.
- Add an option to compare two decisions later, but keep the first version focused.

## Accuracy and sources

### Main issue

The page is strong in substance but weak in information hierarchy and scanability.

### Recommendations

- Add a plain-language summary at the top.
- Separate "calculation rules," "reference values," and "official sources" visually.
- Use cards or rows with source authority and review status.
- Show exact review date and tax year prominently.
- Give "What Freelens is not" a designed caution treatment instead of a long paragraph.
- Keep external source link targets at least 44 px high on mobile.

---

## Reusable design-system rules

### Typography

- Keep Fraunces for brand moments, major numbers, and emotionally important headlines.
- Keep Geist for labels, controls, explanation, and dense financial information.
- Use a larger contrast between display and utility text. The landing H1 is currently 48 px desktop / 36 px mobile; the tool H1 is 30 px desktop / 24 px mobile. Consider a 56-72 px desktop hero and 40-48 px product result display while retaining compact utility headings.
- Use tabular numerals for financial values to prevent visual jumping during updates.
- Keep line lengths near 55-70 characters for explanatory copy.

### Color

Retain navy and warm canvas as the trust foundation. Add a controlled functional palette:

- VAT: warm gold
- Tax/Zvw reserve: blue or indigo
- Business costs: terracotta
- Personal payout: green
- Decision/forecast: violet or coral

Use saturated colors for bars, active states, and section fields; use tints for surfaces. Validate all final foreground/background pairs for WCAG AA.

### Surfaces

- Reduce the number of identical white bordered cards.
- Define three surface levels: canvas, working card, and highlighted result stage.
- Use larger radii only for interactive/result objects; keep editorial sections flatter.
- Shadows should be soft and rare. Color contrast and overlap should create most depth.

### Controls

- Minimum target height: 44 px for primary mobile interactions.
- Selected states require at least two signals: fill + border, or fill + icon.
- Inputs should have clear resting, hover, focus, valid, and warning states.
- Destructive actions should live in a distinct settings area and require confirmation.

### Motion

- Animate meaning, not every scroll event.
- Keep most interaction motion under 700 ms.
- Avoid continuous background motion near financial inputs.
- Respect reduced-motion preferences globally.
- Ensure results are immediately available without waiting for animation.

### Iconography and imagery

- Prefer simple custom marks or one coherent icon family.
- Avoid generic finance icons such as coins, piggy banks, calculators, and bank buildings.
- Use real creative environments and specific cultural details.
- Maintain diversity across disciplines, gender presentation, ethnicity, age, and working settings.

---

## Accessibility and responsive findings

### Positive findings

- Automated axe scans found no WCAG A/AA violations across the landing page, accuracy page, and all four tool states at desktop and 375 px.
- No horizontal overflow was detected at 375 px.
- The sticky site header remains usable on mobile.
- Text hierarchy and baseline contrast are generally strong.

### Items to address during redesign

- Several mobile links and compact controls are below the preferred 44 px touch height.
- Preserve visible keyboard focus when introducing custom tabs, segmented controls, and animated cards.
- Do not let motion delay access to current values.
- Use text labels in addition to allocation colors.
- Ensure the mobile result remains close to the input being edited.
- Test 200% browser zoom, 320 px width, long Dutch labels, and increased text size.
- Re-run automated and manual accessibility checks after visual changes; today's clean scan only covers the current audited states.

---

## Recommended implementation sequence

### Phase 1 - Establish the signature

1. Create the allocation color system.
2. Build the tall reusable allocation bar.
3. Upgrade the payout result hierarchy and number animation.
4. Create confidence block, focus styles, and motion tokens.
5. Apply the bold footer treatment.

### Phase 2 - Redesign the app experience

1. Rebuild the four mode cards/navigation.
2. Move Money arrived to a two-column input/result stage.
3. Upgrade Weekly check-in with live runway feedback.
4. Redesign Check a decision around before/after consequence.
5. Turn Overview into the weekly permission dashboard.

### Phase 3 - Art-direct the brand

1. Introduce real creative imagery or short muted loops.
2. Build the living hero headline.
3. Convert landing sections into editorial scenes.
4. Redesign privacy and accuracy as premium trust moments.
5. Validate the full system on desktop, 375 px, reduced motion, keyboard, and screen reader.

---

## The five changes I would do first

1. **Make the payout number and allocation bar the unmistakable product signature.**
2. **Replace the quiet hero with an art-directed creative scene and a more dramatic product composition.**
3. **Turn the four tabs into bold, differentiated workspaces.**
4. **Create a two-column live calculator with tactile inputs and a sticky result stage.**
5. **Use a consistent motion, color, focus, and confidence system across every page.**

These five changes would move Freelens from "responsible calculator" to "beautiful creative-finance product" without compromising the trust and clarity already working well.

---

## Audit references

- Live landing page: `https://freelens-mvp.vercel.app/`
- Live calculator: `https://freelens-mvp.vercel.app/tool`
- Live accuracy page: `https://freelens-mvp.vercel.app/accuracy`
- Desktop and mobile captures are stored in the accompanying `screenshots` folder.
- Automated accessibility results are stored in `accessibility-scan.json`.


---

## Appendix: User-provided additions and draft copy

> **Draft status:** The notes below were provided by the user from an Apple Notes working document on July 22, 2026. They are preserved as draft direction and copy, and have not yet been validated for implementation, accessibility, responsive behavior, performance, or final brand wording.

### Design direction (Freelens landing, hero section)

Go bold on the left side. Let the whole left column carry a full-bleed image or moving visual of a real creative at work (a dancer, a hairdresser, a photographer), shot editorial style. Keep the calculator card on a clean surface floating over it so the numbers stay legible and trustworthy. Add motion on scroll, like the image subtly shifting or the planned 3D element, so it feels alive without touching the math. Test at 375px mobile so the background doesn't turn into noise.

### Current page copy

For Dutch freelancers and ZZP'ers  
Money arrived. Know what happens next.  
Freelens helps you separate VAT, protect a tax reserve, cover business costs, and see what may be available to pay yourself.  
Process a payment | See how it works  
Free to try. No account. Your numbers stay on this device.

### Calculator card

EXAMPLE — Example uses 21% VAT and a 30% reserve.  
How much did you receive? 2500  
Includes VAT | Excludes VAT  
Payment received € 2.500  
VAT included in this payment € 434  
Income tax and Zvw reserve € 620  
May be available to pay yourself € 1.446  
VAT: € 434 | Tax reserve: € 620 | Personal payout: € 1.446  
A planning estimate, not a tax assessment. The real tool uses your own VAT treatment and reserve rules. Your numbers stay on your device.

### Freelens design ideas for creative freelancers (site + calculator)

1. Headline personality: oversized serif with an animated reveal. Swap words dynamically, "Money arrived, from a shoot / from a gig / from a client", so each creative (photographer, dancer, hairdresser) sees themselves in the copy.

2. Make the calculator the delight: numbers count up with a spring animation, the allocation bar animates as segments slide into place, satisfying micro-interactions when toggling Includes/Excludes VAT.

3. Signature element: turn the allocation bar into a bold, color-coded visual language repeated across the whole site, almost like a brand mark.

### Freelens calculator screen — design elevation for creative freelancers

1. Tabs as bold color-coded cards: turn the four tabs into cards, each with its own accent color and a tiny animated icon, like chapters in a portfolio.

2. Give the form rhythm: it reads like a bank form now. Use oversized serif labels (Fraunces), generous spacing, and inputs that glow softly with the accent color on focus.

3. Satisfying toggles: make the "Includes VAT / Excludes VAT" toggle a pill switch with a spring animation. Small micro-interactions are what design lovers notice.

4. Hero moment — the example breakdown: turn it into a living, color-coded allocation bar that animates as the euros split (VAT, reserve, personal payout sliding into place), so the math itself becomes beautiful.

### Freelens design notes — payout section, disclaimers, and footer

1. Payout number as emotional payoff: make "Available for personal payout" huge in the serif (Fraunces) and let the euro amount count up with a spring animation whenever inputs change.

2. Allocation bar as hero: the current bar is too thin. Make it tall and tactile, with segments sliding in with color, and hover states that reveal each euro amount (VAT, reserve, personal payout).

3. Disclaimers as a confidence block: the "not tax advice" and "saved only on this device" lines read like fine print. Restyle them as a calm confidence block: a small icon plus one warm sentence, framing privacy as a design feature, not legal noise.

4. Footer as a closing moment: the footer is dead space right now. Give it a bold full-width color band in the Freelens palette with the wordmark oversized, like the last page of a portfolio.
