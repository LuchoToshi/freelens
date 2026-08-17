"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { hintClass, inputClass, linkButtonClass, secondaryButtonClass } from "@/components/app/styles";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { useRateProfile } from "@/components/rate/use-rate-profile";
import { outcomeForJobFee } from "@/lib/tax/jobOutcome";
import { DEFAULT_COUNTRY, latestProfileYear } from "@/lib/tax/loadProfile";
import { formatEuro, parseAmountInput } from "@/lib/domain/money";
import type { OutcomeResult } from "@/lib/rebooking/types";
import { useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

const RESULTS: OutcomeResult[] = [
  "reply_positive",
  "reply_neutral",
  "reply_negative",
  "booked",
  "no_reply",
];

/** Days a sent touch waits before the outcome prompt appears. Spec: 7. */
const PROMPT_AFTER_DAYS = 7;

interface SentTouch {
  id: string;
  clientName: string;
  statusAt: string;
}

/**
 * Outcome capture and the numbers screen, one section each.
 *
 * All arithmetic deterministic and client-side under RLS. The single tax
 * figure comes from the existing engine using the profile saved by the
 * calculators — the one place the engine appears in the app, per the spec.
 */
export function OutcomesAndNumbers({ refreshKey }: { refreshKey: number }) {
  const t = useT();
  const sb = useMemo(() => supabaseBrowser(), []);
  const [pending, setPending] = useState<SentTouch[]>([]);
  const [stats, setStats] = useState<{
    relationships: number;
    sent: number;
    outcomes: number;
    replies: number;
    bookedCents: number;
  } | null>(null);

  const load = useCallback(async () => {
    const quarterStart = startOfQuarter(new Date());
    const [rel, touches, outcomes] = await Promise.all([
      sb.from("relationships").select("id", { count: "exact", head: true }),
      sb.from("touches").select("id,status,status_at,relationship_id").eq("status", "sent_by_user"),
      sb.from("outcomes").select("touch_id,result,booked_value_cents,recorded_at"),
    ]);
    const done = new Set((outcomes.data ?? []).map((o) => o.touch_id));
    const cutoff = new Date(Date.now() - PROMPT_AFTER_DAYS * 86_400_000).toISOString();

    const sent = touches.data ?? [];
    const needOutcome = sent.filter((x) => !done.has(x.id) && x.status_at <= cutoff);

    // Names for the prompt list, one query, no joins needed at this size.
    const { data: rels } = await sb.from("relationships").select("id,client_name");
    const nameById = new Map((rels ?? []).map((r) => [r.id, r.client_name]));

    setPending(
      needOutcome.map((x) => ({
        id: x.id,
        clientName: nameById.get(x.relationship_id) ?? "-",
        statusAt: x.status_at,
      }))
    );
    const all = outcomes.data ?? [];
    setStats({
      relationships: rel.count ?? 0,
      sent: sent.length,
      outcomes: all.length,
      replies: all.filter((o) => o.result.startsWith("reply_")).length,
      bookedCents: all
        .filter((o) => o.result === "booked" && o.recorded_at >= quarterStart)
        .reduce((sum, o) => sum + (o.booked_value_cents ?? 0), 0),
    });
  }, [sb]);

  useEffect(() => {
    // Async only; state changes land after awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load, refreshKey]);

  return (
    <>
      {pending.length > 0 && (
        <section className="flex flex-col gap-4 border-t border-[var(--fl-line)] pt-6">
          <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">
            {t.agent.outcomes.heading}
          </h2>
          <p className={hintClass}>{t.agent.outcomes.intro}</p>
          <ul className="flex flex-col gap-3">
            {pending.map((touch) => (
              <OutcomeRow key={touch.id} touch={touch} onSaved={() => void load()} />
            ))}
          </ul>
        </section>
      )}
      {stats && <Numbers stats={stats} />}
    </>
  );
}

function OutcomeRow({ touch, onSaved }: { touch: SentTouch; onSaved: () => void }) {
  const t = useT();
  const a = t.agent.outcomes;
  const sb = supabaseBrowser();
  const [picked, setPicked] = useState<OutcomeResult | null>(null);
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async (result: OutcomeResult) => {
    const { data: userData } = await sb.auth.getUser();
    if (!userData?.user) return;
    const bookedCents =
      result === "booked" ? (parseAmountInput(value).cents ?? null) : null;
    await sb.from("outcomes").insert({
      user_id: userData.user.id,
      touch_id: touch.id,
      result,
      booked_value_cents: bookedCents,
    });
    setSaved(true);
    onSaved();
  };

  if (saved) {
    return (
      <li className="flex items-center gap-2 rounded-xl border border-[var(--fl-line)] bg-white p-4 text-sm font-medium text-[var(--fl-payout-text)]">
        <Check className="size-4" aria-hidden="true" />
        {a.saved}
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-[var(--fl-line)] bg-white p-4">
      <span className="text-sm font-medium text-[var(--fl-ink)]">{touch.clientName}</span>
      <div className="flex flex-wrap gap-2">
        {RESULTS.map((result) => (
          <button
            key={result}
            type="button"
            aria-pressed={picked === result}
            onClick={() => {
              if (result === "booked") setPicked(result);
              else void save(result);
            }}
            className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${
              picked === result
                ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                : "border-[var(--fl-line-control)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
            }`}
          >
            {a.results[result]}
          </button>
        ))}
      </div>
      {picked === "booked" && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col gap-1 text-xs text-[var(--fl-slate)]">
            {a.valueLabel}
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`${inputClass} rounded-lg border px-2 py-1.5 text-sm`}
            />
          </label>
          <button type="button" onClick={() => void save("booked")} className={secondaryButtonClass}>
            {a.save}
          </button>
          <button type="button" onClick={() => setPicked(null)} className={linkButtonClass}>
            {t.common.actions.cancel}
          </button>
        </div>
      )}
    </li>
  );
}

function Numbers({
  stats,
}: {
  stats: { relationships: number; sent: number; outcomes: number; replies: number; bookedCents: number };
}) {
  const t = useT();
  const n = t.agent.numbers;
  const { profile, projectedProfit, hydrated } = useRateProfile();

  const replyRate =
    stats.outcomes > 0 ? Math.round((stats.replies / stats.outcomes) * 100) : null;

  // The one place the tax engine appears in the app: what the quarter's booked
  // value is worth after btw and reserve, on the profile the calculators saved.
  const taxYear = latestProfileYear(DEFAULT_COUNTRY);
  const net =
    hydrated && taxYear !== null && stats.bookedCents > 0
      ? outcomeForJobFee({
          taxYear,
          country: DEFAULT_COUNTRY,
          feeExVat: stats.bookedCents / 100,
          currentProjectedProfit: projectedProfit,
          vatRate: 21,
          meetsHoursCriterion: profile.meetsHoursCriterion,
          isStarter: profile.isStarter,
          otherIncome: profile.otherIncome,
          otherIncomeTaxWithheld: profile.otherIncomeTaxWithheld,
        }).takeHome
      : null;

  const cells: [string, string][] = [
    [n.relationships, String(stats.relationships)],
    [n.sent, String(stats.sent)],
    [n.replyRate, replyRate === null ? n.noData : `${replyRate}%`],
    [n.booked, stats.bookedCents > 0 ? formatEuro(stats.bookedCents as never) : n.noData],
  ];

  return (
    <section className="flex flex-col gap-4 border-t border-[var(--fl-line)] pt-6">
      <h2 className="font-serif text-xl font-medium text-[var(--fl-ink)]">{n.heading}</h2>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cells.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 rounded-xl border border-[var(--fl-line)] bg-white p-4">
            <dt className="text-xs text-[var(--fl-slate)]">{label}</dt>
            <dd className="fl-tnum font-serif text-2xl font-medium text-[var(--fl-ink)]">{value}</dd>
          </div>
        ))}
      </dl>
      {net !== null && (
        <p className={hintClass}>{fill(n.taxNote, { net: formatEuro(net) })}</p>
      )}
    </section>
  );
}

function startOfQuarter(d: Date): string {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(Date.UTC(d.getFullYear(), q, 1)).toISOString();
}
