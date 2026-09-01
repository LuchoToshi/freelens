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
      tryDemo: "Sign in",
      about: "About",
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


  meta: {
    agent: {
      title: "Freelens: delegate the desk, keep the decisions",
      description:
        "Freelens reads every inquiry through your page, plans the work, and prepares the replies in your voice. Prices, dates and sending stay yours. Invite-only while we test.",
    },
    home: {
      title: "Freelens: stop losing jobs to a slow reply",
      description:
        "Every inquiry through your page gets a fast, personal reply with your real prices, ready to send. Built for creative freelancers such as photographers, videographers, designers and illustrators.",
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
      agent: {
        heroEyebrow: "Your front desk, delegated",
        heroTitle: "Delegate the desk. Keep the decisions.",
        heroSub:
          "Freelens reads every inquiry through your page, plans the work, and prepares the replies in your voice. Prices, dates and sending stay yours.",
        heroCta: "Ask for an invite",
        heroCtaTry: "See how it works",
        exampleLabel: "You ask. It plans. You approve.",
        askLabel: "You ask",
        ask: "Chase the quiet leads from March.",
        planLabel: "Freelens plans",
        planSteps: [
          "Found 4 quiet threads. None of them declined.",
          "Draft a personal follow-up for each, your prices and voice only.",
          "You review and send. Nothing moves before that.",
        ],
        resultLabel: "A week later",
        result: "Two replies, one booked. Every draft was yours to change first.",
        approveNote: "You approve before anything moves.",
        objections: [
          {
            q: "Will it send things on its own?",
            a: "No. It prepares; you send. Sending, prices, dates and closing a lead are capped so no setting can unlock them.",
          },
          {
            q: "What can it actually see?",
            a: "Your inquiry page and your own account data. Every fact it states carries where it came from, and a blank stays blank rather than becoming a guess.",
          },
          {
            q: "What if it gets something wrong?",
            a: "You see the draft before anyone else does. Skip it and you say why, so the pattern is visible; edit it and your edit is what ships and what it learns from. It never turns one edit into a rule.",
          },
        ],
        followupQ: "So I have to babysit it?",
        followupA:
          "The opposite. It shows you the exceptions: what needs a decision, what is waiting, what ran on its own. A quiet screen means nothing needs you.",
        waitlistHeading: "Invite-only, on purpose.",
        waitlistSub:
          "We open a few desks at a time so every one gets set up properly. Join the list and we send an invite when it's your turn.",
      },
      heroEyebrow: "Your front desk",
      heroTitle: "Stop losing jobs to a slow reply.",
      heroSub:
        "Every inquiry through your page gets a fast, personal reply with your real prices, ready to send. You just tap send.",
      heroCta: "Get early access",
      heroCtaTry: "See a real reply",
      example: {
        label: "This is what one inquiry looks like.",
        inquiryLabel: "Inquiry",
        clientName: "Lisa",
        eventType: "Wedding",
        eventDate: "June 14, 2026",
        budget: "€1,000–2,500",
        draftLabel: "The reply",
        draft:
          "Hi Lisa! Love that you're thinking of me for June 14. Weddings are what I do best. For a full wedding day I work with packages from €1,950, second shooter included. I'd love to check the date and hear your plans. Shall we hop on a quick call this week?\n\nEmma",
        caption: "Ready in a few seconds. You send it yourself.",
      },
      demo: {
        types: {
          wedding: {
            label: "Wedding",
            clientName: "Lisa",
            eventDate: "June 14, 2026",
            budget: "€1,000–2,500",
            draft:
              "Hi Lisa! Love that you're thinking of me for June 14. Weddings are what I do best. For a full wedding day I work with packages from €1,950, second shooter included. I'd love to check the date and hear your plans. Shall we hop on a quick call this week?\n\nEmma",
          },
          party: {
            label: "Party",
            clientName: "Sophie",
            eventDate: "March 21, 2026",
            budget: "€500–1,000",
            draft:
              "Hi Sophie! A party is my favourite kind of shoot: real moments, no posing. Tell me a little more about what you're celebrating and how many people are coming, and I'll think along with you on the approach. For parties I usually put a package together to fit, depending on the hours and what you want to do with the photos. I'd love to check the date. Shall we hop on a quick call this week?\n\nEmma",
          },
          business: {
            label: "Business",
            clientName: "James",
            eventDate: "April 9, 2026",
            budget: "€1,000–2,500",
            draft:
              "Hi James! Great to hear from you. I shoot business work regularly, from team portraits to imagery for your website, and I'd love to hear what you're after. Tell me a bit about your brand and where the photos will live, and I'll put together a proposal that fits your goal and budget. I'd be happy to check the date. Shall I give you a call this week to talk it through?\n\nEmma",
          },
          portrait: {
            label: "Portrait",
            clientName: "Amber",
            eventDate: "May 2, 2026",
            budget: "€250–500",
            draft:
              "Hi Amber! Lovely that you want to plan a portrait session. A good portrait session feels more like a good conversation than a photo shoot, and you can see that in the images. For portraits I work with a package from €350, editing of the best photos included. Tell me a little about what the portraits are for and I'll shape the session around it. I'd love to check the date. When works for you?\n\nEmma",
          },
        },
        caption: "Ready in a few seconds. You send it yourself, from your own inbox or straight back where they found you.",
        bridge: "This is how it will work with your prices and your style.",
        inquiryMeta: "New inquiry · 2 min ago",
        intro: "An inquiry lands. Twenty seconds later:",
        orSeeLabel: "or see:",
      },
      objections: {
        items: [
          {
            q: "Does it really sound like you?",
            a: "Yes. You paste a few of your own replies, and Freelens learns your tone. Warm or businesslike, short or detailed, emoji or no emoji: it writes the way you write.",
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
        heading: "Your front desk is opening soon.",
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
        privacyNote: "We only use your email to keep you posted about your front desk. You can unsubscribe anytime.",
      },
    },

    rebooking: {
      heroEyebrow: "For creative freelancers",
      betaPill: "Private beta \u00b7 onboarding the first 25",
      heroQuestion: "When did you last talk to your best client from last year?",
      heroSub: "Your easiest next job is a client you already know. Freelens remembers who, knows when, and writes the first email, in your voice. You press send.",
      heroCta: "Join the waitlist",
      heroCtaTry: "Try it with 3 clients, no account",
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
            body: "Chosen for a real reason: a year since the last shoot, briefing season in their world, never \u201cjust checking in\u201d.",
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
        draftBody: "Hi Marloes,\n\nLast October I shot the autumn campaign for De Groene Kamer, one of the best jobs of that season.\n\nI'm planning my autumn now and thought of you: is there another campaign on the calendar this year? If so, I'd love to hold some space.\n\nBest,\nSam",
        micro: "An example. Every reason comes from your own records: if a date is off, you correct it. You send the email yourself, from your own inbox.",
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
        noCommit: "Signing up is free and commits you to nothing. When the beta opens, we offer the {spots} founding spots ({founding} for the first year) in order of signup, you decide then.",
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
        done: "Almost there: open your inbox and click the confirmation link. No confirmation, no spot, that is how we know the address is yours.",
        error: "That did not go through. Check the fields and try again.",
        privacyNote: "Used only to tell you about the beta. Confirmed by you, deleted on request, never shared.",
      },
      trust: {
        eyebrow: "Where the line is",
        heading: "The agent never sends anything.",
        body: "You always send it yourself, from your own mail. Your client data is used for nothing else and can always be exported and deleted.",
        points: [
          "Every email leaves from your own inbox, pressed by you",
          "Client records hold a name, a project, a date, never addresses, phone numbers or registration numbers",
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

  },

    notFound: {
    title: "Page not found \u00b7 Freelens",
    body: "This page doesn't exist.",
    back: "Back to Freelens",
  },

  aboutPage: {
    eyebrow: "Why Freelens exists",
    heading: "Your past clients are your next booking.",
    intro: "Your front desk already replies fast when a new inquiry lands. This is what it does with the clients who already trust you. A freelancer's quiet months are rarely a quality problem. The work was good. The client was happy. There is just nobody keeping track of when the natural moment to get back in touch arrives, so it does not happen. Or it happens as \u201cjust checking in,\u201d which feels awkward for everyone.",
    what: {
      h: "What Freelens does",
      p1: "Freelens keeps track of your past clients and watches for the moments when getting in touch makes sense. A year since the last shoot. The season when their kind of business briefs new work. Each week it brings you two to four people worth a message, each with a specific reason, and writes the first email in your voice.",
      p2: "You edit whatever you want. You send it yourself, from your own inbox. Freelens never sends anything to anyone.",
    },
    boundary: {
      h: "What Freelens knows about your clients",
      p1: "A client record holds their name, their company, what you did for them, when, roughly what it was worth, the email address so it can write to the right person, and any notes you add yourself. Notes can inform a draft, so what you put there matters. No phone numbers. No postal addresses. No company registration numbers. You can export everything and delete everything from day one, and your client data is used to write your emails and nothing else.",
    },
    trust: {
      h: "Why the emails are safe to send",
      p1: "Every reason comes from your own records. Every price comes from the rates you set up yourself, and a draft that invents a number is thrown away before it reaches you. Freelens never says you are free on a date, because it does not know your calendar. If something is wrong, you correct it and it stays corrected.",
      p2: "That is the whole design: the AI writes, the checks are ordinary code, and you decide.",
    },
    tools: {
      h: "The free calculators",
      p1: "What to charge before a job, and what is actually yours after payment. Free, no account, and your figures stay in your browser.",
    },
    going: {
      h: "Where this is going",
      p1: "This part of Freelens is in private beta. Nothing is live for the public yet, and we would rather say that than pretend otherwise. We are putting together a first small group of freelancers to use it and tell us what is wrong with it. If you're a photographer, videographer, designer, illustrator, or another creative freelancer, join the list and stay top of mind when your best clients have their next project.",
    },
    ctaPrimary: "Put me on the waitlist",
    ctaSecondary: "See the free calculators",
  },





  privacyPage: {
    eyebrow: "Privacy",
    heading: "What we know, and what we never will.",
    updated: "Version of {date}.",
    analytics: {
      title: "Page views",
      body: "Freelens counts anonymous page views through Vercel Web Analytics: no cookies, no profile, nothing that identifies you. Custom events carry a name only, never an amount, a client, or an email address.",
    },
    email: {
      title: "Your email address",
      body: "We keep an email address only if you leave one yourself, on the waitlist or for rule-change updates, and only after you confirm it from your inbox. It is used for that one purpose, never shared, and deleted on request. Waitlist signups also record the craft you select.",
    },
    frontdesk: {
      title: "Your profile, inquiries, and drafts",
      body: "If you sign up as a freelancer: your profile (display name, craft, city, an optional photo, and how you sign off) is stored with Supabase, readable only by you. Only your handle, display name, craft, city and photo appear on your public page. Voice samples, the emails you paste in so drafts sound like you, are kept as text rather than discarded, so your style profile can be regenerated as we improve how we read it; only you can see them. When someone submits your public inquiry form, we store what they enter: their name, optionally their email, the event date, type and budget band, their message, and which channel sent them. Their email is for your own follow-up only; it is never passed to the Anthropic Claude API that drafts your reply. Every draft is checked against your own packages and their message before it reaches you, and we keep each one alongside whether you sent it as-is, edited it, or skipped it. Delete your account and your profile, inquiries and drafts go with it, immediately and permanently.",
    },
    gmail: {
      title: "Your Gmail inbox, if you connect it",
      body: "Connecting Gmail is optional and off by default, and not something you can do yet. If and when it ships: we ask for read-only access to the inbox, labels, and date range you choose, plus a separate permission to send only after you approve each draft yourself. Each message is read once to pull out what's useful, then let go. The email itself is never stored. What we keep is a short summary of each conversation (contact, project type, dates, budget signals), the opportunities we surface from it, and the drafts and approvals you act on, stored with Supabase, the same place your other Freelens data lives, readable only by you. That data stays for as long as your connection is active. Revoke access and it's kept 30 more days in case you change your mind, then deleted automatically; a connection that sits idle is deleted after 12 months regardless. Disconnect anytime from Settings, one click, sync stops immediately. Your email content is never used to train any shared AI model. Drafts are written by Anthropic's Claude API. Freelens's use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
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



};
