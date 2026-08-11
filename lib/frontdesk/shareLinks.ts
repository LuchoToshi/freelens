/**
 * The one builder for a freelancer's share links. Used by the setup share
 * step and the inbox checklist — the ?src= tags here are what the admin
 * funnel reads, so they exist in exactly one place.
 */
export const SHARE_TAGS = ["ig", "tt", "sig"] as const;
export type ShareTag = (typeof SHARE_TAGS)[number];

export function shareLinks(origin: string, handle: string): {
  base: string;
  variants: { tag: ShareTag; url: string }[];
} {
  const base = `${origin}/${handle}`;
  return {
    base,
    variants: SHARE_TAGS.map((tag) => ({ tag, url: `${base}?src=${tag}` })),
  };
}
