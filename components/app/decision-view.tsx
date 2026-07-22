"use client";

import { useState } from "react";
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

export function DecisionView({
  saved,
  onGoToCheckin,
}: {
  saved: StoredWeeklyPosition | null;
  onGoToCheckin: () => void;
}) {
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
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-2xl font-medium text-[var(--fl-ink)] sm:text-3xl">
          Check a decision
        </h2>
        <p className={hintClass}>
          See how a planned purchase fits against your optional spending room.
        </p>
      </div>

      {realPosition === null && !demo ? (
        <Card className={cardClass}>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-base text-[var(--fl-ink)]">
              Complete a weekly check-in for a personal result.
            </p>
            <p className={hintClass}>
              Or try an example to see how this works, using sample numbers.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onGoToCheckin} className={primaryButtonClass}>
                Do a weekly check-in
              </button>
              <button
                type="button"
                onClick={() => setDemo(true)}
                className={linkButtonClass}
              >
                Try an example
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className={cardClass}>
            <CardContent className="flex flex-col gap-5 p-6">
              {usingSample && (
                <div className="flex items-center gap-2">
                  <ExampleBadge />
                  <p className={hintClass}>
                    Using sample numbers ({formatEuro(SAMPLE_POSITION.optionalSpendingRoomCents)} spending room).
                  </p>
                </div>
              )}
              <CurrencyField
                id="decision-amount"
                label="What does it cost?"
                placeholder="e.g. 300"
                value={amount}
                onChange={setAmount}
              />
              <CurrencyField
                id="decision-description"
                label="What is it? (optional)"
                placeholder="e.g. New laptop"
                value={description}
                onChange={setDescription}
              />
              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>Is this a business or personal cost?</Label>
                <div className="flex gap-2" role="group" aria-label="Cost kind">
                  {(["business", "personal"] as DecisionKind[]).map((k) => (
                    <Toggle key={k} active={kind === k} onClick={() => setKind(k)}>
                      {k === "business" ? "Business" : "Personal"}
                    </Toggle>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>When?</Label>
                <div className="flex gap-2" role="group" aria-label="Timing">
                  {(["now", "later"] as DecisionTiming[]).map((t) => (
                    <Toggle key={t} active={timing === t} onClick={() => setTiming(t)}>
                      {t === "now" ? "Now" : "Later"}
                    </Toggle>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {result && <DecisionResultCard result={result} />}

          {usingSample && (
            <p className={hintClass}>
              This is an example.{" "}
              <button type="button" onClick={onGoToCheckin} className="font-medium text-[var(--fl-ink)] underline">
                Do a weekly check-in
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

function DecisionResultCard({ result }: { result: DecisionResult }) {
  const { outcome } = result;
  const headline =
    outcome === "fits-comfortably"
      ? "This fits within your current optional spending room."
      : outcome === "fits-uses-most-room"
        ? "This fits, but it would use most of your current room."
        : "Not within the reserves you selected.";
  const color =
    outcome === "does-not-fit" ? "text-[var(--fl-short-text)]" : "text-[var(--fl-good-text)]";

  return (
    <Card className={cardClass}>
      <CardContent className="flex flex-col gap-3 p-6">
        <p className={`font-serif text-xl font-medium sm:text-2xl ${color}`}>
          {headline}
        </p>
        {outcome !== "does-not-fit" && result.remainingRoomCents !== null && (
          <p className="text-sm text-[var(--fl-slate)]">
            After this decision, {formatEuro(result.remainingRoomCents)} would
            remain while your selected reserves stay protected.
          </p>
        )}
        {outcome === "does-not-fit" && result.overageCents !== null && (
          <p className="text-sm text-[var(--fl-slate)]">
            This is {formatEuro(result.overageCents)} above your current optional
            spending room.
          </p>
        )}
        {(result.runwayBeforeMonths !== null || result.runwayAfterMonths !== null) && (
          <p className="text-sm text-[var(--fl-slate)]">
            {describeRunwayChange(result.runwayBeforeMonths, result.runwayAfterMonths)}
          </p>
        )}
      </CardContent>
    </Card>
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
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
          : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
      }`}
    >
      {children}
    </button>
  );
}
