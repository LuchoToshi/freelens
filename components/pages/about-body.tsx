"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BackLink } from "@/components/i18n/back-link";
import { container } from "@/components/container";
import { primaryButtonClass } from "@/components/app/styles";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";

const SECTIONS = ["what", "boundary", "trust", "tools", "going"] as const;

/** The rebooking-first story, honest about the two data zones. */
export function AboutPageBody() {
  const t = useT();
  const a = t.aboutPage;
  useDocumentTitle(t.meta.about.title, t.meta.about.description);
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className={`${container} flex max-w-3xl flex-col gap-10 py-12`}>
        <BackLink />
        <header className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {a.eyebrow}
          </span>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-[var(--fl-ink)] sm:text-5xl">
            {a.heading}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">{a.intro}</p>
        </header>

        {SECTIONS.map((key) => {
          const section = a[key] as { h: string; p1: string; p2?: string };
          return (
            <section key={key} className="flex flex-col gap-3">
              <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
                {section.h}
              </h2>
              <p className="text-base leading-relaxed text-[var(--fl-slate)]">{section.p1}</p>
              {section.p2 && (
                <p className="text-base leading-relaxed text-[var(--fl-slate)]">{section.p2}</p>
              )}
            </section>
          );
        })}

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/#waitlist" className={primaryButtonClass}>
            {a.ctaPrimary}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
