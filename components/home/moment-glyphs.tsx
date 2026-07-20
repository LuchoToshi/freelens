import type { SVGProps } from "react";

/**
 * Bespoke line marks for the Moments section — deliberately not a generic
 * icon library. Shared stroke conventions: 32x32 viewBox, 1.5px stroke,
 * round caps/joins, no fill, currentColor.
 */

function GlyphBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function PaymentLandedGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <GlyphBase {...props}>
      <circle cx="16" cy="12" r="6.5" />
      <path d="M16 9.5v5M13.8 12.2l2.2 2.2 2.2-2.2" />
      <path d="M6 24c2.5-2 5-3 10-3s7.5 1 10 3" />
    </GlyphBase>
  );
}

export function CheckFirstGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <GlyphBase {...props}>
      <rect x="7" y="6" width="18" height="20" rx="3" />
      <path d="M12 16l3 3 5-6" />
    </GlyphBase>
  );
}

export function SundayCheckinGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <GlyphBase {...props}>
      <circle cx="16" cy="16" r="9.5" />
      <path d="M16 10.5V16l4 2.5" />
    </GlyphBase>
  );
}

export function HolidayGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <GlyphBase {...props}>
      <circle cx="16" cy="12" r="4.5" />
      <path d="M16 4v2.5M9.5 8.5l1.7 1.7M22.5 8.5l-1.7 1.7" />
      <path d="M5 25c3-4 7-6 11-6s8 2 11 6" />
    </GlyphBase>
  );
}
