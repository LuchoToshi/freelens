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
      expect(validateFrontdeskDraft(body, { kind: "reply", packages: PACKAGES }).ok, phrasing).toBe(true);
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
    expect(validateFrontdeskDraft(body, { kind: "reply", packages: PACKAGES }).ok).toBe(true);
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
    expect(validateFrontdeskDraft(body, { kind: "reply", packages: PACKAGES }).ok).toBe(true);
  });
});

describe("style guard", () => {
  it("rejects an em dash anywhere in the draft", () => {
    const body = `${REPLY_PAD}Wat een mooie datum — ik duik er graag in. Zullen we bellen?`;
    const verdict = validateFrontdeskDraft(body, { kind: "reply", packages: PACKAGES });
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toBe("em-dash");
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
