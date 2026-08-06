"use client";

import { Monitor, RotateCcw } from "lucide-react";
import { formatEuro } from "@/lib/domain/money";
import { examplePaymentSplit } from "@/lib/domain/exampleScenario";
import { useT } from "@/components/i18n/locale-provider";
import { container } from "@/components/container";

export function PrivacySection() {
  const t = useT();
  const split = examplePaymentSplit();
  // All four buckets, so the panel adds up to the payment. Three lines left a
  // silent gap where the business costs were.
  const rows: [string, string][] = [
    [t.home.privacy.demo.vat, formatEuro(split.vat)],
    [t.home.privacy.demo.reserve, formatEuro(split.reserve)],
    [t.home.privacy.demo.business, formatEuro(split.business)],
    [t.home.privacy.demo.available, formatEuro(split.yours)],
  ];

  return (
    <section
      aria-label={t.home.privacy.ariaLabel}
      className="border-t border-[var(--fl-line)] bg-[var(--fl-ink)] text-white"
    >
      <div className={`${container} grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9db4d1]">
            {t.home.privacy.eyebrow}
          </p>
          <h2 className="mt-3 max-w-lg font-serif text-3xl font-medium leading-tight sm:text-4xl">
            {t.home.privacy.heading}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-[#9db4d1]">
            {t.home.privacy.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {t.home.privacy.points.map((point) => (
              <span key={point} className="text-base font-medium text-[#9db4d1]">
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Local-device concept: the numbers live inside the browser frame,
            in a closed loop that never leaves the device. */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-white/25" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-white/25" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-white/25" aria-hidden="true" />
              <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-[#9db4d1]">
                <Monitor className="size-3.5" aria-hidden="true" />
                {t.home.privacy.thisDevice}
              </span>
            </div>
            <dl className="flex flex-col gap-3 p-6">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="text-sm text-[#9db4d1]">{k}</dt>
                  <dd className="fl-tnum text-sm font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {t.home.privacy.staysHere}
          </span>
        </div>
      </div>
    </section>
  );
}
