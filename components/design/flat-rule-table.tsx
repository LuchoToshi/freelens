"use client";

import { fill } from "@/lib/i18n";
import { useT } from "@/components/i18n/locale-provider";
import {
  formatEuro,
  formatEuroExact,
  toCents,
  type Cents,
} from "@/lib/domain/money";
import { headlineRows } from "@/lib/tax/oldVsNew";

/**
 * The flat-rule evidence: three engine-computed cases where 30% of revenue
 * misses, in both directions.
 *
 * Extracted from /accuracy so the homepage can lead with the same table. One
 * component, one source of rows, so the strongest claim on the site cannot
 * drift between the page that makes it and the page that proves it. Every
 * figure comes from `headlineRows()`, which runs the engine over the golden
 * cases at render; nothing here is written down.
 */
export function FlatRuleTable() {
  const t = useT();
  const f = t.accuracyPage.flatRule;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--fl-line)] text-[var(--fl-slate)]">
            <th scope="col" className="py-2 pr-4 font-semibold">
              {f.colCase}
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-semibold">
              {f.colOld}
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-semibold">
              {f.colReal}
            </th>
            <th scope="col" className="py-2 text-right font-semibold">
              {f.colError}
            </th>
          </tr>
        </thead>
        <tbody>
          {headlineRows().map((row) => {
            const id = String(row.testCase.id) as keyof typeof f.caseNames;
            const size = formatEuroExact(Math.abs(row.deltaA) as Cents);
            return (
              <tr
                key={row.testCase.id}
                className="border-b border-[var(--fl-line)] align-top"
              >
                <th scope="row" className="py-3 pr-4 font-normal">
                  <span className="block font-medium text-[var(--fl-ink)]">
                    {f.caseNames[id]}
                  </span>
                  <span className="block text-xs text-[var(--fl-slate)]">
                    {fill(f.profitLine, {
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
                      row.deltaA < 0 ? "var(--fl-short-text)" : "var(--fl-slate)",
                  }}
                >
                  {row.deltaA === 0
                    ? f.exact
                    : fill(row.deltaA > 0 ? f.over : f.under, { amount: size })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
