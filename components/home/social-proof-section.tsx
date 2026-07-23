import Link from "next/link";

// Behaviour-framed outcomes (what Freelens changes), the product's promise,
// deliberately NOT presented as quotes from invented people. Real freelancer
// stories replace these once we have them.
const OUTCOMES = [
  "After every invoice, you know what to set aside.",
  "No more year-end tax surprises.",
  "A calm five-minute weekly habit.",
];

export function SocialProofSection() {
  return (
    <section
      aria-label="From real freelancers"
      className="border-t border-[var(--fl-line)]"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          From real freelancers
        </span>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          Real stories, coming soon.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
          We&apos;d rather show real freelancer experiences than invented quotes,
          so we&apos;re gathering them now. Here&apos;s what Freelens is built to
          change day to day.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {OUTCOMES.map((text) => (
            <li
              key={text}
              className="rounded-2xl border border-dashed border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6 text-base font-medium text-[var(--fl-ink)]"
            >
              {text}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-[var(--fl-slate)]">
          Used Freelens and want your story here?{" "}
          <Link
            href="/about"
            className="font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
          >
            Read why we built it
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
