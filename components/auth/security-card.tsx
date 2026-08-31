"use client";

import { useState } from "react";
import {
  sessionPolicy,
  setSessionPolicy,
  supabaseBrowser,
} from "@/lib/agent/supabase";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * Security & sessions (addendum §1.2 flow 6, scoped to what the platform
 * exposes today): the per-device session policy, and "sign out everywhere
 * else" via refresh-token revocation. The per-device session LIST needs a
 * server surface the hosted tier doesn't offer the client — recorded as a
 * deviation, not faked.
 */
export function SecurityCard({ locale }: { locale: FrontdeskLocale }) {
  const t = fdDict(locale).security;
  const [policy, setPolicy] = useState<"device" | "browser">(() => sessionPolicy());
  const [othersState, setOthersState] = useState<"idle" | "busy" | "done">("idle");

  async function signOutOthers() {
    setOthersState("busy");
    const { error } = await supabaseBrowser().auth.signOut({ scope: "others" });
    setOthersState(error ? "idle" : "done");
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--fd-line)] bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--fd-ink)]">
        {t.heading}
      </h2>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-[var(--fd-ink)]">{t.policyLegend}</legend>
        {(
          [
            ["device", t.policyDevice, t.policyDeviceWhy],
            ["browser", t.policyBrowser, t.policyBrowserWhy],
          ] as const
        ).map(([value, label, why]) => (
          <label key={value} className="flex items-start gap-3">
            <input
              type="radio"
              name="fd-session-policy"
              checked={policy === value}
              onChange={() => {
                setPolicy(value);
                setSessionPolicy(value);
              }}
              className="mt-1 h-4 w-4 accent-[var(--fd-ink)]"
            />
            <span className="flex flex-col">
              <span className="text-sm text-[var(--fd-ink)]">{label}</span>
              <span className="text-xs leading-relaxed text-[var(--fd-slate)]">{why}</span>
            </span>
          </label>
        ))}
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.policyNote}</p>
      </fieldset>

      <div className="flex flex-col gap-2 border-t border-[var(--fd-line)] pt-3">
        <button
          type="button"
          disabled={othersState === "busy"}
          onClick={() => void signOutOthers()}
          className="inline-flex min-h-11 w-fit items-center rounded-lg border border-[var(--fd-line-control)] px-4 text-sm font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)] disabled:opacity-50"
        >
          {othersState === "busy" ? t.othersBusy : t.othersButton}
        </button>
        {othersState === "done" && (
          <p role="status" className="text-sm text-[var(--fd-ink)]">
            {t.othersDone}
          </p>
        )}
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.othersWhy}</p>
      </div>
    </section>
  );
}
