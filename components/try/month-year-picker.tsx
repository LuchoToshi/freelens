"use client";

import { useMemo, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { inputClass } from "@/components/frontdesk/styles";
import type { Locale } from "@/lib/i18n/types";

const MONTH_COUNT = 12;

/** "YYYY-MM" in, {year, month(1-12)} out. Same shape try-app.tsx already stores. */
function parse(value: string): { year: number; month: number } | null {
  if (!/^\d{4}-\d{2}$/.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatValue(value: string, locale: Locale): string {
  const parsed = parse(value);
  if (!parsed) return "";
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(parsed.year, parsed.month - 1, 1, 12));
}

/**
 * A month/year control that cannot accept free text: the trigger is a
 * button, not an input, so there is nothing to type into. The popup shows
 * one year at a time and a 12-month grid; the value it emits is the same
 * "YYYY-MM" string the native `<input type="month">` it replaces used, so
 * nothing downstream (ranking, draft copy) needs to change.
 *
 * Built on Base UI's Popover for the accessibility plumbing that a hand
 * rolled dropdown would otherwise have to reimplement: outside-click and
 * Escape dismissal, focus return to the trigger, and viewport-aware
 * positioning for mobile.
 */
export function MonthYearPicker({
  id,
  value,
  onChange,
  max,
  locale,
  placeholder,
  dialogLabel,
  prevYearLabel,
  nextYearLabel,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Inclusive upper bound, "YYYY-MM". Months after this are disabled. */
  max: string;
  locale: Locale;
  placeholder: string;
  dialogLabel: string;
  prevYearLabel: string;
  nextYearLabel: string;
}) {
  const maxParsed = parse(max) ?? { year: 9999, month: 12 };
  const selected = parse(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => selected?.year ?? maxParsed.year);
  const monthRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const monthNames = useMemo(
    () =>
      Array.from({ length: MONTH_COUNT }, (_, i) =>
        new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", { month: "short" }).format(
          new Date(2024, i, 1)
        )
      ),
    [locale]
  );

  function isFuture(year: number, month: number): boolean {
    return year > maxParsed.year || (year === maxParsed.year && month > maxParsed.month);
  }

  function select(month: number) {
    onChange(`${viewYear}-${pad(month)}`);
    setOpen(false);
  }

  /** Moves focus by `step` months, skipping disabled (future) cells, without wrapping years. */
  function moveFocus(fromIndex: number, step: number) {
    let next = fromIndex + step;
    while (next >= 0 && next < MONTH_COUNT) {
      if (!isFuture(viewYear, next + 1)) {
        monthRefs.current[next]?.focus();
        return;
      }
      next += step > 0 ? 1 : -1;
    }
  }

  function handleGridKeyDown(e: React.KeyboardEvent, index: number) {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveFocus(index, 1);
        return;
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(index, -1);
        return;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(index, 3);
        return;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(index, -3);
        return;
      case "Home":
        e.preventDefault();
        moveFocus(-1, 1);
        return;
      case "End":
        e.preventDefault();
        moveFocus(MONTH_COUNT, -1);
        return;
      default:
        return;
    }
  }

  const nextYearDisabled = viewYear >= maxParsed.year;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setViewYear(selected?.year ?? maxParsed.year);
      }}
    >
      <Popover.Trigger
        id={id}
        type="button"
        className={`${inputClass} flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-sm text-[var(--fd-ink)]`}
      >
        <span className={value ? "" : "text-[var(--fd-slate)]"}>
          {value ? formatValue(value, locale) : placeholder}
        </span>
        <CalendarDays className="size-4 shrink-0 text-[var(--fd-slate)]" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} align="start">
          <Popover.Popup
            role="dialog"
            aria-label={dialogLabel}
            className="w-64 rounded-lg border border-[var(--fd-line-control)] bg-[var(--fd-paper)] p-3 shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label={prevYearLabel}
                onClick={() => setViewYear((y) => y - 1)}
                className="inline-flex size-8 items-center justify-center rounded-md text-[var(--fd-ink)] hover:bg-[var(--fd-paper-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-focus-ring)]"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span className="text-sm font-semibold text-[var(--fd-ink)]">{viewYear}</span>
              <button
                type="button"
                aria-label={nextYearLabel}
                disabled={nextYearDisabled}
                onClick={() => setViewYear((y) => y + 1)}
                className="inline-flex size-8 items-center justify-center rounded-md text-[var(--fd-ink)] hover:bg-[var(--fd-paper-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-focus-ring)] disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div role="grid" aria-label={dialogLabel} className="grid grid-cols-3 gap-1">
              {monthNames.map((label, i) => {
                const month = i + 1;
                const disabled = isFuture(viewYear, month);
                const isSelected = selected?.year === viewYear && selected?.month === month;
                return (
                  <button
                    key={label}
                    ref={(el) => {
                      monthRefs.current[i] = el;
                    }}
                    type="button"
                    role="gridcell"
                    disabled={disabled}
                    aria-current={isSelected ? "date" : undefined}
                    onClick={() => select(month)}
                    onKeyDown={(e) => handleGridKeyDown(e, i)}
                    className={`rounded-md px-2 py-1.5 text-xs font-medium capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-focus-ring)] disabled:pointer-events-none disabled:opacity-30 ${
                      isSelected
                        ? "bg-[var(--fd-accent)] text-[var(--fd-ink)]"
                        : "text-[var(--fd-ink)] hover:bg-[var(--fd-paper-dim)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
