"use client";

import { motion, useReducedMotion } from "framer-motion";
import { container } from "@/components/container";
import { FrontdeskWaitlistForm } from "@/components/home/frontdesk-waitlist-form";
import { HomeHero } from "@/components/home/hero";
import { Objections } from "@/components/home/objections";
import { FollowupHook } from "@/components/home/followup";
import { riseIn } from "@/components/home/home-motion";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";

/**
 * The agent-era homepage (addendum §5), beside the original at `/` rather
 * than replacing it — the original stays untouched for comparison, and the
 * flag-at-root switch is the owner's call.
 *
 * Same editorial system as the original (sharp corners, Fraunces display,
 * one accent band). The worked example becomes ask → numbered plan → the
 * result a week later, with "you approve before anything moves" stated where
 * the plan is; the objections are the agent-era trust questions; the
 * waitlist is reframed as invite-only on purpose, feeding the invite gate.
 */
export default function AgentHomepage() {
  const t = useT();
  const f = t.home.frontdesk;
  const a = f.agent;
  const reduce = useReducedMotion();
  useDocumentTitle(t.meta.agent.title, t.meta.agent.description);

  return (
    <main className="min-h-screen bg-[var(--fd-paper)] text-[var(--fd-ink)]">
      <HomeHero
        eyebrow={a.heroEyebrow}
        title={a.heroTitle}
        sub={a.heroSub}
        cta={a.heroCta}
        ctaTry={a.heroCtaTry}
      />

      {/* Ask → plan → result, on the ink gallery wall. */}
      <section
        id="worked-example"
        aria-label={a.exampleLabel}
        className="scroll-mt-16 bg-[var(--fd-ink)] text-white"
      >
        <div className={`${container} flex flex-col gap-12 py-24 sm:py-32`}>
          <motion.h2
            variants={riseIn(reduce)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-[18ch] font-serif text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[1.05] tracking-tight text-[var(--fd-paper)]"
          >
            {a.exampleLabel}
          </motion.h2>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 rounded-2xl bg-white/5 p-6">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                {a.askLabel}
              </span>
              <p className="font-serif text-[clamp(1.25rem,3vw,1.75rem)] leading-snug text-[var(--fd-paper)]">
                {a.ask}
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-white/5 p-6">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                {a.planLabel}
              </span>
              <ol className="flex flex-col gap-2">
                {a.planSteps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-3 text-base leading-relaxed text-white/90">
                    <span aria-hidden="true" className="font-mono text-sm text-white/50">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="text-sm font-medium text-[var(--fd-paper)]">{a.approveNote}</p>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl bg-white/5 p-6">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                {a.resultLabel}
              </span>
              <p className="text-base leading-relaxed text-white/90">{a.result}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={a.objections[0].q} className="py-8 sm:py-12">
        <Objections items={a.objections} />
      </section>

      <FollowupHook q={a.followupQ} a={a.followupA} />

      <section
        id="early-access"
        aria-label={a.waitlistHeading}
        className="scroll-mt-16 bg-[var(--fd-paper-dim)]"
      >
        <motion.div
          variants={riseIn(reduce)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className={`${container} flex flex-col gap-10 py-24 sm:py-32`}
        >
          <div className="flex flex-col gap-4">
            <h2 className="max-w-[16ch] font-serif text-[clamp(2rem,5vw,3.25rem)] font-medium leading-[1.05] tracking-tight">
              {a.waitlistHeading}
            </h2>
            <p className="max-w-[46ch] text-lg leading-relaxed text-[var(--fd-slate)]">
              {a.waitlistSub}
            </p>
          </div>
          <FrontdeskWaitlistForm />
        </motion.div>
      </section>
    </main>
  );
}
