import { describe, expect, it } from "vitest";
import { formatEuro } from "@/lib/domain/money";
import {
  EXAMPLE,
  examplePaymentSplit,
  exampleQuoteSplit,
} from "@/lib/domain/exampleScenario";

describe("the site's worked example", () => {
  it("conserves the payment: every cent has exactly one job", () => {
    const s = examplePaymentSplit();
    expect(s.vat + s.reserve + s.business + s.yours).toBe(s.gross);
  });

  it("conserves the quote: fee = costs + tax + what's left", () => {
    const q = exampleQuoteSplit();
    expect(q.jobCosts + q.tax + q.yours).toBe(q.fee);
  });

  it("charges btw on top of the fee, never out of it", () => {
    const q = exampleQuoteSplit();
    expect(q.invoiceTotal).toBe(q.fee + q.vat);
  });

  it("reports the share held back, not the marginal rate", () => {
    const s = examplePaymentSplit();
    // The hero used to print the marginal rate (39,1%) beside a reserve worth
    // 13% of the payment. Whatever this says must match the reserve shown.
    const actual = (s.reserve / (s.gross - s.vat)) * 100;
    expect(s.reserveSharePercent).toBeCloseTo(actual, 1);
  });

  it("prints the canonical figures", () => {
    const s = examplePaymentSplit();
    const q = exampleQuoteSplit();
    console.log("PAYMENT", {
      gross: formatEuro(s.gross),
      vat: formatEuro(s.vat),
      reserve: formatEuro(s.reserve),
      business: formatEuro(s.business),
      yours: formatEuro(s.yours),
      sharePct: s.reserveSharePercent,
    });
    console.log("QUOTE", {
      fee: formatEuro(q.fee),
      vat: formatEuro(q.vat),
      invoice: formatEuro(q.invoiceTotal),
      tax: formatEuro(q.tax),
      yours: formatEuro(q.yours),
      keptPct: q.keptSharePercent,
    });
    expect(EXAMPLE.annualProfit).toBe(40_000);
  });
});
