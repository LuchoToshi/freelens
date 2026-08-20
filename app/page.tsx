"use client";

import { motion, useReducedMotion } from "framer-motion";
import { container } from "@/components/container";
import { FrontdeskWaitlistForm } from "@/components/home/frontdesk-waitlist-form";
import { HomeHero } from "@/components/home/hero";
import { Objections } from "@/components/home/objections";
import { FollowupHook } from "@/components/home/followup";
import { WorkedExample } from "@/components/home/worked-example";
import { riseIn } from "@/components/home/home-motion";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";

/**
 * The FrontDesk front door — bold editorial cut.
 *
 * One product, one story, one token set: warm paper, near-black ink, burnt
 * orange as the single accent, Fraunces at display scale, choreographed
 * scroll reveals (framer-motion, transform/opacity only, once). Surface
 * rhythm: paper hero → ink gallery (the worked example) → paper Q&A →
 * accent band (the follow-up) → dim-paper capture → quiet trust line.
 *
 * The rules that govern the drafts govern this page: no "AI" above the trust
 * line, no send/availability claims, no fabricated proof. The worked example
 * is bold FRAME, calm CONTENT — its text never moves after arrival. All
 * motion collapses under prefers-reduced-motion.
 */
export default function Home() {
  const t = useT();
  const f = t.home.frontdesk;
  const reduce = useReducedMotion();
  useDocumentTitle(t.meta.home.title, t.meta.home.description);

  return (
    <main className="min-h-screen bg-[var(--fd-paper)] text-[var(--fd-ink)]">
      {/* 1 · The statement. */}
      <HomeHero
        eyebrow={f.heroEyebrow}
        title={f.heroTitle}
        sub={f.heroSub}
        cta={f.heroCta}
        ctaTry={f.heroCtaTry}
      />

      {/* 2 · The worked example: an ink gallery wall around a calm, readable draft. */}
      <section aria-label={f.example.label} className="bg-[var(--fd-ink)] text-white">
        <div className={`${container} flex flex-col gap-12 py-24 sm:py-32`}>
          <motion.h2
            variants={riseIn(reduce)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-[18ch] font-serif text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[1.05] tracking-tight text-[var(--fd-paper)]"
          >
            {f.example.label}
          </motion.h2>
          <WorkedExample
            demo={f.demo}
            inquiryLabel={f.example.inquiryLabel}
            draftLabel={f.example.draftLabel}
          />
        </div>
      </section>

      {/*
        Placeholder: a real receipt goes here once one exists — a named tester,
        a real booked job, a real number. Nothing fabricated ships; this slot
        renders nothing until then.
      */}

      {/* 3 · Three objections, editorial Q&A. */}
      <section aria-label={f.objections.items[0].q} className="py-8 sm:py-12">
        <Objections items={f.objections.items} />
      </section>

      {/* 4 · The follow-up hook: the one accent-surface moment. */}
      <FollowupHook q={f.followup.q} a={f.followup.a} />

      {/* 5 · Who it's for + the early-access capture: the soft close. */}
      <section
        id="early-access"
        aria-label={f.waitlist.heading}
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
            <h2 className="max-w-[18ch] font-serif text-[clamp(2.2rem,5.5vw,4.5rem)] font-medium leading-[1.02] tracking-tight text-[var(--fd-ink)]">
              {f.waitlist.heading}
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--fd-ink)]">
              {f.audience.line}
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--fd-slate)]">
              {f.waitlist.sub}
            </p>
            {/* Overflow capture: visually secondary, same form — the craft
                picker's "something else" is how adjacent crafts answer. */}
            <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{f.audience.overflow}</p>
          </div>
          <FrontdeskWaitlistForm />
        </motion.div>
      </section>

      {/* 6 · The trust line renders in the FrontDesk footer variant — the
          mechanism named honestly, exactly once per page. */}
    </main>
  );
}
