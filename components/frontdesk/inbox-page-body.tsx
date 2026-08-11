"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGate, type FreelancerRow } from "@/components/frontdesk/auth-gate";

/**
 * /inbox is the magic-link landing spot. No freelancer row yet → onboarding.
 * The inbox itself lands in a later commit; the gate and redirect are the
 * contract other pieces already rely on.
 */
export function InboxPageBody() {
  return (
    <AuthGate>
      {(session, freelancer) => <InboxOrRedirect freelancer={freelancer} />}
    </AuthGate>
  );
}

function InboxOrRedirect({ freelancer }: { freelancer: FreelancerRow | null }) {
  const router = useRouter();
  useEffect(() => {
    if (!freelancer) router.replace("/setup");
  }, [freelancer, router]);

  if (!freelancer) return null;
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">Inbox</h1>
    </main>
  );
}
