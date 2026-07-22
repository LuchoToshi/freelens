import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { ProblemSection } from "@/components/home/problem-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { PrivacySection } from "@/components/home/privacy-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";

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
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="font-serif text-2xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-3xl">
          Honest about what this is.
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-[var(--fl-slate)]">
          Freelens provides planning estimates based on the information and
          reserve rules you enter. It does not calculate your final tax
          assessment and is not tax advice. It doesn&apos;t replace the
          Belastingdienst, an accountant, or your bookkeeping.
        </p>
        <Link
          href="/accuracy"
          className="w-fit text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
        >
          Read our accuracy notes and official sources →
        </Link>
      </div>
    </section>
  );
}
