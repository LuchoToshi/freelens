const TRUST_ITEMS = [
  "Your numbers never leave your browser.",
  "Built for Dutch freelancers and ZZP'ers.",
  "Plain-language output you can double-check.",
  "The same math, every time. Nothing hidden.",
];

export function TrustSection() {
  return (
    <section
      aria-label="Why people trust Freelens"
      className="border-t border-[var(--fl-line)] bg-white"
    >
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUST_ITEMS.map((item) => (
            <p
              key={item}
              className="text-sm font-medium text-[var(--fl-slate)]"
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
