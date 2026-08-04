# Parameters that could not be confirmed from Belastingdienst, and what settled them

Every figure in `config/countries/nl-2026.json` was taken from belastingdienst.nl on 2026-08-03, and the whole Box 1 model was cross-checked against the Wet inkomstenbelasting 2001 and the Zorgverzekeringswet on wetten.overheid.nl on 2026-08-04. No aggregators, no accountancy summaries, no bank knowledge bases, no recall.

Two sources, in that order, and nothing else. Belastingdienst for the figures, because that is who publishes them. The statute where the Belastingdienst does not state a rule at all, which turned out to be the case for four of the items below. `lib/tax/loadProfile.test.ts` enforces both domains and rejects anything else.

Each item names the exact figure needed and where I looked. None of them are guesses dressed up as facts: where a value had to be chosen to keep the engine working, the choice is stated, and so is the direction of the error if it is wrong.

**Status: 6 closed, 1 permanent scope limit, 1 open defect.**

| # | What | State |
|---|---|---|
| 1 | Zvw contribution base | Closed. Statute confirms the configured base. |
| 2 | Bracket 1 income tax component | Closed. Published in art. 2.10 lid 1. |
| 3 | Startersaftrek under the tariefsaanpassing | Closed. It is part of the zelfstandigenaftrek. |
| 4 | The €2.840 arbeidskorting figure | Closed. Does not exist in the Wet IB 2001. |
| 5 | Verzamelinkomen for the AHK | **Will not close.** Needs Box 2 and Box 3, out of scope. |
| 6 | Wage tax already withheld | Closed. Now an input. |
| 7 | Zvw maximum across two sources | Closed as a sourced limitation. |
| 8 | MKB added back on a negative base | **Open defect**, under-reserving. Fix proposed, not applied. |

Resolved items are kept rather than deleted so the reasoning stays auditable. Items 1 to 4 could not be settled from any Belastingdienst page and were closed from the statute instead; every one of them confirmed what was already configured, so no figure moved.

---

## 1. The Zvw contribution base for a self-employed person

**Resolved 2026-08-04.** The configured base was right. No figure changed.

The Belastingdienst never settles this: every one of its pages says only *winst uit onderneming*, which is ambiguous between profit before and after the entrepreneur deductions. The statute settles it in two hops.

**Zorgverzekeringswet art. 43 lid 2 onder b** — what the contribution is levied on:

> belastbare winst uit onderneming, bepaald volgens de regels van **afdeling 3.2 van de Wet inkomstenbelasting 2001**

**Wet IB 2001 art. 3.2** — what afdeling 3.2 defines that term as:

> Belastbare winst uit onderneming is het gezamenlijke bedrag van de winst die de belastingplichtige als ondernemer geniet uit een of meer ondernemingen **verminderd met de ondernemersaftrek (paragraaf 3.2.4) en de MKB-winstvrijstelling (paragraaf 3.2.5)**.

So the base is profit after the ondernemersaftrek *and* after the MKB-winstvrijstelling, which is what `profitAfterDeductions` computes. `baseVerified` is now `true` and the assumption line cites both articles instead of warning that the base is unknown.

Two side confirmations from the same reading:

- **Art. 43 lid 3** — *"Het bijdrage-inkomen wordt ten minste op nihil gesteld"*, and capped at the ministerially fixed amount. Confirms `floorAtZero` and the €79.409 ceiling.
- **Wet IB 2001 art. 3.79a** — the MKB-winstvrijstelling is 12,7% of profit *"nadat dit bedrag is verminderd met de ondernemersaftrek"*. Confirms the engine applies the exemption after the deductions, not before.

**Source note.** This came from wetten.overheid.nl, not belastingdienst.nl. That is the government's official legislation database and the primary law the Belastingdienst pages paraphrase, not a third-party summary. `loadProfile.test.ts` admits exactly these two domains and no others.

**Excluded from the base, and not modelled here:** art. 43 lid 2 onder b carves out the oudedagsreserve release amount under the pre-2023 art. 3.70. The FOR is out of scope and closed to new entrants, so nothing turns on it.

---

## 2. The income tax component of bracket 1

**Resolved 2026-08-04.** It is published after all, in the statute rather than on a Belastingdienst page. **Wet IB 2001 art. 2.10 lid 1** carries the income-tax-only table:

| more than | up to | plus | over the excess |
|---|---|---|---|
| – | €38.883 | – | **8,10%** |
| €38.883 | €78.426 | €3.149 | 37,56% |
| €78.426 | – | €18.001 | 49,50% |

8,10% exactly, which is what subtracting 27,65% from 35,75% produced. The derivation was right; it is no longer a derivation. The provenance now cites the article and the entry is no longer marked `derived`.

The same table independently confirms the two bracket boundaries (€38.883 and €78.426) and the 37,56% and 49,50% rates the engine actually calculates with.

**Impact:** still none on any output. `bracketComposition` remains documentation.

---

## 3. Whether the plain startersaftrek is subject to the tariefsaanpassing

**Resolved 2026-08-04. It is subject, and the Belastingdienst omission was not an omission.** The suspicion recorded here was right: the ordinary startersaftrek is not a separate deduction at all, so it could not appear on a list of deductions.

**Wet IB 2001 art. 3.76 lid 3:**

> Indien de ondernemer in een of meer van de vijf voorafgaande kalenderjaren geen ondernemer was […] **wordt de zelfstandigenaftrek verhoogd met € 2123**.

It is an *increase of* the zelfstandigenaftrek. The chain from there is closed:

1. **Art. 3.74 onder a** — the ondernemersaftrek is the combined total of *de zelfstandigenaftrek* and four other items.
2. **Art. 2.10 lid 3 onder a** — the grondslagverminderende posten include *"de ondernemersaftrek, bedoeld in artikel 3.74"*, as a whole, not itemised.

So the €2.123 is inside the zelfstandigenaftrek, the zelfstandigenaftrek is inside the ondernemersaftrek, and the ondernemersaftrek is covered. `subjectToRateAdjustment: true` is correct. Belastingdienst lists *startersaftrek bij arbeidsongeschiktheid* separately because art. 3.74 onder d makes that one a genuinely separate item.

**Also confirmed by the same article.** Art. 3.76 lid 5 caps the zelfstandigenaftrek at profit, and disapplies that cap for anyone entitled to the lid 3 increase. That is exactly the engine's `cappedAtBase` plus `capWaivedBy: ["startersaftrek"]`, which had been inferred from a Belastingdienst sentence and is now statutory.

**Art. 2.10 lid 2** also states the correction formula the engine implements: 11,94% of the amount by which income plus the deductions exceeds €78.426, capped at 11,94% of the deductions themselves.

---

## 4. The €2.840 arbeidskorting figure on the overview page

**Resolved 2026-08-04. €2.840 does not apply, and it is not a ceiling.**

The string `2.840` appears **nowhere in the Wet inkomstenbelasting 2001** as in force on 2026-01-01. It is not a figure in the income tax arbeidskorting at all.

**Wet IB 2001 art. 8.11 lid 2** gives the credit as four terms, which are the engine's five segments exactly:

| statute | engine |
|---|---|
| a. 8,324%, max €996 | 8,324% to €11.965 |
| b. + 31,009% above €11.965, sum ≤ €5.300 | €996 + 31,009% to €25.845 |
| c. + 1,950% above €25.845, sum ≤ €5.685 | €5.300 + 1,950% to €45.592 |
| d. − 6,51% above €45.592, not below nil | €5.685 − 6,510% to €132.920, then €0 |

The closing sentence of lid 2 is what the Belastingdienst page was gesturing at, and it reads the opposite way to a ceiling:

> Ingeval het arbeidsinkomen niet meer bedraagt dan € 45.592, bedraagt de arbeidskorting **ten minste** de volgens artikel 22a van de Wet op de loonbelasting 1964 toegekende arbeidskorting […], maar **maximaal het in de eerste volzin, onderdeel c, als tweede vermelde bedrag**.

A **floor**, not a cap: the credit is *at least* what payroll already granted. Its own ceiling is the second amount named in onderdeel c, which is **€5.685**, not €2.840. Two consequences:

- The engine's table is right, and €2.840 was a red herring from a payroll-context page.
- The engine ignores the floor entirely. Since the rule can only ever *raise* the credit, ignoring it can only lower the credit and raise the estimated bill. That over-reserves, which is the safe direction, and it only bites someone with wage income below €45.592 whose payroll credit exceeded the annual computation.

---

## 5. Verzamelinkomen for the algemene heffingskorting

**Not a verification gap. A deliberate scope boundary, and it stays open by design.**

The source question is settled. **Wet IB 2001 art. 8.10 lid 2** confirms both the figures and the base:

> De algemene heffingskorting bedraagt € 3.115, verminderd, doch niet verder dan tot nihil, met 6,398% van het gedeelte van het **verzamelinkomen** dat meer bedraagt dan € 29.736.

Verzamelinkomen is the total of Box 1, Box 2 and Box 3. The engine substitutes Box 1 income, because Box 2 and Box 3 are explicitly out of scope for this product.

Closing this item does not require a figure. It requires modelling Box 2 and Box 3, which is an accountant-level feature this product has decided not to build. So it is not "unverified" and it is not going to be fixed; it is a stated limitation with a known direction.

**Direction of the error:** anyone with substantial Box 2 or Box 3 income has a higher verzamelinkomen than the engine assumes, so a smaller credit, so a larger real bill than this estimate shows. **This is the under-reserving direction**, which is why it is surfaced in `assumptions[]` on every single result rather than buried here.

---

## 6. Wage tax already withheld on employment income

**Resolved.** `otherIncomeTaxWithheld` is now an input. It is subtracted after credits and floored at zero, and it is ignored entirely when there is no employment income to have withheld it. Left at zero, the estimate stays on the cautious side and says so in `assumptions[]`.

What remains unmodelled: over-withholding does not produce a refund in this estimate, and the engine does not know whether the figure entered covers the whole year or only part of it.

---

## 7. The Zvw maximum applied across two income sources

**No longer an open question. A known, sourced limitation.**

Confirmed 2026-08-04 by **Zorgverzekeringswet art. 43 lid 5**: where the contribution is levied by assessment, the maximum bijdrage-inkomen taken into account is the ceiling *"verminderd met het loon"* already subject to withholding. The ceiling is explicitly shared between a job and a business.

The engine applies the ceiling to business profit alone.

**Direction of the error:** over-states Zvw, and only for someone whose combined income exceeds €79.409. Over-reserving, which is the safe direction. Surfaced in `assumptions[]` with the article cited.

**To close it properly** the engine would need employment income split into Zvw-liable wage and other income, which is a modelling change rather than a missing figure.

---

## 8. The MKB-winstvrijstelling is added back on a negative base

**Found 2026-08-04 while sourcing item 3. Not a missing figure. An engine defect, in the under-reserving direction.**

**Wet IB 2001 art. 2.10 lid 3 onder b** admits the MKB-winstvrijstelling as a grondslagverminderende post only:

> mits het gezamenlijke bedrag van de met de ondernemersaftrek verminderde winst, bedoeld in artikel 3.79a, **positief is**

The engine has no such condition. When profit after the ondernemersaftrek is negative, the 12,7% is a negative amount, and that negative is added into the total the tariefsaanpassing is calculated on, shrinking it.

Measured, at a €10.000 loss with the starter increase applied:

```
deductions subject to the adjustment   € 1.630,97   (should be € 3.323,00)
```

**When it bites.** The tariefsaanpassing only fires above €78.426 of income before deductions, and that figure includes employment income. So it needs a loss-making business alongside a substantial salary. At a €10.000 business loss and €100.000 of salary the adjustment comes out at about €194 instead of about €397.

**Direction:** understates tax by roughly €200, so the user reserves too little. That is the direction this engine is not allowed to fail in.

**The fix** is a positivity guard on the MKB contribution to `totalSubjectToRateAdjustment` in `lib/tax/deductions.ts`, not on the exemption itself, which still correctly reduces the loss. Deliberately left unapplied pending review, because it changes tax logic.
