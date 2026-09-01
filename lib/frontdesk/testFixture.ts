/**
 * Test mode (master spec §14.4): fictional data so the workflow can be
 * understood before a real inbox is connected. Everything here is generated
 * client-side with obviously fictional names, ids prefixed "test-", and is
 * NEVER written anywhere: the inbox swaps its network calls for local state
 * while the mode is active.
 */
import type { FrontdeskLocale } from "@/lib/frontdesk/i18n";
import type { StoredEventType } from "@/lib/frontdesk/eventTypes";

export interface TestInquiry {
  id: string;
  source: "sample";
  src_channel: string | null;
  client_name: string;
  client_email: string | null;
  event_date: string | null;
  event_type: StoredEventType;
  event_type_other?: string | null;
  budget_band: string;
  message: string | null;
  status: "new" | "replied" | "nudge_due" | "booked" | "lost";
  created_at: string;
  replied_at: string | null;
  snoozed_until: string | null;
}

export interface TestDraft {
  id: string;
  created_at: string;
  language: string | null;
  inquiry_id: string;
  kind: "reply" | "nudge";
  body: string;
  final_body?: string | null;
  outcome: string | null;
  validation_status?: string | null;
  validation_failures?: string[] | null;
}

const DAY = 86_400_000;

const MESSAGES: Record<FrontdeskLocale, Record<string, string>> = {
  en: {
    decision: "Hi! We are getting married on a beach in June and love your style. What would it roughly cost?",
    review: "We need photos of our team offsite in October. Are you available around the 12th?",
    failed: "Birthday party photos, is that something you do?",
    followup: "Our September wedding in the dunes, would you be free?",
    waiting: "Family portraits this autumn, what does a session look like?",
    done: "Confirmed for the May wedding, we are so excited!",
  },
  nl: {
    decision: "Hoi! We trouwen in juni op het strand en zijn fan van je stijl. Wat kost zoiets ongeveer?",
    review: "We zoeken foto's van ons teamuitje in oktober. Ben je rond de 12e beschikbaar?",
    failed: "Foto's van een verjaardagsfeest, doe je dat ook?",
    followup: "Onze septemberbruiloft in de duinen, zou je vrij zijn?",
    waiting: "Familieportretten dit najaar, hoe ziet een sessie eruit?",
    done: "Bevestigd voor de bruiloft in mei, we hebben er zo veel zin in!",
  },
};

const DRAFT_BODIES: Record<FrontdeskLocale, { decision: string; review: string }> = {
  en: {
    decision:
      "Hi Fleur,\n\nCongratulations! A beach wedding in June sounds wonderful and I would love to hear more. Could you tell me the location and roughly how many guests you expect?\n\nEmma",
    review:
      "Hi Daan,\n\nA team offsite is a great occasion for natural, candid photos. I am available around 12 October. Shall I send over a short proposal?\n\nEmma",
  },
  nl: {
    decision:
      "Hoi Fleur,\n\nGefeliciteerd! Een strandbruiloft in juni klinkt prachtig en ik hoor er graag meer over. Kun je iets vertellen over de locatie en hoeveel gasten jullie ongeveer verwachten?\n\nEmma",
    review:
      "Hoi Daan,\n\nEen teamuitje is een mooi moment voor ongedwongen foto's. Rond 12 oktober ben ik beschikbaar. Zal ik een kort voorstel sturen?\n\nEmma",
  },
};

export function buildTestFixture(now: Date, locale: FrontdeskLocale) {
  const iso = (msAgo: number) => new Date(now.getTime() - msAgo).toISOString();
  const m = MESSAGES[locale];
  const bodies = DRAFT_BODIES[locale];

  const inquiries: TestInquiry[] = [
    { id: "test-decision", source: "sample", src_channel: "ig", client_name: "Fleur de Vries (fictional)", client_email: null, event_date: null, event_type: "wedding", budget_band: "2500+", message: m.decision, status: "new", created_at: iso(2 * DAY), replied_at: null, snoozed_until: null },
    { id: "test-review", source: "sample", src_channel: null, client_name: "Daan Jansen (fictional)", client_email: "daan@example.com", event_date: "2026-10-12", event_type: "event", budget_band: "1000-2500", message: m.review, status: "new", created_at: iso(1 * DAY), replied_at: null, snoozed_until: null },
    { id: "test-failed", source: "sample", src_channel: null, client_name: "Saar Visser (fictional)", client_email: "saar@example.com", event_date: null, event_type: "event", budget_band: "<1000", message: m.failed, status: "new", created_at: iso(3 * DAY), replied_at: null, snoozed_until: null },
    { id: "test-followup", source: "sample", src_channel: null, client_name: "Noor Bakker (fictional)", client_email: "noor@example.com", event_date: null, event_type: "wedding", budget_band: "2500+", message: m.followup, status: "nudge_due", created_at: iso(9 * DAY), replied_at: iso(6 * DAY), snoozed_until: null },
    { id: "test-waiting", source: "sample", src_channel: null, client_name: "Lars Smit (fictional)", client_email: "lars@example.com", event_date: null, event_type: "other", event_type_other: "family portraits", budget_band: "1000-2500", message: m.waiting, status: "replied", created_at: iso(2 * DAY), replied_at: iso(1 * DAY), snoozed_until: null },
    { id: "test-done", source: "sample", src_channel: null, client_name: "Mila Peters (fictional)", client_email: "mila@example.com", event_date: null, event_type: "wedding", budget_band: "2500+", message: m.done, status: "booked", created_at: iso(12 * DAY), replied_at: iso(10 * DAY), snoozed_until: null },
  ];

  const drafts: TestDraft[] = [
    { id: "test-draft-decision", inquiry_id: "test-decision", kind: "reply", language: locale, body: bodies.decision, outcome: null, created_at: iso(2 * DAY - 60_000), validation_status: "needs_review", validation_failures: ["recipient-missing"] },
    { id: "test-draft-review", inquiry_id: "test-review", kind: "reply", language: locale, body: bodies.review, outcome: null, created_at: iso(1 * DAY - 60_000), validation_status: "ready_for_review", validation_failures: [] },
    { id: "test-draft-failed", inquiry_id: "test-failed", kind: "reply", language: locale, body: "", outcome: null, created_at: iso(3 * DAY - 60_000), validation_status: "failed", validation_failures: ["body-only-greeting", "signoff-missing"] },
  ];

  return { inquiries, drafts };
}

const REGENERATED: Record<FrontdeskLocale, string> = {
  en: "Hi {name},\n\nThanks for your message! I would love to hear a little more about what you have in mind. What date are you thinking of, and roughly how many people will be there?\n\nEmma",
  nl: "Hoi {name},\n\nDank voor je bericht! Ik hoor graag iets meer over wat je in gedachten hebt. Aan welke datum denk je, en met ongeveer hoeveel mensen zijn jullie?\n\nEmma",
};

/** A canned "regenerated" draft: the whole mode is labeled fictional. */
export function testRegeneratedBody(locale: FrontdeskLocale, clientName: string): string {
  const first = clientName.split(" ")[0];
  return REGENERATED[locale].replace("{name}", first);
}
