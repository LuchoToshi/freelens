/**
 * Saved payments, grouped by tax year.
 *
 * This is what makes the reserve self-correct. The tax engine works out a bill
 * for the whole year and takes each payment's share of what is still
 * outstanding, which needs two running totals: profit earned so far, and tax
 * set aside so far. Before this module those were typed by hand and in practice
 * always left at zero, so the self-correction never actually ran.
 *
 * Everything here is pure. Storage lives in `persistence.ts`, which is still the
 * only module that touches localStorage.
 */
import { asCentsUnsafe, type Cents } from "@/lib/domain/money";

export const MAX_NOTE_LENGTH = 100;

export interface PaymentRecord {
  id: string;
  /** ISO calendar date, YYYY-MM-DD. User-editable; defaults to today. */
  date: string;
  /**
   * What this payment added to profit for the year: the payment excluding VAT,
   * minus any deductible costs entered against it. This is the figure the
   * reserve was calculated on, so summing it across a year gives a real
   * `ytdProfit` rather than a revenue total.
   */
  amountExVat: Cents;
  /** 21, 9 or 0. Non-numeric treatments (KOR, exempt, reverse-charged) store 0. */
  vatRate: number;
  vatAmount: Cents;
  reserveTaken: Cents;
  note?: string;
  /**
   * Denormalised from `date` for convenience when reading a stored record.
   * `date` is the single source of truth: nothing in this module filters or
   * groups on this field, because a stale value here would silently move a
   * payment between years.
   */
  taxYear: number;
}

export interface YearTotals {
  taxYear: number;
  /** Feeds the engine's `ytdProfit`. */
  profitCents: Cents;
  /** Feeds the engine's `ytdReserved`. */
  reservedCents: Cents;
  vatCents: Cents;
  count: number;
}

export function emptyPaymentHistory(): PaymentRecord[] {
  return [];
}

/** The Dutch tax year is the calendar year, so this is just the year part. */
export function taxYearOf(date: string): number {
  return Number(date.slice(0, 4));
}

export function clampNote(note: string | undefined): string | undefined {
  if (note === undefined) return undefined;
  const trimmed = note.trim();
  if (trimmed === "") return undefined;
  return trimmed.slice(0, MAX_NOTE_LENGTH);
}

export function newPaymentId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Only reached on very old browsers. Collision risk here is irrelevant: the
  // list is one person's payments on one device.
  return `p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isWholeCents(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
}

/**
 * Turns an unknown stored payload into a usable history.
 *
 * Bad records are dropped one by one rather than the whole history being
 * discarded, and the count comes back so the UI can say what happened. Losing
 * one malformed row silently would be worse than losing it loudly, and losing
 * the whole year because of one row would be worse still.
 */
export function sanitizePaymentHistory(value: unknown): {
  records: PaymentRecord[];
  discarded: number;
} {
  if (!Array.isArray(value)) {
    return { records: [], discarded: value === undefined || value === null ? 0 : 1 };
  }

  const records: PaymentRecord[] = [];
  let discarded = 0;
  const seenIds = new Set<string>();

  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) {
      discarded += 1;
      continue;
    }
    const r = raw as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      r.id === "" ||
      seenIds.has(r.id) ||
      typeof r.date !== "string" ||
      !ISO_DATE.test(r.date) ||
      Number.isNaN(Date.parse(r.date)) ||
      !isWholeCents(r.amountExVat) ||
      !isWholeCents(r.vatAmount) ||
      !isWholeCents(r.reserveTaken) ||
      typeof r.vatRate !== "number" ||
      !Number.isFinite(r.vatRate)
    ) {
      discarded += 1;
      continue;
    }
    seenIds.add(r.id);
    records.push({
      id: r.id,
      date: r.date,
      amountExVat: asCentsUnsafe(r.amountExVat),
      vatRate: r.vatRate,
      vatAmount: asCentsUnsafe(r.vatAmount),
      reserveTaken: asCentsUnsafe(r.reserveTaken),
      note: typeof r.note === "string" ? clampNote(r.note) : undefined,
      // Always re-derived, never trusted: a stored taxYear that disagrees with
      // the date would silently move a payment between years.
      taxYear: taxYearOf(r.date),
    });
  }

  return { records, discarded };
}

/** Newest first, which is the order the list is read in. */
export function sortByDateDesc(records: readonly PaymentRecord[]): PaymentRecord[] {
  return [...records].sort((a, b) => {
    if (a.date === b.date) return a.id < b.id ? 1 : -1;
    return a.date < b.date ? 1 : -1;
  });
}

export function recordsForTaxYear(
  records: readonly PaymentRecord[],
  taxYear: number
): PaymentRecord[] {
  return sortByDateDesc(records.filter((r) => taxYearOf(r.date) === taxYear));
}

/** Every tax year with at least one payment, most recent first. */
export function taxYearsPresent(records: readonly PaymentRecord[]): number[] {
  return [...new Set(records.map((r) => taxYearOf(r.date)))].sort((a, b) => b - a);
}

export function yearTotals(
  records: readonly PaymentRecord[],
  taxYear: number
): YearTotals {
  let profit = 0;
  let reserved = 0;
  let vat = 0;
  let count = 0;
  for (const record of records) {
    if (taxYearOf(record.date) !== taxYear) continue;
    profit += record.amountExVat;
    reserved += record.reserveTaken;
    vat += record.vatAmount;
    count += 1;
  }
  return {
    taxYear,
    profitCents: asCentsUnsafe(profit),
    reservedCents: asCentsUnsafe(reserved),
    vatCents: asCentsUnsafe(vat),
    count,
  };
}

export function addPayment(
  records: readonly PaymentRecord[],
  record: PaymentRecord
): PaymentRecord[] {
  return [...records, { ...record, taxYear: taxYearOf(record.date) }];
}

export type PaymentPatch = Partial<Omit<PaymentRecord, "id" | "taxYear">>;

export function updatePayment(
  records: readonly PaymentRecord[],
  id: string,
  patch: PaymentPatch
): PaymentRecord[] {
  return records.map((record) => {
    if (record.id !== id) return record;
    const next = { ...record, ...patch };
    // Editing the date can move a payment into a different tax year, which must
    // move it out of this year's totals as well as its position in the list.
    return { ...next, taxYear: taxYearOf(next.date), note: clampNote(next.note) };
  });
}

export function removePayment(
  records: readonly PaymentRecord[],
  id: string
): PaymentRecord[] {
  return records.filter((record) => record.id !== id);
}
