"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/agent/supabase";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";
import type { VoiceProfile } from "@/lib/frontdesk/prompts";

/**
 * Step 3: paste real replies → extraction → the mirror screen. The mirror is
 * the trust move: the product says "this is how you sound" in plain language
 * and lets the freelancer correct it. Their edits overwrite the profile.
 */
const inputClass =
  "min-h-11 w-full rounded-lg border border-[var(--fl-line-control)] bg-white px-3 text-sm focus-visible:border-[var(--fl-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--fl-focus-ring)]/25 focus-visible:outline-none";
const labelClass = "text-sm font-medium text-[var(--fl-ink)]";
const primaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--fl-ink)] px-6 text-base font-medium text-white transition hover:bg-[var(--fl-ink-hover)] disabled:pointer-events-none disabled:opacity-50";
const secondaryClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--fl-line-control)] bg-white px-6 text-base font-medium text-[var(--fl-ink)] transition hover:border-[var(--fl-ink)]";

export function VoiceStep({
  locale,
  session,
  existingProfile,
  onDone,
  onBack,
}: {
  locale: FrontdeskLocale;
  session: Session;
  existingProfile: Record<string, unknown> | null;
  onDone: () => void;
  onBack: () => void;
}) {
  const t = fdDict(locale).setup.voice;
  const [samples, setSamples] = useState("");
  const [phase, setPhase] = useState<"paste" | "extracting" | "mirror" | "error">(
    existingProfile ? "mirror" : "paste"
  );
  const [profile, setProfile] = useState<VoiceProfile | null>(
    (existingProfile as VoiceProfile | null) ?? null
  );
  const [saving, setSaving] = useState(false);

  async function extract() {
    setPhase("extracting");
    try {
      const response = await fetch("/api/frontdesk/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ samples }),
      });
      const payload = (await response.json()) as { ok: boolean; profile?: VoiceProfile };
      if (!payload.ok || !payload.profile) {
        setPhase("error");
        return;
      }
      setProfile(payload.profile);
      setPhase("mirror");
    } catch {
      setPhase("error");
    }
  }

  async function confirm() {
    if (!profile) return;
    setSaving(true);
    const sb = supabaseBrowser();
    // The freelancer's edits win: whatever is on screen becomes the profile.
    await sb.from("freelancers").update({ voice_profile: profile }).eq("auth_user_id", session.user.id);
    setSaving(false);
    onDone();
  }

  function set<K extends keyof VoiceProfile>(key: K, value: VoiceProfile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  }

  if (phase === "mirror" && profile) {
    return (
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">
            {t.mirrorHeading}
          </h1>
          <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{t.mirrorHint}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vp-tone" className={labelClass}>{t.tone}</label>
          <input id="vp-tone" value={profile.tone} onChange={(e) => set("tone", e.target.value)} className={inputClass} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vp-formality" className={labelClass}>{t.formality}</label>
            <select id="vp-formality" value={profile.formality} onChange={(e) => set("formality", e.target.value as VoiceProfile["formality"])} className={inputClass}>
              {(["informal", "neutral", "formal"] as const).map((v) => (
                <option key={v} value={v}>{t.formalityOptions[v]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vp-length" className={labelClass}>{t.sentenceLength}</label>
            <select id="vp-length" value={profile.sentence_length} onChange={(e) => set("sentence_length", e.target.value as VoiceProfile["sentence_length"])} className={inputClass}>
              {(["short", "medium", "long"] as const).map((v) => (
                <option key={v} value={v}>{t.sentenceOptions[v]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vp-emoji" className={labelClass}>{t.emoji}</label>
            <select id="vp-emoji" value={profile.emoji} onChange={(e) => set("emoji", e.target.value as VoiceProfile["emoji"])} className={inputClass}>
              {(["never", "rare", "frequent"] as const).map((v) => (
                <option key={v} value={v}>{t.emojiOptions[v]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vp-greeting" className={labelClass}>{t.greeting}</label>
            <input id="vp-greeting" value={profile.greeting_style} onChange={(e) => set("greeting_style", e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vp-closing" className={labelClass}>{t.closing}</label>
            <input id="vp-closing" value={profile.closing_habit} onChange={(e) => set("closing_habit", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vp-signoff" className={labelClass}>{t.signOff}</label>
            <input id="vp-signoff" value={profile.sign_off} onChange={(e) => set("sign_off", e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vp-notes" className={labelClass}>{t.notes}</label>
            <input id="vp-notes" value={profile.language_notes} onChange={(e) => set("language_notes", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vp-quirks" className={labelClass}>{t.quirks}</label>
          <input
            id="vp-quirks"
            value={profile.quirks.join(" · ")}
            onChange={(e) => set("quirks", e.target.value.split("·").map((q) => q.trim()).filter(Boolean).slice(0, 3))}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPhase("paste")} className={secondaryClass}>
            {fdDict(locale).setup.back}
          </button>
          <button type="button" disabled={saving} onClick={confirm} className={primaryClass}>
            {t.confirm}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-medium text-[var(--fl-ink)]">{t.heading}</h1>
        <p className="text-sm leading-relaxed text-[var(--fl-slate)]">{t.hint}</p>
      </div>
      <textarea
        aria-label={t.heading}
        rows={12}
        value={samples}
        placeholder={t.placeholder}
        onChange={(e) => setSamples(e.target.value)}
        className={`${inputClass} min-h-56 py-2 leading-relaxed`}
      />
      {phase === "error" && (
        <p className="text-sm font-medium text-[var(--fl-short-text)]" role="alert">{t.error}</p>
      )}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className={secondaryClass}>
          {fdDict(locale).setup.back}
        </button>
        <button
          type="button"
          disabled={phase === "extracting" || samples.trim().length < 100}
          onClick={extract}
          className={primaryClass}
        >
          {phase === "extracting" ? t.extracting : t.extract}
        </button>
      </div>
    </section>
  );
}
