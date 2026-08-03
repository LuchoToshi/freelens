"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { CurrencyField } from "@/components/app/fields";
import {
  hintClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/app/styles";
import {
  asCentsUnsafe,
  formatEuro,
  parseAmountInput,
  type Cents,
} from "@/lib/domain/money";
import {
  MAX_NOTE_LENGTH,
  recordsForTaxYear,
  taxYearsPresent,
  yearTotals,
  type PaymentPatch,
  type PaymentRecord,
} from "@/lib/domain/paymentHistory";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

/**
 * The saved payments for a tax year, with the running totals that feed the
 * engine. Editing or deleting a row changes those totals, which changes what
 * the next payment is asked to set aside. That feedback is the whole point of
 * keeping a history, so the totals sit at the top where they are visible while
 * you edit.
 */
export function PaymentHistory({
  records,
  taxYear,
  onEdit,
  onDelete,
}: {
  records: PaymentRecord[];
  taxYear: number;
  onEdit: (id: string, patch: PaymentPatch) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const years = taxYearsPresent(records);
  const previousYears = years.filter((y) => y !== taxYear);
  const thisYear = recordsForTaxYear(records, taxYear);
  const totals = yearTotals(records, taxYear);

  return (
    <section className="flex flex-col gap-4" aria-label={`Saved payments for ${taxYear}`}>
      <div className="flex flex-col gap-1 rounded-xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fl-slate)]">
          {taxYear} so far
        </span>
        <dl className="mt-1 flex flex-wrap gap-x-8 gap-y-2">
          <Total label="Earned (excl. btw)" value={formatEuro(totals.profitCents)} />
          <Total label="Set aside for tax" value={formatEuro(totals.reservedCents)} />
          <Total label="btw collected" value={formatEuro(totals.vatCents)} />
          <Total
            label="Payments"
            value={String(totals.count)}
          />
        </dl>
        <p className={`${hintClass} mt-2`}>
          These totals are what Freelens uses to work out your share of the
          remaining bill. Set aside too much early and later payments ask for
          less.
        </p>
      </div>

      {thisYear.length === 0 ? (
        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">
          No payments saved for {taxYear} yet. Work out a payment above and
          choose <strong>Save to {taxYear}</strong> to start the running total.
          Until then Freelens treats every payment as your first of the year.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {thisYear.map((record) =>
            editingId === record.id ? (
              <li key={record.id}>
                <EditRow
                  record={record}
                  onCancel={() => setEditingId(null)}
                  onSave={(patch) => {
                    onEdit(record.id, patch);
                    setEditingId(null);
                  }}
                />
              </li>
            ) : (
              <li
                key={record.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-[var(--fl-line)] bg-white p-4"
              >
                <span className="w-24 shrink-0 text-sm text-[var(--fl-slate)]">
                  {formatDate(record.date)}
                </span>
                <span className="fl-tnum font-mono text-sm font-medium text-[var(--fl-ink)]">
                  {formatEuro(record.amountExVat)}
                </span>
                <span className="fl-tnum font-mono text-xs text-[var(--fl-slate)]">
                  btw {formatEuro(record.vatAmount)}
                  {record.vatRate > 0 ? ` (${record.vatRate}%)` : ""}
                </span>
                <span className="fl-tnum font-mono text-xs text-[var(--fl-slate)]">
                  reserved {formatEuro(record.reserveTaken)}
                </span>
                {record.note && (
                  <span className="w-full text-xs text-[var(--fl-slate)]">
                    {record.note}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(record.id);
                      setConfirmDeleteId(null);
                    }}
                    aria-label={`Edit payment of ${formatEuro(record.amountExVat)} on ${formatDate(record.date)}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--fl-slate)] hover:text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(record.id)}
                    aria-label={`Delete payment of ${formatEuro(record.amountExVat)} on ${formatDate(record.date)}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--fl-slate)] hover:text-[var(--fl-short-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </span>
                {confirmDeleteId === record.id && (
                  <div className="flex w-full flex-wrap items-center gap-3 border-t border-[var(--fl-line)] pt-3">
                    <span className="text-sm text-[var(--fl-ink)]">
                      Delete this payment? Your {taxYear} totals will go down.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(record.id);
                        setConfirmDeleteId(null);
                      }}
                      className="min-h-11 text-sm font-medium text-[var(--fl-short-text)] underline"
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className={linkButtonClass}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            )
          )}
        </ul>
      )}

      {previousYears.length > 0 && (
        <details className="rounded-xl border border-[var(--fl-line)] p-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
            Earlier years ({previousYears.join(", ")})
          </summary>
          <p className={`${hintClass} mt-2`}>
            Kept, but left out of the {taxYear} totals. Income tax is settled one
            year at a time, so an earlier year cannot change what you owe for
            this one.
          </p>
          {previousYears.map((year) => {
            const yearRecords = recordsForTaxYear(records, year);
            const t = yearTotals(records, year);
            return (
              <div key={year} className="mt-4 flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <span className="text-sm font-semibold text-[var(--fl-ink)]">
                    {year}
                  </span>
                  <span className="fl-tnum font-mono text-xs text-[var(--fl-slate)]">
                    {formatEuro(t.profitCents)} earned
                  </span>
                  <span className="fl-tnum font-mono text-xs text-[var(--fl-slate)]">
                    {formatEuro(t.reservedCents)} set aside
                  </span>
                  <span className="text-xs text-[var(--fl-slate)]">
                    {t.count} payment{t.count === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="flex flex-col gap-1">
                  {yearRecords.map((record) => (
                    <li
                      key={record.id}
                      className="flex flex-wrap items-baseline gap-x-4 text-xs text-[var(--fl-slate)]"
                    >
                      <span className="w-24 shrink-0">{formatDate(record.date)}</span>
                      <span className="fl-tnum font-mono">
                        {formatEuro(record.amountExVat)}
                      </span>
                      <span className="fl-tnum font-mono">
                        reserved {formatEuro(record.reserveTaken)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(record.id)}
                        className="ml-auto min-h-9 underline hover:text-[var(--fl-ink)]"
                      >
                        Delete
                      </button>
                      {confirmDeleteId === record.id && (
                        <span className="flex w-full items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDelete(record.id);
                              setConfirmDeleteId(null);
                            }}
                            className="min-h-9 font-medium text-[var(--fl-short-text)] underline"
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-9 underline"
                          >
                            Cancel
                          </button>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </details>
      )}
    </section>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-[var(--fl-slate)]">{label}</dt>
      <dd className="fl-tnum font-mono text-sm font-medium text-[var(--fl-ink)]">
        {value}
      </dd>
    </div>
  );
}

function EditRow({
  record,
  onSave,
  onCancel,
}: {
  record: PaymentRecord;
  onSave: (patch: PaymentPatch) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(record.date);
  const [amount, setAmount] = useState(String(record.amountExVat / 100));
  const [vat, setVat] = useState(String(record.vatAmount / 100));
  const [reserve, setReserve] = useState(String(record.reserveTaken / 100));
  const [note, setNote] = useState(record.note ?? "");

  const amountCents = parseAmountInput(amount).cents;
  const vatCents = parseAmountInput(vat).cents;
  const reserveCents = parseAmountInput(reserve).cents;
  const dateValid = ISO_DATE.test(date) && !Number.isNaN(Date.parse(date));
  const canSave =
    dateValid && amountCents !== null && vatCents !== null && reserveCents !== null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--fl-ink)] bg-white p-4">
      <div className="flex flex-col gap-1.5">
        <Label className={labelClass} htmlFor={`date-${record.id}`}>
          Date
        </Label>
        <input
          id={`date-${record.id}`}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 w-fit rounded-lg border border-[var(--fl-line)] bg-white px-2.5 text-sm text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        />
        {!dateValid && (
          <p className="text-xs text-[var(--fl-short-text)]">Enter a valid date.</p>
        )}
        <p className={hintClass}>
          Moving this to another year takes it out of the current year&apos;s
          totals. It is kept, not deleted.
        </p>
      </div>
      <CurrencyField
        id={`amount-${record.id}`}
        label="Amount excluding btw"
        leadingSymbol="€"
        value={amount}
        onChange={setAmount}
      />
      <CurrencyField
        id={`vat-${record.id}`}
        label="btw"
        leadingSymbol="€"
        value={vat}
        onChange={setVat}
      />
      <CurrencyField
        id={`reserve-${record.id}`}
        label="Set aside for tax"
        leadingSymbol="€"
        value={reserve}
        onChange={setReserve}
      />
      <div className="flex flex-col gap-1.5">
        <Label className={labelClass} htmlFor={`note-${record.id}`}>
          Note (optional)
        </Label>
        <input
          id={`note-${record.id}`}
          type="text"
          maxLength={MAX_NOTE_LENGTH}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Editorial shoot"
          className="h-11 rounded-lg border border-[var(--fl-line)] bg-white px-2.5 text-sm text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canSave}
          onClick={() =>
            onSave({
              date,
              amountExVat: (amountCents ?? asCentsUnsafe(0)) as Cents,
              vatAmount: (vatCents ?? asCentsUnsafe(0)) as Cents,
              reserveTaken: (reserveCents ?? asCentsUnsafe(0)) as Cents,
              note,
            })
          }
          className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Save changes
        </button>
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancel
        </button>
      </div>
    </div>
  );
}
