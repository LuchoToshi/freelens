import { describe, expect, it } from "vitest";
import { htmlToText, isFetchableUrl, parsePrefill } from "@/lib/frontdesk/server/prefill";

describe("setup prefill (§4): reads, never invents", () => {
  it("SECURITY: only public http(s) hosts are fetchable", () => {
    expect(isFetchableUrl("https://emmajanssen.nl")).toBe(true);
    for (const bad of [
      "http://localhost:3000",
      "http://127.0.0.1/admin",
      "http://10.0.0.5",
      "http://192.168.1.1",
      "http://169.254.169.254/latest/meta-data",
      "http://172.16.0.9",
      "file:///etc/passwd",
      "not a url",
    ]) {
      expect(isFetchableUrl(bad), bad).toBe(false);
    }
  });

  it("an unstated field comes back null, never guessed", () => {
    const parsed = parsePrefill(
      JSON.stringify({
        display_name: "Emma Janssen",
        professions: ["photographer"],
        location: null,
        sign_off: null,
        packages: [],
        confidence: { display_name: 1, professions: 0.9 },
      }),
      "url"
    );
    expect(parsed).toMatchObject({ display_name: "Emma Janssen", location: null, sign_off: null });
    expect(parsed?.confidence.display_name).toBe(1);
  });

  it("a package named without a price keeps a null price, never an invented one", () => {
    const parsed = parsePrefill(
      JSON.stringify({
        professions: [],
        packages: [
          { label: "Wedding day", price_from_eur: 1950, confidence: 0.9 },
          { label: "Custom work", price_from_eur: null, confidence: 0.4 },
          { label: "Bad price", price_from_eur: -5, confidence: 0.2 },
          { price_from_eur: 100, confidence: 1 },
        ],
        confidence: {},
      }),
      "text"
    );
    expect(parsed?.packages).toEqual([
      { label: "Wedding day", price_from_eur: 1950, unit: null, notes: null, confidence: 0.9 },
      { label: "Custom work", price_from_eur: null, unit: null, notes: null, confidence: 0.4 },
      { label: "Bad price", price_from_eur: null, unit: null, notes: null, confidence: 0.2 },
    ]);
  });

  it("unknown professions are dropped rather than stored", () => {
    const parsed = parsePrefill(
      JSON.stringify({ professions: ["photographer", "astronaut"], packages: [], confidence: {} }),
      "url"
    );
    expect(parsed?.professions).toEqual(["photographer"]);
  });

  it("malformed model output is rejected outright", () => {
    expect(parsePrefill("sorry, I can't do that", "url")).toBeNull();
  });

  it("html becomes plain words", () => {
    expect(
      htmlToText("<html><style>a{}</style><body><h1>Emma</h1><p>From &nbsp;€ 1950</p></body></html>")
    ).toBe("Emma From € 1950");
  });
});
