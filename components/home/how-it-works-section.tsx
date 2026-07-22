"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const STEPS = [
  {
    step: "Money arrives",
    body: "Enter a payment. Freelens separates the VAT, sets aside an income tax and Zvw reserve, and protects your business costs — so what's left is genuinely available to pay yourself.",
  },
  {
    step: "A calm weekly check-in",
    body: "Once a week, a quick read on your position: what's protected, what may be available, and how many months of runway you have. Saved on your device so it remembers, and you don't have to.",
  },
  {
    step: "Check a decision",
    body: "Thinking about a purchase or a payout? See whether it fits within your optional spending room, and what it does to your runway — before you spend, not after.",
  },
  {
    step: "Peace of mind",
    body: "Every euro has a job. Your reserves stay visible and protected. You know what you can do next.",
  },
];

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HowItWorksSection() {
  const reduce = useReducedMotion();
  return (
    <section
      id="how-it-works"
      className="border-t border-[var(--fl-line)]"
    >
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          Every payment, given a job.
        </h2>
        <div className="mt-12 flex flex-col">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={variants}
              transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
              className={`flex items-start gap-6 py-6 ${
                i !== STEPS.length - 1 ? "border-b border-[var(--fl-line)]" : ""
              }`}
            >
              <span className="mt-1 font-mono text-xs text-[var(--fl-slate)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-lg font-medium text-[var(--fl-ink)]">
                  {s.step}
                </h3>
                <p className="max-w-xl text-sm leading-relaxed text-[var(--fl-slate)]">
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
