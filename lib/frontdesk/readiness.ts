/**
 * The readiness model (master spec §14): named requirements, never a vague
 * percentage. Pure derivation from data that already exists — progress
 * "survives leaving" because nothing here is stored; it is recomputed from
 * the same rows on every device (§14.5).
 *
 * Required items gate go-live and each names what it blocks (§14.2).
 * Optional items improve quality and never gate anything (§14.3).
 */

export interface ReadinessInputs {
  /** Packages with their exact prices, as stored. */
  packages: readonly { price_from_eur: number | null }[];
  /** The stored voice profile, null until confirmed. */
  voiceProfile: Record<string, unknown> | null;
  /** When the freelancer confirmed placing the link, if ever. */
  linkConfirmedAt: string | null;
  /** Inquiries: evidence the link is live and the loop has been walked. */
  inquiries: readonly { source: string; src_channel: string | null }[];
  /** Drafts with a recorded outcome prove a reply has been sent. */
  drafts: readonly { outcome: string | null }[];
  /** Whether the Gmail connect surface is enabled at all (CASA gate). */
  gmailAvailable: boolean;
  /** Whether a Gmail connection row exists. */
  gmailConnected: boolean;
}

export interface ReadinessItem {
  key: string;
  required: boolean;
  done: boolean;
  /** i18n key under inbox.readiness.items.<key> — label/why/blocks/action. */
}

export interface Readiness {
  required: ReadinessItem[];
  optional: ReadinessItem[];
  /** Go-live is gated on required items only (§14.5). */
  readyToGoLive: boolean;
}

export function deriveReadiness(inputs: ReadinessInputs): Readiness {
  const hasPricedPackage = inputs.packages.some(
    (p) => typeof p.price_from_eur === "number" && p.price_from_eur > 0
  );
  const hasVoice =
    inputs.voiceProfile !== null && Object.keys(inputs.voiceProfile).length > 0;
  const linkShared =
    inputs.linkConfirmedAt !== null ||
    inputs.inquiries.some((i) => i.src_channel !== null);
  const testInquiry = inputs.inquiries.some((i) => i.source === "form");
  const firstReply = inputs.drafts.some(
    (d) => d.outcome === "sent_as_is" || d.outcome === "edited"
  );

  const required: ReadinessItem[] = [
    { key: "package", required: true, done: hasPricedPackage },
    { key: "voice", required: true, done: hasVoice },
    { key: "link", required: true, done: linkShared },
  ];

  const optional: ReadinessItem[] = [
    { key: "testInquiry", required: false, done: testInquiry },
    { key: "firstReply", required: false, done: firstReply },
  ];
  if (inputs.gmailAvailable) {
    optional.push({ key: "gmail", required: false, done: inputs.gmailConnected });
  }

  return {
    required,
    optional,
    readyToGoLive: required.every((item) => item.done),
  };
}
