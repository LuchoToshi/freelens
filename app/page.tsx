import Link from "next/link";
import { ArrowRight, Check, RadioTower, ShieldCheck, Sparkles } from "lucide-react";

const RECURRING_QUESTIONS = [
  "Is this month actually good?",
  "How much should I reserve for BTW and income tax for this invoice?",
  "What can I safely pay myself?",
  "Can I take time off?",
  "Am I ready for the VAT payment?",
  "Can I stop worrying?",
];

const TRUST_ITEMS = [
  "Built for Dutch freelancers and ZZP'ers",
  "No login, no bank connection, no backend",
  "Plain-language output you can sanity-check",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f1df] text-[#101010]">
      <section className="relative isolate overflow-hidden border-b-4 border-black bg-[#f2dc78]">
        <div className="absolute inset-0 -z-10 opacity-18 [background-image:linear-gradient(#101010_1px,transparent_1px),linear-gradient(90deg,#101010_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="mx-auto grid min-h-[86vh] max-w-7xl grid-cols-1 items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:py-12">
          <div className="flex flex-col gap-7">
            <div className="flex w-fit items-center gap-2 border-2 border-black bg-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-normal shadow-[4px_4px_0_#101010]">
              <RadioTower className="size-4" aria-hidden="true" />
              Signal locked: ZZP cash clarity
            </div>

            <div className="flex flex-col gap-5">
              <h1 className="max-w-4xl font-mono text-[clamp(3.1rem,12vw,8.8rem)] font-black uppercase leading-[0.84] tracking-normal">
                Freelens
              </h1>
              <p className="max-w-2xl text-balance text-2xl font-black leading-tight sm:text-4xl">
                Make freelance money decisions with confidence.
              </p>
              <p className="max-w-xl text-base font-semibold leading-7 sm:text-lg">
                Freelens gives you a clear safe-to-spend number, with tax
                reserve built in, so you can decide what to pay yourself and
                when to pause, without spreadsheets or guesswork.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tool"
                className="inline-flex min-h-14 items-center justify-center gap-2 border-4 border-black bg-[#0057ff] px-6 text-base font-black uppercase text-white shadow-[6px_6px_0_#101010] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#101010] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                Check your safe-to-spend
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <a
                href="#features"
                className="inline-flex min-h-14 items-center justify-center border-4 border-black bg-white px-6 text-base font-black uppercase shadow-[6px_6px_0_#101010] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#101010] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                View signal
              </a>
            </div>
          </div>

            <div className="mx-auto w-full max-w-xl lg:max-w-none">
            <div className="border-4 border-black bg-[#a8dc4f] p-3 shadow-[10px_10px_0_#101010]">
              <div className="border-4 border-black bg-[#111] p-3">
                <div className="flex items-center justify-between border-2 border-[#a8dc4f] bg-[#e3f7d4] px-3 py-2 font-mono text-xs font-black uppercase text-black">
                  <span>Freelens 1.0</span>
                  <span>NL-ZZP</span>
                </div>
                <div className="mt-3 border-2 border-[#a8dc4f] bg-[#e3f7d4] p-4 text-black">
                  <div className="grid grid-cols-[1fr_auto] gap-3 font-mono text-sm font-bold">
                    <span>Bank balance</span>
                    <span>EUR 4.200</span>
                    <span>Tax reserve</span>
                    <span>30%</span>
                    <span>Buffer</span>
                    <span>2 months</span>
                  </div>
                  <div className="my-5 h-5 border-2 border-black bg-white">
                    <div className="h-full w-[68%] bg-[#0057ff]" />
                  </div>
                  <div className="border-4 border-black bg-[#f2dc78] p-4 text-center">
                    <p className="font-mono text-xs font-black uppercase">
                      Pay yourself up to
                    </p>
                    <p className="mt-1 font-mono text-5xl font-black tracking-normal sm:text-6xl">
                      EUR 860
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold shadow-[4px_4px_0_#101010]">
              Not tax advice. Just a sharper read on your Dutch freelance cash.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="border-b-4 border-black bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <p className="mb-8 font-mono text-sm font-black uppercase text-[#0057ff]">
            Recurring questions we help answer
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RECURRING_QUESTIONS.map((question) => (
              <div
                key={question}
                className="border-4 border-black bg-[#f6f1df] p-5 shadow-[6px_6px_0_#101010]"
              >
                <Sparkles className="mb-5 size-8 text-[#0057ff]" aria-hidden="true" />
                <h2 className="font-mono text-xl font-black uppercase leading-tight">
                  {question}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0057ff] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-sm font-black uppercase text-[#f2dc78]">
              Trust layer
            </p>
            <h2 className="mt-3 max-w-lg text-4xl font-black leading-none sm:text-5xl">
              Low drama. High signal. Built for first conversations.
            </h2>
          </div>
          <div className="grid gap-3">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 border-4 border-white bg-black p-4 font-semibold"
              >
                <ShieldCheck className="mt-0.5 size-6 shrink-0 text-[#a8dc4f]" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-4 border-black bg-[#f2dc78]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-sm font-black uppercase">
              Ready when the invoice lands
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Get your number in under a minute.
            </h2>
          </div>
          <Link
            href="/tool"
            className="inline-flex min-h-14 items-center justify-center gap-2 border-4 border-black bg-black px-6 text-base font-black uppercase text-white shadow-[6px_6px_0_#0057ff] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#0057ff] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            Open Freelens
            <Check className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
