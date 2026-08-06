"use client";

import Link from "next/link";
import { BackLink } from "@/components/i18n/back-link";
import { useDocumentTitle, useLocale, useT } from "@/components/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/types";
import { fill } from "@/lib/i18n";
import { ExternalLink, ShieldCheck, CircleAlert, CircleHelp } from "lucide-react";
import { SOURCE_REGISTRY } from "@/lib/domain/sourceRegistry";
import { formatEuro, formatEuroExact, toCents, type Cents } from "@/lib/domain/money";
import { headlineRows } from "@/lib/tax/oldVsNew";
import { DEFAULT_COUNTRY, latestProfileYear, loadProfile } from "@/lib/tax/loadProfile";
import { container } from "@/components/container";

const CATEGORY_KEYS = ["vat", "incomeTax", "deductions", "invoicing"] as const;
const CATEGORY_SOURCE_NAME: Record<(typeof CATEGORY_KEYS)[number], string> = {
  vat: "VAT",
  incomeTax: "Income tax & Zvw",
  deductions: "Deductions",
  invoicing: "Invoicing",
};

const EDGE_CASE_KEYS = ["kor", "reverse", "mixed", "outside", "deductions"] as const;

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** "August 2026" / "augustus 2026", formatted in the reader's own locale. */
function reviewedLabel(iso: string, locale: Locale, fallback: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(d);
}

export function AccuracyPageBody() {
  const t = useT();
  useDocumentTitle(t.accuracyPage.metaTitle, t.accuracyPage.metaDescription);
  const { locale } = useLocale();
  const taxYear = latestProfileYear(DEFAULT_COUNTRY) ?? 0;
  const profile = loadProfile(DEFAULT_COUNTRY, taxYear);
  const reviewed = reviewedLabel(
    profile.configRetrievedAt,
    locale,
    t.accuracyPage.reviewedFallback
  );

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className={`${container} flex flex-col gap-8 py-12`}>
        <BackLink />

        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {t.accuracyPage.eyebrow}
          </span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {t.accuracyPage.heading}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-[var(--fl-reserve-tint)] px-3 py-1 text-xs font-semibold text-[var(--fl-reserve-text)]">
              {fill(t.accuracyPage.taxYear, { year: taxYear })}
            </span>
            {reviewed && (
              <span className="inline-flex items-center rounded-full bg-[var(--fl-payout-tint)] px-3 py-1 text-xs font-semibold text-[var(--fl-payout-text)]">
                {fill(t.accuracyPage.lastReviewed, { date: reviewed })}
              </span>
            )}
          </div>
          <p className="text-base leading-relaxed text-[var(--fl-slate)]">
            {t.accuracyPage.intro}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* What it is. */}
          <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[var(--fl-payout-text)]" aria-hidden="true" />
              <h2 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
                {t.accuracyPage.isHeading}
              </h2>
            </div>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--fl-slate)]">
              {t.accuracyPage.is.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          {/* What it is not, designed caution. */}
          <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-short-text)]/30 bg-[var(--fl-short-tint)] p-6">
            <div className="flex items-center gap-2">
              <CircleAlert className="size-5 text-[var(--fl-short-text)]" aria-hidden="true" />
              <h2 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
                {t.accuracyPage.isNotHeading}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--fl-ink)]">
              {t.accuracyPage.isNot}
            </p>
          </section>
        </div>

        <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-6">
          <h2 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
            {fill(t.accuracyPage.referenceHeading, { year: taxYear })}
          </h2>
          <ul className="flex flex-col gap-2 text-sm text-[var(--fl-slate)]">
            <li>
              {fill(t.accuracyPage.vatLine, {
                rates: profile.vatRates.map((r) => `${r.rate}%`).join(", "),
              })}
            </li>
            <li>
              {fill(t.accuracyPage.incomeTaxLine, {
                rates: profile.brackets.map((b) => `${b.rate}%`).join(" / "),
              })}
            </li>
            <li>
              {t.accuracyPage.creditsLine}
            </li>
            <li>
              {fill(t.accuracyPage.zvwLine, {
                rate: profile.socialContributions[0]?.rate ?? 0,
              })}
            </li>
          </ul>
          <p className="text-xs text-[var(--fl-slate)]">
            {fill(t.accuracyPage.configLine, {
              version: profile.configVersion,
              date: profile.configRetrievedAt,
            })}
          </p>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            All calculations are deterministic: the same inputs always produce the
            same numbers, with no guessing and no hidden model. Every result shows
            a &ldquo;Why this number?&rdquo; breakdown you can check.
          </p>
          <Link
            href="/methodology"
            className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {t.accuracyPage.seeEveryRate}
          </Link>
        </section>

        <section id="flat-rule" className="flex flex-col gap-4 rounded-2xl border border-[var(--fl-line)] bg-white p-6">
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            {t.accuracyPage.flatRule.heading}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            {t.accuracyPage.flatRule.intro}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--fl-line)] text-[var(--fl-slate)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    {t.accuracyPage.flatRule.colCase}
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">
                    {t.accuracyPage.flatRule.colOld}
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">
                    {t.accuracyPage.flatRule.colReal}
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    {t.accuracyPage.flatRule.colError}
                  </th>
                </tr>
              </thead>
              <tbody>
                {headlineRows().map((row) => {
                  const id = String(row.testCase.id) as keyof typeof t.accuracyPage.flatRule.caseNames;
                  const size = formatEuroExact(Math.abs(row.deltaA) as Cents);
                  return (
                    <tr key={row.testCase.id} className="border-b border-[var(--fl-line)] align-top">
                      <th scope="row" className="py-3 pr-4 font-normal">
                        <span className="block font-medium text-[var(--fl-ink)]">
                          {t.accuracyPage.flatRule.caseNames[id]}
                        </span>
                        <span className="block text-xs text-[var(--fl-slate)]">
                          {fill(t.accuracyPage.flatRule.profitLine, {
                            revenue: formatEuro(toCents(row.testCase.revenueExVat)),
                            costs: formatEuro(toCents(row.testCase.costsExVat)),
                          })}
                        </span>
                      </th>
                      <td className="fl-tnum py-3 pr-4 text-right font-mono text-[var(--fl-ink)]">
                        {formatEuroExact(row.oldA)}
                      </td>
                      <td className="fl-tnum py-3 pr-4 text-right font-mono text-[var(--fl-ink)]">
                        {formatEuroExact(row.actual)}
                      </td>
                      <td
                        className="fl-tnum py-3 text-right font-mono font-medium"
                        style={{
                          color:
                            row.deltaA < 0
                              ? "var(--fl-short-text)"
                              : "var(--fl-slate)",
                        }}
                      >
                        {row.deltaA === 0
                          ? t.accuracyPage.flatRule.exact
                          : fill(
                              row.deltaA > 0
                                ? t.accuracyPage.flatRule.over
                                : t.accuracyPage.flatRule.under,
                              { amount: size }
                            )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
            {t.accuracyPage.flatRule.whyItMatters}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            {t.accuracyPage.edgeHeading}
          </h2>
          <ul className="flex flex-col gap-3">
            {EDGE_CASE_KEYS.map((key) => (
              <li
                key={key}
                className="flex flex-col gap-1 rounded-xl border border-[var(--fl-line)] bg-white p-4"
              >
                <span className="text-sm font-semibold text-[var(--fl-ink)]">
                  {t.accuracyPage.edgeCases[key].title}
                </span>
                <span className="text-sm leading-relaxed text-[var(--fl-slate)]">
                  {t.accuracyPage.edgeCases[key].body}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6">
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            {t.accuracyPage.accountantHeading}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
            {t.accuracyPage.accountantIntro}
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-[var(--fl-slate)]">
            {t.accuracyPage.accountantList.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            {t.accuracyPage.sourcesHeading}
          </h2>
          {CATEGORY_KEYS.map((key) => {
            // The registry is keyed on the English category name, which is data,
            // not copy. Only the heading is translated.
            const entries = SOURCE_REGISTRY.filter(
              (s) => s.category === CATEGORY_SOURCE_NAME[key]
            );
            if (entries.length === 0) return null;
            return (
              <div key={key} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
                  {t.accuracyPage.categories[key]}
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
                            {t.accuracyPage.verifiedLink}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fl-vat-tint)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fl-vat-text)]">
                            <CircleHelp className="size-3" aria-hidden="true" />
                            {t.accuracyPage.needsReview}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--fl-slate)]">
                        {/* The linked page's own title stays as it is: a Dutch
                            label on a link that opens an English page would
                            misdescribe where it goes. Only our note translates. */}
                        {t.accuracyPage.sourceNotes[
                          entry.id as keyof typeof t.accuracyPage.sourceNotes
                        ] ?? entry.notes}
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
          {t.accuracyPage.openFreelens}
        </Link>
      </div>
    </main>
  );
}
