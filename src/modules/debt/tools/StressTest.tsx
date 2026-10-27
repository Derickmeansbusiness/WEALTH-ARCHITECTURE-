import { useMemo, useState } from 'react';
import { Chip, Disclaimer, EmptyState, ErrorState, NumberField, Panel, SelectField, SliderField, Stat, useMoney } from '@/components/ui';
import { pct, ratio } from '@/lib/format';
import { useAppStore, type SavedScenario } from '@/store/useAppStore';
import { useDebounced, useTween } from './shared/hooks';
import { Gauge, SegmentBar, WaterfallChart } from './shared/Charts';
import ScenarioBar from './shared/ScenarioBar';
import Formulas, { type FormulaItem } from './shared/Formulas';
import { FxFootnote, Head, MoneyField, PctField, WarningList } from './shared/Fields';
import { num } from './shared/util';
import { DEFAULT_STRESS_BASE, NO_SHOCKS, runStress, validateStressBase, type Light, type StressBase, type StressResult, type StressShocks } from './math/stress';
import type { LeverageScenarioData } from './LeverageCalculator';
import './shared/tools.css';

export interface StressScenarioData {
  tool: 'stress'; version: 1; base: StressBase; shocks: StressShocks;
  outputs: { dscr: number; ltv: number; equity: number; runwayMonths: number; annualCashFlow: number; balloonDue: number; refiGap: number; lights: StressResult['lights'] };
}

const FORMULAS: FormulaItem[] = [
  { label: 'Stressed value', formula: 'value × (1 − value drop)' },
  { label: 'Loan balance today', formula: 'schedule balance after (years elapsed × 12) payments', note: 'buildLoan schedule; interest-only stays at principal.' },
  { label: 'Equity', formula: 'stressed value − loan balance' },
  { label: 'LTV', formula: 'loan balance ÷ stressed value' },
  { label: 'Stressed rate', formula: 'rate + (bps ÷ 10,000) × floating share', note: 'Fixed-rate portion is unaffected.' },
  { label: 'Stressed debt service', formula: 'payment on current balance at stressed rate over remaining term', note: 'Approximates a floating-rate reset.' },
  { label: 'Income', formula: '(rental × (1 − rental drop) + business × (1 − revenue drop)) − default loss' },
  { label: 'Default loss', formula: 'gross income × share lost × months ÷ 12' },
  { label: 'Expenses', formula: 'base expenses × (1 + opex increase)' },
  { label: 'DSCR', formula: 'NOI ÷ stressed debt service' },
  { label: 'Monthly cash flow', formula: '(NOI − debt service) ÷ 12' },
  { label: 'Liquidity runway', formula: 'liquidity ÷ |monthly shortfall|', note: '∞ when cash flow is non-negative.' },
  { label: 'Max refinancing loan', formula: 'stressed value × max LTV covenant' },
  { label: 'Refinancing gap', formula: 'max(0, balloon due − max refinancing loan)' },
  { label: 'Acceleration shortfall', formula: 'max(0, loan balance − liquidity)' },
];
const ASSUMPTIONS = [
  'Shocks are applied simultaneously and instantaneously to a single year; real downturns unfold over time, which is both better (time to react) and worse (compounding).',
  'Covenant levels (minimum DSCR, maximum LTV) are illustrative inputs — real covenants are set in the loan agreement and may be tested quarterly, annually or on revaluation.',
  'Rate shocks hit only the floating share. Caps, swaps and fixed periods would change this.',
  'Liquidity = cash reserves + other liquid assets; no haircut for forced-sale discounts.',
  'Refinancing feasibility is LTV-based only. A new lender would also test DSCR, sponsor credit and market appetite.',
];

type Legal = { title: string; body: string; verified: boolean };
const LEGAL: Record<'US' | 'UAE' | 'CEMAC' | 'UK', { intro: string; items: Legal[] }> = {
  US: {
    intro: 'Loan documents govern. The sequence is usually: event of default (payment or covenant) → notice and any cure period → acceleration → enforcement against collateral and guarantors. Timelines are state-specific.',
    items: [
      { title: 'Acceleration after an event of default', body: 'A covenant breach (DSCR, LTV) is typically an event of default even when payments are current. Acceleration clauses let the lender declare the whole balance due after any cure period in the documents.', verified: true },
      { title: 'Foreclosure or receivership', body: 'Real estate enforcement is judicial in some states (often a year or more) and non-judicial under a deed of trust in others (months). Commercial lenders frequently seek a receiver to take over rents in the meantime.', verified: true },
      { title: 'Deficiency and guarantor pursuit', body: 'Whether the lender can pursue the borrower for a shortfall after sale depends on state anti-deficiency rules and whether the loan is recourse. "Non-recourse" CRE loans usually carry carve-out guarantees that become full recourse on specified bad acts (e.g. unauthorised transfers, bankruptcy filing).', verified: false },
      { title: 'Cross-default', body: 'A default on one facility can trigger defaults on other facilities with the same lender or under a family guarantee, pulling unrelated assets into the enforcement.', verified: true },
      { title: 'Bankruptcy stay', body: 'A bankruptcy filing imposes an automatic stay on enforcement (11 U.S.C. §362), buying time but at the cost of control and, for guarantors, often triggering carve-out liability.', verified: false },
    ],
  },
  UAE: {
    intro: 'Enforcement in the UAE runs through the courts (onshore) or the DIFC/ADGM courts for financial-centre contracts. Procedures and timelines differ by emirate and by the type of security.',
    items: [
      { title: 'Registered mortgage enforcement', body: 'Real-estate mortgages registered with the land department are enforced through court execution and public auction. Dubai has a specific mortgage law governing the process; other emirates follow their own procedures.', verified: false },
      { title: 'Personal guarantees and security cheques', body: 'Lenders commonly take personal guarantees from shareholders. Post-dated security cheques were historically a central enforcement tool; recent reforms have narrowed criminal liability for bounced cheques and moved most cases to civil enforcement.', verified: false },
      { title: 'Credit bureau reporting', body: 'Defaults are reported to Al Etihad Credit Bureau, affecting future access to credit across the UAE banking system.', verified: true },
      { title: 'Insolvency and restructuring', body: 'A federal bankruptcy framework provides preventive composition and restructuring routes for companies; a separate personal insolvency law exists for individuals. Directors face duties once insolvency is likely.', verified: false },
      { title: 'Travel and enforcement measures', body: 'Court-ordered measures against debtors (including travel bans) have been used in enforcement; availability and practice continue to evolve.', verified: false },
    ],
  },
  CEMAC: {
    intro: 'In the CEMAC states (Cameroon, Chad, Central African Republic, Congo, Equatorial Guinea, Gabon) secured lending and enforcement are governed by the OHADA Uniform Acts, applied by national courts; banks are supervised by COBAC under the BEAC.',
    items: [
      { title: 'OHADA Uniform Act on Securities', body: 'Mortgages (hypothèques), pledges and personal guarantees (cautionnement) are created and ranked under the Uniform Act on Securities. Registration at the RCCM determines priority and enforceability against third parties.', verified: false },
      { title: 'Simplified recovery and enforcement', body: 'The Uniform Act on Simplified Recovery Procedures and Enforcement Measures sets out injunctions to pay, seizures and the forced sale of mortgaged property through the courts; timelines vary widely by country and court.', verified: false },
      { title: 'Collective proceedings', body: 'Insolvent companies fall under the Uniform Act on Collective Proceedings (conciliation, preventive settlement, judicial reorganisation, liquidation), which suspends individual enforcement actions.', verified: false },
      { title: 'Guarantor pursuit', body: 'A guarantor can usually be pursued once the debtor is in default; whether the lender must exhaust the debtor\'s assets first depends on whether the guarantee is joint and several (solidaire).', verified: false },
      { title: 'Centrale des Risques', body: 'Bank exposures and incidents are reported to the BEAC central credit register, which other banks consult before lending.', verified: false },
    ],
  },
  UK: {
    intro: 'English law gives secured lenders strong self-help remedies. The documents define events of default; enforcement is often out of court.',
    items: [
      { title: 'LPA receivers and fixed charges', body: 'A mortgagee can appoint a receiver under the Law of Property Act 1925 to collect rents and sell the property without a court order, once the power of sale has arisen and become exercisable.', verified: true },
      { title: 'Administration under a qualifying floating charge', body: 'A lender holding a qualifying floating charge over a company can appoint an administrator out of court under the Insolvency Act 1986, Schedule B1; a moratorium then protects the company from other creditors.', verified: true },
      { title: 'Guarantees on demand', body: 'Personal and corporate guarantees are usually payable on demand once the principal debtor defaults; cross-guarantees across group companies spread one default across the family\'s entities.', verified: true },
      { title: 'Cross-default and material adverse change', body: 'Facility agreements commonly include cross-default and MAC clauses that let a lender act on deterioration elsewhere in the group.', verified: true },
      { title: 'Director duties near insolvency', body: 'Once insolvency is probable, directors must prioritise creditors\' interests; continuing to trade can expose them to personal liability for wrongful trading.', verified: false },
    ],
  },
};

const LIGHT_LABELS: { key: keyof StressResult['lights']; label: string; detail: (r: StressResult, b: StressBase) => string }[] = [
  { key: 'coversPayments', label: 'Cash flow covers contractual payments?', detail: (r) => `NOI ${Math.round(r.noi).toLocaleString('en-US')} vs debt service ${Math.round(r.annualDebtService).toLocaleString('en-US')}` },
  { key: 'withinLtv', label: 'Within LTV covenant?', detail: (r, b) => `${pct(r.ltv, 0)} vs max ${pct(b.maxLtv, 0)}` },
  { key: 'withinDscr', label: 'Within DSCR covenant?', detail: (r, b) => `${ratio(r.dscr)} vs min ${b.minDscr.toFixed(2)}×` },
  { key: 'runway12', label: 'Liquidity runway ≥ 12 months?', detail: (r) => (Number.isFinite(r.runwayMonths) ? `${r.runwayMonths.toFixed(1)} months` : 'no shortfall') },
  { key: 'refiFeasible', label: 'Refinancing feasible at stressed LTV?', detail: (r) => (r.balloonDue === 0 ? 'no maturity wall (fully amortizing)' : `balloon ${Math.round(r.balloonDue).toLocaleString('en-US')} vs max loan ${Math.round(r.maxRefiLoan).toLocaleString('en-US')}`) },
];

export default function StressTest() {
  const [base, setBase] = useState<StressBase>(DEFAULT_STRESS_BASE);
  const [shocks, setShocks] = useState<StressShocks>(NO_SHOCKS);
  const jurisdiction = useAppStore((s) => s.jurisdictionMode);
  const fmt = useMoney();
  const dBase = useDebounced(base, 90);
  const errors = useMemo(() => validateStressBase(dBase), [dBase]);
  const { result, error } = useMemo(() => {
    if (errors.length) return { result: null as StressResult | null, error: null as string | null };
    try { return { result: runStress(dBase, shocks), error: null }; } catch (e) { return { result: null, error: (e as Error).message }; }
  }, [dBase, shocks, errors]);
  const baseline = useMemo(() => (errors.length ? null : runStress(dBase, NO_SHOCKS)), [dBase, errors]);

  const setB = <K extends keyof StressBase>(k: K, v: StressBase[K]) => setBase((s) => ({ ...s, [k]: v }));
  const setS = <K extends keyof StressShocks>(k: K, v: StressShocks[K]) => setShocks((s) => ({ ...s, [k]: v }));

  const importLeverage = (sc: SavedScenario) => {
    const d = sc.data as Partial<LeverageScenarioData>;
    const i = d?.inputs;
    if (!i) return;
    setBase((s) => ({ ...s, value: i.price, principal: i.loan, rate: i.rate, termYears: i.termYears, structure: i.structure, amortYears: i.structure === 'balloon' ? i.amortYears : Math.max(i.termYears, 25), yearsElapsed: 0, rentalIncome: i.income, businessIncome: 0, expenses: i.expenses }));
    setShocks(NO_SHOCKS);
  };

  const data: StressScenarioData | null = result ? { tool: 'stress', version: 1, base: dBase, shocks, outputs: { dscr: result.dscr, ltv: result.ltv, equity: result.equity, runwayMonths: result.runwayMonths, annualCashFlow: result.annualCashFlow, balloonDue: result.balloonDue, refiGap: result.refiGap, lights: result.lights } } : null;

  const runway = useTween(result ? (Number.isFinite(result.runwayMonths) ? Math.min(result.runwayMonths, 240) : 240) : 0);
  const equityAnim = useTween(result?.equity ?? 0);
  const activeShocks = Object.entries(shocks).filter(([k, v]) => (typeof v === 'boolean' ? v : v > 0) && k !== 'tenantDefaultMonths').length;
  const legal = LEGAL[jurisdiction];

  return (
    <div className="dt-tool">
      <Head eyebrow="Tool 02 · Stress" title="Debt Stress-Test Engine" lede="Take a financed position and break it on purpose. Value falls, income shrinks, rates rise, a tenant stops paying, the bank will not roll the loan. The arithmetic tells you what breaks; the law — which differs by jurisdiction — tells you what happens next." />

      <ScenarioBar kind="stress" defaultName={`Stress · ${activeShocks} shock${activeShocks === 1 ? '' : 's'} on ${fmt(base.value, { compact: true })}`} data={data ?? { tool: 'stress', version: 1, base, shocks }}
        importKinds={['leverage']} onImport={importLeverage}
        onLoad={(d) => { const x = d as Partial<StressScenarioData>; if (x?.base) setBase({ ...DEFAULT_STRESS_BASE, ...x.base }); if (x?.shocks) setShocks({ ...NO_SHOCKS, ...x.shocks }); }}
        report={() => ({
          title: 'Debt Stress-Test — summary', tool: 'Stress-Test Engine',
          inputs: [
            ['Value', fmt(base.value)], ['Loan principal', fmt(base.principal)], ['Rate', pct(base.rate, 2)], ['Term', `${base.termYears} yr ${base.structure}`], ['Years elapsed', String(base.yearsElapsed)], ['Rental income', fmt(base.rentalIncome)], ['Business income', fmt(base.businessIncome)], ['Operating expenses', fmt(base.expenses)], ['Reserves + other liquidity', fmt(base.reserves + base.otherLiquidity)], ['Floating share', pct(base.floatingShare, 0)], ['Covenants', `min DSCR ${base.minDscr}× · max LTV ${pct(base.maxLtv, 0)}`],
            ['Shocks', `value −${pct(shocks.valueDrop, 0)}, rent −${pct(shocks.rentalDrop, 0)}, revenue −${pct(shocks.revenueDrop, 0)}, +${shocks.rateBps} bps, opex +${pct(shocks.opexIncrease, 0)}, default ${pct(shocks.tenantDefaultShare, 0)} × ${shocks.tenantDefaultMonths} mo${shocks.refinanceRefused ? ', refinancing refused' : ''}${shocks.acceleration ? ', acceleration' : ''}`],
          ].map(([label, value]) => ({ label, value })),
          outputs: result ? [
            ['Stressed value', fmt(result.value)], ['Loan balance', fmt(result.loanBalance)], ['Equity', fmt(result.equity)], ['LTV', pct(result.ltv)], ['Stressed rate', pct(result.stressedRate, 2)], ['Debt service', fmt(result.annualDebtService)], ['NOI', fmt(result.noi)], ['DSCR', ratio(result.dscr)], ['Annual cash flow', fmt(result.annualCashFlow)], ['Runway', Number.isFinite(result.runwayMonths) ? `${result.runwayMonths.toFixed(1)} months` : 'no shortfall'], ['Balloon due', fmt(result.balloonDue)], ['Refinancing gap', fmt(result.refiGap)], ['Acceleration shortfall', fmt(result.accelerationShortfall)],
            ...LIGHT_LABELS.map((l) => [l.label, result.lights[l.key].toUpperCase()]),
          ].map(([label, value]) => ({ label, value })) : [],
          formulas: FORMULAS, assumptions: ASSUMPTIONS, notes: result ? [result.narrative, ...result.warnings.map((w) => `${w.level.toUpperCase()}: ${w.title}`)] : [],
        })}
        compareFields={[
          { label: 'Value drop', get: (d) => pct(num(d, 'shocks.valueDrop'), 0) }, { label: 'Rate shock', get: (d) => `+${num(d, 'shocks.rateBps')} bps` }, { label: 'DSCR', get: (d) => ratio(num(d, 'outputs.dscr')) }, { label: 'LTV', get: (d) => pct(num(d, 'outputs.ltv')) }, { label: 'Equity', get: (d) => fmt(num(d, 'outputs.equity')) },
          { label: 'Runway', get: (d) => { const v = num(d, 'outputs.runwayMonths'); return Number.isFinite(v) ? `${v.toFixed(1)} mo` : Number.isNaN(v) ? '—' : 'no shortfall'; } }, { label: 'Annual cash flow', get: (d) => fmt(num(d, 'outputs.annualCashFlow')) }, { label: 'Refinancing gap', get: (d) => fmt(num(d, 'outputs.refiGap')) },
        ]}
      />

      <div className="dt-layout">
        <Panel tight className="dt-inputs">
          <div className="dt-inputs-group">
            <div className="eyebrow">Base case</div>
            <MoneyField label="Property / business value" value={base.value} onChange={(v) => setB('value', v)} step={10000} />
            <MoneyField label="Loan principal (original)" value={base.principal} onChange={(v) => setB('principal', v)} step={10000} />
            <PctField label="Interest rate" value={base.rate} onChange={(v) => setB('rate', v)} min={0} max={60} step={0.05} />
            <div className="grid grid-2" style={{ gap: 8 }}>
              <NumberField label="Term" value={base.termYears} onChange={(v) => setB('termYears', v)} min={1} max={50} suffix="yr" />
              <NumberField label="Years elapsed" value={base.yearsElapsed} onChange={(v) => setB('yearsElapsed', v)} min={0} max={49} step={0.5} suffix="yr" />
            </div>
            <SelectField label="Structure" value={base.structure} onChange={(v) => setB('structure', v)} options={[{ value: 'amortizing', label: 'Amortizing' }, { value: 'interest-only', label: 'Interest-only' }, { value: 'balloon', label: 'Balloon' }]} />
            {base.structure === 'balloon' && <NumberField label="Amortization horizon" value={base.amortYears} onChange={(v) => setB('amortYears', v)} min={1} max={40} suffix="yr" />}
            <SliderField label="Floating-rate share" value={Math.round(base.floatingShare * 100)} min={0} max={100} step={5} format={(v) => `${v}%`} onChange={(v) => setB('floatingShare', v / 100)} />
          </div>
          <div className="dt-inputs-group">
            <div className="eyebrow">Income, expenses, liquidity</div>
            <MoneyField label="Rental income (annual)" value={base.rentalIncome} onChange={(v) => setB('rentalIncome', v)} step={1000} />
            <MoneyField label="Business income (annual)" value={base.businessIncome} onChange={(v) => setB('businessIncome', v)} step={1000} />
            <MoneyField label="Operating expenses (annual)" value={base.expenses} onChange={(v) => setB('expenses', v)} step={1000} />
            <MoneyField label="Cash reserves" value={base.reserves} onChange={(v) => setB('reserves', v)} step={5000} />
            <MoneyField label="Other liquidity" value={base.otherLiquidity} onChange={(v) => setB('otherLiquidity', v)} step={5000} hint="Liquid securities, undrawn lines" />
          </div>
          <div className="dt-inputs-group">
            <div className="row between"><div className="eyebrow">Covenants</div><Chip tone="amber">Illustrative</Chip></div>
            <NumberField label="Minimum DSCR" value={base.minDscr} onChange={(v) => setB('minDscr', v)} min={0.5} max={3} step={0.05} suffix="×" />
            <PctField label="Maximum LTV" value={base.maxLtv} onChange={(v) => setB('maxLtv', v)} min={10} max={100} step={1} />
          </div>
          {errors.length > 0 && <div className="stack" style={{ gap: 4 }}>{errors.map((e) => <div key={e} className="dt-invalid">{e}</div>)}</div>}
          <FxFootnote />
        </Panel>

        <div className="dt-results">
          <Panel tone="warn">
            <div className="dt-tabrow">
              <div className="dt-chart-title" style={{ marginBottom: 0 }}>Shock controls</div>
              <button className="btn sm ghost" onClick={() => setShocks(NO_SHOCKS)} disabled={activeShocks === 0}>Reset shocks</button>
            </div>
            <div className="grid grid-2" style={{ marginTop: 12, gap: 14 }}>
              <div className="field">
                <div className="row between"><label>Property / business value falls</label><span className="mono small gold">−{pct(shocks.valueDrop, 0)}</span></div>
                <div className="row" style={{ gap: 6 }}>{[0, 0.1, 0.2, 0.3].map((v) => <button key={v} className={`btn sm ${shocks.valueDrop === v ? 'active' : 'ghost'}`} onClick={() => setS('valueDrop', v)}>{v === 0 ? 'None' : `−${v * 100}%`}</button>)}</div>
                <input type="range" min={0} max={60} step={1} value={Math.round(shocks.valueDrop * 100)} onChange={(e) => setS('valueDrop', parseFloat(e.target.value) / 100)} aria-label="Value drop" />
              </div>
              <div className="field">
                <div className="row between"><label>Interest rates rise (floating share)</label><span className="mono small gold">+{shocks.rateBps} bps</span></div>
                <div className="row" style={{ gap: 6 }}>{[0, 100, 200, 300].map((v) => <button key={v} className={`btn sm ${shocks.rateBps === v ? 'active' : 'ghost'}`} onClick={() => setS('rateBps', v)}>{v === 0 ? 'None' : `+${v}`}</button>)}</div>
                <input type="range" min={0} max={600} step={25} value={shocks.rateBps} onChange={(e) => setS('rateBps', parseFloat(e.target.value))} aria-label="Rate shock" />
              </div>
              <SliderField label="Rental income falls" value={Math.round(shocks.rentalDrop * 100)} min={0} max={100} step={5} format={(v) => `−${v}%`} onChange={(v) => setS('rentalDrop', v / 100)} />
              <SliderField label="Business revenue contracts" value={Math.round(shocks.revenueDrop * 100)} min={0} max={100} step={5} format={(v) => `−${v}%`} onChange={(v) => setS('revenueDrop', v / 100)} />
              <SliderField label="Operating expenses increase" value={Math.round(shocks.opexIncrease * 100)} min={0} max={100} step={5} format={(v) => `+${v}%`} onChange={(v) => setS('opexIncrease', v / 100)} />
              <div className="field">
                <div className="row between"><label>Major tenant / borrower defaults</label><span className="mono small gold">{pct(shocks.tenantDefaultShare, 0)} × {shocks.tenantDefaultMonths} mo</span></div>
                <div className="grid grid-2" style={{ gap: 8 }}>
                  <div><span className="tiny muted">Share of income lost</span><input type="range" min={0} max={100} step={5} value={Math.round(shocks.tenantDefaultShare * 100)} onChange={(e) => setS('tenantDefaultShare', parseFloat(e.target.value) / 100)} aria-label="Share of income lost" /></div>
                  <div><span className="tiny muted">Months</span><input type="range" min={0} max={12} step={1} value={shocks.tenantDefaultMonths} onChange={(e) => setS('tenantDefaultMonths', parseFloat(e.target.value))} aria-label="Months of default" /></div>
                </div>
              </div>
              <div className="row" style={{ gap: 8, gridColumn: '1 / -1' }}>
                <button className={`btn sm ${shocks.refinanceRefused ? 'active' : 'ghost'}`} onClick={() => setS('refinanceRefused', !shocks.refinanceRefused)} aria-pressed={shocks.refinanceRefused}>Bank refuses to refinance at maturity</button>
                <button className={`btn sm ${shocks.acceleration ? 'active' : 'ghost'}`} onClick={() => setS('acceleration', !shocks.acceleration)} aria-pressed={shocks.acceleration}>Lender accelerates after covenant breach</button>
              </div>
            </div>
          </Panel>

          {error && <ErrorState title="Could not run the stress test" body={error} retry={() => { setBase(DEFAULT_STRESS_BASE); setShocks(NO_SHOCKS); }} />}
          {!error && !result && <EmptyState title="Fix the highlighted inputs" body="The stress test runs as soon as the base case is valid." />}
          {result && baseline && (
            <>
              <div className="dt-stats">
                <Stat label="Equity (stressed)" value={fmt(equityAnim)} sub={`Base ${fmt(baseline.equity)} · ${result.equity < 0 ? 'negative equity' : `${pct(result.equity / Math.max(1, baseline.equity), 0)} of base`}`} tone={result.equity < 0 ? 'red' : result.equity < baseline.equity * 0.5 ? 'amber' : 'gold'} />
                <Stat label="Liquidity runway" value={Number.isFinite(result.runwayMonths) ? `${runway.toFixed(1)} mo` : '∞'} sub={result.monthlyCashFlow < 0 ? `Burning ${fmt(-result.monthlyCashFlow)} / month` : `Surplus ${fmt(result.monthlyCashFlow)} / month`} tone={result.lights.runway12 === 'green' ? 'green' : result.lights.runway12 === 'amber' ? 'amber' : 'red'} />
                <Stat label="DSCR (stressed)" value={ratio(result.dscr)} sub={`Base ${ratio(baseline.dscr)} · covenant ${base.minDscr.toFixed(2)}×`} tone={result.lights.withinDscr === 'green' ? 'green' : result.lights.withinDscr === 'amber' ? 'amber' : 'red'} />
                <Stat label="LTV (stressed)" value={pct(result.ltv, 0)} sub={`Base ${pct(baseline.ltv, 0)} · covenant ${pct(base.maxLtv, 0)}`} tone={result.lights.withinLtv === 'green' ? 'green' : result.lights.withinLtv === 'amber' ? 'amber' : 'red'} />
              </div>

              <Panel>
                <div className="dt-chart-title">Equity vs debt against stressed value</div>
                {result.equity >= 0 ? (
                  <SegmentBar tall total={result.value} segments={[{ label: 'Equity', value: result.equity, color: 'gold' }, { label: 'Debt', value: result.loanBalance, color: 'amber' }]} format={(v) => fmt(v)} />
                ) : (
                  <>
                    <SegmentBar tall total={result.loanBalance} segments={[{ label: 'Value', value: result.value, color: 'amber' }, { label: 'Negative equity', value: -result.equity, color: 'red' }]} format={(v) => fmt(v)} />
                    <p className="small" style={{ color: '#e7a398', marginTop: 8 }}>The loan ({fmt(result.loanBalance)}) exceeds the stressed value ({fmt(result.value)}). A sale would leave {fmt(-result.equity)} unpaid.</p>
                  </>
                )}
                <div className="dt-segbar-legend" style={{ marginTop: 10 }}><span>Base equity <b>{fmt(baseline.equity)}</b></span><span>Stressed equity <b style={{ color: result.equity < baseline.equity ? '#e7a398' : undefined }}>{fmt(result.equity)}</b></span><span>Change <b>{fmt(result.equity - baseline.equity)}</b></span></div>
              </Panel>

              <div className="grid grid-2">
                <Panel>
                  <WaterfallChart title="Annual cash flow under stress" steps={[
                    { label: 'Income', value: result.income, kind: 'start' },
                    { label: 'Expenses', value: -result.expenses, kind: 'delta' },
                    { label: 'NOI', value: result.noi, kind: 'total' },
                    { label: 'Debt service', value: -result.annualDebtService, kind: 'delta' },
                    { label: 'Net', value: result.annualCashFlow, kind: 'total' },
                  ]} yFormat={(v) => fmt(v, { compact: true })} height={230} note={result.defaultLoss > 0 ? `Includes ${fmt(result.defaultLoss)} of income lost to the default.` : undefined} />
                </Panel>
                <Panel>
                  <div className="dt-chart-title">DSCR gauge</div>
                  <Gauge value={result.dscr} min={0} max={3} bands={[{ to: 1, color: 'red' }, { to: Math.max(1.01, base.minDscr), color: 'amber' }, { to: 3, color: 'green' }]} label="Stressed DSCR" format={(v) => (Number.isFinite(v) ? `${v.toFixed(2)}×` : '∞')} marker={{ value: baseline.dscr, label: 'base' }} />
                  <p className="tiny muted center">Rate: {pct(result.baseRate, 2)} → {pct(result.stressedRate, 2)} · debt service {fmt(result.baseDebtService)} → {fmt(result.annualDebtService)}</p>
                </Panel>
              </div>

              <Panel>
                <div className="dt-chart-title">Risk dashboard</div>
                <div className="dt-lights">
                  {LIGHT_LABELS.map((l) => (
                    <div key={l.key} className={`dt-light ${result.lights[l.key]}`}>
                      <span className="lamp" />
                      <strong style={{ fontWeight: 500 }}>{l.label}</strong>
                      <span className="mono">{l.detail(result, base)}</span>
                      <span className="tiny" style={{ color: lightColor(result.lights[l.key]) }}>{result.lights[l.key] === 'green' ? 'Yes' : result.lights[l.key] === 'amber' ? 'Marginal' : 'No'}</span>
                    </div>
                  ))}
                </div>
                <div className="callout" style={{ marginTop: 14 }}><p>{result.narrative}</p></div>
              </Panel>

              {(result.balloonDue > 0 || shocks.acceleration) && (
                <div className="grid grid-2">
                  {result.balloonDue > 0 && (
                    <Panel tone={shocks.refinanceRefused ? 'danger' : 'warn'}>
                      <div className="dt-big-label">Maturity wall · year {result.maturityYear} ({result.yearsToMaturity.toFixed(1)} years away)</div>
                      <div className={`dt-big ${shocks.refinanceRefused ? 'red' : 'amber'}`}>{fmt(result.balloonDue)}</div>
                      <div className="dt-kv" style={{ marginTop: 10 }}>
                        <span className="k">Max new loan at {pct(base.maxLtv, 0)} of stressed value</span><span className="v">{fmt(result.maxRefiLoan)}</span>
                        <span className="k">Refinancing gap (equity needed)</span><span className="v" style={{ color: result.refiGap > 0 ? '#e7a398' : 'var(--green-2)' }}>{fmt(result.refiGap)}</span>
                        <span className="k">Liquidity vs payoff</span><span className="v">{fmt(result.liquidity)} · {Number.isFinite(result.liquidityVsPayoff) ? pct(Math.min(result.liquidityVsPayoff, 9.99), 0) : '—'}</span>
                        <span className="k">Months of reserves vs monthly payment</span><span className="v">{result.monthlyDebtService > 0 ? `${(result.liquidity / result.monthlyDebtService).toFixed(0)} mo` : '—'}</span>
                      </div>
                      {shocks.refinanceRefused && <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>With no refinancing, the full balance must come from a sale, an equity injection or an extension the lender is not obliged to grant. Reserves cover {pct(Math.min(result.liquidityVsPayoff, 1), 0)} of it.</p>}
                    </Panel>
                  )}
                  {shocks.acceleration && (
                    <Panel tone="danger">
                      <div className="dt-big-label">Acceleration · full balance due now</div>
                      <div className="dt-big red">{fmt(result.loanBalance)}</div>
                      <SegmentBar tall total={Math.max(result.loanBalance, result.liquidity)} segments={[{ label: 'Liquidity available', value: Math.min(result.liquidity, result.loanBalance), color: 'green' }, { label: 'Shortfall', value: result.accelerationShortfall, color: 'red' }]} format={(v) => fmt(v)} />
                      <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>Whether the lender may accelerate, after what notice, and what happens to guarantors is a legal question — see the jurisdiction panel.</p>
                    </Panel>
                  )}
                </div>
              )}

              <div className="grid grid-2">
                <Panel>
                  <div className="row between" style={{ marginBottom: 10 }}><div className="dt-chart-title" style={{ marginBottom: 0 }}>Mathematically calculated warnings</div><Chip tone="gold">From the numbers</Chip></div>
                  <WarningList items={result.warnings} />
                </Panel>
                <Panel>
                  <div className="row between" style={{ marginBottom: 10 }}><div className="dt-chart-title" style={{ marginBottom: 0 }}>Jurisdiction-specific legal consequences · {jurisdiction}</div><Chip tone="amber">General description</Chip></div>
                  <p className="small muted">{legal.intro}</p>
                  <div className="stack" style={{ gap: 10 }}>
                    {legal.items.map((it) => (
                      <div key={it.title} className="dt-detail">
                        <div className="row between" style={{ gap: 8 }}><strong>{it.title}</strong>{!it.verified && <Chip tone="amber">Not yet jurisdictionally verified</Chip>}</div>
                        <p className="small muted" style={{ margin: '4px 0 0' }}>{it.body}</p>
                      </div>
                    ))}
                  </div>
                  <p className="tiny muted" style={{ marginTop: 12 }}>Change the jurisdiction in the app settings to see another regime. These are general descriptions of how enforcement usually works, not advice on any loan agreement.</p>
                </Panel>
              </div>
            </>
          )}
        </div>
      </div>

      <Formulas items={FORMULAS} assumptions={ASSUMPTIONS} />
      <Disclaimer>A stress test shows the arithmetic of a downturn, not its probability. Any red light is the point at which lenders, counsel and advisers should be in the room — ideally before the loan is signed, when covenants, cure periods, recourse and guarantees are still negotiable.</Disclaimer>
    </div>
  );
}

function lightColor(l: Light) { return l === 'green' ? 'var(--green-2)' : l === 'amber' ? 'var(--amber)' : '#e7a398'; }
