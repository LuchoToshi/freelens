"use client";

import { ArrowRight } from "lucide-react";
import { container } from "@/components/container";
import { FrontdeskWaitlistForm } from "@/components/home/frontdesk-waitlist-form";
import { WorkedExample } from "@/components/home/worked-example";
import { primaryButtonClass } from "@/components/app/styles";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";

/**
 * The FrontDesk front door. One product, one story.
 *
 * Freelens is the brand; FrontDesk is what this page sells. The word "AI"
 * appears nowhere above the trust line: the drafted reply on the page is the
 * pitch, the mechanism is named honestly at the bottom. The page never claims
 * the product sends anything by itself or knows anyone's calendar — the same
 * honesty rules that govern the drafts govern this copy.
 *
 * The product is concierge-onboarded and pre-launch, so the primary CTA is
 * the early-access list (the existing double-opt-in waitlist), not the setup
 * wizard.
 */
export default function Home() {
  const t = useT();
  const f = t.home.frontdesk;
  useDocumentTitle(t.meta.home.title, t.meta.home.description);

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      {/* Hero: the pain, the promise, the list. */}
      <section className={`${container} flex flex-col gap-6 py-14 sm:py-20`}>
        <span className="inline-flex w-fit items-center rounded-full border border-[var(--fl-line)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fl-slate)]">
          {f.heroEyebrow}
        </span>
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-[var(--fl-ink)] sm:text-5xl lg:text-6xl">
          {f.heroTitle}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">{f.heroSub}</p>
        <a href="#early-access" className={`${primaryButtonClass} w-fit`}>
          {f.heroCta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </section>

      {/* The worked example: an inquiry, the reply beneath it. The pitch. */}
      <section
        aria-label={f.example.label}
        className="border-t border-[var(--fl-line)] bg-white"
      >
        <div className={`${container} flex flex-col gap-6 py-16 sm:py-20`}>
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {f.example.label}
          </h2>
          <WorkedExample data={f.example} />
        </div>
      </section>

      {/*
        Placeholder: a real receipt goes here once one exists — a named tester,
        a real booked job, a real number. Nothing fabricated ships; this slot
        renders nothing until then.
      */}

      {/* Three objections, answered in the order they surface. */}
      <section
        aria-label={f.objections.items[0].q}
        className="border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
      >
        <div className={`${container} py-16 sm:py-20`}>
          <div className="grid gap-4 sm:grid-cols-3">
            {f.objections.items.map((item) => (
              <div
                key={item.q}
                className="flex flex-col gap-2 rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-6"
              >
                <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">{item.q}</h2>
                <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The follow-up hook: its own moment, the strongest treatment left. */}
      <section
        aria-label={f.followup.q}
        className="border-t border-[var(--fl-line)] bg-[var(--fl-ink)] text-white"
      >
        <div className={`${container} flex flex-col gap-4 py-16 sm:py-20`}>
          <h2 className="max-w-2xl font-serif text-3xl font-medium leading-tight sm:text-4xl">
            {f.followup.q}
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-[#9db4d1]">{f.followup.a}</p>
        </div>
      </section>

      {/* Who it's for, the overflow capture, and the list: the soft close. */}
      <section
        id="early-access"
        aria-label={f.waitlist.heading}
        className="scroll-mt-16 border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
      >
        <div className={`${container} flex flex-col gap-6 py-16 sm:py-20`}>
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
              {f.waitlist.heading}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--fl-ink)]">
              {f.audience.line}
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--fl-slate)]">
              {f.waitlist.sub}
            </p>
            {/* Overflow capture: visually secondary, same form — the craft
                picker's "something else" is how adjacent crafts answer. */}
            <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{f.audience.overflow}</p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-7">
            <FrontdeskWaitlistForm />
          </div>
        </div>
      </section>

      {/* The mechanism, named honestly — the only "AI" on the page. */}
      <section aria-label={f.trust} className="border-t border-[var(--fl-line)] bg-white">
        <div className={`${container} py-10 sm:py-12`}>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--fl-slate)]">{f.trust}</p>
        </div>
      </section>
    </main>
  );
}
