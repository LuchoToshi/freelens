import { describe, expect, it } from "vitest";
import {
  deriveFollowupTimeline,
  MAX_NUDGES,
  nextFollowupDate,
  nudgeVerdict,
  resolveQuietDays,
  type FollowupCandidate,
} from "@/lib/frontdesk/followups";

const NOW = new Date("2026-08-30T10:00:00Z");

function candidate(overrides: Partial<FollowupCandidate> = {}): FollowupCandidate {
  return {
    status: "replied",
    source: "form",
    replied_at: "2026-08-25T10:00:00Z",
    snoozed_until: null,
    nudgeCount: 0,
    followupsPaused: false,
    quietDays: null,
    ...overrides,
  };
}

describe("the follow-up engine (§11): every stop condition, cap, idempotency", () => {
  it("a quiet replied inquiry is eligible at the default cadence", () => {
    expect(nudgeVerdict(candidate(), NOW)).toEqual({ eligible: true, quietDays: 3 });
  });

  it("IDEMPOTENCY: once nudge_due, the inquiry is out — a re-run cannot double-fire", () => {
    expect(nudgeVerdict(candidate({ status: "nudge_due" }), NOW)).toEqual({
      eligible: false,
      stop: "not_awaiting_client",
    });
  });

  it("closing the lead stops reminders (§11.4)", () => {
    for (const status of ["booked", "lost"]) {
      expect(nudgeVerdict(candidate({ status }), NOW).eligible).toBe(false);
    }
  });

  it("CAP: never a third nudge, ever", () => {
    expect(nudgeVerdict(candidate({ nudgeCount: MAX_NUDGES }), NOW)).toEqual({
      eligible: false,
      stop: "cap_reached",
    });
  });

  it("the global pause and the per-inquiry snooze both stop reminders", () => {
    expect(nudgeVerdict(candidate({ followupsPaused: true }), NOW).eligible).toBe(false);
    expect(
      nudgeVerdict(candidate({ snoozed_until: "2026-09-02T00:00:00Z" }), NOW).eligible
    ).toBe(false);
    // an expired snooze no longer blocks
    expect(
      nudgeVerdict(candidate({ snoozed_until: "2026-08-29T00:00:00Z" }), NOW).eligible
    ).toBe(true);
  });

  it("sample inquiries never nudge anyone", () => {
    expect(nudgeVerdict(candidate({ source: "sample" }), NOW)).toEqual({
      eligible: false,
      stop: "sample",
    });
  });

  it("a user cadence is honored; garbage clamps to the default", () => {
    // replied 5 days ago: eligible at 3, not at 7
    expect(nudgeVerdict(candidate({ quietDays: 7 }), NOW).eligible).toBe(false);
    expect(nudgeVerdict(candidate({ quietDays: 4 }), NOW).eligible).toBe(true);
    for (const bad of [0, -3, 99, 2.5]) {
      expect(resolveQuietDays(bad)).toBe(3);
    }
  });
});

describe("the follow-up timeline (§11.7): every state visible", () => {
  const inquiry = { status: "nudge_due", snoozed_until: null };

  it("a prepared nudge is proposed; a sent one is sent; an empty one failed", () => {
    expect(deriveFollowupTimeline(inquiry, [{ outcome: null, body: "Hoi!" }], NOW).stateKey).toBe("proposed");
    expect(deriveFollowupTimeline(inquiry, [{ outcome: "edited", body: "Hoi!" }], NOW).stateKey).toBe("sent");
    expect(deriveFollowupTimeline(inquiry, [{ outcome: null, body: "" }], NOW).stateKey).toBe("failed");
  });

  it("pause, cancellation and the cap all render as their own state", () => {
    expect(
      deriveFollowupTimeline({ status: "replied", snoozed_until: "2026-09-02T00:00:00Z" }, [], NOW).stateKey
    ).toBe("paused");
    expect(deriveFollowupTimeline({ status: "booked", snoozed_until: null }, [], NOW).stateKey).toBe("cancelled");
    expect(
      deriveFollowupTimeline(
        { status: "replied", snoozed_until: null },
        [
          { outcome: "sent_as_is", body: "a" },
          { outcome: "sent_as_is", body: "b" },
        ],
        NOW
      )
    ).toEqual({ used: 2, cap: 2, stateKey: "capReached" });
  });
});

describe("the day a follow-up would appear (handoff §8 follow-ups)", () => {
  it("is the reply date plus the quiet window", () => {
    expect(nextFollowupDate("2026-06-01T09:00:00Z", 3, "Europe/Amsterdam")).toBe("2026-06-04");
  });

  it("has no date to give when there is no reply yet", () => {
    expect(nextFollowupDate(null, 3, "Europe/Amsterdam")).toBeNull();
  });

  it("lands on the freelancer's own day, not UTC's", () => {
    // 23:30 in Amsterdam is already the next day locally.
    expect(nextFollowupDate("2026-06-01T21:30:00Z", 1, "Europe/Amsterdam")).toBe("2026-06-02");
    expect(nextFollowupDate("2026-06-01T21:30:00Z", 1, "UTC")).toBe("2026-06-02");
  });

  it("refuses to invent a date from an unparseable timestamp", () => {
    expect(nextFollowupDate("not a date", 3, "UTC")).toBeNull();
  });
});
