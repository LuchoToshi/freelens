"use client";

import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { TwoMoments } from "@/components/home/two-moments";
import { ProblemSection } from "@/components/home/problem-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { PrivacySection } from "@/components/home/privacy-section";
import { FaqSection } from "@/components/home/faq-section";
import { ConfidenceBlock } from "@/components/design/confidence-block";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";
import { container } from "@/components/container";

/**
 * One narrative, in the order a visitor actually needs it.
 *
 *   1. Hero          the problem, and what they get instead
 *   2. Two moments   something to act on, before any further reading
 *   3. Problem       why the number they just saw is that number
 *   4. How it works  what the rest of the product does with it
 *   5. Accuracy      why to believe the number
 *   6. Privacy       why it is safe to have typed it
 *   7. FAQ           the objections that are left
 *
 * Three sections were removed rather than reordered. A positioning strip that
 * said "the decision layer between your bank account and your bookkeeping" sat
 * second, which spent the most valuable slot on the page on an abstraction. A
 * "Real stories, coming soon" band was an empty state shipped as a section. A
 * separate final-CTA band duplicated the footer directly above it.
 */
export default function Home() {
  const t = useT();
  useDocumentTitle(t.meta.home.title, t.meta.home.description);
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <HeroSection />
      <TwoMoments />
      <ProblemSection />
      <HowItWorksSection />
      <AccuracySection />
      <PrivacySection />
      <FaqSection />
    </main>
  );
}

function AccuracySection() {
  const t = useT();
  return (
    <section
      aria-label={t.home.accuracy.ariaLabel}
      className="border-t border-[var(--fl-line)] bg-white"
    >
      <div className={`${container} flex flex-col gap-5 py-16 sm:py-20`}>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {t.home.accuracy.eyebrow}
        </span>
        <h2 className="font-serif text-2xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-3xl">
          {t.home.accuracy.heading}
        </h2>
        <ConfidenceBlock
          sentence={t.home.accuracy.sentence}
          detail={t.home.accuracy.detail}
        />
        <Link
          href="/accuracy"
          className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
        >
          {t.home.accuracy.link}
        </Link>
      </div>
    </section>
  );
}
