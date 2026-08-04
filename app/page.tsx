"use client";

import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { ProblemSection } from "@/components/home/problem-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { ForkSection } from "@/components/home/fork-section";
import { PrivacySection } from "@/components/home/privacy-section";
import { FaqSection } from "@/components/home/faq-section";
import { SocialProofSection } from "@/components/home/social-proof-section";
import { ConfidenceBlock } from "@/components/design/confidence-block";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";

export default function Home() {
  const t = useT();
  useDocumentTitle(t.meta.home.title, t.meta.home.description);
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <HeroSection />
      <PositioningStrip />
      {/* The first thing on the page a visitor can act on. Both routes get
          equal billing here; the hero has already made the one promise. */}
      <ForkSection />
      <ProblemSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PrivacySection />
      <AccuracySection />
      <FaqSection />
    </main>
  );
}

function PositioningStrip() {
  const t = useT();
  return (
    <section
      aria-label={t.home.positioning.ariaLabel}
      className="border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
    >
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="text-lg leading-relaxed text-[var(--fl-ink)] sm:text-xl">
          <span className="font-medium">
            {t.home.positioning.lead}
          </span>{" "}
          <span className="text-[var(--fl-slate)]">
            {t.home.positioning.body}
          </span>
        </p>
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
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-16 sm:px-8 sm:py-20">
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
