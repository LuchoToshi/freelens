# Parameters that could not be confirmed from Belastingdienst

Every figure in `config/countries/nl-2026.json` was taken from belastingdienst.nl on 2026-08-03. No aggregators, no accountancy summaries, no bank knowledge bases, no recall.

The items below could not be settled from a Belastingdienst page. Each one names the exact figure needed and where I looked. None of them are guesses dressed up as facts: where a value had to be chosen to keep the engine working, the choice is stated and the direction of the error if it is wrong is stated with it.

---

## 1. The Zvw contribution base for a self-employed person

**Confirmed:** rate 4,85%, maximum bijdrage-inkomen €79.409.

**Not confirmed:** whether the base is the *belastbare winst uit onderneming* (profit after ondernemersaftrek and MKB-winstvrijstelling) or the profit before those deductions.

**Configured as:** belastbare winst, i.e. after deductions. `socialContributions.zvw.baseVerified` is `false`, and the engine emits an explicit assumption line for it.

**If this is wrong** the engine under-reserves. On a €40.000 profit the difference is about €297 a year.

**Searched:**
- `fisin/fisin2026/inkomensafhankelijke_bijdrage_zorgverzekeringswet` — gives the rate and cap, lists the income categories ("winst uit Nederland"), never defines the base.
- `.../zorgverzekeringswet/bijdrage_zorgverzekeringswet/inkomensafhankelijke_bijdrage_zorgverzekeringswet` — refers on to other pages.
- `.../werken/niet_in_loondienst_werken/zorgverzekeringswet` — "Over uw resultaat uit overig werk moet u ... een bijdrage Zvw betalen", no definition.
- `.../ondernemen/onderneming_starten/wat_u_verder_wilt_weten/zorgverzekering/` — "U betaalt de bijdrage over uw winst uit onderneming", ambiguous.
- `nl/werk-en-inkomen/content/voorlopige-aanslag-zvw` — no calculation detail.
- `data/online_aangifte/ih2015/.../bijdrage-inkomen.htm` — returns 404.

**What would settle it:** the definition of *bijdrage-inkomen* in the Zorgverzekeringswet as Belastingdienst applies it, or a worked example on an official page showing a business profit and the resulting contribution.

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

The €79.409 maximum bijdrage-inkomen is a single ceiling across all of a person's contribution income. The engine applies it to business profit alone, ignoring that employment income also consumes it.

**Direction of the error:** over-states Zvw, and only for someone whose combined income exceeds the ceiling. Surfaced in `assumptions[]`.
