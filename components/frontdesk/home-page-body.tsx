"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGate, type FreelancerRow } from "@/components/frontdesk/auth-gate";
import { AppShell } from "@/components/frontdesk/app-shell";
import { AgentHome } from "@/components/frontdesk/agent-home";
import type { Session } from "@supabase/supabase-js";

/**
 * The agent-led first screen (addendum §2). Same onboarding gate as the
 * inbox: no confirmed voice profile means setup, not an empty workspace.
 */
export function HomePageBody() {
  return (
    <AuthGate>
      {(session, freelancer) => <HomeOrRedirect session={session} freelancer={freelancer} />}
    </AuthGate>
  );
}

function HomeOrRedirect({
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
      <AgentHome session={session} freelancer={freelancer} />
    </AppShell>
  );
}
