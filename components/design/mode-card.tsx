"use client";

import type { ComponentType, SVGProps } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Reusable mode card (audit M1 / Signature D). Turns a calculator mode into a
 * bold, color-coded, numbered workspace card with its own accent, icon, and a
 * distinct active state — while preserving correct `role="tab"` semantics for
 * use inside a tablist. Active state uses two cues (accent fill bar + tinted
 * surface + bolder text), never color alone.
 */
export interface ModeAccent {
  /** Saturated accent (e.g. "var(--fl-vat-fill)"). */
  fill: string;
  /** Quiet surface tint for the active state. */
  tint: string;
  /** AA-legible text/icon color on canvas or tint. */
  text: string;
}

export function ModeCard({
  index,
  title,
  description,
  icon: Icon,
  accent,
  active,
  id,
  controls,
  onSelect,
}: {
  index: number;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent: ModeAccent;
  active: boolean;
  id: string;
  controls: string;
  onSelect: () => void;
}) {
  const reduce = useReducedMotion();
  const number = String(index).padStart(2, "0");

  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      className={`group relative flex min-h-12 flex-col gap-1 overflow-hidden rounded-xl border p-4 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
        active
          ? "border-transparent shadow-sm"
          : "border-[var(--fl-line)] bg-transparent hover:border-[color-mix(in_oklab,var(--fl-ink)_35%,transparent)]"
      }`}
      style={active ? { backgroundColor: accent.tint } : undefined}
    >
      {/* Accent bar — the second (non-color-alone) active cue. */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 origin-left"
        style={{ backgroundColor: accent.fill }}
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="flex items-center justify-between">
        <span
          className="fl-tnum text-xs font-semibold"
          style={{ color: active ? accent.text : "var(--fl-slate)" }}
        >
          {number}
        </span>
        <span style={{ color: active ? accent.text : "var(--fl-slate)" }}>
          <Icon className="size-4" aria-hidden={true} />
        </span>
      </div>
      <span
        className={`text-sm font-semibold ${active ? "" : "text-[var(--fl-slate)]"}`}
        style={active ? { color: accent.text } : undefined}
      >
        {title}
      </span>
      <span className="text-xs text-[var(--fl-slate)]">{description}</span>
    </button>
  );
}
