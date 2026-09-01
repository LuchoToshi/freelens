import { containsEmDash, findPriceMentions } from "@/lib/frontdesk/draftGuards";

/**
 * What "Passed every check" actually covered, for this draft (handoff §8, §12).
 *
 * The header states a verdict; these notes state the evidence behind it, and
 * each one is derived from the draft in front of the reader rather than
 * asserted. A note about a price appears only when a price appears; a note
 * about a date only when the inquiry carries one. A generic list would read
 * the same whether or not the check had anything to check, which is the exact
 * kind of reassurance this product must not manufacture.
 */
export type CheckNote =
  | { kind: "price"; amount: string }
  | { kind: "noPrice" }
  | { kind: "date"; date: string }
  | { kind: "emDash" };

export function checkNotes(body: string, eventDate: string | null | undefined): CheckNote[] {
  const notes: CheckNote[] = [];

  const amounts = findPriceMentions(body);
  // The guard has already established every amount is one of the freelancer's
  // own package prices; naming the first is what makes the claim checkable
  // against the text above it.
  notes.push(
    amounts.length > 0 ? { kind: "price", amount: amounts[0].asWritten } : { kind: "noPrice" },
  );

  if (eventDate) notes.push({ kind: "date", date: eventDate });

  if (!containsEmDash(body)) notes.push({ kind: "emDash" });

  return notes;
}
