/**
 * FrontDesk's own dictionary, scoped on purpose.
 *
 * The public inquiry page renders in the FREELANCER's stored locale, server
 * side — not in the visitor's toggle — so the site-wide client provider is
 * the wrong mechanism here. Scoping also keeps the shared dictionaries
 * byte-untouched. Parity between locales is enforced by i18n.test.ts with the
 * same walker the site dictionaries use.
 */
export type FrontdeskLocale = "nl" | "en";

const en = {
  public: {
    craft: {
      photographer: "Photographer",
      videographer: "Videographer",
    },
    form: {
      nameLabel: "Your name",
      emailLabel: "Email address",
      dateLabel: "Event date (optional)",
      typeLabel: "What is it for?",
      types: {
        wedding: "Wedding",
        party: "Party",
        business: "Business",
        portrait: "Portrait",
        other: "Something else",
      },
      budgetLabel: "Budget",
      budgets: {
        under: "Up to € 1,000",
        mid: "€ 1,000 – 2,500",
        plus: "€ 2,500+",
        unsure: "Not sure yet",
      },
      messageLabel: "Tell a bit more (optional)",
      submit: "Send",
      sending: "Sending…",
      error: "Something went wrong. Please try again.",
      confirmation: "Thanks! {name} will get back to you personally.",
    },
    notify: {
      subject: "New inquiry from {name} — {type}, {date}",
      noDate: "date unknown",
      bodyLine: "Open your inbox to reply with the prepared draft.",
    },
  },
};

const nl: typeof en = {
  public: {
    craft: {
      photographer: "Fotograaf",
      videographer: "Videograaf",
    },
    form: {
      nameLabel: "Je naam",
      emailLabel: "E-mailadres",
      dateLabel: "Datum (optioneel)",
      typeLabel: "Waar gaat het om?",
      types: {
        wedding: "Bruiloft",
        party: "Feest",
        business: "Zakelijk",
        portrait: "Portret",
        other: "Iets anders",
      },
      budgetLabel: "Budget",
      budgets: {
        under: "Tot € 1.000",
        mid: "€ 1.000 – 2.500",
        plus: "€ 2.500+",
        unsure: "Weet ik nog niet",
      },
      messageLabel: "Vertel iets meer (optioneel)",
      submit: "Verstuur",
      sending: "Versturen…",
      error: "Er ging iets mis. Probeer het nog een keer.",
      confirmation: "Dank je wel! {name} komt er persoonlijk bij je op terug.",
    },
    notify: {
      subject: "Nieuwe aanvraag van {name} — {type}, {date}",
      noDate: "datum onbekend",
      bodyLine: "Open je inbox om te antwoorden met het klaargezette concept.",
    },
  },
};

export type FrontdeskDict = typeof en;

const DICTS: Record<FrontdeskLocale, FrontdeskDict> = { en, nl };

export function fdDict(locale: string | null | undefined): FrontdeskDict {
  return DICTS[locale === "en" ? "en" : "nl"];
}
