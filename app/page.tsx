import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { ProblemSection } from "@/components/home/problem-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { PrivacySection } from "@/components/home/privacy-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { ConfidenceBlock } from "@/components/design/confidence-block";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <HeroSection />
      <PositioningStrip />
      <ProblemSection />
      <HowItWorksSection />
      <PrivacySection />
      <AccuracySection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}

function PositioningStrip() {
  return (
    <section
      aria-label="What Freelens is"
      className="border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
    >
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="text-lg leading-relaxed text-[var(--fl-ink)] sm:text-xl">
          <span className="font-medium">
            The decision layer between your bank account and your bookkeeping.
          </span>{" "}
          <span className="text-[var(--fl-slate)]">
            Your banking and bookkeeping already show what exists and what
            happened. Freelens turns that into what you can safely do next. It
            complements your tools, it doesn&apos;t replace them.
          </span>
        </p>
      </div>
    </section>
  );
}

function AccuracySection() {
  return (
    <section
      aria-label="Accuracy and limitations"
      className="border-t border-[var(--fl-line)] bg-white"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-16 sm:px-8 sm:py-20">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          Accuracy
        </span>
        <h2 className="font-serif text-2xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-3xl">
          Honest about what this is.
        </h2>
        <ConfidenceBlock
          sentence="Freelens gives you a clear planning estimate to act on, never a claim about your final tax."
          detail={
            <>
              It provides planning estimates based on the information and reserve
              rules you enter. It does not calculate your final tax assessment,
              is not tax advice, and doesn&apos;t replace the Belastingdienst, an
              accountant, or your bookkeeping.
            </>
          }
        />
        <Link
          href="/accuracy"
          className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
        >
          Read our accuracy notes and official sources →
        </Link>
      </div>
    </section>
  );
}
