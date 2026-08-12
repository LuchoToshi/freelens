/**
 * English copy for the whole site. The source of truth for the dictionary shape.
 *
 * Every user-visible string lives here, including accessible labels and titles.
 * Two rules keep it usable:
 *
 *   1. Namespaces mirror the screen, not the component tree, so a translator
 *      can work through a page without reading React.
 *   2. Interpolation uses `{name}` placeholders filled by `fill()`. Numbers and
 *      money arrive pre-formatted, because grouping and currency placement
 *      differ per locale and belong in the formatter, not the sentence.
 */
export const en = {
  common: {
    brand: "Freelens",
    nav: {
      ariaLabel: "Main navigation",
      about: "About",
      beforeJob: "Before the job",
      afterPayment: "After payment",
      quotes: "Your quotes",
      howItWorks: "How it works",
      rebooking: "Rebooking",
      tools: "Calculators",
      menuLabel: "Open menu",
      privacy: "Privacy",
      contact: "Contact",
      accuracy: "Accuracy & sources",
      methodology: "How it's calculated",
    },
    back: "Back",
    skipToContent: "Skip to content",
    languageSwitcher: {
      label: "Language",
      switchTo: "Switch to",
    },
    example: "Example",
    footer: {
      trustLine:
        "Not tax advice. A clear estimate to work from. Your numbers never leave your browser.",
      // The destination's own name, not a fourth word for it. See the comment
      // on the header nav.
      cta: "After payment",
      navLabel: "Site links",
    },
    confidence: {
      sentence:
        "A planning estimate, never a hidden promise. Your numbers stay on this device.",
      toggle: "How this estimate works",
      disclaimer:
        "Freelens provides planning estimates based on the information and reserve rules you enter. It does not calculate your final tax assessment and is not tax advice.",
    },
    actions: {
      save: "Save",
      saved: "Saved",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      close: "Close",
      change: "change",
    },
  },

  tryPage: {
    eyebrow: "Try Freelens",
    heading: "One week of Freelens, in three minutes.",
    intro:
      "Enter three past clients. Freelens ranks who is worth a message right now, says why, and writes one draft in your tone. What you type stays in your browser.",
    clients: {
      heading: "Step 1 — three past clients",
      hint: "Real clients work best. A first name makes the greeting personal; an email address enables the send button. Both optional.",
      nameLabel: "Client name",
      projectLabel: "Last project",
      monthLabel: "When was that?",
      contactLabel: "Contact first name",
      contactPlaceholder: "For the greeting",
      emailLabel: "Email address",
      emailPlaceholder: "For the send button (optional)",
      typeLabel: "Client type",
      typeBusiness: "Business",
      typePrivate: "Private",
      sample: "Use sample data instead",
      next: "Next: how you write",
    },
    voice: {
      heading: "Step 2 — how you write",
      hint: "Three choices, so the draft sounds like you instead of like software.",
      craftLabel: "Your craft",
      toneLabel: "Tone",
      toneInformal: "Informal",
      toneFormal: "Formal",
      greetingLabel: "Greeting (optional)",
      greetingPlaceholder: "Hi",
      signoffLabel: "Sign-off (optional)",
      signoffPlaceholder: "Best,",
      back: "Back",
      submit: "Show my week",
    },
    queue: {
      heading: "Who is worth a message this week",
      hint: "Ranked by the same rules as the real product: anniversaries first, then season, then silence. No AI in the ranking — every reason is checkable.",
      empty: {
        title: "Honest answer: nobody, this week.",
        body: "None of these three hit an anniversary, a season window, or six months of silence. That is the product working — quiet weeks stay quiet. Try a client from last year, or load the sample data.",
        edit: "Edit clients",
      },
      draftCta: "Write the draft",
      drafting: "Writing in your tone…",
      notThisWeek: "No reason this week:",
      fresh: {
        heading: "Too recent for a note",
        body: "{project} was in {month} — that is {n} months ago. Next natural moment: {next}, a year after the job.",
        privateExtra: "Until then: a short thank-you with a request for a referral is always fine.",
      },
    },
    draft: {
      heading: "Your draft",
      copy: "Copy email",
      copied: "Copied",
      openMail: "Open in your mail app",
      mailHint: "Tip: with an email address this opens straight in your mail app.",
      loopTeaser: "In the real Freelens the agent remembers you sent this — and your Monday email sees who has not replied yet.",
      locked: "Fill in the [fill in:] parts first — Freelens does not invent facts.",
      error: "The draft did not pass our checks. Try once more.",
      limit: "That was today's free draft. The queue and the reasons stay open — for more drafts, get on the list below.",
    },
    gate: {
      heading: "Nothing was saved. That is the point — and the limit.",
      body: "This trial ran in your browser. The real Freelens keeps your client list, redoes this every Monday, and mails you the queue. It is in private beta: {spots} founding spots, {founding} for the first year. After that the standard price is {yearly} a year or {monthly} a month.",
      cta: "Get on the list",
      again: "Run it again with different clients",
    },
    privacyNote:
      "What you type never leaves your browser, except the one client you draft for: name, contact person, project and date are sent once to write the email and are not stored. Email addresses never leave your browser.",
  },

  meta: {
    home: {
      title: "Freelens FrontDesk: stop losing jobs to a slow reply",
      description:
        "For creative freelancers — photographers, videographers, and others who book work by inquiry. Every inquiry gets a fast, personal reply with your real prices, ready to send. You just tap send.",
    },
    try: {
      title: "Try Freelens with 3 clients \u00b7 Freelens",
      description:
        "Enter three past clients and see who is worth a message this week, why, and get one draft in your tone. No account needed.",
    },
    about: {
      title: "Your past clients are your next booking \u00b7 Freelens",
      description:
        "Freelens is the decision layer between your bank account and your bookkeeping. It complements your tools and turns one incoming payment into a simple, trustworthy plan, so paying yourself feels safe, not stressful.",
    },
    tool: {
      title: "After payment · Freelens",
      description:
        "Give an incoming payment a job: separate the VAT, protect an income tax and Zvw reserve, cover business costs, and see what is safely yours.",
    },
    offertes: {
      title: "Your quotes · Freelens",
      description:
        "Every quote you saved: what you asked, what it would leave you, and how it went. Stored on this device only.",
    },
    rekentools: {
      title: "Free calculators for Dutch freelancers · Freelens",
      description:
        "What to charge, and what is actually yours after a payment. Free, no account, on the real 2026 Dutch rules. Your figures stay on your device.",
    },
    privacy: {
      title: "Privacy · Freelens",
      description:
        "What Freelens collects, what it never collects, and how to get your data out or gone.",
    },
    tarief: {
      title: "What should I charge? Your day rate, on the real Dutch tax rules",
      description:
        "Work out the day rate or project quote you need as a Dutch ZZP'er, using the real 2026 brackets, deductions and credits instead of a flat percentage. It tells you your floor, not what the market pays. Your numbers stay on this device.",
    },
  },

  home: {
    hero: {
      eyebrow: "For creative freelancers, on the real Dutch rules",
      headlineStatic: "The business side of a job: priced on the real rules, watched while you wait, split honestly when it pays.",
      headlineLine1: "The business side of a",
      headlineLine3: "Priced on the real rules. Watched while you wait. Split honestly when it pays.",
      contexts: [
        "shoot",
        "gig",
        "campaign",
        "commission",
        "production day",
      ],
      body: "Freelens works the job with you. It prices your fee on the actual 2026 Dutch rules, names what your quote leaves unsaid, keeps the clock on the client's answer, and shows what is genuinely yours when the money lands.",
      primaryCta: "Start with a job",
      secondaryCta: "See how it works",
      trust: {
        free: "Free to try",
        noAccount: "No account",
        onDevice: "Numbers stay on this device",
      },
      updated: "Built on {year} Dutch tax reference values. Updated {updated}.",
      updatedDate: "July 2026",
      mediaAlt: "A Dutch creative freelancer at work",
    },
    heroExample: {
      note: "Example: {rate}% btw, the {year} Dutch rules, {profit} of profit expected this year, and {costs} of business costs this payment has to cover{rateNote}.",
      rateNote: ", so {pct}% of it is held back for tax",
      amountLabel: "How much did you receive?",
      vatGroupLabel: "VAT inclusion",
      includesVat: "Includes VAT",
      excludesVat: "Excludes VAT",
      received: "Payment received",
      vatIncluded: "VAT included in this payment",
      reserve: "Income tax and Zvw reserve",
      business: "Business costs to cover",
      available: "May be available to pay yourself",
      footnote:
        "A planning estimate, not a tax assessment. The real tool uses your own VAT treatment and reserve rules. Your numbers stay on your device.",
    },
    privacy: {
      ariaLabel: "Privacy",
      eyebrow: "Are my numbers safe?",
      heading: "Your financial data never leaves your browser.",
      body: "Your figures are never uploaded. They are saved in this browser, and you can clear them at any time. Freelens counts anonymous page views, and keeps an email address only if you choose to leave one. That is the whole of what we collect.",
      points: ["No accounts.", "No bank connection.", "No figures uploaded."],
      thisDevice: "this device",
      demo: {
        vat: "VAT reserved",
        reserve: "Tax reserve",
        business: "Business costs",
        available: "Available to you",
      },
      staysHere: "Stays here. Never uploaded.",
    },
    faq: {
      ariaLabel: "Frequently asked questions",
      eyebrow: "Questions",
      heading: "Questions worth answering first.",
      topicsLabel: "Question topics",
      groups: {
        number: "Your number",
        vat: "VAT and reserve",
        privacy: "Privacy and safety",
      },
      footnotePrefix: "More detail on the rules and official sources is on the",
      footnoteLink: "accuracy page",
      items: {
        finalBill: {
          q: "Does Freelens calculate my final tax bill?",
          a: "No. Freelens helps you set aside a cautious reserve and see your position. Your final income tax depends on your annual taxable profit, deductions, credits, and personal circumstances, which only the Belastingdienst or your accountant can settle.",
        },
        onePayment: {
          q: "Why can't Freelens know my exact income tax from one payment?",
          a: "Income tax is based on your whole year's taxable profit, not a single payment or your bank balance. A percentage applied to a payment is a reserve rule, not a calculation of what you owe.",
        },
        reservePct: {
          q: "What does the reserve percentage mean?",
          a: "It's the share of a payment (or your profit) you choose to keep aside for income tax and Zvw. Freelens applies it consistently. It's a planning rule you control, not an official figure.",
        },
        balance: {
          q: "Why is my bank balance not my salary?",
          a: "Because part of it belongs to the tax authority, part may be VAT, part is needed to run the business, and part should stay as a buffer. What's genuinely yours to pay yourself is what remains after all of that.",
        },
        bookkeeping: {
          q: "Does Freelens replace bookkeeping?",
          a: "No. Freelens is a planning and reserve tool. It doesn't record transactions, file returns, or replace bookkeeping software or an accountant.",
        },
        provisional: {
          q: "What is a provisional assessment?",
          a: "A voorlopige aanslag is an estimate from the Belastingdienst of the tax you'll owe this year, often paid in instalments. If you have one, you can enter its amount as your reserve method.",
        },
        howOften: {
          q: "How often should I update my numbers?",
          a: "A weekly check-in keeps your position current. Freelens flags when your last check-in is getting old so you know when it's worth a refresh.",
        },
        vatHow: {
          q: "How does VAT work in Freelens?",
          a: "For a 21% or 9% payment, Freelens separates the VAT from the amount so you don't treat it as income. It labels it as VAT to keep aside. Your actual VAT return may be lower or higher after deductible input VAT and other transactions.",
        },
        kor: {
          q: "What happens if I use the KOR?",
          a: "If you pick the KOR treatment, Freelens adds no VAT to the payment. Under the KOR you generally don't charge VAT or file ordinary VAT returns, and input VAT is generally not deductible while participating.",
        },
        reverseCharged: {
          q: "What if VAT is reverse-charged?",
          a: "Pick the reverse-charged treatment and Freelens won't treat any VAT as collected. Confirm the transaction in your bookkeeping. Reverse-charged VAT isn't ordinary output VAT.",
        },
        inputVat: {
          q: "Does Freelens account for deductible input VAT?",
          a: "Not automatically from a single payment. You can enter your actual VAT position from your bookkeeping in the weekly check-in, which is often more accurate than adding up VAT payment by payment.",
        },
        zvw: {
          q: "What is the Zvw contribution?",
          a: "The income-dependent contribution to the Health Care Insurance Act. It can apply on top of income tax and national insurance, up to a maximum contribution income. Freelens shows it as its own line in the guided estimate.",
        },
        storeData: {
          q: "Does Freelens store my financial data?",
          a: "Only on your own device, in your browser, and only when you choose to save. Your figures are never uploaded. Freelens counts anonymous page views, with no cookie and nothing that identifies you, and that is the whole of what leaves your browser.",
        },
        deleteData: {
          q: "Can I delete my saved information?",
          a: "Yes. There's a clear “Clear saved data” option that removes everything Freelens has stored on your device, after a confirmation.",
        },
        bank: {
          q: "Do I need to connect my bank?",
          a: "No. There are no bank connections and no account. You enter the numbers yourself, and they stay on your device.",
        },
      },
    },
    /**
     * The hinge from "what is mine after the payment" to "what do I charge
     * before the job". Placed where the reader has just understood the loop,
     * because that is the point the next question forms on its own.
     */
    /**
     * Both moments, grouped. The hero has already made its promise; this is
     * the first thing on the page a visitor can act on, and it is a choice
     * between two questions rather than a question put to them.
     */
    moments: {
      ariaLabel: "Try Freelens",
      eyebrow: "Try it",
      heading: "Step in where the job is.",
      body: "Price a fee you are considering, or split a payment that landed. Same engine, same {year} Dutch rules, one record, and nothing you type here is saved or sent anywhere until you say so.",
      tablistLabel: "Which moment are you in?",
      before: {
        tab: "I still need to name a price",
        tabSub: "What is left from this fee?",
        deepLink: "Work out a day rate for the whole year",
      },
      after: {
        tab: "I have been paid",
        tabSub: "What here is actually mine?",
        deepLink: "See your whole position",
      },
      whyDifferent: {
        toggle: "Why do the two tabs show different percentages?",
        body: "Because they answer different questions. Quoting asks what one more job adds on top of the year you already expect, so it is taxed at the rate that job pushes you into. A payment that has arrived belongs to a year you are already committed to, so it carries its share of the whole year's bill instead. Same engine, same rules, two honest answers.",
      },
    },

    signup: {
      ariaLabel: "Hear when the rules change",
      heading: "The rules move. This site moves with them.",
      body: "Every figure here comes from config {version}, checked against belastingdienst.nl on {date}. Leave an email and we tell you when the rules change and the figures move. That is the only mail you will get.",
      bodyFallback: "Every figure here is checked against belastingdienst.nl. Leave an email and we tell you when the rules change and the figures move. That is the only mail you will get.",
      emailLabel: "Your email",
      placeholder: "you@example.com",
      submit: "Tell me when the rules change",
      sending: "One moment",
      done: "Noted. You will hear from us when the figures move, and not before.",
      error: "That did not go through. Check the address and try again.",
      privacyNote: "Stored for this one purpose, never shared, and every mail has an unsubscribe. Your calculations stay on your device either way.",
    },

    frontdesk: {
      heroEyebrow: "FrontDesk",
      heroTitle: "Stop losing jobs to a slow reply.",
      heroSub:
        "Every inquiry gets a fast, personal reply with your real prices — ready to send. You just tap send.",
      heroCta: "Get early access",
      waitlist: {
        heading: "FrontDesk opens soon",
        sub: "Get on the list and we'll email you when it's your turn. Signing up is free and commits you to nothing.",
        nameLabel: "Your name",
        namePlaceholder: "First name is fine",
        emailLabel: "Your email",
        emailPlaceholder: "you@example.com",
        craftLabel: "What do you make?",
        crafts: {
          photographer: "Photographer",
          videographer: "Videographer",
          designer: "Designer",
          illustrator: "Illustrator",
          other: "Something else",
        },
        submit: "Get early access",
        sending: "One moment",
        done: "Almost there: open your inbox and click the confirmation link. That is how we know the address is yours.",
        error: "That did not go through. Check the fields and try again.",
        privacyNote: "Used only to tell you about FrontDesk. Confirmed by you, deleted on request, never shared.",
      },
    },

    rebooking: {
      heroEyebrow: "For creative freelancers",
      betaPill: "Private beta \u00b7 onboarding the first 25",
      heroQuestion: "When did you last talk to your best client from last year?",
      heroSub: "Your easiest next job is a client you already know. Freelens remembers who, knows when, and writes the first email \u2014 in your voice. You press send.",
      heroCta: "Join the waitlist",
      heroCtaTry: "Try it with 3 clients — no account",
      how: {
        eyebrow: "How it will work",
        heading: "Three steps, one of them yours.",
        steps: [
          {
            title: "Give it your past clients, once",
            body: "Name, what you did, when, roughly what it was worth. About fifteen minutes, and it never needs doing again.",
          },
          {
            title: "Each week: two to four people worth a message",
            body: "Chosen for a real reason \u2014 a year since the last shoot, briefing season in their world \u2014 never \u201cjust checking in\u201d.",
          },
          {
            title: "It drafts, you send",
            body: "The email arrives written in your voice. You edit what you want and send it from your own inbox. Freelens never sends anything to anyone.",
          },
        ],
      },
      example: {
        kicker: "What that looks like",
        heading: "One suggestion, the way you get it every week.",
        recordLabel: "From your own records",
        recordName: "Marloes \u00b7 De Groene Kamer (interior design store)",
        recordProject: "Shot the autumn campaign \u00b7 October 2025 \u00b7 \u00b1 \u20ac 1,800",
        reasonLabel: "The reason, this week",
        reasonText: "Last year, the briefing for the autumn campaign happened in August.\nIf De Groene Kamer shoots again this year, it's being planned now.",
        draftLabel: "The email, in your voice",
        draftSubject: "Subject: Autumn campaign De Groene Kamer?",
        draftBody: "Hi Marloes,\n\nLast October I shot the autumn campaign for De Groene Kamer \u2014 one of the best jobs of that season.\n\nI'm planning my autumn now and thought of you: is there another campaign on the calendar this year? If so, I'd love to hold some space.\n\nBest,\nSam",
        micro: "An example. Every reason comes from your own records \u2014 if a date is off, you correct it. You send the email yourself, from your own inbox.",
      },
      offer: {
        eyebrow: "Founding offer",
        heading: "Freelens Rebooking is in private beta.",
        body: "We are onboarding the first 25 freelancers. Nothing here is live yet, and we would rather say that plainly than pretend otherwise.",
        priceLine: "Founding price: {founding} for the first year.",
        priceNote: "The standard price will be {yearly} a year or {monthly} a month. Founding spots are limited to {spots} and only exist before launch.",
      },
      waitlist: {
        heading: "Get on the list for one of the 25 spots",
        noCommit: "Signing up is free and commits you to nothing. When the beta opens, we offer the {spots} founding spots ({founding} for the first year) in order of signup \u2014 you decide then.",
        nameLabel: "Your name",
        namePlaceholder: "First name is fine",
        emailLabel: "Your email",
        emailPlaceholder: "you@example.com",
        craftLabel: "What do you make?",
        crafts: {
          photographer: "Photographer",
          videographer: "Videographer",
          designer: "Designer",
          illustrator: "Illustrator",
          other: "Something else",
        },
        submit: "Put me on the waitlist",
        sending: "One moment",
        done: "Almost there: open your inbox and click the confirmation link. No confirmation, no spot \u2014 that is how we know the address is yours.",
        error: "That did not go through. Check the fields and try again.",
        privacyNote: "Used only to tell you about the beta. Confirmed by you, deleted on request, never shared.",
      },
      trust: {
        eyebrow: "Where the line is",
        heading: "The agent never sends anything.",
        body: "You always send it yourself, from your own mail. Your client data is used for nothing else and can always be exported and deleted.",
        points: [
          "Every email leaves from your own inbox, pressed by you",
          "Client records hold a name, a project, a date \u2014 never addresses, phone numbers or registration numbers",
          "Export everything or delete everything, from day one",
        ],
      },
      tools: {
        eyebrow: "Meanwhile, free",
        heading: "Free calculators for Dutch freelancers.",
        body: "The deterministic tax engine behind Freelens is live today, checked against belastingdienst.nl.",
        teaser: "The flat 30% rule misses by up to \u20ac16.720 on real numbers.",
        teaserCta: "See the evidence",
        allCta: "All calculators",
      },
    },

    lifecycle: {
      ariaLabel: "How Freelens works a job",
      eyebrow: "One job, start to finish",
      heading: "Freelens works the job with you.",
      body: "Not two calculators. One record that follows the job from the first number you type to the money in your account, and it gets sharper every time you tell it how a quote ended.",
      stages: {
        appears: {
          title: "A job shows up",
          body: "Type the fee you have in mind. Freelens prices it on the real brackets, deductions and credits, on top of what you already expect this year, and shows what you would actually keep.",
        },
        beforeSend: {
          title: "Before the quote goes out",
          body: "It puts the questions creative quotes skip in front of you: usage rights, revision rounds, a deposit, a kill fee. Unanswered is fine. Unasked is how a job doubles in size.",
        },
        waiting: {
          title: "While you wait",
          body: "Save the quote and the clock runs. Two weeks without an answer and Freelens says so, before following up gets awkward. An invoice gets the same treatment at 30 and 60 days.",
        },
        outcome: {
          title: "Won, or lost",
          body: "One tap records the outcome and the fee you actually settled on. The gap between quoted and agreed is your own discount history, and no bookkeeping tool can hold it, because a lost quote never reaches one.",
        },
        lands: {
          title: "The money lands",
          body: "The payment splits into btw, a tax reserve on the real rules, business costs, and what is genuinely yours. Counted into your year, so the next quote lands in the right bracket.",
        },
        learns: {
          title: "The next job knows more",
          body: "Every recorded outcome sharpens the picture: what you quote, what you win, what you settle for. That is the one dataset nobody else has, what the market says to your prices, and it lives on your device.",
        },
      },
    },

    flatRule: {
      ariaLabel: "What the flat rule costs",
      eyebrow: "The evidence",
      heading: "What the 30% rule actually costs.",
      link: "How we know: every rate, source and case",
    },

    accuracy: {
      ariaLabel: "Accuracy and limitations",
      eyebrow: "Accuracy",
      heading: "Honest about what this is.",
      sentence:
        "Freelens gives you a clear planning estimate to act on, never a claim about your final tax.",
      detail:
        "It provides planning estimates based on the information and reserve rules you enter. It does not calculate your final tax assessment, is not tax advice, and doesn't replace the Belastingdienst, an accountant, or your bookkeeping.",
      link: "Read our accuracy notes and official sources →",
    },
  },

    notFound: {
    title: "Page not found \u00b7 Freelens",
    body: "This page doesn't exist.",
    back: "Back to Freelens",
  },

  aboutPage: {
    eyebrow: "Why Freelens exists",
    heading: "Your past clients are your next booking.",
    intro: "A creative freelancer's quietest months are rarely a quality problem. The work was good. The client was happy. There is just nobody who remembers when the natural moment is to get back in touch \u2014 so it doesn't happen, or it happens as \u201cjust checking in\u201d, and that feels awkward for everyone.",
    what: {
      h: "What Freelens does",
      p1: "Freelens remembers who your clients are, knows when a message makes sense, and writes the first email \u2014 in your voice. Each week: two to four people worth a message, each with a real reason. A year since the last shoot. Briefing season in their world. Never \u201cjust checking in\u201d.",
      p2: "You edit what you want and send it yourself, from your own inbox. Freelens never sends anything, to anyone.",
    },
    boundary: {
      h: "Where the line is",
      p1: "Client records hold a name, a project, a date and a rough value. No addresses, no phone numbers, no registration numbers. Everything can be exported and deleted from day one, and your client data is used for nothing else.",
    },
    trust: {
      h: "Why you would trust us with your clients",
      p1: "The tax engine behind our free calculators works with the real Dutch brackets, deductions and credits for 2026 \u2014 every figure checked against belastingdienst.nl, every result with an explanation you can verify. We even have a page showing where the popular 30% rule of thumb misses by up to \u20ac 16,720.",
      p2: "The same standard applies to the agent: every reason comes from your own records, every email is bound to what actually happened, and nothing is invented. If a date is off, you correct it and Freelens remembers.",
    },
    tools: {
      h: "The free calculators stay free",
      p1: "What to charge before the job, and what is genuinely yours after the payment \u2014 the same calculation, both directions. No account, and your figures stay in your browser. That stays true.",
    },
    going: {
      h: "Where this is going",
      p1: "Freelens Rebooking is in private beta. We are onboarding the first 25 freelancers, and we would rather say out loud that nothing is live yet than pretend otherwise. If you are a photographer, videographer, designer or illustrator and you want your best clients not to forget you: get on the list.",
    },
    ctaPrimary: "Put me on the waitlist",
    ctaSecondary: "See the free calculators",
  },

  accuracyPage: {
    metaTitle: "Accuracy and sources · Freelens",
    metaDescription:
      "What Freelens does and does not calculate, the reserve rules it applies, and the official Dutch sources behind them.",
    eyebrow: "Accuracy and sources",
    heading: "What Freelens is honest about.",
    taxYear: "Tax year {year}",
    lastReviewed: "Last reviewed {date}",
    reviewedFallback: "recently",
    intro:
      "Freelens provides planning estimates based on the information and reserve rules you enter. It does not calculate your final tax assessment and is not tax advice.",
    isHeading: "What Freelens is",
    is: [
      "It works the reserve out on the real brackets, deductions and credits, or applies a rule you chose instead.",
      "It separates VAT and makes your reserves visible.",
      "It turns a payment into a clear allocation plan.",
      "It keeps a local record of your position, on your device only.",
    ],
    isNotHeading: "What Freelens is not",
    isNot:
      "Not the Belastingdienst, an accountant, bookkeeping software, a tax return, or a provisional assessment. A percentage applied to a payment is a reserve rule, not a calculation of tax owed. Your final income tax depends on annual taxable profit, deductions, credits, other income, and personal circumstances Freelens does not model.",
    referenceHeading: "Reference values for {year}",
    vatLine: "VAT: {rates}.",
    incomeTaxLine:
      "Income tax: {rates}, applied to your profit for the year after the entrepreneur deductions and the MKB-winstvrijstelling.",
    creditsLine:
      "Tax credits: the algemene heffingskorting and the arbeidskorting, both income-dependent, are subtracted from the tax owed.",
    zvwLine:
      "Zvw: {rate}%, a separate contribution with its own capped base, never folded into the income tax figure.",
    configLine:
      "Config {version}. Every figure checked against belastingdienst.nl on {date}, and it needs rechecking before it supports another tax year.",
    deterministic:
      "All calculations are deterministic: the same inputs always produce the same numbers, with no guessing and no hidden model. Every result shows a “Why this number?” breakdown you can check.",
    seeEveryRate: "See every rate, threshold and source",
    flatRule: {
      heading: "What the flat 30% rule got wrong",
      intro:
        "Freelens used to reserve 30% of revenue. That is wrong in both directions at once, and the error is largest exactly where the money is. These three cases come straight from the engine, which is tested against all ten.",
      colCase: "Case",
      colOld: "Old rule",
      colReal: "Really owed",
      colError: "Error",
      over: "over by {amount}",
      under: "under by {amount}",
      exact: "exact",
      profitLine: "{revenue} revenue, {costs} costs",
    caseNames: {
      "7": "A good year, €95.000 profit",
      "9": "High costs, €80.000 revenue",
      "10": "A loss year, €15.000 revenue",
    },
      whyItMatters:
        "Over-reserving costs liquidity you get back. Under-reserving is a bill you cannot pay. A single percentage cannot avoid both, which is why Freelens applies the real brackets, deductions and credits instead.",
    },
    edgeHeading: "Edge cases to know",
    edgeCases: {
      kor: {
        title: "KOR (small businesses scheme)",
        body: "On the KOR you don't charge VAT. Pick Other → KOR and Freelens sets no VAT aside. It doesn't file VAT returns for you.",
      },
      reverse: {
        title: "Reverse-charged VAT",
        body: "Reverse-charged invoices carry no VAT for you to reserve. Select that treatment so the amount isn't counted as VAT to set aside.",
      },
      mixed: {
        title: "Multiple VAT rates on one invoice",
        body: "Freelens allocates one payment at a time. If an invoice mixes 21% and 9%, enter each part separately, or use Other → Mixed and confirm the split in your bookkeeping.",
      },
      outside: {
        title: "Income outside freelancing",
        body: "Employment income raises the bracket your freelance profit lands in, and Freelens accounts for that if you enter it. What it does not do is subtract wage tax your employer already withheld, so count that as already set aside. A partner's income is not modelled at all.",
      },
      deductions: {
        title: "Major deductions",
        body: "The zelfstandigenaftrek, the startersaftrek and the MKB-winstvrijstelling are all applied. Investeringsaftrek, fiscale oudedagsreserve and carrying a loss forward are not, so a year with a big equipment purchase or a loss to carry will come out lower than this estimate.",
      },
    },
    accountantHeading: "When to talk to an accountant",
    accountantIntro:
      "Freelens is a planning tool, not a substitute for advice. Check with an accountant or the Belastingdienst when:",
    accountantList: [
      "your income or family situation changed a lot this year;",
      "you have substantial income outside freelancing;",
      "you're unsure whether the KOR, reverse charge, or a special scheme applies to you;",
      "you're planning a large purchase or investment;",
      "it's your first year, or you've never filed a Dutch return.",
    ],
    sourceNotes: {
      "reserve-for-tax":
        "Income tax is assessed annually on your total taxable profit, so setting part of each payment aside is a planning habit. Entrepreneurs are advised to reserve for income tax, national insurance and the Zvw contribution.",
      "vat-rates":
        "Covers the 21% and 9% rates, exemptions, and how VAT is calculated and filed.",
      kor: "KOR participants do not charge VAT, do not file ordinary VAT returns, and cannot deduct input VAT while participating.",
      "input-vat":
        "The VAT you remit is the VAT you charged (output VAT) minus deductible input VAT on business costs, so the amount owed is usually less than the VAT collected. Covered on the official VAT page.",
      "reverse-charge":
        "When VAT is reverse-charged the customer accounts for it, so you charge no VAT and it is not ordinary output VAT to set aside.",
      zvw: "The income-dependent Zvw contribution applies in addition to income tax and national insurance, up to a maximum contribution income.",
      zelfstandigenaftrek:
        "€1.200 for 2026 for qualifying entrepreneurs meeting the hours criterion who had not reached AOW age at the start of the year. Applied by the engine when you confirm the hours criterion.",
      "mkb-exemption":
        "12,70% of profit after entrepreneur deductions for 2026. Applied by the engine on every estimate, including in a loss year, where it makes the loss smaller.",
      "invoice-system":
        "Under the invoice system the VAT period is generally set by invoicing rules rather than when the customer pays.",
      "cash-system":
        "Some qualifying businesses use the cash system, under which VAT follows receipts and payments rather than invoice dates.",
    },
    sourcesHeading: "Official sources",
    verifiedLink: "Verified link",
    needsReview: "Needs review",
    openFreelens: "Open Freelens",
    categories: {
      vat: "VAT",
      incomeTax: "Income tax & Zvw",
      deductions: "Deductions",
      invoicing: "Invoicing",
    },
  },
  methodologyPage: {
    metaTitle: "How it's calculated · Freelens",
    metaDescription:
      "The exact order Freelens works in, the brackets, deductions and credits it applies, a worked example, and where every figure came from.",
    eyebrow: "How the estimate is calculated",
    heading: "How the estimate is calculated",
    intro:
      "Freelens does not apply a flat percentage to what your clients pay you. It works out income tax and the Zvw contribution the way the Belastingdienst does, in this order.",
    taxYear: "Tax year {year}, for someone who has not reached AOW age.",
    orderHeading: "The order it works in",
    steps: [
      "Start with profit: revenue excluding VAT, minus business costs.",
      "Subtract the zelfstandigenaftrek and, if you qualify, the startersaftrek.",
      "Subtract the MKB-winstvrijstelling from what is left.",
      "Apply the income tax brackets to that figure.",
      "Subtract the algemene heffingskorting and the arbeidskorting, which come off the tax owed rather than off your income.",
      "Add the Zvw contribution, which is a separate bill with its own rate and its own ceiling.",
    ],
    bracketsHeading: "Income tax brackets",
    colTaxableIncome: "Taxable income",
    colRate: "Rate",
    bracketNote:
      "The first bracket includes premies volksverzekeringen, which are only levied on income up to that ceiling.",
    deductionsHeading: "Deductions and credits",
    zelfstandigen: "{amount}, if you spend at least 1.225 hours a year on the business.",
    starters: "{amount}, on top, for up to three of your first five years.",
    mkb: "{pct}% of what is left after those deductions.",
    exampleHeading: "A worked example",
    exampleNote:
      "That is {effective}% of the profit overall, while the next euro earned is taxed at {marginal}%. A payment already counted in the profit you expect carries its share of the whole year's bill, the first figure. Only income beyond that expectation is reserved at the second rate, because it lands on top of everything already counted.",
    assumesHeading: "What this estimate assumes",
    assumesIntro:
      "Nothing here is hidden to make the number look cleaner. These are the assumptions attached to every result the app produces.",
    sourcesHeading: "Where each figure came from",
    sourcesIntro:
      "Only belastingdienst.nl. No aggregators, no comparison sites, no accountancy summaries. Each entry records the date it was checked.",
    derived: "Derived",
    checked: "Checked {date}",
    footerPrefix:
      "For what Freelens does and does not calculate more broadly, and when to talk to an accountant, see",
    footerLink: "accuracy and sources",
  },

  offertesPage: {
    eyebrow: "Your quotes",
    heading: "Every price you named.",
    lead:
      "Saved quotes, with the figures frozen the day you quoted. Record how each one went and this list becomes the one thing no bookkeeping shows: what the market said to your prices.",
    onDevice: "Stored on this device only. Clearing your browser data clears this list.",
    emptyTitle: "No quotes saved yet.",
    emptyBody:
      "Price a job with the calculator, then save the quote. It takes one tap and gives you something to come back to when the client answers.",
    emptyCta: "Price a job",
    signals: {
      ariaLabel: "What needs attention",
      fallbackName: "A saved quote",
      quoteWaiting: "{name} has been quiet for {days} days on a {amount} quote. Time to ask.",
      paymentWaiting: "{name}: {amount} invoiced, {days} days open. Worth a reminder.",
      paymentOverdue: "{name}: {amount} is past its due date.",
      outstandingTotal: "{count} older invoices open, {amount} in total.",
      recentlyPaid: "{name} paid {amount}.",
    },
    status: {
      quoted: "Open",
      accepted: "Won",
      invoiced: "Invoiced",
      paid: "Paid",
      lost: "Lost",
      archived: "Archived",
    },
    daysOpen: "Open for {days} days",
    savedOn: "Saved {date}",
    fee: "{amount} quoted, excluding btw",
    takeHome: "{amount} yours if it lands as quoted",
    rightsMissing: "Usage rights were not discussed when this was quoted.",
    won: "Went ahead",
    lost: "Didn't go ahead",
    finalFeeLabel: "Agreed fee, excluding btw",
    finalFeeHint: "What you actually settled on. Pre-filled with the quote.",
    noteLabel: "What decided it? (optional)",
    noteHint: "One line, for yourself. \u201cBudget went to video\u201d teaches more than the status.",
    confirmWon: "Record as won",
    confirmLost: "Record as lost",
    wonSummary: "Won at {amount}",
    wonBelowQuote: ", {diff} under the quote",
    lostSummary: "Lost",
    reopen: "Reopen",
    outcomePrefix: "Your note: ",
  },


  rekentoolsPage: {
    eyebrow: "Free calculators",
    heading: "Free calculators for freelancers.",
    lead: "No account, nothing uploaded, built on the real 2026 Dutch rules with every figure checked against belastingdienst.nl.",
    tarief: {
      title: "What do you need to charge?",
      body: "Your day rate or a single project fee, worked out backwards from what you want to keep.",
      cta: "Open the rate calculator",
    },
    tool: {
      title: "A payment landed. What is yours?",
      body: "Split a payment into btw, a tax reserve, business costs and what you can genuinely pay yourself.",
      cta: "Open the workspace",
    },
    accuracyTeaser: "The flat 30% rule misses by up to €16.720 on real numbers. See the cases, the sources and every rate we use.",
    accuracyCta: "Accuracy and sources",
  },

  privacyPage: {
    eyebrow: "Privacy",
    heading: "What we know, and what we never will.",
    updated: "Version of {date}.",
    calc: {
      title: "The calculators",
      body: "Everything you type into the calculators stays in your browser. It is saved on your device only when you choose to save, you can clear it at any time, and it is never uploaded to Freelens.",
    },
    analytics: {
      title: "Page views",
      body: "Freelens counts anonymous page views through Vercel Web Analytics: no cookies, no profile, nothing that identifies you. Custom events carry a name only, never an amount, a client, or an email address.",
    },
    email: {
      title: "Your email address",
      body: "We keep an email address only if you leave one yourself, on the waitlist or for rule-change updates, and only after you confirm it from your inbox. It is used for that one purpose, never shared, and deleted on request. Waitlist signups also record the craft you select.",
    },
    app: {
      title: "The Rebooking app (private beta)",
      body: "If you use the app at /app: your account is an email address with a magic link, no password. Client records you enter (name, project, date, value, notes \u2014 never addresses, phone or registration numbers) are stored with Supabase in the EU, readable only by you. Draft emails are written by Anthropic's Claude API, configured without training on your data; the model sees only the record you entered. The weekly email goes through Resend, only when there is something to say, with a one-click stop. Export everything or delete your account, immediately and permanently, from inside the app.",
    },
    never: {
      title: "What we never collect",
      body: "No bank connection, no client addresses or phone numbers, no KvK or VAT numbers, no uploaded documents.",
    },
    rights: {
      title: "Your rights",
      body: "You can ask what we hold about you, have it corrected or deleted, and complain to the Autoriteit Persoonsgegevens. Every mail we send has an unsubscribe that works.",
    },
    contactNote: "Questions about this page: use the contact link in the footer.",
  },


  agent: {
    title: "Rebooking",
    signOut: "Sign out",
    loading: "One moment.",
    loadError: "Could not load your data. Your connection or the session hiccuped; nothing is lost.",
    retry: "Try again",
    login: {
      intro: "Private beta. Sign in with a magic link; no password exists to leak.",
      emailLabel: "Your email",
      cta: "Send me the link",
      sending: "Sending",
      sent: "Link sent. Open your inbox and you are in.",
      error: "That did not work. Check the address and try again.",
    },
    onboarding: {
      progress: "Step {n} of {total}: {name}",
      stepCraft: "your craft",
      stepVoice: "your voice",
      stepImport: "your clients",
      stepConfirm: "check the rows",
      craftQuestion: "What do you make?",
      voiceQuestion: "Paste one or two emails you once sent a client.",
      voiceHint: "For the tone: greeting, sign-off, je or u. Two is plenty.",
      voicePrivacy: "The pasted text never leaves this browser. Only the derived profile (greeting, sign-off, je/u, style) is saved, and you can see all of it.",
      importQuestion: "Your past clients, one per line.",
      importHint: "Name, what you did, when, roughly what it was worth. Commas between them. Ten is a good start.",
      importPlaceholder: "Rituals, campagneshoot, maart 2026, \u20ac2400",
      parse: "Read the rows",
      confirmTitle: "Check every row before anything is saved.",
      confirmHint: "Nothing enters the database unconfirmed. Edit inline, delete what is wrong.",
      confirmEmpty: "Nothing readable yet. Go back and add a line per client.",
      fields: { name: "Client", email: "Email (optional)", project: "Last project", date: "When (yyyy-mm-dd)" },
      freeLimitNote: "The beta tracks {limit} relationships. {dropped} of these rows will NOT be saved; delete rows until {limit} remain to choose which.",
      next: "Next",
      back: "Back",
      skip: "Skip for now",
      finish: "Save and start",
      saving: "Saving",
      saveError: "Saving failed. Nothing was lost; try again.",
    },
    queue: {
      heading: "Worth a message this week",
      empty: "Nothing this week. That is the design: when there is no honest reason to write anyone, this page says so instead of inventing one.",
      reasons: { anniversary: "Anniversary", season: "Season", gap: "Long quiet", referral: "Referral", manual: "Your pick" },
      writeDraft: "Write the email",
      drafting: "Writing, in your tone",
      draftError: "Drafting failed. Try again in a minute.",
      subjectLabel: "Subject",
      bodyLabel: "Email",
      placeholdersOpen: "Fill these in first: {list}. The draft never invents facts, so these blanks are yours.",
      copy: "Copy",
      openMail: "Open in mail",
      markSent: "I sent it",
      sentNoted: "Noted",
      snooze: "Snooze {months}m",
      snoozed: "{name} snoozed.",
      undo: "Undo",
      tracking: "Tracking {count} of {limit} relationships in the beta.",
    },
    outcomes: {
      heading: "How did these go?",
      intro: "Sent a while back, no outcome recorded. Two clicks, and the numbers below start meaning something.",
      results: { reply_positive: "Positive reply", reply_neutral: "Neutral reply", reply_negative: "Negative reply", booked: "Booked", no_reply: "No reply" },
      valueLabel: "Booked value, excluding btw (optional)",
      save: "Record",
      saved: "Recorded",
    },
    numbers: {
      heading: "The numbers",
      relationships: "Relationships tracked",
      sent: "Touches sent",
      replyRate: "Reply rate",
      booked: "Booked this quarter",
      taxNote: "\u2248 {net} for you after btw and reserve, on your saved tax profile.",
      noData: "\u2014",
    },
    account: {
      heading: "Your data",
      export: "Export everything (JSON)",
      delete: "Delete my account",
      deleteWarning: "Immediate and permanent. Everything goes, no recovery window.",
      deleteConfirm: "Delete everything",
    },
  },

  rate: {
      eyebrow: "Before the job",
      heading: "What do you need to charge?",
      floor:
        "This is what you need to charge, not what you can charge. It is your floor: below it the work does not pay for itself once tax and costs are out.",
      tabsLabel: "What are you pricing?",
      tabs: {
        year: { label: "My rate for the year", sub: "Set a day rate" },
        job: { label: "This one job", sub: "Quote a project" },
      },
      targetLabel: "What do you want to earn, after tax?",
      targetHint:
        "Your take-home for the year, once income tax and Zvw are paid. Not your revenue.",
      daysLabel: "How many days can you realistically bill?",
      daysHint:
        "Not 260. Take out holidays, sick days, admin, chasing work and the quiet weeks. Most freelancers bill far fewer days than they plan for, and the rate is what pays for the gap.",
      daysValue: "{days} days",
      optimism:
        "If you set your rate for {optimistic} days and bill {actual}, you charge {rate} a day and end the year on {earned} instead of {needed}. That is {short} short, {pct}% of your year.",
      costsLabel: "Your yearly business costs",
      costsHint:
        "Software, insurance, gear, workspace, your accountant, professional memberships. Leave blank if you genuinely have none.",
      costsPlaceholder: "e.g. 6000",
      dayRate: "Your day rate, excluding btw",
      dayRateNote: "{days} billable days at this rate is {revenue} of revenue for the year.",
      rateCaption: "Where every euro of your rate goes",
      effectiveRate:
        "Across the whole year that works out at {pct}% in income tax and Zvw. Not a flat rate: it is what the real brackets, deductions and credits add up to at this profit.",
      keepLabel: "What do you want to keep from this job?",
      keepPlaceholder: "2000",
      jobCostsLabel: "Costs just for this job (optional)",
      jobCostsHint:
        "Travel, an assistant, equipment rental, licensing. Money that goes straight back out. It is added to the quote in full, because it is deductible.",
      jobCostsPlaceholder: "e.g. 500",
      projectedLabel: "Profit you already expect this year",
      projectedHint:
        "Everything except this job. It decides which bracket this job lands in, which is why the same job is worth different amounts in January and November.",
      projectedPlaceholder: "e.g. 40000",
      vatLabel: "btw you charge on this",
      vatGroupLabel: "btw rate",
      vatNote: "btw is charged on top and passed straight on. It never changes what you keep.",
      quote: "Quote this, excluding btw",
      quoteInvoice: "{gross} on the invoice, including {vat} btw.",
      quoteCaption: "Where every euro of this quote goes",
      emptyTitle: "Fill in what you want to keep and the profit you already expect this year.",
      emptyBody:
        "Both are needed. Without the profit figure there is no way to know which bracket this job lands in, and a number produced without it would be a guess wearing a decimal point.",
      crossing: {
        title: "This job crosses a bracket",
        body:
          "It takes you past €{threshold} of taxable income, so about {amount} of it is taxed in the higher bracket. Across the whole job that averages {pct}%.",
        note:
          "A flat percentage cannot see this, which is why it under-quotes exactly the jobs that matter most.",
      },
      whyThisNumber: "Why this number?",
      assumptionsToggle: "What this assumes ({count})",
      flatRuleHeading: "Most rate calculators get this wrong",
      flatRuleBody:
        "A flat percentage is wrong in both directions at once. On {revenue} of revenue with {costs} of costs, the 30% rule sets aside {oldReserve} against a real bill of {realBill}. At {profit} of profit the same rule leaves you {shortfall} short. Freelens used to apply that rule. Replacing it is the reason this page can exist.",
      flatRuleLink: "See what the flat rule gets wrong, case by case",
      bothDirections:
        "Before the job: what do I need to charge. After the payment: what is actually mine. Same calculation, both directions.",
      toToolCta: "See what is actually yours",
      profileUsing: "Using what you already told Freelens: {claimed}.",
      profileNone:
        "You have not told Freelens whether you qualify for the zelfstandigenaftrek or the extra deduction for your first years in business, so this figure leaves both out. Claiming them lowers what you need to charge.",
      profileHours: "the 1.225 hours a year that unlock the zelfstandigenaftrek",
      profileStarter: "your first years in business",
      profileSalary: "a salary alongside this",
      changeDetails: "Change your details",

      /**
       * The guided flow. Deliberately short: every line here is read by someone
       * who has not decided yet whether this is worth their time. Anything that
       * explains rather than asks belongs behind `whyAsk`.
       */
      /** Allocation-bar labels. Hardcoding these left English on Dutch screens. */
      strip: {
        heading: "Make this more accurate",
        forThisCalc: "Applies to this calculation only. Save your answers for every calculation in the workspace settings.",
      },
      segments: {
        annualCosts: "Business costs",
        jobCosts: "Job costs",
        tax: "Income tax and Zvw",
        yours: "Yours",
      },

      /**
       * The per-job flow: I am thinking of quoting X, what is left?
       *
       * Named carefully. This does not recommend a price, it shows what a price
       * you chose leaves you, so nothing here may say "what you should charge".
       */
      job: {
        progressLabel: "Where you are",
        stepOf: "Step {n} of {total}",
        announce: "Step {n} of {total}. {question}",
        back: "Back",
        next: "Next",
        submit: "Show what I keep",
        whyAsk: "Why are we asking?",
        optional: "Optional",

        fee: {
          question: "What are you thinking of charging?",
          helper: "Your fee for the whole job, excluding btw.",
          fieldLabel: "Your fee",
          placeholder: "1800",
          why: "The number you are considering putting on the quote. Freelens takes it apart: what the job costs you, what the tax on it comes to, and what is genuinely left. It has no view on whether the fee is right for the work.",
          vatLabel: "btw you add on top",
          vatGroupLabel: "btw rate",
          vatNote: "Added to the invoice and passed straight on. It never changes what you keep.",
          daysLabel: "Days of work",
          daysHelper: "Optional. Gives you what the job pays per day.",
          daysPlaceholder: "2",
        },
        costs: {
          question: "What will this job cost you?",
          helper: "Travel, an assistant, rental, licensing.",
          fieldLabel: "Costs for this job",
          placeholder: "e.g. 200",
          why: "Money that goes straight back out on this job. It lowers your tax, but it still comes out of the fee before anything is yours. Leaving it blank is safe: it just means the fee covers nothing but your own time.",
        },
        profit: {
          question: "Where are you in your year?",
          helper: "Profit you already expect this year, before this job.",
          fieldLabel: "Profit so far this year",
          placeholder: "0",
          why: "Dutch income tax is worked out once a year across rising brackets, so the same fee is worth more in January than in November. This is what decides which bracket this job lands in. If Freelens already knows your figures, it has filled this in.",
          fromProfile: "Taken from your saved figures. Change it here for this calculation only.",
        },

        /**
         * Counting toward the year. Not "save this job": nothing is filed,
         * nothing has to be maintained, and there is no list to come back to.
         * The user is adding one number to one number.
         */
        year: {
          count: "Count this toward my year",
          countHint: "Adds {amount} to your expected profit, so your next quote lands in the right bracket.",
          counted: "Counted. {total} so far this year.",
          alreadyCounted: "Already counted.",
          undo: "Undo",
          undone: "Removed again.",
          prefilled: "From what you have counted this year. Change it here for this calculation only.",
          adjust: "Use a different figure",
          reset: "Start the year again",
          resetHint: "Clears the running total on this device.",
          rolledOver:
            "It is a new tax year, so your running total has started again at zero. Last year's figure would put this year's work in the wrong bracket.",
          rolledOverDismiss: "Got it",
        },

        guardrail: {
          title: "Before this goes out",
          intro: "The four terms creative quotes forget more than any others. Freelens has no view on the answers, only that the questions exist before the client settles them for you.",
          rights: "Usage: what may the client do with the work, where, and for how long?",
          revisions: "Revisions: how many rounds does this fee include?",
          deposit: "Deposit: what part is paid before you start?",
          killFee: "Kill fee: what is owed if the job is cancelled late?",
        },

        save: {
          cta: "Save this quote",
          why: "Keeps this quote on this device, with today's figures frozen, so you can record later whether it landed.",
          clientLabel: "Client or project",
          clientPlaceholder: "e.g. Studio Noord",
          clientHint: "Optional. A name is enough to tell two quotes apart.",
          rightsLabel: "Does the quote say what the client may do with the work?",
          rightsHint: "Usage: where, how long, exclusive or not. The term creative quotes most often leave out.",
          rightsSpecified: "Yes, it is in there",
          rightsMissing: "Not discussed yet",
          confirm: "Save quote",
          savedNote: "Saved on this device. Come back to record how it went.",
          toList: "See your quotes",
        },

        result: {
          eyebrow: "What you keep",
          ofFee: "of your {fee} fee",
          summary: "After {tax} in income tax and Zvw{costsClause}.",
          costsClause: ", and {costs} of costs for the job",
          invoice: "{gross} on the invoice, including {vat} btw.",
          perDay: "{rate} per day across {days} days.",
          keptShare: "You keep {pct}% of what you charge.",
          firstJobWarning:
            "This assumes this is your first work of the year. If you have already earned, this job is taxed higher and you keep less.",
          fixFirstJob: "Add what I have earned",
          notAdvice:
            "What a fee leaves you, not a view on whether the fee is right. Freelens has no opinion on what your market pays.",
          adjust: "Change my answers",
          breakdown: "How this was worked out",
          toTool: "See what's actually mine",
          toTarief: "Work out a day rate for the year instead",
        },
      },

      estimateResult: {
        perDay: "per billable day",
        eyebrow: "Your baseline rate \u00b7 estimate",
        summary: "At {days} billable days a year, the work needs {revenue} in revenue for {take} to be yours \u2014 using your {pct}% tax estimate.",
        taxRateLabel: "Effective tax rate on profit",
        taxRateHint: "Your estimate of income tax plus contributions where you work. Adjust it and the rate follows.",
        provenance: "The tax line here is your estimate, not verified rules \u2014 we only claim verified numbers for the Netherlands. Everything else on this page is plain arithmetic on what you entered.",
        switchNl: "Work in the Netherlands? Use the verified calculation",
        lines: {
          revenue: "Revenue the year needs",
          costs: "Business costs",
          tax: "Tax, at your estimate",
          takeHome: "Yours to live on",
        },
      },
      guided: {
        progressLabel: "Where you are",
        stepOf: "Step {n} of {total}",
        announce: "Step {n} of {total}. {question}",
        back: "Back",
        next: "Next",
        submit: "Show my rate",
        whyAsk: "Why are we asking?",
        optional: "Optional",

        market: {
          question: "Where do you work?",
          helper: "Tax rules are national. We only show verified numbers where we actually have them.",
          nl: "The Netherlands",
          nlNote: "Verified rules \u2014 checked against belastingdienst.nl",
          other: "Somewhere else",
          otherNote: "Estimate mode \u2014 you set the tax rate, we do the arithmetic",
          currencyLabel: "Your currency",
          why: "The Dutch calculation runs on rules we verified at the source, line by line. We have not done that work for other countries yet, and we will not pretend otherwise. Outside the Netherlands the tax share is an estimate you control \u2014 everything else is arithmetic that holds anywhere.",
        },

        target: {
          question: "What do you want to earn?",
          helper: "Take-home for the year, after tax.",
          why: "This is the number you actually live on, not what you invoice. Freelens starts here and works backwards through the real brackets, deductions and credits to find the revenue that leaves you this much.",
        },
        days: {
          question: "How many days will you bill?",
          helper: "Billable days, not working days.",
          why: "A year has about 260 working days. Almost nobody bills them. Holidays, sick days, admin, chasing work and quiet weeks all come out first. This is the number most rates get wrong, and it is why the same target income needs a very different day rate.",
        },
        costs: {
          question: "What does the business cost you?",
          helper: "Software, insurance, gear, workspace, your accountant.",
          // Not a repeat of the question: the heading asks what, this says per what.
          fieldLabel: "Per year",
          placeholder: "e.g. 6000",
          why: "Costs lower your tax, but you still have to earn them before anything is yours. Leaving this blank is safe: it just means the rate covers nothing but your own time.",
        },

        result: {
          eyebrow: "Your floor",
          perDay: "per day, excluding btw",
          summary:
            "{days} billable days at this rate is {revenue} of revenue across the year, of which {take} ends up yours.",
          notMarket:
            "This is what the work has to earn to pay for itself. What your market will pay is a separate question, and Freelens has no view on it.",
          estimate: "A planning estimate from the figures you entered, not a fixed rule.",
          adjust: "Adjust my answers",
          breakdown: "How this was worked out",
          toTool: "See what's actually mine",
          toTarief: "Price one specific project instead",
        },
      },
    },
  app: {
    overview: {
      emptyIntro:
        "Freelens helps you separate VAT, protect a tax reserve, cover business costs, and see what may be available to pay yourself.",
      emptyPrompt:
        "See what one payment splits into. It takes about 30 seconds, and needs no setup.",
      tryPayment: "Try one payment (30 seconds)",
      setUpDetails: "Set up my details (1 minute)",
      available: "May be available to pay yourself",
      protected: "Protected",
      vat: "VAT",
      reserve: "Income tax and Zvw reserve",
      runway: "Business runway",
      runwayUnknown: "Add monthly costs to estimate",
      runwayMonths: "{months} months",
      recently: "recently",
      lastUpdated: "Last updated {date}",
      worthRefreshing: ". Worth refreshing.",
      direction: {
        onTrack: "On track",
        gettingTight: "Getting tight",
        belowTarget: "Below target",
      },
      nextAction: "Next best action",
      latestAllocation: "Latest allocation",
      payment: "Payment",
      availableForPayout: "Available for personal payout",
      recordedOn: "{date} · recorded on this device.",
      exampleIntro: "One payment, given a job. The same one the homepage works through.",
      exampleVat: "Protected VAT",
      exampleReserve: "Protected reserve",
      exampleBusiness: "Business costs covered",
      actions: {
        finishSetup: {
          title: "Finish setting up so your numbers inherit sensible defaults.",
          cta: "Set up Freelens",
        },
        reserveGap: {
          title: "Your balance doesn't yet cover all selected reserves.",
          cta: "Review your check-in",
        },
        firstCheckin: {
          title: "Do this week's check-in to see where you stand.",
          cta: "Weekly check-in",
        },
        stale: {
          title: "Your last check-in is a while ago. Refresh it.",
          cta: "Update your check-in",
        },
        payment: {
          title: "A payment came in? Give every euro a job.",
          cta: "Money in",
        },
      },
    },
    settings: {
      intro:
        "None of this is required. The calculator works without it, and says on every result which defaults it used. Filling this in makes the number yours instead of typical.",
      sections: {
        year: "Your year",
        deductions: "Deductions you qualify for",
        otherIncome: "Other income",
        paymentDefaults: "Defaults for new payments",
        weekly: "For the weekly check-in",
      },
      revenueLabel: "Expected revenue this year (excl. btw)",
      revenuePlaceholder: "e.g. 55000",
      costsLabel: "Expected business costs this year (excl. btw)",
      costsPlaceholder: "e.g. 15000",
      profitLabel: "Expected profit this year",
      profitHint:
        "Revenue excluding btw, minus your business costs. A rough figure is fine; you can change it whenever the year changes.",
      profitPlaceholder: "e.g. 40000",
      splitOn: "Enter one profit figure instead",
      splitOff: "Enter revenue and costs separately",
      hoursLabel: "Do you spend at least 1.225 hours a year on your business?",
      hoursHint:
        "The urencriterium. Meeting it unlocks the zelfstandigenaftrek, which lowers what you owe. Roughly 24 hours a week across a full year.",
      starterLabel: "Were you not an entrepreneur in one or more of the last five years?",
      starterHint:
        "If so you may qualify for the startersaftrek, an extra deduction for up to three of your first five years.",
      otherIncomeLabel: "Salary or benefits this year, before tax",
      otherIncomeHint:
        "Leave blank if the business is your only income. Other income raises the bracket your freelance profit lands in.",
      otherIncomePlaceholder: "e.g. 30000",
      withheldLabel: "Tax your employer already withheld this year",
      withheldHint:
        "The loonheffing on your payslip or jaaropgaaf. You have already paid this, so Freelens will not ask you to set it aside again. Leave blank if you are not sure and the estimate stays on the cautious side.",
      withheldPlaceholder: "e.g. 2250",
      vatLabel: "btw you usually charge",
      vatGroupLabel: "Usual VAT treatments",
      vatHint:
        "The first one you pick prefills the calculator. You can change it on any individual payment.",
      inclusiveLabel: "Are the amounts you type usually inclusive of btw?",
      inclusiveHint:
        "Money landing in your bank account normally includes btw, so this is usually yes.",
      monthlyCostsLabel: "Essential monthly business costs",
      monthlyCostsHint: "Rent, insurance, utilities, core subscriptions.",
      monthlyCostsPlaceholder: "e.g. 1200",
      bufferLabel: "Business buffer, in months",
      bufferGroupLabel: "Buffer months",
      backWithoutSaving: "Back without saving",
      saveSettings: "Save settings",
      yes: "Yes",
      no: "No",
      treatments: {
        "21": "21%",
        "9": "9%",
        "0": "0%",
        exempt: "Exempt",
        reverseCharged: "Reverse-charged",
        kor: "KOR",
        mixedUnsure: "Mixed / unsure",
      },
    },
    shell: {
      eyebrow: "Freelens",
      loading: "Loading your saved figures…",
      views: {
        overview: {
          title: "After payment",
          subtitle: "A calm read on what is protected and what is free.",
        },
        setup: {
          title: "Your settings",
          subtitle:
            "Everything Freelens remembers about you. All optional, all changeable.",
        },
        moneyArrived: {
          title: "Money arrived",
          subtitle: "Give every euro a job before it feels available.",
        },
        weeklyCheckin: {
          title: "Weekly check-in",
          subtitle: "A one-minute read on your position.",
        },
        decision: {
          title: "Check a decision",
          subtitle: "See whether a purchase fits your spending room.",
        },
      },
      migrationNotice:
        "We updated how Freelens describes reserves. Your saved{pct} percentage is still available, but it is now correctly labelled as a planning rule rather than final tax.",
      dismiss: "Dismiss",
      discardedOne: "One saved payment could not be read and has been left out.",
      discardedMany:
        "{count} saved payments could not be read and have been left out.",
      discardedTail:
        "The rest of your history is intact. Your {year} totals below are lower than they should be until you add them again.",
      discardedCheckin:
        "Your last weekly check-in could not be read and has been left out. Nothing else was affected. Run a new check-in whenever you like.",
      storageUnavailable:
        "Storage is unavailable in this browser, so your figures won't be saved on this device between visits. They are not uploaded either way.",
      privacyToggle: "Privacy and data",
      privacySentence: "Saved only on this device. Your figures are never uploaded.",
      privacyDetail:
        "Freelens stores your figures, including every payment you save, in this browser's local storage so they are here next time. Clearing them below removes all of it from this device, permanently and immediately. There is no account and no server copy, so there is nothing else to delete and nothing to request from us.",
      clearConfirm:
        "Clear your setup, your saved payments and your check-ins from this device? This cannot be undone.",
      clearYes: "Yes, clear it",
      clearData: "Clear saved data",
    },
    moneyArrived: {
      amountLabel: "How much did you receive?",
      amountPlaceholder: "1500",
      vatSummary: { includes: "Includes", excludes: "Excludes", none: "No" },
      vatTreatmentLabel: "btw treatment",
      vatOther: "Other",
      whichTreatment: "Which treatment?",
      includesQuestion: "Does this amount include btw?",
      includesVat: "Includes btw",
      excludesVat: "Excludes btw",
      vatExplainer:
        "Most Dutch services use 21%; some (food, culture, press work) use 9%. Pick Other for KOR, reverse-charged or exempt work, or if you genuinely are not sure. Freelens then sets no btw aside and explains why.",
      treatments: {
        "21": "21% VAT",
        "9": "9% VAT",
        "0": "0% (export / intra-EU)",
        exempt: "Exempt",
        reverseCharged: "Reverse-charged",
        kor: "KOR (Small Businesses Scheme)",
        mixedUnsure: "Mixed / unsure",
      },
      profitLabel: "Expected profit this year",
      profitHint:
        "Revenue excluding VAT, minus your business costs. Income tax is worked out on profit for the whole year, so this is what sets your real rate. A rough figure is fine.",
      profitPlaceholder: "e.g. 40000",
      extrasToggle: "Add costs and a label (optional)",
      businessReserveLabel: "Set aside for business costs",
      businessReservePlaceholder: "e.g. 500",
      deductibleLabel: "Deductible costs linked to this payment",
      deductibleHint:
        "Lowers the amount this payment is taxed on. It does not change VAT, so your VAT return may differ after input VAT.",
      deductiblePlaceholder: "e.g. 200",
      labelLabel: "Label",
      labelPlaceholder: "e.g. Editorial shoot, Friday DJ set",
      saveHeading: "Save this payment to {year}",
      saveBody:
        "Nothing is saved unless you choose to. Once it is, Freelens counts it towards the year and takes less from your later payments.",
      dateLabel: "Date",
      noteLabel: "Note (optional)",
      notePlaceholder: "e.g. Editorial shoot",
      saveButton: "Save to {year}",
      savedConfirm:
        "Saved on this device. Your {year} totals below have gone up, and your next payment will ask for less.",
      rememberNothing:
        "Freelens is remembering nothing yet. Your answers above apply to this payment only.",
      saveMyDetails: "Save my details",
      driftPrompt:
        "You have already saved {earned} of profit this year against a projection of {projected}. Until you raise the projection, Freelens reserves the rest of your payments at the rate on your next euro, which is higher than you probably need.",
      driftCta: "Update my projection",
      midYearPrompt:
        "Been paid already this year? Freelens has nothing saved for {year}, so it treats this as your first payment and asks for more than it needs to. Adding what you have already earned makes every figure below right.",
      crossLink: "Pricing the next one? Same calculation, run backwards:",
      crossLinkCta: "Work out what to charge",
      strip: {
        heading: "Make this more accurate",
        hours: "I work 1.225 hours or more a year on this",
        starter: "I'm in my first five years in business",
        salaryNew: "I also have a salary",
        salaryHas: "I have a salary alongside this",
        lowers: "lowers it",
        raises: "raises it",
        counted: "counted",
        applied: "applied",
        askedOnce: "Each answer is remembered, so you are only asked once.",
      },
      result: {
        received: "Payment received",
        vatIncluded: "VAT included in this payment",
        reserve: "Income tax and Zvw reserve",
        businessSetAside: "Set aside for business costs",
        short: "This payment doesn't cover your set-asides",
        available: "Estimated amount available to pay yourself",
        reserveSourceNotes: {
          "guided-estimate":
            "Reserve from the guided estimate: this payment's share of what you are on track to owe for the year, on the real brackets.",
          "own-rule":
            "Reserve based on the percentage you set (a planning rule, not a tax assessment).",
          "provisional-assessment":
            "Reserve based on your provisional assessment (voorlopige aanslag).",
          manual: "Reserve entered by hand for this payment.",
        },
        markHandled: "Mark allocation as handled",
        savedOnDevice: "Saved on this device.",
        movesMoneyNote:
          "Freelens records the plan on this device. You still need to move the money in your bank.",
      },
      sample: {
        intro:
          "Here's how a {amount} payment at 21% VAT splits, for someone expecting {profit} profit this year{rate}.",
        rateNote: " (so {pct}% of this payment set aside)",
      },
      assumptions: {
        deductible: "Reserve applied to {base} after {costs} deductible costs.",
        share:
          "This payment's share of the {annual} you are on track to owe for the year, which works out at {pct}% of this payment.",
      },
    },
    paymentHistory: {
      sectionLabel: "Saved payments for {year}",
      soFar: "{year} so far",
      earned: "Earned (excl. btw)",
      setAside: "Set aside for tax",
      vatCollected: "btw collected",
      payments: "Payments",
      totalsNote:
        "These totals are what Freelens uses to work out your share of the remaining bill. Set aside too much early and later payments ask for less.",
      empty:
        "No payments saved for {year} yet. Work out a payment above and choose Save to {year} to start the running total. Until then Freelens treats every payment as your first of the year.",
      vatPrefix: "btw",
      reservedPrefix: "reserved",
      editAria: "Edit payment of {amount} on {date}",
      deleteAria: "Delete payment of {amount} on {date}",
      confirmDelete: "Yes, delete",
      earlierYears: "Earlier years ({years})",
      dateLabel: "Date",
      invalidDate: "Enter a valid date.",
      movingYearNote:
        "Moving this to another year takes it out of the current year's totals. It is kept, not deleted.",
      noteLabel: "Note (optional)",
      notePlaceholder: "e.g. Editorial shoot",
      amountLabel: "Amount excluding btw",
      vatLabel: "btw",
      reserveLabel: "Set aside for tax",
      earlierYearsNote:
        "Kept, but left out of the {year} totals. Income tax is settled one year at a time, so an earlier year cannot change what you owe for this one.",
      earnedSuffix: "earned",
      setAsideSuffix: "set aside",
      paymentCountOne: "{count} payment",
      paymentCountMany: "{count} payments",
      saveChanges: "Save changes",
    },
    breakdown: {
      "Payment received": "Payment received",
      "VAT included in this payment": "VAT included in this payment",
      "Income tax and Zvw reserve": "Income tax and Zvw reserve",
      "Business obligations": "Business obligations",
      "Business buffer": "Business buffer",
      "Current business cash": "Current business cash",
      "VAT set aside": "VAT set aside",
      "Upcoming obligations": "Upcoming obligations",
    },
    weekly: {
      balanceLabel: "How much is in your business account?",
      balancePlaceholder: "7000",
      balanceHint: "Use the balance from your banking app; a close estimate works.",
      reserveLabel: "How much have you reserved for income tax and Zvw?",
      reservePlaceholder: "1500",
      reserveHint:
        "The amount you're keeping aside for tax. A planning figure, not a final assessment.",
      monthlyCostsLabel: "Essential monthly business costs",
      monthlyCostsPlaceholder: "1200",
      obligationsLabel: "Known upcoming obligations (optional)",
      obligationsPlaceholder: "500",
      bufferLabel: "Buffer to keep, in months",
      bufferGroupLabel: "Buffer months",
      improveAccuracy: "Improve accuracy",
      actualVatLabel: "Actual VAT currently reserved (optional)",
      actualVatPlaceholder: "600",
      actualVatHint:
        "From your bookkeeping or latest VAT overview. Often more accurate than one payment.",
      plannedPayoutLabel: "Personal payout you plan to take (optional)",
      plannedPayoutPlaceholder: "2000",
      plannedPayoutHint:
        "Set this to see how much room remains beyond your planned salary.",
      short: "Short of your selected reserves by",
      available: "May be available for personal payout",
      vatProtected: "VAT protected",
      reserveProtected: "Income tax and Zvw reserve protected",
      obligations: "Upcoming obligations",
      buffer: "Business buffer",
      spendingRoom: "Optional spending room",
      progressLabel: "Check-in progress",
      steps: {
        balance: "Balance",
        protected: "Protected",
        costs: "Costs",
        buffer: "Buffer",
      },
      confidence: {
        quick: "Based on limited information and your chosen reserve rules.",
        improved: "Includes actual reserve balances and upcoming obligations.",
        bookkeeping: "Uses amounts entered from your bookkeeping.",
      },
      emptyPrompt: "Enter your business balance to see where you stand.",
      save: "Save this check-in",
      saved: "Saved on this device.",
      // These six read out the result and were the last strings on the site
      // still hardcoded in the component. On a Dutch page the primary line
      // under the payout figure was an English sentence.
      bufferTarget: "Buffer target: {amount} ({months} × monthly costs).",
      runwayUnknown: "Add monthly costs to estimate your runway.",
      runwaySentence: "You have {months} months of runway.",
      runwayMeter: "{months} months of runway · buffer target {buffer} months.",
      shortfallDetail:
        "Keep the next {amount} of incoming cash in the business to restore your selected reserves.",
      statusTail: {
        covered: " Your selected reserves and buffer are covered.",
        limited: " Reserves are covered, but spending room is tight.",
        gap: " Your balance doesn't yet cover all selected reserves.",
      },
      reserveSource: {
        ownRule:
          "Reserve came from your own percentage rule (a planning rule, not a tax assessment).",
        provisionalAssessment:
          "Reserve came from your provisional assessment amount.",
        guidedEstimate:
          "Reserve came from the guided estimate (a planning estimate, not a final assessment).",
        manual: "Reserve is the amount you entered.",
        notTracked: "No reserve is being tracked yet.",
      },
    },
    decision: {
      costLabel: "What does it cost?",
      costPlaceholder: "300",
      descriptionLabel: "What is it? (optional)",
      descriptionPlaceholder: "e.g. New laptop, studio rental",
      kindQuestion: "Is this a business or personal cost?",
      kindGroupLabel: "Cost kind",
      business: "Business",
      personal: "Personal",
      businessCost: "Business cost",
      personalCost: "Personal cost",
      timingQuestion: "When?",
      timingGroupLabel: "Timing",
      now: "Now",
      later: "Later",
      needsCheckin: "Complete a weekly check-in for a result based on your own numbers.",
      goToCheckin: "Do a weekly check-in",
      tryExample: "Try with example numbers",
      exampleDescription: "New lens",
      noPersonalResult: "Add a weekly check-in to get a personal result.",
      notApplicable: "n/a",
      months: "{n} mo",
      after: "After",
      sampleNote: "Using sample numbers ({room} spending room).",
      runwayNow: "Runway now",
      runwayAfter: "After",
      chainLabel: "How a decision is checked",
      chain: {
        position: "Weekly position",
        room: "Spending room",
        decision: "This decision",
      },
      headlines: {
        fits: "This fits within your current optional spending room.",
        tight: "This fits, but it would use most of your current room.",
        wait: "Not within the reserves you selected.",
      },
      verdicts: {
        fits: "Fits",
        tight: "Tight",
        wait: "Wait",
        noData: "No data",
      },
    },
    navTabs: {
      ariaLabel: "Freelens modes",
      overview: { title: "Overview", description: "Where you stand and what to do next." },
      moneyArrived: { title: "Money arrived", description: "Give a payment a job, after VAT." },
      weeklyCheckin: { title: "Weekly check-in", description: "A calm read on your position." },
      decision: { title: "Check a decision", description: "See if a purchase fits." },
    },
    status: {
      reservesCovered: "Your selected reserves and buffer are covered.",
      limitedRoom: "Your reserves are covered, but little remains for extra spending.",
      reserveGap: "Your current balance does not yet cover all selected reserves.",
    },
    whyThisNumber: {
      toggle: "Why this number?",
    },
    allocation: {
      caption: "Every euro, given a job",
      vat: "VAT",
      reserve: "Reserve",
      business: "Business",
      yours: "Yours",
      personalPayout: "Personal payout",
    },
  },
};
