import { useState } from 'react';
import { calculate } from '../lib/calculate';
import { formatCurrency } from '../lib/format';

export default function Calculator() {
  const [balanceStr, setBalanceStr] = useState('');
  const [taxRatePercent, setTaxRatePercent] = useState(30);
  const [monthlyExpensesStr, setMonthlyExpensesStr] = useState('');
  const [runwayMonths, setRunwayMonths] = useState(3);

  const balance = parseFloat(balanceStr) || 0;
  const monthlyExpenses = parseFloat(monthlyExpensesStr) || 0;

  const result = calculate({ balance, taxRatePercent, monthlyExpenses, runwayMonths });

  const hasBalance = balanceStr.trim() !== '' && balance > 0;
  const hasExpenses = monthlyExpensesStr.trim() !== '' && monthlyExpenses > 0;
  const allInputsValid = hasBalance && hasExpenses;

  const displayBalance = hasBalance ? formatCurrency(balance) : '—';
  const displayTaxReserve = hasBalance ? formatCurrency(result.taxReserve) : '—';
  const displayRunwayBuffer = hasExpenses ? formatCurrency(result.runwayBuffer) : '—';
  const displaySafeToSpend = allInputsValid ? formatCurrency(result.safeToSpend) : '—';

  const sliderProgress = ((taxRatePercent - 15) / 35) * 100;

  return (
    <div className="mx-auto max-w-[480px] px-8 pt-16 pb-12">
      <div className="bg-[#F4F4F5] rounded-lg p-6">
        <h1 className="text-[20px] font-semibold leading-[1.2] text-[#18181B]">
          What's safe to spend?
        </h1>

        <div className="mt-6 flex flex-col gap-4">
          {/* Balance */}
          <div className="flex flex-col gap-2">
            <label htmlFor="balance" className="text-[14px] leading-[1.5] text-[#3F3F46]">
              Current balance
            </label>
            <input
              id="balance"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={balanceStr}
              onChange={(e) => setBalanceStr(e.target.value)}
              className="bg-white border border-[#E4E4E7] rounded-md p-4 text-[16px] text-[#3F3F46] focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
            />
          </div>

          {/* Tax rate slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="taxRate" className="text-[14px] leading-[1.5] text-[#3F3F46]">
                Tax rate
              </label>
              <span className="text-[14px] leading-[1.5] text-[#18181B] font-medium">
                {taxRatePercent}%
              </span>
            </div>
            <input
              id="taxRate"
              type="range"
              min={15}
              max={50}
              step={1}
              value={taxRatePercent}
              onChange={(e) => setTaxRatePercent(Number(e.target.value))}
              style={{ ['--range-progress' as string]: `${sliderProgress}%` }}
            />
            <p className="mt-1 text-[16px] leading-[1.5] text-[#3F3F46]">
              Typical Dutch ZZP'ers: 25–35% after deductions
            </p>
          </div>

          {/* Monthly expenses */}
          <div className="flex flex-col gap-2">
            <label htmlFor="monthlyExpenses" className="text-[14px] leading-[1.5] text-[#3F3F46]">
              Monthly expenses
            </label>
            <input
              id="monthlyExpenses"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={monthlyExpensesStr}
              onChange={(e) => setMonthlyExpensesStr(e.target.value)}
              className="bg-white border border-[#E4E4E7] rounded-md p-4 text-[16px] text-[#3F3F46] focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
            />
          </div>

          {/* Runway months */}
          <div className="flex flex-col gap-2">
            <label htmlFor="runwayMonths" className="text-[14px] leading-[1.5] text-[#3F3F46]">
              Runway (months)
            </label>
            <input
              id="runwayMonths"
              type="number"
              min={1}
              max={24}
              step={1}
              value={runwayMonths}
              onChange={(e) => setRunwayMonths(Number(e.target.value) || 0)}
              className="bg-white border border-[#E4E4E7] rounded-md p-4 text-[16px] text-[#3F3F46] w-24 focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-6 flex flex-col gap-2">
          <BreakdownRow label="Balance" value={displayBalance} computed={hasBalance} />
          <BreakdownRow
            label="Tax reserve"
            value={displayTaxReserve}
            computed={hasBalance}
            sublabel="Set aside in case your tax bill hits"
          />
          <BreakdownRow
            label="Runway buffer"
            value={displayRunwayBuffer}
            computed={hasExpenses}
            sublabel={`Covers ${runwayMonths} months if work goes quiet`}
          />

          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[14px] leading-[1.5] text-[#3F3F46]">Safe to spend</span>
            <span
              className={`text-[36px] font-semibold leading-[1.1] ${
                allInputsValid ? 'text-[#18181B]' : 'text-[#A1A1AA]'
              }`}
            >
              {displaySafeToSpend}
            </span>
          </div>

          {allInputsValid && result.isOverReserved && (
            <p className="mt-2 text-[14px] leading-[1.5] text-[#3F3F46]">
              Your tax reserve and runway buffer use up your full balance. Nothing left to spend freely.
            </p>
          )}
          <p className="mt-4 text-[16px] leading-[1.5] text-[#3F3F46]">
            This doesn't account for upcoming large expenses or invoices not yet in your balance.
          </p>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  computed,
  sublabel,
}: {
  label: string;
  value: string;
  computed: boolean;
  sublabel?: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-[14px] leading-[1.5] text-[#3F3F46]">{label}</span>
        {sublabel && (
          <span className="text-[13px] leading-[1.4] text-[#A1A1AA]">{sublabel}</span>
        )}
      </div>
      <span
        className={`text-[14px] leading-[1.5] ${computed ? 'text-[#3F3F46]' : 'text-[#A1A1AA]'}`}
      >
        {value}
      </span>
    </div>
  );
}
