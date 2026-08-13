import { describe, expect, it } from "vitest";
import { chromeVariant, isFrontdeskPath, isValidHandle } from "@/lib/frontdesk/handles";

describe("handles", () => {
  it("accepts normal handles", () => {
    for (const h of ["demo-emma", "emma", "studio-42", "abc"]) {
      expect(isValidHandle(h), h).toBe(true);
    }
  });

  it("rejects bad shapes", () => {
    for (const h of ["ab", "-emma", "Emma", "emma_v", "a".repeat(31), "wp-admin.php", ""]) {
      expect(isValidHandle(h), h).toBe(false);
    }
  });

  it("rejects every reserved segment", () => {
    for (const h of ["about", "try", "tool", "inbox", "setup", "admin", "api", "www"]) {
      expect(isValidHandle(h), h).toBe(false);
    }
  });

  it("gates chrome on FrontDesk paths only", () => {
    expect(isFrontdeskPath("/inbox")).toBe(true);
    expect(isFrontdeskPath("/setup")).toBe(true);
    expect(isFrontdeskPath("/admin")).toBe(true);
    expect(isFrontdeskPath("/demo-emma")).toBe(true);
    expect(isFrontdeskPath("/")).toBe(false);
    expect(isFrontdeskPath("/about")).toBe(false);
    expect(isFrontdeskPath("/try")).toBe(false);
    expect(isFrontdeskPath("/demo-emma/extra")).toBe(false);
    expect(isFrontdeskPath("/Not-A-Handle")).toBe(false);
  });

  it("classifies chrome variants from one source", () => {
    // App surfaces: no chrome at all.
    for (const p of ["/inbox", "/setup", "/admin", "/demo-emma"]) {
      expect(chromeVariant(p), p).toBe("app");
    }
    // FrontDesk marketing pages get the FrontDesk footer.
    expect(chromeVariant("/")).toBe("frontdesk");
    expect(chromeVariant("/about")).toBe("frontdesk");
    // Known legacy routes keep the original footer.
    for (const p of ["/rekentools", "/tarief", "/tool", "/offertes", "/accuracy", "/methodology", "/try", "/privacy"]) {
      expect(chromeVariant(p), p).toBe("legacy");
    }
    // Unknown routes default to legacy, never to the FrontDesk variant.
    expect(chromeVariant("/some/unknown/route")).toBe("legacy");
  });
});
