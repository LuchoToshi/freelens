import { describe, expect, it } from "vitest";
import {
  detectLanguage,
  findPriceLikeAmounts,
  validateFrontdeskDraft,
} from "@/lib/frontdesk/draftGuards";
import { buildDraftPrompt, type DraftPromptInput } from "@/lib/frontdesk/prompts";

const PACKAGES = [
  { label: "Hele trouwdag", priceFromEur: 1950, unit: "per dag", notes: "incl. tweede fotograaf" },
  { label: "Portretsessie", priceFromEur: 350, unit: null, notes: null },
];

const VOICE = {
  tone: "warm and personal",
  formality: "informal" as const,
  sentence_length: "medium" as const,
  emoji: "rare" as const,
  greeting_style: "Hoi {first name}!",
  closing_habit: "suggests a call",
  sign_off: "Groetjes, Emma",
  language_notes: "Dutch, informal je",
  quirks: [],
};

function input(overrides: Partial<DraftPromptInput> = {}): DraftPromptInput {
  return {
    kind: "reply",
    voiceProfile: VOICE,
    packages: PACKAGES,
    inquiry: {
      clientFirstName: "Sanne",
      eventType: "wedding",
      eventDate: "2027-06-12",
      budgetBand: "1000-2500",
      message: "Wij trouwen in juni en zoeken een fotograaf.",
    },
    displayName: "Emma van Dijk",
    signOff: "Groetjes, Emma",
    targetLanguage: "nl",
    ...overrides,
  };
}

const REPLY_PAD =
  "Wat leuk om over jullie plannen te lezen, dank je wel voor het uitgebreide bericht. " +
  "Ik vertel je graag hoe zo'n dag er bij mij uitziet en wat jullie kunnen verwachten qua aanpak. ";

describe("language detection", () => {
  it("Dutch message → nl, even with en fallback", () => {
    expect(detectLanguage("Hoi! Wij trouwen in juni en zoeken nog een fotograaf voor de hele dag.", "en")).toBe("nl");
  });
  it("English message → en, even with nl fallback", () => {
    expect(detectLanguage("Hi! We are looking for a photographer for our wedding in June.", "nl")).toBe("en");
  });
  it("empty or tiny message → freelancer locale", () => {
    expect(detectLanguage("", "nl")).toBe("nl");
    expect(detectLanguage(null, "en")).toBe("en");
    expect(detectLanguage("ok!", "nl")).toBe("nl");
  });
});

describe("price guard", () => {
  it("accepts the exact package price in any common format", () => {
    for (const phrasing of ["€ 1.950", "€1950", "1950 euro", "vanaf € 1.950,-"]) {
      const body = `${REPLY_PAD}De hele trouwdag begint bij ${phrasing}, inclusief tweede fotograaf. Zullen we bellen?`;
      const { failures } = validateFrontdeskDraftFull(body, { kind: "reply", packages: PACKAGES });
      expect(failures.join(";"), phrasing).not.toMatch(/price-not-in-packages/);
    }
  });

  it("rejects an invented or rounded price", () => {
    for (const phrasing of ["€ 2.000", "1900 euro", "€ 1.499"]) {
      const body = `${REPLY_PAD}Dat kost ongeveer ${phrasing} voor de hele dag. Zullen we bellen?`;
      const verdict = validateFrontdeskDraft(body, { kind: "reply", packages: PACKAGES });
      expect(verdict.ok, phrasing).toBe(false);
      expect(verdict.reason).toContain("price-not-in-packages");
    }
  });

  it("does not false-positive on dates and years", () => {
    const body = `${REPLY_PAD}Wat mooi dat jullie op 12 juni 2027 trouwen, daar denk ik graag over mee. Zullen we bellen?`;
    const { failures } = validateFrontdeskDraftFull(body, { kind: "reply", packages: PACKAGES });
    expect(failures.join(";")).not.toMatch(/price-not-in-packages/);
    expect(findPriceLikeAmounts("op 12 juni 2027")).toEqual([]);
  });
});

describe("availability guard", () => {
  it("rejects availability claims in both languages", () => {
    for (const claim of [
      "die datum is nog vrij",
      "ik ben dan beschikbaar",
      "that date is still open",
      "I am available that day",
      "it's open in my calendar",
    ]) {
      const body = `${REPLY_PAD}Goed nieuws: ${claim}. Zullen we bellen?`;
      const verdict = validateFrontdeskDraft(body, { kind: "reply", packages: PACKAGES });
      expect(verdict.ok, claim).toBe(false);
      expect(verdict.reason).toContain("availability-claim");
    }
  });

  it("allows enthusiasm and checking language", () => {
    const body = `${REPLY_PAD}Wat een mooie datum, ik duik graag even in mijn agenda en kom er vrijblijvend op terug. Zullen we bellen?`;
    const { failures } = validateFrontdeskDraftFull(body, { kind: "reply", packages: PACKAGES });
    expect(failures.join(";")).not.toMatch(/availability-claim/);
  });
});

describe("style guard", () => {
  it("rejects an em dash anywhere in the draft", () => {
    const body = `${REPLY_PAD}Wat een mooie datum — ik duik er graag in. Zullen we bellen?`;
    const verdict = validateFrontdeskDraft(body, { kind: "reply", packages: PACKAGES });
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toContain("em-dash");
  });
});

describe("prompt builder", () => {
  it("refuses an empty voice profile", () => {
    expect(() =>
      buildDraftPrompt(input({ voiceProfile: {} as never }))
    ).toThrow(/voice profile/);
  });

  it("never contains an email address for normal input", () => {
    const { system, user } = buildDraftPrompt(input());
    expect(system + user).not.toMatch(/\S+@\S+\.\S+/);
  });

  it("throws if an email-shaped value smuggles into a non-message field", () => {
    expect(() =>
      buildDraftPrompt(input({ displayName: "emma emma@x.co" }))
    ).toThrow(/email-shaped/);
  });

  it("client email cannot even be passed: the type has no field for it, and a message containing one stays confined to the message line", () => {
    const { user } = buildDraftPrompt(
      input({ inquiry: { ...input().inquiry, message: "reach me at client@example.com" } })
    );
    const line = user.split("\n").find((l) => l.includes("client@example.com"));
    expect(line?.startsWith("message:")).toBe(true);
  });

  it("nudge length bounds differ from reply bounds", () => {
    const nudge = "Hoi Sanne! Nog even over jullie bruiloft: ik plan mijn zomer nu in en denk graag met jullie mee. Zal ik je deze week even bellen?";
    expect(validateFrontdeskDraft(nudge, { kind: "nudge", packages: PACKAGES }).ok).toBe(true);
    expect(validateFrontdeskDraft(nudge, { kind: "reply", packages: PACKAGES }).ok).toBe(false);
  });

  it("targets English cleanly for an English visitor with an English voice profile", () => {
    // Regression guard for the class of bug PR #51 fixed in rebooking: a
    // hardcoded non-ternary example string leaked the wrong language into the
    // prompt even though target_language was set correctly. DRAFT_SYSTEM_TEMPLATE
    // has no such hardcoded example today, but nothing asserted that before the
    // demo route (spec §3) needed FrontDesk's English path verified, not assumed.
    const english = buildDraftPrompt(
      input({
        targetLanguage: "en",
        packages: [
          { label: "Full day wedding", priceFromEur: 1950, unit: "per day", notes: "second photographer included" },
        ],
        voiceProfile: {
          tone: "warm and personal",
          formality: "informal",
          sentence_length: "medium",
          emoji: "rare",
          greeting_style: "Hi {first name}!",
          closing_habit: "suggests a call",
          sign_off: "Best, Emma",
          language_notes: "",
          quirks: [],
        },
        inquiry: {
          clientFirstName: "Lisa",
          eventType: "wedding",
          eventDate: "2027-06-12",
          budgetBand: "1000-2500",
          message: "Hi! We are getting married in June and are looking for a photographer.",
        },
        displayName: "Emma van Dijk",
        signOff: "Best, Emma",
      })
    );
    expect(english.system).toContain("Write in English.");
    expect(english.system).not.toContain("Write in Dutch.");
    expect(english.user).toContain("target_language: English");
    expect(english.system + english.user).not.toMatch(/vorig jaar|trouwdag|Hoi |Groetjes/);
  });
});

// ---- Master spec Phase 1 (§10.5): the extended check set -------------------

import { deriveValidationStatus, validateFrontdeskDraftFull } from "@/lib/frontdesk/draftGuards";

const CTX = { kind: "reply" as const, packages: PACKAGES, signOff: "Groetjes, Emma" };

const VALID_EN = [
  "Hi Sanne!",
  "",
  "Thank you for thinking of me for your wedding. It sounds like a lovely day",
  "and I would be happy to tell you more about how I work and what a full",
  "wedding day with me looks like, from preparations to the last dance.",
  "My full wedding day package starts at 1950 euro including a second",
  "photographer, and I can walk you through what that covers on a short call.",
  "",
  "Groetjes, Emma",
].join("\n");

const VALID_NL = [
  "Hoi Sanne!",
  "",
  "Wat leuk dat jullie aan mij denken voor jullie bruiloft. Ik vertel je",
  "graag meer over hoe ik werk en hoe een hele trouwdag met mij eruitziet,",
  "van de voorbereidingen tot de laatste dans, en wat jullie daarvan terugzien.",
  "Mijn pakket voor een hele trouwdag begint bij 1950 euro inclusief tweede",
  "fotograaf, en ik leg jullie in een kort gesprek graag uit wat daar allemaal",
  "bij inbegrepen zit.",
  "",
  "Groetjes, Emma",
].join("\n");

describe("validateFrontdeskDraftFull", () => {
  it("passes a complete draft in both languages", () => {
    expect(validateFrontdeskDraftFull(VALID_EN, CTX)).toEqual({ ok: true, failures: [] });
    expect(validateFrontdeskDraftFull(VALID_NL, CTX)).toEqual({ ok: true, failures: [] });
  });

  it("a greeting-only draft can never reach a ready state", () => {
    const { ok, failures } = validateFrontdeskDraftFull("Hoi Sanne!\n\nGroetjes, Emma", CTX);
    expect(ok).toBe(false);
    expect(failures).toContain("body-only-greeting");
    expect(deriveValidationStatus(failures)).toBe("failed");
  });

  it("flags a missing greeting in both languages", () => {
    const en = VALID_EN.replace("Hi Sanne!", "So about your wedding day plans.");
    const nl = VALID_NL.replace("Hoi Sanne!", "Over jullie plannen voor de bruiloft.");
    expect(validateFrontdeskDraftFull(en, CTX).failures).toContain("greeting-missing");
    expect(validateFrontdeskDraftFull(nl, CTX).failures).toContain("greeting-missing");
  });

  it("flags a missing sign-off but accepts a generic closing", () => {
    const bare = VALID_EN.replace("\n\nGroetjes, Emma", "");
    expect(validateFrontdeskDraftFull(bare, CTX).failures).toContain("signoff-missing");
    const generic = VALID_EN.replace("Groetjes, Emma", "Warm regards, Emma");
    expect(validateFrontdeskDraftFull(generic, CTX).ok).toBe(true);
  });

  it("flags unresolved placeholders of every shape", () => {
    for (const bad of ["{{client_name}}", "[datum]", "TODO check this"]) {
      const draft = VALID_EN.replace("what a full", `what a full ${bad}`);
      expect(validateFrontdeskDraftFull(draft, CTX).failures).toContain("unresolved-placeholder");
    }
  });

  it("flags a year that contradicts the inquiry's event date", () => {
    const ctx = { ...CTX, eventDate: "2027-06-12" };
    const wrong = VALID_EN.replace("your wedding", "your wedding in June 2026");
    expect(validateFrontdeskDraftFull(wrong, ctx).failures).toContain("date-mismatch:2026");
    const right = VALID_EN.replace("your wedding", "your wedding in June 2027");
    expect(validateFrontdeskDraftFull(right, ctx).ok).toBe(true);
  });

  it("collects every failure at once instead of the first", () => {
    const bad = "So, about the day. It costs 1234 euro and the date is open. [TBD]";
    const { failures } = validateFrontdeskDraftFull(bad, CTX);
    expect(failures.length).toBeGreaterThanOrEqual(4);
    expect(failures.join(";")).toMatch(/price-not-in-packages:1234/);
    expect(failures.join(";")).toMatch(/availability-claim/);
    expect(failures.join(";")).toMatch(/unresolved-placeholder/);
    expect(failures.join(";")).toMatch(/greeting-missing/);
  });

  it("existing guards still hold through the full validator", () => {
    const emDash = VALID_EN.replace("second", "second — best");
    expect(validateFrontdeskDraftFull(emDash, CTX).failures).toContain("em-dash");
  });
});

describe("deriveValidationStatus", () => {
  it("no failures is ready for review, never ready to send", () => {
    expect(deriveValidationStatus([])).toBe("ready_for_review");
  });

  it("a missing recipient alone needs review rather than failing", () => {
    expect(deriveValidationStatus(["recipient-missing"])).toBe("needs_review");
  });

  it("any hard failure fails the draft even next to a soft one", () => {
    expect(deriveValidationStatus(["recipient-missing", "em-dash"])).toBe("failed");
  });
});
