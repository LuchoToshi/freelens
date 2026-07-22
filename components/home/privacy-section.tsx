import { Monitor, RotateCcw } from "lucide-react";

const PRIVACY_POINTS = ["No accounts.", "No tracking.", "No surprises."];

export function PrivacySection() {
  return (
    <section
      aria-label="Privacy"
      className="border-t border-[var(--fl-line)] bg-[var(--fl-ink)] text-white"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9db4d1]">
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

        {/* Local-device concept: the numbers live inside the browser frame,
            in a closed loop that never leaves the device. */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-white/25" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-white/25" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-white/25" aria-hidden="true" />
              <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-[#9db4d1]">
                <Monitor className="size-3.5" aria-hidden="true" />
                this device
              </span>
            </div>
            <dl className="flex flex-col gap-3 p-6">
              {[
                ["VAT reserved", "€ 434"],
                ["Tax reserve", "€ 620"],
                ["Available to you", "€ 1.446"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="text-sm text-[#9db4d1]">{k}</dt>
                  <dd className="fl-tnum text-sm font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Stays here. Never uploaded.
          </span>
        </div>
      </div>
    </section>
  );
}
