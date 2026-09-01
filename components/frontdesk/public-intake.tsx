"use client";

import { useState } from "react";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { IntakeThread } from "@/components/frontdesk/intake-thread";
import { InquiryForm } from "@/components/frontdesk/inquiry-form";

/**
 * The public page's intake surface (addendum §3): conversation-first, with
 * the classic single form one link away (teardown removal-safety rule) and
 * a way back.
 */
export function PublicIntake(props: {
  handle: string;
  displayName: string;
  locale: FrontdeskLocale;
  srcChannel: string | null;
}) {
  const t = fdDict(props.locale).public.intake;
  const [manual, setManual] = useState(false);

  if (manual) {
    return (
      <div className="flex flex-col gap-3">
        <InquiryForm {...props} />
        <button
          type="button"
          onClick={() => setManual(false)}
          className="w-fit text-sm font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]"
        >
          {t.backToConversation}
        </button>
      </div>
    );
  }
  return <IntakeThread {...props} onManualFallback={() => setManual(true)} />;
}
