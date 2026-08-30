import type { MetadataRoute } from "next";

/**
 * Environment-aware robots (master spec §23.3): preview deployments are never
 * indexed (Vercel also sends X-Robots-Tag: noindex on previews — this makes
 * the same promise at the robots layer), and in production the authenticated
 * surfaces are disallowed outright. Every authenticated page additionally
 * carries its own noindex meta.
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://frlns.com";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/inbox",
        "/setup",
        "/admin",
        "/clients",
        "/follow-ups",
        "/app",
        "/api/",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
