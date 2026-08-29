import type { Metadata } from "next";

/**
 * Wizard-of-Oz artifact for the one designer contact Shrf has lined up —
 * not a Release 0 feature and never meant to reach a real freelancer. This
 * is a hand-built stand-in for what the agent would produce automatically:
 * a front-desk page, one drafted reply, and a plain-language account of
 * what was read from the site versus inferred from it.
 *
 * `content` below holds placeholders. Swap them for Researcher's extracted
 * facts once the designer's name and site land, then this is postable in
 * minutes. Deploy as a Vercel preview off this throwaway branch — noindex
 * below keeps it out of search regardless.
 */
export const metadata: Metadata = {
  title: "Front desk preview (internal — do not share the URL)",
  robots: { index: false, follow: false },
};

const content = {
  designerName: "[[DESIGNER_NAME]]",
  siteUrl: "[[SITE_URL]]",
  initials: "[[INITIALS]]",
  profession: "[[PROFESSION]]",
  city: "[[CITY]]",
  bio: "[[ONE_LINE_BIO — voice-matched from the site's own writing, not written by us]]",
  services: [
    { name: "[[SERVICE_1_NAME]]", note: "[[SERVICE_1_NOTE]]", price: "[[PRICE_1]]" },
    { name: "[[SERVICE_2_NAME]]", note: "[[SERVICE_2_NOTE]]", price: "[[PRICE_2 or Ask for a quote]]" },
  ],
  sampleClientName: "[[SAMPLE_CLIENT_NAME]]",
  sampleEnquiry: "[[SAMPLE_ENQUIRY_TEXT — a plausible enquiry for this profession]]",
  draftReply:
    "[[DRAFT_REPLY_TEXT — matches the sign-off and tone read from the site, uses PRICE_1 verbatim, never invents a figure]]",
  facts: [
    { label: "Name and profession", source: "confirmed" as const },
    { label: "City", source: "confirmed" as const },
    { label: "Prices", source: "confirmed" as const },
    { label: "How you sign off and the tone of your replies", source: "inferred" as const },
    { label: "[[ONE_UNCERTAIN_FACT]]", source: "inferred" as const },
  ],
  question: "[[THE_ONE_QUESTION — e.g. is PRICE_1 still your starting price?]]",
  likelyAnswer: "[[LIKELY_ANSWER — pre-selected]]",
  altAnswers: ["[[ALT_ANSWER_1]]", "[[ALT_ANSWER_2]]"],
};

const primaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-6 text-base font-medium text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-focus-ring)]";

export default function WozPreviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-10 px-4 py-10 sm:py-14">
      <span className="w-fit rounded-full border border-[var(--fd-line-control)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--fd-slate)]">
        WoZ artifact &middot; internal preview, not the live product
      </span>

      <section aria-labelledby="section-a" className="flex flex-col gap-4">
        <h2 id="section-a" className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
          A &middot; The front desk, as a client would see it
        </h2>
        <div className="rounded-2xl border border-[var(--fd-line)] bg-white p-6">
          <div
            aria-hidden
            className="mb-4 flex size-14 items-center justify-center rounded-full border border-[var(--fd-line)] bg-[var(--fd-paper-dim)] text-sm text-[var(--fd-slate)]"
          >
            {content.initials}
          </div>
          <h1 className="text-2xl font-medium text-[var(--fd-ink)]">{content.designerName}</h1>
          <p className="mt-1 text-sm text-[var(--fd-slate)]">
            {content.profession} &middot; {content.city}
          </p>
          <p className="mt-4 max-w-[56ch] text-[var(--fd-ink)]">{content.bio}</p>

          <div className="mt-5 flex flex-col gap-3">
            {content.services.map((service) => (
              <div
                key={service.name}
                className="flex items-baseline justify-between gap-4 rounded-xl border border-[var(--fd-line)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--fd-ink)]">{service.name}</p>
                  <p className="text-xs text-[var(--fd-slate)]">{service.note}</p>
                </div>
                <p className="fl-tnum whitespace-nowrap text-sm font-bold text-[var(--fd-ink)]">{service.price}</p>
              </div>
            ))}
          </div>

          <button type="button" className={`${primaryClass} mt-5`}>
            Get in touch
          </button>
        </div>
      </section>

      <section aria-labelledby="section-b" className="flex flex-col gap-4">
        <h2 id="section-b" className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
          B &middot; A real enquiry, answered
        </h2>
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--fd-line)] bg-white p-6">
          <div className="rounded-xl border border-[var(--fd-line)] bg-[var(--fd-paper-dim)] p-4">
            <p className="mb-1 text-xs text-[var(--fd-slate)]">Enquiry from {content.sampleClientName}</p>
            <p className="text-[var(--fd-ink)]">{content.sampleEnquiry}</p>
          </div>
          <div className="rounded-xl border border-[var(--fd-line-control)] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
              Draft reply &middot; {content.designerName}&apos;s voice
            </p>
            <p className="text-[var(--fd-ink)]">{content.draftReply}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="section-c" className="flex flex-col gap-4">
        <h2 id="section-c" className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
          C &middot; Here&apos;s what I did, and why
        </h2>
        <div className="rounded-2xl border border-[var(--fd-line)] bg-white p-6">
          {content.facts.map((fact, i) => (
            <div
              key={fact.label}
              className={`flex items-center justify-between gap-4 py-2.5 ${
                i < content.facts.length - 1 ? "border-b border-[var(--fd-line)]" : ""
              }`}
            >
              <span className="text-[var(--fd-ink)]">{fact.label}</span>
              <span
                className={
                  fact.source === "confirmed"
                    ? "shrink-0 rounded-full bg-[var(--fd-success-text)] px-2.5 py-0.5 text-xs text-white"
                    : "shrink-0 rounded-full border border-[var(--fd-line-control)] bg-[var(--fd-paper-dim)] px-2.5 py-0.5 text-xs text-[var(--fd-slate)]"
                }
              >
                {fact.source === "confirmed" ? "from your site" : "inferred"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="section-d" className="flex flex-col gap-4">
        <h2 id="section-d" className="text-xs font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
          D &middot; One thing I couldn&apos;t work out
        </h2>
        <form className="rounded-2xl border border-[var(--fd-line)] bg-white p-6">
          <fieldset>
            <legend className="text-base font-semibold text-[var(--fd-ink)]">{content.question}</legend>
            <p className="mb-3 mt-1 text-sm text-[var(--fd-slate)]">
              Pick the one that&apos;s right, or say it in your own words below.
            </p>
            {[content.likelyAnswer, ...content.altAnswers].map((answer, i) => (
              <div key={answer} className="mb-2">
                <input
                  type="radio"
                  name="correction"
                  id={`answer-${i}`}
                  defaultChecked={i === 0}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`answer-${i}`}
                  className="flex min-h-11 cursor-pointer items-center rounded-full border border-[var(--fd-line-control)] px-4 text-sm text-[var(--fd-ink)] peer-checked:border-[var(--fd-accent)] peer-checked:bg-[var(--fd-accent)] peer-checked:font-semibold peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--fd-focus-ring)]"
                >
                  {answer}
                </label>
              </div>
            ))}
            <div className="mt-3">
              <label htmlFor="correction-free" className="mb-1.5 block text-sm font-semibold text-[var(--fd-ink)]">
                Or tell me directly
              </label>
              <textarea
                id="correction-free"
                placeholder="Type a correction&hellip;"
                className="min-h-11 w-full rounded-lg border border-[var(--fd-line-control)] px-3.5 py-2.5 text-sm text-[var(--fd-ink)] focus-visible:border-[var(--fd-focus-ring)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--fd-focus-ring)]/25"
              />
            </div>
          </fieldset>
          <button type="submit" className={`${primaryClass} mt-4`}>
            That&apos;s right &mdash; is this me?
          </button>
        </form>
      </section>
    </main>
  );
}
