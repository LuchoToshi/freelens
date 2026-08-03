import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TariefView } from "@/components/rate/tarief-view";

export const metadata: Metadata = {
  title: "Wat moet ik vragen? Your day rate, on the real Dutch tax rules",
  description:
    "Work out the day rate or project quote you need as a Dutch ZZP'er, using the real 2026 brackets, deductions and credits instead of a flat percentage. It tells you your floor, not what the market pays. Your numbers stay on this device.",
};

export default function TariefPage() {
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-12 sm:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back
        </Link>
        <TariefView />
      </div>
    </main>
  );
}
