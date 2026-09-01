"use client";

import { AuthGate } from "@/components/frontdesk/auth-gate";
import { SetupWizard } from "@/components/frontdesk/setup-wizard";
import { SecurityCard } from "@/components/auth/security-card";

export function SetupPageBody() {
  return (
    <AuthGate>
      {(session, freelancer, reload) => (
        <>
          <SetupWizard session={session} freelancer={freelancer} onFreelancerChanged={reload} />
          {freelancer && (
            <div className="mx-auto w-full max-w-xl px-4 pb-10">
              <SecurityCard locale={freelancer.locale} />
            </div>
          )}
        </>
      )}
    </AuthGate>
  );
}
