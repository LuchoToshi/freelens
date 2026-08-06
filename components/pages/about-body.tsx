"use client";

import Link from "next/link";
import { BackLink } from "@/components/i18n/back-link";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";
import { ArrowRight } from "lucide-react";
import { container } from "@/components/container";

export function AboutPageBody() {
  const t = useT();
  useDocumentTitle(t.meta.about.title, t.meta.about.description);
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className={`${container} flex flex-col gap-10 py-12`}>
        <BackLink />

        {/* Intro */}
        <header className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {t.aboutPage.eyebrow}
          </span>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-[var(--fl-ink)] sm:text-5xl">
            {t.aboutPage.heading}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.lead}
          </p>
        </header>

        {/* The moment */}
        <section className="flex flex-col gap-4">
          <p className="text-lg leading-relaxed text-[var(--fl-ink)]">
            {t.aboutPage.moment}
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.questions}
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.heldBack}
          </p>
        </section>

        {/* Wrong question */}
        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            {t.aboutPage.toolsHeading}
          </h2>
          <ul className="flex flex-col gap-2 text-base leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
          <p className="text-base leading-relaxed text-[var(--fl-ink)]">
            None of them answer the one that matters most the moment you get paid:
            <span className="font-medium">
              {" "}
              what can I safely do with this money today?
            </span>
          </p>
        </section>

        {/* Decision layer */}
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            {t.aboutPage.layerHeading}
          </h2>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.layerBody}
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.complements}
          </p>
        </section>

        {/* Trust and clarity */}
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            {t.aboutPage.trustHeading}
          </h2>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.trustBody}
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.opinionated}
          </p>
        </section>

        {/* Privacy */}
        <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-ink)] p-6 text-white sm:p-8">
          <h2 className="font-serif text-2xl font-medium">
            {t.aboutPage.privacyHeading}
          </h2>
          <p className="text-base leading-relaxed text-[#9db4d1]">
            {t.aboutPage.privacyBody}
          </p>
        </section>

        {/* Vision + integrations */}
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            {t.aboutPage.futureHeading}
          </h2>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.futureBody}
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.futureNote}
          </p>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-start gap-4 border-t border-[var(--fl-line)] pt-8">
          <p className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            {t.aboutPage.ctaHeading}
          </p>
          <p className="text-base leading-relaxed text-[var(--fl-slate)]">
            {t.aboutPage.ctaBody}
          </p>
          <Link
            href="/tool"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[var(--fl-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {t.aboutPage.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
