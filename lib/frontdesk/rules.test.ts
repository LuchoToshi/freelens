import { describe, expect, it } from "vitest";
import {
  afterRun,
  ruleGrant,
  proposeRule,
  ruleApplies,
  PROPOSE_AFTER,
  TRIAL_RUNS,
  type ApprovalSignal,
  type RuleRow,
} from "@/lib/frontdesk/rules";

function approval(overrides: Partial<ApprovalSignal> = {}): ApprovalSignal {
  return {
    kind: "reply",
    event_type: "wedding",
    budget_band: "2500+",
    outcome: "sent_as_is",
    ...overrides,
  };
}

const TRIAL_RULE: RuleRow = {
  id: "r1",
  trigger: { event_type: "wedding", budget_band: "2500+" },
  action: "prepare_reply",
  status: "trial",
  trial_runs_left: TRIAL_RUNS,
  ran_count: 0,
  edited_count: 0,
};

describe("automation rules (§6): born from repeated approvals only", () => {
  it(`proposes after ${PROPOSE_AFTER} identical unedited approvals, not before`, () => {
    const four = Array.from({ length: 4 }, () => approval());
    expect(proposeRule(four, [])).toBeNull();
    expect(proposeRule([...four, approval()], [])).toEqual({
      trigger: { event_type: "wedding", budget_band: "2500+" },
      action: "prepare_reply",
      evidenceCount: 5,
    });
  });

  it("edited approvals are not evidence", () => {
    const edited = Array.from({ length: 6 }, () => approval({ outcome: "edited" }));
    expect(proposeRule(edited, [])).toBeNull();
  });

  it("a rule that already exists (or was declined) is never re-proposed", () => {
    const five = Array.from({ length: 5 }, () => approval());
    expect(proposeRule(five, [{ ...TRIAL_RULE, status: "declined" }])).toBeNull();
    expect(proposeRule(five, [TRIAL_RULE])).toBeNull();
  });

  it("a nudge approval proposes the follow-up action", () => {
    const five = Array.from({ length: 5 }, () => approval({ kind: "nudge" }));
    expect(proposeRule(five, [])?.action).toBe("prepare_followup");
  });

  it("pause, at either level, stops a rule acting", () => {
    const inquiry = { event_type: "wedding", budget_band: "2500+" };
    expect(ruleApplies(TRIAL_RULE, inquiry, false)).toBe(true);
    expect(ruleApplies(TRIAL_RULE, inquiry, true)).toBe(false);
    expect(ruleApplies({ ...TRIAL_RULE, status: "paused" }, inquiry, false)).toBe(false);
    expect(ruleApplies({ ...TRIAL_RULE, status: "proposed" }, inquiry, false)).toBe(false);
  });

  it("a rule only matches its own trigger shape", () => {
    expect(ruleApplies(TRIAL_RULE, { event_type: "party", budget_band: "2500+" }, false)).toBe(false);
    expect(ruleApplies(TRIAL_RULE, { event_type: "wedding", budget_band: "<1000" }, false)).toBe(false);
  });

  it("three unedited runs graduate a trial; an edit puts it back", () => {
    let rule = TRIAL_RULE;
    for (let i = 0; i < TRIAL_RUNS - 1; i++) rule = afterRun(rule, "sent_as_is");
    expect(rule.status).toBe("trial");
    rule = afterRun(rule, "sent_as_is");
    expect(rule).toMatchObject({ status: "on", trial_runs_left: 0, ran_count: 3 });

    const edited = afterRun({ ...TRIAL_RULE, trial_runs_left: 1 }, "edited");
    expect(edited).toMatchObject({ status: "trial", trial_runs_left: TRIAL_RUNS, edited_count: 1 });
  });
});

describe("what a rule grants (§6): scoped automation, never a new ceiling", () => {
  const inquiry = { event_type: "wedding", budget_band: "2500+" };
  const onRule: RuleRow = { ...TRIAL_RULE, status: "on" };

  it("an active rule for the shape grants its own action only", () => {
    expect(ruleGrant("prepare_reply", inquiry, [onRule], false)?.id).toBe("r1");
    expect(ruleGrant("prepare_followup", inquiry, [onRule], false)).toBeNull();
  });

  it("a different shape, a paused rule, or a paused account grants nothing", () => {
    expect(ruleGrant("prepare_reply", { event_type: "party", budget_band: "2500+" }, [onRule], false)).toBeNull();
    expect(ruleGrant("prepare_reply", inquiry, [{ ...onRule, status: "paused" }], false)).toBeNull();
    expect(ruleGrant("prepare_reply", inquiry, [onRule], true)).toBeNull();
  });

  it("a trial rule grants too — its output still comes back for review", () => {
    expect(ruleGrant("prepare_reply", inquiry, [TRIAL_RULE], false)?.status).toBe("trial");
  });
});
