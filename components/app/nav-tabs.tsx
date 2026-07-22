"use client";

export type AppView =
  | "overview"
  | "setup"
  | "money-arrived"
  | "weekly-checkin"
  | "decision";

const TABS: { id: AppView; label: string; description: string }[] = [
  { id: "overview", label: "Overview", description: "Where you stand and what to do next." },
  { id: "money-arrived", label: "Money arrived", description: "Give a payment a job, after VAT." },
  { id: "weekly-checkin", label: "Weekly check-in", description: "A calm read on your position." },
  { id: "decision", label: "Check a decision", description: "See if a purchase fits." },
];

export function NavTabs({
  view,
  onChange,
}: {
  view: AppView;
  onChange: (next: AppView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Freelens"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {TABS.map((tab) => {
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls="app-panel"
            onClick={() => onChange(tab.id)}
            className={`flex min-h-12 flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)] ${
              active
                ? "border-[var(--fl-ink)] bg-white shadow-sm"
                : "border-[var(--fl-line)] bg-transparent hover:border-[color-mix(in_oklab,var(--fl-ink)_40%,transparent)]"
            }`}
          >
            <span
              className={`text-sm font-semibold ${
                active ? "text-[var(--fl-ink)]" : "text-[var(--fl-slate)]"
              }`}
            >
              {tab.label}
            </span>
            <span className="text-xs text-[var(--fl-slate)]">
              {tab.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
