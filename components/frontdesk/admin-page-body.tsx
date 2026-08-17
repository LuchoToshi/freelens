"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthGate } from "@/components/frontdesk/auth-gate";

/**
 * Founder-only, read-only, English-only: this is an internal learning
 * instrument, not a product surface. The page always renders its shell; the
 * API is the gate and answers 404 to anyone not on the allowlist, so the
 * page shows those visitors exactly what a nonexistent route would.
 */
interface AdminData {
  rows: {
    handle: string;
    srcChannel: string | null;
    status: string;
    draftOutcome: string;
    nudges: number;
    createdAt: string;
    repliedAt: string | null;
  }[];
  funnels: {
    handle: string;
    inquiries: number;
    replied: number;
    booked: number;
    outcomes: { sent_as_is: number; edited: number; skipped: number };
    medianReplyMinutes: number | null;
  }[];
}

export function AdminPageBody() {
  return <AuthGate>{(session) => <AdminView session={session} />}</AuthGate>;
}

function AdminView({ session }: { session: Session }) {
  const [data, setData] = useState<AdminData | null | "denied">(null);

  useEffect(() => {
    fetch("/api/frontdesk/admin", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (r) => (r.ok ? ((await r.json()) as { ok: boolean } & AdminData) : null))
      .then((payload) => setData(payload?.ok ? payload : "denied"))
      .catch(() => setData("denied"));
  }, [session.access_token]);

  if (data === null) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-sm text-[var(--fd-slate)]">One moment.</p>
      </main>
    );
  }
  if (data === "denied") {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-sm text-[var(--fd-slate)]">Not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">FrontDesk admin</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
          Funnel per freelancer
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--fd-line)] bg-white">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--fd-line)] text-left text-xs uppercase tracking-wide text-[var(--fd-slate)]">
                <th className="p-3">Freelancer</th>
                <th className="p-3">Inquiries</th>
                <th className="p-3">Replied</th>
                <th className="p-3">Booked</th>
                <th className="p-3">Sent as-is</th>
                <th className="p-3">Edited</th>
                <th className="p-3">Skipped</th>
                <th className="p-3">Median reply</th>
              </tr>
            </thead>
            <tbody>
              {data.funnels.map((f) => (
                <tr key={f.handle} className="border-b border-[var(--fd-line)] last:border-0">
                  <td className="p-3 font-medium text-[var(--fd-ink)]">{f.handle}</td>
                  <td className="p-3">{f.inquiries}</td>
                  <td className="p-3">{f.replied}</td>
                  <td className="p-3">{f.booked}</td>
                  <td className="p-3">{f.outcomes.sent_as_is}</td>
                  <td className="p-3">{f.outcomes.edited}</td>
                  <td className="p-3">{f.outcomes.skipped}</td>
                  <td className="p-3">
                    {f.medianReplyMinutes === null ? "-" : `${f.medianReplyMinutes} min`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
          Inquiries (no client data, by design)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--fd-line)] bg-white">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--fd-line)] text-left text-xs uppercase tracking-wide text-[var(--fd-slate)]">
                <th className="p-3">Freelancer</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Status</th>
                <th className="p-3">Draft outcome</th>
                <th className="p-3">Nudges</th>
                <th className="p-3">Created</th>
                <th className="p-3">Replied</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i} className="border-b border-[var(--fd-line)] last:border-0">
                  <td className="p-3 font-medium text-[var(--fd-ink)]">{r.handle}</td>
                  <td className="p-3">{r.srcChannel ?? "-"}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{r.draftOutcome}</td>
                  <td className="p-3">{r.nudges}</td>
                  <td className="p-3">{r.createdAt.slice(0, 16).replace("T", " ")}</td>
                  <td className="p-3">{r.repliedAt ? r.repliedAt.slice(0, 16).replace("T", " ") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
