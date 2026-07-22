# Freelens hero media — asset brief

The hero (`components/design/hero-media.tsx`) ships with a *designed* placeholder
so the page is production-ready today. This brief specifies the real editorial
asset to commission and swap in later (audit L1). Until then, do **not** substitute
generic stock — the placeholder is intentional.

## Subject
A real creative at work, shot editorially — one of: photographer on set,
hairdresser/stylist mid-session, DJ at a console, dancer rehearsing, videographer
reviewing a take. Rotate the discipline over time. Maintain diversity across
gender presentation, ethnicity, age, and working setting.

## Composition
- Vertical/portrait crop, subject off-centre to leave a calm zone where the
  floating calculator card overlaps (card sits over the right/lower third).
- Editorial, in-the-moment — not posed stock, no laptops/coffee/office clichés,
  no finance iconography.

## Lighting & palette
- Warm, natural, slightly filmic. Should sit against the `#faf9f6` canvas and the
  navy/gold/indigo/green/terracotta functional palette without clashing.
- Avoid neon or heavy saturation that fights the allocation colors.

## Crops required
- Desktop: portrait ~4:5, delivered at 2× (target render ~640×800 CSS px).
- Mobile (375px): a tighter crop that still reads as the subject, not background
  noise — provide an `art-directed` narrower crop, not just a downscale.

## Still / loop / poster
- Preferred: a short **muted loop** (4–8s, seamless), plus a **poster** still.
- The loop must be silent, `muted loop playsInline`, and fall back to the poster
  under `prefers-reduced-motion` (already handled by `HeroMedia`).
- Also deliver a standalone still for the image-only path.

## Formats & performance budget
- Loop: `.webm` (VP9/AV1) + `.mp4` (H.264) fallback, ≤ ~1.5 MB each after
  compression; poster as optimized `.jpg`/`.avif`.
- Still: responsive `.avif`/`.webp` with `.jpg` fallback.
- Hero image/poster is the LCP element — prioritise its load; keep the loop
  lazy/deferred below the fold logic where applicable. Target LCP < 2.5s on 4G.

## Rights / licensing
- Fully licensed for commercial web use, model releases secured. No unlicensed
  production stills. Keep license records alongside the asset.

## Swap-in (no redesign needed)
Pass the asset to the existing component:

```tsx
<HeroMedia src="/hero/photographer.webm" poster="/hero/photographer.jpg" alt="A photographer reviewing shots on set" />
```

`HeroMedia` already handles video-vs-image detection, lazy loading, the poster
fallback, and reduced-motion. No layout changes required.
