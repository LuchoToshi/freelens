/**
 * Registry of official Dutch government / Belastingdienst references behind the
 * tax and VAT concepts Freelens uses. Shown on /accuracy so users can check the
 * source. Only official government sources — never blogs.
 *
 * URL verification status is recorded in `verified`. Links marked false point at
 * a confirmed parent page and still need a dedicated deep link confirmed before
 * ship (see the final report's "items requiring review").
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
    title: "Reserve money to pay your taxes",
    url: "https://www.belastingdienst.nl/",
    category: "Income tax & Zvw",
    notes:
      "The Belastingdienst advises entrepreneurs to set aside part of their profit for income tax, national insurance and the Zvw contribution. Verify the specific guidance page.",
    verified: false,
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
      "VAT payable is not always all VAT collected — deductible input VAT can reduce the position. Covered on the VAT page; verify a dedicated page.",
    verified: false,
  },
  {
    id: "reverse-charge",
    title: "Reverse-charging VAT (btw verleggen)",
    url: "https://business.gov.nl/regulation/vat/",
    category: "VAT",
    notes:
      "Reverse-charged transactions are not ordinary VAT collected. Covered on the VAT page; verify a dedicated page.",
    verified: false,
  },
  {
    id: "zvw",
    title: "Income-dependent contribution (Zvw)",
    url: "https://www.belastingdienst.nl/",
    category: "Income tax & Zvw",
    notes:
      "The income-dependent Zvw contribution may apply in addition to income tax and national insurance, up to a maximum contribution income. Verify the specific 2026 rate page.",
    verified: false,
  },
  {
    id: "zelfstandigenaftrek",
    title: "Private business ownership allowance (zelfstandigenaftrek)",
    url: "https://business.gov.nl/subsidy/private-business-ownership-allowance/",
    category: "Deductions",
    notes:
      "€1,200 for 2026 for qualifying entrepreneurs meeting the hours criterion who had not reached AOW age at the start of the year. Informational in Freelens — not used in any calculation.",
    verified: true,
  },
  {
    id: "mkb-exemption",
    title: "SME profit exemption (MKB-winstvrijstelling)",
    url: "https://business.gov.nl/subsidy/sme-profit-exemption/",
    category: "Deductions",
    notes:
      "12.70% of profit after entrepreneur deductions for 2026. Informational in Freelens — not used in any calculation.",
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
      "Some qualifying businesses use the cash system, under which receipts are relevant. Verify the specific cash-system page.",
    verified: false,
  },
];
