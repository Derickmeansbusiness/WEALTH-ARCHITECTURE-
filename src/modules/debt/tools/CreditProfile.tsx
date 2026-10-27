import { useMemo, useState } from 'react';
import { Chip, Disclaimer, NumberField, Panel, SliderField, Stat, Tabs, useMoney } from '@/components/ui';
import { pct } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { useTween } from './shared/hooks';
import { BarChart, RadarChart } from './shared/Charts';
import ScenarioBar from './shared/ScenarioBar';
import Formulas, { type FormulaItem } from './shared/Formulas';
import { FxFootnote, Head, MoneyField, PctField } from './shared/Fields';
import { num, path } from './shared/util';
import { BAND_ACCESS, BAND_ORDER, businessIndicator, DEFAULT_BUSINESS, DEFAULT_PERSONAL, financingCostGap, personalIndicator, type Band, type BusinessInputs, type Indicator, type PersonalInputs } from './math/credit';
import './shared/tools.css';

export interface CreditScenarioData {
  tool: 'credit-profile'; version: 1; tab: 'personal' | 'business'; personal: PersonalInputs; business: BusinessInputs; mortgage: { principal: number; baseRate: number; termYears: number };
  outputs: { personalScore: number; personalBand: Band; businessScore: number; businessBand: Band };
}

const FORMULAS: FormulaItem[] = [
  { label: 'Indicator', formula: 'Σ (factor score × weight) × 100', note: 'Each factor scored 0..1; weights sum to 1. Illustrative weights, not a bureau model.' },
  { label: 'Payment history (personal)', formula: 'clamp((on-time% − 80) ÷ 20) × (1 − 0.18 × recent lates) × penalties', note: 'Delinquency ×0.55, collection ×0.6, bankruptcy ×0.3.' },
  { label: 'Utilization', formula: 'step function: ≤9% → 1.0 · ≤30% → 0.85 · ≤50% → 0.6 · ≤75% → 0.35 · ≤100% → 0.15' },
  { label: 'Account age', formula: 'clamp(average age ÷ 9 years)' },
  { label: 'New applications', formula: 'clamp(1 − 0.15 × applications in 12 months)' },
  { label: 'Vendor payments (business)', formula: 'clamp((on-time% − 60) ÷ 40) × clamp(1 − days beyond terms ÷ 60)' },
  { label: 'Coverage (business)', formula: 'clamp((DSCR − 0.8) ÷ 1.0)' },
  { label: 'Existing debt (business)', formula: 'clamp(1 − debt ÷ revenue ÷ 1.5)' },
  { label: 'Band', formula: '≥85 Exceptional · ≥72 Very good · ≥58 Good · ≥40 Fair · else Poor' },
  { label: 'Financing cost gap', formula: 'totalInterest(rate + spread_B) − totalInterest(rate + spread_A)', note: 'buildLoan on the same principal and term; spreads per band are illustrative.' },
];
const ASSUMPTIONS = [
  'This is an educational indicator of the factors lenders describe as mattering. It is not a FICO®, VantageScore®, Experian, Equifax, TransUnion, AECB, or any bureau score and is not a guarantee of approval or terms.',
  'Band spreads (0 / +0.3 / +0.9 / +2.2 / +4.5 percentage points) are illustrative of how pricing tiers behave, not any lender\'s rate card.',
  'Real underwriting also weighs income, assets, collateral, purpose, relationship and the lender\'s own risk appetite at the time.',
];

const BUREAUS: Record<'US' | 'UAE' | 'CEMAC' | 'UK', { body: string; verified: boolean }> = {
  US: { body: 'Three national consumer bureaus (Equifax, Experian, TransUnion) compile files; FICO® and VantageScore® are scoring models built on them. Business credit is tracked separately (e.g. Dun & Bradstreet PAYDEX, Experian Business, Equifax Business). Consumer reporting is regulated under the Fair Credit Reporting Act.', verified: true },
  UAE: { body: 'Al Etihad Credit Bureau (AECB) compiles consumer and commercial credit reports and scores from banks, finance companies, telecoms and utilities. Lenders are required to consult it; individuals and companies can obtain their own reports.', verified: false },
  CEMAC: { body: 'The BEAC operates a Centrale des Risques (central credit register) to which supervised banks report exposures and incidents; coverage of individuals and small businesses is narrower than a private bureau. National systems and private bureaus are developing unevenly across the six states.', verified: false },
  UK: { body: 'Three main consumer reference agencies (Experian, Equifax, TransUnion) hold files; each produces its own score and lenders often apply their own models. Companies House filings, CCJs and commercial bureaus feed business credit assessment.', verified: true },
};

const WHY_BUSINESS_PG = 'A personal guarantee converts business credit into personal exposure: if the entity cannot pay, the lender looks to the guarantor\'s own assets. Families often accept it early and forget to negotiate it away as the business matures.';

export default function CreditProfile() {
  const [tab, setTab] = useState<'personal' | 'business'>('personal');
  const [p, setP] = useState<PersonalInputs>(DEFAULT_PERSONAL);
  const [b, setB] = useState<BusinessInputs>(DEFAULT_BUSINESS);
  const [mortgage, setMortgage] = useState({ principal: 300_000, baseRate: 0.06, termYears: 30 });
  const jurisdiction = useAppStore((s) => s.jurisdictionMode);
  const fmt = useMoney();

  const personal = useMemo(() => personalIndicator(p), [p]);
  const business = useMemo(() => businessIndicator(b), [b]);
  const ind: Indicator = tab === 'personal' ? personal : business;
  const animated = useTween(ind.score);
  const access = BAND_ACCESS[ind.band];
  const gap = useMemo(() => financingCostGap(mortgage.principal, mortgage.baseRate, 'Exceptional', ind.band, Math.round(mortgage.termYears * 12)), [mortgage, ind.band]);
  const bandCosts = useMemo(() => BAND_ORDER.map((band) => financingCostGap(mortgage.principal, mortgage.baseRate, 'Exceptional', band, Math.round(mortgage.termYears * 12))), [mortgage]);

  const setPf = <K extends keyof PersonalInputs>(k: K, v: PersonalInputs[K]) => setP((s) => ({ ...s, [k]: v }));
  const setBf = <K extends keyof BusinessInputs>(k: K, v: BusinessInputs[K]) => setB((s) => ({ ...s, [k]: v }));

  const data: CreditScenarioData = { tool: 'credit-profile', version: 1, tab, personal: p, business: b, mortgage, outputs: { personalScore: personal.score, personalBand: personal.band, businessScore: business.score, businessBand: business.band } };

  return (
    <div className="dt-tool">
      <Head eyebrow="Tool 03 · Credit" title="Credit Profile Simulator" lede="Move the levers lenders say they watch and see how an educational indicator responds — then see what a band is worth in actual financing cost. This is a teaching model of the factors, not a bureau score.">
        <div className="row" style={{ gap: 8 }}><Chip tone="amber">Illustrative educational indicator</Chip><Chip tone="amber">Not a FICO® / VantageScore® / bureau score</Chip><Chip tone="amber">Not a guarantee of approval</Chip></div>
      </Head>

      <ScenarioBar kind="other" tag="credit-profile" defaultName={`Credit · ${tab} · ${ind.band} (${ind.score})`} data={data}
        onLoad={(d) => { const x = d as Partial<CreditScenarioData>; if (x?.personal) setP({ ...DEFAULT_PERSONAL, ...x.personal }); if (x?.business) setB({ ...DEFAULT_BUSINESS, ...x.business }); if (x?.mortgage) setMortgage(x.mortgage); if (x?.tab) setTab(x.tab); }}
        report={() => ({
          title: 'Credit Profile — summary', tool: 'Credit Profile Simulator',
          inputs: tab === 'personal'
            ? [['On-time payments', `${p.onTimePct}%`], ['Recent late payments', String(p.recentLates)], ['Utilization', `${p.utilizationPct}%`], ['Outstanding balances', fmt(p.balances)], ['Average account age', `${p.avgAgeYears} yr`], ['New applications (12 mo)', String(p.newApplications)], ['Credit mix', [p.hasRevolving && 'revolving', p.hasInstallment && 'installment', p.hasMortgage && 'mortgage'].filter(Boolean).join(', ') || 'none'], ['Delinquencies / collections / bankruptcy', `${p.delinquencies} / ${p.collections} / ${p.bankruptcy ? 'yes' : 'no'}`]].map(([label, value]) => ({ label, value }))
            : [['Vendor on-time', `${b.vendorOnTimePct}%`], ['Days beyond terms', String(b.daysBeyondTerms)], ['Years in business', String(b.yearsInBusiness)], ['Revenue', fmt(b.revenue)], ['DSCR', `${b.dscr.toFixed(2)}×`], ['Existing debt', fmt(b.existingDebt)], ['Personal guarantee', b.personalGuarantee ? 'required' : 'not required'], ['Entity age', `${b.entityAgeYears} yr`], ['Liens / judgments', String(b.publicRecords)]].map(([label, value]) => ({ label, value })),
          outputs: [['Indicator', `${ind.score} / 100`], ['Band', ind.band], ...ind.factors.map((f) => [f.label, `${Math.round(f.score * 100)} / 100 (weight ${pct(f.weight, 0)})`]), ['Illustrative spread', `+${(access.spread * 100).toFixed(1)} pts`], [`Extra interest on ${fmt(mortgage.principal)} mortgage vs Exceptional`, fmt(gap.interestGap)]].map(([label, value]) => ({ label, value })),
          formulas: FORMULAS, assumptions: ASSUMPTIONS,
        })}
        compareFields={[{ label: 'Tab', get: (d) => String(path(d, 'tab') ?? '—') }, { label: 'Personal indicator', get: (d) => `${num(d, 'outputs.personalScore')} · ${String(path(d, 'outputs.personalBand') ?? '')}` }, { label: 'Business indicator', get: (d) => `${num(d, 'outputs.businessScore')} · ${String(path(d, 'outputs.businessBand') ?? '')}` }, { label: 'Utilization', get: (d) => `${num(d, 'personal.utilizationPct')}%` }, { label: 'DSCR (business)', get: (d) => `${num(d, 'business.dscr').toFixed(2)}×` }]}
      />

      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'personal', label: 'Personal credit' }, { id: 'business', label: 'Business credit' }]} />

      <div className="dt-layout">
        <Panel tight className="dt-inputs">
          {tab === 'personal' ? (
            <>
              <div className="dt-inputs-group">
                <div className="eyebrow">Payment behaviour</div>
                <SliderField label="Payments made on time" value={p.onTimePct} min={70} max={100} step={1} format={(v) => `${v}%`} onChange={(v) => setPf('onTimePct', v)} />
                <SliderField label="Late payments (last 24 months)" value={p.recentLates} min={0} max={8} step={1} onChange={(v) => setPf('recentLates', v)} />
              </div>
              <div className="dt-inputs-group">
                <div className="eyebrow">Balances</div>
                <SliderField label="Utilization of revolving limits" value={p.utilizationPct} min={0} max={110} step={1} format={(v) => `${v}%`} onChange={(v) => setPf('utilizationPct', v)} />
                <MoneyField label="Outstanding revolving balances" value={p.balances} onChange={(v) => setPf('balances', v)} step={500} />
              </div>
              <div className="dt-inputs-group">
                <div className="eyebrow">History & mix</div>
                <SliderField label="Average account age" value={p.avgAgeYears} min={0} max={20} step={0.5} format={(v) => `${v} yr`} onChange={(v) => setPf('avgAgeYears', v)} />
                <SliderField label="New applications (12 months)" value={p.newApplications} min={0} max={10} step={1} onChange={(v) => setPf('newApplications', v)} />
                <div className="field"><label>Credit mix</label><div className="row" style={{ gap: 6 }}>
                  {([['hasRevolving', 'Revolving'], ['hasInstallment', 'Installment'], ['hasMortgage', 'Mortgage']] as const).map(([k, l]) => <button key={k} className={`btn sm ${p[k] ? 'active' : 'ghost'}`} aria-pressed={p[k]} onClick={() => setPf(k, !p[k])}>{l}</button>)}
                </div></div>
              </div>
              <div className="dt-inputs-group">
                <div className="eyebrow">Derogatory records</div>
                <div className="grid grid-2" style={{ gap: 8 }}>
                  <NumberField label="90+ day delinquencies" value={p.delinquencies} onChange={(v) => setPf('delinquencies', Math.max(0, Math.round(v)))} min={0} max={10} />
                  <NumberField label="Collections" value={p.collections} onChange={(v) => setPf('collections', Math.max(0, Math.round(v)))} min={0} max={10} />
                </div>
                <button className={`btn sm ${p.bankruptcy ? 'active danger' : 'ghost'}`} aria-pressed={p.bankruptcy} onClick={() => setPf('bankruptcy', !p.bankruptcy)}>{p.bankruptcy ? 'Bankruptcy on file' : 'No bankruptcy'}</button>
              </div>
            </>
          ) : (
            <>
              <div className="dt-inputs-group">
                <div className="eyebrow">Trade credit (PAYDEX-style concept)</div>
                <SliderField label="Vendor invoices paid within terms" value={b.vendorOnTimePct} min={50} max={100} step={1} format={(v) => `${v}%`} onChange={(v) => setBf('vendorOnTimePct', v)} />
                <SliderField label="Average days beyond terms" value={b.daysBeyondTerms} min={0} max={60} step={1} format={(v) => `${v} d`} onChange={(v) => setBf('daysBeyondTerms', v)} />
              </div>
              <div className="dt-inputs-group">
                <div className="eyebrow">Business profile</div>
                <SliderField label="Years in business" value={b.yearsInBusiness} min={0} max={25} step={1} format={(v) => `${v} yr`} onChange={(v) => setBf('yearsInBusiness', v)} />
                <SliderField label="Entity age" value={b.entityAgeYears} min={0} max={25} step={1} format={(v) => `${v} yr`} onChange={(v) => setBf('entityAgeYears', v)} />
                <MoneyField label="Annual revenue" value={b.revenue} onChange={(v) => setBf('revenue', v)} step={50000} />
              </div>
              <div className="dt-inputs-group">
                <div className="eyebrow">Debt capacity</div>
                <SliderField label="Debt service coverage (DSCR)" value={b.dscr} min={0.5} max={3} step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={(v) => setBf('dscr', v)} />
                <MoneyField label="Existing debt" value={b.existingDebt} onChange={(v) => setBf('existingDebt', v)} step={25000} />
                <NumberField label="Liens / judgments on file" value={b.publicRecords} onChange={(v) => setBf('publicRecords', Math.max(0, Math.round(v)))} min={0} max={10} />
                <button className={`btn sm ${b.personalGuarantee ? 'active' : 'ghost'}`} aria-pressed={b.personalGuarantee} onClick={() => setBf('personalGuarantee', !b.personalGuarantee)}>{b.personalGuarantee ? 'Personal guarantee required' : 'No personal guarantee'}</button>
              </div>
            </>
          )}
          <FxFootnote />
        </Panel>

        <div className="dt-results">
          <Panel tone="gold">
            <div className="row between" style={{ alignItems: 'flex-start', gap: 16 }}>
              <div>
                <div className="dt-big-label">Educational Creditworthiness Indicator · {tab}</div>
                <div className="row" style={{ alignItems: 'baseline', gap: 12 }}>
                  <span className="dt-big gold">{Math.round(animated)}</span>
                  <span className="muted mono">/ 100</span>
                  <Chip tone={access.tone === 'gold' ? 'gold' : access.tone}>{ind.band}</Chip>
                </div>
              </div>
              <p className="tiny muted" style={{ maxWidth: 360, margin: 0 }}>Illustrative educational indicator — not a FICO®/VantageScore® or any bureau score and not a guarantee of approval. Bands show how lenders tend to tier applicants; your actual file is read by their models, not this one.</p>
            </div>
            <div style={{ marginTop: 18 }}>
              <div className="dt-bandmeter"><div className="marker" style={{ left: `${Math.max(0, Math.min(100, animated))}%` }} /></div>
              <div className="dt-bandticks"><span>0 Poor</span><span>40 Fair</span><span>58 Good</span><span>72 Very good</span><span>85 Exceptional</span><span>100</span></div>
            </div>
          </Panel>

          <div className="grid grid-2">
            <Panel>
              <div className="dt-chart-title">Factor strength</div>
              <RadarChart axes={ind.factors.map((f) => f.label.replace(' to vendors', ''))} series={[{ label: tab === 'personal' ? 'Your profile' : 'Your business', color: 'gold', values: ind.factors.map((f) => f.score) }]} format={(v) => `${Math.round(v * 100)}/100`} />
            </Panel>
            <Panel>
              <div className="dt-chart-title">Why each factor matters to lenders</div>
              <div className="stack" style={{ gap: 10 }}>
                {ind.factors.map((f) => (
                  <div key={f.id} className="dt-detail" style={{ borderColor: f.score >= 0.75 ? 'var(--green-2)' : f.score >= 0.45 ? 'var(--amber)' : 'var(--red)' }}>
                    <div className="row between" style={{ gap: 8 }}><strong>{f.label}</strong><span className="mono small" style={{ color: f.score >= 0.75 ? 'var(--green-2)' : f.score >= 0.45 ? 'var(--amber)' : '#e7a398' }}>{Math.round(f.score * 100)} · weight {pct(f.weight, 0)}</span></div>
                    <div className="tiny mono muted">{f.detail}</div>
                    <p className="small muted" style={{ margin: '4px 0 0' }}>{f.why}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel>
            <div className="dt-tabrow"><div className="dt-chart-title" style={{ marginBottom: 0 }}>Financing access by band</div><Chip tone="amber">Illustrative</Chip></div>
            <div className="grid grid-3" style={{ marginTop: 12 }}>
              <Stat label="Access to funding" value={<span style={{ fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 400 }}>{access.access}</span>} />
              <Stat label="Borrowing terms" value={<span style={{ fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 400 }}>{access.terms}</span>} />
              <Stat label="Illustrative rate spread" value={`+${(access.spread * 100).toFixed(1)} pts`} sub={`vs Exceptional on the same loan`} tone={access.tone === 'gold' ? 'gold' : access.tone} />
            </div>
            <div className="hairline" style={{ margin: '18px 0' }} />
            <div className="grid grid-2" style={{ alignItems: 'start' }}>
              <div className="stack" style={{ gap: 10 }}>
                <div className="eyebrow">Same mortgage, different band</div>
                <MoneyField label="Loan principal" value={mortgage.principal} onChange={(v) => setMortgage((m) => ({ ...m, principal: v }))} step={10000} />
                <div className="grid grid-2" style={{ gap: 8 }}>
                  <PctField label="Base rate (Exceptional)" value={mortgage.baseRate} onChange={(v) => setMortgage((m) => ({ ...m, baseRate: v }))} min={0} max={30} step={0.05} />
                  <NumberField label="Term" value={mortgage.termYears} onChange={(v) => setMortgage((m) => ({ ...m, termYears: Math.max(1, Math.min(40, v)) }))} min={1} max={40} suffix="yr" />
                </div>
                <div className="dt-kv">
                  <span className="k">Rate A · Exceptional</span><span className="v">{pct(gap.rateA, 2)}</span>
                  <span className="k">Rate B · {ind.band}</span><span className="v">{pct(gap.rateB, 2)}</span>
                  <span className="k">Monthly payment A → B</span><span className="v">{fmt(gap.a.periodicPayment)} → {fmt(gap.b.periodicPayment)}</span>
                  <span className="k">Total interest A → B</span><span className="v">{fmt(gap.a.totalInterest, { compact: true })} → {fmt(gap.b.totalInterest, { compact: true })}</span>
                  <span className="k"><strong>Extra cost of your band</strong></span><span className="v" style={{ color: gap.interestGap > 0 ? '#e7a398' : 'var(--green-2)' }}>{fmt(gap.interestGap)}</span>
                </div>
              </div>
              <BarChart title={`Total interest on ${fmt(mortgage.principal, { compact: true })} over ${mortgage.termYears} years`} groups={BAND_ORDER} series={[{ label: 'Total interest', color: 'amber', values: bandCosts.map((c) => c.b.totalInterest) }]} yFormat={(v) => fmt(v, { compact: true })} height={220} note="The band is a price, paid every month for the life of the loan." />
            </div>
          </Panel>

          {tab === 'business' && (
            <Panel tone="warn">
              <div className="dt-chart-title">The personal guarantee question</div>
              <p className="small muted" style={{ marginBottom: 0 }}>{WHY_BUSINESS_PG} Lenders typically release or cap guarantees only when asked, and only when entity-level DSCR, tenure and collateral stand on their own — which is what the business indicator above is tracking.</p>
            </Panel>
          )}

          <Panel>
            <div className="row between" style={{ marginBottom: 8 }}><div className="dt-chart-title" style={{ marginBottom: 0 }}>Credit-reporting systems · {jurisdiction}</div>{!BUREAUS[jurisdiction].verified && <Chip tone="amber">Not yet jurisdictionally verified</Chip>}</div>
            <p className="small muted" style={{ marginBottom: 0 }}>{BUREAUS[jurisdiction].body}</p>
          </Panel>
        </div>
      </div>

      <Formulas items={FORMULAS} assumptions={ASSUMPTIONS} />
      <Disclaimer>Credit files are read by lenders' own models and policies, which differ by product, country and cycle. Improving the factors above tends to improve access and pricing over time, but no indicator — least of all an educational one — guarantees approval or terms. Disputes over bureau records follow the procedures of each reporting system.</Disclaimer>
    </div>
  );
}
