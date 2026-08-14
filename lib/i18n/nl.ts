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
      about: "Over ons",
      howItWorks: "Hoe het werkt",
      rebooking: "Rebooking",
      menuLabel: "Menu openen",
      privacy: "Privacy",
      contact: "Contact",
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
      "Vul drie oude klanten in. Freelens rangschikt wie nu een bericht waard is, zegt waarom, en schrijft \u00e9\u00e9n concept in jouw toon. Wat je invult blijft in je browser.",
    clients: {
      heading: "Stap 1 \u2014 drie oude klanten",
      hint: "Echte klanten werken het best. Een voornaam maakt de aanhef persoonlijk; een e-mailadres maakt de verzendknop mogelijk. Allebei optioneel.",
      nameLabel: "Naam klant",
      projectLabel: "Laatste klus",
      monthLabel: "Wanneer was dat?",
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
      heading: "Stap 2 \u2014 hoe jij schrijft",
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
      hint: "Gerangschikt volgens dezelfde regels als het echte product: eerst verjaardagen, dan seizoen, dan stilte. Geen AI in de rangschikking \u2014 elke reden is controleerbaar.",
      empty: {
        title: "Eerlijk antwoord: niemand, deze week.",
        body: "Geen van deze drie zit op een verjaardag, een seizoensvenster of een half jaar stilte. Zo hoort het te werken \u2014 rustige weken blijven rustig. Probeer een klant van vorig jaar, of laad de voorbeelddata.",
        edit: "Klanten aanpassen",
      },
      draftCta: "Schrijf het concept",
      notThisWeek: "Geen reden deze week:",
      fresh: {
        heading: "Nog te vers voor een berichtje",
        body: "{project} was in {month} \u2014 dat is {n} maanden geleden. Eerstvolgend logisch moment: {next}, een jaar na de klus.",
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
      loopTeaser: "In het echte Freelens onthoudt de agent dat je dit verstuurde \u2014 en ziet je maandagmail wie nog niet antwoordde.",
      locked: "Vul eerst de [vul in:]-delen in \u2014 Freelens verzint geen feiten.",
      error: "Het concept kwam niet door onze controles. Probeer het nog een keer.",
      limit: "Dat was het gratis concept voor vandaag. De lijst en de redenen blijven open \u2014 voor meer concepten: zet je op de lijst hieronder.",
    },
    gate: {
      heading: "Er is niets opgeslagen. Dat is het idee \u2014 en de grens.",
      body: "Deze proef draaide in je browser. Het echte Freelens bewaart je klantenlijst, doet dit elke maandag opnieuw en mailt je de lijst. Het zit in besloten b\u00e8ta: {spots} founding-plekken, {founding} voor het eerste jaar. Daarna is de standaardprijs {yearly} per jaar of {monthly} per maand.",
      cta: "Zet me op de lijst",
      again: "Nog een keer met andere klanten",
    },
    privacyNote:
      "Wat je invult verlaat je browser niet, behalve de ene klant voor wie je een concept maakt: naam, contactpersoon, klus en datum gaan \u00e9\u00e9n keer mee om de e-mail te schrijven en worden niet opgeslagen. E-mailadressen gaan nooit mee.",
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
    privacy: {
      title: "Privacy · Freelens",
      description:
        "Wat Freelens verzamelt, wat het nooit verzamelt, en hoe je je gegevens meeneemt of laat verdwijnen.",
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
      example: {
        label: "Zo ziet één aanvraag eruit.",
        inquiryLabel: "Aanvraag",
        clientName: "Lisa",
        eventType: "Bruiloft",
        eventDate: "14 juni 2026",
        budget: "€1.000–2.500",
        draftLabel: "Het antwoord",
        draft:
          "Hoi Lisa! Wat leuk dat je aan me denkt voor 14 juni. Bruiloften vastleggen is echt mijn ding. Voor een hele trouwdag werk ik met pakketten vanaf €1.950, inclusief tweede fotograaf. Ik check de datum graag even en hoor graag jullie plannen. Zullen we deze week kort bellen? — Emma",
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
              "Hoi Lisa! Wat leuk dat je aan me denkt voor 14 juni. Bruiloften vastleggen is echt mijn ding. Voor een hele trouwdag werk ik met pakketten vanaf €1.950, inclusief tweede fotograaf. Ik check de datum graag even en hoor graag jullie plannen. Zullen we deze week kort bellen? — Emma",
          },
          party: {
            label: "Feest",
            clientName: "Sanne",
            eventDate: "21 maart 2026",
            budget: "€500–1.000",
            draft:
              "Hoi Sanne! Wat leuk, een feest vastleggen is altijd goud: echte momenten, geen poses. Vertel me iets meer over wat jullie vieren en hoe groot het gezelschap is, dan denk ik met je mee over de aanpak. Voor feesten stel ik het pakket meestal op maat samen, afhankelijk van het aantal uren en wat je met de foto's wilt. Ik check de datum graag even. Zullen we deze week kort bellen of mailen? — Emma",
          },
          business: {
            label: "Zakelijk",
            clientName: "Mark",
            eventDate: "9 april 2026",
            budget: "€1.000–2.500",
            draft:
              "Hoi Mark! Goed om van je te horen. Zakelijke shoots doe ik regelmatig, van teamportretten tot beeld voor je website, en ik hoor graag wat jullie precies zoeken. Vertel me iets over jullie merk en waar de foto's voor bedoeld zijn, dan maak ik een voorstel op maat dat past bij jullie doel en budget. De datum check ik graag even. Zal ik je deze week bellen om het door te nemen? — Emma",
          },
          portrait: {
            label: "Portret",
            clientName: "Nadia",
            eventDate: "2 mei 2026",
            budget: "€250–500",
            draft:
              "Hoi Nadia! Leuk dat je een portretshoot wilt plannen. Een goede portretsessie voelt meer als een goed gesprek dan als een fotoshoot, en dat zie je terug in de beelden. Voor een portretsessie werk ik met een pakket vanaf €350, inclusief nabewerking van de beste foto's. Vertel me iets over waar de portretten voor zijn, dan stem ik de aanpak daarop af. Ik check de datum graag even. Wanneer schikt het jou? — Emma",
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
      heroSub: "Je makkelijkste volgende klus is een klant die je al kent. Freelens onthoudt wie, weet wanneer, en schrijft de eerste mail \u2014 in jouw toon. Jij drukt op verzenden.",
      heroCta: "Zet me op de wachtlijst",
      heroCtaTry: "Probeer het met 3 klanten \u2014 zonder account",
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
            body: "Gekozen met een echte reden \u2014 een jaar na de vorige shoot, briefingseizoen in hun wereld \u2014 nooit \u201ceven checken\u201d.",
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
        draftBody: "Hoi Marloes,\n\nVorig jaar oktober schoot ik de najaarscampagne voor De Groene Kamer \u2014 een van de leukste klussen van dat seizoen.\n\nIk zit mijn najaar nu in te plannen en moest aan jullie denken: staat er dit jaar weer een campagne op de planning? Dan hou ik graag alvast ruimte vrij.\n\nGroet,\nSam",
        micro: "Een voorbeeld. Elke reden komt uit jouw eigen gegevens \u2014 klopt een datum niet, dan pas je hem aan. De mail verstuur jij zelf, uit je eigen inbox.",
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
        noCommit: "Aanmelden is gratis en verplicht je tot niets. Zodra de b\u00e8ta opent, bieden we de {spots} founding-plekken ({founding} voor het eerste jaar) aan in volgorde van aanmelding \u2014 je beslist dan pas.",
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
        done: "Bijna: open je inbox en klik op de bevestigingslink. Geen bevestiging, geen plek \u2014 zo weten we dat het adres van jou is.",
        error: "Dat ging niet door. Controleer de velden en probeer het opnieuw.",
        privacyNote: "Alleen gebruikt om je over de b\u00e8ta te vertellen. Door jou bevestigd, op verzoek verwijderd, nooit gedeeld.",
      },
      trust: {
        eyebrow: "Waar de grens ligt",
        heading: "De agent verstuurt nooit iets.",
        body: "Jij verstuurt altijd zelf, vanuit je eigen mail. Je klantgegevens worden nergens anders voor gebruikt en zijn altijd te exporteren en te verwijderen.",
        points: [
          "Elke mail vertrekt uit je eigen inbox, verstuurd door jou",
          "Klantrecords bevatten een naam, een project, een datum \u2014 nooit adressen, telefoonnummers of registratienummers",
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
  },

    notFound: {
    title: "Pagina niet gevonden \u00b7 Freelens",
    body: "Deze pagina bestaat niet.",
    back: "Terug naar Freelens",
  },

  aboutPage: {
    eyebrow: "Waarom Freelens bestaat",
    heading: "Je oude klanten zijn je volgende boeking.",
    intro: "De stilste maanden van een creatieve freelancer zijn zelden een kwaliteitsprobleem. Het werk was goed. De klant was blij. Er is alleen niemand die onthoudt wanneer het logische moment is om weer contact te leggen \u2014 en dus gebeurt het niet, of het gebeurt als \u201ceven checken\u201d, en dat voelt voor iedereen ongemakkelijk.",
    what: {
      h: "Wat Freelens doet",
      p1: "Freelens onthoudt wie je klanten zijn, weet wanneer een berichtje ergens op slaat, en schrijft de eerste mail \u2014 in jouw toon. Elke week: twee tot vier mensen die een bericht waard zijn, elk met een echte reden. Een jaar na de vorige shoot. Briefingseizoen in hun wereld. Nooit \u201ceven checken\u201d.",
      p2: "Jij past aan wat je wilt en verstuurt zelf, vanuit je eigen inbox. Freelens verstuurt nooit iets, naar niemand.",
    },
    boundary: {
      h: "Waar de grens ligt",
      p1: "Klantrecords bevatten een naam, een project, een datum en ongeveer een bedrag. Geen adressen, geen telefoonnummers, geen registratienummers. Alles is vanaf dag \u00e9\u00e9n te exporteren en te verwijderen, en je klantgegevens worden nergens anders voor gebruikt.",
    },
    going: {
      h: "Waar dit heen gaat",
      p1: "Freelens Rebooking is in besloten b\u00e8ta. We onboarden de eerste 25 freelancers en zeggen liever hardop dat er nog niets live is dan dat we doen alsof. Als je fotograaf, videograaf, ontwerper of illustrator bent en je wilt dat je beste klanten je niet vergeten: zet je op de lijst.",
    },
    ctaPrimary: "Zet me op de wachtlijst",
  },

  privacyPage: {
    eyebrow: "Privacy",
    heading: "Wat we weten, en wat we nooit zullen weten.",
    updated: "Versie van {date}.",
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
      body: "Gebruik je de app op /app: je account is een e-mailadres met een magic link, zonder wachtwoord. Klantrecords die je invoert (naam, klus, datum, bedrag, notities \u2014 nooit adressen, telefoonnummers of registratienummers) staan bij Supabase in de EU en zijn alleen door jou leesbaar. Conceptmails schrijft de Claude-API van Anthropic, ingesteld zonder training op jouw gegevens; het model ziet alleen het record dat jij invoerde. De wekelijkse mail loopt via Resend, alleen als er iets te melden is, met \u00e9\u00e9n klik om te stoppen. Alles exporteren of je account verwijderen, direct en definitief, kan in de app zelf.",
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
      noData: "\u2014",
    },
    account: {
      heading: "Je gegevens",
      export: "Exporteer alles (JSON)",
      delete: "Verwijder mijn account",
      deleteWarning: "Direct en definitief. Alles verdwijnt, zonder herstelperiode.",
      deleteConfirm: "Verwijder alles",
    },
  },

};
