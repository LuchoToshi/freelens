import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Why Freelens exists — the decision layer for freelancers",
  description:
    "Freelens is the decision layer between your bank account and your bookkeeping. It complements your tools and turns one incoming payment into a simple, trustworthy plan — so paying yourself feels safe, not stressful.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-12 sm:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back
        </Link>

        {/* Intro */}
        <header className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            Why Freelens exists
          </span>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-[var(--fl-ink)] sm:text-5xl">
            Paying yourself should feel safe, not stressful.
          </h1>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            Freelens exists to make one recurring moment calm: a client finally
            pays, and you need to know what you can actually do with the money.
          </p>
        </header>

        {/* The moment */}
        <section className="flex flex-col gap-4">
          <p className="text-lg leading-relaxed text-[var(--fl-ink)]">
            A client finally pays. The bank balance suddenly looks healthy. For a
            moment it feels like you&apos;ve made it.
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            Then the questions start. How much belongs to VAT? Can I finally pay
            myself? Can I buy that new lens, or should I wait? Will I regret this in
            three months when the taxes arrive?
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            Creative freelancers are rarely held back by their craft. They&apos;re
            held back by uncertainty around money — not because they&apos;re
            irresponsible, but because the tools built for them answer a different
            question.
          </p>
        </section>

        {/* Wrong question */}
        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            The usual tools answer a different question.
          </h2>
          <ul className="flex flex-col gap-2 text-base leading-relaxed text-[var(--fl-slate)]">
            <li>Banking apps show your balance.</li>
            <li>Accounting software records what happened.</li>
            <li>Tax software helps you file.</li>
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
            Freelens is the decision layer between your bank account and your
            bookkeeping.
          </h2>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            It sits between the two and turns raw financial activity into
            actionable guidance. One incoming payment becomes a simple plan:
            reserve this for VAT, protect that for tax, this is probably yours to
            pay yourself. No spreadsheets, no accounting degree, no unnecessary
            complexity.
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            It complements the rest of your stack — banking apps, accounting
            software, invoicing tools, spreadsheets all keep their place. Freelens
            doesn&apos;t replace them; it helps you decide when to pay yourself, how
            much to set aside, and how to stay ahead of obligations without
            guessing.
          </p>
        </section>

        {/* Trust and clarity */}
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            Built on trust and clarity.
          </h2>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            The product favours deterministic logic, transparent assumptions, and
            explainable outputs over &ldquo;magic.&rdquo; Where automation helps, it
            stays bounded and auditable, with clear limits and sources. Every number
            comes with a reason: you know why it appears, what it means, and what
            you can do next.
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            Freelens is intentionally opinionated. It focuses on one recurring
            decision instead of trying to become another finance platform.
          </p>
        </section>

        {/* Privacy */}
        <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-ink)] p-6 text-white sm:p-8">
          <h2 className="font-serif text-2xl font-medium">
            Your numbers stay on your device.
          </h2>
          <p className="text-base leading-relaxed text-[#9db4d1]">
            No account. No bank connection. No cloud required. Your figures are
            saved locally in your browser and never uploaded to Freelens — and you
            can clear them at any time.
          </p>
        </section>

        {/* Vision + integrations */}
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            Where this is going.
          </h2>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            Freelens wants to become the trusted financial decision layer for
            independent creatives — not replacing accountants or bookkeeping, but
            making everyday money decisions feel calm instead of stressful.
          </p>
          <p className="text-lg leading-relaxed text-[var(--fl-slate)]">
            Today everything is entered manually. Over time, optional conveniences
            like CSV import and read-only imports may follow — always optional,
            never required, and never a bank login. As Freelens expands, new
            country-specific logic is added carefully, with local verification and
            visible proof where it matters. The core promise stays the same: help
            freelancers make better money decisions with confidence.
          </p>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-start gap-4 border-t border-[var(--fl-line)] pt-8">
          <p className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            Try your latest payment.
          </p>
          <p className="text-base leading-relaxed text-[var(--fl-slate)]">
            See what you can safely pay yourself in about a minute.
          </p>
          <Link
            href="/tool"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[var(--fl-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            See what I can pay myself
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
