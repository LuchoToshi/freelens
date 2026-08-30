/**
 * Provenance and evidence (master spec §9). Eight kinds, each naming where a
 * fact came from; a null value renders "Not stated", never blank and never
 * inferred; confidence is a rounded percentage with the word "sure", never a
 * bare decimal.
 *
 * Today's producers are the readable rows: the inquiry itself (`inquiry`
 * kind), the freelancer's own configuration (`you`), and deterministic
 * calculations (`fact`). `interpretation` / `missing` / `conflict` are fully
 * modeled and consume `agent_project_evidence`-shaped rows when a server
 * surface hands them over (the table is service-role-only by design).
 */

export type ProvenanceKind =
  | "fact"
  | "you"
  | "inquiry"
  | "connected"
  | "interpretation"
  | "suggestion"
  | "missing"
  | "conflict";

export interface EvidenceItem {
  /** i18n key under inbox.evidence.fields.<field>. */
  field: string;
  kind: ProvenanceKind;
  /** Display value; null only for kind "missing" ("Not stated"). */
  value: string | null;
  /** 0–1 for interpretations; rendered as "{n}% sure". */
  confidence?: number;
  /** Both sides, for kind "conflict". */
  conflictWith?: string;
}

export interface EvidenceRowInput {
  extracted_field: string;
  value: string | null;
  confidence: number;
}

export interface EvidenceInquiryInput {
  client_email: string | null;
  event_date: string | null;
  event_type: string;
  budget_band: string;
  message: string | null;
}

/** Round to a whole percent; §9.2 forbids bare decimals. */
export function confidencePercent(confidence: number): number {
  return Math.round(Math.max(0, Math.min(1, confidence)) * 100);
}

/**
 * The facts the detail pane states about one inquiry, each with provenance.
 * The client wrote the inquiry fields (`inquiry`); an absent field is
 * `missing`, stated as such; extracted evidence rows come in as
 * `interpretation` (or `missing` when their value is null), and an
 * extraction that contradicts what the client typed is a `conflict`
 * rendering both sides.
 */
export function deriveInquiryEvidence(
  inquiry: EvidenceInquiryInput,
  evidenceRows: readonly EvidenceRowInput[] = []
): EvidenceItem[] {
  const items: EvidenceItem[] = [
    inquiry.event_date
      ? { field: "eventDate", kind: "inquiry", value: inquiry.event_date }
      : { field: "eventDate", kind: "missing", value: null },
    { field: "eventType", kind: "inquiry", value: inquiry.event_type },
    { field: "budget", kind: "inquiry", value: inquiry.budget_band },
    inquiry.client_email
      ? { field: "email", kind: "inquiry", value: inquiry.client_email }
      : { field: "email", kind: "missing", value: null },
  ];

  const typed: Record<string, string | null> = {
    event_date: inquiry.event_date,
    event_type: inquiry.event_type,
  };

  for (const row of evidenceRows) {
    if (row.value === null) {
      items.push({ field: row.extracted_field, kind: "missing", value: null });
      continue;
    }
    const typedValue = typed[row.extracted_field];
    if (typedValue && typedValue !== row.value) {
      items.push({
        field: row.extracted_field,
        kind: "conflict",
        value: row.value,
        confidence: row.confidence,
        conflictWith: typedValue,
      });
      continue;
    }
    items.push({
      field: row.extracted_field,
      kind: "interpretation",
      value: row.value,
      confidence: row.confidence,
    });
  }

  return items;
}
