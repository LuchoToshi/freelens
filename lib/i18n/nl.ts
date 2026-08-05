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
      beforeJob: "Voor de klus",
      afterPayment: "Na betaling",
      accuracy: "Nauwkeurigheid & bronnen",
      methodology: "Hoe we rekenen",
    },
    back: "Terug",
    languageSwitcher: {
      label: "Taal",
      switchTo: "Schakel over naar",
    },
    example: "Voorbeeld",
    footer: {
      trustLine:
        "Geen belastingadvies. Een heldere schatting om mee te werken. Je cijfers verlaten je browser nooit.",
      cta: "Open de werkruimte",
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

  meta: {
    home: {
      title: "Freelens: wat een klus je echt oplevert, vooraf en achteraf",
      description:
        "Voor Nederlandse freelancers en zzp'ers. Vul een tarief in en zie wat de belasting ervan overlaat. Vul een betaling in en zie wat echt van jou is. Met de echte schijven, aftrekposten en heffingskortingen van 2026, geen vast percentage. Schattingen om mee te plannen, geen belastingadvies, en je cijfers blijven op je apparaat.",
    },
    about: {
      title: "Waarom Freelens bestaat: de beslislaag voor freelancers",
      description:
        "Freelens is de laag tussen je bankrekening en je boekhouding waarin je beslist. Het vult je bestaande tools aan en maakt van één binnengekomen betaling een eenvoudig, betrouwbaar plan, zodat jezelf uitbetalen veilig voelt in plaats van spannend.",
    },
    tool: {
      title: "Je geldoverzicht · Freelens",
      description:
        "Geef een binnengekomen betaling een taak: haal de btw eruit, bescherm een reservering voor inkomstenbelasting en Zvw, dek je bedrijfskosten, en zie wat er veilig van jou is.",
    },
    tarief: {
      title: "Wat moet ik vragen? Je dagtarief, op de echte Nederlandse belastingregels",
      description:
        "Bereken als zzp'er het dagtarief of de projectprijs die je nodig hebt, met de echte schijven, aftrekposten en heffingskortingen van 2026 in plaats van een vast percentage. Het geeft je ondergrens, niet wat de markt betaalt. Je cijfers blijven op dit apparaat.",
    },
  },

  home: {
    hero: {
      eyebrow: "Voor Nederlandse freelancers en zzp'ers",
      headlineStatic: "Wat je overhoudt aan een klus. Vóór de offerte, na de betaling.",
      headlineLine1: "Wat je overhoudt aan een",
      headlineLine3: "Vóór de offerte, na de betaling.",
      contexts: [
        "shoot",
        "klus",
        "campagne",
        "opdracht",
        "draaidag",
      ],
      body: "Freelens rekent met de echte Nederlandse belastingregels, in twee richtingen. Vul een tarief in en zie wat er overblijft. Vul een betaling in en zie wat echt van jou is.",
      primaryCta: "Probeer het met je eigen cijfers",
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
    problem: {
      eyebrow: "Het echte probleem",
      heading: "Het bedrag dat je ziet is nooit het bedrag dat je houdt.",
      body: "Een bedrag op een offerte en een saldo op je rekening hebben hetzelfde probleem. Allebei bruto. Btw, belasting en de kosten van het werk gaan er nog af, en geen van beide zegt wat er echt van jou is.",
      claims: {
        vat: "Wat je mogelijk nodig hebt voor de btw",
        tax: "Wat van de Belastingdienst is",
        costs: "Wat het kost om de zaak te runnen",
        buffer: "Wat als buffer moet blijven staan",
      },
      closing:
        "Freelens doet dezelfde aftreksom aan beide kanten: voordat je een prijs noemt, en nadat het geld binnen is.",
      demoLabel: "Een betaling van {amount}",
      demoYours: "{amount} voor jou",
    },
    howItWorks: {
      eyebrow: "Hoe het werkt",
      heading: "Voordat je offreert, en nadat je betaald krijgt.",
      body: "Eén berekening, in twee richtingen. Voor de klus zie je wat er van een bedrag overblijft. Na de betaling krijgt elke euro een taak. En wat je eerder meetelde bepaalt in welke schijf de volgende klus valt, dus het zijn geen twee losse tools.",
      steps: {
        beforeQuote: {
          title: "Voordat je een prijs noemt",
          body: "Vul het tarief in waar je aan denkt. Freelens haalt eraf wat de klus je kost en welke belasting hij oplevert, over de echte schijven, zodat je ziet wat er overblijft vóór je de offerte stuurt.",
        },
        moneyArrives: {
          title: "Nadat het geld binnen is",
          body: "Vul de betaling in. Freelens haalt de btw eruit, zet een reservering opzij voor inkomstenbelasting en Zvw, en dekt je zakelijke kosten, zodat wat overblijft echt beschikbaar is om jezelf uit te betalen.",
        },
        overTime: {
          title: "Door het jaar heen",
          body: "De werkruimte houdt je positie bij: wat beschermd is, wat vrij is, en hoeveel maanden je vooruit kunt. Toets een aankoop eraan vóór je hem doet. Opgeslagen op je apparaat, dus hij onthoudt het en jij hoeft dat niet.",
        },
      },
      visuals: {
        runway: "{months} maanden vooruit",
      },
    },
    privacy: {
      ariaLabel: "Privacy",
      eyebrow: "Zijn mijn cijfers veilig?",
      heading: "Je financiële gegevens verlaten je browser nooit.",
      body: "Je bedragen worden nooit geüpload. Ze staan in deze browser en je kunt ze altijd wissen. Freelens telt anonieme paginaweergaven zodat we weten dat de site gebruikt wordt, en dat is alles wat we verzamelen.",
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
      heading: "Dezelfde motor, aan beide kanten van de klus.",
      body: "Kies het moment waar je nu in zit. Allebei rekenen ze met de echte Nederlandse regels van {year}, en niets wat je hier invult wordt opgeslagen of verstuurd.",
      tablistLabel: "In welk moment zit je?",
      before: {
        tab: "Ik moet nog een prijs bepalen",
        tabSub: "Wat houd ik over aan dit tarief?",
        deepLink: "Bereken een dagtarief voor het hele jaar",
      },
      after: {
        tab: "Ik ben betaald",
        tabSub: "Wat is hier echt van mij?",
        deepLink: "Open de volledige werkruimte",
      },
      whyDifferent: {
        toggle: "Waarom laten de twee tabbladen andere percentages zien?",
        body: "Omdat ze een andere vraag beantwoorden. Bij offreren gaat het om wat één klus extra bovenop je verwachte jaar oplevert, dus die wordt belast tegen het tarief waar die klus je in duwt. Een betaling die al binnen is hoort bij een jaar waar je al aan vastzit, dus die draagt zijn deel van de hele jaarrekening. Dezelfde motor, dezelfde regels, twee eerlijke antwoorden.",
      },
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
      "Het past de reserveringsregels die jij kiest consequent toe.",
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
        "Freelens reserveerde vroeger 30% van de omzet. Dat zit tegelijk in twee richtingen fout, en de fout is het grootst precies daar waar het geld zit. Deze drie gevallen komen rechtstreeks uit de engine; alle tien staan in OLD_VS_NEW.md.",
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
      "Dat is {effective}% van de winst in totaal, terwijl over de volgende verdiende euro {marginal}% wordt geheven. Freelens reserveert bij een betaling tegen dat tweede tarief, omdat een nieuwe betaling bovenop alles komt wat je dit jaar al verdiend hebt.",
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
  aboutPage: {
    eyebrow: "Waarom Freelens bestaat",
    heading: "Jezelf uitbetalen zou veilig moeten voelen, niet spannend.",
    lead:
      "Freelens bestaat om één terugkerend moment rustig te maken: een klant betaalt eindelijk, en jij moet weten wat je met dat geld echt kunt doen.",
    moment:
      "Een klant betaalt eindelijk. Het banksaldo ziet er ineens gezond uit. Even voelt het alsof je het gemaakt hebt.",
    questions:
      "Dan beginnen de vragen. Hoeveel is btw? Kan ik mezelf eindelijk uitbetalen? Kan ik die nieuwe lens kopen, of moet ik wachten? Heb ik hier over drie maanden spijt van?",
    heldBack:
      "Creatieve freelancers worden zelden geremd door hun vak. Ze worden geremd door onzekerheid over geld, niet omdat ze onverantwoordelijk zijn, maar omdat het antwoord echt lastig te zien is.",
    toolsHeading: "De gebruikelijke tools beantwoorden een andere vraag.",
    tools: [
      "Bankapps laten je saldo zien.",
      "Boekhoudsoftware legt vast wat er gebeurd is.",
      "Aangiftesoftware helpt je met je aangifte.",
    ],
    layerHeading: "Freelens is de laag tussen je bankrekening en je boekhouding waarin je beslist.",
    layerBody:
      "Het zit tussen die twee in en vertaalt ruwe financiële gegevens naar iets waar je naar kunt handelen. Eén binnengekomen betaling wordt een eenvoudig plan: dit opzij voor de btw, dat beschermd voor de belasting, dit blijft in de zaak, en dit deel is veilig van jou.",
    complements:
      "Het vult de rest van je tools aan: bankapps, boekhoudsoftware, factuurprogramma's en spreadsheets houden allemaal hun plek. Freelens vervangt ze niet, het beantwoordt de vraag die geen van hen beantwoordt.",
    trustHeading: "Gebouwd op vertrouwen en helderheid.",
    trustBody:
      "Het product kiest voor voorspelbare logica, transparante aannames en uitlegbare uitkomsten in plaats van “magie”. Waar automatisering helpt, blijft die achter een heldere beslissing die je zelf kunt nalopen.",
    opinionated:
      "Freelens heeft bewust een mening. Het richt zich op één terugkerende beslissing in plaats van te proberen nóg een financieel platform te worden.",
    privacyHeading: "Je cijfers blijven op je apparaat.",
    privacyBody:
      "Geen account. Geen bankkoppeling. Geen cloud nodig. Je cijfers worden lokaal in je browser opgeslagen en gaan nooit naar Freelens, en je kunt ze op elk moment wissen.",
    futureHeading: "Waar dit heen gaat.",
    futureBody:
      "Freelens wil de vertrouwde financiële beslislaag worden voor zelfstandige creatieven. Niet als vervanging van boekhouders of administratie, maar om alledaagse geldbeslissingen rustig en helder te maken.",
    futureNote:
      "Vandaag vul je alles handmatig in. Op termijn kunnen optionele gemakken volgen, zoals csv-import en alleen-lezen koppelingen. Altijd optioneel, nooit verplicht, en nooit ten koste van de helderheid.",
    ctaHeading: "Probeer het met je laatste betaling.",
    ctaBody: "Zie in ongeveer een minuut wat je jezelf veilig kunt uitbetalen.",
    cta: "Bekijk wat ik mezelf kan uitbetalen",
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

      guided: {
        progressLabel: "Waar je bent",
        stepOf: "Stap {n} van {total}",
        announce: "Stap {n} van {total}. {question}",
        back: "Terug",
        next: "Volgende",
        submit: "Laat mijn tarief zien",
        whyAsk: "Waarom vragen we dit?",
        optional: "Optioneel",

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
          title: "Er is een betaling binnen? Geef die een taak.",
          cta: "Bekijk wat ik mezelf kan uitbetalen",
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
          title: "Je geldoverzicht",
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
        reserveSourceNote:
          "Reservering op basis van het percentage dat jij hebt ingesteld (een planningsregel, geen aanslag).",
        markHandled: "Verdeling afgehandeld",
        savedOnDevice: "Opgeslagen op dit apparaat.",
        movesMoneyNote:
          "Freelens legt het plan vast op dit apparaat. Het geld moet je zelf nog overmaken bij je bank.",
      },
      sample: {
        intro:
          "Zo valt een betaling van {amount} met 21% btw uiteen, voor iemand die dit jaar {profit} winst verwacht{rate}.",
        rateNote: " (gereserveerd tegen {pct}%, het tarief over hun volgende euro)",
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
