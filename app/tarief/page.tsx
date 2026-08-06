import type { Metadata } from "next";
import { TariefView } from "@/components/rate/tarief-view";
import { BackLink } from "@/components/i18n/back-link";
import { en } from "@/lib/i18n/en";
import { container } from "@/components/container";

// English, because that is what is prerendered and what crawlers see. The
// Dutch title is applied on the client once the visitor's choice is known.
export const metadata: Metadata = {
  title: en.meta.tarief.title,
  description: en.meta.tarief.description,
};

export default function TariefPage() {
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className={`${container} flex flex-col gap-8 py-12`}>
        <BackLink />
        <TariefView />
      </div>
    </main>
  );
}
