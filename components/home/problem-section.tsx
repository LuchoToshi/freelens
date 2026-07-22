import { AllocationBar } from "@/components/app/allocation-bar";
import { toCents } from "@/lib/domain/money";

const CLAIMS = [
  { label: "What may be needed for VAT", color: "var(--fl-vat-fill)" },
  { label: "What belongs to the tax authority", color: "var(--fl-reserve-fill)" },
  { label: "What it costs to run the business", color: "var(--fl-costs-fill)" },
  { label: "What should stay as a buffer", color: "var(--fl-ink)" },
];

const DEMO_SEGMENTS = [
  { label: "VAT", cents: toCents(434), color: "var(--fl-vat-fill)" },
  { label: "Reserve", cents: toCents(620), color: "var(--fl-reserve-fill)" },
  { label: "Business", cents: toCents(200), color: "var(--fl-costs-fill)" },
  { label: "Yours", cents: toCents(1246), color: "var(--fl-payout-fill)" },
];

export function ProblemSection() {
  return (
    <section className="border-t border-[var(--fl-line)] bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            The real problem
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            Your bank balance is not your salary.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--fl-slate)]">
            A balance tells you how much money exists. It doesn&apos;t tell you
            what&apos;s actually available to pay yourself.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {CLAIMS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 border-b border-[var(--fl-line)] pb-3 text-base text-[var(--fl-ink)]"
              >
                <span
                  className="size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                {item.label}
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--fl-ink)]">
            Freelens turns an irregular payment into a clear allocation plan, so
            you know what to do with money the moment it lands.
          </p>
        </div>

        {/* Visual demonstration: one €2.500 payment, given jobs. */}
        <div className="rounded-3xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[var(--fl-slate)]">
              A €2.500 payment
            </span>
            <span className="fl-tnum font-serif text-2xl font-medium text-[var(--fl-payout-text)]">
              €1.246 yours
            </span>
          </div>
          <div className="mt-5">
            <AllocationBar segments={DEMO_SEGMENTS} interactive={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
