import { describe, expect, it } from "vitest";
import { salutationFor } from "@/lib/rebooking/salutation";

describe("salutationFor", () => {
  it("uses the contact first name when given", () => {
    expect(
      salutationFor({ clientName: "Studio Vondel", contactName: "Emma", formality: "je", locale: "nl" })
    ).toBe("Hoi Emma,");
  });

  it("uses Beste with the u-form", () => {
    expect(
      salutationFor({ clientName: "Studio Vondel", contactName: "Emma", formality: "u", locale: "nl" })
    ).toBe("Beste Emma,");
  });

  it("takes only the first word of a multi-word contact", () => {
    expect(
      salutationFor({ clientName: "X", contactName: "Emma de Vries", formality: "je", locale: "nl" })
    ).toBe("Hoi Emma,");
  });

  it("uses the first word of a person-shaped client name", () => {
    expect(
      salutationFor({ clientName: "Marieke Jansen", formality: "je", locale: "nl" })
    ).toBe("Hoi Marieke,");
  });

  it("never puts a business name in the salutation", () => {
    for (const name of ["Studio Vondel", "Bakkerij De Groot", "Jansen Media", "De Groot B.V."]) {
      expect(salutationFor({ clientName: name, formality: "je", locale: "nl" })).toBe("Hoi,");
    }
  });

  it("falls back to bare greeting for long names without keywords", () => {
    expect(
      salutationFor({ clientName: "Vereniging van Nederlandse Gemeenten", formality: "je", locale: "nl" })
    ).toBe("Hoi,");
  });

  it("honours the user's greeting override", () => {
    expect(
      salutationFor({ clientName: "Marieke Jansen", formality: "je", locale: "nl", greetingOverride: "Hey" })
    ).toBe("Hey Marieke,");
  });

  it("speaks English for the EN locale", () => {
    expect(salutationFor({ clientName: "Marieke Jansen", formality: "je", locale: "en" })).toBe("Hi Marieke,");
    expect(salutationFor({ clientName: "Marieke Jansen", formality: "u", locale: "en" })).toBe("Dear Marieke,");
  });
});
