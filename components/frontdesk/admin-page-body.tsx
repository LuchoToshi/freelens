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
    outcomes: { sent_as_is: number; edited: number; skipped: number; regenerated: number };
    medianReplyMinutes: number | null;
  }[];
  monitoring: {
    draftsLast7d: number;
    failedLast7d: number;
    failureRate: number;
    queueDepth: number;
    revokedConnections: number;
  };
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

      <InviteIssuer session={session} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
          Monitoring
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: "Draft failure rate, 7d",
              value: `${data.monitoring.failureRate}% (${data.monitoring.failedLast7d}/${data.monitoring.draftsLast7d})`,
              // A tenth of drafts failing their own checks means the
              // generator or the guards drifted: look before users do.
              alert: data.monitoring.failureRate >= 10,
            },
            {
              label: "Queue depth (awaiting action)",
              value: String(data.monitoring.queueDepth),
              alert: data.monitoring.queueDepth >= 50,
            },
            {
              label: "Revoked Gmail connections",
              value: String(data.monitoring.revokedConnections),
              alert: data.monitoring.revokedConnections > 0,
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`flex min-w-44 flex-col gap-1 rounded-2xl border bg-white p-4 ${
                m.alert ? "border-[var(--fd-error-text)]" : "border-[var(--fd-line)]"
              }`}
            >
              <span className="text-xs uppercase tracking-wide text-[var(--fd-slate)]">
                {m.label}
              </span>
              <span
                className={`text-lg font-semibold ${
                  m.alert ? "text-[var(--fd-error-text)]" : "text-[var(--fd-ink)]"
                }`}
              >
                {m.value}
                {m.alert ? " (attention)" : ""}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">
          The daily cron logs failRate/queueDepth/revoked in the same shape; point a Vercel
          log alert at those tokens for paging.
        </p>
      </section>

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
                <th className="p-3">Regenerated</th>
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
                  <td className="p-3">{f.outcomes.regenerated}</td>
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

/** Founder-only invite issuance (English-only internal tool, like the rest). */
function InviteIssuer({ session }: { session: Session }) {
  const [email, setEmail] = useState("");
  const [isTestAccount, setIsTestAccount] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [issued, setIssued] = useState<{ code: string; email: string } | null>(null);

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    try {
      const res = await fetch("/api/frontdesk/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, isTestAccount }),
      });
      const payload = (await res.json()) as { ok: boolean; code?: string };
      if (payload.ok && payload.code) {
        setIssued({ code: payload.code, email });
        setState("idle");
        setEmail("");
        setIsTestAccount(false);
        return;
      }
      setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[var(--fd-line)] bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fd-slate)]">
        Issue an invite
      </h2>
      <form onSubmit={issue} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--fd-slate)]">
          Bind to email (required)
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-sm"
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-xs font-medium text-[var(--fd-slate)]">
          <input
            type="checkbox"
            checked={isTestAccount}
            onChange={(e) => setIsTestAccount(e.target.checked)}
            className="size-4 accent-[var(--fd-ink)]"
          />
          Ours, not a customer (excluded from every number here)
        </label>
        <button
          type="submit"
          disabled={state === "busy"}
          className="inline-flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] px-4 text-sm font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)] disabled:opacity-50"
        >
          {state === "busy" ? "Issuing" : "Issue invite"}
        </button>
      </form>
      {issued && (
        <p className="text-sm leading-relaxed text-[var(--fd-ink)]">
          Invite for {issued.email}:{" "}
          <code className="rounded bg-[var(--fd-paper)] px-2 py-1 font-mono">{issued.code}</code>
          <br />
          Send them{" "}
          <code className="font-mono">
            https://frlns.com/inbox?invite={issued.code}
          </code>
          . Expires in 30 days, works once, and only for that address. They will
          still need the six-digit code emailed to it to sign in.
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="text-sm font-medium text-[var(--fd-error-text)]">
          That did not work. Try again.
        </p>
      )}
    </section>
  );
}
