import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ScribbleArrow,
  ScribbleUnderline,
} from "@/components/design-b/scribble-annotation";

export default function DesignB() {
  return (
    <main className="min-h-screen bg-[#fdfcf9] text-[#111111]">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        <span className="text-sm font-medium text-[#6b6b6b]">
          Freelens — Design B: Editorial poster
        </span>
      </div>

      <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-5 py-16 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c1440e]">
          For Dutch freelancers &amp; ZZP&apos;ers
        </p>
        <h1 className="mt-6 max-w-4xl text-balance text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-tight">
          Know what&apos;s{" "}
          <span className="relative inline-block">
            actually safe
            <ScribbleUnderline className="absolute -bottom-2 left-0 h-3 w-full" />
          </span>{" "}
          to spend.
        </h1>
        <p className="mt-8 max-w-xl text-xl leading-relaxed text-[#4a4a4a]">
          After tax. In under a minute. No spreadsheets.
        </p>
        <div className="mt-10">
          <Link
            href="/tool"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#111111] px-8 text-base font-medium text-white transition hover:bg-[#c1440e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
          >
            Get my number
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center border-t border-[#111111]/10 px-5 py-16 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c1440e]">
          The math, shown
        </p>
        <h2 className="mt-6 max-w-3xl text-balance text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight tracking-tight">
          Every euro, accounted for.
        </h2>

        <div className="relative mt-12 max-w-2xl rounded-3xl border border-[#111111]/10 bg-white p-8 shadow-sm sm:p-10">
          <span className="text-sm font-medium text-[#6b6b6b]">
            Safe to spend
          </span>
          <p className="mt-1 text-6xl font-semibold tracking-tight">
            €1,800
          </p>
          <div className="mt-8 flex flex-wrap items-start gap-x-3 gap-y-4 border-t border-[#111111]/10 pt-6 font-mono text-sm">
            <div className="flex flex-col gap-1">
              <span className="font-medium">€6,000</span>
              <span className="text-[#6b6b6b]">balance</span>
            </div>
            <span className="pt-0.5 font-medium">−</span>
            <div className="flex flex-col gap-1">
              <span className="font-medium">(€1,200 × 2)</span>
              <span className="text-[#6b6b6b]">costs × buffer</span>
            </div>
            <span className="pt-0.5 font-medium">−</span>
            <div className="flex flex-col gap-1">
              <span className="font-medium">€1,800</span>
              <span className="text-[#6b6b6b]">tax reserve</span>
            </div>
            <span className="pt-0.5 font-medium">≈</span>
            <div className="flex flex-col gap-1">
              <span className="font-medium">€1,800</span>
              <span className="text-[#6b6b6b]">safe to spend</span>
            </div>
          </div>
          <ScribbleArrow className="absolute -top-10 -right-6 hidden h-16 w-24 sm:block" />
          <p className="mt-6 text-sm text-[#6b6b6b]">
            Not tax advice — a clear estimate to work from.
          </p>
        </div>
      </section>

      <section className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center border-t border-[#111111]/10 px-5 py-16 sm:px-8">
        <h2 className="max-w-3xl text-balance text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight tracking-tight">
          One honest number, once a month.
        </h2>
        <p className="mt-6 max-w-xl text-lg text-[#4a4a4a]">
          Your numbers never leave your browser. Built for Dutch freelancers
          and ZZP&apos;ers.
        </p>
      </section>

      <section className="border-t border-[#111111]/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-16 sm:px-8 md:flex-row md:items-center">
          <h2 className="max-w-xl text-balance text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight tracking-tight">
            Know before the next invoice lands.
          </h2>
          <Link
            href="/tool"
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-[#111111] px-8 text-base font-medium text-white transition hover:bg-[#c1440e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
          >
            Get my number
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
