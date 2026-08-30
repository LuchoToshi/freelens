import { describe, expect, it } from "vitest";
import {
  confidencePercent,
  deriveInquiryEvidence,
  type EvidenceInquiryInput,
} from "@/lib/frontdesk/provenance";

const INQUIRY: EvidenceInquiryInput = {
  client_email: "lisa@example.com",
  event_date: "2027-06-12",
  event_type: "wedding",
  budget_band: "2500+",
  message: "We are getting married!",
};

describe("provenance (§9): every fact names its source, nulls are Not stated", () => {
  it("inquiry fields carry the inquiry kind", () => {
    const items = deriveInquiryEvidence(INQUIRY);
    expect(items.map((i) => [i.field, i.kind])).toEqual([
      ["eventDate", "inquiry"],
      ["eventType", "inquiry"],
      ["budget", "inquiry"],
      ["email", "inquiry"],
    ]);
  });

  it("absent fields become missing with a null value, never blank or inferred", () => {
    const items = deriveInquiryEvidence({ ...INQUIRY, client_email: null, event_date: null });
    expect(items.find((i) => i.field === "email")).toEqual({
      field: "email",
      kind: "missing",
      value: null,
    });
    expect(items.find((i) => i.field === "eventDate")?.kind).toBe("missing");
  });

  it("an extracted row with a null value is missing, not a guess (§8.1)", () => {
    const items = deriveInquiryEvidence(INQUIRY, [
      { extracted_field: "guest_count", value: null, confidence: 0.4 },
    ]);
    expect(items.at(-1)).toEqual({ field: "guest_count", kind: "missing", value: null });
  });

  it("an extraction carries its confidence as an interpretation", () => {
    const items = deriveInquiryEvidence(INQUIRY, [
      { extracted_field: "venue", value: "Beach club Zandvoort", confidence: 0.82 },
    ]);
    expect(items.at(-1)).toEqual({
      field: "venue",
      kind: "interpretation",
      value: "Beach club Zandvoort",
      confidence: 0.82,
    });
  });

  it("an extraction contradicting a typed field is a conflict showing both sides", () => {
    const items = deriveInquiryEvidence(INQUIRY, [
      { extracted_field: "event_date", value: "2027-07-01", confidence: 0.7 },
    ]);
    expect(items.at(-1)).toMatchObject({
      kind: "conflict",
      value: "2027-07-01",
      conflictWith: "2027-06-12",
    });
  });

  it("confidence renders as a rounded whole percent, never a bare decimal", () => {
    expect(confidencePercent(0.824)).toBe(82);
    expect(confidencePercent(1.7)).toBe(100);
    expect(confidencePercent(-0.2)).toBe(0);
  });
});
