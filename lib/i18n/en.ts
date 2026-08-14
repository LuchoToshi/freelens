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
      howItWorks: "How it works",
      rebooking: "Rebooking",
      menuLabel: "Open menu",
      privacy: "Privacy",
      contact: "Contact",
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
      title: "FrontDesk: stop losing jobs to a slow reply",
      description:
        "Every inquiry gets a fast, personal reply with your real prices, ready to send. Built for creative freelancers such as photographers, videographers, designers and illustrators.",
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
    privacy: {
      title: "Privacy · Freelens",
      description:
        "What Freelens collects, what it never collects, and how to get your data out or gone.",
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
        "Every inquiry gets a fast, personal reply with your real prices, ready to send. You just tap send.",
      heroCta: "Get early access",
      example: {
        label: "This is what one inquiry looks like.",
        inquiryLabel: "Inquiry",
        clientName: "Lisa",
        eventType: "Wedding",
        eventDate: "June 14, 2026",
        budget: "€1,000–2,500",
        draftLabel: "The reply",
        draft:
          "Hi Lisa! Love that you're thinking of me for June 14. Weddings are what I do best. For a full wedding day I work with packages from €1,950, second shooter included. I'd love to check the date and hear your plans. Shall we hop on a quick call this week? — Emma",
        caption: "Ready in ~20 seconds. Sent from your own inbox.",
      },
      demo: {
        types: {
          wedding: {
            label: "Wedding",
            clientName: "Lisa",
            eventDate: "June 14, 2026",
            budget: "€1,000–2,500",
            draft:
              "Hi Lisa! Love that you're thinking of me for June 14. Weddings are what I do best. For a full wedding day I work with packages from €1,950, second shooter included. I'd love to check the date and hear your plans. Shall we hop on a quick call this week? — Emma",
          },
          party: {
            label: "Party",
            clientName: "Sophie",
            eventDate: "March 21, 2026",
            budget: "€500–1,000",
            draft:
              "Hi Sophie! A party is my favourite kind of shoot: real moments, no posing. Tell me a little more about what you're celebrating and how many people are coming, and I'll think along with you on the approach. For parties I usually put a package together to fit, depending on the hours and what you want to do with the photos. I'd love to check the date. Shall we hop on a quick call this week? — Emma",
          },
          business: {
            label: "Business",
            clientName: "James",
            eventDate: "April 9, 2026",
            budget: "€1,000–2,500",
            draft:
              "Hi James! Great to hear from you. I shoot business work regularly, from team portraits to imagery for your website, and I'd love to hear what you're after. Tell me a bit about your brand and where the photos will live, and I'll put together a proposal that fits your goal and budget. I'd be happy to check the date. Shall I give you a call this week to talk it through? — Emma",
          },
          portrait: {
            label: "Portrait",
            clientName: "Amber",
            eventDate: "May 2, 2026",
            budget: "€250–500",
            draft:
              "Hi Amber! Lovely that you want to plan a portrait session. A good portrait session feels more like a good conversation than a photo shoot, and you can see that in the images. For portraits I work with a package from €350, editing of the best photos included. Tell me a little about what the portraits are for and I'll shape the session around it. I'd love to check the date. When works for you? — Emma",
          },
        },
        caption: "Ready in about 20 seconds. Sent from your own inbox.",
        bridge: "This is how it will work with your prices and your style.",
      },
      objections: {
        items: [
          {
            q: "Does it really sound like you?",
            a: "Yes. You paste a few of your own replies, and FrontDesk learns your tone. Warm or businesslike, short or detailed, emoji or no emoji: it writes the way you write.",
          },
          {
            q: "Does it invent prices or promise dates?",
            a: "Never. It only uses the prices you set, and it never says a date is free. You check that yourself.",
          },
          {
            q: "Do I lose control?",
            a: "No. Nothing goes out without you. Every reply is one tap, from your own inbox.",
          },
        ],
      },
      followup: {
        q: "And when a client goes quiet?",
        a: "The follow-up is already waiting. That one message you never quite get around to is exactly where jobs come back.",
      },
      audience: {
        line: "For creative freelancers: photographers, videographers, designers, illustrators, and anyone else who books work by inquiry.",
        overflow: "Do something else? Tell us what you make →",
      },
      trust:
        "Replies are drafted with AI. You approve and send every one yourself. Your client's email address is never sent to the AI.",
      waitlist: {
        heading: "FrontDesk is opening soon.",
        sub: "Get on the list and you'll be first in. No spam, just a note when it's your turn.",
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
        otherHint: "Pick this if you do something else.",
        submit: "Get early access",
        sending: "One moment",
        done: "You're on the list. We'll be in touch.",
        error: "Something went wrong. Please try again in a moment.",
        privacyNote: "We only use your email to keep you posted about FrontDesk. You can unsubscribe anytime.",
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

};
