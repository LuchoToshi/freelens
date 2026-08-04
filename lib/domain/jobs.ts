/**
 * A job, from the price you named to the money that arrived.
 *
 * One record, five states, no duplicates. The quote and the payment are the
 * same object at different moments, which is the whole point: a freelancer who
 * quoted €1.800 and later received €1.750 should see one job that moved, not a
 * quote and an unrelated payment that happen to look similar.
 *
 * States, and why each one exists:
 *
 *   quoted     You named a price. Nothing is owed. Chasing this means asking
 *              for an answer, not for money.
 *   accepted   They said yes. Money is coming but is not yet due, so it must
 *              never be counted as outstanding.
 *   invoiced   The invoice is out. This, and only this, is money owed to you.
 *   paid       It arrived, and a payment record was written from it.
 *   archived   It will not happen. Kept, never deleted, so the history stays
 *              honest and an accidental archive can be undone.
 *
 * Everything here is pure. `today` is always passed in: a module that reads the
 * clock cannot be tested against a date that matters, and "47 days open" has to
 * be reproducible.
 *
 * What this is not: a CRM. There is no contact record, no pipeline value
 * forecasting, no reminder scheduling. A client is a name on a job.
 */
import { asCentsUnsafe, type Cents } from "@/lib/domain/money";

export type JobStatus = "quoted" | "accepted" | "invoiced" | "paid" | "archived";

/** Money is only owed to you in this state. Totals depend on it being exact. */
export const OUTSTANDING_STATUS: JobStatus = "invoiced";

/** Still in motion: no money yet, but the job has not gone away. */
export const OPEN_STATUSES: readonly JobStatus[] = ["quoted", "accepted", "invoiced"];

export interface JobEvent {
  status: JobStatus;
  /** ISO calendar date, YYYY-MM-DD. */
  at: string;
}

export interface JobRecord {
  id: string;
  /** Free text. A name is enough; no client profile is required to save. */
  client: string;
  /** Optional label so two jobs for one client are tellable apart. */
  project?: string;

  /** The fee named, excluding btw. */
  feeExVatCents: Cents;
  jobCostsCents: Cents;
  /** 21, 9 or 0. */
  vatRate: number;

  /**
   * What the calculator said at the time of quoting, frozen.
   *
   * Deliberately stored rather than recomputed on read. Reserve settings and
   * projected profit both change during a year, and a job quoted in March must
   * keep showing what it was worth in March. Recomputing would silently rewrite
   * the past every time a setting moved.
   */
  quotedTakeHomeCents: Cents;
  quotedTaxCents: Cents;
  /** The config the frozen figures came from, so they can be traced. */
  quotedConfigVersion: string;

  /** ISO date the job was created. */
  createdAt: string;
  /** Optional date payment is expected. Absent means no due date exists. */
  dueDate?: string;

  status: JobStatus;
  /** ISO date the current status began. Drives every "x days" figure. */
  statusChangedAt: string;

  /** Set once paid. */
  paidAt?: string;
  paidAmountExVatCents?: Cents;
  /**
   * The payment record this job produced. The link is what keeps the quote and
   * the payment one object: the reserve, the year totals and the weekly
   * position all keep reading payment history exactly as before.
   */
  paymentId?: string;

  taxYear: number;
  /** Every state this job has been in, oldest first. Never rewritten. */
  history: JobEvent[];
}

export function emptyJobs(): JobRecord[] {
  return [];
}

export function newJobId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `j-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

export interface CreateJobInput {
  client: string;
  project?: string;
  feeExVatCents: Cents;
  jobCostsCents: Cents;
  vatRate: number;
  quotedTakeHomeCents: Cents;
  quotedTaxCents: Cents;
  quotedConfigVersion: string;
  /** ISO date. Passed in, never read from the clock. */
  createdAt: string;
  dueDate?: string;
  status?: JobStatus;
  id?: string;
}

export function createJob(input: CreateJobInput): JobRecord {
  const status = input.status ?? "quoted";
  return {
    id: input.id ?? newJobId(),
    client: clampText(input.client) || "",
    project: clampText(input.project) || undefined,
    feeExVatCents: input.feeExVatCents,
    jobCostsCents: input.jobCostsCents,
    vatRate: input.vatRate,
    quotedTakeHomeCents: input.quotedTakeHomeCents,
    quotedTaxCents: input.quotedTaxCents,
    quotedConfigVersion: input.quotedConfigVersion,
    createdAt: input.createdAt,
    dueDate: input.dueDate,
    status,
    statusChangedAt: input.createdAt,
    taxYear: taxYearOfDate(input.createdAt),
    history: [{ status, at: input.createdAt }],
  };
}

/** Names and labels are free text; keep them short enough to render. */
export function clampText(value: string | undefined, max = 80): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function taxYearOfDate(iso: string): number {
  return Number(iso.slice(0, 4));
}

/**
 * Moves a job to a new state.
 *
 * Idempotent on purpose: a double-tapped button, or a second submit from a
 * flaky connection, must not append a duplicate history entry or reset the
 * "days in this state" counter. Returning the same object also means React
 * skips the re-render.
 */
export function transitionJob(job: JobRecord, status: JobStatus, at: string): JobRecord {
  if (job.status === status) return job;
  return {
    ...job,
    status,
    statusChangedAt: at,
    history: [...job.history, { status, at }],
  };
}

export interface MarkPaidInput {
  /** ISO date the money arrived. May be in the past. */
  paidAt: string;
  /** What actually arrived, excluding btw. Defaults to the quoted fee. */
  amountExVatCents: Cents;
  /** The payment record written from this job. */
  paymentId: string;
}

export function markJobPaid(job: JobRecord, input: MarkPaidInput): JobRecord {
  const moved = transitionJob(job, "paid", input.paidAt);
  return {
    ...moved,
    paidAt: input.paidAt,
    paidAmountExVatCents: input.amountExVatCents,
    paymentId: input.paymentId,
    // The payment lands in the year the money arrived, which is not always the
    // year the job was quoted in.
    taxYear: taxYearOfDate(input.paidAt),
  };
}

/**
 * Undoes a payment, back to invoiced.
 *
 * The payment record is removed separately by the caller. Clearing the link
 * here as well is what stops a job pointing at a record that no longer exists.
 */
export function unmarkJobPaid(job: JobRecord, at: string): JobRecord {
  if (job.status !== "paid") return job;
  const moved = transitionJob(job, "invoiced", at);
  return {
    ...moved,
    paidAt: undefined,
    paidAmountExVatCents: undefined,
    paymentId: undefined,
    taxYear: taxYearOfDate(job.createdAt),
  };
}

/** Whole days between two ISO dates. Negative clamps to zero. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export function daysInStatus(job: JobRecord, today: string): number {
  return daysBetween(job.statusChangedAt, today);
}

/**
 * Whether a job is genuinely late.
 *
 * Only ever true when a real due date exists and has passed. Without a due
 * date the UI says how long something has been outstanding instead, which is a
 * fact rather than a judgement.
 */
export function isOverdue(job: JobRecord, today: string): boolean {
  if (job.status !== OUTSTANDING_STATUS || !job.dueDate) return false;
  return daysBetween(job.dueDate, today) > 0;
}

export interface PipelineTotals {
  /** Invoiced and unpaid. The only figure that may be called "outstanding". */
  outstandingCents: Cents;
  outstandingCount: number;
  /** Quoted and accepted: in motion, nothing owed yet. */
  openCents: Cents;
  openCount: number;
  /** Paid in the given tax year. */
  paidCents: Cents;
  paidCount: number;
  /** What the quotes said would be kept, for jobs still open or outstanding. */
  expectedTakeHomeCents: Cents;
  /** Longest time any outstanding item has been waiting, in days. */
  oldestOutstandingDays: number;
}

export function pipelineTotals(
  jobs: readonly JobRecord[],
  today: string,
  taxYear: number
): PipelineTotals {
  let outstandingCents = 0;
  let outstandingCount = 0;
  let openCents = 0;
  let openCount = 0;
  let paidCents = 0;
  let paidCount = 0;
  let expectedTakeHomeCents = 0;
  let oldestOutstandingDays = 0;

  for (const job of jobs) {
    if (job.status === "archived") continue;

    if (job.status === "paid") {
      if (job.taxYear === taxYear) {
        paidCents += job.paidAmountExVatCents ?? job.feeExVatCents;
        paidCount += 1;
      }
      continue;
    }

    expectedTakeHomeCents += job.quotedTakeHomeCents;

    if (job.status === OUTSTANDING_STATUS) {
      outstandingCents += job.feeExVatCents;
      outstandingCount += 1;
      oldestOutstandingDays = Math.max(oldestOutstandingDays, daysInStatus(job, today));
    } else {
      openCents += job.feeExVatCents;
      openCount += 1;
    }
  }

  return {
    outstandingCents: asCentsUnsafe(outstandingCents),
    outstandingCount,
    openCents: asCentsUnsafe(openCents),
    openCount,
    paidCents: asCentsUnsafe(paidCents),
    paidCount,
    expectedTakeHomeCents: asCentsUnsafe(expectedTakeHomeCents),
    oldestOutstandingDays,
  };
}

/**
 * Sorting for the pipeline.
 *
 * Outstanding first, oldest first inside that, because those are the ones with
 * money attached and something to do about them. Paid and archived sink.
 */
const STATUS_ORDER: Record<JobStatus, number> = {
  invoiced: 0,
  accepted: 1,
  quoted: 2,
  paid: 3,
  archived: 4,
};

export function sortJobsForPipeline(jobs: readonly JobRecord[]): JobRecord[] {
  return [...jobs].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return a.statusChangedAt.localeCompare(b.statusChangedAt);
  });
}

export function addJob(jobs: readonly JobRecord[], job: JobRecord): JobRecord[] {
  return [...jobs, job];
}

export function updateJob(
  jobs: readonly JobRecord[],
  id: string,
  change: (job: JobRecord) => JobRecord
): JobRecord[] {
  return jobs.map((job) => (job.id === id ? change(job) : job));
}

export function removeJob(jobs: readonly JobRecord[], id: string): JobRecord[] {
  return jobs.filter((job) => job.id !== id);
}

export function findJob(
  jobs: readonly JobRecord[],
  id: string
): JobRecord | undefined {
  return jobs.find((job) => job.id === id);
}

// ---------------------------------------------------------------------------
// Storage safety
// ---------------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES: readonly string[] = [
  "quoted",
  "accepted",
  "invoiced",
  "paid",
  "archived",
];

function isCents(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE.test(value);
}

/**
 * Turns an unknown stored payload into a usable list.
 *
 * Bad records are dropped one at a time and counted, never silently, and never
 * by discarding the whole list: one unreadable job must not cost a freelancer
 * the other thirty.
 */
export function sanitizeJobs(value: unknown): {
  jobs: JobRecord[];
  discarded: number;
} {
  if (!Array.isArray(value)) {
    return { jobs: [], discarded: 0 };
  }

  const jobs: JobRecord[] = [];
  let discarded = 0;

  for (const raw of value) {
    const job = sanitizeJob(raw);
    if (job) jobs.push(job);
    else discarded += 1;
  }

  return { jobs, discarded };
}

function sanitizeJob(raw: unknown): JobRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.id !== "string" || !r.id) return null;
  if (typeof r.status !== "string" || !STATUSES.includes(r.status)) return null;
  if (!isIsoDate(r.createdAt)) return null;
  if (!isCents(r.feeExVatCents)) return null;
  if (!isCents(r.jobCostsCents)) return null;
  if (!isCents(r.quotedTakeHomeCents)) return null;
  if (!isCents(r.quotedTaxCents)) return null;

  const statusChangedAt = isIsoDate(r.statusChangedAt) ? r.statusChangedAt : r.createdAt;
  const status = r.status as JobStatus;

  // A paid job without a payment link cannot contribute to totals honestly, so
  // it is walked back to invoiced rather than dropped: the job is real, only
  // the settlement is unreadable.
  const paymentId = typeof r.paymentId === "string" ? r.paymentId : undefined;
  const settled = status === "paid" && paymentId ? "paid" : status === "paid" ? "invoiced" : status;

  const history = Array.isArray(r.history)
    ? r.history
        .filter(
          (e): e is JobEvent =>
            !!e &&
            typeof e === "object" &&
            typeof (e as JobEvent).status === "string" &&
            STATUSES.includes((e as JobEvent).status) &&
            isIsoDate((e as JobEvent).at)
        )
        .map((e) => ({ status: e.status, at: e.at }))
    : [];

  return {
    id: r.id,
    client: typeof r.client === "string" ? r.client.slice(0, 80) : "",
    project: clampText(typeof r.project === "string" ? r.project : undefined),
    feeExVatCents: asCentsUnsafe(r.feeExVatCents),
    jobCostsCents: asCentsUnsafe(r.jobCostsCents),
    vatRate: typeof r.vatRate === "number" && Number.isFinite(r.vatRate) ? r.vatRate : 0,
    quotedTakeHomeCents: asCentsUnsafe(r.quotedTakeHomeCents),
    quotedTaxCents: asCentsUnsafe(r.quotedTaxCents),
    quotedConfigVersion:
      typeof r.quotedConfigVersion === "string" ? r.quotedConfigVersion : "unknown",
    createdAt: r.createdAt,
    dueDate: isIsoDate(r.dueDate) ? r.dueDate : undefined,
    status: settled,
    statusChangedAt,
    paidAt: settled === "paid" && isIsoDate(r.paidAt) ? r.paidAt : undefined,
    paidAmountExVatCents:
      settled === "paid" && isCents(r.paidAmountExVatCents)
        ? asCentsUnsafe(r.paidAmountExVatCents)
        : undefined,
    paymentId: settled === "paid" ? paymentId : undefined,
    taxYear:
      typeof r.taxYear === "number" && Number.isFinite(r.taxYear)
        ? r.taxYear
        : taxYearOfDate(r.createdAt),
    history: history.length > 0 ? history : [{ status: settled, at: statusChangedAt }],
  };
}
