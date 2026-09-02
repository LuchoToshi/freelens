"use client";

import { useState } from "react";
import Image from "next/image";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import {
  ACCENTS,
  appearanceStyle,
  accentTextColor,
  DEFAULT_APPEARANCE,
  isDefaultAppearance,
  parseAppearance,
  serializeAppearance,
  THEMES,
  TONES,
  type Appearance,
} from "@/lib/frontdesk/appearance";

const PHOTO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Page Appearance (handoff §11): three choices and a preview of the real
 * page, entered from setup and never in front of a setup decision. What is
 * deliberately absent is the rest of a theme editor: no fonts, no layout, no
 * per-section styling. The preview uses the same tokens the public page
 * uses, so what it shows is what publishes.
 */
export function AppearanceCard({
  session,
  locale,
  displayName,
  stored,
}: {
  session: Session;
  locale: FrontdeskLocale;
  displayName: string;
  stored: unknown;
}) {
  const t = fdDict(locale).setup.appearance;
  const sb = supabaseBrowser();
  const [appearance, setAppearance] = useState<Appearance>(() => parseAppearance(stored));
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<"" | "type" | "size" | "generic">("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  async function apply(next: Appearance) {
    const previous = appearance;
    setAppearance(next);
    setSaved(false);
    setSaveError(false);
    setBusy(true);
    const { error } = await sb
      .from("freelancers")
      .update({ appearance: serializeAppearance(next) })
      .eq("auth_user_id", session.user.id);
    setBusy(false);
    if (error) {
      setAppearance(previous);
      setSaveError(true);
      return;
    }
    setSaved(true);
  }

  async function uploadCover(file: File) {
    setUploadError("");
    if (!PHOTO_ALLOWED_TYPES.includes(file.type)) return setUploadError("type");
    if (file.size > PHOTO_MAX_BYTES) return setUploadError("size");
    setBusy(true);
    const path = `${session.user.id}/cover`;
    const { error } = await sb.storage
      .from("frontdesk-avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      console.error("Cover upload failed:", error.message);
      setBusy(false);
      setUploadError("generic");
      return;
    }
    const { data } = sb.storage.from("frontdesk-avatars").getPublicUrl(path);
    await apply({ ...appearance, coverUrl: `${data.publicUrl}?v=${Date.now()}` });
  }

  return (
    <details className="rounded-2xl border border-[var(--fd-line)] bg-white px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--fd-ink)]">
        {t.heading}
      </summary>
      <div className="flex flex-col gap-4 pt-3">
        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.lead}</p>

        <Swatches
          legend={t.toneLabel}
          values={TONES}
          current={appearance.tone}
          disabled={busy}
          onPick={(tone) => void apply({ ...appearance, tone })}
        />
        <Swatches
          legend={t.accentLabel}
          values={ACCENTS}
          current={appearance.accent}
          disabled={busy}
          onPick={(accent) => void apply({ ...appearance, accent })}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-medium text-[var(--fd-slate)]">{t.themeLabel}</legend>
          <div className="flex gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                disabled={busy}
                aria-pressed={appearance.theme === theme}
                onClick={() => void apply({ ...appearance, theme })}
                className={`min-h-11 rounded-lg border px-4 text-sm font-medium ${
                  appearance.theme === theme
                    ? "border-[var(--fd-ink)] bg-[var(--fd-ink)] text-white"
                    : "border-[var(--fd-line-control)] bg-white text-[var(--fd-ink)]"
                }`}
              >
                {t.themes[theme]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--fd-slate)]">{t.coverLabel}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label={t.coverLabel}
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadCover(file);
            }}
            className="text-sm text-[var(--fd-slate)]"
          />
          {appearance.coverUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void apply({ ...appearance, coverUrl: null })}
              className="w-fit text-xs font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4"
            >
              {t.coverRemove}
            </button>
          )}
          {uploadError && (
            <p role="alert" className="text-xs font-medium text-[var(--fd-error-text)]">
              {uploadError === "type"
                ? t.coverErrorType
                : uploadError === "size"
                  ? t.coverErrorSize
                  : t.coverError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--fd-slate)]">{t.previewLabel}</span>
          <div
            style={appearanceStyle(appearance) as React.CSSProperties}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--fd-line)] p-5 text-center"
          >
            {appearance.coverUrl && (
              <Image
                src={appearance.coverUrl}
                alt=""
                width={320}
                height={96}
                className="h-20 w-full rounded-xl object-cover"
              />
            )}
            <span className="font-serif text-lg font-medium">{displayName}</span>
            <span className="text-xs opacity-70">{t.previewLine}</span>
            <span
              style={{
                backgroundColor: appearance.accent,
                color: accentTextColor(appearance.accent),
              }}
              className="mt-1 inline-flex min-h-9 items-center rounded-lg px-4 text-sm font-medium"
            >
              {t.previewCta}
            </span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[var(--fd-slate)]">{t.scopeNote}</p>
        {saved && !busy && (
          <p role="status" className="text-xs text-[var(--fd-slate)]">
            {t.saved}
          </p>
        )}
        {saveError && (
          <p role="alert" className="text-xs font-medium text-[var(--fd-error-text)]">
            {t.saveError}
          </p>
        )}
        {!isDefaultAppearance(appearance) && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void apply(DEFAULT_APPEARANCE)}
            className="w-fit text-xs font-medium text-[var(--fd-slate)] underline decoration-[var(--fd-line)] underline-offset-4"
          >
            {t.reset}
          </button>
        )}
      </div>
    </details>
  );
}

function Swatches<T extends string>({
  legend,
  values,
  current,
  disabled,
  onPick,
}: {
  legend: string;
  values: readonly T[];
  current: T;
  disabled: boolean;
  onPick: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-medium text-[var(--fd-slate)]">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            aria-pressed={current === value}
            aria-label={value}
            onClick={() => onPick(value)}
            style={{ backgroundColor: value }}
            className={`size-11 rounded-lg border-2 ${
              current === value ? "border-[var(--fd-ink)]" : "border-[var(--fd-line)]"
            }`}
          />
        ))}
      </div>
    </fieldset>
  );
}
