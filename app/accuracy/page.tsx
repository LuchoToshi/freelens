import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck, CircleAlert, CircleHelp } from "lucide-react";
import { SOURCE_REGISTRY } from "@/lib/domain/sourceRegistry";
import { getActiveTaxYearConfig, isVerifiedTaxYearConfig } from "@/lib/domain/taxYearConfig";

export const metadata: Metadata = {
  title: "Accuracy and sources · Freelens",
  description:
    "What Freelens does and does not calculate, the reserve rules it applies, and the official Dutch sources behind them.",
};

const CATEGORIES = ["VAT", "Income tax & Zvw", "Deductions", "Invoicing"] as const;

const EDGE_CASES: { title: string; body: string }[] = [
  {
    title: "KOR (small businesses scheme)",
    body: "On the KOR you don't charge VAT. Pick Other → KOR and Freelens sets no VAT aside. It doesn't file VAT returns for you.",
  },
  {
    title: "Reverse-charged VAT",
    body: "Reverse-charged invoices carry no VAT for you to reserve. Select that treatment so the amount isn't counted as VAT to set aside.",
  },
  {
    title: "Multiple VAT rates on one invoice",
    body: "Freelens allocates one payment at a time. If an invoice mixes 21% and 9%, enter each part separately, or use Other → Mixed and confirm the split in your bookkeeping.",
  },
  {
    title: "Income outside freelancing",
    body: "Employment, benefits, or a partner's income change your real tax rate. A flat reserve percentage can't see them, so revisit your percentage if you have significant other income.",
  },
  {
    title: "Major deductions",
    body: "Large deductible costs and allowances (equipment, zelfstandigenaftrek, the SME profit exemption) lower taxable profit, so your final bill is often lower than a flat reserve suggests. Enter deductible costs per payment to get closer.",
  },
];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function reviewedLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "recently";
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
}

export default function AccuracyPage() {
  const config = getActiveTaxYearConfig(2026);
  const taxYear = config.taxYear;
  const reviewed = isVerifiedTaxYearConfig(config)
    ? reviewedLabel(config.vat.standardRatePercentage.dateLastVerified)
    : null;

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back
        </Link>

        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            Accuracy and sources
          </span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            What Freelens is honest about.
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-[var(--fl-reserve-tint)] px-3 py-1 text-xs font-semibold text-[var(--fl-reserve-text)]">
              Tax year {taxYear}
            </span>
            {reviewed && (
              <span className="inline-flex items-center rounded-full bg-[var(--fl-payout-tint)] px-3 py-1 text-xs font-semibold text-[var(--fl-payout-text)]">
                Last reviewed {reviewed}
              </span>
            )}
          </div>
          <p className="text-base leading-relaxed text-[var(--fl-slate)]">
            Freelens provides planning estimates based on the information and
            reserve rules you enter. It does not calculate your final tax
            assessment and is not tax advice.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* What it is. */}
          <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[var(--fl-payout-text)]" aria-hidden="true" />
              <h2 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
                What Freelens is
              </h2>
            </div>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--fl-slate)]">
              <li>It applies your chosen reserve rules consistently.</li>
              <li>It separates VAT and makes your reserves visible.</li>
              <li>It turns a payment into a clear allocation plan.</li>
              <li>It keeps a local record of your position, on your device only.</li>
            </ul>
          </section>

          {/* What it is not, designed caution. */}
          <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-short-text)]/30 bg-[var(--fl-short-tint)] p-6">
            <div className="flex items-center gap-2">
              <CircleAlert className="size-5 text-[var(--fl-short-text)]" aria-hidden="true" />
              <h2 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
                What Freelens is not
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--fl-ink)]">
              Not the Belastingdienst, an accountant, bookkeeping software, a tax
              return, or a provisional assessment. A percentage applied to a
              payment is a reserve rule, not a calculation of your income tax.
              Your final income tax depends on annual taxable profit, deductions,
              credits, other income, and personal circumstances Freelens does not
              model.
            </p>
          </section>
        </div>

        <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-6">
          <h2 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
            Reference values for {taxYear}
          </h2>
          {isVerifiedTaxYearConfig(config) ? (
            <ul className="flex flex-col gap-2 text-sm text-[var(--fl-slate)]">
              <li>
                General VAT rate {config.vat.standardRatePercentage.value}%,
                reduced rate {config.vat.reducedRatePercentage.value}%.
              </li>
              <li>
                Zvw contribution {config.zvw.ratePercentage.value}% up to the
                maximum contribution income.
              </li>
              <li>
                Guided-estimate reserve: a flat{" "}
                {config.guidedEstimateFlatReservePercentage.value}% of profit for
                income tax (a cautious planning heuristic, not a bracket
                calculation), with Zvw shown separately.
              </li>
              <li>
                Shown for context only, not used in any calculation:
                zelfstandigenaftrek and the {config.mkbWinstvrijstellingPercentage.value}%
                SME profit exemption.
              </li>
            </ul>
          ) : (
            <p className="text-sm text-[var(--fl-slate)]">
              Tax references for {taxYear} have not yet been verified. You can
              still use your own reserve amount or a provisional assessment.
            </p>
          )}
          <p className="text-xs text-[var(--fl-slate)]">
            Reviewed July 2026 for tax year {taxYear}. These figures require review
            before they support another tax year.
          </p>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            All calculations are deterministic: the same inputs always produce the
            same numbers, with no guessing and no hidden model. Every result shows
            a &ldquo;Why this number?&rdquo; breakdown you can check.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            Edge cases to know
          </h2>
          <ul className="flex flex-col gap-3">
            {EDGE_CASES.map((e) => (
              <li
                key={e.title}
                className="flex flex-col gap-1 rounded-xl border border-[var(--fl-line)] bg-white p-4"
              >
                <span className="text-sm font-semibold text-[var(--fl-ink)]">
                  {e.title}
                </span>
                <span className="text-sm leading-relaxed text-[var(--fl-slate)]">
                  {e.body}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6">
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            When to talk to an accountant
          </h2>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            Freelens is a planning tool, not a substitute for advice. Check with an
            accountant or the Belastingdienst when:
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-[var(--fl-slate)]">
            <li>your income or family situation changed a lot this year;</li>
            <li>you have substantial income outside freelancing;</li>
            <li>
              you&apos;re unsure whether the KOR, reverse charge, or a special
              scheme applies to you;
            </li>
            <li>you&apos;re planning a large purchase or investment;</li>
            <li>
              it&apos;s your first year, or you&apos;ve never filed a Dutch return.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            Official sources
          </h2>
          {CATEGORIES.map((category) => {
            const entries = SOURCE_REGISTRY.filter((s) => s.category === category);
            if (entries.length === 0) return null;
            return (
              <div key={category} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
                  {category}
                </h3>
                <ul className="flex flex-col gap-3">
                  {entries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-2 rounded-xl border border-[var(--fl-line)] bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
                        >
                          {entry.title}
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                        {entry.verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fl-payout-tint)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fl-payout-text)]">
                            <ShieldCheck className="size-3" aria-hidden="true" />
                            Verified link
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fl-vat-tint)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fl-vat-text)]">
                            <CircleHelp className="size-3" aria-hidden="true" />
                            Needs review
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
                        {entry.notes}
                      </p>
                      {hostOf(entry.url) && (
                        <span className="text-[11px] uppercase tracking-wide text-[var(--fl-slate)]">
                          {hostOf(entry.url)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <Link
          href="/tool"
          className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[var(--fl-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          Open Freelens
        </Link>
      </div>
    </main>
  );
}
