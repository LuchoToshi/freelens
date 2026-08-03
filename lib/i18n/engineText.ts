/**
 * Translation for text the tax engine produces.
 *
 * The engine in `lib/tax/` is pure and locale-free by design: it emits English
 * labels, explanations and assumptions alongside every figure. Threading a
 * locale through it would put presentation concerns inside the one module that
 * has to stay a deterministic function of the tax rules, so translation happens
 * here instead, at the boundary where the text is rendered.
 *
 * Two lookups, in order:
 *
 *   1. `breakdown` lines carry a stable `id` (`net-tax`, `quote-take-home`,
 *      `bracket-1`, …). Those translate cleanly by id.
 *   2. `assumptions` are bare strings with no id. Static ones match exactly;
 *      the four that interpolate a figure match a pattern and keep the captured
 *      number, which never needs translating.
 *
 * Anything unmatched falls through as English. `engineText.test.ts` sweeps the
 * engine across many inputs and fails if it can emit a string this file cannot
 * translate, so the fallback is a safety net rather than a hiding place.
 */
import type { Locale } from "@/lib/i18n/types";

interface EnginePattern {
  match: RegExp;
  nl: (...groups: string[]) => string;
}

/** Breakdown line labels, keyed by the engine's own stable id. */
const NL_BREAKDOWN_LABELS: Record<string, string> = {
  "gross-profit": "Verwachte winst voor dit jaar",
  "deduction-zelfstandigenaftrek": "Zelfstandigenaftrek",
  "deduction-startersaftrek": "Startersaftrek",
  "deduction-mkb-winstvrijstelling": "MKB-winstvrijstelling",
  "taxable-profit": "Winst waarover de belasting wordt berekend",
  "other-income": "Andere inkomsten",
  "taxable-income": "Totaal belastbaar inkomen",
  "credit-algemene-heffingskorting": "Algemene heffingskorting",
  "credit-arbeidskorting": "Arbeidskorting",
  "credits-limited": "Heffingskortingen die je niet kunt gebruiken",
  "rate-adjustment": "Tariefsaanpassing aftrekposten",
  "tax-already-withheld": "Belasting die je werkgever al heeft ingehouden",
  "net-tax": "Inkomstenbelasting na heffingskortingen",
  "contribution-zvw": "Bijdrage Zvw",
  "total-liability": "Totaal te betalen dit jaar",
  "already-reserved": "Al opzij gezet",
  "reserve-gap": "Nog opzij te zetten",
  "quote-ex-vat": "Wat je moet vragen, exclusief btw",
  "quote-vat": "Btw",
  "quote-incl-vat": "Wat de klant betaalt",
  "quote-job-costs": "Kosten voor deze opdracht",
  "quote-taxable-delta": "Winst die deze opdracht oplevert",
  "quote-additional-liability": "Inkomstenbelasting en Zvw die deze opdracht erbij brengt",
  "quote-take-home": "Wat je overhoudt",
  "rate-per-unit": "Wat je moet vragen",
  "rate-gross-revenue": "Omzet voor het jaar, exclusief btw",
  "rate-business-costs": "Je jaarlijkse bedrijfskosten",
  "rate-profit": "Winst vóór belasting",
  "rate-tax": "Inkomstenbelasting en Zvw",
  "rate-take-home": "Wat je overhoudt",
};

/** Labels the engine builds per bracket, so the id carries the number. */
const NL_BREAKDOWN_PATTERNS: EnginePattern[] = [
  {
    match: /^Bracket (\d+) at ([\d.,]+)%$/,
    nl: (n, rate) => `Schijf ${n} tegen ${rate}%`,
  },
  {
    match: /^(.+) \(not applied\)$/,
    nl: (label) => `${NL_BREAKDOWN_LABELS[""] ?? label} (niet toegepast)`,
  },
];

/** Breakdown explanations, keyed by the same id as the label. */
const NL_BREAKDOWN_EXPLANATIONS: Record<string, string> = {
  "deduction-zelfstandigenaftrek":
    "Een vaste aftrek voor ondernemers die minstens 1.225 uur per jaar aan de onderneming besteden en aan het begin van het jaar de AOW-leeftijd nog niet hadden bereikt. De aftrek kan niet hoger zijn dan je winst, tenzij je ook recht hebt op de startersaftrek.",
  "deduction-startersaftrek":
    "Een extra aftrek bovenop de zelfstandigenaftrek, voor maximaal drie van je eerste vijf jaar als ondernemer. Die is niet begrensd door je winst, dus in een mager jaar kan hij een verlies vergroten dat je vooruit wentelt.",
  "deduction-mkb-winstvrijstelling":
    "12,7% van wat er na de ondernemersaftrek overblijft is vrijgesteld van inkomstenbelasting. Dat geldt ook voor een verlies, waardoor dat verlies kleiner wordt.",
  "credit-algemene-heffingskorting":
    "Een korting die van de belasting wordt afgetrokken, niet van je inkomen. Tot €29.736 krijg je het volledige bedrag, daarna bouwt hij af tot nul bij €78.427.",
  "credit-arbeidskorting":
    "Een korting voor mensen die werken, ook voor zelfstandigen. Die wordt berekend over je arbeidsinkomen, waarin je winst meetelt VÓÓR de ondernemersaftrek en de MKB-winstvrijstelling.",
  "contribution-zvw":
    "De inkomensafhankelijke bijdrage voor de zorgverzekering. Dat is een aparte rekening naast de inkomstenbelasting, die via je aanslag loopt, en je betaalt hem ook in een jaar waarin de inkomstenbelasting op nul uitkomt.",
  "rate-adjustment":
    "Boven €78.426 zouden je aftrekposten je anders belasting besparen tegen 49,50%. Er wordt een correctie van 11,94% bij opgeteld, zodat het voordeel begrensd blijft op 37,56%.",
  "gross-profit":
    "Je omzet exclusief btw, min je bedrijfskosten. De belasting wordt hierover berekend, niet over wat je klanten je betalen.",
  "taxable-profit": "Wat er van je winst overblijft na de aftrekposten hierboven.",
  "other-income":
    "Loon of een uitkering. Dit telt mee zodat je tarief klopt, maar belasting die je werkgever al heeft ingehouden wordt hier niet afgetrokken.",
  "taxable-income": "Je belastbare winst plus je andere inkomsten.",
  "credits-limited":
    "Je heffingskortingen zijn samen meer waard dan de inkomstenbelasting die je verschuldigd bent. Het deel dat overblijft wordt niet uitbetaald en verlaagt je aanslag dus niet verder.",
  "tax-already-withheld":
    "Loonheffing die over je loon is afgedragen. Die telt mee voor deze aanslag, dus je hoeft het niet nog een keer opzij te zetten.",
  "net-tax": "Belasting over de schijven, min de heffingskortingen hierboven. Nooit lager dan nul.",
  "net-tax-withheld":
    "Belasting over de schijven, min de heffingskortingen, min wat je werkgever al heeft ingehouden. Nooit lager dan nul.",
  "total-liability": "Inkomstenbelasting na heffingskortingen, plus de bijdragen hierboven.",
  "already-reserved": "Wat je al opzij hebt gezet voor de aanslag van dit jaar.",
  "reserve-gap":
    "De rest van de aanslag van dit jaar, naar boven afgerond op hele euro's. We ronden altijd naar boven af, omdat een tekort meer kost dan een overschot.",
  "quote-ex-vat":
    "De prijs op je offerte vóór btw. De rest van de berekening gaat hiervan uit.",
  "quote-vat":
    "Wordt er bovenop gerekend en gaat rechtstreeks naar de Belastingdienst. Het is nooit van jou, dus het speelt geen rol in wat je overhoudt.",
  "quote-incl-vat": "Het factuurtotaal: jouw prijs plus de btw.",
  "quote-job-costs":
    "Geld dat er direct weer uit gaat: reiskosten, een assistent, huur, licenties. Volledig bij de prijs opgeteld, omdat het je winst verlaagt in plaats van je aanslag met hetzelfde bedrag.",
  "quote-taxable-delta": "Je prijs min de kosten hierboven. Alleen dit deel wordt belast.",
  "quote-additional-liability":
    "Het verschil tussen je aanslag voor dit jaar mét en zónder deze opdracht. Berekend op jouw echte schijven, dus een opdracht die je in een hogere schijf duwt is daarop geprijsd.",
  "quote-take-home": "Je prijs, min de kosten, min de belasting die deze opdracht erbij brengt.",
  "rate-gross-revenue":
    "Wat er over het hele jaar binnen moet komen. Btw komt er bovenop en gaat door, dus dat speelt hier geen rol.",
  "rate-business-costs":
    "Software, verzekeringen, apparatuur, werkplek, je boekhouder. Aftrekbaar, dus ze verlagen je aanslag, maar je moet ze nog steeds verdienen voordat er iets van jou is.",
  "rate-profit": "Omzet min je kosten. Over dit bedrag wordt de belasting berekend.",
  "rate-tax":
    "Berekend over de echte schijven voor het hele jaar, met de aftrekposten en heffingskortingen waar je recht op hebt. Geen vast percentage.",
  "rate-take-home": "Winst min de belasting hierboven. Dit is het bedrag waar je om vroeg.",
};

const NL_EXPLANATION_PATTERNS: EnginePattern[] = [
  {
    match: /^About €([\d.,]+) of your income falls in this bracket\.$/,
    nl: (amount) => `Ongeveer €${amount} van je inkomen valt in deze schijf.`,
  },
  {
    match: /^Not applied because (.+)\.$/,
    nl: (reason) => `Niet toegepast omdat ${NL_SKIP_REASONS[reason] ?? reason}.`,
  },
  {
    match: /^The revenue you need, spread over the (\d+) billable days you expect\. Rounded up, because rounding a rate down means working the year at a loss you only notice in December\.$/,
    nl: (days) =>
      `De omzet die je nodig hebt, verdeeld over de ${days} factureerbare dagen die je verwacht. Naar boven afgerond, want een tarief naar beneden afronden betekent dat je het jaar met verlies draait en dat pas in december merkt.`,
  },
];

/** Reasons a deduction was skipped, as the engine phrases them. */
const NL_SKIP_REASONS: Record<string, string> = {
  "you have not confirmed the hours criterion":
    "je nog niet hebt bevestigd dat je aan het urencriterium voldoet",
  "you are not in your first years as an entrepreneur":
    "je niet in je eerste jaren als ondernemer zit",
};

/** Assumption sentences that never interpolate anything. */
const NL_ASSUMPTIONS: Record<string, string> = {
  "This is a planning estimate, not tax advice and not an assessment. Your actual bill is set by the Belastingdienst on your annual return.":
    "Dit is een schatting om mee te plannen, geen belastingadvies en geen aanslag. Wat je werkelijk moet betalen stelt de Belastingdienst vast bij je aangifte.",
  "Figures are for a taxpayer who has not reached AOW age, is taxed as an entrepreneur for income tax (ondernemer voor de inkomstenbelasting), and lives in the Netherlands.":
    "De cijfers gelden voor iemand die de AOW-leeftijd nog niet heeft bereikt, voor de inkomstenbelasting als ondernemer wordt aangemerkt, en in Nederland woont.",
  "Income tax is assessed once a year on your total profit. This estimate projects the whole year, so it changes as your projected profit changes.":
    "Inkomstenbelasting wordt één keer per jaar vastgesteld over je totale winst. Deze schatting kijkt naar het hele jaar, dus hij verandert zodra je verwachte winst verandert.",
  "The Zvw base is taken as your profit after the entrepreneur deductions and the MKB-winstvrijstelling. Belastingdienst publishes the rate (4,85%) and the maximum contribution base (€79.409) but does not state the base on its public pages, so this is unconfirmed. See NEEDS_VERIFICATION.md.":
    "Als grondslag voor de Zvw nemen we je winst na de ondernemersaftrek en de MKB-winstvrijstelling. De Belastingdienst publiceert het percentage (4,85%) en het maximum bijdrage-inkomen (€79.409), maar noemt de grondslag niet op de openbare pagina's, dus dit is onbevestigd. Zie NEEDS_VERIFICATION.md.",
  "The algemene heffingskorting is calculated on your Box 1 income only. Box 2 and Box 3 income are not modelled and would reduce this credit, so anyone with such income will be under-reserved here.":
    "De algemene heffingskorting wordt alleen over je inkomen in box 1 berekend. Inkomen in box 2 en box 3 zit niet in het model en zou deze korting verlagen, dus wie dat heeft, zet hier te weinig opzij.",
  "Employment income is counted so the bracket your freelance profit lands in is right. Tax your employer already withheld is only subtracted if you enter it.":
    "Loon telt mee zodat de schijf waarin je winst valt klopt. Belasting die je werkgever al heeft ingehouden wordt alleen afgetrokken als je die invult.",
  "The Zvw maximum contribution base is applied to business profit alone. With a job alongside the business the maximum is shared across both, so this estimate can overstate Zvw at high combined income.":
    "Het maximum bijdrage-inkomen voor de Zvw wordt alleen op je winst toegepast. Heb je daarnaast een baan, dan geldt het maximum voor allebei samen, dus bij een hoog gezamenlijk inkomen kan deze schatting de Zvw te hoog inschatten.",
  "Only the zelfstandigenaftrek, the startersaftrek and the MKB-winstvrijstelling are modelled. Investeringsaftrek, meewerkaftrek, stakingsaftrek, fiscale oudedagsreserve and loss carry-forward are not.":
    "Alleen de zelfstandigenaftrek, de startersaftrek en de MKB-winstvrijstelling zitten in het model. Investeringsaftrek, meewerkaftrek, stakingsaftrek, fiscale oudedagsreserve en verliesverrekening niet.",
  "Amounts to set aside are rounded up to the whole euro. Under-reserving produces a surprise bill; over-reserving only costs liquidity, and those two are not equally bad.":
    "Bedragen om opzij te zetten worden naar boven afgerond op hele euro's. Te weinig reserveren levert een onverwachte aanslag op; te veel reserveren kost alleen even liquiditeit, en dat is niet even erg.",
  "Your tax credits are worth more than the income tax you owe. The unused part is not refunded, and this estimate does not assume it will be.":
    "Je heffingskortingen zijn meer waard dan de inkomstenbelasting die je verschuldigd bent. Het ongebruikte deel wordt niet uitbetaald, en deze schatting gaat daar ook niet van uit.",
  "You have employment income but have not entered the loonheffing your employer already withheld, so this estimate is higher than what you actually still owe. The figure is on your jaaropgaaf or a recent payslip.":
    "Je hebt loon, maar je hebt de loonheffing die je werkgever al heeft ingehouden niet ingevuld, dus deze schatting is hoger dan wat je werkelijk nog moet betalen. Dat bedrag staat op je jaaropgaaf of een recente loonstrook.",
  "The loonheffing your employer already withheld has been subtracted from the bill. If you have over-withheld, the excess comes back through your return rather than reducing this estimate below zero.":
    "De loonheffing die je werkgever al heeft ingehouden is van de aanslag afgetrokken. Is er te veel ingehouden, dan krijg je dat terug via je aangifte in plaats van dat deze schatting onder nul zakt.",
  "You have not confirmed the hours criterion, so the entrepreneur deductions are left out. If you do meet it, your bill is lower than this.":
    "Je hebt niet bevestigd dat je aan het urencriterium voldoet, dus de ondernemersaftrek is weggelaten. Voldoe je er wel aan, dan is je aanslag lager dan dit.",
  "You have already earned your whole projected profit for the year, so this payment is reserved at the rate on your next euro. Raise your projected profit to get a truer figure.":
    "Je hebt je hele verwachte jaarwinst al verdiend, dus deze betaling wordt gereserveerd tegen het tarief over je volgende euro. Verhoog je verwachte winst voor een realistischer bedrag.",
  "This payment is larger than the profit you still expect this year. The part beyond your projection is reserved at the rate on your next euro. Raise your projected profit to get a truer figure.":
    "Deze betaling is groter dan de winst die je dit jaar nog verwacht. Het deel boven je verwachting wordt gereserveerd tegen het tarief over je volgende euro. Verhoog je verwachte winst voor een realistischer bedrag.",
  "This payment is not enough to cover what is still owed for the year, so all of it is set aside.":
    "Deze betaling is niet genoeg om te dekken wat er dit jaar nog openstaat, dus alles wordt opzij gezet.",
  "This is what you need to charge to keep what you asked for. It is not what the market will pay, and Freelens has no view on that.":
    "Dit is wat je moet vragen om over te houden wat je wilde. Het is niet wat de markt betaalt, en Freelens heeft daar geen oordeel over.",
  "This is what you need to charge, not what you can charge. It is a floor. Freelens has no view on what your market pays.":
    "Dit is wat je moet vragen, niet wat je kunt vragen. Het is een ondergrens. Freelens heeft geen oordeel over wat jouw markt betaalt.",
  "Your costs for this job are added to the quote in full and are not taxed, because they are deductible. The btw you pay on them is reclaimed through your btw-aangifte and is not part of this figure.":
    "Je kosten voor deze opdracht worden volledig bij de prijs opgeteld en niet belast, omdat ze aftrekbaar zijn. De btw die je erover betaalt vraag je terug via je btw-aangifte en zit niet in dit bedrag.",
  "You have income alongside the business. It is counted, because it decides which bracket your profit lands in, but the take-home figure here is what the business itself leaves you.":
    "Je hebt inkomsten naast de onderneming. Die tellen mee, omdat ze bepalen in welke schijf je winst valt, maar het bedrag hier is wat de onderneming zelf je oplevert.",
};

/** Assumptions that carry a figure. The captured value is never translated. */
const NL_ASSUMPTION_PATTERNS: EnginePattern[] = [
  {
    match: /^Calculated for tax year (\d+) using config (\S+), with every figure checked against the official source on (\S+)\.$/,
    nl: (year, version, date) =>
      `Berekend voor belastingjaar ${year} met configuratie ${version}, waarbij elk cijfer op ${date} is gecontroleerd bij de officiële bron.`,
  },
  {
    match: /^Worked out as an addition to the €(\S+) profit you already expect this year\. A different projection gives a different answer, because the tax on this job depends on where the rest of your year lands\.$/,
    nl: (profit) =>
      `Berekend als aanvulling op de €${profit} winst die je dit jaar al verwacht. Een andere verwachting geeft een ander antwoord, omdat de belasting op deze opdracht afhangt van waar de rest van je jaar uitkomt.`,
  },
  {
    match: /^Built on (\d+) billable days a year\. That is the number this whole answer turns on: bill fewer days than you planned and the rate was too low all along\.$/,
    nl: (days) =>
      `Gebaseerd op ${days} factureerbare dagen per jaar. Dat is het getal waar dit hele antwoord om draait: factureer je minder dagen dan gepland, dan was het tarief al die tijd te laag.`,
  },
  {
    match: /^This job takes your taxable income past €(\S+), so part of it is taxed in a higher bracket\. That is why the quote is higher than a flat percentage would suggest\.$/,
    nl: (threshold) =>
      `Deze opdracht brengt je belastbaar inkomen boven €${threshold}, dus een deel ervan wordt in een hogere schijf belast. Daarom ligt de prijs hoger dan een vast percentage zou suggereren.`,
  },
];

function applyPatterns(value: string, patterns: EnginePattern[]): string | null {
  for (const pattern of patterns) {
    const found = value.match(pattern.match);
    if (found) return pattern.nl(...found.slice(1));
  }
  return null;
}

/** Translates a breakdown line's label. Falls back to the engine's English. */
export function translateBreakdownLabel(
  locale: Locale,
  id: string,
  label: string
): string {
  if (locale === "en") return label;
  const notApplied = label.match(/^(.+) \(not applied\)$/);
  if (notApplied) {
    const base = NL_BREAKDOWN_LABELS[id] ?? notApplied[1];
    return `${base} (niet toegepast)`;
  }
  return (
    NL_BREAKDOWN_LABELS[id] ?? applyPatterns(label, NL_BREAKDOWN_PATTERNS) ?? label
  );
}

/** Translates a breakdown line's explanation. Falls back to English. */
export function translateBreakdownExplanation(
  locale: Locale,
  id: string,
  explanation: string
): string {
  if (locale === "en") return explanation;
  const byPattern = applyPatterns(explanation, NL_EXPLANATION_PATTERNS);
  if (byPattern) return byPattern;
  // The engine words `net-tax` two ways depending on whether wage tax applied.
  if (id === "net-tax" && explanation.includes("withheld")) {
    return NL_BREAKDOWN_EXPLANATIONS["net-tax-withheld"];
  }
  return NL_BREAKDOWN_EXPLANATIONS[id] ?? explanation;
}

/** Translates one assumption sentence. Falls back to English. */
export function translateAssumption(locale: Locale, assumption: string): string {
  if (locale === "en") return assumption;
  return (
    NL_ASSUMPTIONS[assumption] ??
    applyPatterns(assumption, NL_ASSUMPTION_PATTERNS) ??
    assumption
  );
}

/**
 * True when a breakdown line has a Dutch label. Used by the coverage test.
 *
 * Checked by presence rather than by difference, because several Dutch tax
 * terms (Zelfstandigenaftrek, Startersaftrek, MKB-winstvrijstelling) are
 * identical in both languages and a difference check would call them missing.
 */
export function hasBreakdownLabel(
  locale: Locale,
  id: string,
  label: string
): boolean {
  if (locale === "en") return true;
  if (NL_BREAKDOWN_LABELS[id] !== undefined) return true;
  // Bracket rows are generated per bracket, so they match a pattern instead.
  return applyPatterns(label, NL_BREAKDOWN_PATTERNS) !== null;
}

/** True when a breakdown id has a Dutch explanation. Used by the coverage test. */
export function hasBreakdownExplanation(
  locale: Locale,
  id: string,
  explanation: string
): boolean {
  if (locale === "en") return true;
  if (NL_BREAKDOWN_EXPLANATIONS[id] !== undefined) return true;
  return translateBreakdownExplanation(locale, id, explanation) !== explanation;
}

/** True when this locale has a translation. Used by the coverage test. */
export function hasEngineTranslation(locale: Locale, value: string): boolean {
  if (locale === "en") return true;
  return (
    NL_ASSUMPTIONS[value] !== undefined ||
    applyPatterns(value, NL_ASSUMPTION_PATTERNS) !== null
  );
}

export { NL_BREAKDOWN_LABELS, NL_BREAKDOWN_EXPLANATIONS };
