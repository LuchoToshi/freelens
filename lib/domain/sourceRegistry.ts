/**
 * Registry of official Dutch government / Belastingdienst references behind the
 * tax and VAT concepts Freelens uses. Shown on /accuracy so users can check the
 * source. Only official government sources, never blogs.
 *
 * URL verification status is recorded in `verified`: true means the exact URL was
 * confirmed reachable on the official domain during implementation. All entries
 * are currently verified.
 */
export interface SourceEntry {
  id: string;
  title: string;
  url: string;
  category: "VAT" | "Income tax & Zvw" | "Deductions" | "Invoicing";
  notes: string;
  /** true when the exact URL was confirmed reachable during implementation. */
  verified: boolean;
}

export const SOURCE_REGISTRY: SourceEntry[] = [
  {
    id: "reserve-for-tax",
    title: "Filing your income tax return (Netherlands)",
    url: "https://business.gov.nl/finance-and-taxes/filing-tax-returns/filing-your-income-tax-return/",
    category: "Income tax & Zvw",
    notes:
      "Income tax is assessed annually on your total taxable profit, so setting part of each payment aside is a planning habit. Entrepreneurs are advised to reserve for income tax, national insurance and the Zvw contribution.",
    verified: true,
  },
  {
    id: "vat-rates",
    title: "VAT for resident businesses (rates and exemptions)",
    url: "https://business.gov.nl/regulation/vat/",
    category: "VAT",
    notes:
      "Covers the 21% and 9% rates, exemptions, and how VAT is calculated and filed.",
    verified: true,
  },
  {
    id: "kor",
    title: "Dutch small businesses scheme (KOR)",
    url: "https://business.gov.nl/subsidy/small-businesses-scheme/",
    category: "VAT",
    notes:
      "KOR participants do not charge VAT, do not file ordinary VAT returns, and cannot deduct input VAT while participating.",
    verified: true,
  },
  {
    id: "input-vat",
    title: "Deducting input VAT",
    url: "https://business.gov.nl/regulation/vat/",
    category: "VAT",
    notes:
      "The VAT you remit is the VAT you charged (output VAT) minus deductible input VAT on business costs, so the amount owed is usually less than the VAT collected. Covered on the official VAT page.",
    verified: true,
  },
  {
    id: "reverse-charge",
    title: "Reverse-charging VAT (btw verleggen)",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontenten/belastingdienst/business/vat/vat_in_the_netherlands/vat_relating_to_services/reverse-charging_vat",
    category: "VAT",
    notes:
      "When VAT is reverse-charged the customer accounts for it, so you charge no VAT and it is not ordinary output VAT to set aside.",
    verified: true,
  },
  {
    id: "zvw",
    title: "Income tax (IB) and healthcare insurance premium (Zvw)",
    url: "https://business.gov.nl/regulations/income-tax-healthcare-insurance-premium/",
    category: "Income tax & Zvw",
    notes:
      "The income-dependent Zvw contribution applies in addition to income tax and national insurance, up to a maximum contribution income.",
    verified: true,
  },
  {
    id: "zelfstandigenaftrek",
    title: "Private business ownership allowance (zelfstandigenaftrek)",
    url: "https://business.gov.nl/subsidy/private-business-ownership-allowance/",
    category: "Deductions",
    notes:
      "€1.200 for 2026 for qualifying entrepreneurs meeting the hours criterion who had not reached AOW age at the start of the year. Applied by the engine when you confirm the hours criterion.",
    verified: true,
  },
  {
    id: "mkb-exemption",
    title: "SME profit exemption (MKB-winstvrijstelling)",
    url: "https://business.gov.nl/subsidy/sme-profit-exemption/",
    category: "Deductions",
    notes:
      "12,70% of profit after entrepreneur deductions for 2026. Applied by the engine on every estimate, including in a loss year, where it makes the loss smaller.",
    verified: true,
  },
  {
    id: "invoice-system",
    title: "Invoice requirements (invoice system)",
    url: "https://business.gov.nl/regulation/invoice-requirements/",
    category: "Invoicing",
    notes:
      "Under the invoice system the VAT period is generally set by invoicing rules rather than when the customer pays.",
    verified: true,
  },
  {
    id: "cash-system",
    title: "Filing your VAT return (invoice vs cash system)",
    url: "https://business.gov.nl/running-your-business/business-taxes/filing-your-vat-return/",
    category: "Invoicing",
    notes:
      "Some qualifying businesses use the cash system, under which VAT follows receipts and payments rather than invoice dates.",
    verified: true,
  },
];
