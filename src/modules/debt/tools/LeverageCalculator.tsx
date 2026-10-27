import { useMemo, useState } from 'react';
import { Chip, Disclaimer, EmptyState, ErrorState, NumberField, Panel, SelectField, SliderField, Stat, Tabs, useMoney } from '@/components/ui';
import { annualize } from '@/lib/finance';
import { pct, ratio } from '@/lib/format';
import type { SavedScenario } from '@/store/useAppStore';
import { useDebounced, useTween } from './shared/hooks';
import { Gauge, LineChart, SegmentBar, StackedBarChart } from './shared/Charts';
import ScenarioBar from './shared/ScenarioBar';
import Formulas, { type FormulaItem } from './shared/Formulas';
import { FxFootnote, Head, MoneyField, PctField, WarningList } from './shared/Fields';
import { num, path } from './shared/util';
import { computeLeverage, DEFAULT_LEVERAGE, leverageWarnings, toLoanTerms, validateLeverage, type LeverageInputs, type LeverageMetrics } from './math/leverage';
import './shared/tools.css';

export interface LeverageScenarioData {
  tool: 'leverage';
  version: 1;
  inputs: LeverageInputs;
  loanTerms: ReturnType<typeof toLoanTerms>;
  outputs: {
    monthlyPayment: number; annualDebtService: number; interestOverHold: number; interestFullTerm: number; balanceAtHold: number; balloon: number;
    initialLtv: number; exitLtv: number; debtToEquity: number; cocY1: number; cocAvg: number; dscrY1: number; dscrMin: number; leveragedIrr: number; unleveredIrr: number; equityAtExit: number; totalCashFlow: number;
  };
}

const FORMULAS: FormulaItem[] = [
  { label: 'Monthly payment (amortizing)', formula: 'P × r(1+r)^n ÷ ((1+r)^n − 1)', note: 'r = annual rate ÷ 12, n = months. Interest-only: P × r. Balloon: amortizing payment sized on the amortization horizon.' },
  { label: 'Annual debt service', formula: 'monthly payment × 12' },
  { label: 'NOI', formula: 'operating income − operating expenses', note: 'Both grow with the inflation assumption from year 2.' },
  { label: 'Cash flow', formula: 'NOI − debt service', note: 'Pre-tax; vacancy and capex only if included in expenses.' },
  { label: 'LTV', formula: 'loan balance ÷ asset value' },
  { label: 'Debt-to-equity', formula: 'loan ÷ equity contribution' },
  { label: 'Cash-on-cash', formula: 'annual cash flow ÷ total equity in', note: 'Total equity in = equity + transaction costs + borrowing costs.' },
  { label: 'DSCR', formula: 'NOI ÷ annual debt service' },
  { label: 'Cap rate', formula: 'year-1 NOI ÷ price' },
  { label: 'Loan constant', formula: 'annual debt service ÷ loan' },
  { label: 'Negative leverage', formula: 'cap rate < loan constant', note: 'Each borrowed dollar costs more in debt service than it earns in NOI.' },
  { label: 'Asset value (year t)', formula: 'price × (1 + appreciation)^t' },
  { label: 'Equity (year t)', formula: 'asset value − loan balance' },
  { label: 'Leveraged IRR (approx.)', formula: 'IRR[−equity in, CF₁ … CFₙ + exit equity]', note: 'Bisection on the annual series. No taxes, no selling costs.' },
  { label: 'Unlevered IRR (approx.)', formula: 'IRR[−(price + transaction costs), NOI₁ … NOIₙ + exit value]' },
];

const ASSUMPTIONS = [
  'Monthly payments; schedule from @/lib/finance buildLoan; year t balance = balance after 12t payments.',
  'Appreciation compounds annually from the purchase price; income and expenses inflate from year 2.',
  'Transaction and lender costs are paid from equity at closing and are not financed.',
  'Returns are illustrative, pre-tax, before vacancy and capital expenditure unless you include them in expenses. No selling costs at exit.',
  'If the hold period runs past the loan maturity, the balloon is paid out of that year\'s cash flow — which is what would happen without a refinancing.',
];

export default function LeverageCalculator() {
  const [inputs, setInputs] = useState<LeverageInputs>(DEFAULT_LEVERAGE);
  const [scheduleTab, setScheduleTab] = useState<'months' | 'years'>('months');
  const fmt = useMoney();
  const debounced = useDebounced(inputs, 90);
  const errors = useMemo(() => validateLeverage(debounced), [debounced]);
  const { metrics, error } = useMemo(() => {
    if (errors.length) return { metrics: null as LeverageMetrics | null, error: null as string | null };
    try { return { metrics: computeLeverage(debounced), error: null }; } catch (e) { return { metrics: null, error: (e as Error).message }; }
  }, [debounced, errors]);
  const warnings = useMemo(() => (metrics ? leverageWarnings(debounced, metrics) : []), [debounced, metrics]);

  const set = <K extends keyof LeverageInputs>(k: K, v: LeverageInputs[K]) => setInputs((s) => ({ ...s, [k]: v }));
  const setPrice = (price: number) => setInputs((s) => ({ ...s, price, loan: Math.max(0, price - s.equity) }));
  const setEquity = (equity: number) => setInputs((s) => ({ ...s, equity, loan: Math.max(0, s.price - equity) }));
  const setLoan = (loan: number) => setInputs((s) => ({ ...s, loan, equity: Math.max(0, s.price - loan) }));

  const data: LeverageScenarioData | null = metrics ? {
    tool: 'leverage', version: 1, inputs: debounced, loanTerms: toLoanTerms(debounced),
    outputs: { monthlyPayment: metrics.monthlyPayment, annualDebtService: metrics.annualDebtService, interestOverHold: metrics.interestOverHold, interestFullTerm: metrics.interestFullTerm, balanceAtHold: metrics.balanceAtHold, balloon: metrics.balloon, initialLtv: metrics.initialLtv, exitLtv: metrics.exitLtv, debtToEquity: metrics.debtToEquity, cocY1: metrics.cocY1, cocAvg: metrics.cocAvg, dscrY1: metrics.dscrY1, dscrMin: metrics.dscrMin, leveragedIrr: metrics.leveragedIrr, unleveredIrr: metrics.unleveredIrr, equityAtExit: metrics.equityAtExit, totalCashFlow: metrics.totalCashFlow },
  } : null;

  const onLoad = (d: unknown) => {
    const x = d as Partial<LeverageScenarioData>;
    if (x && x.inputs && typeof x.inputs.price === 'number') setInputs({ ...DEFAULT_LEVERAGE, ...x.inputs });
  };

  const costs = inputs.transactionCosts + inputs.borrowingCosts;
  const years = metrics?.result.years ?? [];
  const fullAnnual = metrics ? annualize(metrics.result.loan.schedule, 12) : [];
  const equityNow = useTween(metrics?.equityAtExit ?? 0);

  return (
    <div className="dt-tool">
      <Head eyebrow="Tool 01 · Leverage" title="Leverage Calculator" lede="Borrow against an income-producing asset and watch what the debt does to cash flow, coverage and equity over the hold. Every number below is illustrative, pre-tax, and before vacancy or capital expenditure unless you include them in expenses." />

      <ScenarioBar
        kind="leverage" defaultName={`Leverage · ${fmt(inputs.price, { compact: true })} @ ${pct(inputs.loan / Math.max(1, inputs.price), 0)} LTV`} data={data ?? { tool: 'leverage', version: 1, inputs }}
        onLoad={onLoad}
        report={() => ({
          title: 'Leverage Calculator — summary', tool: 'Leverage Calculator',
          inputs: [
            ['Purchase price', fmt(inputs.price)], ['Equity', fmt(inputs.equity)], ['Loan', fmt(inputs.loan)], ['Rate', pct(inputs.rate, 2)], ['Tenure', `${inputs.termYears} years`], ['Structure', inputs.structure + (inputs.structure === 'balloon' ? ` (${inputs.amortYears}-yr amortization)` : '')],
            ['Appreciation', pct(inputs.appreciation)], ['Operating income', fmt(inputs.income)], ['Operating expenses', fmt(inputs.expenses)], ['Inflation', pct(inputs.inflation)], ['Transaction costs', fmt(inputs.transactionCosts)], ['Borrowing costs', fmt(inputs.borrowingCosts)], ['Hold', `${inputs.holdYears} years`],
          ].map(([label, value]) => ({ label, value })),
          outputs: metrics ? [
            ['Monthly payment', fmt(metrics.monthlyPayment)], ['Annual debt service', fmt(metrics.annualDebtService)], ['Interest over hold', fmt(metrics.interestOverHold)], ['Interest over full term', fmt(metrics.interestFullTerm)],
            ['Balance at end of hold', fmt(metrics.balanceAtHold)], ['Balloon at maturity', fmt(metrics.balloon)], ['LTV initial / exit', `${pct(metrics.initialLtv)} / ${pct(metrics.exitLtv)}`], ['Debt-to-equity', ratio(metrics.debtToEquity)],
            ['Cash-on-cash Y1 / avg', `${pct(metrics.cocY1)} / ${pct(metrics.cocAvg)}`], ['DSCR Y1 / min', `${ratio(metrics.dscrY1)} / ${ratio(metrics.dscrMin)}`], ['Cap rate vs loan constant', `${pct(metrics.capRate, 2)} vs ${pct(metrics.loanConstant, 2)}`],
            ['Leveraged IRR (approx.)', pct(metrics.leveragedIrr)], ['Unlevered IRR (approx.)', pct(metrics.unleveredIrr)], ['Equity at exit', fmt(metrics.equityAtExit)],
          ].map(([label, value]) => ({ label, value })) : [],
          formulas: FORMULAS, assumptions: ASSUMPTIONS, notes: warnings.map((w) => `${w.level.toUpperCase()}: ${w.title}`),
        })}
        compareFields={[
          { label: 'Price', get: (d) => fmt(num(d, 'inputs.price')) }, { label: 'LTV', get: (d) => pct(num(d, 'outputs.initialLtv')) }, { label: 'Rate', get: (d) => pct(num(d, 'inputs.rate'), 2) }, { label: 'Structure', get: (d) => String(path(d, 'inputs.structure') ?? '—') },
          { label: 'Monthly payment', get: (d) => fmt(num(d, 'outputs.monthlyPayment')) }, { label: 'DSCR Y1', get: (d) => ratio(num(d, 'outputs.dscrY1')) }, { label: 'Cash-on-cash Y1', get: (d) => pct(num(d, 'outputs.cocY1')) },
          { label: 'Leveraged IRR', get: (d) => pct(num(d, 'outputs.leveragedIrr')) }, { label: 'Unlevered IRR', get: (d) => pct(num(d, 'outputs.unleveredIrr')) }, { label: 'Balloon', get: (d) => fmt(num(d, 'outputs.balloon')) }, { label: 'Equity at exit', get: (d) => fmt(num(d, 'outputs.equityAtExit')) },
        ]}
      />

      <div className="dt-layout">
        <Panel tight className="dt-inputs">
          <div className="dt-inputs-group">
            <div className="eyebrow">Asset & capital</div>
            <MoneyField label="Asset purchase price" value={inputs.price} onChange={setPrice} step={10000} />
            <MoneyField label="Initial equity contribution" value={inputs.equity} onChange={setEquity} step={10000} />
            <MoneyField label="Loan amount" value={inputs.loan} onChange={setLoan} step={10000} hint={<span>auto = price − equity · LTV <b className="gold mono">{pct(inputs.loan / Math.max(1, inputs.price))}</b></span>} />
            <SliderField label="Loan-to-value" value={Math.round((inputs.loan / Math.max(1, inputs.price)) * 100)} min={0} max={95} step={1} format={(v) => `${v}%`} onChange={(v) => setLoan(Math.round((inputs.price * v) / 100))} />
          </div>
          <div className="dt-inputs-group">
            <div className="eyebrow">Loan terms</div>
            <PctField label="Interest rate" value={inputs.rate} onChange={(v) => set('rate', v)} min={0} max={60} step={0.05} />
            <NumberField label="Loan tenure" value={inputs.termYears} onChange={(v) => set('termYears', v)} min={1} max={50} suffix="years" />
            <SelectField label="Loan structure" value={inputs.structure} onChange={(v) => set('structure', v)} options={[{ value: 'amortizing', label: 'Amortizing (fully repaid over tenure)' }, { value: 'interest-only', label: 'Interest-only (principal due at maturity)' }, { value: 'balloon', label: 'Balloon (partial amortization, balance due at maturity)' }]} />
            {inputs.structure === 'balloon' && <NumberField label="Amortization horizon" value={inputs.amortYears} onChange={(v) => set('amortYears', v)} min={1} max={40} suffix="years" hint="Payment is sized as if the loan ran this long" />}
            <MoneyField label="Additional borrowing costs" value={inputs.borrowingCosts} onChange={(v) => set('borrowingCosts', v)} step={500} hint="Lender fees, points, valuation, legal" />
          </div>
          <div className="dt-inputs-group">
            <div className="eyebrow">Operations & market</div>
            <MoneyField label="Operating income (annual)" value={inputs.income} onChange={(v) => set('income', v)} step={1000} />
            <MoneyField label="Operating expenses (annual)" value={inputs.expenses} onChange={(v) => set('expenses', v)} step={1000} />
            <PctField label="Expected annual appreciation" value={inputs.appreciation} onChange={(v) => set('appreciation', v)} min={-30} max={30} step={0.5} hint="Can be negative" />
            <PctField label="Inflation assumption" value={inputs.inflation} onChange={(v) => set('inflation', v)} min={-5} max={30} step={0.5} />
            <MoneyField label="Transaction costs" value={inputs.transactionCosts} onChange={(v) => set('transactionCosts', v)} step={1000} />
            <SliderField label="Hold period" value={inputs.holdYears} min={1} max={30} step={1} format={(v) => `${v} yr`} onChange={(v) => set('holdYears', v)} />
          </div>
          {errors.length > 0 && <div className="stack" style={{ gap: 4 }}>{errors.map((e) => <div key={e} className="dt-invalid">{e}</div>)}</div>}
          <FxFootnote />
        </Panel>

        <div className="dt-results">
          {error && <ErrorState title="Could not compute this scenario" body={error} retry={() => setInputs(DEFAULT_LEVERAGE)} />}
          {!error && !metrics && <EmptyState title="Fix the highlighted inputs" body="Results appear as soon as the inputs are valid." />}
          {metrics && (
            <>
              <div className="dt-stats">
                <Stat label="Monthly payment" value={fmt(metrics.monthlyPayment)} sub={`${fmt(metrics.annualDebtService)} / year`} tone="gold" />
                <Stat label="LTV initial → exit" value={`${pct(metrics.initialLtv, 0)} → ${pct(metrics.exitLtv, 0)}`} sub={`Debt-to-equity ${ratio(metrics.debtToEquity)}`} tone={metrics.initialLtv > 0.8 ? 'red' : metrics.initialLtv > 0.75 ? 'amber' : undefined} />
                <Stat label="DSCR year 1 · min" value={`${ratio(metrics.dscrY1)} · ${ratio(metrics.dscrMin)}`} sub={metrics.dscrY1 < 1 ? 'Cash flow does not cover debt service' : metrics.dscrY1 < 1.2 ? 'Thin coverage' : 'Covered'} tone={metrics.dscrY1 < 1 ? 'red' : metrics.dscrY1 < 1.2 ? 'amber' : 'green'} />
                <Stat label="Cash-on-cash Y1 · avg" value={`${pct(metrics.cocY1)} · ${pct(metrics.cocAvg)}`} sub={`Year-1 cash flow ${fmt(years[0]?.cashFlow ?? 0)}`} tone={metrics.cocY1 < 0 ? 'red' : undefined} />
                <Stat label="Leveraged return (IRR approx.)" value={pct(metrics.leveragedIrr)} sub={`Unlevered ${pct(metrics.unleveredIrr)} · ${metrics.leveragedIrr >= metrics.unleveredIrr ? 'leverage adds' : 'leverage subtracts'}`} tone={metrics.leveragedIrr >= metrics.unleveredIrr ? 'green' : 'amber'} />
                <Stat label="Total interest · hold / term" value={fmt(metrics.interestOverHold, { compact: true })} sub={`${fmt(metrics.interestFullTerm, { compact: true })} over the full term`} />
                <Stat label="Balance at end of hold" value={fmt(metrics.balanceAtHold)} sub={`Equity at exit ${fmt(equityNow)} · ${ratio(metrics.equityMultiple)} multiple`} />
                <Stat label="Cap rate vs loan constant" value={`${pct(metrics.capRate, 2)} vs ${pct(metrics.loanConstant, 2)}`} sub={metrics.negativeLeverage ? 'Negative leverage' : inputs.loan > 0 ? 'Positive leverage' : 'No debt'} tone={metrics.negativeLeverage ? 'amber' : inputs.loan > 0 ? 'green' : undefined} />
              </div>
              <p className="tiny muted" style={{ margin: 0 }}>Illustrative, pre-tax, before vacancy/capex unless included in expenses. Not a lending offer or valuation.</p>

              <Panel>
                <div className="dt-chart-title">Sources & uses at closing</div>
                <SegmentBar tall segments={[{ label: 'Equity', value: inputs.equity, color: 'gold' }, { label: 'Debt', value: inputs.loan, color: 'amber' }, { label: 'Costs (from equity)', value: costs, color: 'ivory' }]} format={(v) => fmt(v)} />
                <p className="tiny muted" style={{ marginTop: 8 }}>Uses: price {fmt(inputs.price)} + costs {fmt(costs)} = {fmt(inputs.price + costs)}. Sources: equity {fmt(inputs.equity + costs)} + debt {fmt(inputs.loan)}.</p>
              </Panel>

              {inputs.structure !== 'amortizing' && metrics.balloon > 0 && (
                <Panel tone={inputs.holdYears >= inputs.termYears ? 'danger' : 'warn'}>
                  <div className="row between" style={{ alignItems: 'flex-start' }}>
                    <div>
                      <div className="dt-big-label">Outstanding principal due at maturity (year {metrics.balloonYear})</div>
                      <div className={`dt-big ${inputs.holdYears >= inputs.termYears ? 'red' : 'amber'}`}>{fmt(metrics.balloon)}</div>
                      <p className="small muted" style={{ marginTop: 8, marginBottom: 0 }}>{pct(metrics.balloon / Math.max(1, inputs.loan), 0)} of the original loan is still owed when the term ends. {inputs.holdYears >= inputs.termYears ? 'This falls inside your hold period: a refinancing, sale or equity injection is required.' : 'Your planned exit comes first — but a delayed sale runs into this payment.'}</p>
                    </div>
                    <Chip tone={inputs.holdYears >= inputs.termYears ? 'red' : 'amber'}>{inputs.holdYears >= inputs.termYears ? 'Refinancing required' : 'Maturity after exit'}</Chip>
                  </div>
                </Panel>
              )}

              <Panel>
                <LineChart title="Equity growth over the hold" labels={years.map((y) => `Y${y.year}`)} series={[
                  { id: 'value', label: 'Asset value', values: years.map((y) => y.assetValue), color: 'ivory' },
                  { id: 'loan', label: 'Loan balance', values: years.map((y) => y.loanBalance), color: 'amber' },
                  { id: 'equity', label: 'Equity', values: years.map((y) => y.equity), color: 'gold', area: true },
                ]} yFormat={(v) => fmt(v, { compact: true })} note="Equity = asset value − loan balance. Appreciation does the heavy lifting; amortization does the slow work." />
              </Panel>

              <div className="grid grid-2">
                <Panel>
                  <div className="dt-chart-title">Debt service coverage (year 1)</div>
                  <Gauge value={metrics.dscrY1} min={0} max={3} bands={[{ to: 1, color: 'red' }, { to: 1.25, color: 'amber' }, { to: 3, color: 'green' }]} label="DSCR" format={(v) => (Number.isFinite(v) ? `${v.toFixed(2)}×` : '∞')} marker={{ value: 1.2, label: 'typ. covenant' }} />
                  <p className="tiny muted center">Below 1.0× the owner funds the lender. Many lenders underwrite to ≥ 1.20–1.25×.</p>
                </Panel>
                <Panel>
                  <StackedBarChart title={`Amortization — interest vs principal (full ${inputs.termYears}-year term)`} categories={fullAnnual.map((y) => `Y${y.year}`)} series={[
                    { label: 'Interest', color: 'amber', values: fullAnnual.map((y) => y.interest) },
                    { label: 'Principal', color: 'green', values: fullAnnual.map((y) => y.principal) },
                  ]} yFormat={(v) => fmt(v, { compact: true })} height={220} highlight={(i) => i < inputs.holdYears} note="Shaded years are inside your hold. Early payments are mostly interest; the mix inverts late in the term." />
                </Panel>
              </div>

              <Panel>
                <div className="dt-chart-title">Net annual cash flow by year</div>
                <div className="table-wrap">
                  <table className="table">
                    <thead><tr><th>Year</th><th className="num">Asset value</th><th className="num">NOI</th><th className="num">Debt service</th><th className="num">Interest</th><th className="num">Principal</th><th className="num">Cash flow</th><th className="num">Loan balance</th><th className="num">Equity</th><th className="num">DSCR</th><th className="num">LTV</th></tr></thead>
                    <tbody>
                      {years.map((y) => (
                        <tr key={y.year}>
                          <td className="mono">{y.year}</td><td className="num">{fmt(y.assetValue)}</td><td className="num">{fmt(y.noi)}</td><td className="num">{fmt(y.debtService)}</td><td className="num">{fmt(y.interest)}</td><td className="num">{fmt(y.principalPaid)}</td>
                          <td className="num" style={{ color: y.cashFlow < 0 ? '#e7a398' : 'var(--green-2)' }}>{fmt(y.cashFlow)}</td><td className="num">{fmt(y.loanBalance)}</td><td className="num">{fmt(y.equity)}</td>
                          <td className="num" style={{ color: y.dscr < 1 ? '#e7a398' : undefined }}>{ratio(y.dscr)}</td><td className="num">{pct(y.ltv, 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel>
                <div className="dt-tabrow">
                  <div className="dt-chart-title" style={{ marginBottom: 0 }}>Payment schedule</div>
                  <Tabs size="sm" value={scheduleTab} onChange={setScheduleTab} tabs={[{ id: 'months', label: 'First 12 months' }, { id: 'years', label: 'Annual (full term)' }]} />
                </div>
                <div className="table-wrap" style={{ marginTop: 12 }}>
                  {inputs.loan <= 0 ? <EmptyState title="No loan" body="All-equity purchase — there is no schedule." /> : scheduleTab === 'months' ? (
                    <table className="table">
                      <thead><tr><th>Month</th><th className="num">Payment</th><th className="num">Interest</th><th className="num">Principal</th><th className="num">Balance</th></tr></thead>
                      <tbody>{metrics.result.loan.schedule.slice(0, 12).map((r) => <tr key={r.period}><td className="mono">{r.period}</td><td className="num">{fmt(r.payment, { decimals: 2 })}</td><td className="num">{fmt(r.interest, { decimals: 2 })}</td><td className="num">{fmt(r.principal, { decimals: 2 })}</td><td className="num">{fmt(r.balance)}</td></tr>)}</tbody>
                    </table>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Year</th><th className="num">Payments</th><th className="num">Interest</th><th className="num">Principal</th><th className="num">Ending balance</th></tr></thead>
                      <tbody>{fullAnnual.map((r) => <tr key={r.year} style={{ opacity: r.year <= inputs.holdYears ? 1 : 0.6 }}><td className="mono">{r.year}</td><td className="num">{fmt(r.payment)}</td><td className="num">{fmt(r.interest)}</td><td className="num">{fmt(r.principal)}</td><td className="num">{fmt(r.balance)}</td></tr>)}</tbody>
                    </table>
                  )}
                </div>
              </Panel>

              <Panel>
                <div className="dt-chart-title">Warnings</div>
                <WarningList items={warnings} />
                <p className="tiny muted" style={{ marginTop: 10 }}>Any red warning is the point at which a professional review — lender, counsel, tax adviser — would ordinarily be required before proceeding.</p>
              </Panel>
            </>
          )}
        </div>
      </div>

      <Formulas items={FORMULAS} assumptions={ASSUMPTIONS} />
      <Disclaimer>Leverage magnifies outcomes in both directions. The projections above depend entirely on the appreciation, income and rate assumptions you entered; none is guaranteed. Debt is a financing instrument, not a tax strategy — interest deductibility, depreciation and gain treatment depend on the borrower entity and jurisdiction and require professional review.</Disclaimer>
    </div>
  );
}
