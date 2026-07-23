import { describe, it, expect } from "vitest";
import { toCents, addCents, sumCents, type Cents } from "./money";
import { resolvePaymentVat } from "./vat";
import {
  allocatePayment,
  evaluateWeeklyPosition,
  type PaymentAllocationInput,
  type WeeklyPositionInput,
} from "./allocation";

function conserves(result: {
  grossPaymentCents: Cents;
  vatComponentCents: Cents | null;
  reserveCents: Cents;
  obligationsCents: Cents;
  bufferCents: Cents;
  availableForPersonalPayoutCents: Cents;
}): boolean {
  const parts = addCents(
    result.vatComponentCents ?? (0 as Cents),
    result.reserveCents,
    result.obligationsCents,
    result.bufferCents,
    result.availableForPersonalPayoutCents
  );
  return parts === result.grossPaymentCents;
}

describe("allocatePayment, conservation of money", () => {
  const fixtures: PaymentAllocationInput[] = [
    {
      grossPaymentCents: toCents(4000),
      vat: resolvePaymentVat(toCents(4000), "21", true),
      reserve: { cents: toCents(850), source: "own-rule" },
      obligations: [{ label: "Software", cents: toCents(50) }],
      bufferCents: toCents(500),
    },
    {
      // Reserve larger than net payment → negative available cash, no clamping.
      grossPaymentCents: toCents(1000),
      vat: resolvePaymentVat(toCents(1000), "21", true),
      reserve: { cents: toCents(2000), source: "manual" },
      obligations: [],
      bufferCents: toCents(0),
    },
    {
      // Reverse-charged: no VAT separated, net === gross.
      grossPaymentCents: toCents(3000),
      vat: resolvePaymentVat(toCents(3000), "reverse-charged", true),
      reserve: { cents: toCents(900), source: "guided-estimate" },
      obligations: [
        { label: "Rent", cents: toCents(400) },
        { label: "Insurance", cents: toCents(100) },
      ],
      bufferCents: toCents(600),
    },
  ];

  for (const [i, input] of fixtures.entries()) {
    it(`fixture ${i} conserves gross across all buckets`, () => {
      const r = allocatePayment(input);
      expect(conserves(r)).toBe(true);
    });
  }

  it("reverse-charged leaves netExVat === gross and no VAT component", () => {
    const r = allocatePayment(fixtures[2]);
    expect(r.vatComponentCents).toBeNull();
    expect(r.netExVatCents).toBe(toCents(3000));
    expect(r.vatExplanation).toContain("not charged");
  });

  it("allows a negative personal payout without clamping", () => {
    const r = allocatePayment(fixtures[1]);
    expect(r.availableForPersonalPayoutCents).toBeLessThan(0);
  });
});

describe("evaluateWeeklyPosition, status + shortfall", () => {
  const base: WeeklyPositionInput = {
    currentBalanceCents: toCents(7000),
    vatProtectedCents: toCents(600),
    vatProtectedIsActual: true,
    reserveProtectedCents: toCents(1500),
    reserveSource: "own-rule",
    obligations: [{ label: "Upcoming", cents: toCents(500) }],
    bufferTargetCents: toCents(1400),
    essentialMonthlyCostsCents: toCents(1000),
  };

  it("reports reserves-covered with healthy room", () => {
    const r = evaluateWeeklyPosition(base);
    expect(r.status).toBe("reserves-covered");
    // 7000 − 600 − 1500 − 500 − 1400 = 3000 available.
    expect(r.availableForPersonalPayoutCents).toBe(toCents(3000));
  });

  it("reports limited-room when discretionary room is under a month of costs", () => {
    const r = evaluateWeeklyPosition({
      ...base,
      currentBalanceCents: toCents(4500), // available = 500 < 1000 monthly costs
    });
    expect(r.status).toBe("limited-room");
  });

  it("reports reserve-gap with the exact shortfall and priority", () => {
    const r = evaluateWeeklyPosition({
      ...base,
      currentBalanceCents: toCents(2000), // protected total = 4000
    });
    expect(r.status).toBe("reserve-gap");
    expect(r.shortfallCents).toBe(toCents(2000));
    // balance 2000 covers VAT 600 + reserve 1500 = 2100? no, cumulative VAT+reserve=2100 > 2000.
    expect(r.shortfallPriority).toBe("tax-reserve");
  });

  it("prioritises VAT when the balance can't even cover VAT", () => {
    const r = evaluateWeeklyPosition({
      ...base,
      currentBalanceCents: toCents(500),
    });
    expect(r.shortfallPriority).toBe("vat");
  });
});

describe("evaluateWeeklyPosition, completeness tiers", () => {
  it("quick-estimate with minimal data", () => {
    const r = evaluateWeeklyPosition({
      currentBalanceCents: toCents(5000),
      vatProtectedCents: toCents(0),
      vatProtectedIsActual: false,
      reserveProtectedCents: toCents(1000),
      reserveSource: "own-rule",
      obligations: [],
      bufferTargetCents: toCents(1000),
    });
    expect(r.completeness).toBe("quick-estimate");
  });
  it("improved-estimate with obligations or actual VAT", () => {
    const r = evaluateWeeklyPosition({
      currentBalanceCents: toCents(5000),
      vatProtectedCents: toCents(300),
      vatProtectedIsActual: true,
      reserveProtectedCents: toCents(1000),
      reserveSource: "own-rule",
      obligations: [],
      bufferTargetCents: toCents(1000),
    });
    expect(r.completeness).toBe("improved-estimate");
  });
  it("bookkeeping-based with actual VAT + provisional assessment", () => {
    const r = evaluateWeeklyPosition({
      currentBalanceCents: toCents(5000),
      vatProtectedCents: toCents(300),
      vatProtectedIsActual: true,
      reserveProtectedCents: toCents(1000),
      reserveSource: "provisional-assessment",
      obligations: [{ label: "x", cents: toCents(100) }],
      bufferTargetCents: toCents(1000),
      essentialMonthlyCostsCents: toCents(800),
    });
    expect(r.completeness).toBe("bookkeeping-based");
  });
});

describe("evaluateWeeklyPosition, optional spending room", () => {
  it("reduces optional room by a recommended payout target", () => {
    const r = evaluateWeeklyPosition({
      currentBalanceCents: toCents(5000),
      vatProtectedCents: toCents(0),
      vatProtectedIsActual: false,
      reserveProtectedCents: toCents(1000),
      reserveSource: "own-rule",
      obligations: [],
      bufferTargetCents: toCents(1000),
      recommendedPersonalPayoutCents: toCents(2000),
    });
    // available = 3000; optional room = 3000 − 2000 = 1000.
    expect(r.availableForPersonalPayoutCents).toBe(toCents(3000));
    expect(r.optionalSpendingRoomCents).toBe(toCents(1000));
  });
});

// Sanity: breakdown deltas reconcile to the final running total.
describe("breakdown reconciliation", () => {
  it("running totals match the sum of prior deltas", () => {
    const r = allocatePayment({
      grossPaymentCents: toCents(4000),
      vat: resolvePaymentVat(toCents(4000), "21", true),
      reserve: { cents: toCents(850), source: "own-rule" },
      obligations: [{ label: "x", cents: toCents(50) }],
      bufferCents: toCents(500),
    });
    const deltaSum = sumCents(r.breakdown.map((s) => s.deltaCents));
    const lastRunning = r.breakdown[r.breakdown.length - 1].runningTotalCents;
    expect(deltaSum).toBe(lastRunning);
  });
});
