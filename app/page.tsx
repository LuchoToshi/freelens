"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { container } from "@/components/container";
import { WaitlistForm } from "@/components/rebooking/waitlist-form";
import { linkButtonClass, primaryButtonClass, secondaryButtonClass } from "@/components/app/styles";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";
import { OFFER } from "@/lib/offer";

/**
 * The Rebooking front door.
 *
 * Everything above the fold is a question, a promise and a way onto the list.
 * The product is pre-launch and the page says so out loud: private beta,
 * first 25, founding price labelled founding. No screenshots of features that
 * do not exist, no invented users, no metrics.
 *
 * The calculators — the part of Freelens that is live today — keep a section
 * of their own near the end and their own routes; they are the proof that the
 * deterministic engine underneath this is real.
 */
export default function Home() {
  const t = useT();
  const r = t.home.rebooking;
  useDocumentTitle(t.meta.home.title, t.meta.home.description);

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      {/* Hero: the question. */}
      <section className={`${container} flex flex-col gap-6 py-14 sm:py-20`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex w-fit items-center rounded-full border border-[var(--fl-line)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fl-slate)]">
            {r.heroEyebrow}
          </span>
          <span className="inline-flex w-fit items-center rounded-full bg-[var(--fl-ink)] px-3 py-1 text-xs font-semibold text-white">
            {r.betaPill}
          </span>
        </div>
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-[var(--fl-ink)] sm:text-5xl lg:text-6xl">
          {r.heroQuestion}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
          {r.heroSub}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/try" className={primaryButtonClass}>
            {r.heroCtaTry}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a href="#waitlist" className={secondaryButtonClass}>
            {r.heroCta}
          </a>
        </div>
      </section>

      {/* How it will work — future tense on purpose; nothing here is live. */}
      <section
        aria-label={r.how.heading}
        className="border-t border-[var(--fl-line)] bg-white"
      >
        <div className={`${container} py-16 sm:py-20`}>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {r.how.eyebrow}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {r.how.heading}
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {r.how.steps.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-2">
                <span className="fl-tnum font-serif text-5xl font-medium text-[var(--fl-payout-fill)]">
                  {i + 1}
                </span>
                <h3 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The worked example: the record, the reason, the draft. The email may
          only reference facts in the record card above it — the product's
          no-fabrication rule applies to the marketing example too. */}
      <section
        aria-label={r.example.heading}
        className="border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
      >
        <div className={`${container} flex flex-col gap-6 py-16 sm:py-20`}>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
              {r.example.kicker}
            </span>
            <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
              {r.example.heading}
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="flex flex-col gap-5 rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
                  {r.example.recordLabel}
                </span>
                <p className="text-sm font-medium text-[var(--fl-ink)]">{r.example.recordName}</p>
                <p className="fl-tnum text-sm text-[var(--fl-slate)]">{r.example.recordProject}</p>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-[var(--fl-line)] pt-4">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
                  {r.example.reasonLabel}
                </span>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--fl-ink)]">
                  {r.example.reasonText}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-6">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
                {r.example.draftLabel}
              </span>
              <p className="text-sm font-medium text-[var(--fl-ink)]">{r.example.draftSubject}</p>
              <p className="whitespace-pre-line border-t border-[var(--fl-line)] pt-3 text-sm leading-relaxed text-[var(--fl-ink)]">
                {r.example.draftBody}
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-[var(--fl-slate)]">{r.example.micro}</p>
        </div>
      </section>

      {/* The honest status, the founding offer, and the list. */}
      <section
        id="waitlist"
        aria-label={r.waitlist.heading}
        className="scroll-mt-16 border-t border-[var(--fl-line)] bg-[var(--fl-surface-stage)]"
      >
        <div className={`${container} flex flex-col gap-8 py-16 sm:py-20`}>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
              {r.offer.eyebrow}
            </span>
            <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
              {r.offer.heading}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--fl-slate)]">
              {r.offer.body}
            </p>
            <p className="text-lg font-medium text-[var(--fl-ink)]">{fill(r.offer.priceLine, { spots: OFFER.spots, founding: OFFER.founding, yearly: OFFER.standardYear, monthly: OFFER.standardMonth })}</p>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--fl-slate)]">
              {fill(r.offer.priceNote, { spots: OFFER.spots, founding: OFFER.founding, yearly: OFFER.standardYear, monthly: OFFER.standardMonth })}
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-7">
            <h3 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
              {r.waitlist.heading}
            </h3>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* The line the product never crosses. */}
      <section
        aria-label={r.trust.heading}
        className="border-t border-[var(--fl-line)] bg-[var(--fl-ink)] text-white"
      >
        <div className={`${container} flex flex-col gap-4 py-16 sm:py-20`}>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9db4d1]">
            {r.trust.eyebrow}
          </span>
          <h2 className="max-w-2xl font-serif text-3xl font-medium leading-tight sm:text-4xl">
            {r.trust.heading}
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[#9db4d1]">
            {r.trust.body}
          </p>
          <ul className="mt-2 flex flex-col gap-2.5">
            {r.trust.points.map((point) => (
              <li key={point} className="max-w-2xl text-base font-medium text-white/90">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The live half of Freelens: the calculators. */}
      <section
        aria-label={r.tools.heading}
        className="border-t border-[var(--fl-line)] bg-white"
      >
        <div className={`${container} flex flex-col gap-5 py-16 sm:py-20`}>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {r.tools.eyebrow}
          </span>
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {r.tools.heading}
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--fl-slate)]">
            {r.tools.body}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { card: t.rekentoolsPage.tarief, href: "/tarief" },
              { card: t.rekentoolsPage.tool, href: "/tool" },
            ].map(({ card, href }) => (
              <div
                key={href}
                className="flex flex-col items-start gap-2 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-5"
              >
                <h3 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{card.body}</p>
                <Link href={href} className={`${linkButtonClass} mt-auto w-fit`}>
                  {card.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            {r.tools.teaser}{" "}
            <Link
              href="/accuracy"
              className="font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
            >
              {r.tools.teaserCta}
            </Link>
          </p>
          <Link href="/rekentools" className={`${linkButtonClass} w-fit`}>
            {r.tools.allCta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
