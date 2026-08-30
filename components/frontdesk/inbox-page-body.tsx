"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGate, type FreelancerRow } from "@/components/frontdesk/auth-gate";
import { AppShell } from "@/components/frontdesk/app-shell";
import { InboxApp } from "@/components/frontdesk/inbox-app";
import type { Session } from "@supabase/supabase-js";

/**
 * /inbox is the magic-link landing spot. No freelancer row, or setup
 * abandoned before the voice step, → back to onboarding. Without this, a
 * freelancer who closes the wizard after step 1 still has a live public
 * inquiry page but no voice profile, so every inquiry lands with a silently
 * undraftable "no_voice_profile" outcome and the inbox never explains why.
 */
export function InboxPageBody() {
  return (
    <AuthGate>
      {(session, freelancer) => <InboxOrRedirect session={session} freelancer={freelancer} />}
    </AuthGate>
  );
}

function InboxOrRedirect({
  session,
  freelancer,
}: {
  session: Session;
  freelancer: FreelancerRow | null;
}) {
  const router = useRouter();
  const setupIncomplete = !freelancer || !freelancer.voice_profile;
  useEffect(() => {
    if (setupIncomplete) router.replace("/setup");
  }, [setupIncomplete, router]);

  if (setupIncomplete) return null;
  return (
    <AppShell locale={freelancer.locale}>
      <InboxApp session={session} freelancer={freelancer} />
    </AppShell>
  );
}
