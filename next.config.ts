import type { NextConfig } from "next";

// Avatars live in Supabase Storage's public frontdesk-avatars bucket; this
// scopes the image optimizer to exactly that path on exactly our project's
// host. The upload flow appends a ?v= cache-buster, so `search` is left
// unset (any query) on purpose. Without the env var (a bare checkout) the
// list is empty, which is fine: no Supabase env means no profiles and no
// avatars to render either.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: "https",
            hostname: new URL(supabaseUrl).hostname,
            pathname: "/storage/v1/object/public/frontdesk-avatars/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
