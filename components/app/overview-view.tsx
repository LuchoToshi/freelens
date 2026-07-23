"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBanner } from "@/components/app/status-banner";
import { DisclaimerNote } from "@/components/disclaimer-note";
import { ExampleBadge } from "@/components/example-badge";
import { AnimatedAmount } from "@/components/design/animated-amount";
import {
  cardClass,
  hintClass,
  linkButtonClass,
  primaryButtonClass,
} from "@/components/app/styles";
import { formatEuro, toCents } from "@/lib/domain/money";
import { evaluateWeeklyPosition } from "@/lib/domain/allocation";
import type { WeeklyPositionResult } from "@/lib/domain/allocation";
import { isStale, type AppState } from "@/lib/domain/persistence";
import { formatCheckInDate } from "@/lib/format-date";
import type { AppView } from "@/components/app/nav-tabs";

const RUNWAY_DIRECTION: Record<
  WeeklyPositionResult["status"],
  { label: string; color: string }
> = {
  "reserves-covered": { label: "On track", color: "var(--fl-payout-text)" },
  "limited-room": { label: "Getting tight", color: "var(--fl-vat-text)" },
  "reserve-gap": { label: "Below target", color: "var(--fl-short-text)" },
};

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
        <p className="text-base leading-relaxed text-[var(--fl-slate)]">
          Freelens helps you separate VAT, protect a tax reserve, cover business
          costs, and see what may be available to pay yourself.
        </p>
        <Card className={cardClass}>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-base text-[var(--fl-ink)]">
              See what one payment splits into. It takes about 30 seconds, and
              needs no setup.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => onNavigate("money-arrived")} className={primaryButtonClass}>
                Try one payment (30 seconds)
              </button>
              <button type="button" onClick={() => onNavigate("setup")} className={linkButtonClass}>
                Personalize my estimate (3 minutes)
              </button>
            </div>
          </CardContent>
        </Card>
        <ExampleOverview />
        <DisclaimerNote />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {weekly && <StatusBanner status={weekly.result.status} />}

      {/* 1. The permission moment — the hero number. */}
      {weekly && (
        <Card className="rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] shadow-sm">
          <CardContent className="flex flex-col gap-1 p-6">
            <span className="text-sm font-medium text-[var(--fl-slate)]">
              May be available to pay yourself
            </span>
            <AnimatedAmount
              cents={weekly.result.availableForPersonalPayoutCents}
              className="font-serif text-4xl font-medium tracking-tight text-[var(--fl-ink)] sm:text-5xl"
            />
          </CardContent>
        </Card>
      )}

      {/* 2. Protected. */}
      {weekly && (
        <Card className={cardClass}>
          <CardContent className="flex flex-col gap-2 p-6">
            <span className="text-sm font-medium text-[var(--fl-slate)]">
              Protected
            </span>
            <Figure label="VAT" value={formatEuro(weekly.result.vatProtectedCents)} />
            <Figure
              label="Income tax and Zvw reserve"
              value={formatEuro(weekly.result.reserveProtectedCents)}
            />
          </CardContent>
        </Card>
      )}

      {/* 3. Runway — months and direction. */}
      {weekly && (
        <Card className={cardClass}>
          <CardContent className="flex flex-col gap-2 p-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium text-[var(--fl-slate)]">
                Business runway
              </span>
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: RUNWAY_DIRECTION[weekly.result.status].color }}
              >
                {RUNWAY_DIRECTION[weekly.result.status].label}
              </span>
            </div>
            <span className="fl-tnum font-serif text-2xl font-medium text-[var(--fl-ink)]">
              {weekly.result.runwayMonths === null
                ? "Add monthly costs to estimate"
                : `${weekly.result.runwayMonths.toFixed(1)} months`}
            </span>
            <p className={`${hintClass} pt-1`}>
              Last updated {formatCheckInDate(weekly.timestampIso)}
              {stale ? " — worth refreshing." : "."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 4. Next best action. */}
      <Card className={cardClass}>
        <CardContent className="flex flex-col gap-3 p-6">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            Next best action
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

/** A calm, clearly-labelled sample of the populated overview (audit). */
function ExampleOverview() {
  return (
    <Card className="rounded-2xl border border-dashed border-[var(--fl-line)] bg-[var(--fl-surface-stage)]">
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex items-center gap-2">
          <ExampleBadge />
          <p className={hintClass}>A filled-in week looks like this.</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            May be available to pay yourself
          </span>
          <span className="fl-tnum font-serif text-3xl font-medium text-[var(--fl-ink)]">
            {formatEuro(toCents(2400))}
          </span>
        </div>
        <Figure label="Protected VAT" value={formatEuro(toCents(700))} />
        <Figure label="Protected reserve" value={formatEuro(toCents(1100))} />
        <Figure label="Business runway" value="2.4 months" />
      </CardContent>
    </Card>
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
    cta: "See what I can pay myself",
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
        className={`fl-tnum text-[var(--fl-ink)] ${
          emphasis ? "font-serif text-xl font-medium" : "font-mono text-sm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
