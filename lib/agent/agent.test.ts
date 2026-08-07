import { describe, expect, it } from "vitest";
import { deriveVoice } from "@/lib/agent/voiceProfile";
import { parseDate, parseImport } from "@/lib/agent/importParse";

describe("deriveVoice", () => {
  it("extracts greeting, sign-off, je-form and style deterministically", () => {
    const v = deriveVoice([
      "Hoi Lisa,\n\nDank voor je snelle reactie! Zal ik je de planning sturen?\n\nGroetjes\nSam",
    ]);
    expect(v.greeting).toBe("Hoi");
    expect(v.signoff).toBe("Groetjes");
    expect(v.formality).toBe("je");
  });

  it("detects u-form and empty input", () => {
    expect(deriveVoice(["Beste heer Jansen,\n\nHierbij stuur ik u de offerte. Met uw akkoord start ik volgende week.\n\nMet vriendelijke groet\nSam"]).formality).toBe("u");
    expect(deriveVoice([""])).toEqual({});
  });
});

describe("parseImport", () => {
  it("parses loose Dutch lines with value and month-year date", () => {
    const rows = parseImport("Rituals, campagneshoot, maart 2026, €2400\nLisa de Vries; lisa@studio.nl; headshots; 2025-09");
    expect(rows[0]).toMatchObject({
      clientName: "Rituals",
      lastProjectTitle: "campagneshoot",
      lastProjectDate: "2026-03-01",
      approxValueCents: 240_000,
    });
    expect(rows[1]).toMatchObject({
      clientName: "Lisa de Vries",
      clientEmail: "lisa@studio.nl",
      lastProjectDate: "2025-09-01",
    });
  });

  it("keeps a first line that starts with a header word but carries data", () => {
    const rows = parseImport("Klant 1, klus, augustus 2025, \u20ac1000\nKlant 2, klus, augustus 2025, \u20ac1000");
    expect(rows).toHaveLength(2);
    expect(rows[0].clientName).toBe("Klant 1");
  });

  it("skips a header row and never invents a name", () => {
    const rows = parseImport("naam, project, datum\nStudio Noord, draaidag, 2025-06");
    expect(rows).toHaveLength(1);
    expect(parseImport(", , ,")).toHaveLength(0);
  });

  it("parses the date shapes the intake sheet uses", () => {
    expect(parseDate("maart 2026")).toBe("2026-03-01");
    expect(parseDate("03-2026")).toBe("2026-03-01");
    expect(parseDate("2026")).toBe("2026-06-01");
    expect(parseDate("gisteren")).toBeNull();
  });
});
