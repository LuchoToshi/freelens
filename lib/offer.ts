/**
 * The founding offer, as numbers, in exactly one place.
 *
 * Every surface that names a price templates from here — homepage, waitlist
 * form, /try gate. The teardown found "€ 99 eenmalig / lifetime" living next
 * to "€ 99 for the first year" on the same site; this module is why that
 * cannot happen again. Change a price here and every mention moves together.
 */
export const OFFER = {
  spots: 25,
  /** First year, founding members. */
  founding: "€ 99",
  standardYear: "€ 190",
  standardMonth: "€ 19",
} as const;
