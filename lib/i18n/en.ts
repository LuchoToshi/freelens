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
      title: "A reply, ready before the moment passes \u00b7 Freelens",
      description:
        "Freelens reads every inquiry through your page and prepares a reply in your voice, with your prices. It never sends, never quotes a number you did not set, and never claims a date is free.",
    },
    privacy: {
      title: "Privacy · Freelens",
      description:
        "What Freelens collects, what it never collects, and how to get your data out or gone.",
    },
  },

  home: {
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
          event: {
            label: "Event",
            clientName: "Sophie",
            eventDate: "March 21, 2026",
            budget: "€500–1,000",
            draft:
              "Hi Sophie! An event is my favourite kind of shoot: real moments, no posing. Tell me a little more about what you're marking and how many people are coming, and I'll think along with you on the approach. For events I put a package together to fit, depending on the hours and what you want to do with the photos. I'd love to check the date. Shall we hop on a quick call this week?\n\nEmma",
          },
          brand_film: {
            label: "Brand film",
            clientName: "James",
            eventDate: "April 9, 2026",
            budget: "€1,000–2,500",
            draft:
              "Hi James! Great to hear from you. Brand films are a good part of what I do, and I'd love to hear what you're after. Tell me a bit about the story you want told and where the film will live, and I'll put together a proposal that fits your goal and budget. I'd be happy to check the date. Shall I give you a call this week to talk it through?\n\nEmma",
          },
          social_content: {
            label: "Social content",
            clientName: "Amber",
            eventDate: "May 2, 2026",
            budget: "€250–500",
            draft:
              "Hi Amber! Lovely that you're thinking about content for your channels. A shoot day like this works best when we know what the first few posts need to do, so tell me a little about that and I'll shape the day around it. I'd love to check the date. When works for you?\n\nEmma",
          },
        },
        caption: "Ready in a few seconds. You send it yourself, from your own inbox or straight back where they found you.",
        bridge: "This is how it will work with your prices and your style.",
        inquiryMeta: "New inquiry · 2 min ago",
        intro: "An inquiry lands. Seconds later:",
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




  },

    notFound: {
    title: "Page not found \u00b7 Freelens",
    body: "This page doesn't exist.",
    back: "Back to Freelens",
  },

  aboutPage: {
    eyebrow: "Why Freelens exists",
    heading: "A reply, ready before the moment passes.",
    intro: "Most work is not lost on price or portfolio. It is lost in the two days it took to answer. The inquiry arrived while you were shooting, you meant to reply properly that evening, and by the time you did they had already spoken to someone else. Freelens is the front desk that answers in the meantime.",
    what: {
      h: "What Freelens does",
      p1: "You get a page to send people to. When someone fills it in, Freelens reads what they wrote, matches it against the packages you set up, and prepares a reply in your voice, usually within seconds. It waits in your inbox with the reasoning next to it: what it read, which price it used, what it could not check.",
      p2: "You read it, change anything you want, and send it yourself from your own mail. Freelens never sends anything to anyone. If a client goes quiet, one follow-up is prepared the same way, and it waits for you too.",
    },
    boundary: {
      h: "What Freelens knows",
      p1: "The inquiry itself, the packages and prices you entered, and a profile of how you write, built from replies you chose to share. Your client's email address is never sent to the AI: it is used to address the mail you send, and nothing else. You can change or delete what it remembers at any time, per item, and see the evidence behind every learned preference.",
    },
    trust: {
      h: "Why the drafts are safe to send",
      p1: "Every price in a draft has to match a package you set yourself; a draft that invents a number is thrown away before you see it. Freelens never says you are free on a date, because it has no access to your calendar and says so in the draft's own notes. Nothing is ever sent, quoted or confirmed without you.",
      p2: "That is the whole design: the AI writes, the checks are ordinary code, and you decide.",
    },
    going: {
      h: "Where this is going",
      p1: "Freelens is in private beta. Nothing is open to the public yet, and we would rather say that than pretend otherwise. We are putting together a first small group of freelancers to use it and tell us what is wrong with it. If you're a photographer, videographer, designer, illustrator, or another creative freelancer who books work by inquiry, join the list.",
    },
    ctaPrimary: "Put me on the waitlist",
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
