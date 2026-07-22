const PRIVACY_POINTS = [
  "No accounts.",
  "No tracking.",
  "No surprises.",
];

export function PrivacySection() {
  return (
    <section
      aria-label="Privacy"
      className="border-t border-[var(--fl-line)] bg-[var(--fl-ink)] text-white"
    >
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-sm font-medium text-[#9db4d1]">
          Are my numbers safe?
        </p>
        <h2 className="mt-3 max-w-lg font-serif text-3xl font-medium leading-tight sm:text-4xl">
          Your financial data never leaves your browser.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-[#9db4d1]">
          Nothing is uploaded to Freelens. Your saved values remain on this
          device, and you can clear them at any time.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          {PRIVACY_POINTS.map((point) => (
            <span key={point} className="text-base font-medium text-[#9db4d1]">
              {point}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
