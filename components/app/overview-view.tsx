"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBanner } from "@/components/app/status-banner";
import { DisclaimerNote } from "@/components/disclaimer-note";
import {
  cardClass,
  hintClass,
  linkButtonClass,
  primaryButtonClass,
} from "@/components/app/styles";
import { formatEuro } from "@/lib/domain/money";
import { evaluateWeeklyPosition } from "@/lib/domain/allocation";
import { isStale, type AppState } from "@/lib/domain/persistence";
import { formatCheckInDate } from "@/lib/format-date";
import type { AppView } from "@/components/app/nav-tabs";

export function OverviewView({
  state,
  onNavigate,
}: {
  state: AppState;
  onNavigate: (view: AppView) => void;
}) {
  const weekly = state.weeklyPosition
    ? {
        result: evaluateWeeklyPosition(state.weeklyPosition.input),
        timestampIso: state.weeklyPosition.timestampIso,
      }
    : null;
  const stale = weekly ? isStale(weekly.timestampIso) : false;

  const nextAction = pickNextAction(state, weekly?.result.status, stale);

  if (!state.setup && !weekly && !state.lastAllocation) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)] sm:text-3xl">
            Welcome to Freelens
          </h2>
          <p className="text-base leading-relaxed text-[var(--fl-slate)]">
            Freelens helps you separate VAT, protect a tax reserve, cover
            business costs, and see what may be available to pay yourself.
          </p>
        </div>
        <Card className={cardClass}>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-base text-[var(--fl-ink)]">
              Start with a quick setup, or process a payment right away.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => onNavigate("setup")} className={primaryButtonClass}>
                Set up Freelens
              </button>
              <button type="button" onClick={() => onNavigate("money-arrived")} className={linkButtonClass}>
                Process a payment
              </button>
            </div>
          </CardContent>
        </Card>
        <DisclaimerNote />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)] sm:text-3xl">
          Overview
        </h2>
      </div>

      {weekly && <StatusBanner status={weekly.result.status} />}

      <Card className={cardClass}>
        <CardContent className="flex flex-col gap-3 p-6">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            Suggested next step
          </span>
          <p className="font-serif text-lg font-medium text-[var(--fl-ink)]">
            {nextAction.title}
          </p>
          <button
            type="button"
            onClick={() => onNavigate(nextAction.view)}
            className={`${primaryButtonClass} w-fit`}
          >
            {nextAction.cta}
          </button>
        </CardContent>
      </Card>

      {weekly && (
        <Card className={cardClass}>
          <CardContent className="flex flex-col gap-2 p-6">
            <Figure
              label="May be available for personal payout"
              value={formatEuro(weekly.result.availableForPersonalPayoutCents)}
              emphasis
            />
            <Figure label="Protected VAT" value={formatEuro(weekly.result.vatProtectedCents)} />
            <Figure
              label="Protected income tax and Zvw reserve"
              value={formatEuro(weekly.result.reserveProtectedCents)}
            />
            <Figure
              label="Business runway"
              value={
                weekly.result.runwayMonths === null
                  ? "Add monthly costs to estimate"
                  : `${weekly.result.runwayMonths.toFixed(1)} months`
              }
            />
            <p className={`${hintClass} pt-1`}>
              Last updated {formatCheckInDate(weekly.timestampIso)}
              {stale ? " — worth refreshing." : "."}
            </p>
          </CardContent>
        </Card>
      )}

      {state.lastAllocation && (
        <Card className={cardClass}>
          <CardContent className="flex flex-col gap-2 p-6">
            <span className="text-sm font-medium text-[var(--fl-slate)]">
              Latest allocation
              {state.lastAllocation.label ? ` — ${state.lastAllocation.label}` : ""}
            </span>
            <Figure
              label="Payment"
              value={formatEuro(state.lastAllocation.grossPaymentCents)}
            />
            <Figure
              label="Available for personal payout"
              value={formatEuro(state.lastAllocation.availableForPersonalPayoutCents)}
            />
            <p className={`${hintClass} pt-1`}>
              {formatCheckInDate(state.lastAllocation.timestampIso)} · recorded on
              this device.
            </p>
          </CardContent>
        </Card>
      )}

      <DisclaimerNote />
    </div>
  );
}

function pickNextAction(
  state: AppState,
  status: string | undefined,
  stale: boolean
): { title: string; cta: string; view: AppView } {
  if (!state.setup) {
    return {
      title: "Finish setting up so your numbers inherit sensible defaults.",
      cta: "Set up Freelens",
      view: "setup",
    };
  }
  if (status === "reserve-gap") {
    return {
      title: "Your balance doesn't yet cover all selected reserves.",
      cta: "Review your check-in",
      view: "weekly-checkin",
    };
  }
  if (!state.weeklyPosition) {
    return {
      title: "Do this week's check-in to see where you stand.",
      cta: "Weekly check-in",
      view: "weekly-checkin",
    };
  }
  if (stale) {
    return {
      title: "Your last check-in is a while ago — refresh it.",
      cta: "Update your check-in",
      view: "weekly-checkin",
    };
  }
  return {
    title: "A payment came in? Give it a job.",
    cta: "Process a payment",
    view: "money-arrived",
  };
}

function Figure({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-[var(--fl-slate)]">{label}</span>
      <span
        className={`tabular-nums text-[var(--fl-ink)] ${
          emphasis ? "font-serif text-xl font-medium" : "font-mono text-sm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
