import { describe, expect, it } from "vitest";
import { isFrontdeskPath, isValidHandle } from "@/lib/frontdesk/handles";

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
});
