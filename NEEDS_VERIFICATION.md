# Parameters that could not be confirmed from Belastingdienst

Every figure in `config/countries/nl-2026.json` was taken from belastingdienst.nl on 2026-08-03. No aggregators, no accountancy summaries, no bank knowledge bases, no recall.

The items below could not be settled from a Belastingdienst page. Each one names the exact figure needed and where I looked. None of them are guesses dressed up as facts: where a value had to be chosen to keep the engine working, the choice is stated and the direction of the error if it is wrong is stated with it.

**Status: 4 open, 3 closed.** Items 1, 6 and 7 are resolved and kept here for the record rather than deleted, so the reasoning stays auditable. Item 1 was closed from the statute after the Belastingdienst pages turned out not to state the definition at all.

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

**Confirmed:** the combined 2026 bracket 1 rate is 35,75%, and premies volksverzekeringen are 27,65% (AOW 17,90 + Anw 0,10 + Wlz 9,65).

**Not confirmed:** the 8,10% income tax component on its own. Belastingdienst publishes the combined rate and the premie rate but I found no page publishing the split.

**Configured as:** 8,10%, derived by subtraction, marked `"derived": true` in the provenance.

**Impact:** none. `bracketComposition` is documentation. Every calculation uses the combined rate, which is sourced.

---

## 3. Whether the plain startersaftrek is subject to the tariefsaanpassing

**Confirmed:** the tariefsaanpassing is 11,94% in 2026, applies above €78.426, and Belastingdienst's list of covered items names *zelfstandigenaftrek*, *aftrek speur- en ontwikkelingswerk*, *meewerkaftrek*, *startersaftrek bij arbeidsongeschiktheid*, *stakingsaftrek* and *mkb-winstvrijstelling*.

**Not confirmed:** the ordinary startersaftrek is not on that list. It is legally an increase of the zelfstandigenaftrek rather than a separate deduction, which would explain the omission, but the page does not say so.

**Configured as:** subject to the adjustment (`subjectToRateAdjustment: true`).

**If this is wrong** the engine over-reserves, and only for a starter whose income exceeds €78.426. Worst case is 11,94% of €2.123, about €254.

**Searched:** `nl/aftrek-en-kortingen/content/afbouw-tarief-aftrekposten-bij-hoog-inkomen`.

---

## 4. The €2.840 arbeidskorting figure on the overview page

The arbeidskorting overview page states that if work income is not above €45.593 and your employer calculated a higher credit, the employer's figure is taken into account "up to a maximum of €2.840". The 2026 table for people under AOW age peaks at €5.685; €2.840 is the maximum in the AOW-age table.

**Configured as:** the under-AOW table, peaking at €5.685. The €2.840 sentence appears to describe employer-computed payroll credit and not a separate ceiling for a self-employed person, but that reading is inference, not something the page states.

**If this is wrong** the engine over-states the arbeidskorting and under-reserves, by up to €2.845 a year, for anyone this ceiling actually applies to.

**Searched:** `.../heffingskortingen/arbeidskorting/arbeidskorting` and `.../arbeidskorting/tabel-arbeidskorting-2026`.

---

## 5. Verzamelinkomen for the algemene heffingskorting

The algemene heffingskorting tapers on *verzamelinkomen*, which is the total of Box 1, Box 2 and Box 3. The engine uses Box 1 income only, because Box 2 and Box 3 are out of scope.

**Not a source problem, a scope decision.** Anyone with substantial Box 2 or Box 3 income has a higher verzamelinkomen than the engine assumes, therefore a smaller credit, therefore a larger bill than this estimate shows. Surfaced in `assumptions[]` on every result.

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
