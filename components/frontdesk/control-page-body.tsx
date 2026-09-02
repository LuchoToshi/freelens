"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { AuthGate, type FreelancerRow } from "@/components/frontdesk/auth-gate";
import { AppShell } from "@/components/frontdesk/app-shell";
import { PermissionMatrixCard } from "@/components/frontdesk/agent-surfaces";
import { FollowupSettingsCard, MemoryListCard } from "@/components/frontdesk/memory-followups";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { fdDict } from "@/lib/frontdesk/i18n";
import { resolveQuietDays } from "@/lib/frontdesk/followups";

/**
 * The Control Room (handoff §10): what Freelens may do, and what it remembers.
 *
 * Everything here is a switch that already exists and already works. There is
 * no autonomy level picker, no session or device management, and no single
 * "pause everything" control: no such switch exists underneath, and a button
 * that claims to stop all work while leaving half of it running would be the
 * worst kind of lie for a product whose whole promise is that it never acts
 * behind your back. Stopping a specific piece of work stays where that work
 * is, on its own card.
 */
export function ControlPageBody() {
  return (
    <AuthGate>
      {(session, freelancer) => <ControlOrRedirect session={session} freelancer={freelancer} />}
    </AuthGate>
  );
}

function ControlOrRedirect({
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
      <ControlRoom session={session} freelancer={freelancer} />
    </AppShell>
  );
}

function ControlRoom({ session, freelancer }: { session: Session; freelancer: FreelancerRow }) {
  const sb = supabaseBrowser();
  const [state, setState] = useState(freelancer);
  const [saveError, setSaveError] = useState(false);
  const dict = fdDict(state.locale);
  const c = dict.control;
  const dsk = dict.desk;
  const quietDays = resolveQuietDays(state.followup_quiet_days);

  // Returns whether the write succeeded, so callers can roll back the
  // optimistic state they already applied instead of showing "saved" for a
  // permission change that never reached the database.
  const save = useCallback(
    async (update: Record<string, unknown>) => {
      const { error } = await sb
        .from("freelancers")
        .update(update)
        .eq("auth_user_id", session.user.id);
      setSaveError(error !== null);
      return error === null;
    },
    [sb, session.user.id],
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">{c.heading}</h1>
        <p className="text-base leading-relaxed text-[var(--fd-slate)]">{c.lead}</p>
      </header>

      {saveError && (
        <p role="alert" className="text-sm font-medium text-[var(--fd-error-text)]">
          {c.saveError}
        </p>
      )}

      <PermissionMatrixCard
        locale={state.locale}
        stored={state.permission_levels}
        onChange={async (levels) => {
          const previous = state.permission_levels;
          setState((f) => ({ ...f, permission_levels: levels }));
          const ok = await save({ permission_levels: levels });
          if (!ok) setState((f) => ({ ...f, permission_levels: previous }));
        }}
      />

      <FollowupSettingsCard
        freelancer={state}
        quietDays={quietDays}
        onChange={async (change) => {
          const update: Record<string, unknown> = {};
          if (change.quietDays !== undefined) update.followup_quiet_days = change.quietDays;
          if (change.paused !== undefined) update.followups_paused = change.paused;
          const previous = {
            followup_quiet_days: state.followup_quiet_days,
            followups_paused: state.followups_paused,
          };
          setState((f) => ({
            ...f,
            followup_quiet_days: change.quietDays ?? f.followup_quiet_days,
            followups_paused: change.paused ?? f.followups_paused,
          }));
          const ok = await save(update);
          if (!ok) setState((f) => ({ ...f, ...previous }));
        }}
      />

      <section className="flex flex-col gap-1 rounded-2xl bg-[var(--fd-paper-dim)] px-4 py-3 text-xs leading-relaxed text-[var(--fd-slate)]">
        <p>{dsk.capabilityReads}</p>
        <p>{dsk.capabilityMay}</p>
        <p>{dsk.capabilityNever}</p>
      </section>

      <MemoryListCard
        freelancer={state}
        onApply={async (change) => {
          const update: Record<string, unknown> = {};
          if (change.profile) update.voice_profile = change.profile;
          if (change.decisions) update.voice_proposal_decisions = change.decisions;
          if (change.paused !== undefined) update.voice_learning_paused = change.paused;
          const previous = {
            voice_profile: state.voice_profile,
            voice_proposal_decisions: state.voice_proposal_decisions,
            voice_learning_paused: state.voice_learning_paused,
          };
          setState((f) => ({
            ...f,
            voice_profile: (change.profile ?? f.voice_profile) as Record<string, unknown> | null,
            voice_proposal_decisions: change.decisions ?? f.voice_proposal_decisions,
            voice_learning_paused: change.paused ?? f.voice_learning_paused,
          }));
          const ok = await save(update);
          if (!ok) setState((f) => ({ ...f, ...previous }));
        }}
      />

      <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{c.footer}</p>
      <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{c.stopNote}</p>

      <Link
        href="/account"
        className="w-fit text-sm font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-line)] underline-offset-4"
      >
        {dict.security.link}
      </Link>
    </main>
  );
}
