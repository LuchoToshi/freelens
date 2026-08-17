/**
 * Dutch copy.
 *
 * Written for Dutch freelancers, so it uses "je" throughout: this is a calm
 * tool for one person, not a bank letter. Terminology follows what the
 * Belastingdienst and freelancers actually say, not a literal translation:
 * VAT is btw, the tax reserve is a reservering, and Dutch tax terms
 * (zelfstandigenaftrek, urencriterium, voorlopige aanslag) stay in Dutch
 * because that is what appears on the forms people are holding.
 *
 * Anything not translated here falls back to English at runtime. The
 * `dictionary.test.ts` completeness check is what stops that from happening
 * silently.
 */
import type { DeepPartial } from "@/lib/i18n/types";
import type { en } from "@/lib/i18n/en";

export const nl: DeepPartial<typeof en> = {
  common: {
    brand: "Freelens",
    nav: {
      ariaLabel: "Hoofdnavigatie",
      tryDemo: "Probeer de demo",
      about: "Over ons",
      beforeJob: "Voor de klus",
      afterPayment: "Na betaling",
      quotes: "Je offertes",
      howItWorks: "Hoe het werkt",
      rebooking: "Rebooking",
      tools: "Rekentools",
      menuLabel: "Menu openen",
      privacy: "Privacy",
      contact: "Contact",
      accuracy: "Nauwkeurigheid & bronnen",
      methodology: "Hoe we rekenen",
    },
    back: "Terug",
    skipToContent: "Naar de inhoud",
    languageSwitcher: {
      label: "Taal",
      switchTo: "Schakel over naar",
    },
    example: "Voorbeeld",
    footer: {
      trustLine:
        "Geen belastingadvies. Een heldere schatting om mee te werken. Je cijfers verlaten je browser nooit.",
      cta: "Na betaling",
      navLabel: "Sitelinks",
    },
    confidence: {
      sentence:
        "Een schatting om mee te plannen, nooit een stilzwijgende belofte. Je cijfers blijven op dit apparaat.",
      toggle: "Hoe deze schatting werkt",
      disclaimer:
        "Freelens geeft schattingen om mee te plannen, op basis van de gegevens en reserveringsregels die je zelf invult. Het berekent niet je definitieve aanslag en is geen belastingadvies.",
    },
    actions: {
      save: "Opslaan",
      saved: "Opgeslagen",
      cancel: "Annuleren",
      edit: "Wijzigen",
      delete: "Verwijderen",
      confirm: "Bevestigen",
      close: "Sluiten",
      change: "wijzigen",
    },
  },

  tryPage: {
    eyebrow: "Probeer Freelens",
    heading: "E\u00e9n week Freelens, in drie minuten.",
    intro:
      "Vul drie klanten in, een nieuwe aanvraag, of iemand die al een tijdje niets van zich heeft laten horen. Freelens rangschikt wie nu een bericht waard is, zegt waarom, en schrijft \u00e9\u00e9n concept in jouw toon.",
    clients: {
      heading: "Stap 1: drie klanten",
      hint: "Echte klanten werken het best. Een voornaam maakt de aanhef persoonlijk; een e-mailadres maakt de verzendknop mogelijk. Allebei optioneel.",
      nameLabel: "Naam klant",
      projectLabel: "Laatste klus",
      monthLabel: "Wanneer was dat?",
      monthPlaceholder: "Kies een maand",
      monthDialogLabel: "Kies maand",
      monthPrevYear: "Vorig jaar",
      monthNextYear: "Volgend jaar",
      contactLabel: "Voornaam contactpersoon",
      contactPlaceholder: "Voor de aanhef",
      emailLabel: "E-mailadres",
      emailPlaceholder: "Voor de verzendknop (optioneel)",
      typeLabel: "Type klant",
      typeBusiness: "Zakelijk",
      typePrivate: "Particulier",
      sample: "Gebruik voorbeelddata",
      next: "Verder: hoe jij schrijft",
    },
    voice: {
      heading: "Stap 2: hoe jij schrijft",
      hint: "Drie keuzes, zodat het concept klinkt als jij en niet als software.",
      craftLabel: "Jouw vak",
      toneLabel: "Toon",
      toneInformal: "Je",
      toneFormal: "U",
      greetingLabel: "Aanhef (optioneel)",
      greetingPlaceholder: "Hoi",
      signoffLabel: "Afsluiting (optioneel)",
      signoffPlaceholder: "Groet,",
      back: "Terug",
      submit: "Laat mijn week zien",
    },
    queue: {
      heading: "Wie is deze week een bericht waard",
      hint: "Gerangschikt volgens dezelfde regels als het echte product: eerst verjaardagen, dan seizoen, dan stilte. Geen AI in de rangschikking, elke reden is controleerbaar.",
      empty: {
        title: "Eerlijk antwoord: niemand, deze week.",
        body: "Geen van deze drie zit op een verjaardag, een seizoensvenster of een half jaar stilte. Zo hoort het te werken: rustige weken blijven rustig. Probeer een klant van vorig jaar, of laad de voorbeelddata.",
        edit: "Klanten aanpassen",
      },
      draftCta: "Schrijf het concept",
      notThisWeek: "Geen reden deze week:",
      fresh: {
        heading: "Nog te vers voor een berichtje",
        body: "{project} was in {month}, dat is {n} maanden geleden. Eerstvolgend logisch moment: {next}, een jaar na de klus.",
        privateExtra: "Tot die tijd: een korte bedankmail met de vraag om een aanbeveling kan altijd.",
      },
      drafting: "Aan het schrijven in jouw toon\u2026",
    },
    draft: {
      heading: "Jouw concept",
      copy: "Kopieer e-mail",
      copied: "Gekopieerd",
      openMail: "Open in je mail",
      mailHint: "Tip: met een e-mailadres opent dit direct in je mailprogramma.",
      loopTeaser: "In het echte Freelens onthoudt de agent dat je dit verstuurde, en ziet je maandagmail wie nog niet antwoordde.",
      locked: "Vul eerst de [vul in:]-delen in. Freelens verzint geen feiten.",
      error: "Het concept kwam niet door onze controles. Probeer het nog een keer.",
      limit: "Dat was het gratis concept voor vandaag. De lijst en de redenen blijven open. Voor meer concepten: zet je op de lijst hieronder.",
    },
    gate: {
      heading: "Er is niets opgeslagen. Dat is het idee, en de grens.",
      body: "Deze proef draaide in je browser. Het echte Freelens bewaart je klantenlijst, doet dit elke maandag opnieuw en mailt je de lijst. Het zit in besloten b\u00e8ta: {spots} founding-plekken, {founding} voor het eerste jaar. Daarna is de standaardprijs {yearly} per jaar of {monthly} per maand.",
      cta: "Zet me op de lijst",
      again: "Nog een keer met andere klanten",
    },
    privacyNote:
      "Alleen de ene klant voor wie je een concept maakt wordt ergens naartoe gestuurd: naam, contactpersoon, klus en datum, eenmalig gebruikt om de e-mail te schrijven en niet opgeslagen. Je e-mailadres wordt alleen gebruikt om je mailprogramma te openen, dat wordt niet verstuurd.",
  },

  meta: {
    home: {
      title: "FrontDesk: verlies geen klussen meer aan een traag antwoord",
      description:
        "Elke aanvraag krijgt een snel, persoonlijk antwoord met jouw echte prijzen, klaar om te versturen. Gebouwd voor creatieve freelancers zoals fotografen, videografen, designers en illustratoren.",
    },
    try: {
      title: "Probeer Freelens met 3 klanten \u00b7 Freelens",
      description:
        "Vul drie oude klanten in en zie wie deze week een bericht waard is, waarom, en krijg \u00e9\u00e9n concept in jouw toon. Zonder account.",
    },
    about: {
      title: "Je oude klanten zijn je volgende boeking \u00b7 Freelens",
      description:
        "Freelens is de laag tussen je bankrekening en je boekhouding waarin je beslist. Het vult je bestaande tools aan en maakt van één binnengekomen betaling een eenvoudig, betrouwbaar plan, zodat jezelf uitbetalen veilig voelt in plaats van spannend.",
    },
    tool: {
      title: "Na betaling · Freelens",
      description:
        "Geef een binnengekomen betaling een taak: haal de btw eruit, bescherm een reservering voor inkomstenbelasting en Zvw, dek je bedrijfskosten, en zie wat er veilig van jou is.",
    },
    offertes: {
      title: "Je offertes · Freelens",
      description:
        "Elke offerte die je bewaarde: wat je vroeg, wat je eraan zou overhouden, en hoe het afliep. Alleen op dit apparaat opgeslagen.",
    },
    rekentools: {
      title: "Gratis rekentools voor zzp'ers · Freelens",
      description:
        "Wat je moet vragen, en wat er na een betaling echt van jou is. Gratis, zonder account, op de echte Nederlandse regels van 2026. Je cijfers blijven op je apparaat.",
    },
    privacy: {
      title: "Privacy · Freelens",
      description:
        "Wat Freelens verzamelt, wat het nooit verzamelt, en hoe je je gegevens meeneemt of laat verdwijnen.",
    },
    tarief: {
      title: "Wat moet ik vragen? Je dagtarief, op de echte Nederlandse belastingregels",
      description:
        "Bereken als zzp'er het dagtarief of de projectprijs die je nodig hebt, met de echte schijven, aftrekposten en heffingskortingen van 2026 in plaats van een vast percentage. Het geeft je ondergrens, niet wat de markt betaalt. Je cijfers blijven op dit apparaat.",
    },
  },

  home: {
    hero: {
      eyebrow: "Voor creatieve freelancers, op de echte Nederlandse regels",
      headlineStatic: "De zakelijke kant van een klus: geprijsd op de echte regels, bewaakt terwijl je wacht, eerlijk verdeeld als er betaald wordt.",
      headlineLine1: "De zakelijke kant van een",
      headlineLine3: "Geprijsd op de echte regels. Bewaakt terwijl je wacht. Eerlijk verdeeld als er betaald wordt.",
      contexts: [
        "shoot",
        "klus",
        "campagne",
        "opdracht",
        "draaidag",
      ],
      body: "Freelens draait de klus met je mee. Het prijst je tarief op de echte Nederlandse regels van 2026, benoemt wat je offerte nog niet zegt, houdt de klok op het antwoord van de klant, en laat zien wat echt van jou is als het geld binnenkomt.",
      primaryCta: "Begin met een klus",
      secondaryCta: "Bekijk hoe het werkt",
      trust: {
        free: "Gratis te proberen",
        noAccount: "Geen account",
        onDevice: "Cijfers blijven op dit apparaat",
      },
      updated:
        "Gebaseerd op de Nederlandse belastingcijfers van {year}. Bijgewerkt op {updated}.",
      updatedDate: "juli 2026",
      mediaAlt: "Een Nederlandse creatieve freelancer aan het werk",
    },
    heroExample: {
      note: "Voorbeeld: {rate}% btw, de Nederlandse regels van {year}, {profit} verwachte winst dit jaar en {costs} zakelijke kosten die deze betaling moet dekken{rateNote}.",
      rateNote: ", dus {pct}% ervan gaat opzij voor de belasting",
      amountLabel: "Hoeveel heb je ontvangen?",
      vatGroupLabel: "Btw inbegrepen",
      includesVat: "Inclusief btw",
      excludesVat: "Exclusief btw",
      received: "Ontvangen betaling",
      vatIncluded: "Btw in deze betaling",
      reserve: "Reservering inkomstenbelasting en Zvw",
      business: "Zakelijke kosten om te dekken",
      available: "Mogelijk beschikbaar om jezelf uit te betalen",
      footnote:
        "Een schatting om mee te plannen, geen aanslag. De echte tool gebruikt jouw eigen btw-behandeling en reserveringsregels. Je cijfers blijven op je apparaat.",
    },
    privacy: {
      ariaLabel: "Privacy",
      eyebrow: "Zijn mijn cijfers veilig?",
      heading: "Je financiële gegevens verlaten je browser nooit.",
      body: "Je bedragen worden nooit geüpload. Ze staan in deze browser en je kunt ze altijd wissen. Freelens telt anonieme paginaweergaven, en bewaart een e-mailadres alleen als je dat zelf achterlaat. Dat is alles wat we verzamelen.",
      points: ["Geen accounts.", "Geen bankkoppeling.", "Geen bedragen geüpload."],
      thisDevice: "dit apparaat",
      demo: {
        vat: "Btw gereserveerd",
        reserve: "Belastingreservering",
        business: "Zakelijke kosten",
        available: "Beschikbaar voor jou",
      },
      staysHere: "Blijft hier. Nooit geüpload.",
    },
    faq: {
      ariaLabel: "Veelgestelde vragen",
      eyebrow: "Vragen",
      heading: "Vragen die eerst een antwoord verdienen.",
      topicsLabel: "Onderwerpen",
      groups: {
        number: "Jouw bedrag",
        vat: "Btw en reservering",
        privacy: "Privacy en veiligheid",
      },
      footnotePrefix: "Meer over de regels en de officiële bronnen staat op de",
      footnoteLink: "pagina over nauwkeurigheid",
      items: {
        finalBill: {
          q: "Berekent Freelens mijn definitieve aanslag?",
          a: "Nee. Freelens helpt je een voorzichtige reservering opzij te zetten en je positie te zien. Je uiteindelijke inkomstenbelasting hangt af van je belastbare jaarwinst, aftrekposten, heffingskortingen en persoonlijke situatie. Alleen de Belastingdienst of je boekhouder kan dat vaststellen.",
        },
        onePayment: {
          q: "Waarom kan Freelens mijn precieze inkomstenbelasting niet uit één betaling halen?",
          a: "Inkomstenbelasting gaat over je belastbare winst van het hele jaar, niet over één betaling of je banksaldo. Een percentage over een betaling is een reserveringsregel, geen berekening van wat je verschuldigd bent.",
        },
        reservePct: {
          q: "Wat betekent het reserveringspercentage?",
          a: "Het is het deel van een betaling (of van je winst) dat je opzij kiest te zetten voor inkomstenbelasting en Zvw. Freelens past het consequent toe. Het is een planningsregel die jij bepaalt, geen officieel cijfer.",
        },
        balance: {
          q: "Waarom is mijn banksaldo niet mijn salaris?",
          a: "Omdat een deel ervan van de Belastingdienst is, een deel btw kan zijn, een deel nodig is om de zaak te runnen, en een deel als buffer moet blijven staan. Wat echt van jou is om uit te betalen, is wat daarna overblijft.",
        },
        bookkeeping: {
          q: "Vervangt Freelens mijn boekhouding?",
          a: "Nee. Freelens is een plannings- en reserveringstool. Het legt geen transacties vast, doet geen aangifte en vervangt geen boekhoudsoftware of boekhouder.",
        },
        provisional: {
          q: "Wat is een voorlopige aanslag?",
          a: "Een voorlopige aanslag is een schatting van de Belastingdienst van wat je dit jaar moet betalen, vaak in termijnen. Heb je er een, dan kun je dat bedrag invullen als je reserveringsmethode.",
        },
        howOften: {
          q: "Hoe vaak moet ik mijn cijfers bijwerken?",
          a: "Een wekelijkse check-in houdt je positie actueel. Freelens geeft aan wanneer je laatste check-in oud begint te worden, zodat je weet wanneer het tijd is om bij te werken.",
        },
        vatHow: {
          q: "Hoe werkt btw in Freelens?",
          a: "Bij een betaling met 21% of 9% haalt Freelens de btw uit het bedrag, zodat je die niet als inkomen behandelt. Het merkt die aan als btw om apart te houden. Je werkelijke btw-aangifte kan lager of hoger uitvallen na aftrekbare voorbelasting en andere transacties.",
        },
        kor: {
          q: "Wat als ik de KOR gebruik?",
          a: "Kies je de KOR-behandeling, dan telt Freelens geen btw bij de betaling op. Onder de KOR breng je in de regel geen btw in rekening en doe je geen gewone btw-aangifte, en is voorbelasting tijdens deelname in de regel niet aftrekbaar.",
        },
        reverseCharged: {
          q: "Wat als de btw verlegd is?",
          a: "Kies de behandeling 'verlegd' en Freelens rekent geen btw als geïnd. Bevestig de transactie in je boekhouding. Verlegde btw is geen gewone af te dragen btw.",
        },
        inputVat: {
          q: "Houdt Freelens rekening met aftrekbare voorbelasting?",
          a: "Niet automatisch vanuit één betaling. Je kunt je werkelijke btw-positie uit je boekhouding invullen bij de wekelijkse check-in, wat vaak nauwkeuriger is dan btw per betaling optellen.",
        },
        zvw: {
          q: "Wat is de Zvw-bijdrage?",
          a: "De inkomensafhankelijke bijdrage voor de Zorgverzekeringswet. Die kan bovenop de inkomstenbelasting en premies volksverzekeringen komen, tot een maximum bijdrage-inkomen. Freelens toont die als aparte regel in de schatting.",
        },
        storeData: {
          q: "Slaat Freelens mijn financiële gegevens op?",
          a: "Alleen op je eigen apparaat, in je browser, en alleen als je zelf kiest om op te slaan. Je bedragen worden nooit geüpload. Freelens telt anonieme paginaweergaven, zonder cookie en zonder iets dat jou identificeert, en dat is alles wat je browser verlaat.",
        },
        deleteData: {
          q: "Kan ik mijn opgeslagen gegevens verwijderen?",
          a: "Ja. Er is een duidelijke optie 'Opgeslagen gegevens wissen' die alles verwijdert wat Freelens op je apparaat heeft opgeslagen, na een bevestiging.",
        },
        bank: {
          q: "Moet ik mijn bank koppelen?",
          a: "Nee. Er zijn geen bankkoppelingen en geen account. Je vult de cijfers zelf in en ze blijven op je apparaat.",
        },
      },
    },
    moments: {
      ariaLabel: "Probeer Freelens",
      eyebrow: "Probeer het",
      heading: "Stap in waar de klus nu is.",
      body: "Prijs een tarief waar je over nadenkt, of verdeel een betaling die binnenkwam. Dezelfde motor, dezelfde Nederlandse regels van {year}, één dossier, en niets wat je hier invult wordt opgeslagen of verstuurd tot jij dat zegt.",
      tablistLabel: "In welk moment zit je?",
      before: {
        tab: "Ik moet nog een prijs bepalen",
        tabSub: "Wat houd ik over aan dit tarief?",
        deepLink: "Bereken een dagtarief voor het hele jaar",
      },
      after: {
        tab: "Ik ben betaald",
        tabSub: "Wat is hier echt van mij?",
        deepLink: "Bekijk je hele positie",
      },
      whyDifferent: {
        toggle: "Waarom laten de twee tabbladen andere percentages zien?",
        body: "Omdat ze een andere vraag beantwoorden. Bij offreren gaat het om wat één klus extra bovenop je verwachte jaar oplevert, dus die wordt belast tegen het tarief waar die klus je in duwt. Een betaling die al binnen is hoort bij een jaar waar je al aan vastzit, dus die draagt zijn deel van de hele jaarrekening. Dezelfde motor, dezelfde regels, twee eerlijke antwoorden.",
      },
    },

    signup: {
      ariaLabel: "Hoor het als de regels veranderen",
      heading: "De regels schuiven. Deze site schuift mee.",
      body: "Elk cijfer hier komt uit config {version}, gecontroleerd bij belastingdienst.nl op {date}. Laat een e-mailadres achter en we melden het als de regels veranderen en de cijfers verschuiven. Meer mail krijg je niet.",
      bodyFallback: "Elk cijfer hier wordt gecontroleerd bij belastingdienst.nl. Laat een e-mailadres achter en we melden het als de regels veranderen en de cijfers verschuiven. Meer mail krijg je niet.",
      emailLabel: "Je e-mailadres",
      placeholder: "jij@voorbeeld.nl",
      submit: "Meld me als de regels veranderen",
      sending: "Momentje",
      done: "Genoteerd. Je hoort van ons zodra de cijfers verschuiven, en niet eerder.",
      error: "Dat ging niet door. Controleer het adres en probeer het opnieuw.",
      privacyNote: "Alleen voor dit ene doel bewaard, nooit gedeeld, en elke mail heeft een afmeldlink. Je berekeningen blijven hoe dan ook op je apparaat.",
    },

    frontdesk: {
      heroEyebrow: "FrontDesk",
      heroTitle: "Verlies geen klussen meer aan een traag antwoord.",
      heroSub:
        "Elke aanvraag krijgt een snel, persoonlijk antwoord met jouw echte prijzen, klaar om te versturen. Jij tikt alleen op verzenden.",
      heroCta: "Zet me op de lijst",
      heroCtaTry: "Probeer het live",
      heroCtaTryCaption: "Geen account nodig, bekijk een echt concept in minder dan een minuut.",
      example: {
        label: "Zo ziet één aanvraag eruit.",
        inquiryLabel: "Aanvraag",
        clientName: "Lisa",
        eventType: "Bruiloft",
        eventDate: "14 juni 2026",
        budget: "€1.000–2.500",
        draftLabel: "Het antwoord",
        draft:
          "Hoi Lisa! Wat leuk dat je aan me denkt voor 14 juni. Bruiloften vastleggen is echt mijn ding. Voor een hele trouwdag werk ik met pakketten vanaf €1.950, inclusief tweede fotograaf. Ik check de datum graag even en hoor graag jullie plannen. Zullen we deze week kort bellen?\n\nEmma",
        caption: "Klaar in ~20 seconden. Verstuurd vanuit je eigen inbox.",
      },
      demo: {
        types: {
          wedding: {
            label: "Bruiloft",
            clientName: "Lisa",
            eventDate: "14 juni 2026",
            budget: "€1.000–2.500",
            draft:
              "Hoi Lisa! Wat leuk dat je aan me denkt voor 14 juni. Bruiloften vastleggen is echt mijn ding. Voor een hele trouwdag werk ik met pakketten vanaf €1.950, inclusief tweede fotograaf. Ik check de datum graag even en hoor graag jullie plannen. Zullen we deze week kort bellen?\n\nEmma",
          },
          party: {
            label: "Feest",
            clientName: "Sanne",
            eventDate: "21 maart 2026",
            budget: "€500–1.000",
            draft:
              "Hoi Sanne! Wat leuk, een feest vastleggen is altijd goud: echte momenten, geen poses. Vertel me iets meer over wat jullie vieren en hoe groot het gezelschap is, dan denk ik met je mee over de aanpak. Voor feesten stel ik het pakket meestal op maat samen, afhankelijk van het aantal uren en wat je met de foto's wilt. Ik check de datum graag even. Zullen we deze week kort bellen of mailen?\n\nEmma",
          },
          business: {
            label: "Zakelijk",
            clientName: "Mark",
            eventDate: "9 april 2026",
            budget: "€1.000–2.500",
            draft:
              "Hoi Mark! Goed om van je te horen. Zakelijke shoots doe ik regelmatig, van teamportretten tot beeld voor je website, en ik hoor graag wat jullie precies zoeken. Vertel me iets over jullie merk en waar de foto's voor bedoeld zijn, dan maak ik een voorstel op maat dat past bij jullie doel en budget. De datum check ik graag even. Zal ik je deze week bellen om het door te nemen?\n\nEmma",
          },
          portrait: {
            label: "Portret",
            clientName: "Nadia",
            eventDate: "2 mei 2026",
            budget: "€250–500",
            draft:
              "Hoi Nadia! Leuk dat je een portretshoot wilt plannen. Een goede portretsessie voelt meer als een goed gesprek dan als een fotoshoot, en dat zie je terug in de beelden. Voor een portretsessie werk ik met een pakket vanaf €350, inclusief nabewerking van de beste foto's. Vertel me iets over waar de portretten voor zijn, dan stem ik de aanpak daarop af. Ik check de datum graag even. Wanneer schikt het jou?\n\nEmma",
          },
        },
        caption: "Klaar in ongeveer 20 seconden. Verstuurd vanuit je eigen inbox.",
        bridge: "Zo werkt het straks met jouw prijzen en jouw stijl.",
      },
      objections: {
        items: [
          {
            q: "Klinkt het echt als jij?",
            a: "Ja. Je plakt een paar van je eigen antwoorden, en FrontDesk leert je toon. Warm of zakelijk, kort of uitgebreid, met of zonder emoji: het schrijft zoals jij schrijft.",
          },
          {
            q: "Verzint het prijzen of belooft het datums?",
            a: "Nooit. Het gebruikt alleen de prijzen die jij instelt, en het zegt nooit dat een datum vrij is. Dat check je zelf.",
          },
          {
            q: "Verlies ik de controle?",
            a: "Nee. Er gaat niks weg zonder jou. Elk antwoord is één tik, vanuit jouw eigen inbox.",
          },
        ],
      },
      followup: {
        q: "En als een klant stil valt?",
        a: "Dan ligt de follow-up al klaar. Dat ene berichtje dat je eigenlijk nooit stuurt, is precies waar klussen terugkomen.",
      },
      audience: {
        line: "Voor creatieve freelancers: fotografen, videografen, designers, illustratoren en iedereen die op aanvraag werkt.",
        overflow: "Doe je iets anders? Vertel ons wat je maakt →",
      },
      trust:
        "Antwoorden worden met AI opgesteld. Jij keurt elk antwoord goed en verstuurt het zelf. Het e-mailadres van je klant gaat nooit naar de AI.",
      waitlist: {
        heading: "FrontDesk opent binnenkort.",
        sub: "Zet je op de lijst en je bent er als eerste bij. Geen spam, alleen een berichtje als je aan de beurt bent.",
        nameLabel: "Je naam",
        namePlaceholder: "Voornaam is genoeg",
        emailLabel: "Je e-mailadres",
        emailPlaceholder: "jij@voorbeeld.nl",
        craftLabel: "Wat maak je?",
        crafts: {
          photographer: "Fotograaf",
          videographer: "Videograaf",
          designer: "Ontwerper",
          illustrator: "Illustrator",
          other: "Iets anders",
        },
        otherHint: "Kies dit als je iets anders doet.",
        submit: "Zet me op de lijst",
        sending: "Momentje",
        done: "Je staat op de lijst. We laten van ons horen.",
        error: "Er ging iets mis. Probeer het zo nog eens.",
        privacyNote: "We gebruiken je e-mailadres alleen om je op de hoogte te houden van FrontDesk. Uitschrijven kan altijd.",
      },
    },

    rebooking: {
      heroEyebrow: "Voor creatieve freelancers",
      betaPill: "Besloten b\u00e8ta \u00b7 we onboarden de eerste 25",
      heroQuestion: "Wanneer sprak je je beste klant van vorig jaar voor het laatst?",
      heroSub: "Je makkelijkste volgende klus is een klant die je al kent. Freelens onthoudt wie, weet wanneer, en schrijft de eerste mail, in jouw toon. Jij drukt op verzenden.",
      heroCta: "Zet me op de wachtlijst",
      heroCtaTry: "Probeer het met 3 klanten, zonder account",
      how: {
        eyebrow: "Zo gaat het werken",
        heading: "Drie stappen, waarvan \u00e9\u00e9n van jou.",
        steps: [
          {
            title: "Geef \u00e9\u00e9n keer je oude klanten door",
            body: "Naam, wat je deed, wanneer, ongeveer welk bedrag. Een kwartier werk, en daarna nooit meer.",
          },
          {
            title: "Elke week: twee tot vier mensen die een berichtje waard zijn",
            body: "Gekozen met een echte reden: een jaar na de vorige shoot, briefingseizoen in hun wereld, nooit \u201ceven checken\u201d.",
          },
          {
            title: "Het schrijft, jij verstuurt",
            body: "De mail staat klaar in jouw toon. Jij past aan wat je wilt en verstuurt hem vanuit je eigen inbox. Freelens verstuurt nooit iets naar wie dan ook.",
          },
        ],
      },
      example: {
        kicker: "Zo ziet dat eruit",
        heading: "E\u00e9n suggestie, zoals je die elke week krijgt.",
        recordLabel: "Uit jouw gegevens",
        recordName: "Marloes \u00b7 De Groene Kamer (interieurwinkel)",
        recordProject: "Najaarscampagne geschoten \u00b7 oktober 2025 \u00b7 \u00b1 \u20ac 1.800",
        reasonLabel: "De reden, deze week",
        reasonText: "Vorig jaar viel de briefing voor de najaarscampagne in augustus.\nAls De Groene Kamer dit jaar weer schiet, wordt die nu gepland.",
        draftLabel: "De mail, in jouw toon",
        draftSubject: "Onderwerp: Najaarscampagne De Groene Kamer?",
        draftBody: "Hoi Marloes,\n\nVorig jaar oktober schoot ik de najaarscampagne voor De Groene Kamer, een van de leukste klussen van dat seizoen.\n\nIk zit mijn najaar nu in te plannen en moest aan jullie denken: staat er dit jaar weer een campagne op de planning? Dan hou ik graag alvast ruimte vrij.\n\nGroet,\nSam",
        micro: "Een voorbeeld. Elke reden komt uit jouw eigen gegevens: klopt een datum niet, dan pas je hem aan. De mail verstuur jij zelf, uit je eigen inbox.",
      },
      offer: {
        eyebrow: "Founding-aanbod",
        heading: "Freelens Rebooking is in besloten b\u00e8ta.",
        body: "We onboarden de eerste 25 freelancers. Er is nog niets live, en dat zeggen we liever hardop dan dat we doen alsof.",
        priceLine: "Founding-prijs: {founding} voor het eerste jaar.",
        priceNote: "De standaardprijs wordt {yearly} per jaar of {monthly} per maand. Founding-plekken zijn beperkt tot {spots} en bestaan alleen v\u00f3\u00f3r de lancering.",
      },
      waitlist: {
        heading: "Zet je op de lijst voor een van de 25 plekken",
        noCommit: "Aanmelden is gratis en verplicht je tot niets. Zodra de b\u00e8ta opent, bieden we de {spots} founding-plekken ({founding} voor het eerste jaar) aan in volgorde van aanmelding, je beslist dan pas.",
        nameLabel: "Je naam",
        namePlaceholder: "Voornaam is genoeg",
        emailLabel: "Je e-mailadres",
        emailPlaceholder: "jij@voorbeeld.nl",
        craftLabel: "Wat maak je?",
        crafts: {
          photographer: "Fotograaf",
          videographer: "Videograaf",
          designer: "Ontwerper",
          illustrator: "Illustrator",
          other: "Iets anders",
        },
        submit: "Zet me op de wachtlijst",
        sending: "Momentje",
        done: "Bijna: open je inbox en klik op de bevestigingslink. Geen bevestiging, geen plek, zo weten we dat het adres van jou is.",
        error: "Dat ging niet door. Controleer de velden en probeer het opnieuw.",
        privacyNote: "Alleen gebruikt om je over de b\u00e8ta te vertellen. Door jou bevestigd, op verzoek verwijderd, nooit gedeeld.",
      },
      trust: {
        eyebrow: "Waar de grens ligt",
        heading: "De agent verstuurt nooit iets.",
        body: "Jij verstuurt altijd zelf, vanuit je eigen mail. Je klantgegevens worden nergens anders voor gebruikt en zijn altijd te exporteren en te verwijderen.",
        points: [
          "Elke mail vertrekt uit je eigen inbox, verstuurd door jou",
          "Klantrecords bevatten een naam, een project, een datum, nooit adressen, telefoonnummers of registratienummers",
          "Alles exporteren of alles verwijderen, vanaf dag \u00e9\u00e9n",
        ],
      },
      tools: {
        eyebrow: "Ondertussen, gratis",
        heading: "Gratis rekentools voor zzp'ers.",
        body: "De deterministische belastingmotor achter Freelens is vandaag al live, gecontroleerd bij belastingdienst.nl.",
        teaser: "De vaste 30%-regel zit er op echte cijfers tot \u20ac16.720 naast.",
        teaserCta: "Bekijk het bewijs",
        allCta: "Alle rekentools",
      },
    },

    lifecycle: {
      ariaLabel: "Hoe Freelens een klus meedraait",
      eyebrow: "Eén klus, van begin tot eind",
      heading: "Freelens draait de klus met je mee.",
      body: "Geen twee losse rekentools. Eén dossier dat de klus volgt van het eerste getal dat je intypt tot het geld op je rekening, en dat scherper wordt elke keer dat je vastlegt hoe een offerte afliep.",
      stages: {
        appears: {
          title: "Er komt een klus binnen",
          body: "Typ het tarief waar je aan denkt. Freelens prijst het op de echte schijven, aftrekposten en heffingskortingen, bovenop wat je dit jaar al verwacht, en laat zien wat je er werkelijk aan overhoudt.",
        },
        beforeSend: {
          title: "Voordat de offerte de deur uitgaat",
          body: "Het legt de vragen voor je klaar die creatieve offertes overslaan: gebruiksrechten, revisierondes, een aanbetaling, een annuleringsvergoeding. Onbeantwoord is prima. Ongesteld is hoe een klus twee keer zo groot wordt.",
        },
        waiting: {
          title: "Terwijl je wacht",
          body: "Bewaar de offerte en de klok loopt. Twee weken zonder antwoord en Freelens zegt het, voordat nabellen ongemakkelijk wordt. Een factuur krijgt dezelfde behandeling op 30 en 60 dagen.",
        },
        outcome: {
          title: "Gewonnen, of verloren",
          body: "Eén tik legt de uitkomst vast, en de prijs waar het echt op uitkwam. Het verschil tussen geoffreerd en afgesproken is jouw eigen kortingsgeschiedenis, en geen boekhoudpakket kan die bewaren, want een verloren offerte haalt de boekhouding nooit.",
        },
        lands: {
          title: "Het geld komt binnen",
          body: "De betaling valt uiteen in btw, een belastingreservering op de echte regels, zakelijke kosten en wat echt van jou is. Meegeteld in je jaar, zodat de volgende offerte in de juiste schijf valt.",
        },
        learns: {
          title: "De volgende klus weet meer",
          body: "Elke vastgelegde uitkomst maakt het beeld scherper: wat je vraagt, wat je wint, waar je op uitkomt. Dat is de dataset die niemand anders heeft, wat de markt van jouw prijzen vindt, en hij staat op jouw apparaat.",
        },
      },
    },

    flatRule: {
      ariaLabel: "Wat de vaste regel kost",
      eyebrow: "Het bewijs",
      heading: "Wat de 30%-regel je echt kost.",
      link: "Hoe we dit weten: elk tarief, elke bron, elk geval",
    },

    accuracy: {
      ariaLabel: "Nauwkeurigheid en beperkingen",
      eyebrow: "Nauwkeurigheid",
      heading: "Eerlijk over wat dit is.",
      sentence:
        "Freelens geeft je een heldere schatting om mee te plannen, nooit een uitspraak over je definitieve aanslag.",
      detail:
        "Het geeft schattingen om mee te plannen, op basis van de gegevens en reserveringsregels die je zelf invult. Het berekent niet je definitieve aanslag, is geen belastingadvies, en vervangt niet de Belastingdienst, een boekhouder of je administratie.",
      link: "Lees onze notities over nauwkeurigheid en de officiële bronnen →",
    },
  },

    notFound: {
    title: "Pagina niet gevonden \u00b7 Freelens",
    body: "Deze pagina bestaat niet.",
    back: "Terug naar Freelens",
  },

  aboutPage: {
    eyebrow: "Waarom Freelens bestaat",
    heading: "Je oude klanten zijn je volgende boeking.",
    intro: "De stilste maanden van een creatieve freelancer zijn zelden een kwaliteitsprobleem. Het werk was goed. De klant was blij. Er is alleen niemand die onthoudt wanneer het logische moment is om weer contact te leggen, en dus gebeurt het niet, of het gebeurt als \u201ceven checken\u201d, en dat voelt voor iedereen ongemakkelijk.",
    what: {
      h: "Wat Freelens doet",
      p1: "Freelens onthoudt wie je klanten zijn, weet wanneer een berichtje ergens op slaat, en schrijft de eerste mail, in jouw toon. Elke week: twee tot vier mensen die een bericht waard zijn, elk met een echte reden. Een jaar na de vorige shoot. Briefingseizoen in hun wereld. Nooit \u201ceven checken\u201d.",
      p2: "Jij past aan wat je wilt en verstuurt zelf, vanuit je eigen inbox. Freelens verstuurt nooit iets, naar niemand.",
    },
    boundary: {
      h: "Waar de grens ligt",
      p1: "Klantrecords bevatten een naam, een project, een datum en ongeveer een bedrag. Geen adressen, geen telefoonnummers, geen registratienummers. Alles is vanaf dag \u00e9\u00e9n te exporteren en te verwijderen, en je klantgegevens worden nergens anders voor gebruikt.",
    },
    trust: {
      h: "Waarom je ons met je klanten zou vertrouwen",
      p1: "De belastingmotor achter onze gratis rekentools rekent met de echte Nederlandse schijven, aftrekposten en heffingskortingen van 2026: elk cijfer gecontroleerd bij belastingdienst.nl, elke uitkomst met een uitleg die je kunt nalopen. We hebben zelfs een pagina die voorrekent waar de populaire 30%-vuistregel er tot \u20ac 16.720 naast zit.",
      p2: "Diezelfde standaard geldt voor de agent: elke reden komt uit jouw eigen gegevens, elke mail is gebonden aan wat er echt gebeurd is, en niets wordt verzonnen. Klopt een datum niet, dan pas je hem aan en onthoudt Freelens dat.",
    },
    tools: {
      h: "De gratis rekentools blijven gratis",
      p1: "Wat moet je vragen v\u00f3\u00f3r de klus, en wat is er echt van jou na de betaling: dezelfde berekening, beide kanten op. Zonder account, en je cijfers blijven in je browser. Dat blijft zo.",
    },
    going: {
      h: "Waar dit heen gaat",
      p1: "Freelens Rebooking is in besloten b\u00e8ta. We onboarden de eerste 25 freelancers en zeggen liever hardop dat er nog niets live is dan dat we doen alsof. Als je fotograaf, videograaf, ontwerper of illustrator bent en je wilt dat je beste klanten je niet vergeten: zet je op de lijst.",
    },
    ctaPrimary: "Zet me op de wachtlijst",
    ctaSecondary: "Bekijk de gratis rekentools",
  },

  accuracyPage: {
    metaTitle: "Nauwkeurigheid en bronnen · Freelens",
    metaDescription:
      "Wat Freelens wel en niet berekent, welke reserveringsregels het toepast, en de officiële Nederlandse bronnen daarachter.",
    eyebrow: "Nauwkeurigheid en bronnen",
    heading: "Waar Freelens eerlijk over is.",
    taxYear: "Belastingjaar {year}",
    lastReviewed: "Laatst gecontroleerd {date}",
    reviewedFallback: "recent",
    intro:
      "Freelens geeft schattingen om mee te plannen, op basis van de gegevens en reserveringsregels die je zelf invult. Het berekent niet je definitieve aanslag en is geen belastingadvies.",
    isHeading: "Wat Freelens is",
    is: [
      "Het berekent de reservering over de echte schijven, aftrekposten en heffingskortingen, of past de regel toe die jij koos.",
      "Het haalt de btw eruit en maakt je reserveringen zichtbaar.",
      "Het maakt van een betaling een helder verdeelplan.",
      "Het houdt lokaal bij hoe je ervoor staat, alleen op je eigen apparaat.",
    ],
    isNotHeading: "Wat Freelens niet is",
    isNot:
      "Niet de Belastingdienst, geen boekhouder, geen boekhoudsoftware, geen aangifte en geen voorlopige aanslag. Een percentage over een betaling is een reserveringsregel, geen berekening van wat je verschuldigd bent. Je uiteindelijke inkomstenbelasting hangt af van je belastbare jaarwinst, aftrekposten, heffingskortingen, andere inkomsten en persoonlijke omstandigheden die Freelens niet modelleert.",
    referenceHeading: "Referentiewaarden voor {year}",
    vatLine: "Btw: {rates}.",
    incomeTaxLine:
      "Inkomstenbelasting: {rates}, toegepast op je winst over het jaar na de ondernemersaftrek en de MKB-winstvrijstelling.",
    creditsLine:
      "Heffingskortingen: de algemene heffingskorting en de arbeidskorting, allebei inkomensafhankelijk, worden van de verschuldigde belasting afgetrokken.",
    zvwLine:
      "Zvw: {rate}%, een aparte bijdrage met een eigen maximum grondslag, die nooit bij de inkomstenbelasting wordt opgeteld.",
    configLine:
      "Configuratie {version}. Elk cijfer is op {date} gecontroleerd bij belastingdienst.nl, en moet opnieuw gecontroleerd worden voordat het een ander belastingjaar ondersteunt.",
    deterministic:
      "Alle berekeningen zijn deterministisch: dezelfde invoer levert altijd dezelfde uitkomst, zonder gokwerk en zonder verborgen model. Bij elk resultaat staat een uitleg onder “Waarom dit bedrag?” die je kunt nalopen.",
    seeEveryRate: "Bekijk elk tarief, elke grens en elke bron",
    flatRule: {
      heading: "Wat de vaste 30%-regel fout deed",
      intro:
        "Freelens reserveerde vroeger 30% van de omzet. Dat zit tegelijk in twee richtingen fout, en de fout is het grootst precies daar waar het geld zit. Deze drie gevallen komen rechtstreeks uit de engine, en de engine wordt op alle tien getest.",
      colCase: "Situatie",
      colOld: "Oude regel",
      colReal: "Werkelijk verschuldigd",
      colError: "Verschil",
      over: "{amount} te veel",
      under: "{amount} te weinig",
      exact: "precies goed",
      profitLine: "{revenue} omzet, {costs} kosten",
    caseNames: {
      "7": "Een goed jaar, €95.000 winst",
      "9": "Hoge kosten, €80.000 omzet",
      "10": "Een verliesjaar, €15.000 omzet",
    },
      whyItMatters:
        "Te veel reserveren kost je liquiditeit die je terugkrijgt. Te weinig reserveren is een rekening die je niet kunt betalen. Eén percentage kan die twee niet allebei vermijden, en daarom past Freelens de echte schijven, aftrekposten en heffingskortingen toe.",
    },
    edgeHeading: "Bijzondere situaties om te kennen",
    edgeCases: {
      kor: {
        title: "KOR (kleineondernemersregeling)",
        body: "Onder de KOR breng je geen btw in rekening. Kies Anders → KOR en Freelens zet geen btw apart. Het doet geen btw-aangifte voor je.",
      },
      reverse: {
        title: "Verlegde btw",
        body: "Bij verlegde facturen is er voor jou geen btw om te reserveren. Kies die behandeling, dan telt het bedrag niet mee als btw om apart te zetten.",
      },
      mixed: {
        title: "Meerdere btw-tarieven op één factuur",
        body: "Freelens verdeelt één betaling tegelijk. Staan er 21% en 9% op één factuur, vul dan elk deel apart in, of kies Anders → Gemengd en controleer de verdeling in je boekhouding.",
      },
      outside: {
        title: "Inkomsten naast je freelancewerk",
        body: "Loon verhoogt de schijf waarin je winst valt, en Freelens houdt daar rekening mee als je het invult. Wat het niet doet, is de loonheffing aftrekken die je werkgever al heeft ingehouden, dus reken die als al opzij gezet. Het inkomen van een partner zit helemaal niet in het model.",
      },
      deductions: {
        title: "Belangrijke aftrekposten",
        body: "De zelfstandigenaftrek, de startersaftrek en de MKB-winstvrijstelling worden allemaal toegepast. Investeringsaftrek, fiscale oudedagsreserve en verliesverrekening niet, dus een jaar met een grote investering of een te verrekenen verlies valt lager uit dan deze schatting.",
      },
    },
    accountantHeading: "Wanneer je een boekhouder moet spreken",
    accountantIntro:
      "Freelens is een hulpmiddel om mee te plannen, geen vervanging voor advies. Overleg met een boekhouder of de Belastingdienst als:",
    accountantList: [
      "je inkomen of gezinssituatie dit jaar sterk is veranderd;",
      "je substantiële inkomsten hebt naast je freelancewerk;",
      "je niet zeker weet of de KOR, de verleggingsregeling of een bijzondere regeling voor jou geldt;",
      "je een grote aankoop of investering van plan bent;",
      "het je eerste jaar is, of je nog nooit Nederlandse aangifte hebt gedaan.",
    ],
    sourceNotes: {
      "reserve-for-tax":
        "Inkomstenbelasting wordt jaarlijks vastgesteld over je totale belastbare winst, dus per betaling een deel opzij zetten is een planningsgewoonte. Ondernemers wordt aangeraden te reserveren voor inkomstenbelasting, premies volksverzekeringen en de Zvw-bijdrage.",
      "vat-rates":
        "Behandelt de tarieven van 21% en 9%, vrijstellingen, en hoe btw wordt berekend en aangegeven.",
      kor: "Deelnemers aan de KOR brengen geen btw in rekening, doen geen gewone btw-aangifte, en kunnen tijdens deelname geen voorbelasting aftrekken.",
      "input-vat":
        "De btw die je afdraagt is de btw die je in rekening bracht, min de aftrekbare voorbelasting op je bedrijfskosten. Het bedrag dat je moet betalen is dus meestal lager dan de geïnde btw. Staat op de officiële btw-pagina.",
      "reverse-charge":
        "Bij verlegde btw geeft je klant die aan, dus jij brengt geen btw in rekening en het is geen gewone af te dragen btw om opzij te zetten.",
      zvw: "De inkomensafhankelijke Zvw-bijdrage komt bovenop de inkomstenbelasting en de premies volksverzekeringen, tot een maximum bijdrage-inkomen.",
      zelfstandigenaftrek:
        "€1.200 voor 2026, voor ondernemers die aan het urencriterium voldoen en aan het begin van het jaar de AOW-leeftijd nog niet hadden bereikt. Wordt door de engine toegepast zodra je bevestigt dat je aan het urencriterium voldoet.",
      "mkb-exemption":
        "12,70% van de winst na de ondernemersaftrek voor 2026. Wordt bij elke schatting toegepast, ook in een verliesjaar, waar het het verlies kleiner maakt.",
      "invoice-system":
        "Bij het factuurstelsel wordt het btw-tijdvak in de regel bepaald door de factuurregels, niet door het moment waarop de klant betaalt.",
      "cash-system":
        "Sommige ondernemers gebruiken het kasstelsel, waarbij de btw de ontvangsten en betalingen volgt in plaats van de factuurdata.",
    },
    sourcesHeading: "Officiële bronnen",
    verifiedLink: "Gecontroleerde link",
    needsReview: "Moet gecontroleerd worden",
    openFreelens: "Freelens openen",
    categories: {
      vat: "Btw",
      incomeTax: "Inkomstenbelasting & Zvw",
      deductions: "Aftrekposten",
      invoicing: "Factureren",
    },
  },
  methodologyPage: {
    metaTitle: "Hoe we rekenen · Freelens",
    metaDescription:
      "De precieze volgorde waarin Freelens rekent, de schijven, aftrekposten en heffingskortingen die het toepast, een uitgewerkt voorbeeld, en waar elk cijfer vandaan komt.",
    eyebrow: "Hoe de schatting wordt berekend",
    heading: "Hoe de schatting wordt berekend",
    intro:
      "Freelens rekent geen vast percentage over wat je klanten betalen. Het berekent de inkomstenbelasting en de Zvw-bijdrage zoals de Belastingdienst dat doet, in deze volgorde.",
    taxYear: "Belastingjaar {year}, voor iemand die de AOW-leeftijd nog niet heeft bereikt.",
    orderHeading: "De volgorde waarin het rekent",
    steps: [
      "Begin bij de winst: omzet exclusief btw, min bedrijfskosten.",
      "Trek de zelfstandigenaftrek eraf en, als je er recht op hebt, de startersaftrek.",
      "Trek de MKB-winstvrijstelling af van wat er overblijft.",
      "Pas de schijven van de inkomstenbelasting toe op dat bedrag.",
      "Trek de algemene heffingskorting en de arbeidskorting eraf; die gaan van de verschuldigde belasting af, niet van je inkomen.",
      "Tel de Zvw-bijdrage erbij op, een aparte rekening met een eigen percentage en een eigen maximum.",
    ],
    bracketsHeading: "Schijven inkomstenbelasting",
    colTaxableIncome: "Belastbaar inkomen",
    colRate: "Tarief",
    bracketNote:
      "De eerste schijf bevat premies volksverzekeringen, die alleen worden geheven over inkomen tot dat maximum.",
    deductionsHeading: "Aftrekposten en heffingskortingen",
    zelfstandigen: "{amount}, als je minstens 1.225 uur per jaar aan de onderneming besteedt.",
    starters: "{amount}, daar bovenop, voor maximaal drie van je eerste vijf jaar.",
    mkb: "{pct}% van wat er na die aftrekposten overblijft.",
    exampleHeading: "Een uitgewerkt voorbeeld",
    exampleNote:
      "Dat is {effective}% van de winst in totaal, terwijl over de volgende verdiende euro {marginal}% wordt geheven. Een betaling die al in je verwachte winst zit, draagt haar aandeel in de rekening van het hele jaar, het eerste cijfer. Alleen inkomen boven die verwachting wordt tegen het tweede tarief gereserveerd, omdat het bovenop alles komt wat al is meegeteld.",
    assumesHeading: "Waar deze schatting van uitgaat",
    assumesIntro:
      "Er is hier niets verborgen om het bedrag mooier te laten lijken. Dit zijn de aannames die bij elk resultaat van de app horen.",
    sourcesHeading: "Waar elk cijfer vandaan komt",
    sourcesIntro:
      "Alleen belastingdienst.nl. Geen aggregators, geen vergelijkingssites, geen samenvattingen van accountantskantoren. Bij elke regel staat de datum waarop die is gecontroleerd.",
    derived: "Afgeleid",
    checked: "Gecontroleerd op {date}",
    footerPrefix:
      "Voor wat Freelens in bredere zin wel en niet berekent, en wanneer je een boekhouder moet spreken, zie",
    footerLink: "nauwkeurigheid en bronnen",
  },

  offertesPage: {
    eyebrow: "Je offertes",
    heading: "Elke prijs die je noemde.",
    lead:
      "Bewaarde offertes, met de cijfers bevroren op de dag dat je offreerde. Leg vast hoe elke offerte afliep en deze lijst wordt het enige dat geen boekhouding je laat zien: wat de markt van je prijzen vond.",
    onDevice: "Alleen op dit apparaat opgeslagen. Browserdata wissen wist ook deze lijst.",
    emptyTitle: "Nog geen offertes bewaard.",
    emptyBody:
      "Reken een klus door met de calculator en bewaar de offerte. Eén tik, en je hebt iets om naar terug te komen zodra de klant antwoordt.",
    emptyCta: "Reken een klus door",
    signals: {
      ariaLabel: "Wat aandacht vraagt",
      fallbackName: "Een bewaarde offerte",
      quoteWaiting: "{name} is al {days} dagen stil over een offerte van {amount}. Tijd om te vragen.",
      paymentWaiting: "{name}: {amount} gefactureerd, {days} dagen open. Een herinnering waard.",
      paymentOverdue: "{name}: {amount} is over de vervaldatum heen.",
      outstandingTotal: "{count} oudere facturen open, samen {amount}.",
      recentlyPaid: "{name} heeft {amount} betaald.",
    },
    status: {
      quoted: "Openstaand",
      accepted: "Gewonnen",
      invoiced: "Gefactureerd",
      paid: "Betaald",
      lost: "Verloren",
      archived: "Gearchiveerd",
    },
    daysOpen: "Staat {days} dagen open",
    savedOn: "Bewaard op {date}",
    fee: "{amount} geoffreerd, exclusief btw",
    takeHome: "{amount} van jou als het doorgaat zoals geoffreerd",
    rightsMissing: "Gebruiksrechten waren nog niet besproken toen je dit offreerde.",
    won: "Doorgegaan",
    lost: "Niet doorgegaan",
    finalFeeLabel: "Afgesproken prijs, exclusief btw",
    finalFeeHint: "Wat het uiteindelijk werd. Vooraf ingevuld met de offerte.",
    noteLabel: "Wat gaf de doorslag? (optioneel)",
    noteHint: "E\u00e9n regel, voor jezelf. \u201cBudget ging naar video\u201d zegt meer dan de status.",
    confirmWon: "Vastleggen als gewonnen",
    confirmLost: "Vastleggen als verloren",
    wonSummary: "Gewonnen voor {amount}",
    wonBelowQuote: ", {diff} onder de offerte",
    lostSummary: "Verloren",
    reopen: "Heropenen",
    outcomePrefix: "Je notitie: ",
  },


  rekentoolsPage: {
    eyebrow: "Gratis rekentools",
    heading: "Gratis rekentools voor freelancers.",
    lead: "Zonder account, niets wordt geüpload, gebouwd op de echte Nederlandse regels van 2026 en elk cijfer gecontroleerd bij belastingdienst.nl.",
    tarief: {
      title: "Wat moet je vragen?",
      body: "Je dagtarief of de prijs van één klus, teruggerekend vanaf wat je wilt overhouden.",
      cta: "Open de tariefcalculator",
    },
    tool: {
      title: "Er is een betaling binnen. Wat is van jou?",
      body: "Verdeel een betaling in btw, een belastingreservering, zakelijke kosten en wat je jezelf echt kunt uitbetalen.",
      cta: "Open de werkruimte",
    },
    accuracyTeaser: "De vaste 30%-regel zit er op echte cijfers tot €16.720 naast. Bekijk de gevallen, de bronnen en elk tarief dat we gebruiken.",
    accuracyCta: "Nauwkeurigheid en bronnen",
  },

  privacyPage: {
    eyebrow: "Privacy",
    heading: "Wat we weten, en wat we nooit zullen weten.",
    updated: "Versie van {date}.",
    calc: {
      title: "De rekentools",
      body: "Alles wat je in de rekentools invult blijft in je browser. Het wordt alleen op je apparaat bewaard als je zelf kiest voor opslaan, je kunt het altijd wissen, en het wordt nooit naar Freelens geüpload.",
    },
    analytics: {
      title: "Paginaweergaven",
      body: "Freelens telt anonieme paginaweergaven via Vercel Web Analytics: geen cookies, geen profiel, niets dat jou identificeert. Eigen events bevatten alleen een naam, nooit een bedrag, een klant of een e-mailadres.",
    },
    email: {
      title: "Je e-mailadres",
      body: "We bewaren een e-mailadres alleen als je het zelf achterlaat, op de wachtlijst of voor updates bij regelwijzigingen, en pas nadat je het vanuit je inbox bevestigt. Het wordt voor dat ene doel gebruikt, nooit gedeeld, en op verzoek verwijderd. Bij een wachtlijstaanmelding bewaren we ook het vak dat je kiest.",
    },
    app: {
      title: "De Rebooking-app (besloten b\u00e8ta)",
      body: "Gebruik je de app op /app: je account is een e-mailadres met een magic link, zonder wachtwoord. Klantrecords die je invoert (naam, klus, datum, bedrag, notities, nooit adressen, telefoonnummers of registratienummers) staan bij Supabase in de EU en zijn alleen door jou leesbaar. Conceptmails schrijft de Claude-API van Anthropic, ingesteld zonder training op jouw gegevens; het model ziet alleen het record dat jij invoerde. De wekelijkse mail loopt via Resend, alleen als er iets te melden is, met \u00e9\u00e9n klik om te stoppen. Alles exporteren of je account verwijderen, direct en definitief, kan in de app zelf.",
    },
    never: {
      title: "Wat we nooit verzamelen",
      body: "Geen bankkoppeling, geen adressen of telefoonnummers van klanten, geen KvK- of btw-nummers, geen geüploade documenten.",
    },
    rights: {
      title: "Je rechten",
      body: "Je kunt opvragen wat we van je hebben, het laten corrigeren of verwijderen, en klagen bij de Autoriteit Persoonsgegevens. Elke mail die we sturen heeft een afmeldlink die werkt.",
    },
    contactNote: "Vragen over deze pagina: gebruik de contactlink in de footer.",
  },


  agent: {
    title: "Rebooking",
    signOut: "Uitloggen",
    loading: "Momentje.",
    loadError: "Je gegevens laden lukte niet. De verbinding of je sessie haperde; er is niets verloren.",
    retry: "Probeer opnieuw",
    login: {
      intro: "Besloten b\u00e8ta. Log in met een magic link; er bestaat geen wachtwoord dat kan lekken.",
      emailLabel: "Je e-mailadres",
      cta: "Stuur me de link",
      sending: "Versturen",
      sent: "Link verstuurd. Open je inbox en je bent binnen.",
      error: "Dat lukte niet. Controleer het adres en probeer het opnieuw.",
    },
    onboarding: {
      progress: "Stap {n} van {total}: {name}",
      stepCraft: "je vak",
      stepVoice: "je toon",
      stepImport: "je klanten",
      stepConfirm: "rijen controleren",
      craftQuestion: "Wat maak je?",
      voiceQuestion: "Plak \u00e9\u00e9n of twee mails die je ooit aan een klant stuurde.",
      voiceHint: "Voor de toon: aanhef, afsluiting, je of u. Twee is genoeg.",
      voicePrivacy: "De geplakte tekst verlaat deze browser nooit. Alleen het afgeleide profiel (aanhef, afsluiting, je/u, stijl) wordt bewaard, en dat kun je volledig zien.",
      importQuestion: "Je oude klanten, \u00e9\u00e9n per regel.",
      importHint: "Naam, wat je deed, wanneer, ongeveer welk bedrag. Komma's ertussen. Tien is een goed begin.",
      importPlaceholder: "Rituals, campagneshoot, maart 2026, \u20ac2400",
      parse: "Lees de regels",
      confirmTitle: "Controleer elke rij voordat er iets wordt opgeslagen.",
      confirmHint: "Niets gaat de database in zonder bevestiging. Pas inline aan, verwijder wat niet klopt.",
      confirmEmpty: "Nog niets leesbaars. Ga terug en zet \u00e9\u00e9n regel per klant neer.",
      fields: { name: "Klant", email: "E-mail (optioneel)", project: "Laatste klus", date: "Wanneer (jjjj-mm-dd)" },
      freeLimitNote: "De b\u00e8ta volgt {limit} relaties. {dropped} van deze rijen worden NIET bewaard; verwijder rijen tot er {limit} overblijven om zelf te kiezen welke.",
      next: "Verder",
      back: "Terug",
      skip: "Sla over",
      finish: "Bewaren en starten",
      saving: "Bewaren",
      saveError: "Bewaren mislukte. Er is niets verloren; probeer het opnieuw.",
    },
    queue: {
      heading: "Deze week een berichtje waard",
      empty: "Deze week niets. Dat is de bedoeling: als er geen eerlijke reden is om iemand te schrijven, zegt deze pagina dat, in plaats van er een te verzinnen.",
      reasons: { anniversary: "Verjaardag van de klus", season: "Seizoen", gap: "Lange stilte", referral: "Aanbeveling", manual: "Jouw keuze" },
      writeDraft: "Schrijf de mail",
      drafting: "Aan het schrijven, in jouw toon",
      draftError: "Schrijven mislukte. Probeer het over een minuut opnieuw.",
      subjectLabel: "Onderwerp",
      bodyLabel: "Mail",
      placeholdersOpen: "Vul dit eerst in: {list}. De tekst verzint geen feiten, dus deze plekken zijn van jou.",
      copy: "Kopieer",
      openMail: "Open in je mail",
      markSent: "Ik heb hem verstuurd",
      sentNoted: "Genoteerd",
      snooze: "Snooze {months} mnd",
      snoozed: "{name} gesnoozed.",
      undo: "Ongedaan maken",
      tracking: "Je volgt {count} van {limit} relaties in de b\u00e8ta.",
    },
    outcomes: {
      heading: "Hoe zijn deze afgelopen?",
      intro: "Een tijdje terug verstuurd, nog geen uitkomst vastgelegd. Twee klikken, en de cijfers hieronder gaan iets betekenen.",
      results: { reply_positive: "Positief antwoord", reply_neutral: "Neutraal antwoord", reply_negative: "Negatief antwoord", booked: "Geboekt", no_reply: "Geen antwoord" },
      valueLabel: "Geboekt bedrag, exclusief btw (optioneel)",
      save: "Vastleggen",
      saved: "Vastgelegd",
    },
    numbers: {
      heading: "De cijfers",
      relationships: "Relaties gevolgd",
      sent: "Berichten verstuurd",
      replyRate: "Antwoordpercentage",
      booked: "Geboekt dit kwartaal",
      taxNote: "\u2248 {net} voor jou na btw en reservering, op je opgeslagen belastingprofiel.",
      noData: "-",
    },
    account: {
      heading: "Je gegevens",
      export: "Exporteer alles (JSON)",
      delete: "Verwijder mijn account",
      deleteWarning: "Direct en definitief. Alles verdwijnt, zonder herstelperiode.",
      deleteConfirm: "Verwijder alles",
    },
  },

  rate: {
      eyebrow: "Vóór de opdracht",
      heading: "Wat moet je vragen?",
      floor:
        "Dit is wat je moet vragen, niet wat je kunt vragen. Het is je ondergrens: daaronder verdient het werk zichzelf niet terug zodra belasting en kosten eraf zijn.",
      tabsLabel: "Waar bepaal je de prijs van?",
      tabs: {
        year: { label: "Mijn tarief voor het jaar", sub: "Bepaal een dagtarief" },
        job: { label: "Deze ene opdracht", sub: "Prijs een project" },
      },
      targetLabel: "Wat wil je overhouden, na belasting?",
      targetHint:
        "Wat je dit jaar netto overhoudt, nadat inkomstenbelasting en Zvw betaald zijn. Niet je omzet.",
      daysLabel: "Hoeveel dagen kun je realistisch factureren?",
      daysHint:
        "Geen 260. Haal vakantie, ziektedagen, administratie, acquisitie en de rustige weken eraf. De meeste freelancers factureren veel minder dagen dan ze inplannen, en het tarief moet dat gat betalen.",
      daysValue: "{days} dagen",
      optimism:
        "Stel je je tarief in op {optimistic} dagen en factureer je er {actual}, dan reken je {rate} per dag en eindig je het jaar op {earned} in plaats van {needed}. Dat is {short} te weinig, {pct}% van je jaar.",
      costsLabel: "Je jaarlijkse bedrijfskosten",
      costsHint:
        "Software, verzekeringen, apparatuur, werkplek, je boekhouder, beroepsverenigingen. Laat leeg als je er echt geen hebt.",
      costsPlaceholder: "bijv. 6000",
      dayRate: "Je dagtarief, exclusief btw",
      dayRateNote: "{days} factureerbare dagen tegen dit tarief is {revenue} omzet voor het jaar.",
      rateCaption: "Waar elke euro van je tarief heen gaat",
      effectiveRate:
        "Over het hele jaar komt dat neer op {pct}% aan inkomstenbelasting en Zvw. Geen vast percentage: dit is wat de echte schijven, aftrekposten en heffingskortingen bij deze winst bij elkaar opleveren.",
      keepLabel: "Wat wil je aan deze opdracht overhouden?",
      keepPlaceholder: "2000",
      jobCostsLabel: "Kosten alleen voor deze opdracht (optioneel)",
      jobCostsHint:
        "Reiskosten, een assistent, apparatuurhuur, licenties. Geld dat er direct weer uit gaat. Het wordt volledig bij de prijs opgeteld, omdat het aftrekbaar is.",
      jobCostsPlaceholder: "bijv. 500",
      projectedLabel: "Winst die je dit jaar al verwacht",
      projectedHint:
        "Alles behalve deze opdracht. Het bepaalt in welke schijf deze opdracht valt, en daarom is dezelfde opdracht in januari en november verschillend veel waard.",
      projectedPlaceholder: "bijv. 40000",
      vatLabel: "btw die je hierover rekent",
      vatGroupLabel: "btw-tarief",
      vatNote:
        "Btw komt er bovenop en gaat rechtstreeks door. Het verandert nooit wat jij overhoudt.",
      quote: "Vraag dit, exclusief btw",
      quoteInvoice: "{gross} op de factuur, inclusief {vat} btw.",
      quoteCaption: "Waar elke euro van deze prijs heen gaat",
      emptyTitle: "Vul in wat je wilt overhouden en welke winst je dit jaar al verwacht.",
      emptyBody:
        "Allebei zijn nodig. Zonder het winstcijfer is er geen manier om te weten in welke schijf deze opdracht valt, en een bedrag zonder dat gegeven is een gok met een komma erin.",
      crossing: {
        title: "Deze opdracht gaat over een schijfgrens",
        body:
          "Je komt hiermee boven €{threshold} belastbaar inkomen, dus ongeveer {amount} ervan wordt in de hogere schijf belast. Over de hele opdracht komt dat gemiddeld neer op {pct}%.",
        note:
          "Een vast percentage ziet dit niet, en daarom prijst het juist de opdrachten die ertoe doen te laag.",
      },
      whyThisNumber: "Waarom dit bedrag?",
      assumptionsToggle: "Waar dit van uitgaat ({count})",
      flatRuleHeading: "De meeste tariefcalculators zitten hier fout",
      flatRuleBody:
        "Een vast percentage zit tegelijk in twee richtingen fout. Bij {revenue} omzet met {costs} kosten zet de 30%-regel {oldReserve} opzij tegenover een echte aanslag van {realBill}. Bij {profit} winst laat diezelfde regel je {shortfall} tekortkomen. Freelens hanteerde die regel zelf. Dat we die vervangen hebben, is de reden dat deze pagina kan bestaan.",
      flatRuleLink: "Zie wat de vaste regel fout doet, geval voor geval",
      bothDirections:
        "Vóór de opdracht: wat moet ik vragen. Na de betaling: wat is er echt van mij. Dezelfde berekening, beide kanten op.",
      toToolCta: "Bekijk wat er echt van jou is",
      profileUsing: "Op basis van wat je Freelens al verteld hebt: {claimed}.",
      profileNone:
        "Je hebt Freelens nog niet verteld of je recht hebt op de zelfstandigenaftrek of op de extra aftrek voor je eerste jaren als ondernemer, dus dit bedrag laat allebei buiten beschouwing. Als je er wel recht op hebt, hoef je minder te vragen.",
      profileHours: "de 1.225 uur per jaar die recht geven op de zelfstandigenaftrek",
      profileStarter: "je eerste jaren als ondernemer",
      profileSalary: "loon daarnaast",
      changeDetails: "Je gegevens aanpassen",

      strip: {
        heading: "Maak dit nauwkeuriger",
        forThisCalc: "Geldt alleen voor deze berekening. Bewaar je antwoorden voor elke berekening bij de instellingen in de werkruimte.",
      },
      segments: {
        annualCosts: "Zakelijke kosten",
        jobCosts: "Kosten voor deze opdracht",
        tax: "Inkomstenbelasting en Zvw",
        yours: "Voor jou",
      },

      job: {
        progressLabel: "Waar je bent",
        stepOf: "Stap {n} van {total}",
        announce: "Stap {n} van {total}. {question}",
        back: "Terug",
        next: "Volgende",
        submit: "Laat zien wat ik overhoud",
        whyAsk: "Waarom vragen we dit?",
        optional: "Optioneel",

        fee: {
          question: "Wat wil je hiervoor vragen?",
          helper: "Je prijs voor de hele klus, exclusief btw.",
          fieldLabel: "Jouw prijs",
          placeholder: "1800",
          why: "Het bedrag dat je overweegt op de offerte te zetten. Freelens haalt het uit elkaar: wat de klus jou kost, hoeveel belasting erover gaat en wat er echt overblijft. Of het bedrag klopt voor het werk, daar zegt Freelens niets over.",
          vatLabel: "btw die je erbovenop zet",
          vatGroupLabel: "btw-tarief",
          vatNote: "Komt op de factuur en gaat er weer vanaf. Het verandert nooit wat jij overhoudt.",
          daysLabel: "Aantal werkdagen",
          daysHelper: "Optioneel. Laat zien wat de klus per dag oplevert.",
          daysPlaceholder: "2",
        },
        costs: {
          question: "Wat kost deze klus jou?",
          helper: "Reizen, een assistent, huur, licenties.",
          fieldLabel: "Kosten voor deze klus",
          placeholder: "bijv. 200",
          why: "Geld dat direct weer weggaat aan deze klus. Het verlaagt je belasting, maar het gaat nog steeds van je prijs af voordat er iets van jou is. Leeglaten kan prima: dan dekt je prijs alleen je eigen tijd.",
        },
        profit: {
          question: "Waar sta je dit jaar?",
          helper: "Winst die je dit jaar al verwacht, zonder deze klus.",
          fieldLabel: "Winst tot nu toe dit jaar",
          placeholder: "0",
          why: "De inkomstenbelasting wordt één keer per jaar berekend over oplopende schijven, dus dezelfde prijs is in januari meer waard dan in november. Dit bepaalt in welke schijf deze klus valt. Kent Freelens je cijfers al, dan staat het hier vast ingevuld.",
          fromProfile: "Overgenomen uit je opgeslagen gegevens. Je kunt het hier aanpassen, alleen voor deze berekening.",
        },

        year: {
          count: "Tel dit mee voor dit jaar",
          countHint: "Telt {amount} op bij je verwachte winst, zodat je volgende offerte in de juiste schijf valt.",
          counted: "Meegeteld. {total} tot nu toe dit jaar.",
          alreadyCounted: "Al meegeteld.",
          undo: "Ongedaan maken",
          undone: "Er weer afgehaald.",
          prefilled: "Uit wat je dit jaar hebt meegeteld. Je kunt het hier aanpassen, alleen voor deze berekening.",
          adjust: "Een ander bedrag gebruiken",
          reset: "Opnieuw beginnen dit jaar",
          resetHint: "Wist het lopende totaal op dit apparaat.",
          rolledOver:
            "Het is een nieuw belastingjaar, dus je lopende totaal begint weer bij nul. Het bedrag van vorig jaar zou het werk van dit jaar in de verkeerde schijf zetten.",
          rolledOverDismiss: "Duidelijk",
        },

        guardrail: {
          title: "Voordat dit de deur uitgaat",
          intro: "De vier voorwaarden die creatieve offertes het vaakst vergeten. Freelens heeft geen mening over de antwoorden, alleen dat de vragen er zijn voordat de klant ze voor jou beantwoordt.",
          rights: "Gebruik: wat mag de klant met het werk doen, waar, en hoe lang?",
          revisions: "Revisies: hoeveel rondes zitten er in dit tarief?",
          deposit: "Aanbetaling: welk deel wordt betaald voordat je begint?",
          killFee: "Annuleringsvergoeding: wat staat er tegenover late afzegging?",
        },

        save: {
          cta: "Bewaar deze offerte",
          why: "Bewaart deze offerte op dit apparaat, met de cijfers van vandaag bevroren, zodat je later kunt vastleggen of hij doorging.",
          clientLabel: "Klant of project",
          clientPlaceholder: "bijv. Studio Noord",
          clientHint: "Optioneel. Een naam is genoeg om twee offertes uit elkaar te houden.",
          rightsLabel: "Staat er in de offerte wat de klant met het werk mag doen?",
          rightsHint: "Gebruik: waar, hoe lang, exclusief of niet. De voorwaarde die creatieve offertes het vaakst overslaan.",
          rightsSpecified: "Ja, staat erin",
          rightsMissing: "Nog niet besproken",
          confirm: "Offerte bewaren",
          savedNote: "Bewaard op dit apparaat. Kom terug om vast te leggen hoe het afliep.",
          toList: "Bekijk je offertes",
        },

        result: {
          eyebrow: "Wat jij overhoudt",
          ofFee: "van je prijs van {fee}",
          summary: "Na {tax} aan inkomstenbelasting en Zvw{costsClause}.",
          costsClause: " en {costs} aan kosten voor de klus",
          invoice: "{gross} op de factuur, inclusief {vat} btw.",
          perDay: "{rate} per dag over {days} dagen.",
          keptShare: "Je houdt {pct}% over van wat je vraagt.",
          firstJobWarning:
            "Dit gaat ervan uit dat dit je eerste werk van het jaar is. Heb je dit jaar al verdiend, dan valt deze klus hoger belast uit en houd je minder over.",
          fixFirstJob: "Vul in wat ik al verdiend heb",
          notAdvice:
            "Wat een prijs jou oplevert, geen oordeel of die prijs klopt. Freelens heeft geen mening over wat jouw markt betaalt.",
          adjust: "Mijn antwoorden aanpassen",
          breakdown: "Hoe dit is berekend",
          toTool: "Kijken wat er echt van jou is",
          toTarief: "Liever een dagtarief voor het jaar berekenen",
        },
      },

      estimateResult: {
        perDay: "per declarabele dag",
        eyebrow: "Je basistarief \u00b7 schatting",
        summary: "Bij {days} declarabele dagen per jaar moet het werk {revenue} aan omzet opleveren om {take} voor jou over te houden, met jouw schatting van {pct}% belasting.",
        taxRateLabel: "Effectief belastingpercentage op winst",
        taxRateHint: "Jouw schatting van inkomstenbelasting plus premies waar jij werkt. Pas het aan en het tarief beweegt mee.",
        provenance: "Het belastingdeel hier is jouw schatting, geen geverifieerde regels: alleen voor Nederland claimen we geverifieerde cijfers. De rest op deze pagina is puur rekenwerk met wat je invulde.",
        switchNl: "Werk je in Nederland? Gebruik de geverifieerde berekening",
        lines: {
          revenue: "Omzet die het jaar nodig heeft",
          costs: "Zakelijke kosten",
          tax: "Belasting, volgens jouw schatting",
          takeHome: "Voor jou om van te leven",
        },
      },
      guided: {
        progressLabel: "Waar je bent",
        stepOf: "Stap {n} van {total}",
        announce: "Stap {n} van {total}. {question}",
        back: "Terug",
        next: "Volgende",
        submit: "Laat mijn tarief zien",
        whyAsk: "Waarom vragen we dit?",
        optional: "Optioneel",

        market: {
          question: "Waar werk je?",
          helper: "Belastingregels zijn nationaal. We tonen alleen geverifieerde cijfers waar we ze echt hebben.",
          nl: "Nederland",
          nlNote: "Geverifieerde regels, gecontroleerd bij belastingdienst.nl",
          other: "Ergens anders",
          otherNote: "Schattingsmodus: jij bepaalt het belastingpercentage, wij doen het rekenwerk",
          currencyLabel: "Jouw valuta",
          why: "De Nederlandse berekening draait op regels die we regel voor regel bij de bron hebben gecontroleerd. Dat werk hebben we voor andere landen nog niet gedaan, en we doen niet alsof. Buiten Nederland is het belastingdeel een schatting die jij instelt, de rest is rekenwerk dat overal klopt.",
        },

        target: {
          question: "Wat wil je overhouden?",
          helper: "Netto voor het hele jaar, na belasting.",
          why: "Dit is het bedrag waar je echt van leeft, niet wat je factureert. Freelens begint hier en rekent terug via de echte schijven, aftrekposten en heffingskortingen naar de omzet die hier onder de streep overblijft.",
        },
        days: {
          question: "Hoeveel dagen ga je factureren?",
          helper: "Factureerbare dagen, geen werkdagen.",
          why: "Een jaar heeft ongeveer 260 werkdagen. Bijna niemand factureert die allemaal. Vakantie, ziekte, administratie, achter opdrachten aan en de stille weken gaan er eerst vanaf. Dit is het getal waar de meeste tarieven op misgaan, en het is de reden dat hetzelfde streefinkomen een heel ander dagtarief nodig heeft.",
        },
        costs: {
          question: "Wat kost je onderneming je?",
          helper: "Software, verzekeringen, spullen, werkplek, je boekhouder.",
          fieldLabel: "Per jaar",
          placeholder: "bijv. 6000",
          why: "Kosten verlagen je belasting, maar je moet ze nog steeds eerst verdienen voordat er iets van jou is. Leeglaten kan prima: dan dekt het tarief alleen je eigen tijd.",
        },

        result: {
          eyebrow: "Je ondergrens",
          perDay: "per dag, exclusief btw",
          summary:
            "{days} factureerbare dagen tegen dit tarief is {revenue} omzet over het jaar, waarvan {take} van jou is.",
          notMarket:
            "Dit is wat het werk moet opbrengen om zichzelf te betalen. Wat jouw markt betaalt is een andere vraag, en daar heeft Freelens geen mening over.",
          estimate:
            "Een schatting om mee te plannen, op basis van wat je hebt ingevuld. Geen vaste regel.",
          adjust: "Mijn antwoorden aanpassen",
          breakdown: "Hoe dit is berekend",
          toTool: "Kijken wat er echt van jou is",
          toTarief: "Liever één project doorrekenen",
        },
      },
    },
  app: {
    overview: {
      emptyIntro:
        "Freelens helpt je de btw apart te zetten, een belastingreservering te beschermen, bedrijfskosten te dekken en te zien wat er overblijft om jezelf uit te betalen.",
      emptyPrompt:
        "Zie waarin één betaling uiteenvalt. Het kost ongeveer 30 seconden en je hoeft niets in te stellen.",
      tryPayment: "Probeer één betaling (30 seconden)",
      setUpDetails: "Mijn gegevens instellen (1 minuut)",
      available: "Mogelijk beschikbaar om jezelf uit te betalen",
      protected: "Beschermd",
      vat: "Btw",
      reserve: "Reservering inkomstenbelasting en Zvw",
      runway: "Hoelang je vooruit kunt",
      runwayUnknown: "Vul je maandlasten in voor een schatting",
      runwayMonths: "{months} maanden",
      recently: "onlangs",
      lastUpdated: "Laatst bijgewerkt {date}",
      worthRefreshing: ". Tijd om bij te werken.",
      direction: {
        onTrack: "Op koers",
        gettingTight: "Wordt krap",
        belowTarget: "Onder de streep",
      },
      nextAction: "Beste volgende stap",
      latestAllocation: "Laatste verdeling",
      payment: "Betaling",
      availableForPayout: "Beschikbaar voor eigen uitbetaling",
      recordedOn: "{date} · vastgelegd op dit apparaat.",
      exampleIntro: "Eén betaling, met een bestemming per euro. Dezelfde die de homepage doorrekent.",
      exampleVat: "Beschermde btw",
      exampleReserve: "Beschermde reservering",
      exampleBusiness: "Zakelijke kosten gedekt",
      actions: {
        finishSetup: {
          title: "Maak je instellingen af, dan krijgen je cijfers verstandige standaardwaarden.",
          cta: "Freelens instellen",
        },
        reserveGap: {
          title: "Je saldo dekt nog niet al je gekozen reserveringen.",
          cta: "Bekijk je check-in",
        },
        firstCheckin: {
          title: "Doe de check-in van deze week om te zien hoe je ervoor staat.",
          cta: "Wekelijkse check-in",
        },
        stale: {
          title: "Je laatste check-in is alweer even geleden. Werk hem bij.",
          cta: "Check-in bijwerken",
        },
        payment: {
          title: "Er is een betaling binnen? Geef elke euro een taak.",
          cta: "Geld binnen",
        },
      },
    },
    settings: {
      intro:
        "Niets hiervan is verplicht. De rekenhulp werkt ook zonder, en vermeldt bij elk resultaat welke standaardwaarden zijn gebruikt. Dit invullen maakt het bedrag van jou in plaats van gemiddeld.",
      sections: {
        year: "Jouw jaar",
        deductions: "Aftrekposten waar je recht op hebt",
        otherIncome: "Andere inkomsten",
        paymentDefaults: "Standaardwaarden voor nieuwe betalingen",
        weekly: "Voor de wekelijkse check-in",
      },
      revenueLabel: "Verwachte omzet dit jaar (excl. btw)",
      revenuePlaceholder: "bijv. 55000",
      costsLabel: "Verwachte bedrijfskosten dit jaar (excl. btw)",
      costsPlaceholder: "bijv. 15000",
      profitLabel: "Verwachte winst dit jaar",
      profitHint:
        "Omzet exclusief btw, min je bedrijfskosten. Een ruwe schatting is prima; je kunt het aanpassen zodra het jaar verandert.",
      profitPlaceholder: "bijv. 40000",
      splitOn: "Vul in plaats daarvan één winstbedrag in",
      splitOff: "Omzet en kosten apart invullen",
      hoursLabel: "Besteed je minstens 1.225 uur per jaar aan je onderneming?",
      hoursHint:
        "Het urencriterium. Als je eraan voldoet, krijg je recht op de zelfstandigenaftrek, die je aanslag verlaagt. Ongeveer 24 uur per week, een heel jaar lang.",
      starterLabel: "Was je in één of meer van de afgelopen vijf jaar géén ondernemer?",
      starterHint:
        "Zo ja, dan heb je mogelijk recht op de startersaftrek, een extra aftrek voor maximaal drie van je eerste vijf jaar.",
      otherIncomeLabel: "Loon of uitkering dit jaar, vóór belasting",
      otherIncomeHint:
        "Laat leeg als de onderneming je enige inkomen is. Andere inkomsten verhogen de schijf waarin je winst valt.",
      otherIncomePlaceholder: "bijv. 30000",
      withheldLabel: "Belasting die je werkgever dit jaar al heeft ingehouden",
      withheldHint:
        "De loonheffing op je loonstrook of jaaropgaaf. Die heb je al betaald, dus Freelens vraagt je niet die nog een keer opzij te zetten. Laat leeg als je het niet zeker weet, dan blijft de schatting aan de voorzichtige kant.",
      withheldPlaceholder: "bijv. 2250",
      vatLabel: "btw die je meestal rekent",
      vatGroupLabel: "Gebruikelijke btw-behandelingen",
      vatHint:
        "De eerste die je kiest wordt vooringevuld in de rekenhulp. Je kunt het bij elke afzonderlijke betaling aanpassen.",
      inclusiveLabel: "Zijn de bedragen die je invult meestal inclusief btw?",
      inclusiveHint:
        "Geld dat op je rekening binnenkomt is normaal gesproken inclusief btw, dus meestal is dit ja.",
      monthlyCostsLabel: "Vaste maandelijkse bedrijfskosten",
      monthlyCostsHint: "Huur, verzekeringen, energie, belangrijke abonnementen.",
      monthlyCostsPlaceholder: "bijv. 1200",
      bufferLabel: "Buffer voor de zaak, in maanden",
      bufferGroupLabel: "Buffermaanden",
      backWithoutSaving: "Terug zonder opslaan",
      saveSettings: "Instellingen opslaan",
      yes: "Ja",
      no: "Nee",
      treatments: {
        "21": "21%",
        "9": "9%",
        "0": "0%",
        exempt: "Vrijgesteld",
        reverseCharged: "Verlegd",
        kor: "KOR",
        mixedUnsure: "Gemengd / niet zeker",
      },
    },
    shell: {
      eyebrow: "Freelens",
      loading: "Je opgeslagen cijfers worden geladen…",
      views: {
        overview: {
          title: "Na betaling",
          subtitle: "Een rustig beeld van wat beschermd is en wat vrij is.",
        },
        setup: {
          title: "Je instellingen",
          subtitle:
            "Alles wat Freelens over je onthoudt. Allemaal optioneel, allemaal aan te passen.",
        },
        moneyArrived: {
          title: "Geld binnen",
          subtitle: "Geef elke euro een taak voordat die beschikbaar voelt.",
        },
        weeklyCheckin: {
          title: "Wekelijkse check-in",
          subtitle: "In een minuut zie je hoe je ervoor staat.",
        },
        decision: {
          title: "Beslissing checken",
          subtitle: "Kijk of een aankoop binnen je bestedingsruimte past.",
        },
      },
      migrationNotice:
        "We hebben aangepast hoe Freelens reserveringen omschrijft. Je opgeslagen percentage{pct} is er nog steeds, maar heet nu terecht een planningsregel in plaats van definitieve belasting.",
      dismiss: "Sluiten",
      discardedOne: "Eén opgeslagen betaling kon niet gelezen worden en is weggelaten.",
      discardedMany:
        "{count} opgeslagen betalingen konden niet gelezen worden en zijn weggelaten.",
      discardedTail:
        "De rest van je historie is intact. Je totalen voor {year} hieronder zijn lager dan ze horen te zijn totdat je ze opnieuw toevoegt.",
      discardedCheckin:
        "Je laatste wekelijkse check-in kon niet gelezen worden en is weggelaten. Verder is er niets aangetast. Doe gerust een nieuwe check-in.",
      storageUnavailable:
        "Opslag is niet beschikbaar in deze browser, dus je cijfers worden tussen bezoeken niet bewaard op dit apparaat. Ze worden hoe dan ook niet geüpload.",
      privacyToggle: "Privacy en gegevens",
      privacySentence: "Alleen opgeslagen op dit apparaat. Je bedragen worden nooit geüpload.",
      privacyDetail:
        "Freelens bewaart je cijfers, inclusief elke betaling die je opslaat, in de lokale opslag van deze browser zodat ze er de volgende keer weer zijn. Hieronder wissen verwijdert alles definitief en direct van dit apparaat. Er is geen account en geen kopie op een server, dus er valt verder niets te verwijderen en niets bij ons op te vragen.",
      clearConfirm:
        "Je instellingen, je opgeslagen betalingen en je check-ins van dit apparaat wissen? Dit kan niet ongedaan gemaakt worden.",
      clearYes: "Ja, wis alles",
      clearData: "Opgeslagen gegevens wissen",
    },
    moneyArrived: {
      amountLabel: "Hoeveel heb je ontvangen?",
      amountPlaceholder: "1500",
      vatSummary: { includes: "Inclusief", excludes: "Exclusief", none: "Geen" },
      vatTreatmentLabel: "btw-behandeling",
      vatOther: "Anders",
      whichTreatment: "Welke behandeling?",
      includesQuestion: "Is dit bedrag inclusief btw?",
      includesVat: "Inclusief btw",
      excludesVat: "Exclusief btw",
      vatExplainer:
        "De meeste Nederlandse diensten vallen onder 21%; sommige (eten, cultuur, perswerk) onder 9%. Kies Anders voor KOR, verlegde of vrijgestelde opdrachten, of als je het echt niet zeker weet. Freelens zet dan geen btw apart en legt uit waarom.",
      treatments: {
        "21": "21% btw",
        "9": "9% btw",
        "0": "0% (export / binnen de EU)",
        exempt: "Vrijgesteld",
        reverseCharged: "Verlegd",
        kor: "KOR (kleineondernemersregeling)",
        mixedUnsure: "Gemengd / niet zeker",
      },
      profitLabel: "Verwachte winst dit jaar",
      profitHint:
        "Omzet exclusief btw, min je bedrijfskosten. Inkomstenbelasting wordt berekend over de winst van het hele jaar, dus dit bepaalt je echte tarief. Een ruwe schatting is prima.",
      profitPlaceholder: "bijv. 40000",
      extrasToggle: "Kosten en een label toevoegen (optioneel)",
      businessReserveLabel: "Opzij zetten voor bedrijfskosten",
      businessReservePlaceholder: "bijv. 500",
      deductibleLabel: "Aftrekbare kosten bij deze betaling",
      deductibleHint:
        "Verlaagt het bedrag waarover deze betaling belast wordt. Het verandert de btw niet, dus je btw-aangifte kan afwijken na voorbelasting.",
      deductiblePlaceholder: "bijv. 200",
      labelLabel: "Label",
      labelPlaceholder: "bijv. Redactionele shoot, dj-set vrijdag",
      saveHeading: "Deze betaling opslaan bij {year}",
      saveBody:
        "Er wordt niets opgeslagen tenzij je daarvoor kiest. Zodra dat gebeurt, telt Freelens het mee voor het jaar en vraagt het minder van je latere betalingen.",
      dateLabel: "Datum",
      noteLabel: "Notitie (optioneel)",
      notePlaceholder: "bijv. Redactionele shoot",
      saveButton: "Opslaan bij {year}",
      savedConfirm:
        "Opgeslagen op dit apparaat. Je totalen voor {year} hieronder zijn omhooggegaan en je volgende betaling vraagt om minder.",
      rememberNothing:
        "Freelens onthoudt nog niets. Je antwoorden hierboven gelden alleen voor deze betaling.",
      saveMyDetails: "Mijn gegevens opslaan",
      driftPrompt:
        "Je hebt dit jaar al {earned} aan winst opgeslagen, tegenover een verwachting van {projected}. Zolang je die verwachting niet verhoogt, reserveert Freelens de rest van je betalingen tegen het tarief over je volgende euro, en dat is hoger dan je waarschijnlijk nodig hebt.",
      driftCta: "Mijn verwachting bijwerken",
      midYearPrompt:
        "Ben je dit jaar al betaald? Freelens heeft nog niets opgeslagen voor {year}, dus het behandelt dit als je eerste betaling en vraagt meer dan nodig. Als je toevoegt wat je al verdiend hebt, klopt elk bedrag hieronder.",
      crossLink: "Bezig met de prijs van de volgende? Dezelfde berekening, andersom:",
      crossLinkCta: "Bereken wat je moet vragen",
      strip: {
        heading: "Maak dit nauwkeuriger",
        hours: "Ik werk 1.225 uur of meer per jaar aan mijn onderneming",
        starter: "Ik zit in mijn eerste vijf jaar als ondernemer",
        salaryNew: "Ik heb daarnaast loon",
        salaryHas: "Ik heb hiernaast loon",
        lowers: "verlaagt het",
        raises: "verhoogt het",
        counted: "meegeteld",
        applied: "toegepast",
        askedOnce: "Elk antwoord wordt onthouden, dus we vragen het maar één keer.",
      },
      result: {
        received: "Ontvangen betaling",
        vatIncluded: "Btw in deze betaling",
        reserve: "Reservering inkomstenbelasting en Zvw",
        businessSetAside: "Opzij gezet voor bedrijfskosten",
        short: "Deze betaling dekt je reserveringen niet",
        available: "Geschat bedrag om jezelf uit te betalen",
        reserveSourceNotes: {
          "guided-estimate":
            "Reservering uit de begeleide schatting: het aandeel van deze betaling in wat je dit jaar naar verwachting verschuldigd bent, over de echte schijven.",
          "own-rule":
            "Reservering op basis van het percentage dat jij hebt ingesteld (een planningsregel, geen aanslag).",
          "provisional-assessment":
            "Reservering op basis van je voorlopige aanslag.",
          manual: "Reservering handmatig ingevoerd voor deze betaling.",
        },
        markHandled: "Verdeling afgehandeld",
        savedOnDevice: "Opgeslagen op dit apparaat.",
        movesMoneyNote:
          "Freelens legt het plan vast op dit apparaat. Het geld moet je zelf nog overmaken bij je bank.",
      },
      sample: {
        intro:
          "Zo valt een betaling van {amount} met 21% btw uiteen, voor iemand die dit jaar {profit} winst verwacht{rate}.",
        rateNote: " (dus {pct}% van deze betaling opzij)",
      },
      assumptions: {
        deductible: "Reservering toegepast op {base} na {costs} aftrekbare kosten.",
        share:
          "Het aandeel van deze betaling in de {annual} die je dit jaar naar verwachting moet betalen, wat neerkomt op {pct}% van deze betaling.",
      },
    },
    paymentHistory: {
      sectionLabel: "Opgeslagen betalingen voor {year}",
      soFar: "{year} tot nu toe",
      earned: "Verdiend (excl. btw)",
      setAside: "Opzij gezet voor belasting",
      vatCollected: "btw geïnd",
      payments: "Betalingen",
      totalsNote:
        "Freelens gebruikt deze totalen om te bepalen welk deel van de resterende rekening bij deze betaling hoort. Zet je vroeg te veel opzij, dan vragen latere betalingen om minder.",
      empty:
        "Nog geen betalingen opgeslagen voor {year}. Reken hierboven een betaling uit en kies Opslaan bij {year} om het lopende totaal te starten. Tot die tijd behandelt Freelens elke betaling als je eerste van het jaar.",
      vatPrefix: "btw",
      reservedPrefix: "gereserveerd",
      editAria: "Betaling van {amount} op {date} wijzigen",
      deleteAria: "Betaling van {amount} op {date} verwijderen",
      confirmDelete: "Ja, verwijderen",
      earlierYears: "Eerdere jaren ({years})",
      dateLabel: "Datum",
      invalidDate: "Vul een geldige datum in.",
      movingYearNote:
        "Als je dit naar een ander jaar verplaatst, telt het niet meer mee in de totalen van dit jaar. Het blijft bewaard, het wordt niet verwijderd.",
      noteLabel: "Notitie (optioneel)",
      notePlaceholder: "bijv. Redactionele shoot",
      amountLabel: "Bedrag exclusief btw",
      vatLabel: "btw",
      reserveLabel: "Opzij gezet voor belasting",
      earlierYearsNote:
        "Bewaard, maar niet meegeteld in de totalen van {year}. Inkomstenbelasting wordt per jaar afgerekend, dus een eerder jaar kan niets veranderen aan wat je voor dit jaar moet betalen.",
      earnedSuffix: "verdiend",
      setAsideSuffix: "opzij gezet",
      paymentCountOne: "{count} betaling",
      paymentCountMany: "{count} betalingen",
      saveChanges: "Wijzigingen opslaan",
    },
    breakdown: {
      "Payment received": "Ontvangen betaling",
      "VAT included in this payment": "Btw in deze betaling",
      "Income tax and Zvw reserve": "Reservering inkomstenbelasting en Zvw",
      "Business obligations": "Verplichtingen van de zaak",
      "Business buffer": "Buffer voor de zaak",
      "Current business cash": "Huidig saldo van de zaak",
      "VAT set aside": "Btw opzij gezet",
      "Upcoming obligations": "Aankomende verplichtingen",
    },
    weekly: {
      balanceLabel: "Hoeveel staat er op je zakelijke rekening?",
      balancePlaceholder: "7000",
      balanceHint: "Gebruik het saldo uit je bankapp; een goede schatting is genoeg.",
      reserveLabel: "Hoeveel heb je gereserveerd voor inkomstenbelasting en Zvw?",
      reservePlaceholder: "1500",
      reserveHint:
        "Het bedrag dat je opzij houdt voor de belasting. Een planningsbedrag, geen definitieve aanslag.",
      monthlyCostsLabel: "Vaste maandelijkse bedrijfskosten",
      monthlyCostsPlaceholder: "1200",
      obligationsLabel: "Bekende aankomende verplichtingen (optioneel)",
      obligationsPlaceholder: "500",
      bufferLabel: "Buffer die je aanhoudt, in maanden",
      bufferGroupLabel: "Buffermaanden",
      improveAccuracy: "Nauwkeuriger maken",
      actualVatLabel: "Werkelijk gereserveerde btw (optioneel)",
      actualVatPlaceholder: "600",
      actualVatHint:
        "Uit je boekhouding of je laatste btw-overzicht. Vaak nauwkeuriger dan één betaling.",
      plannedPayoutLabel: "Eigen uitbetaling die je wilt doen (optioneel)",
      plannedPayoutPlaceholder: "2000",
      plannedPayoutHint:
        "Vul dit in om te zien hoeveel ruimte er overblijft naast je geplande salaris.",
      short: "Je komt tekort voor je gekozen reserveringen met",
      available: "Mogelijk beschikbaar voor eigen uitbetaling",
      vatProtected: "Btw beschermd",
      reserveProtected: "Reservering inkomstenbelasting en Zvw beschermd",
      obligations: "Aankomende verplichtingen",
      buffer: "Buffer voor de zaak",
      spendingRoom: "Vrije bestedingsruimte",
      progressLabel: "Voortgang check-in",
      steps: {
        balance: "Saldo",
        protected: "Beschermd",
        costs: "Kosten",
        buffer: "Buffer",
      },
      confidence: {
        quick: "Op basis van beperkte gegevens en de reserveringsregels die jij hebt gekozen.",
        improved: "Inclusief je werkelijke reserveringen en aankomende verplichtingen.",
        bookkeeping: "Gebruikt bedragen die je uit je boekhouding hebt ingevuld.",
      },
      emptyPrompt: "Vul je zakelijke saldo in om te zien hoe je ervoor staat.",
      save: "Deze check-in opslaan",
      saved: "Opgeslagen op dit apparaat.",
      bufferTarget: "Bufferdoel: {amount} ({months} × je maandlasten).",
      runwayUnknown: "Vul je maandlasten in om je financiële adem te schatten.",
      runwaySentence: "Je hebt {months} maanden financiële adem.",
      runwayMeter: "{months} maanden financiële adem · buffer van {buffer} maanden.",
      shortfallDetail:
        "Houd de volgende {amount} aan binnenkomend geld in de zaak om je gekozen reserveringen weer op peil te brengen.",
      statusTail: {
        covered: " Je gekozen reserveringen en buffer zijn gedekt.",
        limited: " Je reserveringen zijn gedekt, maar er is weinig ruimte over.",
        gap: " Je saldo dekt nog niet al je gekozen reserveringen.",
      },
      reserveSource: {
        ownRule:
          "De reservering komt uit je eigen percentageregel: een planningsregel, geen aanslag.",
        provisionalAssessment:
          "De reservering komt uit het bedrag van je voorlopige aanslag.",
        guidedEstimate:
          "De reservering komt uit de begeleide schatting: een planningsschatting, geen definitieve aanslag.",
        manual: "De reservering is het bedrag dat je zelf hebt ingevuld.",
        notTracked: "Er wordt nog geen reservering bijgehouden.",
      },
    },
    decision: {
      costLabel: "Wat kost het?",
      costPlaceholder: "300",
      descriptionLabel: "Wat is het? (optioneel)",
      descriptionPlaceholder: "bijv. Nieuwe laptop, studiohuur",
      kindQuestion: "Is dit een zakelijke of privé-uitgave?",
      kindGroupLabel: "Soort uitgave",
      business: "Zakelijk",
      personal: "Privé",
      businessCost: "Zakelijke uitgave",
      personalCost: "Privé-uitgave",
      timingQuestion: "Wanneer?",
      timingGroupLabel: "Moment",
      now: "Nu",
      later: "Later",
      needsCheckin: "Doe een wekelijkse check-in voor een uitkomst op basis van je eigen cijfers.",
      goToCheckin: "Wekelijkse check-in doen",
      tryExample: "Probeer het met voorbeeldcijfers",
      exampleDescription: "Nieuwe lens",
      noPersonalResult: "Doe een wekelijkse check-in voor een uitkomst op maat.",
      notApplicable: "n.v.t.",
      months: "{n} mnd",
      after: "Daarna",
      sampleNote: "Met voorbeeldcijfers ({room} bestedingsruimte).",
      runwayNow: "Nu vooruit",
      runwayAfter: "Daarna",
      chainLabel: "Hoe een beslissing wordt getoetst",
      chain: {
        position: "Wekelijkse positie",
        room: "Bestedingsruimte",
        decision: "Deze beslissing",
      },
      headlines: {
        fits: "Dit past binnen je huidige vrije bestedingsruimte.",
        tight: "Dit past, maar het gebruikt wel het grootste deel van je ruimte.",
        wait: "Dit past niet binnen de reserveringen die je hebt gekozen.",
      },
      verdicts: {
        fits: "Past",
        tight: "Krap",
        wait: "Wacht",
        noData: "Geen gegevens",
      },
    },
    navTabs: {
      ariaLabel: "Freelens-modi",
      overview: { title: "Overzicht", description: "Hoe je ervoor staat en wat je nu doet." },
      moneyArrived: { title: "Geld binnen", description: "Geef een betaling een taak, na btw." },
      weeklyCheckin: { title: "Wekelijkse check-in", description: "Een rustig beeld van je positie." },
      decision: { title: "Beslissing checken", description: "Kijk of een aankoop past." },
    },
    status: {
      reservesCovered: "Je gekozen reserveringen en buffer zijn gedekt.",
      limitedRoom: "Je reserveringen zijn gedekt, maar er blijft weinig over om extra uit te geven.",
      reserveGap: "Je huidige saldo dekt nog niet al je gekozen reserveringen.",
    },
    whyThisNumber: {
      toggle: "Waarom dit bedrag?",
    },
    allocation: {
      caption: "Elke euro heeft een taak",
      vat: "Btw",
      reserve: "Reservering",
      business: "Zaak",
      yours: "Voor jou",
      personalPayout: "Eigen uitbetaling",
    },
  },
};
