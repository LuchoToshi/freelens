import type { MetadataRoute } from "next";

/**
 * Static marketing and tool routes only (master spec §23.3). Freelancer
 * pages (/[handle]) and every authenticated or API surface stay out by
 * construction: the list below is the whole sitemap, so no account,
 * inquiry, client, quote or calculator-result data can ever leak into it.
 * Previews emit an empty sitemap.
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://frlns.com";

const MARKETING_ROUTES = [
  "",
  "/about",
  "/accuracy",
  "/methodology",
  "/privacy",
  "/tarief",
  "/offertes",
  "/rekentools",
  "/tool",
  "/try",
  "/demo",
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.VERCEL_ENV !== "production") return [];
  return MARKETING_ROUTES.map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
}
