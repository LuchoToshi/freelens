"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { InteractivePaymentExample } from "@/components/home/interactive-payment-example";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const itemTransition = {
    duration: prefersReducedMotion ? 0 : 0.5,
    ease: "easeOut" as const,
  };

  return (
    <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-16">
      <div className="order-1 lg:order-2">
        <InteractivePaymentExample />
      </div>

      <motion.div
        className="order-2 flex flex-col gap-6 lg:order-1"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={containerVariants}
      >
        <motion.span
          variants={itemVariants}
          transition={itemTransition}
          className="inline-flex w-fit items-center rounded-full border border-[var(--fl-line)] bg-white px-3 py-1 text-xs font-medium text-[var(--fl-slate)]"
        >
          For Dutch freelancers and ZZP&apos;ers
        </motion.span>
        <div className="flex flex-col gap-4">
          <motion.h1
            variants={itemVariants}
            transition={itemTransition}
            className="max-w-xl text-balance font-serif text-4xl font-medium leading-[1.1] tracking-tight text-[var(--fl-ink)] sm:text-5xl"
          >
            Money arrived. Know what happens next.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            transition={itemTransition}
            className="max-w-lg text-lg leading-relaxed text-[var(--fl-slate)]"
          >
            Freelens helps you separate VAT, protect a tax reserve, cover
            business costs, and see what may be available to pay yourself.
          </motion.p>
        </div>
        <motion.div
          variants={itemVariants}
          transition={itemTransition}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="/tool"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[var(--fl-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)]"
            >
              Process a payment
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center px-2 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] sm:min-h-0"
            >
              See how it works
            </a>
          </div>
          <span className="text-xs text-[var(--fl-slate)]">
            Free to try. No account. Your numbers stay on this device.
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
