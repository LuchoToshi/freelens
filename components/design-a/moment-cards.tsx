"use client";

import { CloudRain, FileCheck, Landmark, TrendingUp } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

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

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function MomentCards() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {MOMENTS.map(({ icon: Icon, title }) => (
        <motion.div
          key={title}
          variants={cardVariants}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -4,
                  boxShadow: "0 8px 24px -8px rgba(18,37,64,0.18)",
                  transition: { duration: 0.2, ease: "easeOut" },
                }
          }
          className="flex items-start gap-3 rounded-xl border border-[#e3e1da] bg-white p-4"
        >
          <Icon
            className="mt-0.5 size-5 shrink-0 text-[#122540]"
            aria-hidden="true"
          />
          <span className="text-sm font-medium leading-relaxed text-[#1c1e21]">
            {title}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
