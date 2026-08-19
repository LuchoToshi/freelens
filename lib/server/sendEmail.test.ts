import { afterEach, describe, expect, it, vi } from "vitest";
import { sendEmail } from "./sendEmail";

const input = { to: "freelancer@example.com", subject: "Hi", html: "<p>hi</p>" };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("sendEmail", () => {
  it("logs the provider's response body, not just the status, on rejection", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response('{"message":"testing emails is restricted to your own email address"}', {
          status: 403,
        })
      )
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const ok = await sendEmail(input);

    expect(ok).toBe(false);
    const logged = errorSpy.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(logged).toContain("403");
    expect(logged).toContain("testing emails is restricted");
    // The one rule this module exists to keep: never log the address.
    expect(logged).not.toContain(input.to);
  });

  it("returns true without logging on a successful send", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const ok = await sendEmail(input);

    expect(ok).toBe(true);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("returns false without a network call when the key is unset", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const ok = await sendEmail(input);

    expect(ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
