"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, UserX, Sparkles } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { InteractivePaymentExample } from "@/components/home/interactive-payment-example";
import { LivingHeadline } from "@/components/home/living-headline";
import { HeroMedia } from "@/components/design/hero-media";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// Slide-only entrance: essential above-the-fold hero content is always visible
// (opacity stays 1) so motion never gates access to it, even mid-animation.
const itemVariants: Variants = {
  hidden: { y: 16 },
  visible: { y: 0 },
};

const TRUST = [
  { icon: Sparkles, label: "Free to try" },
  { icon: UserX, label: "No account" },
  { icon: ShieldCheck, label: "Numbers stay on this device" },
];

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const itemTransition = {
    duration: prefersReducedMotion ? 0 : 0.5,
    ease: "easeOut" as const,
  };

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
      {/* Expressive side: living headline + CTAs + trust. */}
      <motion.div
        className="flex flex-col gap-6"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={containerVariants}
      >
        <motion.span
          variants={itemVariants}
          transition={itemTransition}
          className="inline-flex w-fit items-center rounded-full border border-[var(--fl-line)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fl-slate)]"
        >
          For Dutch freelancers and ZZP&apos;ers
        </motion.span>
        <motion.div variants={itemVariants} transition={itemTransition}>
          <LivingHeadline />
        </motion.div>
        <motion.p
          variants={itemVariants}
          transition={itemTransition}
          className="max-w-lg text-lg leading-relaxed text-[var(--fl-slate)]"
        >
          A client paid you. See what&apos;s VAT, what to reserve for tax, what
          stays in the business, and what you can pay yourself.
        </motion.p>
        <motion.div
          variants={itemVariants}
          transition={itemTransition}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/tool"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fl-ink)] px-7 text-base font-medium text-white shadow-sm transition hover:bg-[var(--fl-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            See what I can pay myself
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex min-h-12 items-center justify-center px-2 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
          >
            See how it works
          </a>
        </motion.div>
        <motion.ul
          variants={itemVariants}
          transition={itemTransition}
          className="flex flex-wrap gap-x-5 gap-y-2"
        >
          {TRUST.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--fl-slate)]"
            >
              <Icon className="size-3.5 text-[var(--fl-payout-text)]" aria-hidden="true" />
              {label}
            </li>
          ))}
        </motion.ul>
        <motion.p
          variants={itemVariants}
          transition={itemTransition}
          className="text-xs text-[var(--fl-slate)]"
        >
          Built on 2026 Dutch tax reference values. Updated July 2026.
        </motion.p>
      </motion.div>

      {/* Product result floating on a clean surface over the creative crop.
          Mobile order: headline (above) -> result card -> visual crop. */}
      <div className="flex flex-col-reverse gap-4 lg:flex-col lg:gap-0">
        <HeroMedia
          className="lg:aspect-[4/3]"
          alt="A Dutch creative freelancer at work"
        />
        <div className="relative z-10 lg:-mt-20 lg:px-6">
          <InteractivePaymentExample />
        </div>
      </div>
    </section>
  );
}
