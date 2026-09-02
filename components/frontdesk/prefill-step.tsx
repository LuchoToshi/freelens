"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { track } from "@/lib/analytics";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { confidencePercent } from "@/lib/frontdesk/provenance";
import { demoSetupExample } from "@/lib/frontdesk/demoFixture";
import type { PrefillResult } from "@/lib/frontdesk/server/prefill";
import type { PackageRow } from "@/components/frontdesk/setup-wizard";
import type { Profession } from "@/components/frontdesk/profession-picker";

/**
 * Point Freelens at your work, then review what it read (addendum §4).
 * Two states: the source step (URL or pasted text, with the empty-form exit
 * always first-class), and PrefillReview — per-field provenance and
 * confidence, click-to-edit (an edit flips provenance to "you"), missing
 * shown as "Not found", and nothing saved until the confirm gate hands the
 * values to the wizard.
 */
export interface PrefillApplied {
  displayName: string;
  professions: Profession[];
  location: string;
  signOff: string;
  packages: PackageRow[];
}

export function PrefillStep({
  session,
  locale,
  onApply,
  onSkip,
}: {
  session: Session;
  locale: FrontdeskLocale;
  onApply: (applied: PrefillApplied) => void;
  onSkip: () => void;
}) {
  const t = fdDict(locale).setup.prefill;
  const [mode, setMode] = useState<"source" | "reading" | "review" | "error">("source");
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [prefill, setPrefill] = useState<PrefillResult | null>(null);
  const [edited, setEdited] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<PrefillApplied | null>(null);
  // The example path (§5.2): values that came from the worked example rather
  // than from anything the freelancer shared. Kept separate from `prefill` so
  // no example value can ever be labeled as something read from a page.
  const [fromExample, setFromExample] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  // The source screen and the review screen are the same component with no
  // navigation between them, so nothing else would move a screen reader's
  // focus when the extraction result replaces the source form.
  useEffect(() => {
    headingRef.current?.focus();
  }, [mode]);

  const inputClass =
    "min-h-11 w-full rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-base sm:text-sm focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none";
  const primaryClass =
    "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-6 text-base font-medium text-white disabled:opacity-50";
  const ghostClass =
    "w-fit text-sm font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]";

  async function read() {
    track("prefill_started");
    setMode("reading");
    try {
      const res = await fetch("/api/frontdesk/setup/prefill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(url ? { url } : { text: pasted }),
      });
      const payload = (await res.json()) as { ok: boolean; prefill?: PrefillResult };
      if (!payload.ok || !payload.prefill) {
        setMode("error");
        return;
      }
      setPrefill(payload.prefill);
      const nextValues: PrefillApplied = {
        displayName: payload.prefill.display_name ?? "",
        professions: payload.prefill.professions as Profession[],
        location: payload.prefill.location ?? "",
        signOff: payload.prefill.sign_off ?? "",
        packages: payload.prefill.packages.map((p) => ({
          label: p.label ?? "",
          price: p.price_from_eur === null ? "" : String(p.price_from_eur),
          unit: p.unit ?? "",
          notes: p.notes ?? "",
          // Extraction reads a number off a page; it cannot know how the
          // freelancer counts it, so the question stays open for them.
          chargeBy: null,
          priceIsFrom: false,
          addons: [],
        })),
      };
      // One event per proposed field, per the tracking plan — packages counts
      // as one field regardless of row count. Professions is excluded: this
      // screen has no control to edit it, so it can never register as
      // corrected, and counting it as proposed would guarantee it always
      // reads as "accepted unedited."
      if (nextValues.displayName) track("prefill_field_proposed");
      if (nextValues.location) track("prefill_field_proposed");
      if (nextValues.signOff) track("prefill_field_proposed");
      if (nextValues.packages.length) track("prefill_field_proposed");
      setValues(nextValues);
      track("prefill_reviewed");
      setMode("review");
    } catch {
      setMode("error");
    }
  }

  function startFromExample() {
    const example = demoSetupExample(locale);
    setValues({
      displayName: example.displayName,
      professions: example.professions as Profession[],
      location: example.location,
      signOff: example.signOff,
      packages: example.packages.map((p) => ({ ...p, addons: [] })),
    });
    setPrefill(null);
    setEdited({});
    setFromExample(true);
    setMode("review");
  }

  function markPackagesEdited() {
    // Packages count as one field: fire once for the whole set, not once
    // per row or per keystroke.
    const alreadyEdited = Object.keys(edited).some((k) => k.startsWith("pkg-"));
    if (!alreadyEdited) track("prefill_field_edited");
  }

  function sourceLabel(field: string, confidence: number | undefined, hasValue: boolean) {
    if (edited[field]) return t.sourceYou;
    if (fromExample) return t.exampleChip;
    if (!hasValue) return t.notFound;
    const pct = confidence === undefined ? null : confidencePercent(confidence);
    const from = prefill?.source === "url" ? t.sourcePage : t.sourceText;
    return pct === null ? from : `${from} · ${t.sure.replace("{n}", String(pct))}`;
  }

  if (mode === "source" || mode === "reading" || mode === "error") {
    return (
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-serif text-2xl font-medium text-[var(--fd-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25"
          >
            {t.heading}
          </h1>
          <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.intro}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-url" className="text-sm font-medium text-[var(--fd-ink)]">
            {t.urlLabel}
          </label>
          <input
            id="pf-url"
            value={url}
            placeholder={t.urlPlaceholder}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-text" className="text-sm font-medium text-[var(--fd-ink)]">
            {t.textLabel}
          </label>
          <textarea
            id="pf-text"
            rows={6}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            className={`${inputClass} min-h-32 py-2 leading-relaxed`}
          />
        </div>

        {mode === "error" && (
          <p role="alert" className="text-sm font-medium text-[var(--fd-error-text)]">
            {url.trim() ? t.readError : t.readErrorText}
          </p>
        )}
        {mode === "reading" && (
          <p role="status" className="text-sm text-[var(--fd-slate)]">
            {t.reading}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={mode === "reading" || (!url.trim() && !pasted.trim())}
            onClick={() => void read()}
            className={primaryClass}
          >
            {mode === "reading" ? t.reading : t.readButton}
          </button>
          <button
            type="button"
            onClick={() => {
              track("prefill_skipped");
              onSkip();
            }}
            className={ghostClass}
          >
            {t.skip}
          </button>
        </div>
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.privacyNote}</p>

        <div className="flex flex-col gap-2 border-t border-[var(--fd-line)] pt-4">
          <span className="text-sm font-medium text-[var(--fd-ink)]">{t.exampleHeading}</span>
          <button type="button" onClick={startFromExample} className={`${ghostClass} text-left`}>
            {t.exampleButton}
          </button>
          <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.exampleNote}</p>
        </div>
      </section>
    );
  }

  if (!values || (!prefill && !fromExample)) return null;

  const fields: {
    key: keyof PrefillApplied & ("displayName" | "location" | "signOff");
    label: string;
    confidenceKey: string;
  }[] = [
    { key: "displayName", label: t.fieldName, confidenceKey: "display_name" },
    { key: "location", label: t.fieldLocation, confidenceKey: "location" },
    { key: "signOff", label: t.fieldSignOff, confidenceKey: "sign_off" },
  ];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-serif text-2xl font-medium text-[var(--fd-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25"
        >
          {t.reviewHeading}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--fd-slate)]">
          {fromExample ? t.exampleNote : t.reviewIntro}
        </p>
      </div>

      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label htmlFor={`pf-${field.key}`} className="text-sm font-medium text-[var(--fd-ink)]">
            {field.label}
          </label>
          <input
            id={`pf-${field.key}`}
            value={values[field.key]}
            placeholder={t.notFound}
            onChange={(e) => {
              setValues({ ...values, [field.key]: e.target.value });
              if (!edited[field.key]) track("prefill_field_edited");
              setEdited((prev) => ({ ...prev, [field.key]: true }));
            }}
            className={inputClass}
          />
          <span className="text-xs text-[var(--fd-slate)]">
            {sourceLabel(
              field.key,
              prefill?.confidence[field.confidenceKey],
              Boolean(values[field.key])
            )}
          </span>
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--fd-ink)]">{t.fieldPackages}</span>
        {values.packages.length === 0 ? (
          <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.noPackagesFound}</p>
        ) : (
          values.packages.map((pkg, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-[var(--fd-line)] bg-white p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
                <input
                  aria-label={t.packageLabel}
                  value={pkg.label}
                  onChange={(e) => {
                    const next = [...values.packages];
                    next[i] = { ...pkg, label: e.target.value };
                    setValues({ ...values, packages: next });
                    markPackagesEdited();
                    setEdited((prev) => ({ ...prev, [`pkg-${i}`]: true }));
                  }}
                  className={inputClass}
                />
                <input
                  aria-label={t.packagePrice}
                  inputMode="numeric"
                  value={pkg.price}
                  placeholder={t.notFound}
                  onChange={(e) => {
                    const next = [...values.packages];
                    next[i] = { ...pkg, price: e.target.value.replace(/[^\d]/g, "") };
                    setValues({ ...values, packages: next });
                    markPackagesEdited();
                    setEdited((prev) => ({ ...prev, [`pkg-${i}`]: true }));
                  }}
                  className={inputClass}
                />
              </div>
              <span className="text-xs text-[var(--fd-slate)]">
                {sourceLabel(
                  `pkg-${i}`,
                  prefill?.packages[i]?.confidence,
                  Boolean(pkg.label)
                )}
                {!pkg.price && ` · ${t.priceMissing}`}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            track("prefill_applied");
            onApply(values);
          }}
          className={primaryClass}
        >
          {t.confirm}
        </button>
        <button
          type="button"
          onClick={() => {
            track("prefill_review_abandoned");
            onSkip();
          }}
          className={ghostClass}
        >
          {t.skip}
        </button>
      </div>
      <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.nothingSaved}</p>
    </section>
  );
}
