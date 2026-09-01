import { describe, expect, it } from "vitest";
import { deriveActivity } from "@/lib/frontdesk/activity";

const INQUIRY = { id: "i1", client_name: "Lisa de Jong", created_at: "2026-08-28T09:00:00Z" };

describe("activity log (§28): derived, plain, free of sensitive content", () => {
  it("an inquiry, its draft, and an approval become three ordered entries", () => {
    const entries = deriveActivity(
      [INQUIRY],
      [
        {
          inquiry_id: "i1",
          kind: "reply",
          created_at: "2026-08-28T09:01:00Z",
          outcome: "edited",
          outcome_at: "2026-08-28T10:00:00Z",
          body: "Hi Lisa, ...",
        },
      ]
    );
    expect(entries.map((e) => e.type)).toEqual([
      "draft.approved",
      "draft.ready",
      "inquiry.received",
    ]);
  });

  it("a dismissal carries its reason code, never the draft content", () => {
    const entries = deriveActivity(
      [INQUIRY],
      [
        {
          inquiry_id: "i1",
          kind: "reply",
          created_at: "2026-08-28T09:01:00Z",
          outcome: "skipped",
          outcome_at: "2026-08-28T09:30:00Z",
          dismiss_reason: "wrong_timing",
          body: "Hi Lisa, secret draft text",
        },
      ]
    );
    const dismissed = entries.find((e) => e.type === "draft.dismissed");
    expect(dismissed?.reason).toBe("wrong_timing");
    expect(JSON.stringify(entries)).not.toContain("secret draft text");
  });

  it("a nudge draft is a proposed follow-up; an empty body is never a prepared draft", () => {
    const entries = deriveActivity(
      [INQUIRY],
      [
        { inquiry_id: "i1", kind: "nudge", created_at: "2026-08-29T08:00:00Z", outcome: null, body: "Hoi Lisa!" },
        { inquiry_id: "i1", kind: "reply", created_at: "2026-08-28T09:01:00Z", outcome: null, body: "" },
      ]
    );
    expect(entries.map((e) => e.type)).toEqual(["followup.proposed", "inquiry.received"]);
  });

  it("an outcome without a timestamp is not narrated with an invented one", () => {
    const entries = deriveActivity(
      [INQUIRY],
      [
        { inquiry_id: "i1", kind: "reply", created_at: "2026-08-28T09:01:00Z", outcome: "sent_as_is", outcome_at: null, body: "Hi" },
      ]
    );
    expect(entries.some((e) => e.type === "draft.approved")).toBe(false);
  });
});

describe("the log is the freelancer's own history (not the product's demo)", () => {
  it("leaves the onboarding sample out entirely", () => {
    const entries = deriveActivity(
      [
        { id: "real", client_name: "Noor", created_at: "2026-08-20T10:00:00Z", source: "form" },
        { id: "sample", client_name: "Lisa (example)", created_at: "2026-08-21T10:00:00Z", source: "sample" },
      ],
      [
        { inquiry_id: "real", kind: "reply", created_at: "2026-08-20T10:01:00Z", outcome: null, body: "Hi Noor" },
        { inquiry_id: "sample", kind: "reply", created_at: "2026-08-21T10:01:00Z", outcome: null, body: "Hi Lisa" },
      ],
    );
    expect(entries.map((e) => e.clientName)).toEqual(["Noor", "Noor"]);
    expect(entries.some((e) => e.clientName.includes("example"))).toBe(false);
  });

  it("still shows rows that carry no source, which predate the field", () => {
    const entries = deriveActivity(
      [{ id: "old", client_name: "Sam", created_at: "2026-08-01T10:00:00Z" }],
      [],
    );
    expect(entries).toHaveLength(1);
  });
});
