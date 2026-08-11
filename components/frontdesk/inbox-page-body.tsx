"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGate, type FreelancerRow } from "@/components/frontdesk/auth-gate";
import { InboxApp } from "@/components/frontdesk/inbox-app";
import type { Session } from "@supabase/supabase-js";

/**
 * /inbox is the magic-link landing spot. No freelancer row yet → onboarding.
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
  useEffect(() => {
    if (!freelancer) router.replace("/setup");
  }, [freelancer, router]);

  if (!freelancer) return null;
  return <InboxApp session={session} freelancer={freelancer} />;
}
