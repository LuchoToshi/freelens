"use client";

import { useState } from "react";
import { Check, TriangleAlert, Ban, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyField } from "@/components/app/fields";
import { DisclaimerNote } from "@/components/disclaimer-note";
import { ExampleBadge } from "@/components/example-badge";
import {
  cardClass,
  hintClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
} from "@/components/app/styles";
import { formatEuro, parseAmountInput, toCents } from "@/lib/domain/money";
import {
  evaluateWeeklyPosition,
  type WeeklyPositionResult,
} from "@/lib/domain/allocation";
import { describeRunwayChange } from "@/lib/domain/runway";
import {
  checkDecision,
  type DecisionKind,
  type DecisionResult,
  type DecisionTiming,
} from "@/lib/domain/affordability";
import type { StoredWeeklyPosition } from "@/lib/domain/persistence";
import { useT } from "@/components/i18n/locale-provider";
import { fill } from "@/lib/i18n";

// Sample position for demo mode: €3.000 optional spending room, 4.0 runway.
const SAMPLE_POSITION: WeeklyPositionResult = evaluateWeeklyPosition({
  currentBalanceCents: toCents(5000),
  vatProtectedCents: toCents(0),
  vatProtectedIsActual: false,
  reserveProtectedCents: toCents(1000),
  reserveSource: "own-rule",
  obligations: [],
  bufferTargetCents: toCents(1000),
  essentialMonthlyCostsCents: toCents(1000),
});

// A concrete inline example so the feature is understandable without any action.
const INLINE_EXAMPLE = checkDecision(
  { amountCents: toCents(300), description: undefined, kind: "personal", timing: "now" },
  SAMPLE_POSITION
);

const VERDICT = {
  "fits-comfortably": {
    key: "fits" as const,
    icon: Check,
    tint: "var(--fl-payout-tint)",
    text: "var(--fl-payout-text)",
  },
  "fits-uses-most-room": {
    key: "tight" as const,
    icon: TriangleAlert,
    tint: "var(--fl-vat-tint)",
    text: "var(--fl-vat-text)",
  },
  "does-not-fit": {
    key: "wait" as const,
    icon: Ban,
    tint: "var(--fl-short-tint)",
    text: "var(--fl-short-text)",
  },
  "incomplete-data": {
    key: "noData" as const,
    icon: TriangleAlert,
    tint: "var(--fl-surface-stage)",
    text: "var(--fl-slate)",
  },
} as const;

export function DecisionView({
  saved,
  onGoToCheckin,
}: {
  saved: StoredWeeklyPosition | null;
  onGoToCheckin: () => void;
}) {
  const t = useT();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<DecisionKind>("personal");
  const [timing, setTiming] = useState<DecisionTiming>("now");
  const [demo, setDemo] = useState(false);

  const realPosition = saved ? evaluateWeeklyPosition(saved.input) : null;
  const position = realPosition ?? (demo ? SAMPLE_POSITION : null);
  const usingSample = realPosition === null && demo;

  const amountCents = parseAmountInput(amount).cents;
  const hasAmount = amountCents !== null && amountCents > 0;

  const result: DecisionResult | null = hasAmount
    ? checkDecision({ amountCents, description: description || undefined, kind, timing }, position)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <DependencyChain />

      {realPosition === null && !demo ? (
        <>
          <Card className={cardClass}>
            <CardContent className="flex flex-col items-start gap-3 p-6">
              <p className="text-base text-[var(--fl-ink)]">
                {t.app.decision.needsCheckin}
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={onGoToCheckin} className={primaryButtonClass}>
                  {t.app.decision.goToCheckin}
                </button>
                <button
                  type="button"
                  onClick={() => setDemo(true)}
                  className={linkButtonClass}
                >
                  {t.app.decision.tryExample}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Inline mini example, no action needed to understand the feature. */}
          <Card className="rounded-2xl border border-dashed border-[var(--fl-line)] bg-[var(--fl-surface-stage)]">
            <CardContent className="flex flex-col gap-3 p-6">
              <div className="flex items-center gap-2">
                <ExampleBadge />
                <p className={hintClass}>
                  A €300 personal buy against {formatEuro(SAMPLE_POSITION.optionalSpendingRoomCents)}{" "}
                  of room looks like this.
                </p>
              </div>
              <PurchaseCard amount={toCents(300)} description="New lens" kind="personal" />
              <DecisionOutcome result={INLINE_EXAMPLE} />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className={cardClass}>
            <CardContent className="flex flex-col gap-5 p-6">
              {usingSample && (
                <div className="flex items-center gap-2">
                  <ExampleBadge />
                  <p className={hintClass}>
                    {fill(t.app.decision.sampleNote, {
                      room: formatEuro(SAMPLE_POSITION.optionalSpendingRoomCents),
                    })}
                  </p>
                </div>
              )}
              <CurrencyField
                id="decision-amount"
                label={t.app.decision.costLabel}
                placeholder={t.app.decision.costPlaceholder}
                leadingSymbol="€"
                value={amount}
                onChange={setAmount}
              />
              <CurrencyField
                id="decision-description"
                label={t.app.decision.descriptionLabel}
                placeholder={t.app.decision.descriptionPlaceholder}
                value={description}
                onChange={setDescription}
              />
              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>{t.app.decision.kindQuestion}</Label>
                <div className="flex gap-2" role="group" aria-label={t.app.decision.kindGroupLabel}>
                  {(["business", "personal"] as DecisionKind[]).map((k) => (
                    <Toggle key={k} active={kind === k} onClick={() => setKind(k)}>
                      {k === "business" ? t.app.decision.business : t.app.decision.personal}
                    </Toggle>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>{t.app.decision.timingQuestion}</Label>
                <div className="flex gap-2" role="group" aria-label={t.app.decision.timingGroupLabel}>
                  {(["now", "later"] as DecisionTiming[]).map((option) => (
                    <Toggle
                      key={option}
                      active={timing === option}
                      onClick={() => setTiming(option)}
                    >
                      {option === "now" ? t.app.decision.now : t.app.decision.later}
                    </Toggle>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="rounded-2xl border border-[var(--fl-line)] bg-[var(--fl-surface-stage)] shadow-sm">
              <CardContent className="flex flex-col gap-4 p-6">
                {hasAmount && amountCents !== null && (
                  <PurchaseCard
                    amount={amountCents}
                    description={description || undefined}
                    kind={kind}
                  />
                )}
                <DecisionOutcome result={result} />
              </CardContent>
            </Card>
          )}

          {usingSample && (
            <p className={hintClass}>
              This is an example.{" "}
              <button type="button" onClick={onGoToCheckin} className="font-medium text-[var(--fl-ink)] underline">
                {t.app.decision.goToCheckin}
              </button>{" "}
              to check against your own numbers.
            </p>
          )}
        </>
      )}

      <DisclaimerNote />
    </div>
  );
}

/** Explains the dependency visually: position -> spending room -> decision. */
function DependencyChain() {
  const t = useT();
  const nodes = [
    t.app.decision.chain.position,
    t.app.decision.chain.room,
    t.app.decision.chain.decision,
  ];
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label={t.app.decision.chainLabel}>
      {nodes.map((n, i) => (
        <li key={n} className="flex items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--fl-slate)] ring-1 ring-[var(--fl-line)] ring-inset">
            {n}
          </span>
          {i < nodes.length - 1 && (
            <ArrowRight className="size-3.5 text-[var(--fl-slate)]" aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  );
}

function PurchaseCard({
  amount,
  description,
  kind,
}: {
  amount: ReturnType<typeof toCents>;
  description?: string;
  kind: DecisionKind;
}) {
  const t = useT();
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--fl-line)] bg-white p-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--fl-ink)]">
          {description ||
            (kind === "business"
              ? t.app.decision.businessCost
              : t.app.decision.personalCost)}
        </span>
        <span className="text-xs uppercase tracking-wide text-[var(--fl-slate)]">
          {kind}
        </span>
      </div>
      <span className="fl-tnum font-serif text-2xl font-medium text-[var(--fl-ink)]">
        {formatEuro(amount)}
      </span>
    </div>
  );
}

function DecisionOutcome({ result }: { result: DecisionResult }) {
  const v = VERDICT[result.outcome];
  const t = useT();
  const Icon = v.icon;
  const headline =
    result.outcome === "fits-comfortably"
      ? t.app.decision.headlines.fits
      : result.outcome === "fits-uses-most-room"
        ? t.app.decision.headlines.tight
        : result.outcome === "does-not-fit"
          ? t.app.decision.headlines.wait
          : t.app.decision.noPersonalResult;

  return (
    <div className="flex flex-col gap-3">
      <span
        className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
        style={{ backgroundColor: v.tint, color: v.text }}
      >
        <Icon className="size-4" aria-hidden="true" />
        {t.app.decision.verdicts[v.key]}
      </span>
      <p className="text-base font-medium text-[var(--fl-ink)]">{headline}</p>
      {result.outcome !== "does-not-fit" &&
        result.outcome !== "incomplete-data" &&
        result.remainingRoomCents !== null && (
          <p className="text-sm text-[var(--fl-slate)]">
            After this decision, {formatEuro(result.remainingRoomCents)} would
            remain while your selected reserves stay protected.
          </p>
        )}
      {result.outcome === "does-not-fit" && result.overageCents !== null && (
        <p className="text-sm text-[var(--fl-slate)]">
          This is {formatEuro(result.overageCents)} above your current optional
          spending room.
        </p>
      )}
      {(result.runwayBeforeMonths !== null ||
        result.runwayAfterMonths !== null) && (
        <RunwayCompare
          before={result.runwayBeforeMonths}
          after={result.runwayAfterMonths}
        />
      )}
    </div>
  );
}

function RunwayCompare({
  before,
  after,
}: {
  before: number | null;
  after: number | null;
}) {
  const t = useT();
  const fmt = (n: number | null) =>
    n === null ? t.app.decision.notApplicable : fill(t.app.decision.months, { n: n.toFixed(1) });
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-[var(--fl-slate)]">{t.app.decision.runwayNow}</span>
          <span className="fl-tnum text-lg font-medium text-[var(--fl-ink)]">
            {fmt(before)}
          </span>
        </div>
        <ArrowRight className="size-4 text-[var(--fl-slate)]" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-[var(--fl-slate)]">{t.app.decision.after}</span>
          <span className="fl-tnum text-lg font-medium text-[var(--fl-ink)]">
            {fmt(after)}
          </span>
        </div>
      </div>
      <p className={hintClass}>{describeRunwayChange(before, after)}</p>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
        active
          ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
          : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
      }`}
    >
      {children}
    </button>
  );
}
