import { ShieldCheck } from "lucide-react";

/**
 * FrontDesk's confidence block: the fd-token sibling of the core app's
 * ConfidenceBlock (components/design/confidence-block.tsx). Same trust
 * pattern (a quiet shield mark plus one warm plain-language sentence),
 * re-drawn on the --fd-* palette because FrontDesk surfaces never load the
 * --fl-* system.
 *
 * Copy discipline: every sentence rendered through this block must be
 * literally true of the pipeline. Drafts never invent prices and never claim
 * availability because draftGuards.ts rejects them, not because we hope so;
 * voice samples ARE stored (voice/route.ts), so no sentence may say
 * otherwise.
 */
export function TrustNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--fd-line)] bg-[var(--fd-paper-dim)] p-4">
      <ShieldCheck
        className="mt-0.5 size-5 shrink-0 text-[var(--fd-success-text)]"
        aria-hidden="true"
      />
      <p className="text-sm leading-relaxed text-[var(--fd-ink)]">{children}</p>
    </div>
  );
}
