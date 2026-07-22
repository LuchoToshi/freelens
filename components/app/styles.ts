/** Shared class strings for the app views, matching the homepage design tokens. */

export const cardClass =
  "rounded-2xl border border-[var(--fl-line)] bg-white shadow-sm";

export const labelClass = "text-sm font-medium text-[var(--fl-ink)]";
export const hintClass = "text-xs leading-relaxed text-[var(--fl-slate)]";
export const errorClass = "text-xs font-medium text-[var(--fl-short-text)]";

/** Visible 2px focus ring (audit Q4). Not color-alone; >=3:1 on our surfaces. */
export const focusRingClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]";

export const inputClass =
  "rounded-lg border border-[var(--fl-line)] bg-white transition focus-visible:border-[var(--fl-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fl-focus-ring)]/25 focus-visible:outline-none";

export const pillButtonClass =
  "inline-flex min-h-11 w-fit items-center gap-1.5 rounded-lg border border-[var(--fl-line)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--fl-ink)] transition hover:border-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]";

export const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[var(--fl-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)] disabled:opacity-50 disabled:pointer-events-none";

export const secondaryButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--fl-line)] bg-white px-6 text-base font-medium text-[var(--fl-ink)] transition hover:border-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)]";

export const linkButtonClass =
  "text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)]";
