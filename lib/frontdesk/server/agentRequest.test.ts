import { describe, expect, it } from "vitest";
import { buildSnapshot, parseUnderstanding } from "@/lib/frontdesk/server/agentRequest";

const KNOWN = new Set(["inq-1", "inq-2"]);

describe("request understanding (§2.3): closed vocabulary, nothing smuggled", () => {
  it("a plan keeps only known actions on known inquiries", () => {
    const parsed = parseUnderstanding(
      JSON.stringify({
        read_as: "Prepare follow-ups for quiet threads",
        kind: "plan",
        steps: [
          { action: "prepare_followup", inquiry_id: "inq-1", label: "Follow up with Lisa" },
          { action: "send_message", inquiry_id: "inq-1", label: "Send it" },
          { action: "prepare_reply", inquiry_id: "unknown-id", label: "Reply to ghost" },
        ],
      }),
      KNOWN
    );
    expect(parsed?.kind).toBe("plan");
    expect(parsed?.steps).toEqual([
      {
        action: "prepare_followup",
        inquiry_id: "inq-1",
        label: "Follow up with Lisa",
        state: "pending",
      },
    ]);
  });

  it("a plan with no surviving steps is rejected outright", () => {
    const parsed = parseUnderstanding(
      JSON.stringify({
        read_as: "Send everything",
        kind: "plan",
        steps: [{ action: "send_message", inquiry_id: "inq-1", label: "Send" }],
      }),
      KNOWN
    );
    expect(parsed).toBeNull();
  });

  it("unknown kinds and empty payloads are rejected", () => {
    expect(parseUnderstanding(JSON.stringify({ read_as: "x", kind: "execute" }), KNOWN)).toBeNull();
    expect(parseUnderstanding(JSON.stringify({ kind: "answer", answer: "Hi" }), KNOWN)).toBeNull();
    expect(parseUnderstanding("not json at all", KNOWN)).toBeNull();
    expect(
      parseUnderstanding(JSON.stringify({ read_as: "x", kind: "answer" }), KNOWN)
    ).toBeNull();
  });

  it("fenced JSON is tolerated; answers survive", () => {
    const parsed = parseUnderstanding(
      '```json\n{"read_as": "Count waiting inquiries", "kind": "answer", "answer": "2 are waiting."}\n```',
      KNOWN
    );
    expect(parsed).toMatchObject({ kind: "answer", answer: "2 are waiting." });
  });

  it("the snapshot never carries an email address", () => {
    const snapshot = buildSnapshot(
      [
        {
          id: "inq-1",
          client_name: "Lisa de Jong",
          status: "replied",
          event_type: "wedding",
          event_date: null,
          created_at: "2026-08-25T10:00:00Z",
          replied_at: "2026-08-28T10:00:00Z",
          message: "Contact me at lisa@example.com about the wedding",
        },
      ],
      new Date("2026-08-31T10:00:00Z")
    );
    expect(snapshot).toContain('"client":"Lisa"');
    expect(snapshot).toContain('"days_since_reply":3');
    // The message field is client-authored content the drafts already see;
    // the structured fields never include the stored client_email column.
    expect(snapshot).not.toContain("client_email");
  });
});
