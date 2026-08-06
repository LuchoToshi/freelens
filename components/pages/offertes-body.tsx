"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { BackLink } from "@/components/i18n/back-link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { container } from "@/components/container";
import {
  hintClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/app/styles";
import {
  daysInStatus,
  markJobLost,
  markJobWon,
  reopenJob,
  sortJobsForPipeline,
  type JobRecord,
  type JobStatus,
} from "@/lib/domain/jobs";
import {
  formatEuro,
  parseAmountInput,
  subtractCents,
  fromCents,
} from "@/lib/domain/money";
import { todayIso, useJobs } from "@/components/rate/use-jobs";
import { track } from "@/lib/analytics";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

const STATUS_COLOR: Record<JobStatus, string> = {
  quoted: "var(--fl-vat-text)",
  accepted: "var(--fl-payout-text)",
  invoiced: "var(--fl-vat-text)",
  paid: "var(--fl-payout-text)",
  lost: "var(--fl-slate)",
  archived: "var(--fl-slate)",
};

/**
 * The quote list: every price named, and what the market said back.
 *
 * Deliberately a list and nothing more. No pipeline value forecasting, no
 * reminders, no charts. The one job of this page is to make recording an
 * outcome cost a single tap, because the outcomes are the only data here that
 * cannot be reconstructed later.
 */
export function OffertesPageBody() {
  const t = useT();
  const o = t.offertesPage;
  const store = useJobs();
  useDocumentTitle(t.meta.offertes.title, t.meta.offertes.description);

  const jobs = sortJobsForPipeline(store.jobs);

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className={`${container} flex flex-col gap-8 py-12`}>
        <BackLink />

        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {o.eyebrow}
          </span>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-[var(--fl-ink)] sm:text-5xl">
            {o.heading}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--fl-slate)]">
            {o.lead}
          </p>
          <p className={hintClass}>{o.onDevice}</p>
        </header>

        {store.hydrated && jobs.length === 0 && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6">
            <p className="text-base font-medium text-[var(--fl-ink)]">{o.emptyTitle}</p>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--fl-slate)]">
              {o.emptyBody}
            </p>
            <Link href="/#start" className={primaryButtonClass}>
              {o.emptyCta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        <ul className="flex flex-col gap-4">
          {jobs.map((job) => (
            <QuoteRow key={job.id} job={job} store={store} />
          ))}
        </ul>
      </div>
    </main>
  );
}

function QuoteRow({
  job,
  store,
}: {
  job: JobRecord;
  store: ReturnType<typeof useJobs>;
}) {
  const t = useT();
  const o = t.offertesPage;
  const [capture, setCapture] = useState<"won" | "lost" | null>(null);
  const [finalFee, setFinalFee] = useState(String(fromCents(job.feeExVatCents)));
  const [note, setNote] = useState("");

  const open = job.status === "quoted";
  const days = daysInStatus(job, todayIso());

  const recordWon = () => {
    const cents = parseAmountInput(finalFee).cents ?? job.feeExVatCents;
    store.change(job.id, (j) =>
      markJobWon(j, todayIso(), cents > 0 ? cents : job.feeExVatCents, note)
    );
    setCapture(null);
    track("quote_won");
  };

  const recordLost = () => {
    store.change(job.id, (j) => markJobLost(j, todayIso(), note));
    setCapture(null);
    track("quote_lost");
  };

  const reopen = () => {
    store.change(job.id, (j) => reopenJob(j, todayIso()));
    track("quote_reopened");
  };

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-base font-medium text-[var(--fl-ink)]">
          {job.client || job.project || fill(o.savedOn, { date: job.createdAt })}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: STATUS_COLOR[job.status] }}
        >
          {o.status[job.status]}
          {open ? ` · ${fill(o.daysOpen, { days })}` : ""}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 text-sm text-[var(--fl-slate)]">
        <span className="fl-tnum">
          {fill(o.fee, { amount: formatEuro(job.feeExVatCents) })}
        </span>
        <span className="fl-tnum">
          {fill(o.takeHome, { amount: formatEuro(job.quotedTakeHomeCents) })}
        </span>
        {job.usageRights === "not-discussed" && (
          <span className="text-[var(--fl-vat-text)]">{o.rightsMissing}</span>
        )}
      </div>

      {/* Outcome, once known. */}
      {(job.status === "accepted" || job.status === "lost") && (
        <div className="flex flex-col gap-1 border-t border-[var(--fl-line)] pt-3 text-sm">
          <span className="font-medium text-[var(--fl-ink)]">
            {job.status === "accepted" && job.finalFeeExVatCents !== undefined
              ? fill(o.wonSummary, { amount: formatEuro(job.finalFeeExVatCents) }) +
                (job.finalFeeExVatCents < job.feeExVatCents
                  ? fill(o.wonBelowQuote, {
                      diff: formatEuro(
                        subtractCents(job.feeExVatCents, job.finalFeeExVatCents)
                      ),
                    })
                  : "")
              : job.status === "lost"
                ? o.lostSummary
                : o.status[job.status]}
          </span>
          {job.outcomeNote && (
            <span className="text-[var(--fl-slate)]">
              {o.outcomePrefix}
              {job.outcomeNote}
            </span>
          )}
          <button type="button" onClick={reopen} className={`${linkButtonClass} w-fit`}>
            {o.reopen}
          </button>
        </div>
      )}

      {/* Outcome capture for an open quote. */}
      {open && capture === null && (
        <div className="flex flex-wrap gap-3 border-t border-[var(--fl-line)] pt-3">
          <button
            type="button"
            onClick={() => setCapture("won")}
            className={secondaryButtonClass}
          >
            <Check className="size-4" aria-hidden="true" />
            {o.won}
          </button>
          <button
            type="button"
            onClick={() => setCapture("lost")}
            className={secondaryButtonClass}
          >
            <X className="size-4" aria-hidden="true" />
            {o.lost}
          </button>
        </div>
      )}

      {open && capture !== null && (
        <div className="flex flex-col gap-4 border-t border-[var(--fl-line)] pt-4">
          {capture === "won" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`final-fee-${job.id}`} className={labelClass}>
                {o.finalFeeLabel}
              </Label>
              <Input
                id={`final-fee-${job.id}`}
                type="text"
                inputMode="decimal"
                value={finalFee}
                onChange={(e) => setFinalFee(e.target.value)}
                className={inputClass}
              />
              <p className={hintClass}>{o.finalFeeHint}</p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`note-${job.id}`} className={labelClass}>
              {o.noteLabel}
            </Label>
            <Input
              id={`note-${job.id}`}
              type="text"
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
            <p className={hintClass}>{o.noteHint}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={capture === "won" ? recordWon : recordLost}
              className={primaryButtonClass}
            >
              {capture === "won" ? o.confirmWon : o.confirmLost}
            </button>
            <button
              type="button"
              onClick={() => setCapture(null)}
              className={linkButtonClass}
            >
              {t.common.actions.cancel}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
