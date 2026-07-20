import { HeroSection } from "@/components/home/hero-section";
import { TrustSection } from "@/components/home/trust-section";
import { MomentsSection } from "@/components/home/moments-section";
import { WalkthroughSection } from "@/components/home/walkthrough-section";
import { PrivacySection } from "@/components/home/privacy-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <HeroSection />
      <TrustSection />
      <MomentsSection />
      <WalkthroughSection />
      <PrivacySection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}
