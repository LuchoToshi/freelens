/**
 * Page Appearance, deliberately limited (handoff §11).
 *
 * Three choices and nothing else: a background tone, one accent, light or
 * dark. Layout, typography, spacing and contrast stay with Freelens, which is
 * what keeps every page readable without the freelancer having to be a
 * designer. The values are a closed set, validated here and again at the
 * write, so an unknown value can never reach a public page's stylesheet.
 */
export const TONES = ["#FAF8F4", "#F2EEE6", "#EFE6DA", "#E8EDE6"] as const;
export const ACCENTS = ["#E4572E", "#1A1A1A", "#3F7A4A", "#C07F16"] as const;
export const THEMES = ["light", "dark"] as const;

export type Tone = (typeof TONES)[number];
export type Accent = (typeof ACCENTS)[number];
export type Theme = (typeof THEMES)[number];

export interface Appearance {
  tone: Tone;
  accent: Accent;
  theme: Theme;
  coverUrl: string | null;
}

/** What a page with no stored appearance looks like: exactly today's page. */
export const DEFAULT_APPEARANCE: Appearance = {
  tone: TONES[0],
  accent: ACCENTS[0],
  theme: "light",
  coverUrl: null,
};

/**
 * Read whatever is in the jsonb column into a safe Appearance. Anything
 * unrecognised falls back to the default rather than being passed through:
 * the column is writable by the account, and a public page must not render a
 * value this module has never heard of.
 */
export function parseAppearance(stored: unknown): Appearance {
  if (!stored || typeof stored !== "object") return DEFAULT_APPEARANCE;
  const raw = stored as Record<string, unknown>;
  return {
    tone: pick(raw.tone, TONES, DEFAULT_APPEARANCE.tone),
    accent: pick(raw.accent, ACCENTS, DEFAULT_APPEARANCE.accent),
    theme: pick(raw.theme, THEMES, DEFAULT_APPEARANCE.theme),
    coverUrl: typeof raw.cover_url === "string" && raw.cover_url.startsWith("https://")
      ? raw.cover_url
      : null,
  };
}

/** The shape stored in the column; snake_case, like every other stored key. */
/** Is this the untouched product look? Compared by value, not by identity. */
export function isDefaultAppearance(appearance: Appearance): boolean {
  return (
    appearance.tone === DEFAULT_APPEARANCE.tone &&
    appearance.accent === DEFAULT_APPEARANCE.accent &&
    appearance.theme === DEFAULT_APPEARANCE.theme &&
    appearance.coverUrl === null
  );
}

export function serializeAppearance(appearance: Appearance): Record<string, unknown> {
  return {
    tone: appearance.tone,
    accent: appearance.accent,
    theme: appearance.theme,
    cover_url: appearance.coverUrl,
  };
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/**
 * The public page's own palette. Dark keeps the same contrast relationship as
 * light, inverted: text on its ground, hairlines at a fraction of it. The
 * accent is only ever used for the call to action and small marks, never for
 * text or for a surface behind text.
 */
export function appearanceStyle(appearance: Appearance): Record<string, string> {
  const dark = appearance.theme === "dark";
  const ink = dark ? "#F7F5F1" : "#1A1A1A";
  const ground = dark ? "#171614" : appearance.tone;
  // A surface that sits on the ground: the card and field background. On a
  // dark page this must not be white, or every input becomes a glaring box
  // with unreadable text in it.
  const surface = dark ? "#211F1C" : "#FFFFFF";
  const accent = usableAccent(appearance.accent, ground);

  return {
    // The public page's own family.
    "--fl-paper": ground,
    "--fl-ink": ink,
    "--fl-slate": dark ? "rgba(247,245,241,0.72)" : "rgba(26,26,26,0.66)",
    "--fl-line": dark ? "rgba(247,245,241,0.20)" : "rgba(26,26,26,0.14)",
    "--fl-accent": accent,
    "--fl-accent-text": accentTextColor(accent),

    // The intake form is built from FrontDesk components, which read the
    // --fd-* family. Without these the page background would go dark while
    // every label, heading and border stayed near-black on top of it, which
    // is exactly what happened the first time this shipped.
    "--fd-paper": ground,
    "--fd-paper-dim": dark ? "#201E1B" : "#F2EEE6",
    "--fd-surface": surface,
    "--fd-ink": ink,
    "--fd-slate": dark ? "rgba(247,245,241,0.74)" : "#6E675C",
    "--fd-line": dark ? "rgba(247,245,241,0.20)" : "#E5DFD3",
    "--fd-line-control": dark ? "rgba(247,245,241,0.42)" : "#8A8377",
    "--fd-focus-ring": dark ? "#F7F5F1" : "#1A1A1A",
    "--fd-error-text": dark ? "#F2A08A" : "#A8391F",
    "--fd-accent": accent,

    backgroundColor: ground,
    color: ink,
  };
}

/**
 * The accent, or the nearest usable stand-in.
 *
 * Two of the four accents are near-black, which is a good choice on paper and
 * an invisible button on the dark theme. Rather than refuse the combination or
 * silently keep a button nobody can see, the accent falls back to the page's
 * own ink when it cannot be told apart from the ground. The freelancer's
 * choice is honoured wherever it works, and the call to action is always
 * visible, which is the whole point of it.
 */
export function usableAccent(accent: string, ground: string): string {
  return contrast(accent, ground) >= 2.5 ? accent : ground === "#171614" ? "#F7F5F1" : "#1A1A1A";
}

/**
 * Readable text on the accent. The four accents differ enough in lightness
 * that one fixed text colour fails contrast on at least one of them, so the
 * text colour is derived rather than assumed: whichever of ink and paper
 * contrasts better with the chosen accent wins. This is the reason the
 * palette can stay a free choice without any of them producing an unreadable
 * button.
 */
export function accentTextColor(accent: string): "#FFFFFF" | "#1A1A1A" {
  return contrast(accent, "#FFFFFF") >= contrast(accent, "#1A1A1A") ? "#FFFFFF" : "#1A1A1A";
}

export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function luminance(hex: string): number {
  const n = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => {
    const v = parseInt(n.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
