import { useState } from 'react';
import { calculate } from '../lib/calculate';
import { formatCurrency } from '../lib/format';

export default function Calculator() {
  const [balanceStr, setBalanceStr] = useState('');
  const [taxRatePercent, setTaxRatePercent] = useState(37);
  const [monthlyExpensesStr, setMonthlyExpensesStr] = useState('');
  const [runwayMonths, setRunwayMonths] = useState(3);

  const balance = parseFloat(balanceStr.replace(',', '.')) || 0;
  const monthlyExpenses = parseFloat(monthlyExpensesStr.replace(',', '.')) || 0;

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
          Wat kan ik veilig uitgeven?
        </h1>

        <div className="mt-6 flex flex-col gap-4">
          {/* Balance */}
          <div className="flex flex-col gap-2">
            <label htmlFor="balance" className="text-[14px] leading-[1.5] text-[#3F3F46]">
              Huidig saldo
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#A1A1AA] select-none">€</span>
              <input
                id="balance"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={balanceStr}
                onChange={(e) => setBalanceStr(e.target.value)}
                className="bg-white border border-[#E4E4E7] rounded-md pl-8 pr-4 py-4 text-[16px] text-[#3F3F46] w-full focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
              />
            </div>
          </div>

          {/* Tax rate slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="taxRate" className="text-[14px] leading-[1.5] text-[#3F3F46]">
                Belastingtarief (IB)
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
              Typisch voor ZZP'ers: 25–45% na aftrekposten (MKB-winstvrijstelling, zelfstandigenaftrek)
            </p>
          </div>

          {/* Monthly expenses */}
          <div className="flex flex-col gap-2">
            <label htmlFor="monthlyExpenses" className="text-[14px] leading-[1.5] text-[#3F3F46]">
              Maandelijkse vaste lasten
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#A1A1AA] select-none">€</span>
              <input
                id="monthlyExpenses"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={monthlyExpensesStr}
                onChange={(e) => setMonthlyExpensesStr(e.target.value)}
                className="bg-white border border-[#E4E4E7] rounded-md pl-8 pr-4 py-4 text-[16px] text-[#3F3F46] w-full focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
              />
            </div>
          </div>

          {/* Runway months */}
          <div className="flex flex-col gap-2">
            <label htmlFor="runwayMonths" className="text-[14px] leading-[1.5] text-[#3F3F46]">
              Buffer (maanden)
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
          <BreakdownRow label="Saldo" value={displayBalance} computed={hasBalance} />
          <BreakdownRow
            label="Belastingreserve"
            value={displayTaxReserve}
            computed={hasBalance}
            sublabel="Opzij voor de inkomstenbelasting"
          />
          <BreakdownRow
            label="Maandenbuffer"
            value={displayRunwayBuffer}
            computed={hasExpenses}
            sublabel={`Dekt ${runwayMonths} maanden als opdrachten uitblijven`}
          />

          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[14px] leading-[1.5] text-[#3F3F46]">Veilig te besteden</span>
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
              Je belastingreserve en maandenbuffer verbruiken je volledige saldo. Niets over om vrij uit te geven.
            </p>
          )}
          <p className="mt-4 text-[16px] leading-[1.5] text-[#3F3F46]">
            Dit houdt geen rekening met grote aankomende uitgaven of facturen die nog niet op je rekening staan.
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
