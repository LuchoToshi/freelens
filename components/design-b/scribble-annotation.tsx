export function ScribbleUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 20"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M2 14 C 40 4, 80 18, 120 8 S 180 4, 198 12"
        stroke="#c1440e"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ScribbleArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className} aria-hidden="true" fill="none">
      <path
        d="M5 5 C 30 40, 50 10, 75 35"
        stroke="#c1440e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M60 28 L78 37 L68 20"
        stroke="#c1440e"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
