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
      <ProblemSection />
      <HowItWorksSection />
      <PrivacySection />
      <AccuracySection />
      <FaqSection />
      <FinalCtaSection />
    </main>
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
