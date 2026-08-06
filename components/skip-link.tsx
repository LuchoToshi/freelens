"use client";

import { useT } from "@/components/i18n/locale-provider";

/**
 * First stop in the tab order, visible only when focused.
 *
 * Without it a keyboard user passed six header controls before the first
 * heading on every page, and ten on /tool, where the four mode tabs sit above
 * the content.
 */
export function SkipLink() {
  const t = useT();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-xl focus:bg-[var(--fl-ink)] focus:px-4 focus:text-sm focus:font-medium focus:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--fl-focus-ring)]"
    >
      {t.common.skipToContent}
    </a>
  );
}
