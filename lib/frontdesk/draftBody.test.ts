import { describe, expect, it } from "vitest";
import { bodyFromMailto, clipboardBody, mailtoHref } from "@/lib/frontdesk/draftBody";

const SIGN_OFF = "ciao";
const BODY = `Hi Lisa,

A June wedding sounds wonderful. My full day starts at € 1.950.

${SIGN_OFF}`;

describe("what leaves the product is what was shown (handoff §6, §16)", () => {
  it("the mailto carries the draft byte-for-byte", () => {
    expect(bodyFromMailto(mailtoHref("lisa@example.com", "Your inquiry", BODY))).toBe(BODY);
  });

  it("the clipboard carries the draft byte-for-byte", () => {
    expect(clipboardBody(BODY)).toBe(BODY);
  });

  it("the two paths carry the identical string", () => {
    expect(bodyFromMailto(mailtoHref("a@b.co", "s", BODY))).toBe(clipboardBody(BODY));
  });

  it("SIGN-OFF INTEGRITY: casing, punctuation and whitespace survive exactly", () => {
    for (const signOff of ["ciao", "Ciao", "Groetjes, Emma", "  spaced  ", "x.y-z"]) {
      const body = `Hi,\n\nText.\n\n${signOff}`;
      const out = bodyFromMailto(mailtoHref("a@b.co", "s", body));
      expect(out.endsWith(signOff), signOff).toBe(true);
      expect(out).toBe(body);
    }
  });

  it("characters that would break a naive encoder survive the round trip", () => {
    const body = "Prijs: € 1.950 & 50% aanbetaling?\n\nGroetjes, Emma";
    expect(bodyFromMailto(mailtoHref("a@b.co", "s", body))).toBe(body);
  });

  it("the href uses CRLF, which is the only transformation applied", () => {
    const href = mailtoHref("a@b.co", "s", "one\ntwo");
    expect(decodeURIComponent(href.split("&body=")[1])).toBe("one\r\ntwo");
  });
});
