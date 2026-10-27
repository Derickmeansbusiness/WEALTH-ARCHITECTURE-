import { useMemo, useState } from 'react';
import { Chip, Disclaimer, EmptyState, ErrorState, NumberField, Panel, SelectField, SliderField, useMoney } from '@/components/ui';
import { pct, ratio } from '@/lib/format';
import { useDebounced } from './shared/hooks';
import { BarChart, RadarChart } from './shared/Charts';
import ScenarioBar from './shared/ScenarioBar';
import Formulas, { type FormulaItem } from './shared/Formulas';
import { FxFootnote, Head, MoneyField, PctField } from './shared/Fields';
import { num } from './shared/util';
import { compareScenarios, DEFAULT_DECISION, PROFESSIONAL_QUESTIONS, radarDims, tradeoffs, validateDecision, type DecisionInputs, type ScenarioMetrics } from './math/decision';
import './shared/tools.css';

export interface DecisionScenarioData { tool: 'decision'; version: 1; inputs: DecisionInputs; scenarios: ScenarioMetrics[] }

const FORMULAS: FormulaItem[] = [
  { label: 'Loan (scenario)', formula: 'price × LTV', note: 'A = 0%, B and C as set.' },
  { label: 'Capital required', formula: 'equity + transaction costs + loan × borrowing cost %' },
  { label: 'Cash flow (year t)', formula: 'NOI_t − debt service', note: 'analyzeLeverage; NOI inflates from year 2.' },
  { label: 'Financing cost', formula: 'Σ interest over the hold' },
  { label: 'Projected equity return', formula: 'IRR[−capital, CF₁…CFₙ + exit equity] · cash-on-cash = CF₁ ÷ capital' },
  { label: 'Downside (value shock)', formula: 'equity after shock = exit value × (1 − shock) − loan balance at exit' },
  { label: 'Shock hit % of capital', formula: '(exit equity − shocked equity) ÷ capital required' },
  { label: 'Refinancing exposure', formula: 'loan balance at exit · LTV at exit · balloon at maturity' },
  { label: 'Resilience (stressed DSCR)', formula: 'NOI × (1 − income drop) ÷ debt service at (rate + bps)' },
  { label: 'Reserves for a 12-month vacancy', formula: '12 × (monthly expenses + monthly debt service)' },
];
const ASSUMPTIONS = [
  'Same asset, same operating assumptions, same hold in all three scenarios; only the financing changes.',
  'Monthly payments; lender fees as a percentage of the loan; no mortgage insurance, prepayment penalties or rate differences by LTV (real lenders price higher LTVs higher).',
  'Illustrative, pre-tax, before vacancy and capex unless included in expenses; no selling costs at exit.',
  'The verdict panel states tradeoffs. It does not — and this platform never will — recommend the most leveraged scenario by default.',
];

type Row = { label: string; get: (s: ScenarioMetrics) => number; fmt: (v: number) => string; better: 'high' | 'low' | 'none'; group: string };

export default function DecisionSimulator() {
  const [inputs, setInputs] = useState<DecisionInputs>(DEFAULT_DECISION);
  const fmt = useMoney();
  const d = useDebounced(inputs, 90);
  const errors = useMemo(() => validateDecision(d), [d]);
  const { scenarios, error } = useMemo(() => {
    if (errors.length) return { scenarios: null as ScenarioMetrics[] | null, error: null as string | null };
    try { return { scenarios: compareScenarios(d), error: null }; } catch (e) { return { scenarios: null, error: (e as Error).message }; }
  }, [d, errors]);
  const set = <K extends keyof DecisionInputs>(k: K, v: DecisionInputs[K]) => setInputs((s) => ({ ...s, [k]: v }));

  const rows: Row[] = [
    { group: 'Capital', label: 'Loan-to-value', get: (s) => s.ltv, fmt: (v) => pct(v, 0), better: 'none' },
    { group: 'Capital', label: 'Loan amount', get: (s) => s.loan, fmt: (v) => fmt(v), better: 'none' },
    { group: 'Capital', label: 'Capital required', get: (s) => s.capitalRequired, fmt: (v) => fmt(v), better: 'low' },
    { group: 'Cash flow', label: 'Investment cash flow · year 1', get: (s) => s.cashFlowY1, fmt: (v) => fmt(v), better: 'high' },
    { group: 'Cash flow', label: `Investment cash flow · total (${d.holdYears} yr)`, get: (s) => s.cashFlowTotal, fmt: (v) => fmt(v), better: 'high' },
    { group: 'Cash flow', label: 'Year-1 DSCR', get: (s) => s.dscrY1, fmt: (v) => ratio(v), better: 'high' },
    { group: 'Financing cost', label: 'Total interest over hold', get: (s) => s.totalInterest, fmt: (v) => fmt(v), better: 'low' },
    { group: 'Return', label: 'Projected equity return (IRR approx.)', get: (s) => s.irr, fmt: (v) => pct(v), better: 'high' },
    { group: 'Return', label: 'Cash-on-cash · year 1', get: (s) => s.coc, fmt: (v) => pct(v), better: 'high' },
    { group: 'Return', label: 'Equity multiple', get: (s) => s.equityMultiple, fmt: (v) => ratio(v), better: 'high' },
    { group: 'Downside', label: `Equity after −${pct(d.shockPct, 0)} value shock at exit`, get: (s) => s.equityAfterShock, fmt: (v) => fmt(v), better: 'high' },
    { group: 'Downside', label: 'Shock hit as % of capital', get: (s) => s.shockHitPctOfCapital, fmt: (v) => pct(v, 0), better: 'low' },
    { group: 'Refinancing', label: 'Loan balance at exit', get: (s) => s.balanceAtExit, fmt: (v) => fmt(v), better: 'low' },
    { group: 'Refinancing', label: 'LTV at exit', get: (s) => s.ltvAtExit, fmt: (v) => pct(v, 0), better: 'low' },
    { group: 'Refinancing', label: 'Balloon at maturity', get: (s) => s.balloon, fmt: (v) => fmt(v), better: 'low' },
    { group: 'Resilience', label: `DSCR under −${pct(d.stressIncomeDrop, 0)} income, +${d.stressBps} bps`, get: (s) => s.stressedDscr, fmt: (v) => ratio(v), better: 'high' },
    { group: 'Resilience', label: 'Reserves to survive a 12-month vacancy', get: (s) => s.reservesFor12moVacancy, fmt: (v) => fmt(v), better: 'low' },
    { group: 'Resilience', label: 'Months of cash flow to rebuild that reserve', get: (s) => s.monthsOfCashFlowToRebuild, fmt: (v) => (Number.isFinite(v) ? `${v.toFixed(0)} mo` : 'never (no surplus)'), better: 'low' },
  ];

  const data: DecisionScenarioData | null = scenarios ? { tool: 'decision', version: 1, inputs: d, scenarios } : null;
  const radar = scenarios ? radarDims(scenarios, d) : null;
  const trade = scenarios ? tradeoffs(scenarios) : [];

  return (
    <div className="dt-tool">
      <Head eyebrow="Tool 05 · Decision" title="Financing Decision Simulator" lede="One investment, three ways to pay for it. All equity, moderate leverage, aggressive leverage — side by side on capital, cash flow, financing cost, projected return, downside, refinancing exposure and resilience. The simulator will not pick for you; it will show you what each choice costs." />

      <ScenarioBar kind="decision" defaultName={`Decision · ${fmt(inputs.price, { compact: true })} · B ${pct(inputs.ltvB, 0)} / C ${pct(inputs.ltvC, 0)}`} data={data ?? { tool: 'decision', version: 1, inputs }}
        onLoad={(x) => { const s = x as Partial<DecisionScenarioData>; if (s?.inputs?.price) setInputs({ ...DEFAULT_DECISION, ...s.inputs }); }}
        report={() => ({
          title: 'Financing Decision — summary', tool: 'Financing Decision Simulator',
          inputs: [['Price', fmt(inputs.price)], ['Income / expenses', `${fmt(inputs.income)} / ${fmt(inputs.expenses)}`], ['Appreciation', pct(inputs.appreciation)], ['Rate · term · structure', `${pct(inputs.rate, 2)} · ${inputs.termYears} yr · ${inputs.structure}`], ['Hold', `${inputs.holdYears} yr`], ['Transaction costs', fmt(inputs.transactionCosts)], ['Borrowing costs', pct(inputs.borrowingCostPct)], ['LTV B / C', `${pct(inputs.ltvB, 0)} / ${pct(inputs.ltvC, 0)}`], ['Value shock', pct(inputs.shockPct, 0)], ['Stress', `−${pct(inputs.stressIncomeDrop, 0)} income, +${inputs.stressBps} bps`]].map(([label, value]) => ({ label, value })),
          outputs: scenarios ? rows.flatMap((r) => scenarios.map((s) => ({ label: `${r.label} · ${s.id}`, value: r.fmt(r.get(s)) }))) : [],
          formulas: FORMULAS, assumptions: ASSUMPTIONS, notes: [...trade.map((t) => `${t.scenario}: ${t.text}`), 'Questions a professional would ask:', ...PROFESSIONAL_QUESTIONS],
        })}
        compareFields={[{ label: 'Price', get: (x) => fmt(num(x, 'inputs.price')) }, { label: 'LTV B / C', get: (x) => `${pct(num(x, 'inputs.ltvB'), 0)} / ${pct(num(x, 'inputs.ltvC'), 0)}` }, { label: 'IRR A / B / C', get: (x) => ['0', '1', '2'].map((i) => pct(num(x, `scenarios.${i}.irr`))).join(' / ') }, { label: 'Stressed DSCR B / C', get: (x) => ['1', '2'].map((i) => ratio(num(x, `scenarios.${i}.stressedDscr`))).join(' / ') }, { label: 'Capital A / B / C', get: (x) => ['0', '1', '2'].map((i) => fmt(num(x, `scenarios.${i}.capitalRequired`), { compact: true })).join(' / ') }]}
      />

      <div className="dt-layout">
        <Panel tight className="dt-inputs">
          <div className="dt-inputs-group">
            <div className="eyebrow">The investment</div>
            <MoneyField label="Price" value={inputs.price} onChange={(v) => set('price', v)} step={10000} />
            <MoneyField label="Operating income (annual)" value={inputs.income} onChange={(v) => set('income', v)} step={1000} />
            <MoneyField label="Operating expenses (annual)" value={inputs.expenses} onChange={(v) => set('expenses', v)} step={1000} />
            <PctField label="Appreciation" value={inputs.appreciation} onChange={(v) => set('appreciation', v)} min={-30} max={30} step={0.5} />
            <PctField label="Inflation" value={inputs.inflation} onChange={(v) => set('inflation', v)} min={-5} max={30} step={0.5} />
            <MoneyField label="Transaction costs" value={inputs.transactionCosts} onChange={(v) => set('transactionCosts', v)} step={1000} />
            <SliderField label="Hold period" value={inputs.holdYears} min={1} max={30} step={1} format={(v) => `${v} yr`} onChange={(v) => set('holdYears', v)} />
          </div>
          <div className="dt-inputs-group">
            <div className="eyebrow">Financing</div>
            <PctField label="Interest rate" value={inputs.rate} onChange={(v) => set('rate', v)} min={0} max={60} step={0.05} />
            <NumberField label="Term" value={inputs.termYears} onChange={(v) => set('termYears', v)} min={1} max={50} suffix="yr" />
            <SelectField label="Structure" value={inputs.structure} onChange={(v) => set('structure', v)} options={[{ value: 'amortizing', label: 'Amortizing' }, { value: 'interest-only', label: 'Interest-only' }, { value: 'balloon', label: 'Balloon (term × 2 amortization)' }]} />
            <PctField label="Borrowing costs (% of loan)" value={inputs.borrowingCostPct} onChange={(v) => set('borrowingCostPct', v)} min={0} max={10} step={0.25} />
            <SliderField label="B · moderate leverage LTV" value={Math.round(inputs.ltvB * 100)} min={0} max={95} step={1} format={(v) => `${v}%`} onChange={(v) => set('ltvB', v / 100)} />
            <SliderField label="C · aggressive leverage LTV" value={Math.round(inputs.ltvC * 100)} min={0} max={95} step={1} format={(v) => `${v}%`} onChange={(v) => set('ltvC', v / 100)} />
          </div>
          <div className="dt-inputs-group">
            <div className="eyebrow">Downside & stress</div>
            <SliderField label="Value shock at exit" value={Math.round(inputs.shockPct * 100)} min={0} max={60} step={1} format={(v) => `−${v}%`} onChange={(v) => set('shockPct', v / 100)} />
            <SliderField label="Income drop under stress" value={Math.round(inputs.stressIncomeDrop * 100)} min={0} max={60} step={1} format={(v) => `−${v}%`} onChange={(v) => set('stressIncomeDrop', v / 100)} />
            <SliderField label="Rate rise under stress" value={inputs.stressBps} min={0} max={500} step={25} format={(v) => `+${v} bps`} onChange={(v) => set('stressBps', v)} />
          </div>
          {errors.length > 0 && <div className="stack" style={{ gap: 4 }}>{errors.map((e) => <div key={e} className="dt-invalid">{e}</div>)}</div>}
          <FxFootnote />
        </Panel>

        <div className="dt-results">
          {error && <ErrorState title="Could not compare scenarios" body={error} retry={() => setInputs(DEFAULT_DECISION)} />}
          {!error && !scenarios && <EmptyState title="Fix the highlighted inputs" body="The comparison appears as soon as the inputs are valid." />}
          {scenarios && radar && (
            <>
              <Panel>
                <div className="dt-chart-title">Side by side</div>
                <div className="table-wrap">
                  <table className="table dt-compare">
                    <thead><tr><th>Metric</th>{scenarios.map((s) => <th key={s.id} className="num">{s.label}<br /><span className="tiny muted">{pct(s.ltv, 0)} LTV</span></th>)}</tr></thead>
                    <tbody>
                      {rows.map((r, i) => {
                        const vals = scenarios.map((s) => r.get(s));
                        const finite = vals.map((v) => (Number.isFinite(v) ? v : r.better === 'high' ? 1e18 : 1e18));
                        const hi = Math.max(...finite), lo = Math.min(...finite);
                        const showGroup = i === 0 || rows[i - 1].group !== r.group;
                        return (
                          <tr key={r.label} className="fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                            <td>{showGroup && <div className="eyebrow" style={{ fontSize: '0.6rem', marginBottom: 2 }}>{r.group}</div>}{r.label}</td>
                            {vals.map((v, j) => {
                              const cls = r.better === 'none' || hi === lo ? '' : (r.better === 'high' ? finite[j] === hi : finite[j] === lo) ? 'best' : (r.better === 'high' ? finite[j] === lo : finite[j] === hi) ? 'worst' : '';
                              return <td key={j} className={`num ${cls}`}>{r.fmt(v)}</td>;
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="tiny muted" style={{ marginTop: 8 }}>Green/red mark the strongest and weakest value on each row — they are per-metric, not an overall ranking. Illustrative, pre-tax.</p>
              </Panel>

              <div className="grid grid-2">
                <Panel><BarChart title="Capital required vs equity at exit" groups={scenarios.map((s) => s.id)} series={[{ label: 'Capital required', color: 'gold', values: scenarios.map((s) => s.capitalRequired) }, { label: 'Equity at exit', color: 'green', values: scenarios.map((s) => s.equityAtExit) }, { label: `Equity after −${pct(d.shockPct, 0)} shock`, color: 'red', values: scenarios.map((s) => s.equityAfterShock) }]} yFormat={(v) => fmt(v, { compact: true })} height={220} /></Panel>
                <Panel><BarChart title="Cash flow and financing cost" groups={scenarios.map((s) => s.id)} series={[{ label: 'Year-1 cash flow', color: 'green', values: scenarios.map((s) => s.cashFlowY1) }, { label: 'Total cash flow', color: 'gold', values: scenarios.map((s) => s.cashFlowTotal) }, { label: 'Total interest', color: 'amber', values: scenarios.map((s) => s.totalInterest) }]} yFormat={(v) => fmt(v, { compact: true })} height={220} /></Panel>
                <Panel><BarChart title="Projected returns (illustrative)" groups={scenarios.map((s) => s.id)} series={[{ label: 'IRR approx. (%)', color: 'gold', values: scenarios.map((s) => s.irr * 100) }, { label: 'Cash-on-cash Y1 (%)', color: 'green', values: scenarios.map((s) => s.coc * 100) }]} yFormat={(v) => `${v.toFixed(1)}%`} height={220} /></Panel>
                <Panel><BarChart title="Resilience and refinancing exposure" groups={scenarios.map((s) => s.id)} series={[{ label: 'Year-1 DSCR (×)', color: 'green', values: scenarios.map((s) => (Number.isFinite(s.dscrY1) ? Math.min(s.dscrY1, 5) : 5)) }, { label: 'Stressed DSCR (×)', color: 'red', values: scenarios.map((s) => (Number.isFinite(s.stressedDscr) ? Math.min(s.stressedDscr, 5) : 5)) }, { label: 'LTV at exit (×0.01)', color: 'amber', values: scenarios.map((s) => s.ltvAtExit * 5) }]} yFormat={(v) => v.toFixed(1)} height={220} note="DSCR capped at 5× for the all-equity case (no debt service → infinite coverage). LTV at exit is scaled: 5.0 = 100%." /></Panel>
              </div>

              <div className="grid grid-2" style={{ alignItems: 'start' }}>
                <Panel>
                  <div className="dt-chart-title">Return vs risk dimensions (higher = stronger)</div>
                  <RadarChart axes={radar.axes} series={[{ label: 'A', color: 'ivory', values: radar.series[0].values }, { label: 'B', color: 'gold', values: radar.series[1].values }, { label: 'C', color: 'amber', values: radar.series[2].values }]} />
                  <p className="tiny muted">Each axis is normalised across the three scenarios. A larger shape is not "better" — look at which axes it gives up.</p>
                </Panel>
                <Panel tone="gold">
                  <div className="row between" style={{ marginBottom: 10 }}><div className="dt-chart-title" style={{ marginBottom: 0 }}>The tradeoffs, stated neutrally</div><Chip tone="gold">No recommendation</Chip></div>
                  <div className="stack" style={{ gap: 10 }}>
                    {trade.map((t) => <div key={t.scenario} className="dt-detail" style={{ borderColor: t.scenario === 'A' ? 'var(--ivory-3)' : t.scenario === 'B' ? 'var(--gold)' : 'var(--amber)' }}><strong>Scenario {t.scenario}</strong><p className="small muted" style={{ margin: '4px 0 0' }}>{t.text}</p></div>)}
                  </div>
                  <div className="hairline" style={{ margin: '16px 0' }} />
                  <div className="dt-chart-title">What a professional would ask before choosing</div>
                  <ol className="small muted" style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>{PROFESSIONAL_QUESTIONS.map((q) => <li key={q}>{q}</li>)}</ol>
                </Panel>
              </div>
            </>
          )}
        </div>
      </div>

      <Formulas items={FORMULAS} assumptions={ASSUMPTIONS} />
      <Disclaimer>Higher projected return and lower resilience arrive together; that is what leverage is. Which point on that line suits a family depends on its liquidity outside the asset, its other obligations, the recourse and covenants on offer, and how it would fund a bad year. Those are questions for the family and its advisers, not for a calculator.</Disclaimer>
    </div>
  );
}
