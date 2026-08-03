"use client";

import { ConfidenceBlock } from "@/components/design/confidence-block";
import { useT } from "@/components/i18n/locale-provider";

/**
 * The calm accuracy disclaimer shown near every result, not hidden in the
 * footer. Rendered through the shared {@link ConfidenceBlock}: one warm
 * sentence up front, with the full planning-estimate caveat preserved verbatim
 * behind "How this estimate works". `className` only adjusts spacing/placement.
 */
export function DisclaimerNote({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <ConfidenceBlock className={className} detail={t.common.confidence.disclaimer} />
  );
}
