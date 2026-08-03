/**
 * An independent second route to the annual bill.
 *
 * Deliberately written a different way from the engine: plain euro floats
 * instead of integer Cents, straight-line ifs instead of the piecewise-segment
 * and deduction-ordering abstractions, no rounding policy at all, and every
 * figure typed from the published Belastingdienst 2026 tables rather than read
 * from config/countries/nl-2026.json.
 *
 * Sources for the literals here, all retrieved 2026-08-03:
 *   brackets            fisin/fisin2026/belastingberekening
 *   zelfstandigenaftrek .../ondernemersaftrek-2026/zelfstandigenaftrek-2026
 *   mkb 12,7%           .../mkb-winstvrijstelling-2026
 *   tariefsaanpassing   nl/aftrek-en-kortingen/content/afbouw-tarief-aftrekposten-bij-hoog-inkomen
 *   AHK / arbeidskorting  .../tabel-algemene-heffingskorting-2026, .../tabel-arbeidskorting-2026
 *   Zvw 4,85% / €79.409 fisin/fisin2026/inkomensafhankelijke_bijdrage_zorgverzekeringswet
 *
 * A wrong constant would now have to appear identically in two places written
 * from the same source at different times. Pinning the engine's own output
 * could never make that check, which is how a 3x wrong per-payment reserve
 * once passed 180 green tests.
 */
export function referenceAnnualLiability(o: {
  profit: number;
  otherIncome?: number;
  hours?: boolean;
  starter?: boolean;
  withheld?: number;
}): number {
  const otherIncome = o.otherIncome ?? 0;
  const hours = o.hours ?? true;
  const starter = o.starter ?? false;

  // Ondernemersaftrek. The zelfstandigenaftrek may not exceed the profit,
  // unless the startersaftrek applies, in which case the cap is lifted.
  let deductions = 0;
  if (hours) {
    deductions += starter ? 1200 : Math.min(1200, Math.max(0, o.profit));
    if (starter) deductions += 2123;
  }
  const afterOndernemersaftrek = o.profit - deductions;

  // MKB-winstvrijstelling: 12,7% of what is left, applied to losses too.
  const mkb = afterOndernemersaftrek * 0.127;
  const belastbareWinst = afterOndernemersaftrek - mkb;

  // Box 1, taxpayer who has not reached AOW age.
  const taxable = Math.max(0, belastbareWinst + otherIncome);
  let tax = Math.min(taxable, 38883) * 0.3575;
  tax += Math.max(0, Math.min(taxable, 78426) - 38883) * 0.3756;
  tax += Math.max(0, taxable - 78426) * 0.495;

  // Tariefsaanpassing: 11,94% of whatever part of the deduction sat above
  // €78.426, which is what caps the deduction benefit at 37,56%.
  const incomeBeforeDeductions = Math.max(0, o.profit + otherIncome);
  tax +=
    Math.min(
      Math.max(0, deductions + mkb),
      Math.max(0, incomeBeforeDeductions - 78426)
    ) * 0.1194;

  // Algemene heffingskorting, on verzamelinkomen.
  let ahk = 0;
  if (taxable <= 29736) ahk = 3115;
  else if (taxable <= 78426) ahk = Math.max(0, 3115 - (taxable - 29736) * 0.06398);

  // Arbeidskorting, on arbeidsinkomen, which counts profit BEFORE the
  // entrepreneur deductions and the MKB-winstvrijstelling.
  const arbeidsinkomen = Math.max(0, o.profit + otherIncome);
  let ak = 0;
  if (arbeidsinkomen <= 11965) ak = arbeidsinkomen * 0.08324;
  else if (arbeidsinkomen <= 25845) ak = 996 + (arbeidsinkomen - 11965) * 0.31009;
  else if (arbeidsinkomen <= 45592) ak = 5300 + (arbeidsinkomen - 25845) * 0.0195;
  else if (arbeidsinkomen <= 132920)
    ak = Math.max(0, 5685 - (arbeidsinkomen - 45592) * 0.0651);

  const afterCredits = Math.max(0, tax - ahk - ak);
  const withheld = otherIncome > 0 ? Math.max(0, o.withheld ?? 0) : 0;
  const incomeTax = Math.max(0, afterCredits - withheld);

  // Zvw: its own rate, its own capped base, never folded into income tax.
  const zvw = Math.min(Math.max(0, belastbareWinst), 79409) * 0.0485;

  return Math.round((incomeTax + zvw) * 100);
}
