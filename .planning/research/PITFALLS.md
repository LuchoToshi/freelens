# Pitfalls Research

**Project:** Freelens — safe-to-spend calculator
**Confidence:** Calculation/UX/scope pitfalls HIGH. Distribution pitfalls MEDIUM.

## Calculation Logic Pitfalls

**Pitfall 1: Tax reserve applied to full balance, not just untaxed income**

What goes wrong: Applying the tax rate to the full balance over-reserves. Money already in the account may already be taxed (savings, prior income). Safe-to-spend looks absurdly low and users stop trusting it.

Prevention: Either (a) add an input — "how much of your balance is from recent unpaid invoices?" — and apply the rate only to that, or (b) make explicit in the UI that the tax rate should reflect what percentage of their *entire current balance* is still owed in taxes. Option (a) is more accurate. Option (b) is simpler but requires mental math.

Warning sign: Users say the safe-to-spend number is "way too low" or immediately halve the tax rate they entered to compensate.

Most relevant phase: v1 calculation design — before user testing.

---

**Pitfall 2: Runway buffer ignores lumpy costs**

What goes wrong: The runway calculation assumes smooth monthly spend. Creative freelancers have irregular large costs: quarterly estimated taxes, annual software renewals, equipment. A user whose "average" is $2k/month may have a $6k April. Runway buffer is systematically under-sized.

Prevention: Option A — add an optional "known large expenses in the next 90 days" field. Option B — build in a silent 15–20% lumpy cost buffer and explain it. At minimum: acknowledge the gap in the plain-English explanation. "This doesn't include large one-off costs coming up."

Warning sign: Users mention quarterly taxes or renewal costs as things they mentally added on top of the output.

Most relevant phase: v1 formula and explanation copy.

---

**Pitfall 3: Self-employment tax omitted from the reserve**

The single most commonly missed item in US freelancer financial tools.

What goes wrong: A US freelancer enters "25% tax rate" thinking that covers their liability. It doesn't. Self-employment tax — 15.3% on net SE income — is on top of income tax. Freelancers pay the full 15.3% themselves (vs. employer/employee split on W-2). A 25% rate leaves them under-reserved by ~15 points.

Prevention: Use a slider with range 25–50% and add inline guidance: "Most US freelancers owe 25–40% total — income tax plus 15.3% self-employment tax. When in doubt, use 35%."

Warning sign: During testing, users talk through how they chose their tax rate and reveal they only used their income tax bracket.

Most relevant phase: v1 input design.

---

**Pitfall 4: Current balance is time-sensitive in a bad way**

What goes wrong: Run the calculator day a $12k invoice clears — looks great. Run it mid-drought — looks dire. Output swings wildly based on timing, not underlying financial health. Users conclude the tool is unreliable.

Prevention: Add a framing note: "Run this after your latest invoices have cleared, before you've spent from them." Or add an optional 3-month average income input to anchor in trend rather than point-in-time noise.

Warning sign: Users run the tool twice in a week and get very different outputs with no corresponding change in their situation.

Most relevant phase: v1 UX design and explanation copy.

---

## UX / Trust Pitfalls

**Pitfall 5: Percentage inputs are uniformly misunderstood**

What goes wrong: "What's your tax rate?" produces inconsistent inputs. Some enter 25, some enter .25. Some use marginal rate, some effective rate. Some guess. All of these are silent errors — the tool produces a wrong number with no signal.

Prevention: Never use a raw percentage text field. Use a slider (range: 15–50%) with the selected value displayed prominently. Add inline reference: "Most US freelancers: 30–40% total." If you use a text field, validate the range and warn outside 10–55%.

Warning sign: Users hesitate noticeably at the tax rate field or enter a number quickly without seeming confident.

Most relevant phase: v1 input design.

---

**Pitfall 6: One number without breakdown is untrustworthy**

What goes wrong: Clean UI instinct says show one number. But for a financial tool targeting users who distrust financial products, an unsupported number is suspicious. "Safe to spend: $3,240" with no math gets mentally dismissed. Users don't act on numbers they can't verify.

Prevention: The breakdown is the trust mechanism, not a feature addition. Show: Balance → Tax Reserve → Runway Buffer → Safe to Spend. Every line. Don't let any UX simplification remove it from the primary view.

Warning sign: Users describe the output as "interesting" rather than actionable. They ask "but how did you get that?"

Most relevant phase: v1 UI design. Non-negotiable constraint.

---

**Pitfall 7: Explanatory text written like a disclaimer**

What goes wrong: "This is not financial advice. Results may vary." Users trained to skip boilerplate skip it. The explanation that was supposed to build trust signals institutional risk-aversion instead.

Prevention: Write explanations that explain, not disclaim. "Your tax reserve covers what the IRS will take from recent income — not money you've already paid tax on." Put legal CYA in small-text footer, far from the output.

Warning sign: Users skim or skip the explanation, especially if the first sentence is a hedge.

Most relevant phase: v1 copywriting.

---

**Pitfall 8: Mobile input UX treated as a responsive-CSS problem**

What goes wrong: Calculator inputs — number fields, sliders — work fine on desktop. On mobile, number keyboards don't dismiss cleanly, sliders are imprecise with a thumb, and form labels wrap in ways that break the visual logic.

Prevention: Test all inputs on a real phone from the first prototype build. Use `inputmode="decimal"` on number fields. If using sliders, test them on an actual touch screen — not desktop in responsive mode.

Warning sign: Any testing participant who tries the prototype on mobile and doesn't reach the output screen.

Most relevant phase: v1 build.

---

## Scope Creep Patterns

**Pitfall 9: The income tracker ("while we're at it...")**

What goes wrong: After early traction, someone suggests tracking income over time. True — it would be more powerful. It's also a fundamentally different product: ledger → persistent state → accounts → auth → backend → ships in 6 months instead of 6 weeks.

Prevention: The scope line in PROJECT.md ("no persistence, no accounts") is exactly right. Hold it. Every addition request should pass through: "Does this make the safe-to-spend number more trustworthy, or does it add a different output?" A different output is a different product.

Warning sign: Any design or code discussion involving session storage, localStorage, a database, or a login screen.

Most relevant phase: v1 build through v1 user testing.

---

**Pitfall 10: The second output**

What goes wrong: Safe-to-spend works in early testing. Engaged users ask for cash flow projection, savings rate, tax estimate. These are valuable requests — from the most engaged, least representative users. Adding a second output forces hierarchy decisions, dilutes clarity, and makes it harder to learn what users actually act on.

Prevention: Collect feature requests. Don't build them. "Things users wanted beyond the core" is v2 research, not a v1 roadmap.

Warning sign: Any design mock showing more than one primary output, tabs, secondary panels, or "also show" sections.

Most relevant phase: v1 user testing and any planning session that follows.

---

**Pitfall 11: Building for edge cases before validating the core case**

What goes wrong: Edge cases surface quickly: multiple income streams, business expenses, international users. These are real. They are not the v1 user. Building for them produces a complicated product that serves no segment well.

Prevention: Define the canonical v1 user precisely — US-based creative freelancer, single primary income source, self-employed — and build exclusively for that user.

Warning sign: Input form has more than 3–4 fields, or any field asks about business entity type, deductible expenses, or multiple income sources.

Most relevant phase: v1 build.

---

## Distribution Mistakes

**Pitfall 12: Launching to a community, not to individuals**

What goes wrong: First distribution is a post in a freelancer Slack or subreddit. Gets 40 visits, 3 comments, no sustained use. Community posts are skimmed, not engaged with. A trust tool doesn't convert from broadcast exposure.

Prevention: First distribution should be 1:1. Send the URL directly to 10 people you've already spoken to in research — use it together on a call. Learning per user is 10x higher. Only move to broadcast distribution after the 1:1 loop has produced clear signal.

Warning sign: First distribution is a post, not a direct message.

Most relevant phase: v1 launch.

---

**Pitfall 13: SEO / content investment before tool validation**

What goes wrong: Content targeting "freelance tax calculator" takes months to rank. More importantly: if the tool doesn't convert cold visitors into people who act on the number, more traffic just produces more "nice but not sure I'd use it" responses at scale.

Prevention: No content investment until user testing shows people act on the number. Required signals in sequence: (1) user uses tool to make an actual spending decision, then (2) user says they'd tell another freelancer about it.

Most relevant phase: Post-validation only.

---

**Pitfall 14: "Freelancers" as a monolith in messaging**

What goes wrong: Generic copy addresses "freelancers" broadly. Designers, writers, developers, consultants all technically freelance — but their vocabulary and anxiety triggers differ. Generic copy is trusted by no one specifically.

Prevention: Write all copy for one segment: creative freelancers who do project-based work with lumpy invoices. Test copy with 5 designers before generalizing. Specificity earns trust faster than breadth.

Warning sign: The headline could apply to any type of freelancer. No signal that this was built for a specific kind of person.

Most relevant phase: v1 landing page and distribution copy.

---

**Pitfall 15: Opinion-based user testing**

What goes wrong: "Would you use this?" Users say yes. They never open it again. Users don't know whether they'd act on a financial number until they're in the actual anxiety moment. "I would use this" is not validation.

Prevention: Ask behavioral questions, not opinion questions. "Walk me through using this right now with your real current balance." Watch where they hesitate. Watch whether they describe past behavior or hypothetical future behavior. The only signal that matters: they used the number to make a decision.

Warning sign: Testing notes full of "I think I would..." or "I could see myself..." — conditional future behavior.

Most relevant phase: v1 user testing design — the testing protocol needs to be right before any sessions run.

---

## Phase Summary

| Phase | Primary Pitfalls to Watch |
|-------|--------------------------|
| v1 Calculation Design | #1 (tax on full balance), #2 (lumpy costs), #3 (SE tax), #4 (timing sensitivity) |
| v1 Input / UX Design | #5 (percentage confusion), #6 (breakdown required), #7 (disclaimer copy), #8 (mobile) |
| v1 Build | #9 (income tracker creep), #10 (second output), #11 (edge case scope) |
| v1 User Testing | #15 (behavioral observation), #14 (segment specificity) |
| v1 Launch | #12 (1:1 first), #13 (no content before signal) |
