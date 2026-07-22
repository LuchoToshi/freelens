"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseAmountInput, parsePercentInput } from "@/lib/domain/money";
import { errorClass, hintClass, inputClass, labelClass } from "@/components/app/styles";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}

function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <Label className={labelClass} htmlFor={id}>
        {label}
      </Label>
      {children}
      {hint && (
        <p id={hintId} className={hintClass}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={errorClass}>
          {error}
        </p>
      )}
    </div>
  );
}

interface CurrencyFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (raw: string) => void;
  hint?: string;
  placeholder?: string;
  allowNegative?: boolean;
  compact?: boolean;
  /** "lg" renders the prominent amount field (audit M3). */
  size?: "lg";
  /** Inline leading symbol, e.g. "€". */
  leadingSymbol?: string;
}

/**
 * Controlled currency text input. Holds a raw string in the parent; shows a
 * plain-language parse error only once the field is non-empty. The parent reads
 * cents via `parseAmountInput(value)` when it needs them. `size="lg"` +
 * `leadingSymbol` render the prominent "amount received" field.
 */
export function CurrencyField({
  id,
  label,
  value,
  onChange,
  hint,
  placeholder,
  allowNegative,
  compact,
  size,
  leadingSymbol,
}: CurrencyFieldProps) {
  const trimmed = value.trim();
  const error =
    trimmed === "" ? null : parseAmountInput(value, { allowNegative }).error;
  const large = size === "lg";
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        {leadingSymbol && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 flex items-center text-[var(--fl-slate)] ${
              large ? "pl-4 text-2xl" : "pl-3 text-base"
            }`}
          >
            {leadingSymbol}
          </span>
        )}
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`${inputClass} ${
            large ? "fl-tnum h-14 text-2xl font-medium" : compact ? "h-9 text-sm" : ""
          } ${leadingSymbol ? (large ? "pl-10" : "pl-8") : ""}`}
        />
      </div>
    </FieldShell>
  );
}

interface PercentFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (raw: string) => void;
  hint?: string;
  compact?: boolean;
}

export function PercentField({
  id,
  label,
  value,
  onChange,
  hint,
  compact,
}: PercentFieldProps) {
  const trimmed = value.trim();
  const error = trimmed === "" ? null : parsePercentInput(value).error;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={`${inputClass} ${compact ? "h-9 max-w-[140px] text-sm" : "max-w-[160px]"}`}
      />
    </FieldShell>
  );
}
