import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkipLink } from "@/components/skip-link";
import { Analytics } from "@vercel/analytics/next";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { en } from "@/lib/i18n/en";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// English, because that is what is prerendered and what crawlers see. The
// Dutch title is applied on the client once the visitor's choice is known.
export const metadata: Metadata = {
  title: en.meta.home.title,
  description: en.meta.home.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* `lang` above is the prerendered default. LocaleProvider rewrites it
            on the client once the visitor's choice is known. */}
        <LocaleProvider>
          <SkipLink />
          <SiteHeader />
          {/* Skip target. `tabIndex={-1}` because browsers do not reliably move
              focus to a non-focusable fragment target, so without it the link
              scrolls but leaves focus in the header. */}
          <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </div>
          <SiteFooter />
        </LocaleProvider>
        {/* Cookieless, and every event this app sends is a bare name: see
            lib/analytics.ts, where `track` has no second parameter. No figure
            a user types can reach it. */}
        <Analytics />
      </body>
    </html>
  );
}
