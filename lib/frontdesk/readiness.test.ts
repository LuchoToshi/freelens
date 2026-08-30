import { describe, expect, it } from "vitest";
import { deriveReadiness, type ReadinessInputs } from "@/lib/frontdesk/readiness";

function inputs(overrides: Partial<ReadinessInputs> = {}): ReadinessInputs {
  return {
    packages: [{ price_from_eur: 950 }],
    voiceProfile: { tone: "warm" },
    linkConfirmedAt: "2026-08-01T00:00:00Z",
    inquiries: [],
    drafts: [],
    gmailAvailable: false,
    gmailConnected: false,
    ...overrides,
  };
}

describe("the readiness model (§14): named requirements, no percentage", () => {
  it("all three required items done means ready to go live", () => {
    const r = deriveReadiness(inputs());
    expect(r.required.map((i) => i.key)).toEqual(["package", "voice", "link"]);
    expect(r.required.every((i) => i.done)).toBe(true);
    expect(r.readyToGoLive).toBe(true);
  });

  it("a package without an exact price does not count", () => {
    const r = deriveReadiness(inputs({ packages: [{ price_from_eur: null }] }));
    expect(r.required.find((i) => i.key === "package")?.done).toBe(false);
    expect(r.readyToGoLive).toBe(false);
  });

  it("an empty voice profile object is not a confirmed voice", () => {
    expect(
      deriveReadiness(inputs({ voiceProfile: {} })).required.find((i) => i.key === "voice")?.done
    ).toBe(false);
    expect(
      deriveReadiness(inputs({ voiceProfile: null })).readyToGoLive
    ).toBe(false);
  });

  it("an inquiry arriving through a tagged channel proves the link is live", () => {
    const r = deriveReadiness(
      inputs({
        linkConfirmedAt: null,
        inquiries: [{ source: "form", src_channel: "ig" }],
      })
    );
    expect(r.required.find((i) => i.key === "link")?.done).toBe(true);
  });

  it("optional items never gate go-live", () => {
    const r = deriveReadiness(inputs({ inquiries: [], drafts: [] }));
    expect(r.optional.every((i) => !i.done)).toBe(true);
    expect(r.readyToGoLive).toBe(true);
  });

  it("the Gmail item only exists while the connect surface is enabled", () => {
    expect(
      deriveReadiness(inputs()).optional.some((i) => i.key === "gmail")
    ).toBe(false);
    const withGmail = deriveReadiness(inputs({ gmailAvailable: true }));
    expect(withGmail.optional.find((i) => i.key === "gmail")?.done).toBe(false);
  });

  it("a recorded outcome marks the first real reply", () => {
    const r = deriveReadiness(inputs({ drafts: [{ outcome: "edited" }] }));
    expect(r.optional.find((i) => i.key === "firstReply")?.done).toBe(true);
  });
});
