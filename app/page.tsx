"use client";

import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { TwoMoments } from "@/components/home/two-moments";
import { FlatRuleTable } from "@/components/design/flat-rule-table";
import { SignupSection } from "@/components/home/signup-section";
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
 *   1. Hero          the claim, and what they get instead
 *   2. Two moments   something to act on, before any further reading
 *   3. Flat rule     the claim proven, from the engine, both directions
 *   4. Problem       why the number they just saw is that number
 *   5. How it works  what the rest of the product does with it
 *   6. Accuracy      why to believe the number
 *   7. Signup        the one ask, tied to the config being checkable
 *   8. Privacy       why it is safe to have typed it
 *   9. FAQ           the objections that are left
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
      <FlatRuleSection />
      <ProblemSection />
      <HowItWorksSection />
      <AccuracySection />
      <SignupSection />
      <PrivacySection />
      <FaqSection />
    </main>
  );
}

/**
 * The strongest claim on the site, promoted from three clicks deep on
 * /accuracy to directly under the calculator. The table is the shared
 * engine-computed component, so this section and /accuracy can never disagree.
 */
function FlatRuleSection() {
  const t = useT();
  return (
    <section
      aria-label={t.home.flatRule.ariaLabel}
      className="border-t border-[var(--fl-line)] bg-white"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-16 sm:px-8 sm:py-20">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {t.home.flatRule.eyebrow}
        </span>
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          {t.home.flatRule.heading}
        </h2>
        <p className="text-base leading-relaxed text-[var(--fl-slate)]">
          {t.accuracyPage.flatRule.intro}
        </p>
        <FlatRuleTable />
        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
          {t.accuracyPage.flatRule.whyItMatters}
        </p>
        <Link
          href="/accuracy"
          className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
        >
          {t.home.flatRule.link}
        </Link>
      </div>
    </section>
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
