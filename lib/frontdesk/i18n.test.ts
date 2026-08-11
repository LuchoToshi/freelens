import { describe, expect, it } from "vitest";
import { fdDict, type FrontdeskDict } from "@/lib/frontdesk/i18n";

/** Same discipline as lib/i18n/dictionary.test.ts, scoped to this dict. */
const SAME_BY_DESIGN = new Set(["public.form.budgetLabel", "inbox.heading", "inbox.detail.budget"]);

type Node = string | { [key: string]: Node };

function paths(node: Node, prefix = ""): { path: string; value: string }[] {
  if (typeof node === "string") return [{ path: prefix, value: node }];
  return Object.entries(node).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key)
  );
}

function valueAt(dict: FrontdeskDict, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, dict);
}

const en = fdDict("en");
const nl = fdDict("nl");

describe("frontdesk dictionary parity", () => {
  it("every en key exists in nl", () => {
    for (const { path } of paths(en as unknown as Node)) {
      expect(valueAt(nl, path), path).toBeTypeOf("string");
    }
  });

  it("no nl string is identical to en unless allowlisted", () => {
    for (const { path, value } of paths(en as unknown as Node)) {
      if (SAME_BY_DESIGN.has(path)) continue;
      if (/^[\d.,\s]+$/.test(value)) continue;
      expect(valueAt(nl, path), path).not.toBe(value);
    }
  });

  it("placeholder sets match per key", () => {
    for (const { path, value } of paths(en as unknown as Node)) {
      const enPh = [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      const nlValue = valueAt(nl, path) as string;
      const nlPh = [...nlValue.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(nlPh, path).toEqual(enPh);
    }
  });

  it("unknown locales fall back to Dutch", () => {
    expect(fdDict("de")).toBe(fdDict("nl"));
    expect(fdDict(null)).toBe(fdDict("nl"));
  });
});
