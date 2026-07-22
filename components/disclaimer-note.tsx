/**
 * The calm accuracy disclaimer shown near every result — not hidden in the
 * footer. Wording is fixed; `className` only adjusts spacing/placement.
 */
export function DisclaimerNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-[var(--fl-slate)] ${className}`}>
      Freelens provides planning estimates based on the information and reserve
      rules you enter. It does not calculate your final tax assessment and is not
      tax advice.
    </p>
  );
}
