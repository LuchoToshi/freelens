import { describe, expect, it } from "vitest";
import { firstDraftBucket, tallyFirstDraftBuckets, type FunnelDraftRow } from "./adminFunnel";

function draft(overrides: Partial<FunnelDraftRow>): FunnelDraftRow {
  return { kind: "reply", outcome: null, created_at: "2026-08-01T00:00:00Z", ...overrides };
}

describe("firstDraftBucket", () => {
  it("buckets the earliest reply draft by its own outcome", () => {
    expect(firstDraftBucket([draft({ outcome: "sent_as_is" })])).toBe("sent_as_is");
    expect(firstDraftBucket([draft({ outcome: "edited" })])).toBe("edited");
    expect(firstDraftBucket([draft({ outcome: "skipped" })])).toBe("skipped");
  });

  it("is null when there is no reply draft yet, or the first is still pending", () => {
    expect(firstDraftBucket([])).toBeNull();
    expect(firstDraftBucket([draft({ outcome: null })])).toBeNull();
  });

  // Acceptance criterion from issue #33.
  it("classifies a discarded-then-replaced first draft as regenerated, not sent_as_is", () => {
    const drafts = [
      draft({ created_at: "2026-08-01T09:00:00Z", outcome: null }), // discarded, never acted on
      draft({ created_at: "2026-08-01T09:05:00Z", outcome: "sent_as_is" }), // the one actually sent
    ];
    expect(firstDraftBucket(drafts)).toBe("regenerated");
  });

  it("earliest is picked by created_at, not array order", () => {
    const drafts = [
      draft({ created_at: "2026-08-01T09:05:00Z", outcome: "sent_as_is" }),
      draft({ created_at: "2026-08-01T09:00:00Z", outcome: "edited" }), // actually first
    ];
    expect(firstDraftBucket(drafts)).toBe("edited");
  });

  // Acceptance criterion from issue #33.
  it("never counts a nudge outcome toward reply quality", () => {
    const drafts = [
      draft({ kind: "nudge", created_at: "2026-08-01T09:00:00Z", outcome: "skipped" }),
    ];
    expect(firstDraftBucket(drafts)).toBeNull();
  });

  it("ignores nudges entirely when picking the earliest reply draft", () => {
    const drafts = [
      draft({ kind: "nudge", created_at: "2026-07-01T00:00:00Z", outcome: "sent_as_is" }), // earlier, but a nudge
      draft({ kind: "reply", created_at: "2026-08-01T00:00:00Z", outcome: "edited" }),
    ];
    expect(firstDraftBucket(drafts)).toBe("edited");
  });

  it("a regenerate followed only by more pending drafts is still not classified", () => {
    const drafts = [
      draft({ created_at: "2026-08-01T09:00:00Z", outcome: null }),
      draft({ created_at: "2026-08-01T09:05:00Z", outcome: null }),
    ];
    expect(firstDraftBucket(drafts)).toBeNull();
  });
});

describe("tallyFirstDraftBuckets", () => {
  it("counts one bucket per inquiry across the whole funnel", () => {
    const counts = tallyFirstDraftBuckets([
      [draft({ outcome: "sent_as_is" })],
      [draft({ outcome: "edited" })],
      [draft({ created_at: "09:00", outcome: null }), draft({ created_at: "09:05", outcome: "skipped" })],
      [draft({ kind: "nudge", outcome: "skipped" })], // no reply draft: contributes nothing
    ]);
    expect(counts).toEqual({ sent_as_is: 1, edited: 1, skipped: 0, regenerated: 1 });
  });
});
