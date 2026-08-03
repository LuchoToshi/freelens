"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/components/i18n/locale-provider";

export function FinalCtaSection() {
  const t = useT();
  return (
    <section className="border-t border-[var(--fl-line)]">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 py-20 text-center sm:px-8 sm:py-28">
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          {t.home.finalCta.heading}
        </h2>
        <Link
          href="/tool"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[var(--fl-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)]"
        >
          {t.home.finalCta.cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
