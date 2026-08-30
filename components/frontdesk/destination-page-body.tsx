"use client";

import { AuthGate } from "@/components/frontdesk/auth-gate";
import { AppShell } from "@/components/frontdesk/app-shell";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * Clients and Follow-ups are shell destinations with written scope but no
 * detailed design yet (spec §26.7 — each blocked on an open decision). This
 * renders that honestly: what will live here, why it is not built, and a
 * real next action. A destination that exists and says so beats a dead
 * link or an invented feature.
 */
export function DestinationPageBody({ destination }: { destination: "clients" | "followups" }) {
  return (
    <AuthGate>
      {(_session, freelancer) => {
        const locale: FrontdeskLocale = freelancer?.locale === "nl" ? "nl" : "en";
        const t = fdDict(locale).inbox;
        const clients = destination === "clients";
        const copy = clients ? t.clientsPage : t.followupsPage;
        const ctaHref = clients ? "/inbox" : "/inbox?queue=followup";
        return (
          <AppShell locale={locale}>
            <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-10">
              <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">
                {copy.heading}
              </h1>
              <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{copy.body}</p>
              {clients && (
                <p className="rounded-2xl border border-dashed border-[var(--fd-line)] p-4 text-sm leading-relaxed text-[var(--fd-slate)]">
                  {t.clientsPage.blocked}
                </p>
              )}
              <a
                href={ctaHref}
                className="w-fit rounded-full bg-[var(--fd-ink)] px-5 py-3 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)] focus-visible:outline-none"
              >
                {copy.cta}
              </a>
            </main>
          </AppShell>
        );
      }}
    </AuthGate>
  );
}
