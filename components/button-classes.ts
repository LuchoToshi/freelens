/**
 * The two shared button class strings still in use after the legacy
 * calculator and rebooking surfaces were removed. Previously part of a much
 * larger style module owned by those views; kept here, trimmed to what the
 * surviving marketing pages actually reference.
 */
export const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[var(--fl-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)] disabled:opacity-50 disabled:pointer-events-none";

export const linkButtonClass =
  "text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)]";
