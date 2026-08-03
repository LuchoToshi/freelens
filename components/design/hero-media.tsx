"use client";

import { useReducedMotion } from "framer-motion";
import { useT } from "@/components/i18n/locale-provider";

/**
 * Hero media slot (audit L1). Structurally complete so a real editorial
 * photograph or muted loop of a working creative can be dropped in later without
 * a redesign, see docs/design-audit/ASSET-BRIEF.md.
 *
 * Until a licensed asset exists, it renders a *designed* placeholder built from
 * the Freelens allocation palette and the "every euro has a job" label motif
 * (audit L4), never generic stock. When `poster`/`src` are provided it renders
 * responsive media instead; a muted loop falls back to its poster under
 * `prefers-reduced-motion`.
 */
export function HeroMedia({
  src,
  poster,
  alt,
  className = "",
}: {
  /** Optional real asset: an image URL, or a video URL (.mp4/.webm) with `poster`. */
  src?: string;
  poster?: string;
  alt?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const isVideo = !!src && /\.(mp4|webm)$/i.test(src);

  return (
    <div
      className={`relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-[var(--fl-surface-stage)] ${className}`}
    >
      {src ? (
        isVideo && !reduce ? (
          <video
            className="size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={poster}
            aria-label={alt}
          >
            <source src={src} />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={isVideo ? (poster ?? "") : src}
            alt={alt ?? ""}
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )
      ) : (
        <DesignedPlaceholder />
      )}
    </div>
  );
}

/** Editorial allocation-motif fallback: stacked color fields + caption labels. */
function DesignedPlaceholder() {
  const t = useT();
  const bands = [
    { label: t.app.allocation.vat, color: "var(--fl-vat-fill)", grow: 21 },
    { label: t.app.allocation.reserve, color: "var(--fl-reserve-fill)", grow: 30 },
    { label: t.app.allocation.business, color: "var(--fl-costs-fill)", grow: 12 },
    { label: t.app.allocation.yours, color: "var(--fl-payout-fill)", grow: 37 },
  ];
  return (
    <div className="absolute inset-0 flex flex-col" aria-hidden="true">
      {bands.map((b) => (
        <div
          key={b.label}
          className="relative flex items-end"
          style={{ flexGrow: b.grow, backgroundColor: b.color }}
        >
          <span className="m-3 rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--fl-ink)]">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}
