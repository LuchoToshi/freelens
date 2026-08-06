"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  hintClass,
  inputClass,
  labelClass,
  linkButtonClass,
  secondaryButtonClass,
} from "@/components/app/styles";
import { createJob, type JobRecord } from "@/lib/domain/jobs";
import type { Cents } from "@/lib/domain/money";
import { todayIso, type UseJobs } from "@/components/rate/use-jobs";
import { track } from "@/lib/analytics";
import { useT } from "@/components/i18n/locale-provider";

/**
 * "Save this quote."
 *
 * The one moment a calculation becomes a record. Deliberately cheap: a client
 * name is optional, and the single question asked by name is whether the quote
 * says what the client may do with the work, because usage rights are the term
 * creative quotes most often omit and the omission is invisible later.
 *
 * The figures are frozen here, not recomputed on read. A quote saved in March
 * must keep saying what it said in March.
 */
export function SaveQuote({
  jobsStore,
  feeExVatCents,
  jobCostsCents,
  vatRate,
  takeHomeCents,
  taxCents,
  configVersion,
}: {
  jobsStore: UseJobs;
  feeExVatCents: Cents;
  jobCostsCents: Cents;
  vatRate: number;
  takeHomeCents: Cents;
  taxCents: Cents;
  configVersion: string;
}) {
  const t = useT();
  const s = t.rate.job.save;

  const [open, setOpen] = useState(false);
  const [client, setClient] = useState("");
  const [rights, setRights] = useState<"specified" | "not-discussed" | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  if (savedId) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-medium text-[var(--fl-ink)]">
          <Check className="size-4 text-[var(--fl-payout-text)]" aria-hidden="true" />
          {s.savedNote}
        </p>
        <Link href="/offertes" className={`${linkButtonClass} w-fit`}>
          {s.toList}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-[var(--fl-line)] bg-white p-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${secondaryButtonClass} w-fit`}
        >
          <Bookmark className="size-4" aria-hidden="true" />
          {s.cta}
        </button>
        <p className={hintClass}>{s.why}</p>
      </div>
    );
  }

  const saveNow = () => {
    const job: JobRecord = createJob({
      client,
      feeExVatCents,
      jobCostsCents,
      vatRate,
      quotedTakeHomeCents: takeHomeCents,
      quotedTaxCents: taxCents,
      quotedConfigVersion: configVersion,
      createdAt: todayIso(),
      usageRights: rights ?? undefined,
    });
    jobsStore.save(job);
    setSavedId(job.id);
    track("quote_saved");
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--fl-line)] bg-white p-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="save-quote-client" className={labelClass}>
          {s.clientLabel}
        </Label>
        <Input
          id="save-quote-client"
          type="text"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder={s.clientPlaceholder}
          className={inputClass}
        />
        <p className={hintClass}>{s.clientHint}</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>{s.rightsLabel}</legend>
        <p className={hintClass}>{s.rightsHint}</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { v: "specified", l: s.rightsSpecified },
              { v: "not-discussed", l: s.rightsMissing },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              aria-pressed={rights === opt.v}
              onClick={() => setRights(rights === opt.v ? null : opt.v)}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
                rights === opt.v
                  ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                  : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={saveNow} className={`${secondaryButtonClass}`}>
          <Bookmark className="size-4" aria-hidden="true" />
          {s.confirm}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`${linkButtonClass}`}
        >
          {t.common.actions.cancel}
        </button>
      </div>
    </div>
  );
}
