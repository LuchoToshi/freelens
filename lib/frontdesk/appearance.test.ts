import { describe, expect, it } from "vitest";
import {
  ACCENTS,
  accentTextColor,
  appearanceStyle,
  contrast,
  TONES,
  usableAccent,
  DEFAULT_APPEARANCE,
  parseAppearance,
  serializeAppearance,
} from "@/lib/frontdesk/appearance";

describe("appearance is a closed set (handoff §11)", () => {
  it("a page with nothing stored looks exactly like today's page", () => {
    expect(parseAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance({})).toEqual(DEFAULT_APPEARANCE);
  });

  it("refuses a colour it has never heard of, rather than rendering it", () => {
    const parsed = parseAppearance({ tone: "#000000", accent: "red", theme: "neon" });
    expect(parsed.tone).toBe(DEFAULT_APPEARANCE.tone);
    expect(parsed.accent).toBe(DEFAULT_APPEARANCE.accent);
    expect(parsed.theme).toBe("light");
  });

  it("refuses a cover that is not an https URL", () => {
    expect(parseAppearance({ cover_url: "javascript:alert(1)" }).coverUrl).toBeNull();
    expect(parseAppearance({ cover_url: "http://example.com/a.jpg" }).coverUrl).toBeNull();
    expect(parseAppearance({ cover_url: "https://example.com/a.jpg" }).coverUrl).toBe(
      "https://example.com/a.jpg",
    );
  });

  it("round-trips through the stored shape", () => {
    const value = parseAppearance({
      tone: "#E8EDE6",
      accent: "#3F7A4A",
      theme: "dark",
      cover_url: "https://example.com/c.jpg",
    });
    expect(parseAppearance(serializeAppearance(value))).toEqual(value);
  });

  it("never paints text in the accent, and keeps ink readable on dark", () => {
    const dark = appearanceStyle(parseAppearance({ theme: "dark", accent: "#C07F16" }));
    expect(dark["--fl-ink"]).not.toBe("#C07F16");
    expect(dark["--fl-paper"]).not.toBe(DEFAULT_APPEARANCE.tone);
    expect(dark.color).toBe(dark["--fl-ink"]);
  });
});

describe("every accent stays readable (handoff §11 contrast)", () => {
  it("picks a text colour that clears 4.5:1 on each accent in the palette", () => {
    for (const accent of ACCENTS) {
      expect(contrast(accent, accentTextColor(accent)), accent).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps page text well clear of its ground in both themes", () => {
    for (const theme of ["light", "dark"] as const) {
      const style = appearanceStyle(parseAppearance({ theme }));
      expect(contrast(style["--fl-ink"], style["--fl-paper"]), theme).toBeGreaterThanOrEqual(7);
    }
  });
});

describe("every token the page renders with survives both themes", () => {
  // The bug this covers: the page painted its background from --fl-* while
  // the intake form kept reading the light --fd-* values, so a dark page had
  // near-black labels on a near-black ground.
  const READABLE = [
    ["--fd-ink", "--fd-paper", 7],
    ["--fl-ink", "--fl-paper", 7],
    ["--fd-ink", "--fd-surface", 7],
  ] as const;

  for (const theme of ["light", "dark"] as const) {
    for (const tone of TONES) {
      for (const accent of ACCENTS) {
        const style = appearanceStyle(parseAppearance({ theme, tone, accent }));

        it(`${theme}/${tone}/${accent}: text clears its ground`, () => {
          for (const [fg, bg, min] of READABLE) {
            expect(contrast(style[fg], style[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(min);
          }
        });

        it(`${theme}/${tone}/${accent}: the call to action is visible and readable`, () => {
          // Visible against the page it sits on...
          expect(contrast(style["--fl-accent"], style["--fl-paper"])).toBeGreaterThanOrEqual(2.5);
          // ...and readable in itself.
          expect(
            contrast(style["--fl-accent"], style["--fl-accent-text"]),
          ).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
  }

  it("keeps a near-black accent on paper, and swaps it out on the dark theme", () => {
    expect(usableAccent("#1A1A1A", "#FAF8F4")).toBe("#1A1A1A");
    expect(usableAccent("#1A1A1A", "#171614")).toBe("#F7F5F1");
    expect(usableAccent("#C07F16", "#171614")).toBe("#C07F16");
  });
});
