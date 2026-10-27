import { useMemo, useState } from 'react';
import { Chip, Disclaimer, EmptyState, Panel, Stat, useMoney } from '@/components/ui';
import { pct } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { useDrawIn, useTween } from './shared/hooks';
import { C, StackedBarChart } from './shared/Charts';
import Formulas, { type FormulaItem } from './shared/Formulas';
import { FxFootnote, Head } from './shared/Fields';
import { annualDebtService, collateralTable, consolidate, maturityDate, mergeScenarioLoans, scenarioLoans, SCENARIO_ENTITY, SCENARIO_LENDER, type DashLoan, type FamilyData } from './math/dashboard';
import { DEMO_FAMILY } from './math/demoFamily';
import './shared/tools.css';

const FORMULAS: FormulaItem[] = [
  { label: 'Loan balance today', formula: 'balanceAfter(principal, rate ÷ 12, periods, months elapsed)', note: 'Interest-only stays at principal; balloon uses the amortization horizon.' },
  { label: 'Total assets', formula: 'Σ asset values + Σ entity cash' },
  { label: 'External liabilities', formula: 'Σ balances of loans from third-party lenders' },
  { label: 'Related-party elimination', formula: 'Σ balances of intra-family loans', note: 'Lender\'s receivable and borrower\'s payable cancel on consolidation; counting them would inflate both assets and debt.' },
  { label: 'Net equity', formula: 'total assets − external liabilities' },
  { label: 'Annual debt service', formula: 'Σ buildLoan(loan).annualDebtService over external loans' },
  { label: 'Floating exposure', formula: 'Σ floating balances ÷ external liabilities' },
  { label: '+200 bps sensitivity', formula: 'Σ [debtService(rate + 2%) − debtService(rate)] over floating loans' },
  { label: 'Contingent exposure (guarantor)', formula: 'Σ balances of loans the person guarantees' },
  { label: 'Cross-collateral flag', formula: 'asset pledged on > 1 loan' },
];
const ASSUMPTIONS = [
  'Demo dataset is illustrative; asset values are stated, not appraised. Balances are computed as of today from the stated origination dates.',
  'Saved Leverage / Family-Bank scenarios, when included, are attached to a "My saved scenarios" entity with no collateral or asset value of their own.',
  'Guarantee exposure is shown gross (full balance) — real guarantees may be capped, several or joint and several.',
  'Floating-rate sensitivity assumes an immediate reset of the full balance; caps, floors and fixed periods are ignored.',
];

type Sel = { type: 'entity' | 'lender' | 'person' | 'asset'; id: string } | { type: 'loan'; id: string } | null;

const POS: Record<string, { x: number; y: number }> = {
  trust: { x: 450, y: 70 }, hold: { x: 450, y: 180 }, opco: { x: 290, y: 300 }, propco1: { x: 450, y: 310 }, propco2: { x: 610, y: 300 }, invco: { x: 680, y: 160 }, scn: { x: 220, y: 170 },
  'bank-meridian': { x: 110, y: 400 }, 'bank-harbor': { x: 800, y: 420 }, 'fund-private': { x: 830, y: 80 }, 'lender-scn': { x: 80, y: 90 },
  'a-office': { x: 450, y: 420 }, 'a-resi': { x: 560, y: 430 }, 'a-warehouse': { x: 670, y: 420 }, 'a-business': { x: 260, y: 430 }, 'a-securities': { x: 760, y: 250 },
  'p-founder': { x: 300, y: 530 }, 'p-spouse': { x: 460, y: 540 }, 'p-daughter': { x: 620, y: 530 },
};
const ENTITY_TONE: Record<string, string> = { trust: 'var(--violet)', 'holding-company': 'var(--gold)', 'operating-company': 'var(--ivory-2)', 'property-company': 'var(--ivory-2)', 'investment-company': 'var(--ivory-2)', scenario: 'var(--blue)' };

export default function DebtDashboard() {
  const scenarios = useAppStore((s) => s.scenarios);
  const [includeScenarios, setInclude] = useState(true);
  const [sel, setSel] = useState<Sel>(null);
  const fmt = useMoney();
  const asOf = useMemo(() => new Date(), []);

  const extra = useMemo(() => scenarioLoans(scenarios), [scenarios]);
  const data: FamilyData = useMemo(() => (includeScenarios ? mergeScenarioLoans(DEMO_FAMILY, extra) : DEMO_FAMILY), [includeScenarios, extra]);
  const c = useMemo(() => consolidate(data, asOf), [data, asOf]);
  const coll = useMemo(() => collateralTable(data, c.balances), [data, c]);
  const nameOf = (id: string) => data.entities.find((e) => e.id === id)?.name ?? data.lenders.find((l) => l.id === id)?.name ?? data.people.find((p) => p.id === id)?.name ?? data.assets.find((a) => a.id === id)?.name ?? id;

  const assetsAnim = useTween(c.totalAssets), extAnim = useTween(c.externalLiabilities), eqAnim = useTween(c.netEquity), liqAnim = useTween(c.liquidity);
  const years = useMemo(() => { const y0 = asOf.getFullYear(); const maxY = Math.max(y0 + 5, ...c.maturities.map((m) => m.year)); return Array.from({ length: maxY - y0 + 1 }, (_, i) => y0 + i); }, [c, asOf]);
  const maxMat = Math.max(1, ...c.maturities.map((m) => m.external + m.related));
  const within24 = (year: number) => { const end = new Date(asOf); end.setMonth(end.getMonth() + 24); return year >= asOf.getFullYear() && year <= end.getFullYear(); };

  return (
    <div className="dt-tool">
      <Head eyebrow="Tool 06 · Dashboard" title="Family Wealth Debt Dashboard" lede="Every loan in a family structure sits somewhere: on an entity, against an asset, behind a guarantee. Seen together they form a credit network. This dashboard consolidates a demo family — six entities, eight loans, three lenders — and, if you choose, the loans you have modelled in the other tools.">
        <div className="row" style={{ gap: 10 }}>
          <button className={`btn sm ${includeScenarios ? 'active' : 'ghost'}`} onClick={() => setInclude((v) => !v)} aria-pressed={includeScenarios}>Include my saved scenarios ({extra.length})</button>
          {includeScenarios && extra.length === 0 && <span className="tiny muted">No Leverage or Family-Bank scenarios with loan terms saved yet.</span>}
          <span className="tiny muted mono">As of {asOf.toISOString().slice(0, 10)}</span>
        </div>
      </Head>

      <div className="dt-stats">
        <Stat label="Total assets" value={fmt(assetsAnim, { compact: true })} sub={`incl. ${fmt(c.totalCash, { compact: true })} cash across entities`} tone="gold" />
        <Stat label="External liabilities" value={fmt(extAnim, { compact: true })} sub={`+ ${fmt(c.relatedPartyLiabilities, { compact: true })} related-party, eliminated`} tone="amber" />
        <Stat label="Net equity (consolidated)" value={fmt(eqAnim, { compact: true })} sub={`External LTV ${pct(c.externalLiabilities / Math.max(1, c.totalAssets), 0)}`} tone="green" />
        <Stat label="Available liquidity" value={fmt(liqAnim, { compact: true })} sub={`${(c.liquidity / Math.max(1, c.annualDebtService / 12)).toFixed(0)} months of external debt service`} />
        <Stat label="Annual debt service (external)" value={fmt(c.annualDebtService, { compact: true })} sub={`${fmt(c.annualDebtServiceAll - c.annualDebtService, { compact: true })} more moves between family pockets`} />
        <Stat label="Floating-rate exposure" value={pct(c.floatingShare, 0)} sub={`+200 bps → +${fmt(c.sensitivity200, { compact: true })} / yr`} tone={c.floatingShare > 0.5 ? 'amber' : undefined} />
        <Stat label="Refinancing in 24 months" value={fmt(c.upcoming.reduce((s, u) => s + u.dueAtMaturity, 0), { compact: true })} sub={`${c.upcoming.length} loan${c.upcoming.length === 1 ? '' : 's'} maturing`} tone={c.upcoming.length ? 'red' : 'green'} />
        <Stat label="Cross-collateral flags" value={String(c.crossCollateral.length)} sub={c.crossCollateral.length ? c.crossCollateral.map((x) => x.assetName.split(' (')[0]).join(', ') : 'none'} tone={c.crossCollateral.length ? 'red' : 'green'} />
      </div>

      <Panel>
        <div className="row between" style={{ marginBottom: 8 }}>
          <div className="dt-chart-title" style={{ marginBottom: 0 }}>Ownership & credit network</div>
          <div className="dt-legend"><span style={{ ['--c' as string]: 'var(--amber)' }}>External credit (width ∝ balance)</span><span style={{ ['--c' as string]: 'var(--green-2)' }}>Related-party loan</span><span style={{ ['--c' as string]: 'var(--red)' }}>Personal guarantee</span><span style={{ ['--c' as string]: 'var(--ivory-3)' }}>Collateral pledge</span><span style={{ ['--c' as string]: 'var(--gold)' }}>Ownership</span></div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 16 }}>
          <div style={{ overflowX: 'auto' }}><Network data={data} c={c} sel={sel} onSel={setSel} /></div>
          <Panel tight>
            <DetailPane sel={sel} data={data} c={c} fmt={fmt} nameOf={nameOf} />
          </Panel>
        </div>
      </Panel>

      <div className="grid grid-2">
        <Panel>
          <div className="dt-chart-title">Debt maturity calendar</div>
          {c.maturities.length === 0 ? <EmptyState title="No maturities" /> : (
            <div>
              {years.map((y) => {
                const m = c.maturities.find((x) => x.year === y);
                const tot = m ? m.external + m.related : 0;
                return (
                  <div key={y} className={`dt-timeline-row ${within24(y) && tot > 0 ? 'soon' : ''}`}>
                    <span className="mono small">{y}</span>
                    <div className="row" style={{ gap: 2 }}>
                      {m && m.external > 0 && <div className="bar" style={{ width: `${(m.external / maxMat) * 100}%` }} title={`External ${fmt(m.external)}`} />}
                      {m && m.related > 0 && <div className="bar" style={{ width: `${(m.related / maxMat) * 100}%`, background: 'var(--green-2)', boxShadow: 'none' }} title={`Related-party ${fmt(m.related)}`} />}
                    </div>
                    <span className="mono small" style={{ textAlign: 'right' }}>{tot > 0 ? fmt(tot, { compact: true }) : '—'}</span>
                  </div>
                );
              })}
              <p className="tiny muted" style={{ marginTop: 8 }}>Amber = balance due at maturity within the next 24 months. Amortizing loans show nothing at maturity by definition; the risk sits in balloons and interest-only facilities.</p>
            </div>
          )}
        </Panel>
        <Panel>
          <StackedBarChart title="Debt by entity (balances today)" categories={c.byEntity.filter((e) => e.external + e.related > 0).map((e) => e.name)} series={[{ label: 'External', color: 'amber', values: c.byEntity.filter((e) => e.external + e.related > 0).map((e) => e.external) }, { label: 'Related-party', color: 'green', values: c.byEntity.filter((e) => e.external + e.related > 0).map((e) => e.related) }]} yFormat={(v) => fmt(v, { compact: true })} height={240} note="Entity-level view: related-party loans are real obligations of the borrower even though they vanish on consolidation." />
        </Panel>
      </div>

      <div className="grid grid-2">
        <Panel>
          <div className="dt-chart-title">Collateral pledged</div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Asset</th><th className="num">Value</th><th>Pledged to</th><th className="num">Pledged</th><th></th></tr></thead>
              <tbody>
                {coll.map((r) => (
                  <tr key={r.asset.id} style={{ cursor: 'pointer' }} onClick={() => setSel({ type: 'asset', id: r.asset.id })}>
                    <td>{r.asset.name}</td><td className="num">{fmt(r.asset.value, { compact: true })}</td>
                    <td className="small">{r.loans.length === 0 ? <span className="muted">unencumbered</span> : r.loans.map((l) => `${l.name} (${nameOf(l.lenderId)})`).join(' · ')}</td>
                    <td className="num">{fmt(r.pledged, { compact: true })}</td>
                    <td>{r.cross ? <Chip tone="red">Cross-collateralised</Chip> : r.loans.length ? <Chip tone="amber">{pct(r.pledged / r.asset.value, 0)} LTV</Chip> : <Chip tone="green">Free</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {c.crossCollateral.length > 0 && <p className="tiny" style={{ color: '#e7a398', marginTop: 8 }}>Red flag: an asset pledged against several obligations means a default on one can be enforced against collateral that also secures another — and a second-ranking family lender ranks behind the bank.</p>}
        </Panel>
        <Panel>
          <div className="dt-chart-title">Personal guarantees · contingent exposure</div>
          {c.guarantees.length === 0 ? <EmptyState title="No personal guarantees" /> : (
            <div className="stack" style={{ gap: 10 }}>
              {c.guarantees.map((g) => (
                <div key={g.personId} className="dt-detail" style={{ borderColor: 'var(--red)', cursor: 'pointer' }} onClick={() => setSel({ type: 'person', id: g.personId })}>
                  <div className="row between"><strong>{g.name}</strong><span className="mono" style={{ color: '#e7a398' }}>{fmt(g.exposure, { compact: true })}</span></div>
                  <div className="tiny muted">{g.loanIds.map((id) => { const l = data.loans.find((x) => x.id === id)!; return `${l.name} → ${nameOf(l.lenderId)} (${fmt(c.balances[id], { compact: true })})`; }).join(' · ')}</div>
                </div>
              ))}
              <p className="tiny muted">A guarantee is a liability that does not appear on any entity's balance sheet until it is called. Aggregate it per person; that is the number a lender, a divorce court or an estate will eventually see.</p>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-2">
        <Panel>
          <div className="row between" style={{ marginBottom: 8 }}><div className="dt-chart-title" style={{ marginBottom: 0 }}>Family related-party loans</div><Chip tone="green">Eliminated on consolidation</Chip></div>
          {c.relatedLoans.length === 0 ? <EmptyState title="No related-party loans" /> : (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Lender → borrower</th><th>Loan</th><th className="num">Rate</th><th className="num">Balance</th></tr></thead>
                  <tbody>
                    {c.relatedLoans.map((r) => <tr key={r.loan.id} style={{ cursor: 'pointer' }} onClick={() => setSel({ type: 'loan', id: r.loan.id })}><td>{r.lenderName} → {r.borrowerName}</td><td className="small">{r.loan.name}</td><td className="num">{pct(r.loan.rate, 2)}</td><td className="num">{fmt(r.balance, { compact: true })}</td></tr>)}
                    <tr><td colSpan={3}><strong>Gross intercompany payables</strong></td><td className="num">{fmt(c.eliminated, { compact: true })}</td></tr>
                    <tr><td colSpan={3}><strong>Less: intercompany receivables (same loans, lender side)</strong></td><td className="num" style={{ color: 'var(--green-2)' }}>−{fmt(c.eliminated, { compact: true })}</td></tr>
                    <tr><td colSpan={3}><strong>Net effect on consolidated liabilities</strong></td><td className="num">{fmt(0)}</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="tiny muted" style={{ marginTop: 8 }}>Nets to zero for the family as a whole, which is why external liabilities exclude them. The loans are still real for the entities involved — they need documentation, a market-tested rate, actual payments and tax treatment (e.g. imputed-interest rules on below-market loans), or they are the "false debt" that undermines a structure.</p>
            </>
          )}
        </Panel>
        <Panel tone={c.upcoming.length ? 'warn' : undefined}>
          <div className="dt-chart-title">Upcoming refinancing needs · next 24 months</div>
          {c.upcoming.length === 0 ? <EmptyState title="Nothing matures in the next 24 months" body="Keep watching the calendar: refinancing risk is a date, not a ratio." /> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Loan</th><th>Borrower → lender</th><th>Matures</th><th className="num">Balance now</th><th className="num">Due at maturity</th></tr></thead>
                <tbody>
                  {c.upcoming.map((u) => <tr key={u.loan.id} style={{ cursor: 'pointer' }} onClick={() => setSel({ type: 'loan', id: u.loan.id })}><td>{u.loan.name}{u.loan.relatedParty && <Chip tone="green" className="small" title="Related party"> RP</Chip>}</td><td className="small">{nameOf(u.loan.borrowerId)} → {nameOf(u.loan.lenderId)}</td><td className="mono small">{u.maturity.toISOString().slice(0, 7)} <span className="muted">({u.monthsToMaturity} mo)</span></td><td className="num">{fmt(u.balance, { compact: true })}</td><td className="num" style={{ color: '#e7a398' }}>{fmt(u.dueAtMaturity, { compact: true })}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
          {c.upcoming.length > 0 && <p className="tiny muted" style={{ marginTop: 8 }}>Liquidity of {fmt(c.liquidity, { compact: true })} covers {pct(Math.min(9.99, c.liquidity / Math.max(1, c.upcoming.filter((u) => !u.loan.relatedParty).reduce((s, u) => s + u.dueAtMaturity, 0))), 0)} of the external balances due. Start refinancing conversations 12–18 months out.</p>}
        </Panel>
      </div>

      <FxFootnote />
      <Formulas items={FORMULAS} assumptions={ASSUMPTIONS} />
      <Disclaimer>A consolidated view is a management tool, not a legal one: each entity's creditors can reach only that entity's assets (plus any guarantees), and a group with healthy consolidated equity can still have one insolvent subsidiary. Beneficial-ownership and lending disclosures apply entity by entity.</Disclaimer>
    </div>
  );
}

function Network({ data, c, sel, onSel }: { data: FamilyData; c: ReturnType<typeof consolidate>; sel: Sel; onSel: (s: Sel) => void }) {
  const p = useDrawIn(data.loans.length);
  const pos = (id: string) => POS[id] ?? { x: 450, y: 280 };
  const maxBal = Math.max(1, ...Object.values(c.balances));
  const isSel = (t: string, id: string) => !!sel && sel.type === t && sel.id === id;
  const edgeSel = (id: string) => !!sel && sel.type === 'loan' && sel.id === id;
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  return (
    <svg viewBox="0 0 900 570" className="dt-network" role="img" aria-label="Family ownership and credit network" style={{ minWidth: 520 }} onClick={() => onSel(null)}>
      <defs><radialGradient id="dt-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(201,169,97,0.25)" /><stop offset="100%" stopColor="rgba(201,169,97,0)" /></radialGradient></defs>
      <circle cx={450} cy={220} r={230} fill="url(#dt-glow)" opacity={0.6} />
      {/* ownership */}
      {data.entities.filter((e) => e.ownerId).map((e) => { const a = pos(e.ownerId!), b = pos(e.id); return <line key={`own-${e.id}`} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * p} y2={a.y + (b.y - a.y) * p} stroke="var(--gold)" strokeWidth={1.2} opacity={0.5} />; })}
      {/* assets attached to entity */}
      {data.assets.map((a) => { const e = pos(a.entityId), b = pos(a.id); return <line key={`as-${a.id}`} x1={e.x} y1={e.y} x2={b.x} y2={b.y} stroke="var(--line-strong)" strokeWidth={1} />; })}
      {/* collateral pledges: asset → lender */}
      {data.loans.flatMap((l) => l.collateralIds.map((aid) => { const a = pos(aid), b = pos(l.lenderId); return <line key={`col-${l.id}-${aid}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--ivory-3)" strokeWidth={0.8} strokeDasharray="2 4" opacity={edgeSel(l.id) ? 0.9 : 0.35} />; }))}
      {/* guarantees: person → borrower */}
      {data.loans.flatMap((l) => l.guarantorIds.map((pid) => { const a = pos(pid), b = pos(l.borrowerId); return <line key={`g-${l.id}-${pid}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--red)" strokeWidth={1.2} strokeDasharray="5 4" opacity={edgeSel(l.id) ? 1 : 0.5} />; }))}
      {/* credit edges */}
      {data.loans.map((l, i) => {
        const a = pos(l.lenderId), b = pos(l.borrowerId);
        const bal = c.balances[l.id];
        const w = 1.5 + (bal / maxBal) * 9;
        const color = l.relatedParty ? 'var(--green-2)' : 'var(--amber)';
        const m = mid(a, b);
        const off = (i % 2 === 0 ? 1 : -1) * 14;
        const cx = m.x + off, cy = m.y + off;
        return (
          <g key={l.id} className={`e ${edgeSel(l.id) ? 'sel' : ''}`} opacity={edgeSel(l.id) ? 1 : 0.7} onClick={(e) => { e.stopPropagation(); onSel({ type: 'loan', id: l.id }); }}>
            <path d={`M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`} fill="none" stroke="transparent" strokeWidth={Math.max(14, w + 10)} />
            <path d={`M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`} fill="none" stroke={color} strokeWidth={w * p} strokeLinecap="round" opacity={0.75} />
            <path d={`M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`} fill="none" stroke={color} strokeWidth={1} className="flow-line" opacity={0.9} />
            <text x={cx} y={cy - 6} textAnchor="middle" className="label-mono">{Math.round(bal / 1000).toLocaleString('en-US')}K</text>
          </g>
        );
      })}
      {/* lenders */}
      {data.lenders.filter((l) => data.loans.some((x) => x.lenderId === l.id)).map((l) => { const q = pos(l.id); return <g key={l.id} className={`n ${isSel('lender', l.id) ? 'sel' : ''}`} transform={`translate(${q.x} ${q.y})`} onClick={(e) => { e.stopPropagation(); onSel({ type: 'lender', id: l.id }); }}><rect x={-34} y={-18} width={68} height={36} rx={6} fill="rgba(17,20,27,0.95)" stroke="var(--amber)" strokeWidth={1.4} /><text y={-2} textAnchor="middle">{l.name.split(' ')[0]}</text><text y={11} textAnchor="middle" className="label-mono">{l.type === 'bank' ? 'bank' : l.type}</text></g>; })}
      {/* assets */}
      {data.assets.map((a) => { const q = pos(a.id); const cross = c.crossCollateral.some((x) => x.assetId === a.id); return <g key={a.id} className={`n ${isSel('asset', a.id) ? 'sel' : ''}`} transform={`translate(${q.x} ${q.y})`} onClick={(e) => { e.stopPropagation(); onSel({ type: 'asset', id: a.id }); }}><rect x={-11} y={-11} width={22} height={22} rx={3} fill="rgba(17,20,27,0.95)" stroke={cross ? 'var(--red)' : 'var(--ivory-3)'} strokeWidth={cross ? 2 : 1.2} transform="rotate(45)" /><text y={26} textAnchor="middle" style={{ fontSize: 9 }}>{a.name.split(' (')[0]}</text>{cross && <circle cx={10} cy={-10} r={3.5} fill="var(--red)" />}</g>; })}
      {/* entities */}
      {data.entities.map((e, i) => { const q = pos(e.id); const r = e.kind === 'trust' ? 24 : e.kind === 'holding-company' ? 22 : 18; const appear = Math.max(0, Math.min(1, (p * 1.3 - i * 0.08) * 3)); return <g key={e.id} className={`n ${isSel('entity', e.id) ? 'sel' : ''}`} transform={`translate(${q.x} ${q.y}) scale(${0.6 + 0.4 * appear})`} opacity={appear} onClick={(ev) => { ev.stopPropagation(); onSel({ type: 'entity', id: e.id }); }}><circle r={r + 8} fill={ENTITY_TONE[e.kind]} opacity={0.08} /><circle r={r} fill="rgba(17,20,27,0.95)" stroke={ENTITY_TONE[e.kind]} strokeWidth={1.5} /><circle r={3} fill={ENTITY_TONE[e.kind]} /><text y={r + 14} textAnchor="middle">{e.name}</text></g>; })}
      {/* people */}
      {data.people.filter((pp) => data.loans.some((l) => l.guarantorIds.includes(pp.id))).map((pp) => { const q = pos(pp.id); return <g key={pp.id} className={`n ${isSel('person', pp.id) ? 'sel' : ''}`} transform={`translate(${q.x} ${q.y})`} onClick={(e) => { e.stopPropagation(); onSel({ type: 'person', id: pp.id }); }}><circle r={13} fill="rgba(17,20,27,0.95)" stroke="var(--red)" strokeWidth={1.4} /><circle r={4} fill="var(--red)" opacity={0.7} /><text y={26} textAnchor="middle">{pp.name}</text></g>; })}
    </svg>
  );
}

function DetailPane({ sel, data, c, fmt, nameOf }: { sel: Sel; data: FamilyData; c: ReturnType<typeof consolidate>; fmt: (v: number, o?: { compact?: boolean }) => string; nameOf: (id: string) => string }) {
  if (!sel) return <div className="stack" style={{ gap: 8 }}><div className="dt-chart-title">Details</div><p className="small muted" style={{ margin: 0 }}>Click an entity, lender, asset, guarantor or credit edge in the network. Thick amber edges are the largest external balances; green edges are intra-family and net out on consolidation; red dashed lines are personal guarantees; the red-dotted diamonds are assets pledged more than once.</p></div>;
  const loanRow = (l: DashLoan) => <li key={l.id} className="small"><strong>{l.name}</strong> · {nameOf(l.borrowerId)} ← {nameOf(l.lenderId)} · {fmt(c.balances[l.id], { compact: true })} @ {pct(l.rate, 2)}{l.floating ? ' floating' : ''}</li>;
  if (sel.type === 'loan') {
    const l = data.loans.find((x) => x.id === sel.id);
    if (!l) return null;
    const bal = c.balances[l.id];
    return (
      <div className="dt-detail" style={{ borderColor: l.relatedParty ? 'var(--green-2)' : 'var(--amber)' }}>
        <div className="row between"><strong>{l.name}</strong>{l.relatedParty ? <Chip tone="green">Related party</Chip> : <Chip tone="amber">External</Chip>}</div>
        <dl>
          <dt>Borrower</dt><dd>{nameOf(l.borrowerId)}</dd><dt>Lender</dt><dd>{nameOf(l.lenderId)}</dd>
          <dt>Principal</dt><dd>{fmt(l.principal)}</dd><dt>Balance</dt><dd>{fmt(bal)}</dd>
          <dt>Rate</dt><dd>{pct(l.rate, 2)} {l.floating ? 'floating' : 'fixed'}</dd><dt>Structure</dt><dd>{l.structure}{l.amortizationMonths ? ` (${l.amortizationMonths / 12}-yr amort.)` : ''}</dd>
          <dt>Debt service</dt><dd>{fmt(annualDebtService(l))} / yr</dd><dt>Matures</dt><dd>{maturityDate(l).toISOString().slice(0, 7)}</dd>
          <dt>Collateral</dt><dd>{l.collateralIds.length ? l.collateralIds.map(nameOf).join(', ') : 'unsecured'}</dd>
          <dt>Guarantors</dt><dd>{l.guarantorIds.length ? l.guarantorIds.map(nameOf).join(', ') : 'none'}</dd>
          {l.source === 'scenario' && <><dt>Source</dt><dd>Saved scenario</dd></>}
        </dl>
        {l.relatedParty && <p className="tiny muted" style={{ margin: '8px 0 0' }}>Eliminated on consolidation; still a real obligation of {nameOf(l.borrowerId)} and a real asset of {nameOf(l.lenderId)}.</p>}
      </div>
    );
  }
  if (sel.type === 'entity') {
    const e = data.entities.find((x) => x.id === sel.id); if (!e) return null;
    const row = c.byEntity.find((x) => x.entityId === e.id)!;
    const assets = data.assets.filter((a) => a.entityId === e.id);
    const borrowed = data.loans.filter((l) => l.borrowerId === e.id), lent = data.loans.filter((l) => l.lenderId === e.id);
    return (
      <div className="dt-detail" style={{ borderColor: ENTITY_TONE[e.kind] }}>
        <strong>{e.name}</strong>{e.id === SCENARIO_ENTITY.id && <p className="tiny muted" style={{ margin: '4px 0 0' }}>Loans from your saved Leverage / Family-Bank scenarios.</p>}
        <dl><dt>Owner</dt><dd>{e.ownerId ? `${nameOf(e.ownerId)} ${e.ownerPct ?? 100}%` : e.kind === 'scenario' ? '—' : 'top of structure'}</dd><dt>Assets + cash</dt><dd>{fmt(row.assets, { compact: true })}</dd><dt>External debt</dt><dd>{fmt(row.external, { compact: true })}</dd><dt>Related-party debt</dt><dd>{fmt(row.related, { compact: true })}</dd><dt>Entity equity</dt><dd style={{ color: row.equity < 0 ? '#e7a398' : undefined }}>{fmt(row.equity, { compact: true })}</dd></dl>
        {assets.length > 0 && <p className="tiny muted" style={{ margin: '8px 0 0' }}>Holds: {assets.map((a) => `${a.name.split(' (')[0]} ${fmt(a.value, { compact: true })}`).join(' · ')}</p>}
        {borrowed.length > 0 && <><div className="eyebrow" style={{ marginTop: 8 }}>Borrows</div><ul style={{ margin: 4, paddingLeft: 16 }}>{borrowed.map(loanRow)}</ul></>}
        {lent.length > 0 && <><div className="eyebrow" style={{ marginTop: 8 }}>Lends</div><ul style={{ margin: 4, paddingLeft: 16 }}>{lent.map(loanRow)}</ul></>}
      </div>
    );
  }
  if (sel.type === 'lender') {
    const l = data.lenders.find((x) => x.id === sel.id); if (!l) return null;
    const ls = data.loans.filter((x) => x.lenderId === l.id);
    const total = ls.reduce((s, x) => s + c.balances[x.id], 0);
    return <div className="dt-detail" style={{ borderColor: 'var(--amber)' }}><strong>{l.name}</strong>{l.id === SCENARIO_LENDER.id && <p className="tiny muted" style={{ margin: '4px 0 0' }}>Placeholder lender for saved scenarios.</p>}<dl><dt>Exposure to family</dt><dd>{fmt(total, { compact: true })}</dd><dt>Facilities</dt><dd>{ls.length}</dd><dt>Cross-default risk</dt><dd>{ls.length > 1 ? `${ls.length} facilities — one default can trigger the others` : 'single facility'}</dd></dl><ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>{ls.map(loanRow)}</ul></div>;
  }
  if (sel.type === 'person') {
    const pp = data.people.find((x) => x.id === sel.id); if (!pp) return null;
    const g = c.guarantees.find((x) => x.personId === pp.id);
    return <div className="dt-detail" style={{ borderColor: 'var(--red)' }}><strong>{pp.name}</strong><div className="tiny muted">{pp.role}</div><dl><dt>Contingent exposure</dt><dd style={{ color: '#e7a398' }}>{fmt(g?.exposure ?? 0, { compact: true })}</dd><dt>Guarantees</dt><dd>{g?.loanIds.length ?? 0}</dd></dl><ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>{(g?.loanIds ?? []).map((id) => loanRow(data.loans.find((l) => l.id === id)!))}</ul><p className="tiny muted" style={{ margin: '8px 0 0' }}>If any guaranteed loan defaults, the lender can pursue this person's own assets — outside every entity in the structure.</p></div>;
  }
  const a = data.assets.find((x) => x.id === sel.id); if (!a) return null;
  const ls = data.loans.filter((l) => l.collateralIds.includes(a.id));
  const pledged = ls.reduce((s, l) => s + c.balances[l.id], 0);
  return <div className="dt-detail" style={{ borderColor: ls.length > 1 ? 'var(--red)' : 'var(--ivory-3)' }}><div className="row between"><strong>{a.name}</strong>{ls.length > 1 && <Chip tone="red">Cross-collateralised</Chip>}</div><dl><dt>Owner</dt><dd>{nameOf(a.entityId)}</dd><dt>Value</dt><dd>{fmt(a.value, { compact: true })}</dd><dt>Pledged</dt><dd>{fmt(pledged, { compact: true })} ({pct(pledged / a.value, 0)})</dd><dt>Free equity</dt><dd>{fmt(a.value - pledged, { compact: true })}</dd></dl>{ls.length > 0 && <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>{ls.map(loanRow)}</ul>}{ls.length > 1 && <p className="tiny muted" style={{ margin: '8px 0 0' }}>Ranking between these lenders depends on registration order and any intercreditor agreement; a family lender ranking second is exposed to the bank's enforcement.</p>}</div>;
}
