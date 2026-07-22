import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * A real closing moment (audit Q6): a full-width color band with an oversized
 * wordmark, one concise trust line, and a single primary action — the last page
 * of a portfolio, not dead space.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[var(--fl-ink)] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-14 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="font-serif text-5xl font-medium tracking-tight text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70 sm:text-7xl"
        >
          Freelens
        </Link>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-base leading-relaxed text-white/70">
            Not tax advice. A clear estimate to work from. Your numbers never
            leave your browser.
          </p>
          <Link
            href="/tool"
            className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-medium text-[var(--fl-ink)] transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
          >
            Process a payment
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
