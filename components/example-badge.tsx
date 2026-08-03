"use client";

import { useT } from "@/components/i18n/locale-provider";

/** Small "Example" pill marking sample (non-personal) figures. */
export function ExampleBadge() {
  const t = useT();
  return (
    <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-[var(--fl-line)] bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--fl-slate)]">
      {t.common.example}
    </span>
  );
}
