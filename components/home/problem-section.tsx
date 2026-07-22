const NOT = [
  "What belongs to the tax authority",
  "What may be needed for VAT",
  "What it costs to run the business",
  "What should stay as a buffer",
];

export function ProblemSection() {
  return (
    <section className="border-t border-[var(--fl-line)] bg-white">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          Your bank balance is not your salary.
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--fl-slate)]">
          A balance tells you how much money exists. It doesn&apos;t tell you
          what&apos;s actually available to pay yourself.
        </p>
        <ul className="mt-8 flex flex-col gap-3">
          {NOT.map((item) => (
            <li
              key={item}
              className="flex items-baseline gap-3 border-b border-[var(--fl-line)] pb-3 text-base text-[var(--fl-ink)]"
            >
              <span className="font-mono text-xs text-[var(--fl-slate)]">—</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--fl-ink)]">
          Freelens turns an irregular payment into a clear allocation plan, so
          you know what to do with money the moment it lands.
        </p>
      </div>
    </section>
  );
}
