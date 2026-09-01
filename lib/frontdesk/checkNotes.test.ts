import { describe, expect, it } from "vitest";
import { checkNotes } from "@/lib/frontdesk/checkNotes";

const BODY_WITH_PRICE = `Hi Lisa,

A June wedding sounds wonderful. My full day is € 1.950.

Emma`;

const BODY_WITHOUT_PRICE = `Hi Lisa,

Tell me a little more about the day and I will come back with a number.

Emma`;

describe("the check notes state what was actually checked (handoff §8)", () => {
  it("quotes the price exactly as the draft writes it, not a reformatted version", () => {
    const notes = checkNotes(BODY_WITH_PRICE, null);
    expect(notes).toContainEqual({ kind: "price", amount: "€ 1.950" });
  });

  it("says no price appears when the draft names none, instead of a price note", () => {
    const notes = checkNotes(BODY_WITHOUT_PRICE, null);
    expect(notes).toContainEqual({ kind: "noPrice" });
    expect(notes.some((n) => n.kind === "price")).toBe(false);
  });

  it("claims nothing about a date when the inquiry carries none", () => {
    expect(checkNotes(BODY_WITH_PRICE, null).some((n) => n.kind === "date")).toBe(false);
    expect(checkNotes(BODY_WITH_PRICE, "2026-06-13")).toContainEqual({
      kind: "date",
      date: "2026-06-13",
    });
  });

  it("only claims the punctuation rule held when it actually held", () => {
    expect(checkNotes(BODY_WITH_PRICE, null).some((n) => n.kind === "emDash")).toBe(true);
    expect(checkNotes("Hi\n\nOne — two\n\nEmma", null).some((n) => n.kind === "emDash")).toBe(
      false,
    );
  });
});
