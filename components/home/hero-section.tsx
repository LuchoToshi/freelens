"use client";

import { ArrowRight, ShieldCheck, UserX, Sparkles } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { LivingHeadline } from "@/components/home/living-headline";
import { HeroMedia } from "@/components/design/hero-media";
import { useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";
import { container } from "@/components/container";

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

/**
 * The problem and the promise, and one way forward.
 *
 * The hero used to carry a working calculator of its own, for the
 * after-payment moment only. That opened the page with half the product, then
 * repeated itself further down, and left the before-the-job half looking like
 * an afterthought. The calculator now lives in the section directly below,
 * where both moments sit in one control, so the hero's only job is to say what
 * this is and send the visitor one step down the page.
 */
export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const t = useT();
  const trust = [
    { icon: Sparkles, label: t.home.hero.trust.free },
    { icon: UserX, label: t.home.hero.trust.noAccount },
    { icon: ShieldCheck, label: t.home.hero.trust.onDevice },
  ];
  const itemTransition = {
    duration: prefersReducedMotion ? 0 : 0.5,
    ease: "easeOut" as const,
  };

  return (
    <section className={`${container} grid grid-cols-1 items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14`}>
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
          {t.home.hero.eyebrow}
        </motion.span>
        <motion.div variants={itemVariants} transition={itemTransition}>
          <LivingHeadline />
        </motion.div>
        <motion.p
          variants={itemVariants}
          transition={itemTransition}
          className="max-w-lg text-lg leading-relaxed text-[var(--fl-slate)]"
        >
          {t.home.hero.body}
        </motion.p>
        <motion.div
          variants={itemVariants}
          transition={itemTransition}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {/* One primary path, and it goes down the page rather than out of it.
              The calculator is the next thing on screen, so routing away from
              here would step over the fastest value on the site. */}
          <a
            href="#start"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fl-ink)] px-7 text-base font-medium text-white shadow-sm transition hover:bg-[var(--fl-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
          >
            {t.home.hero.primaryCta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex min-h-12 items-center justify-center px-2 text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
          >
            {t.home.hero.secondaryCta}
          </a>
        </motion.div>
        <motion.ul
          variants={itemVariants}
          transition={itemTransition}
          className="flex flex-wrap gap-x-5 gap-y-2"
        >
          {trust.map(({ icon: Icon, label }) => (
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
          {fill(t.home.hero.updated, {
            year: "2026",
            updated: t.home.hero.updatedDate,
          })}
        </motion.p>
      </motion.div>

      <HeroMedia className="lg:aspect-[4/5]" alt={t.home.hero.mediaAlt} />
    </section>
  );
}
