"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAppState } from "@/components/app/use-app-state";
import { NavTabs, type AppView } from "@/components/app/nav-tabs";
import { OverviewView } from "@/components/app/overview-view";
import { SetupFlow } from "@/components/app/setup-flow";
import { MoneyArrivedView } from "@/components/app/money-arrived-view";
import { WeeklyCheckinView } from "@/components/app/weekly-checkin-view";
import { DecisionView } from "@/components/app/decision-view";
import { hintClass, linkButtonClass } from "@/components/app/styles";

export function FreelensApp() {
  const app = useAppState();
  const [view, setView] = useState<AppView>("overview");
  const [confirmClear, setConfirmClear] = useState(false);

  // Render a stable neutral shell until hydration completes to avoid an
  // SSR/client mismatch on this statically-prerendered page.
  if (!app.hydrated) {
    return (
      <main className="min-h-screen bg-[var(--fl-canvas)]">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
          <p className={hintClass}>Loading your saved figures…</p>
        </div>
      </main>
    );
  }

  const notice = app.migrationNotice;

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-2xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-3xl">
            Freelens
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[var(--fl-slate)]">
            Decide what to do with money after it arrives.
          </p>
        </div>

        {notice?.show && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-4">
            <p className="text-sm text-[var(--fl-ink)]">
              We updated how Freelens describes reserves. Your saved
              {notice.legacyReservePercentage !== null
                ? ` ${notice.legacyReservePercentage}%`
                : ""}{" "}
              percentage is still available, but it is now correctly labelled as
              a planning rule rather than final tax.
            </p>
            <button
              type="button"
              onClick={app.dismissMigrationNotice}
              aria-label="Dismiss"
              className="shrink-0 text-[var(--fl-slate)] hover:text-[var(--fl-ink)]"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {!app.storageAvailable && (
          <p className="rounded-2xl border border-[var(--fl-line)] bg-white p-4 text-sm text-[var(--fl-slate)]">
            Storage is unavailable in this browser, so your figures won&apos;t be
            saved on this device between visits. Nothing is uploaded either way.
          </p>
        )}

        <NavTabs view={view === "setup" ? "overview" : view} onChange={setView} />

        <div id="app-panel" role="tabpanel">
          {view === "overview" && (
            <OverviewView state={app.state} onNavigate={setView} />
          )}
          {view === "setup" && (
            <SetupFlow
              initial={app.state.setup}
              onComplete={(setup) => {
                app.setSetup(setup);
                setView("overview");
              }}
              onCancel={() => setView("overview")}
            />
          )}
          {view === "money-arrived" && (
            <MoneyArrivedView
              setup={app.state.setup}
              onHandled={app.recordAllocation}
            />
          )}
          {view === "weekly-checkin" && (
            <WeeklyCheckinView
              setup={app.state.setup}
              saved={app.state.weeklyPosition}
              onSave={app.saveWeeklyPosition}
            />
          )}
          {view === "decision" && (
            <DecisionView
              saved={app.state.weeklyPosition}
              onGoToCheckin={() => setView("weekly-checkin")}
            />
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--fl-line)] pt-6">
          <p className={hintClass}>
            Saved only on this device. Nothing is uploaded to Freelens.
          </p>
          {confirmClear ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[var(--fl-ink)]">
                Clear all saved data on this device?
              </span>
              <button
                type="button"
                onClick={() => {
                  app.clearAll();
                  setConfirmClear(false);
                  setView("overview");
                }}
                className="text-sm font-medium text-[var(--fl-short-text)] underline"
              >
                Yes, clear it
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className={linkButtonClass}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className={`${linkButtonClass} w-fit`}
            >
              Clear saved data
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
