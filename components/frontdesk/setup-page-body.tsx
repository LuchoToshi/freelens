"use client";

import { AuthGate } from "@/components/frontdesk/auth-gate";
import { SetupWizard } from "@/components/frontdesk/setup-wizard";

export function SetupPageBody() {
  return (
    <AuthGate>
      {(session, freelancer, reload) => (
        <SetupWizard session={session} freelancer={freelancer} onFreelancerChanged={reload} />
      )}
    </AuthGate>
  );
}
