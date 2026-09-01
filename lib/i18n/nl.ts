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
      tryDemo: "Inloggen",
      about: "Over ons",
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


  meta: {
    agent: {
      title: "Freelens: geef de balie uit handen, hou de beslissingen",
      description:
        "Freelens leest elke aanvraag via je eigen pagina, plant het werk en zet de antwoorden klaar in jouw stem. Prijzen, datums en versturen blijven van jou. Alleen op uitnodiging zolang we testen.",
    },
    home: {
      title: "Freelens: verlies geen klussen meer aan een traag antwoord",
      description:
        "Elke aanvraag via je eigen pagina krijgt een snel, persoonlijk antwoord met jouw echte prijzen, klaar om te versturen. Gebouwd voor creatieve freelancers zoals fotografen, videografen, designers en illustratoren.",
    },
    about: {
      title: "Een antwoord dat klaarstaat voordat het moment voorbij is \u00b7 Freelens",
      description:
        "Freelens leest elke aanvraag via je pagina en schrijft een antwoord in jouw stijl, met jouw prijzen. Het verstuurt nooit iets, noemt nooit een bedrag dat jij niet hebt ingesteld, en beweert nooit dat een datum vrij is.",
    },
    privacy: {
      title: "Privacy · Freelens",
      description:
        "Wat Freelens verzamelt, wat het nooit verzamelt, en hoe je je gegevens meeneemt of laat verdwijnen.",
    },
  },

  home: {


    frontdesk: {
      agent: {
        heroEyebrow: "Je frontdesk, uit handen",
        heroTitle: "Geef de balie uit handen. Hou de beslissingen.",
        heroSub:
          "Freelens leest elke aanvraag via je eigen pagina, plant het werk en zet de antwoorden klaar in jouw stem. Prijzen, datums en versturen blijven van jou.",
        heroCta: "Vraag een uitnodiging",
        heroCtaTry: "Zie hoe het werkt",
        exampleLabel: "Jij vraagt. Het plant. Jij keurt goed.",
        askLabel: "Jij vraagt",
        ask: "Ga achter de stille leads van maart aan.",
        planLabel: "Freelens plant",
        planSteps: [
          "4 stille gesprekken gevonden. Geen daarvan heeft afgezegd.",
          "Voor elk een persoonlijke opvolging opstellen, alleen jouw prijzen en stem.",
          "Jij leest na en verstuurt. Daarvoor beweegt er niets.",
        ],
        resultLabel: "Een week later",
        result: "Twee reacties, één boeking. Elk concept kon je eerst aanpassen.",
        approveNote: "Jij keurt goed voordat er iets beweegt.",
        objections: [
          {
            q: "Verstuurt het zelf dingen?",
            a: "Nee. Het zet klaar; jij verstuurt. Versturen, prijzen, datums en een lead sluiten zitten achter een plafond dat geen instelling opent.",
          },
          {
            q: "Wat kan het eigenlijk zien?",
            a: "Je aanvraagpagina en je eigen accountgegevens. Bij elk feit staat waar het vandaan komt, en wat leeg is blijft leeg in plaats van een gok te worden.",
          },
          {
            q: "En als het iets fout heeft?",
            a: "Jij ziet het concept als eerste. Sla je het over, dan zeg je waarom, zodat het patroon zichtbaar is; pas je het aan, dan gaat jouw versie de deur uit en daar leert het van. Van één bewerking maakt het nooit een regel.",
          },
        ],
        followupQ: "Moet ik er dan constant bovenop zitten?",
        followupA:
          "Juist niet. Het laat de uitzonderingen zien: wat een beslissing nodig heeft, wat wacht, wat vanzelf liep. Een stil scherm betekent dat niets jou nodig heeft.",
        waitlistHeading: "Alleen op uitnodiging, met opzet.",
        waitlistSub:
          "We openen een paar frontdesks tegelijk, zodat elke goed wordt ingericht. Zet je op de lijst, dan sturen we een uitnodiging als jij aan de beurt bent.",
      },
      heroEyebrow: "Je front desk",
      heroTitle: "Verlies geen klussen meer aan een traag antwoord.",
      heroSub:
        "Elke aanvraag via je eigen pagina krijgt een snel, persoonlijk antwoord met jouw echte prijzen, klaar om te versturen. Jij tikt alleen op verzenden.",
      heroCta: "Zet me op de lijst",
      heroCtaTry: "Bekijk een echt antwoord",
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
        caption: "In een paar seconden klaar. Jij verstuurt hem zelf.",
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
          event: {
            label: "Evenement",
            clientName: "Sanne",
            eventDate: "21 maart 2026",
            budget: "€500–1.000",
            draft:
              "Hoi Sanne! Wat leuk, een evenement vastleggen is altijd goud: echte momenten, geen poses. Vertel me iets meer over wat jullie vieren en hoe groot het gezelschap is, dan denk ik met je mee over de aanpak. Voor evenementen stel ik het pakket op maat samen, afhankelijk van het aantal uren en wat je met de foto's wilt. Ik check de datum graag even. Zullen we deze week kort bellen of mailen?\n\nEmma",
          },
          brand_film: {
            label: "Merkfilm",
            clientName: "Mark",
            eventDate: "9 april 2026",
            budget: "€1.000–2.500",
            draft:
              "Hoi Mark! Goed om van je te horen. Merkfilms maak ik regelmatig, en ik hoor graag wat jullie voor ogen hebben. Vertel me iets over het verhaal dat je wilt vertellen en waar de film te zien zal zijn, dan maak ik een voorstel op maat dat past bij jullie doel en budget. De datum check ik graag even. Zal ik je deze week bellen om het door te nemen?\n\nEmma",
          },
          social_content: {
            label: "Socialcontent",
            clientName: "Nadia",
            eventDate: "2 mei 2026",
            budget: "€250–500",
            draft:
              "Hoi Nadia! Leuk dat je nadenkt over content voor je kanalen. Zo'n draaidag werkt het beste als we weten wat de eerste posts moeten doen, dus vertel me daar iets over, dan stem ik de dag daarop af. Ik check de datum graag even. Wanneer schikt het jou?\n\nEmma",
          },
        },
        caption: "In een paar seconden klaar. Jij verstuurt hem zelf, vanuit je eigen inbox of gewoon terug waar ze je vonden.",
        bridge: "Zo werkt het straks met jouw prijzen en jouw stijl.",
        inquiryMeta: "Nieuwe aanvraag · 2 min geleden",
        intro: "Er komt een aanvraag binnen. Seconden later:",
        orSeeLabel: "of ook:",
      },
      objections: {
        items: [
          {
            q: "Klinkt het echt als jij?",
            a: "Ja. Je plakt een paar van je eigen antwoorden, en Freelens leert je toon. Warm of zakelijk, kort of uitgebreid, met of zonder emoji: het schrijft zoals jij schrijft.",
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
        heading: "Je front desk gaat binnenkort live.",
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
        privacyNote: "We gebruiken je e-mailadres alleen om je op de hoogte te houden van je front desk. Uitschrijven kan altijd.",
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
    heading: "Een antwoord dat klaarstaat voordat het moment voorbij is.",
    intro: "De meeste opdrachten gaan niet verloren op prijs of portfolio. Ze gaan verloren in de twee dagen die het duurde om te antwoorden. De aanvraag kwam binnen terwijl je aan het draaien was, je wilde \u2019s avonds rustig reageren, en tegen die tijd hadden ze al iemand anders gesproken. Freelens is de receptie die ondertussen antwoordt.",
    what: {
      h: "Wat Freelens doet",
      p1: "Je krijgt een pagina om mensen naartoe te sturen. Vult iemand die in, dan leest Freelens wat er staat, legt het naast de pakketten die je hebt ingesteld, en schrijft een antwoord in jouw stijl, meestal binnen enkele seconden. Het wacht in je inbox, met de onderbouwing ernaast: wat er gelezen is, welke prijs is gebruikt, en wat niet gecontroleerd kon worden.",
      p2: "Jij leest het na, past aan wat je wilt, en verstuurt het zelf vanuit je eigen mail. Freelens verstuurt nooit iets naar wie dan ook. Blijft een klant stil, dan staat er op dezelfde manier \u00e9\u00e9n opvolging klaar, en ook die wacht op jou.",
    },
    boundary: {
      h: "Wat Freelens weet",
      p1: "De aanvraag zelf, de pakketten en prijzen die je hebt ingevoerd, en een profiel van hoe jij schrijft, opgebouwd uit antwoorden die je zelf hebt gedeeld. Het e-mailadres van je klant gaat nooit naar de AI: het wordt gebruikt om de mail te adresseren die jij verstuurt, verder nergens voor. Je kunt per onderdeel aanpassen of verwijderen wat er onthouden is, en je ziet bij elke geleerde voorkeur waar die vandaan komt.",
    },
    trust: {
      h: "Waarom de concepten veilig te versturen zijn",
      p1: "Elke prijs in een concept moet overeenkomen met een pakket dat je zelf hebt ingesteld; een concept dat een bedrag verzint wordt weggegooid voordat jij het ziet. Freelens zegt nooit dat je vrij bent op een datum, want het heeft geen toegang tot je agenda, en dat staat ook in de notities bij het concept. Er wordt nooit iets verstuurd, geoffreerd of bevestigd zonder jou.",
      p2: "Dat is de hele opzet: de AI schrijft, de controles zijn gewone code, en jij beslist.",
    },
    going: {
      h: "Waar dit heen gaat",
      p1: "Freelens is in besloten b\u00e8ta. Er is nog niets openbaar, en dat zeggen we liever hardop dan dat we doen alsof. We stellen een eerste kleine groep freelancers samen die ermee gaan werken en ons vertellen wat er nog niet klopt. Ben je fotograaf, videograaf, ontwerper, illustrator of een andere creatieve freelancer die opdrachten via aanvragen binnenkrijgt? Zet je op de lijst.",
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
    frontdesk: {
      title: "Je profiel, aanvragen en concepten",
      body: "Meld je je aan als freelancer: je profiel (weergavenaam, vak, stad, een optionele foto en je afsluiting) wordt bewaard bij Supabase, alleen leesbaar door jou. Op je publieke pagina staan alleen je handle, weergavenaam, vak, stad en foto. De e-mails die je plakt zodat concepten klinken als jij, bewaren we als tekst in plaats van ze weg te gooien, zodat we je stijlprofiel opnieuw kunnen afleiden naarmate we beter worden in hoe we dat lezen; alleen jij kunt ze zien. Vult iemand je publieke aanvraagformulier in, dan bewaren we wat diegene invult: naam, optioneel een e-mailadres, de datum en het type evenement, het budget, het bericht, en via welk kanaal de aanvraag binnenkwam. Dat e-mailadres is alleen voor je eigen follow-up; het gaat nooit naar de Claude-API van Anthropic die je antwoord opstelt. Elk concept wordt eerst tegen je eigen pakketten en het bericht van de klant gecontroleerd voordat het bij je terechtkomt, en we bewaren elk concept samen met of je het ongewijzigd verstuurde, aanpaste, of oversloeg. Verwijder je account, dan verdwijnen je profiel, aanvragen en concepten mee, direct en definitief.",
    },
    gmail: {
      title: "Je Gmail-inbox, als je die koppelt",
      body: "Gmail koppelen is optioneel, staat standaard uit, en is nu nog niet mogelijk. Mocht en zodra dit er komt: we vragen alleen-lezentoegang tot de inbox, labels en periode die jij kiest, plus een aparte toestemming om te versturen, alleen nadat jij elk concept zelf goedkeurt. Elk bericht wordt eenmalig gelezen om er het bruikbare uit te halen, en daarna losgelaten: de mail zelf wordt nooit bewaard. Wat we bewaren is een korte samenvatting per gesprek (contactpersoon, soort project, datums, budgetsignalen), de kansen die we daaruit halen, en de concepten en goedkeuringen waarop jij handelt, opgeslagen bij Supabase, dezelfde plek waar je andere Freelens-gegevens staan, alleen leesbaar door jou. Die gegevens blijven staan zolang je koppeling actief is. Trek je de toegang in, dan blijft het nog 30 dagen bewaard voor het geval je van gedachten verandert, en wordt het daarna automatisch verwijderd; een koppeling die stil ligt wordt hoe dan ook na 12 maanden verwijderd. Loskoppelen kan altijd via Instellingen, \u00e9\u00e9n klik, en de synchronisatie stopt meteen. Je e-mailinhoud wordt nooit gebruikt om een gedeeld AI-model te trainen. Concepten worden geschreven door de Claude-API van Anthropic. Freelens houdt zich bij het gebruik van informatie uit Google API's aan het Google API Services User Data Policy, inclusief de Limited Use-vereisten.",
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



};
