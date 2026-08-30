import { describe, expect, it } from "vitest";
import {
  ACTION_ORDER,
  ACTION_RULES,
  effectiveLevel,
  isPermitted,
} from "@/lib/frontdesk/permissions";

describe("automation permissions (§8.3, §8.4): ceilings unbreakable via the API", () => {
  it("SECURITY: a stored level above the ceiling never takes effect", () => {
    expect(effectiveLevel("send_message", { send_message: 5 })).toBe(4);
    expect(effectiveLevel("confirm_date", { confirm_date: 5 })).toBe(3);
    expect(effectiveLevel("state_price", { state_price: 4 })).toBe(3);
    expect(effectiveLevel("close_lead", { close_lead: 5 })).toBe(3);
  });

  it("SECURITY: garbage in the stored jsonb falls back to the conservative default", () => {
    for (const bad of [99, -1, 0, 2.5, "5", null, {}, [5]]) {
      expect(effectiveLevel("send_message", { send_message: bad })).toBe(
        ACTION_RULES.send_message.default
      );
    }
  });

  it("DEC-1: date, price, and close-lead ceilings are 3 in the rules themselves", () => {
    expect(ACTION_RULES.confirm_date.ceiling).toBe(3);
    expect(ACTION_RULES.state_price.ceiling).toBe(3);
    expect(ACTION_RULES.close_lead.ceiling).toBe(3);
    expect(ACTION_RULES.send_message.ceiling).toBe(4); // never 5
  });

  it("DEC-8 (a): every default is conservative and at or below its ceiling", () => {
    for (const key of ACTION_ORDER) {
      const rule = ACTION_RULES[key];
      expect(rule.default).toBeLessThanOrEqual(rule.ceiling);
      if (key !== "extract_details" && key !== "organize") {
        expect(rule.default).toBeLessThanOrEqual(3);
      }
    }
  });

  it("a freelancer can lower a level below the default, and it is honored", () => {
    expect(effectiveLevel("prepare_reply", { prepare_reply: 1 })).toBe(1);
    expect(isPermitted("prepare_reply", 3, { prepare_reply: 1 })).toBe(false);
    expect(isPermitted("prepare_reply", 3, null)).toBe(true);
  });

  it("missing storage means the defaults apply everywhere", () => {
    for (const key of ACTION_ORDER) {
      expect(effectiveLevel(key, null)).toBe(ACTION_RULES[key].default);
      expect(effectiveLevel(key, undefined)).toBe(ACTION_RULES[key].default);
    }
  });
});
