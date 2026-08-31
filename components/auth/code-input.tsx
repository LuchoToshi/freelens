"use client";

import { useRef } from "react";

/**
 * Six-digit sign-in code entry (addendum §1.2, DS components/auth/CodeInput).
 * One real input — so paste and iOS/Android one-time-code autofill work and a
 * screen reader announces a single field — with six visual slots. The code
 * replaces the magic link entirely: possession of the inbox plus typing the
 * code on the requesting device is the proof; a forwarded email can't sign
 * anyone in.
 */
export type CodeStatus = "idle" | "verifying" | "error" | "expired" | "locked";

export function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  status = "idle",
  errorText,
  label,
  checkingText,
}: {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  status?: CodeStatus;
  errorText?: string;
  label: string;
  checkingText: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.replace(/\D/g, "").slice(0, length);
  const disabled = status === "verifying" || status === "locked";

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value.replace(/\D/g, "").slice(0, length);
    onChange(next);
    if (next.length === length && onComplete) onComplete(next);
  }

  const slotBorder =
    status === "error" || status === "locked"
      ? "border-[var(--fd-error-text)]"
      : "border-[var(--fd-line-control)]";

  return (
    <div className="flex flex-col gap-2">
      <label className={`relative block ${disabled ? "cursor-default" : "cursor-text"}`}>
        <span className="sr-only">{label}</span>
        <input
          ref={inputRef}
          value={digits}
          onChange={handle}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={length}
          aria-invalid={status === "error"}
          aria-describedby={errorText ? "fd-code-note" : undefined}
          className="absolute inset-0 h-full w-full cursor-[inherit] opacity-0 text-base"
        />
        <div
          aria-hidden="true"
          className={`grid gap-2 ${status === "verifying" ? "opacity-55" : ""}`}
          style={{ gridTemplateColumns: `repeat(${length}, minmax(40px, 1fr))` }}
        >
          {Array.from({ length }).map((_, i) => {
            const active =
              !disabled && i === Math.min(digits.length, length - 1) && digits.length < length;
            return (
              <span
                key={i}
                className={`flex min-h-[52px] items-center justify-center rounded-xl border bg-white font-mono text-[22px] font-medium text-[var(--fd-ink)] ${
                  active
                    ? "border-[var(--fd-ink)] shadow-[0_0_0_2px_rgba(26,26,26,0.15)]"
                    : slotBorder
                }`}
              >
                {digits[i] || ""}
              </span>
            );
          })}
        </div>
      </label>
      {status === "verifying" && (
        <p role="status" className="m-0 text-[13px] text-[var(--fd-slate)]">
          {checkingText}
        </p>
      )}
      {errorText && status !== "verifying" && (
        <p
          id="fd-code-note"
          role="alert"
          className="m-0 text-[13px] font-medium text-[var(--fd-error-text)]"
        >
          {errorText}
        </p>
      )}
    </div>
  );
}
