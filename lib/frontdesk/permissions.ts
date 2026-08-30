/**
 * The automation permission model (master spec §8.3, §8.4, §13).
 *
 * Five levels, set per action type, each with a hard ceiling. Ceilings are
 * the product's promises and are NOT user-raisable: DEC-1 caps "confirm a
 * date", "state a price" and "close a lead" at level 3 forever, and a send
 * can never reach level 5.
 *
 * Enforcement lives at the point of CONSUMPTION, not at the write: the
 * stored levels are a user-editable jsonb column, so nothing stops a raw
 * API write of level 5 — but a stored level only ever takes effect through
 * effectiveLevel(), which clamps to the ceiling. That is what makes the
 * ceiling unbreakable via the API (§30 Phase 4 security test).
 */

export type AutomationLevel = 1 | 2 | 3 | 4 | 5;

export type ActionKey =
  | "extract_details"
  | "organize"
  | "prepare_reply"
  | "prepare_followup"
  | "schedule_followup"
  | "send_message"
  | "confirm_date"
  | "state_price"
  | "close_lead";

interface ActionRule {
  ceiling: AutomationLevel;
  /** DEC-8 safe default (a): conservative out of the box. */
  default: AutomationLevel;
}

/** §8.4, with DEC-1 (a) applied. Order here is the display order. */
export const ACTION_RULES: Record<ActionKey, ActionRule> = {
  extract_details: { ceiling: 5, default: 5 },
  organize: { ceiling: 5, default: 5 },
  prepare_reply: { ceiling: 4, default: 3 },
  prepare_followup: { ceiling: 4, default: 3 },
  schedule_followup: { ceiling: 4, default: 3 },
  send_message: { ceiling: 4, default: 3 }, // never 5: irreversible client contact
  confirm_date: { ceiling: 3, default: 3 }, // DEC-1: never above 3
  state_price: { ceiling: 3, default: 3 }, // DEC-1: never above 3
  close_lead: { ceiling: 3, default: 3 }, // DEC-1: never above 3
};

export const ACTION_ORDER = Object.keys(ACTION_RULES) as ActionKey[];

export type StoredLevels = Record<string, unknown> | null | undefined;

/**
 * The level that actually applies: stored value if it is a sane level,
 * clamped to the ceiling; the conservative default otherwise. Garbage in the
 * stored jsonb (strings, floats, 99, negative) falls back to the default,
 * which is itself at or below the ceiling by construction.
 */
export function effectiveLevel(action: ActionKey, stored: StoredLevels): AutomationLevel {
  const rule = ACTION_RULES[action];
  const raw = stored?.[action];
  if (typeof raw === "number" && Number.isInteger(raw) && raw >= 1 && raw <= 5) {
    return Math.min(raw, rule.ceiling) as AutomationLevel;
  }
  return rule.default;
}

/** May this action run at the given level right now? */
export function isPermitted(
  action: ActionKey,
  requiredLevel: AutomationLevel,
  stored: StoredLevels
): boolean {
  return effectiveLevel(action, stored) >= requiredLevel;
}
