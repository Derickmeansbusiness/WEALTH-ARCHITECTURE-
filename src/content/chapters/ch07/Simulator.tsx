import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildLoan, annualize, type LoanStructure, type PaymentFrequency } from '@/lib/finance';
import { pct } from '@/lib/format';
import { Panel, NumberField, SliderField, SelectField, Stat, Disclaimer, Callout, Chip, useMoney } from '@/components/ui';
import { mirroredPosition, foregoneInterestYearOne } from './mirror';

/** Compact family loan calculator with mirrored balance sheets and a below-market warning. */
export default function Simulator() {
  const fmt = useMoney();
  const [principal, setPrincipal] = useState(400_000);
  const [ratePct, setRatePct] = useState(4.5);
  const [afrPct, setAfrPct] = useState(4.4);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');
  const [structure, setStructure] = useState<LoanStructure>('amortizing');
  const [viewYear, setViewYear] = useState(3);

  const loan = useMemo(() => buildLoan({ principal, annualRate: ratePct / 100, termMonths: Math.max(1, years) * 12, structure, frequency, amortizationMonths: structure === 'balloon' ? Math.max(years, 1) * 12 * 3 : undefined }), [principal, ratePct, years, structure, frequency]);
  const annual = useMemo(() => annualize(loan.schedule, loan.periodsPerYear), [loan]);
  const yr = Math.min(Math.max(1, viewYear), Math.max(1, annual.length));
  const pos = mirroredPosition(loan, principal, yr * loan.periodsPerYear);
  const foregone = foregoneInterestYearOne(principal, ratePct / 100, afrPct / 100);
  const belowMarket = foregone > 0;
  const freqLabel = frequency === 'monthly' ? 'month' : frequency === 'quarterly' ? 'quarter' : 'year';

  return (
    <div className="stack" style={{ gap: 18 }}>
      <Panel>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow">Family loan calculator</div>
            <h3 style={{ margin: '4px 0 0' }}>Document the note, then check the rate</h3>
          </div>
          <Chip tone="amber">Not yet jurisdictionally verified</Chip>
        </div>
        <div className="grid grid-3" style={{ gap: 14 }}>
          <NumberField label="Principal" value={principal} onChange={setPrincipal} min={1000} step={5000} prefix="$" hint="Entered in USD; display follows your currency setting." />
          <NumberField label="Stated annual rate" value={ratePct} onChange={setRatePct} min={0} max={30} step={0.05} suffix="%" />
          <NumberField label="Illustrative AFR" value={afrPct} onChange={setAfrPct} min={0} max={30} step={0.05} suffix="%" hint="Enter the current applicable federal rate for this term from the IRS monthly revenue ruling. This field is not live data." />
          <NumberField label="Term" value={years} onChange={(v) => setYears(Math.max(1, Math.round(v)))} min={1} max={40} step={1} suffix="years" />
          <SelectField label="Payment frequency" value={frequency} onChange={setFrequency} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }, { value: 'annual', label: 'Annual' }]} />
          <SelectField label="Structure" value={structure} onChange={setStructure} options={[{ value: 'amortizing', label: 'Amortizing' }, { value: 'interest-only', label: 'Interest-only, bullet at maturity' }, { value: 'balloon', label: 'Balloon (payments sized on 3× term)' }]} />
        </div>
      </Panel>

      {belowMarket && (
        <Callout tone="amber" title="Below-market loan rules may apply">
          <p className="small" style={{ margin: 0 }}>
            The stated rate ({pct(ratePct / 100, 2)}) is below the AFR you entered ({pct(afrPct / 100, 2)}). Under IRC §7872 a gift loan at a below-market rate is treated as if the lender transferred the foregone interest to the borrower — roughly <strong>{fmt(foregone)}</strong> in year one on this balance — and the borrower paid it back as interest. That is a deemed gift to the borrower and deemed interest income to the lender. De minimis exceptions exist for aggregate loans of $10,000 or less, and gift loans of $100,000 or less are limited to the borrower\'s net investment income in some cases. Confirm the current AFR for the month the note is signed and the correct term bracket (short, mid or long).
          </p>
        </Callout>
      )}

      <div className="grid grid-4" style={{ gap: 12 }}>
        <Stat label={`Payment per ${freqLabel}`} value={fmt(loan.periodicPayment)} tone="gold" sub={structure === 'interest-only' ? 'interest only; principal due at maturity' : structure === 'balloon' ? `balloon ${fmt(loan.balloonBalance)} at maturity` : 'fully amortizing'} />
        <Stat label="Annual debt service" value={fmt(loan.annualDebtService)} />
        <Stat label="Total interest over term" value={fmt(loan.totalInterest)} tone="green" sub="income to lender · expense to borrower" />
        <Stat label="Total paid" value={fmt(loan.totalPaid)} sub={`${loan.totalPeriods} payments`} />
      </div>

      <Panel>
        <SliderField label="Balance sheets at end of year" value={yr} onChange={setViewYear} min={1} max={Math.max(1, annual.length)} step={1} format={(v) => `Year ${v}`} />
        <div className="grid grid-2" style={{ gap: 12, marginTop: 8 }}>
          <div className="ch07-bs">
            <h4>Family Bank · lender side</h4>
            <div className="line gold"><span className="k">Note receivable (outstanding)</span><span className="v">{fmt(pos.lender.note)}</span></div>
            <div className="line"><span className="k">Principal returned to date</span><span className="v">{fmt(pos.lender.principalRepaid)}</span></div>
            <div className="line green"><span className="k">Interest income, cumulative</span><span className="v">{fmt(pos.lender.interest)}</span></div>
            <div className="line green"><span className="k">Interest income, year {yr}</span><span className="v">{fmt(annual[yr - 1]?.interest ?? 0)}</span></div>
          </div>
          <div className="ch07-bs">
            <h4>Borrower side</h4>
            <div className="line red"><span className="k">Note payable (outstanding)</span><span className="v">{fmt(pos.borrower.note)}</span></div>
            <div className="line"><span className="k">Principal repaid to date</span><span className="v">{fmt(pos.borrower.principalRepaid)}</span></div>
            <div className="line red"><span className="k">Interest expense, cumulative</span><span className="v">{fmt(pos.borrower.interest)}</span></div>
            <div className="line red"><span className="k">Interest expense, year {yr}</span><span className="v">{fmt(annual[yr - 1]?.interest ?? 0)}</span></div>
          </div>
        </div>
        <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
          Whether the borrower can deduct that interest depends on what the loan funded: a recorded mortgage on a residence may be qualified residence interest under §163(h), business debt is deductible subject to §163(j), and personal consumption debt generally is not deductible at all. The lender reports interest income either way.
        </p>
      </Panel>

      <Callout title="Go deeper">
        <p className="small" style={{ margin: 0 }}>
          The full <Link to="/family-bank">Family Bank simulator</Link> models a lending entity with multiple borrowers, a loan committee, default scenarios and the gift-tax treatment of forgiven notes.
        </p>
      </Callout>

      <Panel tight>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Assumptions & formulas</div>
        <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Payments from <code className="mono">buildLoan</code>: amortizing uses the standard annuity formula PMT = P·r·(1+r)ⁿ / ((1+r)ⁿ − 1) with r = annual rate ÷ periods per year; interest-only pays P·r each period with principal at maturity; balloon sizes payments on an amortization of three times the term and pays the remaining balance at maturity.</li>
          <li>Each period's interest = opening balance × r; principal = payment − interest. Lender and borrower positions are the same schedule read from opposite sides.</li>
          <li>Foregone interest (year one) = principal × (AFR − stated rate) when the stated rate is lower; this is a simplified illustration of §7872, which actually computes foregone interest on the outstanding balance over each calendar year using the applicable AFR and compounding convention.</li>
          <li>The AFR field is user-entered. Rates are published monthly by the IRS and differ by term (short ≤ 3 years, mid 3–9 years, long over 9 years) and compounding period.</li>
          <li>Rate changes, prepayments, late payments, fees, state usury limits and currency conversions are not modelled.</li>
        </ul>
      </Panel>
      <Disclaimer>
        A family loan is respected only if it is a real loan: written note, market-tested rate, fixed maturity, payments actually made and recorded, and a lender who would enforce it. Whether interest is deductible, whether the loan is recharacterised as a gift or equity, and how a forgiveness is taxed all require review by a tax adviser before the note is signed.
      </Disclaimer>
    </div>
  );
}
