"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

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

export function HeroCopy() {
  const prefersReducedMotion = useReducedMotion();
  const itemTransition = {
    duration: prefersReducedMotion ? 0 : 0.5,
    ease: "easeOut" as const,
  };

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={containerVariants}
    >
      <motion.span
        variants={itemVariants}
        transition={itemTransition}
        className="inline-flex w-fit items-center rounded-full border border-[#e3e1da] bg-white px-3 py-1 text-xs font-medium text-[#5b6472]"
      >
        For Dutch freelancers and ZZP&apos;ers
      </motion.span>
      <div className="flex flex-col gap-4">
        <motion.h1
          variants={itemVariants}
          transition={itemTransition}
          className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-[#122540] sm:text-5xl"
        >
          Stop guessing what the Belastingdienst will take.
        </motion.h1>
        <motion.p
          variants={itemVariants}
          transition={itemTransition}
          className="max-w-lg text-lg leading-relaxed text-[#5b6472]"
        >
          Drag your income and watch your real safe-to-spend number appear.
        </motion.p>
      </div>
      <motion.div variants={itemVariants} transition={itemTransition}>
        <CtaButtons />
      </motion.div>
    </motion.div>
  );
}
