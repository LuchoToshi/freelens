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
      about: "About",
      openTool: "See my payout",
      accuracy: "Accuracy & sources",
      methodology: "How it's calculated",
      rate: "What should I charge?",
      openFreelens: "Open Freelens",
    },
    back: "Back",
    languageSwitcher: {
      label: "Language",
      switchTo: "Switch to",
    },
    example: "Example",
    footer: {
      trustLine:
        "Not tax advice. A clear estimate to work from. Your numbers never leave your browser.",
      cta: "See what I can pay myself",
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
    home: {
      title: "Freelens: Money arrived. Know what happens next.",
      description:
        "Freelens helps Dutch freelancers and ZZP'ers separate VAT, protect a tax reserve, cover business costs, and see what may be available to pay themselves. Planning estimates, not tax advice. Your numbers stay on this device.",
    },
    about: {
      title: "Why Freelens exists: the decision layer for freelancers",
      description:
        "Freelens is the decision layer between your bank account and your bookkeeping. It complements your tools and turns one incoming payment into a simple, trustworthy plan, so paying yourself feels safe, not stressful.",
    },
    tool: {
      title: "Your money workspace · Freelens",
      description:
        "Give an incoming payment a job: separate the VAT, protect an income tax and Zvw reserve, cover business costs, and see what is safely yours.",
    },
    tarief: {
      title: "What should I charge? Your day rate, on the real Dutch tax rules",
      description:
        "Work out the day rate or project quote you need as a Dutch ZZP'er, using the real 2026 brackets, deductions and credits instead of a flat percentage. It tells you your floor, not what the market pays. Your numbers stay on this device.",
    },
  },

  home: {
    hero: {
      eyebrow: "For Dutch freelancers and ZZP'ers",
      headlineStatic: "Money arrived. Know what happens next.",
      headlineLine1: "Money arrived",
      headlineLine3: "Know what happens next.",
      contexts: [
        "from a shoot",
        "from a gig",
        "from a client",
        "from a campaign",
        "from a production day",
      ],
      body: "A client paid you. See what's VAT, what to reserve for tax, what stays in the business, and what you can pay yourself.",
      primaryCta: "See what I can pay myself",
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
      note: "Example uses {rate}% VAT and the {year} Dutch tax rules, for someone expecting {profit} profit this year{rateNote}.",
      rateNote: ", so {pct}% of this payment",
      amountLabel: "How much did you receive?",
      vatGroupLabel: "VAT inclusion",
      includesVat: "Includes VAT",
      excludesVat: "Excludes VAT",
      received: "Payment received",
      vatIncluded: "VAT included in this payment",
      reserve: "Income tax and Zvw reserve",
      available: "May be available to pay yourself",
      footnote:
        "A planning estimate, not a tax assessment. The real tool uses your own VAT treatment and reserve rules. Your numbers stay on your device.",
    },
    problem: {
      eyebrow: "The real problem",
      heading: "Your bank balance is not your salary.",
      body: "A balance tells you how much money exists. It doesn't tell you what's actually available to pay yourself.",
      claims: {
        vat: "What may be needed for VAT",
        tax: "What belongs to the tax authority",
        costs: "What it costs to run the business",
        buffer: "What should stay as a buffer",
      },
      closing:
        "Freelens turns an irregular payment into a clear allocation plan, so you know what to do with money the moment it lands.",
      demoLabel: "A {amount} payment",
      demoYours: "{amount} yours",
    },
    howItWorks: {
      eyebrow: "How it works",
      heading: "Every payment, given a job.",
      body: "Overview, Money arrived, Weekly check-in, and Check a decision aren't four separate tools. They're one loop: a payment lands and you give it a job, you glance at your position each week, and you test any big spend against it. Every new payment is a new decision.",
      steps: {
        moneyArrives: {
          title: "Money arrives",
          body: "Enter a payment. Freelens separates the VAT, sets aside an income tax and Zvw reserve, and protects your business costs, so what's left is genuinely available to pay yourself.",
        },
        weekly: {
          title: "A calm weekly check-in",
          body: "A five-minute weekly habit that prevents tax-time surprises: what's protected, what may be available, and how many months of runway you have. Saved on your device, so it remembers and you don't have to.",
        },
        decision: {
          title: "Check a decision",
          body: "Thinking about a purchase or a payout? See whether it fits within your optional spending room, and what it does to your runway, before you spend, not after.",
        },
        peace: {
          title: "Peace of mind",
          body: "Every euro has a job. Your reserves stay visible and protected. You know what you can do next.",
        },
      },
      visuals: {
        runway: "{months} months of runway",
        fits: "Fits",
        decisionRoom: "{spend} → {room} room",
        everyEuro: "Every euro has a job",
      },
    },
    socialProof: {
      ariaLabel: "From real freelancers",
      eyebrow: "From real freelancers",
      heading: "Real stories, coming soon.",
      body: "We'd rather show real freelancer experiences than invented quotes, so we're gathering them now. Here's what Freelens is built to change day to day.",
      outcomes: [
        "After every invoice, you know what to set aside.",
        "No more year-end tax surprises.",
        "A calm five-minute weekly habit.",
      ],
      footnotePrefix: "Used Freelens and want your story here?",
      footnoteLink: "Read why we built it",
    },
    privacy: {
      ariaLabel: "Privacy",
      eyebrow: "Are my numbers safe?",
      heading: "Your financial data never leaves your browser.",
      body: "Nothing is uploaded to Freelens. Your saved values remain on this device, and you can clear them at any time.",
      points: ["No accounts.", "No tracking.", "No surprises."],
      thisDevice: "this device",
      demo: {
        vat: "VAT reserved",
        reserve: "Tax reserve",
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
          a: "Only on your own device, in your browser, and only when you choose to save. Nothing is uploaded to Freelens.",
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
    positioning: {
      ariaLabel: "What Freelens is",
      lead: "The decision layer between your bank account and your bookkeeping.",
      body: "Your banking and bookkeeping already show what exists and what happened. Freelens turns that into what you can safely do next. It complements your tools, it doesn't replace them.",
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
    finalCta: {
      heading: "Give your next payment a job.",
      cta: "See what I can pay myself",
    },
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
      "It applies your chosen reserve rules consistently.",
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
        "Freelens used to reserve 30% of revenue. That is wrong in both directions at once, and the error is largest exactly where the money is. These three cases come straight from the engine, and the full ten are in OLD_VS_NEW.md.",
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
      "That is {effective}% of the profit overall, while the next euro earned is taxed at {marginal}%. Freelens reserves from a payment at the second rate, because a new payment sits on top of everything already earned this year.",
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
  aboutPage: {
    eyebrow: "Why Freelens exists",
    heading: "Paying yourself should feel safe, not stressful.",
    lead:
      "Freelens exists to make one recurring moment calm: a client finally pays, and you need to know what you can actually do with the money.",
    moment:
      "A client finally pays. The bank balance suddenly looks healthy. For a moment it feels like you've made it.",
    questions:
      "Then the questions start. How much belongs to VAT? Can I finally pay myself? Can I buy that new lens, or should I wait? Will I regret this in three months?",
    heldBack:
      "Creative freelancers are rarely held back by their craft. They're held back by uncertainty around money, not because they're irresponsible, but because the answer is genuinely hard to see.",
    toolsHeading: "The usual tools answer a different question.",
    tools: [
      "Banking apps show your balance.",
      "Accounting software records what happened.",
      "Tax software helps you file.",
    ],
    layerHeading: "Freelens is the decision layer between your bank account and your bookkeeping.",
    layerBody:
      "It sits between the two and turns raw financial activity into actionable guidance. One incoming payment becomes a simple plan: reserve this for VAT, protect that for tax, keep this for the business, and this part is safely yours.",
    complements:
      "It complements the rest of your stack: banking apps, accounting software, invoicing tools, spreadsheets all keep their place. Freelens doesn't replace them, it answers the question none of them answer.",
    trustHeading: "Built on trust and clarity.",
    trustBody:
      "The product favours deterministic logic, transparent assumptions, and explainable outputs over “magic.” Where automation helps, it stays behind a clear, reviewable decision.",
    opinionated:
      "Freelens is intentionally opinionated. It focuses on one recurring decision instead of trying to become another finance platform.",
    privacyHeading: "Your numbers stay on your device.",
    privacyBody:
      "No account. No bank connection. No cloud required. Your figures are saved locally in your browser and never uploaded to Freelens, and you can clear them at any time.",
    futureHeading: "Where this is going.",
    futureBody:
      "Freelens wants to become the trusted financial decision layer for independent creatives, not replacing accountants or bookkeeping, but making everyday money decisions calm and clear.",
    futureNote:
      "Today everything is entered manually. Over time, optional conveniences like CSV import and read-only imports may follow, always optional, never required, and never at the cost of clarity.",
    ctaHeading: "Try your latest payment.",
    ctaBody: "See what you can safely pay yourself in about a minute.",
    cta: "See what I can pay myself",
  },
  rate: {
      eyebrow: "Before the job",
      heading: "What do you need to charge?",
      floor:
        "This is what you need to charge, not what you can charge. It is your floor: below it the work does not pay for itself once tax and costs are out.",
      marketNote:
        "What the market will pay is a different question. Freelens has no view on it, and will never pretend to.",
      framing:
        "Most rate calculators apply one flat percentage. Freelens runs the real {year} brackets, deductions and credits, which is why the answer changes depending on where you already are in your year.",
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
      exampleIntro: "A filled-in week looks like this.",
      exampleVat: "Protected VAT",
      exampleReserve: "Protected reserve",
      exampleRunway: "{months} months",
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
          title: "A payment came in? Give it a job.",
          cta: "See what I can pay myself",
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
          title: "Your money workspace",
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
      storageUnavailable:
        "Storage is unavailable in this browser, so your figures won't be saved on this device between visits. Nothing is uploaded either way.",
      privacyToggle: "Privacy and data",
      privacySentence: "Saved only on this device. Nothing is uploaded to Freelens.",
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
        reserveSourceNote:
          "Reserve based on the percentage you set (a planning rule, not a tax assessment).",
        markHandled: "Mark allocation as handled",
        savedOnDevice: "Saved on this device.",
        movesMoneyNote:
          "Freelens records the plan on this device. You still need to move the money in your bank.",
      },
      sample: {
        intro:
          "Here's how a {amount} payment at 21% VAT splits, for someone expecting {profit} profit this year{rate}.",
        rateNote: " (reserved at {pct}%, the rate on their next euro)",
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
