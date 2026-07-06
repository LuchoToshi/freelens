import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { CheckInReminderForm } from "@/components/checkin-reminder-form";

const MOMENTS = [
  {
    title: "When an invoice lands",
    detail:
      "See instantly what to set aside for tax and what's actually yours to keep.",
  },
  {
    title: "Your monthly check-in",
    detail: "One honest number for the month — is it actually okay?",
  },
  {
    title: "Before you pay yourself",
    detail: "Know the safe number first, not just what's left in the account.",
  },
  {
    title: "Planning time off",
    detail: "Check your buffer actually covers it before you book anything.",
  },
  {
    title: "When a VAT quarter hits",
    detail: "Confirm you've already set aside what you owe.",
  },
  {
    title: "The quiet reassurance",
    detail: "Somewhere to check when the worry creeps in, and get a real answer.",
  },
];

const TRUST_ITEMS = [
  "Your numbers never leave your browser.",
  "Built for Dutch freelancers and ZZP'ers.",
  "Plain-language output you can double-check.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1c1e21]">
      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center rounded-full border border-[#e3e1da] bg-white px-3 py-1 text-xs font-medium text-[#5b6472]">
            For Dutch freelancers and ZZP&apos;ers
          </span>

          <div className="flex flex-col gap-4">
            <h1 className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-[#122540] sm:text-5xl">
              Know what&apos;s actually safe to spend, after tax.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-[#5b6472]">
              Get your number in under a minute.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/tool"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#122540] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[#0d1b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#122540]"
            >
              Get my number
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href="#moments"
              className="inline-flex min-h-12 items-center justify-center px-2 text-base font-medium text-[#122540] underline decoration-[#c9c6bc] underline-offset-4 hover:decoration-[#122540]"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-2xl border border-[#e3e1da] bg-white p-6 shadow-sm">
            <span className="text-sm font-medium text-[#5b6472]">
              Safe to spend
            </span>
            <p className="mt-1 text-5xl font-semibold tracking-tight text-[#122540]">
              €1,800
            </p>
            <div className="mt-6 flex flex-wrap items-start justify-start gap-x-2 gap-y-3 border-t border-[#e3e1da] pt-5 font-mono text-xs text-[#1c1e21]">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">€6,000</span>
                <span className="text-[#5b6472]">balance</span>
              </div>
              <span className="pt-0.5 text-sm font-medium">−</span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">(€1,200 × 2)</span>
                <span className="text-[#5b6472]">costs × buffer</span>
              </div>
              <span className="pt-0.5 text-sm font-medium">−</span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">€1,800</span>
                <span className="text-[#5b6472]">tax reserve</span>
              </div>
              <span className="pt-0.5 text-sm font-medium">≈</span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">€1,800</span>
                <span className="text-[#5b6472]">safe to spend</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-[#5b6472]">
            Not tax advice — a clear estimate to work from.
          </p>
        </div>
      </section>

      <section id="moments" className="border-t border-[#e3e1da] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="mb-10 text-sm font-medium text-[#5b6472]">
            Moments this is built for
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MOMENTS.map((moment) => (
              <div
                key={moment.title}
                className="rounded-2xl border border-[#e3e1da] p-6"
              >
                <Sparkles
                  className="mb-4 size-5 text-[#122540]"
                  aria-hidden="true"
                />
                <h2 className="text-lg font-semibold text-[#122540]">
                  {moment.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5b6472]">
                  {moment.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-8 border-t border-[#e3e1da] pt-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-lg font-semibold text-[#122540]">
                Whichever moment you&apos;re in, get your number before you
                decide.
              </p>
              <Link
                href="/tool"
                className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-xl bg-[#122540] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[#0d1b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#122540]"
              >
                Get my number
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-[#122540]">
                  Not ready yet?
                </p>
                <p className="text-sm text-[#5b6472]">
                  Get a reminder for your next monthly check-in.
                </p>
              </div>
              <CheckInReminderForm />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#122540] text-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-sm font-medium text-[#9db4d1]">
              Why people trust it
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
              One honest number, once a month.
            </h2>
            <p className="mt-3 max-w-md text-sm text-[#9db4d1]">
              The sooner you check, the sooner you stop guessing.
            </p>
          </div>
          <div className="grid gap-3">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4"
              >
                <ShieldCheck
                  className="mt-0.5 size-5 shrink-0 text-[#9db4d1]"
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

      <section className="border-t border-[#e3e1da]">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-[#5b6472]">
              Ready when the invoice lands
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#122540] sm:text-3xl">
              Know before the next invoice lands.
            </h2>
          </div>
          <Link
            href="/tool"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#122540] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[#0d1b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#122540]"
          >
            Get my number
            <Check className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
