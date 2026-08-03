import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, TriangleAlert } from "lucide-react";
import { formatEuro, toCents } from "@/lib/domain/money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { DEFAULT_COUNTRY, latestProfileYear, loadProfile } from "@/lib/tax/loadProfile";

export const metadata: Metadata = {
  title: "How the tax estimate is calculated · Freelens",
  description:
    "Every rate, threshold and deduction Freelens uses for the Dutch income tax and Zvw estimate, where each figure came from, and what the model deliberately leaves out.",
};

const TAX_YEAR = latestProfileYear(DEFAULT_COUNTRY) ?? 0;

/** A worked example, computed live so the page can never disagree with the engine. */
const EXAMPLE_PROFIT = 40_000;

function sectionClass() {
  return "flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-6";
}

export default function MethodologyPage() {
  const profile = loadProfile(DEFAULT_COUNTRY, TAX_YEAR);
  const example = calculateTaxReserve({
    taxYear: TAX_YEAR,
    country: DEFAULT_COUNTRY,
    projectedAnnualProfit: EXAMPLE_PROFIT,
    ytdReserved: 0,
    meetsHoursCriterion: true,
    isStarter: false,
    otherIncome: 0,
  });

  const zvw = profile.socialContributions.find((c) => c.id === "zvw");
  const mkb = profile.deductions.find((d) => d.id === "mkb-winstvrijstelling");
  const zelfstandigen = profile.deductions.find((d) => d.id === "zelfstandigenaftrek");
  const starters = profile.deductions.find((d) => d.id === "startersaftrek");

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
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            How the estimate is calculated
          </h1>
          <p className="text-base leading-relaxed text-[var(--fl-slate)]">
            Freelens does not apply a flat percentage to what your clients pay
            you. It works out income tax and the Zvw contribution the way the
            Belastingdienst does: on your profit for the whole year, through the
            real brackets, with the deductions and tax credits you qualify for.
          </p>
          <p className="text-sm text-[var(--fl-slate)]">
            Tax year {profile.taxYear}, for someone who has not reached AOW age.
            Config <code className="font-mono text-xs">{profile.configVersion}</code>,
            every figure checked against belastingdienst.nl on{" "}
            <strong>{profile.configRetrievedAt}</strong>.
          </p>
        </div>

        <section className={sectionClass()}>
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            The order it works in
          </h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-[var(--fl-slate)]">
            <li>Start with profit: revenue excluding VAT, minus business costs.</li>
            <li>
              Subtract the zelfstandigenaftrek and, if you qualify, the
              startersaftrek.
            </li>
            <li>Subtract the MKB-winstvrijstelling from what is left.</li>
            <li>Apply the income tax brackets to that figure.</li>
            <li>
              Subtract the algemene heffingskorting and the arbeidskorting, which
              come off the tax owed rather than off your income.
            </li>
            <li>
              Add the Zvw contribution, which is a separate bill with its own rate
              and its own ceiling.
            </li>
          </ol>
        </section>

        <section className={sectionClass()}>
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            Income tax brackets
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--fl-slate)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">Taxable income</th>
                  <th scope="col" className="py-2 font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody className="text-[var(--fl-slate)]">
                {profile.brackets.map((bracket, index) => {
                  const from = index === 0 ? 0 : profile.brackets[index - 1].upTo ?? 0;
                  return (
                    <tr key={index} className="border-t border-[var(--fl-line)]">
                      <td className="py-2 pr-4">
                        {bracket.upTo === null
                          ? `Above ${formatEuro(toCents(from))}`
                          : `${formatEuro(toCents(from))} to ${formatEuro(toCents(bracket.upTo))}`}
                      </td>
                      <td className="fl-tnum py-2 font-mono">{bracket.rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
            The first bracket includes premies volksverzekeringen, which are only
            levied on income up to that ceiling.
          </p>
        </section>

        <section className={sectionClass()}>
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            Deductions and credits
          </h2>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--fl-slate)]">
            {zelfstandigen && (
              <li>
                <strong className="text-[var(--fl-ink)]">Zelfstandigenaftrek</strong>{" "}
                {formatEuro(toCents(zelfstandigen.value))}, if you spend at least
                1.225 hours a year on the business.
              </li>
            )}
            {starters && (
              <li>
                <strong className="text-[var(--fl-ink)]">Startersaftrek</strong>{" "}
                {formatEuro(toCents(starters.value))}, on top, for up to three of
                your first five years.
              </li>
            )}
            {mkb && (
              <li>
                <strong className="text-[var(--fl-ink)]">MKB-winstvrijstelling</strong>{" "}
                {mkb.value}% of what is left after those deductions.
              </li>
            )}
            {profile.credits.map((credit) => (
              <li key={credit.id}>
                <strong className="text-[var(--fl-ink)]">{credit.label}</strong>{" "}
                {credit.explanation}
              </li>
            ))}
            {zvw && (
              <li>
                <strong className="text-[var(--fl-ink)]">{zvw.label}</strong>{" "}
                {zvw.rate}% on your profit after deductions, up to a maximum base
                of {formatEuro(toCents(zvw.cap ?? 0))}.
              </li>
            )}
            {profile.rateAdjustment && (
              <li>
                <strong className="text-[var(--fl-ink)]">
                  {profile.rateAdjustment.label}
                </strong>{" "}
                {profile.rateAdjustment.explanation}
              </li>
            )}
          </ul>
        </section>

        <section className={sectionClass()}>
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            A worked example
          </h2>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            {formatEuro(toCents(EXAMPLE_PROFIT))} profit, hours criterion met, no
            starter deduction, no other income. Every line below comes straight
            from the engine.
          </p>
          <dl className="flex flex-col gap-1.5">
            {example.breakdown.map((line) => (
              <div
                key={line.id}
                className="flex items-baseline justify-between gap-4 border-b border-[var(--fl-line)] pb-1.5 last:border-b-0"
              >
                <dt className="text-sm text-[var(--fl-slate)]">{line.label}</dt>
                <dd className="fl-tnum font-mono text-sm text-[var(--fl-ink)]">
                  {formatEuro(line.amount)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
            That is {(example.effectiveRate * 100).toFixed(1)}% of the profit
            overall, while the next euro earned is taxed at{" "}
            {(example.marginalRate * 100).toFixed(1)}%. Freelens reserves from a
            payment at the second rate, because a new payment sits on top of
            everything already earned this year.
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6">
          <div className="flex items-center gap-2">
            <TriangleAlert className="size-4 text-[var(--fl-ink)]" aria-hidden="true" />
            <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
              What this estimate assumes
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            Nothing here is hidden to make the number look cleaner. These are the
            assumptions attached to every result the app produces.
          </p>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-[var(--fl-slate)]">
            {example.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </section>

        <section className={sectionClass()}>
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            Where each figure came from
          </h2>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            Only belastingdienst.nl. No aggregators, no comparison sites, no
            accountancy summaries. Each entry records the date it was checked.
          </p>
          <ul className="flex flex-col gap-3">
            {profile.provenance.map((entry, index) => (
              <li
                key={`${entry.field}-${index}`}
                className="flex flex-col gap-1 border-t border-[var(--fl-line)] pt-3 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <code className="font-mono text-xs text-[var(--fl-ink)]">
                    {entry.field}
                  </code>
                  {entry.derived && (
                    <span className="rounded-full bg-[var(--fl-vat-tint)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fl-vat-text)]">
                      Derived
                    </span>
                  )}
                  <span className="text-[11px] uppercase tracking-wide text-[var(--fl-slate)]">
                    Checked {entry.retrievedAt}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
                    {entry.note}
                  </p>
                )}
                <a
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 w-fit items-center gap-1.5 text-xs font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
                >
                  belastingdienst.nl
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
          For what Freelens does and does not calculate more broadly, and when to
          talk to an accountant, see{" "}
          <Link
            href="/accuracy"
            className="font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
          >
            accuracy and sources
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
