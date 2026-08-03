"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAppState } from "@/components/app/use-app-state";
import { NavTabs, type AppView } from "@/components/app/nav-tabs";
import { OverviewView } from "@/components/app/overview-view";
import { SettingsView } from "@/components/app/settings-view";
import { MoneyArrivedView } from "@/components/app/money-arrived-view";
import { WeeklyCheckinView } from "@/components/app/weekly-checkin-view";
import { DecisionView } from "@/components/app/decision-view";
import { ConfidenceBlock } from "@/components/design/confidence-block";
import { hintClass, linkButtonClass } from "@/components/app/styles";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

/** Maps a view onto its dictionary key, so headers translate with everything else. */
const VIEW_KEY: Record<AppView, "overview" | "setup" | "moneyArrived" | "weeklyCheckin" | "decision"> = {
  overview: "overview",
  setup: "setup",
  "money-arrived": "moneyArrived",
  "weekly-checkin": "weeklyCheckin",
  decision: "decision",
};

export function FreelensApp() {
  const t = useT();
  useDocumentTitle(t.meta.tool.title, t.meta.tool.description);
  const app = useAppState();
  const [view, setView] = useState<AppView>("overview");
  const [confirmClear, setConfirmClear] = useState(false);
  // Read once per mount and passed down, so no child component reaches for the
  // clock and the whole tree stays deterministic under test.
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const currentTaxYear = Number(today.slice(0, 4));

  // Render a stable neutral shell until hydration completes to avoid an
  // SSR/client mismatch on this statically-prerendered page.
  if (!app.hydrated) {
    return (
      <main className="min-h-screen bg-[var(--fl-canvas)]">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
          <p className={hintClass}>{t.app.shell.loading}</p>
        </div>
      </main>
    );
  }

  const notice = app.migrationNotice;

  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
            {t.app.shell.eyebrow}
          </span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-4xl">
            {t.app.shell.views[VIEW_KEY[view]].title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[var(--fl-slate)]">
            {t.app.shell.views[VIEW_KEY[view]].subtitle}
          </p>
        </div>

        {notice?.show && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--fl-line)] bg-white p-4">
            <p className="text-sm text-[var(--fl-ink)]">
              {fill(t.app.shell.migrationNotice, {
                pct:
                  notice.legacyReservePercentage !== null
                    ? ` ${notice.legacyReservePercentage}%`
                    : "",
              })}
            </p>
            <button
              type="button"
              onClick={app.dismissMigrationNotice}
              aria-label={t.app.shell.dismiss}
              className="shrink-0 text-[var(--fl-slate)] hover:text-[var(--fl-ink)]"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {app.discardedPaymentRecords > 0 && (
          <p className="rounded-2xl border border-[var(--fl-line)] bg-white p-4 text-sm text-[var(--fl-slate)]">
            {app.discardedPaymentRecords === 1
              ? t.app.shell.discardedOne
              : fill(t.app.shell.discardedMany, {
                  count: app.discardedPaymentRecords,
                })}{" "}
            {fill(t.app.shell.discardedTail, { year: currentTaxYear })}
          </p>
        )}

        {app.discardedWeeklyPosition && (
          <p className="rounded-2xl border border-[var(--fl-line)] bg-white p-4 text-sm text-[var(--fl-slate)]">
            {t.app.shell.discardedCheckin}
          </p>
        )}

        {!app.storageAvailable && (
          <p className="rounded-2xl border border-[var(--fl-line)] bg-white p-4 text-sm text-[var(--fl-slate)]">
            {t.app.shell.storageUnavailable}
          </p>
        )}

        <NavTabs view={view === "setup" ? "overview" : view} onChange={setView} />

        <div id="app-panel" role="tabpanel">
          {view === "overview" && (
            <OverviewView state={app.state} onNavigate={setView} />
          )}
          {view === "setup" && (
            <SettingsView
              initial={app.state.setup}
              onSave={(setup) => {
                app.setSetup(setup);
                setView("money-arrived");
              }}
              onCancel={() => setView("overview")}
            />
          )}
          {view === "money-arrived" && (
            <MoneyArrivedView
              setup={app.state.setup}
              onHandled={app.recordAllocation}
              onPersonalize={() => setView("setup")}
              paymentHistory={app.state.paymentHistory}
              taxYear={currentTaxYear}
              today={today}
              onSavePayment={app.savePayment}
              onEditPayment={app.editPayment}
              onDeletePayment={app.deletePayment}
              onUpdateProfile={app.updateProfileFlags}
              onOpenSettings={() => setView("setup")}
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

        <details className="border-t border-[var(--fl-line)] pt-6">
          <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-medium text-[var(--fl-slate)] hover:text-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
            {t.app.shell.privacyToggle}
          </summary>
          <div className="mt-4 flex flex-col gap-4">
            <ConfidenceBlock
              sentence={t.app.shell.privacySentence}
              detail={t.app.shell.privacyDetail}
            />
            {confirmClear ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-[var(--fl-ink)]">
                  {t.app.shell.clearConfirm}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    app.clearAll();
                    setConfirmClear(false);
                    setView("overview");
                  }}
                  className="min-h-11 text-sm font-medium text-[var(--fl-short-text)] underline"
                >
                  {t.app.shell.clearYes}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className={linkButtonClass}
                >
                  {t.common.actions.cancel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className={`${linkButtonClass} w-fit`}
              >
                {t.app.shell.clearData}
              </button>
            )}
          </div>
        </details>
      </div>
    </main>
  );
}
