"use client";

import Link from "next/link";
import { BackLink } from "@/components/i18n/back-link";
import { useDocumentTitle, useLocale, useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";
import { translateAssumption, translateBreakdownLabel } from "@/lib/i18n/engineText";
import { ExternalLink, TriangleAlert } from "lucide-react";
import { formatEuro, toCents } from "@/lib/domain/money";
import { calculateTaxReserve } from "@/lib/tax/engine";
import { DEFAULT_COUNTRY, latestProfileYear, loadProfile } from "@/lib/tax/loadProfile";
import { container } from "@/components/container";

const TAX_YEAR = latestProfileYear(DEFAULT_COUNTRY) ?? 0;

/** A worked example, computed live so the page can never disagree with the engine. */
const EXAMPLE_PROFIT = 40_000;

function sectionClass() {
  return "flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-6";
}

export function MethodologyPageBody() {
  const t = useT();
  useDocumentTitle(t.methodologyPage.metaTitle, t.methodologyPage.metaDescription);
  const { locale } = useLocale();
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
      <div className={`${container} flex flex-col gap-8 py-12`}>
        <BackLink />

        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {t.methodologyPage.heading}
          </h1>
          <p className="text-base leading-relaxed text-[var(--fl-slate)]">
            {t.methodologyPage.intro}
            real brackets, with the deductions and tax credits you qualify for.
          </p>
          <p className="text-sm text-[var(--fl-slate)]">
            {fill(t.methodologyPage.taxYear, { year: profile.taxYear })}
            Config <code className="font-mono text-xs">{profile.configVersion}</code>,
            every figure checked against belastingdienst.nl on{" "}
            <strong>{profile.configRetrievedAt}</strong>.
          </p>
        </div>

        <section className={sectionClass()}>
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            {t.methodologyPage.orderHeading}
          </h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-[var(--fl-slate)]">
            {t.methodologyPage.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className={sectionClass()}>
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            {t.methodologyPage.bracketsHeading}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--fl-slate)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    {t.methodologyPage.colTaxableIncome}
                  </th>
                  <th scope="col" className="py-2 font-semibold">{t.methodologyPage.colRate}</th>
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
            {t.methodologyPage.bracketNote}
          </p>
        </section>

        <section className={sectionClass()}>
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            {t.methodologyPage.deductionsHeading}
          </h2>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--fl-slate)]">
            {zelfstandigen && (
              <li>
                <strong className="text-[var(--fl-ink)]">Zelfstandigenaftrek</strong>{" "}
                {fill(t.methodologyPage.zelfstandigen, {
                  amount: formatEuro(toCents(zelfstandigen.value)),
                })}
              </li>
            )}
            {starters && (
              <li>
                <strong className="text-[var(--fl-ink)]">Startersaftrek</strong>{" "}
                {fill(t.methodologyPage.starters, {
                  amount: formatEuro(toCents(starters.value)),
                })}
              </li>
            )}
            {mkb && (
              <li>
                <strong className="text-[var(--fl-ink)]">MKB-winstvrijstelling</strong>{" "}
                {fill(t.methodologyPage.mkb, { pct: mkb.value })}
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
            {t.methodologyPage.exampleHeading}
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
                <dt className="text-sm text-[var(--fl-slate)]">
                  {translateBreakdownLabel(locale, line.id, line.label)}
                </dt>
                <dd className="fl-tnum font-mono text-sm text-[var(--fl-ink)]">
                  {formatEuro(line.amount)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
            {fill(t.methodologyPage.exampleNote, {
              effective: (example.effectiveRate * 100).toFixed(1),
              marginal: (example.marginalRate * 100).toFixed(1),
            })}
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6">
          <div className="flex items-center gap-2">
            <TriangleAlert className="size-4 text-[var(--fl-ink)]" aria-hidden="true" />
            <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
              {t.methodologyPage.assumesHeading}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            {t.methodologyPage.assumesIntro}
          </p>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-[var(--fl-slate)]">
            {example.assumptions.map((assumption) => (
              <li key={assumption}>{translateAssumption(locale, assumption)}</li>
            ))}
          </ul>
        </section>

        <section className={sectionClass()}>
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            {t.methodologyPage.sourcesHeading}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            {t.methodologyPage.sourcesIntro}
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
                      {t.methodologyPage.derived}
                    </span>
                  )}
                  <span className="text-[11px] uppercase tracking-wide text-[var(--fl-slate)]">
                    {fill(t.methodologyPage.checked, { date: entry.retrievedAt })}
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
          {t.methodologyPage.footerPrefix}{" "}
          <Link
            href="/accuracy"
            className="font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
          >
            {t.methodologyPage.footerLink}
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
