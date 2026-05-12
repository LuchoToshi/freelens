import { useState } from 'react';
import { calculate } from '../lib/calculate';
import { formatCurrency } from '../lib/format';

export default function Calculator() {
  const [balanceStr, setBalanceStr] = useState('');
  const [taxRatePercent, setTaxRatePercent] = useState(30);
  const [monthlyExpensesStr, setMonthlyExpensesStr] = useState('');
  const [runwayStr, setRunwayStr] = useState('3');

  const [touched, setTouched] = useState({
    balance: false,
    monthlyExpenses: false,
    runway: false,
  });

  const balance = parseFloat(balanceStr.replace(',', '.')) || 0;
  const monthlyExpenses = parseFloat(monthlyExpensesStr.replace(',', '.')) || 0;
  const runwayMonths = parseInt(runwayStr, 10) || 0;

  const errors = {
    balance: touched.balance && balance < 0 ? 'Vul een positief saldo in' : null,
    monthlyExpenses: touched.monthlyExpenses && monthlyExpenses < 0 ? 'Vul een positief bedrag in' : null,
    runway: touched.runway && runwayMonths < 1 ? 'Voer minimaal 1 maand buffer in' : null,
  };

  const taxWarning =
    taxRatePercent < 20
      ? 'Onder 20% dek je waarschijnlijk niet je volledige belasting. Vergeet ZVW niet — dat komt bovenop je inkomstenbelasting.'
      : null;

  const result = calculate({ balance, taxRatePercent, monthlyExpenses, runwayMonths });

  const hasBalance = balanceStr.trim() !== '' && balance > 0;
  const hasExpenses = monthlyExpensesStr.trim() !== '' && monthlyExpenses > 0;
  const allInputsValid = hasBalance && hasExpenses;

  const displayBalance = hasBalance ? formatCurrency(balance) : '—';
  const displayTaxReserve = hasBalance ? formatCurrency(result.taxReserve) : '—';
  const displayRunwayBuffer = hasExpenses ? formatCurrency(result.runwayBuffer) : '—';
  const displaySafeToSpend = allInputsValid ? formatCurrency(result.safeToSpend) : '—';

  const sliderProgress = ((taxRatePercent - 15) / 35) * 100;

  const explanation =
    'We kijken naar je huidige saldo, zetten wat opzij voor belasting en maken een buffer voor onverwachte uitgaven. Wat over blijft, is wat je rustig kunt uitgeven.';

  return (
    <div className="mx-auto max-w-[480px] px-6 pt-12 pb-14">
      <div className="bg-[#F4F4F5] rounded-lg p-8">
        <h1 className="text-[24px] font-medium leading-[1.15] text-[#18181B] mb-6">
          Wat kan ik veilig uitgeven?
        </h1>

        <p className="text-[15px] leading-[1.6] text-[#3F3F46] mb-6">
          {explanation}
        </p>

        <div className="flex flex-col gap-5">
          {/* Balance */}
          <div className="flex flex-col gap-2">
            <label htmlFor="balance" className="text-[14px] leading-[1.5] text-[#3F3F46]">
              Huidig saldo op je rekening
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#A1A1AA] select-none">
                €
              </span>
              <input
                id="balance"
                type="text"
                inputMode="decimal"
                placeholder="Bijv. 12500"
                value={balanceStr}
                onChange={(e) => setBalanceStr(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, balance: true }))}
                className="bg-white border border-[#E4E4E7] rounded-md pl-8 pr-4 py-4 text-[16px] text-[#3F3F46] w-full focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
              />
            </div>
            {errors.balance && (
              <p className="text-[13px] leading-[1.4] text-red-500">{errors.balance}</p>
            )}
          </div>

          {/* Tax rate slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="taxRate" className="text-[14px] leading-[1.5] text-[#3F3F46]">
                Belastingreserve (IB + ZVW)
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
              Vuistregel: zet 30% opzij. Dat dekt IB én ZVW voor de meeste ZZP'ers. Verdien je
              meer dan €70k? Zet dan iets extra weg.
            </p>
            {taxWarning && (
              <p className="text-[13px] leading-[1.4] text-[#A1A1AA]">{taxWarning}</p>
            )}
          </div>

          {/* Monthly expenses */}
          <div className="flex flex-col gap-2">
            <label htmlFor="monthlyExpenses" className="text-[14px] leading-[1.5] text-[#3F3F46]">
              Vaste lasten per maand
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#A1A1AA] select-none">
                €
              </span>
              <input
                id="monthlyExpenses"
                type="text"
                inputMode="decimal"
                placeholder="Bijv. 2000"
                value={monthlyExpensesStr}
                onChange={(e) => setMonthlyExpensesStr(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, monthlyExpenses: true }))}
                className="bg-white border border-[#E4E4E7] rounded-md pl-8 pr-4 py-4 text-[16px] text-[#3F3F46] w-full focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
              />
              {errors.monthlyExpenses && (
                <p className="text-[13px] leading-[1.4] text-red-500">{errors.monthlyExpenses}</p>
              )}
            </div>
          </div>

          {/* Runway months */}
          <div className="flex flex-col gap-2">
            <label htmlFor="runwayMonths" className="text-[14px] leading-[1.5] text-[#3F3F46]">
              Buffer (maanden)
            </label>
            <input
              id="runwayMonths"
              type="text"
              inputMode="numeric"
              placeholder="Bijv. 3"
              value={runwayStr}
              onChange={(e) => setRunwayStr(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => setTouched((prev) => ({ ...prev, runway: true }))}
              className="bg-white border border-[#E4E4E7] rounded-md p-4 text-[16px] text-[#3F3F46] w-full focus:outline-2 focus:outline-[#18181B] focus:outline-offset-2"
            />
            {errors.runway && (
              <p className="text-[13px] leading-[1.4] text-red-500">{errors.runway}</p>
            )}
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-8 pt-6 border-t border-[#E4E4E7]">
          <div className="flex flex-col gap-3 text-[15px]">
            <BreakdownRow label="Huidig saldo" value={displayBalance} computed={hasBalance} />
            <BreakdownRow
              label="Belastingreserve"
              value={displayTaxReserve}
              computed={hasBalance}
              sublabel="IB + ZVW — staat klaar als de aanslag komt"
            />
            <BreakdownRow
              label="Rustiggeld"
              value={displayRunwayBuffer}
              computed={hasExpenses}
              sublabel={`${runwayMonths} ${runwayMonths === 1 ? 'maand' : 'maanden'} als het even rustig is`}
            />

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[14px] leading-[1.5] text-[#3F3F46]">Wat je rustig kunt uitgeven</span>
              <span
                className={`text-[36px] font-semibold leading-[1.1] ${
                  allInputsValid ? 'text-[#18181B]' : 'text-[#A1A1AA]'
                }`}
              >
                {displaySafeToSpend}
              </span>
            </div>

            {allInputsValid && result.isOverReserved && (
              <p className="mt-3 text-[15px] leading-[1.6] text-[#3F3F46]">
                Je saldo is volledig gereserveerd voor belasting en buffer. Er is op dit moment
                niets vrij te besteden — dat is tijdelijk.
              </p>
            )}
            {allInputsValid && !result.isOverReserved && result.safeToSpend > 0 && (
              <p className="mt-3 text-[15px] leading-[1.6] text-[#3F3F46]">
                Dat is wat er overblijft na je belastingreserve en buffer. Veilig om uit te geven
                of te investeren.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 text-[13px] leading-[1.5] text-[#A1A1AA]">
          Dit rekent niet met grote aankomende uitgaven of facturen die nog niet op je rekening
          staan. Heb je btw-geld in je saldo zitten dat je nog moet afdragen? Reken dat dan niet
          mee.
        </div>

        <div className="mt-6 text-center">
          <a
            href="mailto:marmots-blinks2m@icloud.com?subject=Freelens feedback"
            className="text-[13px] text-[#A1A1AA] hover:text-[#3F3F46] transition-colors"
          >
            Feedback? Laat het weten →
          </a>
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
        <span className="text-[14px] leading-[1.5] text-[#18181B]">{label}</span>
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
