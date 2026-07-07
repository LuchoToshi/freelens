import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CountUpNumber } from "@/components/design-c/count-up-number";

const PAPER_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")";

const TRUST_ITEMS = [
  "Your numbers never leave your browser.",
  "Built for Dutch freelancers and ZZP'ers.",
  "Plain-language output you can double-check.",
];

export default function DesignC() {
  const safeToSpend = 1800;

  return (
    <main
      className="min-h-screen text-[#3a2f28]"
      style={{ backgroundColor: "#f3ead9", backgroundImage: PAPER_TEXTURE }}
    >
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
        <span className="text-sm font-medium text-[#7a6a58]">
          Freelens — Design C: Warm analog
        </span>
      </div>

      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center rounded-full border border-[#e0d2b8] bg-[#fbf6ec] px-3 py-1 text-xs font-medium text-[#7a6a58]">
            For Dutch freelancers and ZZP&apos;ers
          </span>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-[#3a2f28] sm:text-5xl">
              Know what&apos;s actually safe to spend, after tax.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-[#7a6a58]">
              Built by someone who&apos;s also stared at an invoice wondering
              the same thing.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/tool"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#9c3b2e] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[#7e2f24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9c3b2e]"
            >
              Get my number
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative rotate-[-0.4deg] rounded-lg border border-[#e0d2b8] bg-[#fbf6ec] p-6 shadow-md">
            <div className="flex items-center justify-between border-b border-dashed border-[#d8c7a8] pb-4">
              <span className="text-sm font-medium text-[#7a6a58]">
                Safe to spend
              </span>
              <span className="rounded-full bg-[#eef2e2] px-2.5 py-1 text-xs font-semibold text-[#5c7a4a]">
                Healthy
              </span>
            </div>
            <p className="mt-4 text-5xl font-semibold tracking-tight text-[#3a2f28]">
              <CountUpNumber value={safeToSpend} />
            </p>
            <div className="mt-6 flex flex-wrap items-start justify-start gap-x-2 gap-y-3 border-t border-dashed border-[#d8c7a8] pt-5 font-mono text-xs text-[#3a2f28]">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">€6,000</span>
                <span className="text-[#7a6a58]">balance</span>
              </div>
              <span className="pt-0.5 text-sm font-medium">−</span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">(€1,200 × 2)</span>
                <span className="text-[#7a6a58]">costs × buffer</span>
              </div>
              <span className="pt-0.5 text-sm font-medium">−</span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">€1,800</span>
                <span className="text-[#7a6a58]">tax reserve</span>
              </div>
              <span className="pt-0.5 text-sm font-medium">≈</span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">€1,800</span>
                <span className="text-[#7a6a58]">safe to spend</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-[#7a6a58]">
            Not tax advice — a clear estimate to work from.
          </p>
        </div>
      </section>

      <section className="border-t border-[#e0d2b8] bg-[#3a2f28] text-[#f3ead9]">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-sm font-medium text-[#c9b691]">
              Why people trust it
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
              One honest number, once a month.
            </h2>
          </div>
          <div className="grid gap-3">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-[#f3ead9]/15 bg-[#f3ead9]/5 p-4"
              >
                <ShieldCheck
                  className="mt-0.5 size-5 shrink-0 text-[#c9b691]"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e0d2b8]">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-[#7a6a58]">
              Ready when the invoice lands
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#3a2f28] sm:text-3xl">
              Know before the next invoice lands.
            </h2>
          </div>
          <Link
            href="/tool"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#9c3b2e] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[#7e2f24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9c3b2e]"
          >
            Get my number
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
