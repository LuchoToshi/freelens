"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { track } from "@/lib/analytics";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import { resolveInitialLocale } from "@/components/i18n/locale-provider";
import { isValidHandle } from "@/lib/frontdesk/handles";
import type { FreelancerRow } from "@/components/frontdesk/auth-gate";
import { VoiceStep } from "@/components/frontdesk/voice-step";
import { RevealStep } from "@/components/frontdesk/reveal-step";
import { ShareStep } from "@/components/frontdesk/share-step";
import { ProfessionPicker, type Profession } from "@/components/frontdesk/profession-picker";

/**
 * Onboarding, four steps, nothing external. The locale question comes first
 * because it decides the language of everything after it — including this
 * wizard, which re-renders in the chosen locale immediately.
 */
export interface AddonRow {
  label: string;
  price: string;
}

export interface PackageRow {
  id?: string;
  label: string;
  price: string;
  unit: string;
  notes: string;
  addons: AddonRow[];
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-[var(--fd-line-control)] bg-white px-3 text-sm focus-visible:border-[var(--fd-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)]/25 focus-visible:outline-none";
const labelClass = "text-sm font-medium text-[var(--fd-ink)]";
const primaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fd-ink)] px-6 text-base font-medium text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50";
const secondaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--fd-line-control)] bg-white px-6 text-base font-medium text-[var(--fd-ink)] transition hover:border-[var(--fd-ink)]";

// Matches the input's `accept` attribute and the "up to 2MB" copy below.
const PHOTO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export function SetupWizard({
  session,
  freelancer,
  onFreelancerChanged,
}: {
  session: Session;
  freelancer: FreelancerRow | null;
  onFreelancerChanged: () => void;
}) {
  const [step, setStep] = useState(freelancer ? 1 : 0);
  // A returning freelancer's stored locale is authoritative. A brand-new
  // signup has none yet: default to English for the SSR-safe first render,
  // then detect the browser's language once mounted, same rule the site-wide
  // provider uses. A global product that greets a stranger in Dutch is a bug.
  const [locale, setLocale] = useState<FrontdeskLocale>(freelancer?.locale ?? "en");
  const [handle, setHandle] = useState(freelancer?.handle ?? "");
  const [displayName, setDisplayName] = useState(freelancer?.display_name ?? "");
  const [professions, setProfessions] = useState<Profession[]>(
    (freelancer?.professions as Profession[] | null | undefined)?.length
      ? (freelancer!.professions as Profession[])
      : freelancer?.craft
        ? [freelancer.craft]
        : []
  );
  const [city, setCity] = useState(freelancer?.location ?? freelancer?.city ?? "");
  const [signOff, setSignOff] = useState(freelancer?.sign_off ?? "");
  const [photoUrl, setPhotoUrl] = useState(freelancer?.photo_url ?? "");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<"" | "type" | "size" | "generic">("");
  const [freelancerId, setFreelancerId] = useState(freelancer?.id ?? null);
  const [packages, setPackages] = useState<PackageRow[]>([
    { label: "", price: "", unit: "", notes: "", addons: [] },
  ]);
  const [saving, setSaving] = useState(false);
  // How many times the reveal has been entered: from the second visit on,
  // the sample draft is regenerated so voice edits are visibly cause→effect.
  const [revealVisits, setRevealVisits] = useState(0);
  const [error, setError] = useState<"" | "handle" | "generic" | "packages">("");

  const t = fdDict(locale).setup;
  const sb = supabaseBrowser();

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (freelancer?.locale) return; // stored preference wins, nothing to detect
    setLocale(resolveInitialLocale(null, window.navigator?.language ?? ""));
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, on mount, for a first-time signup only
  }, []);

  useEffect(() => {
    if (!freelancerId) return;
    sb.from("packages")
      .select("id, label, price_from_eur, unit, notes, addons")
      .eq("freelancer_id", freelancerId)
      .order("position")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPackages(
            data.map((p) => ({
              id: p.id,
              label: p.label,
              price: String(p.price_from_eur),
              unit: p.unit ?? "",
              notes: p.notes ?? "",
              addons: (Array.isArray(p.addons) ? p.addons : [])
                .filter(
                  (a: { label?: unknown; price_eur?: unknown }) =>
                    typeof a.label === "string" && typeof a.price_eur === "number"
                )
                .map((a: { label: string; price_eur: number }) => ({
                  label: a.label,
                  price: String(a.price_eur),
                })),
            }))
          );
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per freelancer
  }, [freelancerId]);

  async function saveProfile() {
    if (!isValidHandle(handle) ) {
      setError("handle");
      return;
    }
    if (!displayName.trim()) {
      setError("generic");
      return;
    }
    if (professions.length === 0) {
      setError("generic");
      return;
    }
    setSaving(true);
    setError("");
    const location = city.trim() || null;
    const { data, error: upsertError } = await sb
      .from("freelancers")
      .upsert(
        {
          auth_user_id: session.user.id,
          handle,
          display_name: displayName.trim(),
          // craft/city are kept in sync for consumers that have not moved to
          // professions/location yet (WP4, phase 1 - see 0008 migration).
          craft: professions[0],
          city: location,
          primary_profession: professions[0],
          professions,
          location,
          locale,
          sign_off: signOff.trim() || null,
          photo_url: photoUrl || null,
        },
        { onConflict: "auth_user_id" }
      )
      .select("id")
      .single();
    setSaving(false);
    if (upsertError || !data) {
      setError(upsertError?.code === "23505" ? "handle" : "generic");
      return;
    }
    setFreelancerId(data.id);
    onFreelancerChanged();
    setStep(2);
  }

  async function savePackages() {
    const valid = packages.filter((p) => p.label.trim() && Number(p.price) > 0);
    if (valid.length === 0 || !freelancerId) {
      setError("packages");
      return;
    }
    setSaving(true);
    setError("");
    await sb.from("packages").delete().eq("freelancer_id", freelancerId);
    const { error: insertError } = await sb.from("packages").insert(
      valid.map((p, i) => ({
        freelancer_id: freelancerId,
        label: p.label.trim(),
        price_from_eur: Number(p.price),
        unit: p.unit.trim() || null,
        notes: p.notes.trim() || null,
        position: i,
        addons: p.addons
          .filter((a) => a.label.trim() && Number(a.price) > 0)
          .map((a) => ({ label: a.label.trim(), price_eur: Number(a.price) })),
      }))
    );
    setSaving(false);
    if (insertError) {
      setError("generic");
      return;
    }
    setStep(3);
  }

  async function uploadPhoto(file: File) {
    setPhotoError("");
    // Checked here, not just left to the storage policy, so the freelancer
    // hears the real cause: "wrong type" and "too large" are both silently
    // identical to a network drop once they only reach the server.
    if (!PHOTO_ALLOWED_TYPES.includes(file.type)) {
      setPhotoError("type");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoError("size");
      return;
    }
    setPhotoBusy(true);
    const path = `${session.user.id}/avatar`;
    const { error: uploadError } = await sb.storage
      .from("frontdesk-avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      console.error("Avatar upload failed:", uploadError.message);
      setPhotoBusy(false);
      setPhotoError("generic");
      return;
    }
    const { data } = sb.storage.from("frontdesk-avatars").getPublicUrl(path);
    setPhotoUrl(`${data.publicUrl}?v=${Date.now()}`);
    setPhotoBusy(false);
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      {step >= 1 && (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fd-slate)]">
          {t.stepOf.replace("{n}", String(Math.min(step === 35 ? 3 : step, 4)))}
        </p>
      )}

      {step === 0 && (
        <section className="flex flex-col gap-5">
          <h1 className="font-serif text-3xl font-medium leading-tight text-[var(--fd-ink)]">
            {t.welcome.heading}
          </h1>
          <div className="flex flex-col gap-3">
            {[t.welcome.line1, t.welcome.line2, t.welcome.line3].map((line, i) => (
              <p key={i} className="text-base leading-relaxed text-[var(--fd-slate)]">
                {line}
              </p>
            ))}
          </div>
          <button type="button" onClick={() => setStep(1)} className={`${primaryClass} w-fit`}>
            {t.welcome.cta}
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">
              {t.profile.heading}
            </h1>
            <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.profile.clientsSee}</p>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className={labelClass}>{t.profile.localeLabel}</legend>
            <div className="flex gap-2">
              {(["nl", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={locale === l}
                  onClick={() => setLocale(l)}
                  className={`min-h-11 rounded-lg border px-4 text-sm font-semibold transition ${
                    locale === l
                      ? "border-[var(--fd-ink)] bg-[var(--fd-ink)] text-white"
                      : "border-[var(--fd-line-control)] bg-white text-[var(--fd-ink)]"
                  }`}
                >
                  {l === "nl" ? "Nederlands" : "English"}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="su-handle" className={labelClass}>{t.profile.handleLabel}</label>
            <input
              id="su-handle"
              value={handle}
              maxLength={30}
              onChange={(e) => setHandle(e.target.value.toLowerCase().trim())}
              className={inputClass}
            />
            <p className="text-xs text-[var(--fd-slate)]">{t.profile.handleHint}</p>
            {error === "handle" && (
              <p className="text-xs font-medium text-[var(--fd-error-text)]" role="alert">
                {t.profile.handleTaken}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="su-name" className={labelClass}>{t.profile.nameLabel}</label>
            <input id="su-name" value={displayName} maxLength={80} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
          </div>

          <ProfessionPicker locale={locale} value={professions} onChange={setProfessions} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="su-city" className={labelClass}>{t.profile.cityLabel}</label>
            <input id="su-city" value={city} maxLength={80} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="su-signoff" className={labelClass}>{t.profile.signOffLabel}</label>
            <input id="su-signoff" value={signOff} maxLength={60} onChange={(e) => setSignOff(e.target.value)} className={inputClass} />
            <p className="text-xs text-[var(--fd-slate)]">{t.profile.signOffHint}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>{t.profile.photoLabel}</span>
            <div className="flex items-center gap-3">
              {photoUrl && (
                <Image src={photoUrl} alt="" width={56} height={56} className="size-14 rounded-full border border-[var(--fd-line)] object-cover" />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label={t.profile.photoLabel}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadPhoto(file);
                }}
                className="text-sm text-[var(--fd-slate)]"
              />
            </div>
            {photoBusy && <p className="text-xs text-[var(--fd-slate)]">{t.profile.photoUploading}</p>}
            {photoError && (
              <p className="text-xs font-medium text-[var(--fd-error-text)]" role="alert">
                {photoError === "type"
                  ? t.profile.photoErrorType
                  : photoError === "size"
                    ? t.profile.photoErrorSize
                    : t.profile.photoError}
              </p>
            )}
          </div>

          {error === "generic" && (
            <p className="text-sm font-medium text-[var(--fd-error-text)]" role="alert">
              {fdDict(locale).auth.error}
            </p>
          )}
          <button type="button" disabled={saving || photoBusy} onClick={saveProfile} className={primaryClass}>
            {t.save}
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-2xl font-medium text-[var(--fd-ink)]">
              {t.packages.heading}
            </h1>
            <p className="text-sm leading-relaxed text-[var(--fd-slate)]">{t.packages.hint}</p>
          </div>

          {packages.map((p, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border border-[var(--fd-line)] bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`pk-label-${i}`} className={labelClass}>{t.packages.labelLabel}</label>
                  <input id={`pk-label-${i}`} value={p.label} maxLength={120} onChange={(e) => setPackages((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`pk-price-${i}`} className={labelClass}>{t.packages.priceLabel}</label>
                  <input id={`pk-price-${i}`} inputMode="numeric" value={p.price} onChange={(e) => setPackages((prev) => prev.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/[^\d]/g, "") } : x)))} className={inputClass} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`pk-unit-${i}`} className={labelClass}>{t.packages.unitLabel}</label>
                  <input id={`pk-unit-${i}`} value={p.unit} maxLength={40} placeholder={t.packages.unitPlaceholder} onChange={(e) => setPackages((prev) => prev.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)))} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`pk-notes-${i}`} className={labelClass}>{t.packages.notesLabel}</label>
                  <input id={`pk-notes-${i}`} value={p.notes} maxLength={500} placeholder={t.packages.notesPlaceholder} onChange={(e) => setPackages((prev) => prev.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))} className={inputClass} />
                </div>
              </div>
              {p.addons.map((a, k) => (
                <div key={k} className="grid gap-3 pl-4 sm:grid-cols-[1fr_8rem_auto]">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`pk-addon-label-${i}-${k}`} className={labelClass}>
                      {t.packages.addonLabel}
                    </label>
                    <input
                      id={`pk-addon-label-${i}-${k}`}
                      value={a.label}
                      maxLength={120}
                      onChange={(e) =>
                        setPackages((prev) =>
                          prev.map((x, j) =>
                            j === i
                              ? { ...x, addons: x.addons.map((y, l) => (l === k ? { ...y, label: e.target.value } : y)) }
                              : x
                          )
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`pk-addon-price-${i}-${k}`} className={labelClass}>
                      {t.packages.priceExactLabel}
                    </label>
                    <input
                      id={`pk-addon-price-${i}-${k}`}
                      inputMode="numeric"
                      value={a.price}
                      onChange={(e) =>
                        setPackages((prev) =>
                          prev.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  addons: x.addons.map((y, l) =>
                                    l === k ? { ...y, price: e.target.value.replace(/[^\d]/g, "") } : y
                                  ),
                                }
                              : x
                          )
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPackages((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, addons: x.addons.filter((_, l) => l !== k) } : x))
                      )
                    }
                    className="self-end pb-2.5 text-sm font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]"
                  >
                    {t.packages.remove}
                  </button>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPackages((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, addons: [...x.addons, { label: "", price: "" }] } : x))
                    )
                  }
                  className="w-fit text-sm font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]"
                >
                  {t.packages.addonAdd}
                </button>
                {packages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPackages((prev) => prev.filter((_, j) => j !== i))}
                    className="w-fit text-sm font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4 hover:text-[var(--fd-ink)]"
                  >
                    {t.packages.remove}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setPackages((prev) => [...prev, { label: "", price: "", unit: "", notes: "", addons: [] }])}
            className={`${secondaryClass} w-fit`}
          >
            {t.packages.add}
          </button>

          {error === "packages" && (
            <p className="text-sm font-medium text-[var(--fd-error-text)]" role="alert">
              {t.packages.needOne}
            </p>
          )}
          {error === "generic" && (
            <p className="text-sm font-medium text-[var(--fd-error-text)]" role="alert">
              {fdDict(locale).auth.error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep(1)} className={secondaryClass}>
              {t.back}
            </button>
            <button type="button" disabled={saving} onClick={savePackages} className={primaryClass}>
              {t.save}
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <VoiceStep
          locale={locale}
          session={session}
          existingProfile={freelancer?.voice_profile ?? null}
          onDone={() => {
            track("voice_confirmed");
            onFreelancerChanged();
            setRevealVisits((n) => n + 1);
            setStep(35);
          }}
          onBack={() => setStep(2)}
        />
      )}

      {step === 35 && (
        <RevealStep
          key={revealVisits}
          locale={locale}
          session={session}
          regenerate={revealVisits > 1}
          onContinue={() => {
            track("setup_completed");
            setStep(4);
          }}
          onAdjust={() => setStep(3)}
        />
      )}

      {step === 4 && <ShareStep locale={locale} handle={handle} />}
    </main>
  );
}
