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
import { formatEuro } from "@/lib/domain/money";
import { examplePaymentSplit } from "@/lib/domain/exampleScenario";
import { evaluateWeeklyPosition } from "@/lib/domain/allocation";
import type { WeeklyPositionResult } from "@/lib/domain/allocation";
import { isStale, type AppState } from "@/lib/domain/persistence";
import { formatCheckInDate } from "@/lib/format-date";
import type { AppView } from "@/components/app/nav-tabs";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

const RUNWAY_DIRECTION: Record<
  WeeklyPositionResult["status"],
  { key: "onTrack" | "gettingTight" | "belowTarget"; color: string }
> = {
  "reserves-covered": { key: "onTrack", color: "var(--fl-payout-text)" },
  "limited-room": { key: "gettingTight", color: "var(--fl-vat-text)" },
  "reserve-gap": { key: "belowTarget", color: "var(--fl-short-text)" },
};

export function OverviewView({
  state,
  onNavigate,
}: {
  state: AppState;
  onNavigate: (view: AppView) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const weekly = state.weeklyPosition
    ? {
        result: evaluateWeeklyPosition(state.weeklyPosition.input),
        timestampIso: state.weeklyPosition.timestampIso,
      }
    : null;
  const stale = weekly ? isStale(weekly.timestampIso) : false;

  const nextAction = pickNextAction(t, state);

  if (!state.setup && !weekly && !state.lastAllocation) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-base leading-relaxed text-[var(--fl-slate)]">
          {t.app.overview.emptyIntro}
        </p>
        <Card className={cardClass}>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-base text-[var(--fl-ink)]">
              {t.app.overview.emptyPrompt}
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => onNavigate("money-arrived")} className={primaryButtonClass}>
                {t.app.overview.tryPayment}
              </button>
              <button type="button" onClick={() => onNavigate("setup")} className={linkButtonClass}>
                {t.app.overview.setUpDetails}
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

      {/* 1. The permission moment, the hero number. */}
      {weekly && (
        <Card className="rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] shadow-sm">
          <CardContent className="flex flex-col gap-1 p-6">
            <span className="text-sm font-medium text-[var(--fl-slate)]">
              {t.app.overview.available}
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
              {t.app.overview.protected}
            </span>
            <Figure label={t.app.overview.vat} value={formatEuro(weekly.result.vatProtectedCents)} />
            <Figure
              label={t.app.overview.reserve}
              value={formatEuro(weekly.result.reserveProtectedCents)}
            />
          </CardContent>
        </Card>
      )}

      {/* 3. Runway, months and direction. */}
      {weekly && (
        <Card className={cardClass}>
          <CardContent className="flex flex-col gap-2 p-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium text-[var(--fl-slate)]">
                {t.app.overview.runway}
              </span>
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: RUNWAY_DIRECTION[weekly.result.status].color }}
              >
                {t.app.overview.direction[RUNWAY_DIRECTION[weekly.result.status].key]}
              </span>
            </div>
            <span className="fl-tnum font-serif text-2xl font-medium text-[var(--fl-ink)]">
              {weekly.result.runwayMonths === null
                ? t.app.overview.runwayUnknown
                : fill(t.app.overview.runwayMonths, {
                    months: weekly.result.runwayMonths.toFixed(1),
                  })}
            </span>
            <p className={`${hintClass} pt-1`}>
              {fill(t.app.overview.lastUpdated, {
                date: formatCheckInDate(weekly.timestampIso, locale, t.app.overview.recently),
              })}
              {stale ? t.app.overview.worthRefreshing : "."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 4. Next best action. */}
      <Card className={cardClass}>
        <CardContent className="flex flex-col gap-3 p-6">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            {t.app.overview.nextAction}
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
              {t.app.overview.latestAllocation}
              {state.lastAllocation.label ? `: ${state.lastAllocation.label}` : ""}
            </span>
            <Figure
              label={t.app.overview.payment}
              value={formatEuro(state.lastAllocation.grossPaymentCents)}
            />
            <Figure
              label={t.app.overview.availableForPayout}
              value={formatEuro(state.lastAllocation.availableForPersonalPayoutCents)}
            />
            <p className={`${hintClass} pt-1`}>
              {fill(t.app.overview.recordedOn, {
                date: formatCheckInDate(
                  state.lastAllocation.timestampIso,
                  locale,
                  t.app.overview.recently
                ),
              })}
            </p>
          </CardContent>
        </Card>
      )}

      <DisclaimerNote />
    </div>
  );
}

/**
 * A calm, clearly-labelled sample of the populated overview (audit).
 *
 * These were four invented figures (€2.400 available, €700 btw, €1.100
 * reserved, 2,4 months). Anyone arriving from the homepage had just been shown
 * €1.590 from a €2.500 payment and landed on a different story on the next
 * click. It is now the same payment, through the same engine, so the workspace
 * opens on the number that brought the visitor here.
 *
 * The runway line went with them: it cannot be derived from a single payment
 * without inventing a monthly cost, and an invented figure is what this is
 * fixing.
 */
function ExampleOverview() {
  const t = useT();
  const split = examplePaymentSplit();
  return (
    <Card className="rounded-2xl border border-dashed border-[var(--fl-line)] bg-[var(--fl-surface-stage)]">
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex items-center gap-2">
          <ExampleBadge />
          <p className={hintClass}>{t.app.overview.exampleIntro}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[var(--fl-slate)]">
            {t.app.overview.available}
          </span>
          <span className="fl-tnum font-serif text-3xl font-medium text-[var(--fl-ink)]">
            {formatEuro(split.yours)}
          </span>
        </div>
        <Figure label={t.app.overview.exampleVat} value={formatEuro(split.vat)} />
        <Figure label={t.app.overview.exampleReserve} value={formatEuro(split.reserve)} />
        <Figure label={t.app.overview.exampleBusiness} value={formatEuro(split.business)} />
      </CardContent>
    </Card>
  );
}

function pickNextAction(
  t: Dictionary,
  state: AppState
): { title: string; cta: string; view: AppView } {
  const a = t.app.overview.actions;
  if (!state.setup) return { ...a.finishSetup, view: "setup" };
  // The check-in surface is demoted: the one next step this workspace pushes
  // is giving an incoming payment its tasks.
  return { ...a.payment, view: "money-arrived" };
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
