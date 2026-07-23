import { ConfidenceBlock } from "@/components/design/confidence-block";

/**
 * The calm accuracy disclaimer shown near every result, not hidden in the
 * footer. Now rendered through the shared {@link ConfidenceBlock}: one warm
 * sentence up front, with the full planning-estimate caveat preserved verbatim
 * behind "How this estimate works". `className` only adjusts spacing/placement.
 */
export function DisclaimerNote({ className = "" }: { className?: string }) {
  return (
    <ConfidenceBlock
      className={className}
      detail={
        <>
          Freelens provides planning estimates based on the information and
          reserve rules you enter. It does not calculate your final tax
          assessment and is not tax advice.
        </>
      }
    />
  );
}
