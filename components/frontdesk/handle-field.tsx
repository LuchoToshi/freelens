"use client";

import { useEffect, useRef, useState } from "react";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { isValidHandle } from "@/lib/frontdesk/handles";

/**
 * The public link name.
 *
 * The field shows the link the freelancer will actually get, built from what
 * they are typing, in the one format the product serves: frlns.com/name.
 * An earlier version decorated the input with ".frlns.com" while the note
 * underneath said the page opens at frlns.com/name, which are two different
 * addresses and left the reader unable to tell which one they were choosing.
 *
 * Availability is stated only after a real check against the database. Shape
 * alone proves nothing about whether a name is free, so before the check, and
 * whenever the check itself fails, the field says nothing rather than guessing
 * "available".
 */
type CheckState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "free" }
  | { kind: "taken" }
  | { kind: "unknown" };

export const HANDLE_HOST = "frlns.com";

export function HandleField({
  locale,
  value,
  onChange,
  errorTaken,
}: {
  locale: FrontdeskLocale;
  value: string;
  onChange: (next: string) => void;
  /** The save actually came back with a duplicate; outranks any earlier check. */
  errorTaken: boolean;
}) {
  const t = fdDict(locale).setup.profile;
  const [check, setCheck] = useState<CheckState>({ kind: "idle" });
  // The name that produced the current verdict, so a verdict is never shown
  // against a name the freelancer has since edited.
  const checkedRef = useRef("");

  useEffect(() => {
    if (checkedRef.current !== value) setCheck({ kind: "idle" });
  }, [value]);

  async function runCheck() {
    if (!isValidHandle(value)) return;
    checkedRef.current = value;
    setCheck({ kind: "checking" });
    try {
      const res = await fetch(`/api/frontdesk/handle?handle=${encodeURIComponent(value)}`);
      const payload = (await res.json()) as { ok: boolean; available?: boolean };
      if (checkedRef.current !== value) return;
      if (!payload.ok || payload.available === undefined) {
        setCheck({ kind: "unknown" });
        return;
      }
      setCheck({ kind: payload.available ? "free" : "taken" });
    } catch {
      if (checkedRef.current === value) setCheck({ kind: "unknown" });
    }
  }

  const verdict = errorTaken
    ? t.handleTaken
    : check.kind === "checking"
      ? t.handleChecking
      : check.kind === "free"
        ? t.handleFree
        : check.kind === "taken"
          ? t.handleTaken
          : check.kind === "unknown"
            ? t.handleCheckFailed
            : "";
  const isProblem = errorTaken || check.kind === "taken";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="su-handle" className="text-sm font-medium text-[var(--fd-ink)]">
        {t.handleLabel}
      </label>
      <div className="flex min-h-11 items-center rounded-lg border border-[var(--fd-line-control)] bg-white pl-3 focus-within:border-[var(--fd-focus-ring)] focus-within:ring-2 focus-within:ring-[var(--fd-focus-ring)]/25">
        <span aria-hidden="true" className="shrink-0 text-sm text-[var(--fd-slate)]">
          {HANDLE_HOST}/
        </span>
        <input
          id="su-handle"
          value={value}
          maxLength={30}
          autoComplete="off"
          spellCheck={false}
          aria-describedby="su-handle-hint su-handle-preview"
          onChange={(e) => onChange(e.target.value.toLowerCase().trim())}
          onBlur={() => void runCheck()}
          className="min-h-11 min-w-0 flex-1 rounded-r-lg bg-transparent px-1 text-base focus-visible:outline-none sm:text-sm"
        />
      </div>
      <p id="su-handle-preview" className="text-sm text-[var(--fd-ink)]">
        {value ? (
          <>
            {t.handlePreviewLabel}{" "}
            <span className="font-mono">
              {HANDLE_HOST}/{value}
            </span>
          </>
        ) : (
          <span className="text-[var(--fd-slate)]">{t.handlePreviewEmpty}</span>
        )}
      </p>
      <p id="su-handle-hint" className="text-xs leading-relaxed text-[var(--fd-slate)]">
        {t.handleHint}
      </p>
      {verdict && (
        <p
          role={isProblem ? "alert" : "status"}
          className={`text-xs font-medium ${
            isProblem ? "text-[var(--fd-error-text)]" : "text-[var(--fd-slate)]"
          }`}
        >
          {verdict}
        </p>
      )}
    </div>
  );
}
