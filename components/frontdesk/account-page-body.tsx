"use client";

import { AuthGate } from "@/components/frontdesk/auth-gate";
import { AppShell } from "@/components/frontdesk/app-shell";
import { SecurityCard } from "@/components/auth/security-card";
import { fdDict } from "@/lib/frontdesk/i18n";

/**
 * Account and sign-in. Its own route on purpose: the Control room is
 * exclusively about what the agent may do and remember, and where you are
 * signed in is not that. Keeping the two apart is what lets each page say
 * something true about its own scope.
 */
export function AccountPageBody() {
  return (
    <AuthGate>
      {(session, freelancer) => {
        const locale = freelancer?.locale ?? "en";
        const t = fdDict(locale).security;
        // session is unused here: the card reads the live client itself, which
        // is what the sign-out call has to act on.
        void session;
        return (
          <AppShell locale={locale}>
            <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
              <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">{t.heading}</h1>
              <SecurityCard locale={locale} />
            </main>
          </AppShell>
        );
      }}
    </AuthGate>
  );
}
