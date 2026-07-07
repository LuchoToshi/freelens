import Link from "next/link";
import {
  ArrowRight,
  CloudRain,
  FileCheck,
  Landmark,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { InteractiveHero } from "@/components/design-a/interactive-hero";

const TRUST_ITEMS = [
  "Your numbers never leave your browser.",
  "Built for Dutch freelancers and ZZP'ers.",
  "Plain-language output you can double-check.",
];

const MOMENTS = [
  {
    icon: FileCheck,
    title: "Invoice paid — what can I actually keep?",
  },
  {
    icon: TrendingUp,
    title: "Big client just signed — should I upgrade my setup?",
  },
  {
    icon: CloudRain,
    title: "Slow month again — am I actually in trouble?",
  },
  {
    icon: Landmark,
    title: "Tax bill's coming — did I save enough?",
  },
];

function CtaButtons() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href="/tool"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#122540] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[#0d1b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#122540]"
        >
          Get my number
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <a
          href="#live-demo"
          className="inline-flex min-h-12 items-center justify-center px-2 text-sm font-medium text-[#122540] underline underline-offset-4 sm:min-h-0"
        >
          See how it works ↓
        </a>
      </div>
      <span className="text-xs text-[#5b6472]">
        Free, no signup, nothing stored.
      </span>
    </div>
  );
}

export default function DesignA() {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1c1e21]">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
        <span className="text-sm font-medium text-[#5b6472]">
          Freelens — Design A: Interactive hero
        </span>
      </div>

      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center rounded-full border border-[#e3e1da] bg-white px-3 py-1 text-xs font-medium text-[#5b6472]">
            For Dutch freelancers and ZZP&apos;ers
          </span>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-[#122540] sm:text-5xl">
              Stop guessing what the Belastingdienst will take.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-[#5b6472]">
              Drag your income and watch your real safe-to-spend number
              appear.
            </p>
          </div>
          <CtaButtons />
        </div>

        <InteractiveHero />
      </section>

      <section className="border-t border-[#e3e1da]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <h2 className="max-w-md text-2xl font-semibold leading-tight text-[#122540] sm:text-3xl">
            Moments this is built for
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {MOMENTS.map(({ icon: Icon, title }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-[#e3e1da] bg-white p-4"
              >
                <Icon
                  className="mt-0.5 size-5 shrink-0 text-[#122540]"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium leading-relaxed text-[#1c1e21]">
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e3e1da] bg-[#122540] text-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-sm font-medium text-[#9db4d1]">
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
          <div className="flex flex-col items-start gap-2 md:items-end">
            <Link
              href="/tool"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#122540] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[#0d1b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#122540]"
            >
              Get my number
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <span className="text-xs text-[#5b6472]">
              Free, no signup, nothing stored.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
