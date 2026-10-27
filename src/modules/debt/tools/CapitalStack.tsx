import { useMemo, useState } from 'react';
import { Chip, Disclaimer, EmptyState, Panel, Stat, Tabs, useMoney } from '@/components/ui';
import { pct } from '@/lib/format';
import { useDrawIn, useTween } from './shared/hooks';
import { BarChart, C, SegmentBar } from './shared/Charts';
import ScenarioBar from './shared/ScenarioBar';
import Formulas, { type FormulaItem } from './shared/Formulas';
import { FxFootnote, Head, MoneyField, PctField } from './shared/Fields';
import { num, path } from './shared/util';
import { blendedCost, byRank, defaultStack, KIND_META, liquidationWaterfall, moveTranche, normalizeRanks, paymentWaterfall, stackGap, stackTotal, TARGET_TOTAL, type StackTranche } from './math/stack';
import './shared/tools.css';

export interface CapitalStackScenarioData {
  tool: 'capital-stack'; version: 1; mode: 'development' | 'acquisition'; target: number; tranches: StackTranche[]; cashAvailable: number; saleValue: number;
  outputs: { total: number; gap: number; blendedCost: number; debtShare: number; annualObligations: number };
}

const FORMULAS: FormulaItem[] = [
  { label: 'Stack total', formula: 'Σ tranche amounts', note: 'Must equal the capital required (gap shown when it does not).' },
  { label: 'Annual obligation (debt / preferred)', formula: 'amount × rate (coupon or preferred return)' },
  { label: 'Payment waterfall', formula: 'pay tranches in rank order, each min(remaining cash, obligation); common receives the residual', note: 'distributeWaterfall from @/lib/finance, with obligations passed as amounts.' },
  { label: 'Liquidation waterfall', formula: 'repay principal in rank order; common receives any surplus; losses fall on the lowest-ranked tranches first' },
  { label: 'Recovery %', formula: 'recovered ÷ claim' },
  { label: 'Blended cost of capital (illustrative)', formula: 'Σ (amount ÷ total) × rate', note: 'WACC-style; pre-tax, treats the common target return as its cost.' },
];
const ASSUMPTIONS = [
  'Interest and preferred returns are current-pay and annual; no PIK, accruals, fees or amortization.',
  'Liquidation ignores transaction costs, taxes, swap breakage and the order in which claims would actually be proven in an insolvency.',
  'Ranks model a simple intercreditor arrangement; real agreements add standstills, payment blocks and cure rights that change who gets what and when.',
  'The common "rate" is a target return, not a contractual entitlement — it is used only for the blended-cost illustration.',
];

const CONCEPTS = [
  { title: 'Security priority (first lien)', body: 'The senior lender holds a first-ranking mortgage or charge over the asset itself. In a sale or enforcement it is paid before anyone else from that collateral, which is why it accepts the lowest rate.' },
  { title: 'Contractual subordination (intercreditor agreement)', body: 'Subordinated lenders agree in writing to rank behind the senior lender — payment blocks, standstill periods, turnover of any proceeds received out of order. The subordination lives in the contract, not in the asset.' },
  { title: 'Structural subordination', body: 'Mezzanine lenders often lend to the holding company and take a pledge of its shares in the property-owning company. They are not creditors of the asset owner at all; they are behind every creditor of the subsidiary, by structure.' },
  { title: 'Residual equity ownership', body: 'Preferred equity sits behind all debt but ahead of common with a fixed return and liquidation preference. Common equity owns whatever is left — unlimited upside, first loss, no contractual claim.' },
];

export default function CapitalStack() {
  const [mode, setMode] = useState<'development' | 'acquisition'>('acquisition');
  const [tranches, setTranches] = useState<StackTranche[]>(() => defaultStack('acquisition'));
  const [cashAvailable, setCash] = useState(420_000);
  const [saleValue, setSale] = useState(4_200_000);
  const [scenario, setScenario] = useState<'waterfall' | 'liquidation' | 'returns'>('waterfall');
  const [selected, setSelected] = useState<string | null>(null);
  const fmt = useMoney();

  const total = stackTotal(tranches);
  const gap = stackGap(tranches, TARGET_TOTAL);
  const sorted = useMemo(() => byRank(tranches), [tranches]);
  const waterfall = useMemo(() => paymentWaterfall(tranches, cashAvailable), [tranches, cashAvailable]);
  const liquidation = useMemo(() => liquidationWaterfall(tranches, saleValue), [tranches, saleValue]);
  const cost = useMemo(() => blendedCost(tranches), [tranches]);

  const update = (id: string, patch: Partial<StackTranche>) => setTranches((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const switchMode = (m: 'development' | 'acquisition') => { setMode(m); setTranches(defaultStack(m)); setSelected(null); };
  const sel = tranches.find((t) => t.id === selected) ?? null;

  const data: CapitalStackScenarioData = { tool: 'capital-stack', version: 1, mode, target: TARGET_TOTAL, tranches, cashAvailable, saleValue, outputs: { total, gap, blendedCost: cost.blended, debtShare: cost.debtShare, annualObligations: waterfall.totalDue } };

  return (
    <div className="dt-tool">
      <Head eyebrow="Tool 04 · Capital stack" title="Capital Stack Visualizer" lede={`Finance a ${fmt(TARGET_TOTAL, { compact: true })} ${mode === 'development' ? 'property development' : 'business acquisition'} with layers of capital that rank differently. Then run cash through the stack, sell the asset for less than you paid, and see who is paid, who is shorted and what the whole structure costs.`}>
        <Tabs size="sm" value={mode} onChange={switchMode} tabs={[{ id: 'acquisition', label: 'Business acquisition' }, { id: 'development', label: 'Property development' }]} />
      </Head>

      <ScenarioBar kind="capital-stack" defaultName={`Stack · ${mode} · ${pct(cost.debtShare, 0)} debt`} data={data}
        onLoad={(d) => { const x = d as Partial<CapitalStackScenarioData>; if (x?.tranches?.length) { setTranches(normalizeRanks(x.tranches)); if (x.mode) setMode(x.mode); if (typeof x.cashAvailable === 'number') setCash(x.cashAvailable); if (typeof x.saleValue === 'number') setSale(x.saleValue); } }}
        report={() => ({
          title: 'Capital Stack — summary', tool: 'Capital Stack Visualizer',
          inputs: [['Use of funds', `${mode} · ${fmt(TARGET_TOTAL)}`], ...sorted.map((t) => [`${t.rank}. ${t.name} (${KIND_META[t.kind].label})`, `${fmt(t.amount)} @ ${pct(t.rate, 1)}`]), ['Annual cash available', fmt(cashAvailable)], ['Liquidation value', fmt(saleValue)]].map(([label, value]) => ({ label, value })),
          outputs: [['Stack total / gap', `${fmt(total)} / ${fmt(gap)}`], ['Annual obligations (debt + preferred)', fmt(waterfall.totalDue)], ['Paid / residual to common', `${fmt(waterfall.totalPaid)} / ${fmt(waterfall.residualToCommon)}`], ...waterfall.rows.filter((r) => r.kind !== 'common').map((r) => [`Waterfall · ${r.name}`, `${fmt(r.paid)} of ${fmt(r.due)} (${pct(r.coverage, 0)})`]), ...liquidation.rows.map((r) => [`Liquidation · ${r.name}`, `recovers ${fmt(r.recovered)} of ${fmt(r.claim)} (${pct(r.recoveryPct, 0)})`]), ['Blended cost of capital (illustrative)', pct(cost.blended, 2)], ['Debt share', pct(cost.debtShare, 0)]].map(([label, value]) => ({ label, value })),
          formulas: FORMULAS, assumptions: ASSUMPTIONS,
        })}
        compareFields={[{ label: 'Mode', get: (d) => String(path(d, 'mode') ?? '—') }, { label: 'Stack total', get: (d) => fmt(num(d, 'outputs.total')) }, { label: 'Debt share', get: (d) => pct(num(d, 'outputs.debtShare'), 0) }, { label: 'Blended cost', get: (d) => pct(num(d, 'outputs.blendedCost'), 2) }, { label: 'Annual obligations', get: (d) => fmt(num(d, 'outputs.annualObligations')) }, { label: 'Cash available', get: (d) => fmt(num(d, 'cashAvailable')) }, { label: 'Liquidation value', get: (d) => fmt(num(d, 'saleValue')) }]}
      />

      <div className="dt-layout">
        <Panel tight className="dt-inputs">
          <div className="row between"><div className="eyebrow">Design the stack</div><button className="btn sm ghost" onClick={() => setTranches(defaultStack(mode))}>Reset</button></div>
          {sorted.map((t, i) => (
            <div key={t.id} className="dt-inputs-group" style={{ paddingTop: i === 0 ? 0 : undefined }}>
              <div className="row between" style={{ gap: 6 }}>
                <span className="row" style={{ gap: 8 }}><span className="sw" style={{ width: 12, height: 12, borderRadius: 3, background: C[KIND_META[t.kind].color], display: 'inline-block' }} /><strong className="small">{t.rank}. {KIND_META[t.kind].label}</strong></span>
                {t.kind !== 'common' && <span className="row" style={{ gap: 4 }}><button className="btn sm ghost" onClick={() => setTranches((x) => moveTranche(x, t.id, -1))} disabled={i === 0} aria-label="Rank up">↑</button><button className="btn sm ghost" onClick={() => setTranches((x) => moveTranche(x, t.id, 1))} disabled={sorted[i + 1]?.kind === 'common'} aria-label="Rank down">↓</button></span>}
              </div>
              <input className="input" value={t.name} onChange={(e) => update(t.id, { name: e.target.value })} aria-label="Tranche name" style={{ padding: '6px 8px', fontSize: '0.82rem' }} />
              <div className="field">
                <div className="row between"><label>Amount</label><span className="mono small gold">{fmt(t.amount, { compact: true })}</span></div>
                <input type="range" min={0} max={TARGET_TOTAL} step={50_000} value={t.amount} onChange={(e) => update(t.id, { amount: parseFloat(e.target.value) })} aria-label={`${t.name} amount`} />
              </div>
              <PctField label={t.kind === 'common' ? 'Target return (for blended cost)' : t.kind === 'preferred' ? 'Preferred return' : 'Coupon / rate'} value={t.rate} onChange={(v) => update(t.id, { rate: v })} min={0} max={50} step={0.25} />
            </div>
          ))}
          <div className="dt-inputs-group">
            <div className="dt-readout"><span>Stack total</span><b>{fmt(total)}</b></div>
            <div className="dt-readout"><span>Required</span><b>{fmt(TARGET_TOTAL)}</b></div>
            <div className="dt-readout"><span>{gap > 0 ? 'Funding gap' : gap < 0 ? 'Over-funded by' : 'Balanced'}</span><b style={{ color: gap === 0 ? 'var(--green-2)' : '#e7a398' }}>{gap === 0 ? '✓' : fmt(Math.abs(gap))}</b></div>
            {gap !== 0 && <button className="btn sm" onClick={() => { const common = tranches.find((t) => t.kind === 'common'); if (common) update(common.id, { amount: Math.max(0, common.amount + gap) }); }}>Balance with common equity</button>}
          </div>
          <FxFootnote />
        </Panel>

        <div className="dt-results">
          <div className="dt-stats">
            <Stat label="Capital required" value={fmt(TARGET_TOTAL)} sub={gap === 0 ? 'Fully funded' : gap > 0 ? `${fmt(gap)} short` : `${fmt(-gap)} over`} tone={gap === 0 ? 'green' : 'red'} />
            <Stat label="Debt / equity" value={`${pct(cost.debtShare, 0)} / ${pct(cost.equityShare, 0)}`} sub="Senior + sub + mezz vs preferred + common" />
            <Stat label="Annual obligations" value={fmt(waterfall.totalDue)} sub="Interest + preferred returns, before common" tone="amber" />
            <Stat label="Blended cost of capital" value={pct(cost.blended, 2)} sub="Illustrative, pre-tax, WACC-style" tone="gold" />
          </div>

          <div className="dt-stackcol">
            <Panel style={{ flex: '0 0 auto', width: 'min(100%, 300px)' }}>
              <div className="dt-chart-title">The stack · payment priority ↓</div>
              <StackColumn tranches={sorted} gap={gap} mode={scenario} waterfall={waterfall} liquidation={liquidation} selected={selected} onSelect={setSelected} fmt={(v) => fmt(v, { compact: true })} />
            </Panel>
            <div className="stack" style={{ flex: 1, minWidth: 0 }}>
              <Panel>
                {sel ? (
                  <div className="dt-detail" style={{ borderColor: C[KIND_META[sel.kind].color] }}>
                    <div className="row between"><strong>{sel.name}</strong><Chip tone={KIND_META[sel.kind].color === 'gold' ? 'gold' : KIND_META[sel.kind].color}>{KIND_META[sel.kind].label}</Chip></div>
                    <dl>
                      <dt>Rank</dt><dd>{sel.rank} of {tranches.length}</dd>
                      <dt>Amount</dt><dd>{fmt(sel.amount)} · {pct(total > 0 ? sel.amount / total : 0, 0)} of stack</dd>
                      <dt>{sel.kind === 'common' ? 'Target return' : 'Rate'}</dt><dd>{pct(sel.rate, 2)} (typical {KIND_META[sel.kind].typicalRate})</dd>
                      <dt>Annual claim</dt><dd>{sel.kind === 'common' ? 'residual' : fmt(sel.amount * sel.rate)}</dd>
                      <dt>Attachment</dt><dd>{fmt(sorted.filter((t) => t.rank < sel.rank).reduce((s, t) => s + t.amount, 0))} → {fmt(sorted.filter((t) => t.rank <= sel.rank).reduce((s, t) => s + t.amount, 0))}</dd>
                    </dl>
                    <p className="small muted" style={{ margin: '8px 0 0' }}>{KIND_META[sel.kind].security}</p>
                  </div>
                ) : (
                  <div className="stack" style={{ gap: 10 }}>
                    <div className="dt-chart-title">How the layers rank</div>
                    {CONCEPTS.map((c) => <div key={c.title} className="dt-detail"><strong>{c.title}</strong><p className="small muted" style={{ margin: '4px 0 0' }}>{c.body}</p></div>)}
                    <p className="tiny muted">Click a layer in the column for its details.</p>
                  </div>
                )}
              </Panel>
            </div>
          </div>

          <Panel>
            <div className="dt-tabrow">
              <div className="dt-chart-title" style={{ marginBottom: 0 }}>Scenarios</div>
              <Tabs size="sm" value={scenario} onChange={setScenario} tabs={[{ id: 'waterfall', label: 'a · Payment waterfall' }, { id: 'liquidation', label: 'b · Liquidation' }, { id: 'returns', label: 'c · Returns & cost' }]} />
            </div>
            <div style={{ marginTop: 16 }}>
              {scenario === 'waterfall' && (
                <div className="stack">
                  <div className="grid grid-2" style={{ alignItems: 'end' }}>
                    <MoneyField label="Annual cash available for distribution (after operating costs)" value={cashAvailable} onChange={setCash} step={10000} />
                    <div className="dt-kv"><span className="k">Total obligations ahead of common</span><span className="v">{fmt(waterfall.totalDue)}</span><span className="k">Paid</span><span className="v">{fmt(waterfall.totalPaid)}</span><span className="k">Residual to common</span><span className="v" style={{ color: waterfall.residualToCommon > 0 ? 'var(--green-2)' : '#e7a398' }}>{fmt(waterfall.residualToCommon)} {waterfall.commonAmount > 0 ? `(${pct(waterfall.residualToCommon / waterfall.commonAmount, 1)} on ${fmt(waterfall.commonAmount, { compact: true })})` : ''}</span></div>
                  </div>
                  <input type="range" min={0} max={1_500_000} step={10_000} value={cashAvailable} onChange={(e) => setCash(parseFloat(e.target.value))} aria-label="Cash available" />
                  <FlowRows rows={waterfall.rows.map((r) => ({ id: r.id, name: r.name, kind: r.kind, label: r.kind === 'common' ? 'residual' : `due ${fmt(r.due)}`, paid: r.paid, target: r.kind === 'common' ? Math.max(r.paid, r.due) : r.due, shortfall: r.shortfall, pctLabel: r.kind === 'common' ? (r.due > 0 ? `${pct(r.paid / r.due, 0)} of target` : '') : pct(r.coverage, 0) }))} fmt={fmt} paidLabel="paid" />
                  <p className="tiny muted">Cash flows down the stack in rank order. A shortfall anywhere above common is a default on that tranche; common simply receives less — or nothing.</p>
                </div>
              )}
              {scenario === 'liquidation' && (
                <div className="stack">
                  <div className="grid grid-2" style={{ alignItems: 'end' }}>
                    <MoneyField label="Sale / liquidation value" value={saleValue} onChange={setSale} step={50000} />
                    <div className="dt-kv"><span className="k">Total claims</span><span className="v">{fmt(liquidation.totalClaims)}</span><span className="k">Total loss</span><span className="v" style={{ color: liquidation.totalLoss > 0 ? '#e7a398' : 'var(--green-2)' }}>{fmt(liquidation.totalLoss)}</span><span className="k">Surplus to common</span><span className="v">{fmt(liquidation.surplusToCommon)}</span></div>
                  </div>
                  <input type="range" min={0} max={7_000_000} step={50_000} value={saleValue} onChange={(e) => setSale(parseFloat(e.target.value))} aria-label="Sale value" />
                  <SegmentBar tall total={Math.max(liquidation.totalClaims, saleValue)} segments={[...liquidation.rows.map((r) => ({ label: `${r.name} recovered`, value: r.recovered, color: C[KIND_META[r.kind].color] })), { label: 'Capital lost', value: liquidation.totalLoss, color: 'red' }]} format={(v) => fmt(v)} showLegend={false} />
                  <FlowRows rows={liquidation.rows.map((r) => ({ id: r.id, name: r.name, kind: r.kind, label: `claim ${fmt(r.claim)}`, paid: r.recovered, target: Math.max(r.claim, r.recovered), shortfall: r.loss, pctLabel: `${pct(r.recoveryPct, 0)} recovery` }))} fmt={fmt} paidLabel="recovered" />
                  <p className="tiny muted">Principal is repaid top-down; losses are absorbed bottom-up. Common is wiped first, then preferred, then mezzanine — the senior lender loses money only after everyone below it has lost everything.</p>
                </div>
              )}
              {scenario === 'returns' && (
                <div className="grid grid-2" style={{ alignItems: 'start' }}>
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Tranche</th><th className="num">Weight</th><th className="num">Cost</th><th className="num">Contribution</th></tr></thead>
                      <tbody>
                        {cost.parts.map((p) => <tr key={p.id}><td><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: C[KIND_META[p.kind].color], marginRight: 8, verticalAlign: -1 }} />{p.name}</td><td className="num">{pct(p.weight, 0)}</td><td className="num">{pct(p.rate, 2)}</td><td className="num">{pct(p.contribution, 2)}</td></tr>)}
                        <tr><td><strong>Blended cost of capital</strong></td><td className="num">100%</td><td className="num"></td><td className="num"><strong className="gold">{pct(cost.blended, 2)}</strong></td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <BarChart title="Illustrative cost of each layer" groups={cost.parts.map((p) => KIND_META[p.kind].label.split(' ')[0])} series={[{ label: 'Rate / target return', color: 'gold', values: cost.parts.map((p) => p.rate * 100) }]} yFormat={(v) => `${v.toFixed(0)}%`} height={200} />
                    <p className="tiny muted">Cheaper layers are cheaper because they are safer — they are paid first and secured first. Pushing more of the stack into senior debt lowers the blended cost and raises the fixed obligations the asset must meet every year. That is the tradeoff, and it does not go away.</p>
                  </div>
                </div>
              )}
            </div>
          </Panel>
          {tranches.length === 0 && <EmptyState title="No tranches" body="Reset the stack to start again." />}
        </div>
      </div>

      <Formulas items={FORMULAS} assumptions={ASSUMPTIONS} />
      <Disclaimer>Real capital stacks are governed by loan agreements, intercreditor agreements, shareholder agreements and insolvency law in the relevant jurisdiction. The ranking shown here is the simplified default; documents can and do change it. Tax treatment of interest versus preferred distributions differs by entity and jurisdiction and needs professional review.</Disclaimer>
    </div>
  );
}

function StackColumn({ tranches, gap, mode, waterfall, liquidation, selected, onSelect, fmt }: { tranches: StackTranche[]; gap: number; mode: 'waterfall' | 'liquidation' | 'returns'; waterfall: ReturnType<typeof paymentWaterfall>; liquidation: ReturnType<typeof liquidationWaterfall>; selected: string | null; onSelect: (id: string | null) => void; fmt: (v: number) => string }) {
  const W = 300, H = 540, PAD = 10, X = 70, BW = 120;
  const total = Math.max(TARGET_TOTAL, stackTotal(tranches) + Math.max(0, gap));
  const p = useDrawIn(tranches.map((t) => `${t.id}:${t.amount}:${t.rank}`).join('|') + gap);
  const scale = (H - PAD * 2) / total;
  let y = PAD;
  const fillFor = (id: string) => {
    if (mode === 'waterfall') { const r = waterfall.rows.find((x) => x.id === id); return r ? (r.kind === 'common' ? (r.paid > 0 ? 1 : 0) : Math.min(1, r.coverage)) : 1; }
    if (mode === 'liquidation') { const r = liquidation.rows.find((x) => x.id === id); return r ? Math.min(1, r.recoveryPct) : 1; }
    return 1;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dt-chart" role="img" aria-label="Capital stack column" onClick={() => onSelect(null)}>
      <defs><pattern id="dt-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="var(--red)" strokeWidth="2" opacity="0.6" /></pattern></defs>
      {tranches.map((t) => {
        const h = Math.max(0, t.amount) * scale * p;
        const top = y; y += h;
        const color = C[KIND_META[t.kind].color];
        const fill = fillFor(t.id);
        const isSel = selected === t.id;
        return (
          <g key={t.id} className={`n ${isSel ? 'sel' : ''}`} onClick={(e) => { e.stopPropagation(); onSelect(isSel ? null : t.id); }} style={{ cursor: 'pointer' }}>
            <rect x={X} y={top} width={BW} height={h} fill={color} opacity={0.18} stroke={color} strokeWidth={isSel ? 2.4 : 1} />
            <rect x={X} y={top + h * (1 - fill)} width={BW} height={h * fill} fill={color} opacity={mode === 'returns' ? 0.55 : 0.75} style={{ transition: 'all 0.6s var(--ease)' }} />
            {fill < 1 && h > 4 && <rect x={X} y={top} width={BW} height={h * (1 - fill)} fill="url(#dt-hatch)" />}
            {h > 14 && <text x={X + BW + 8} y={top + Math.min(h / 2 + 4, 14)} style={{ fontSize: 10, fill: 'var(--ivory-2)', fontFamily: 'var(--font-body)' }}>{KIND_META[t.kind].label.split(' ')[0]}</text>}
            {h > 28 && <text x={X + BW + 8} y={top + Math.min(h / 2 + 18, 28)} className="label-mono" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>{fmt(t.amount)} · {pct(t.rate, 1)}</text>}
            {h > 10 && <text x={X - 8} y={top + h / 2 + 4} textAnchor="end" style={{ fontSize: 10, fill: 'var(--ivory-3)' }}>#{t.rank}</text>}
          </g>
        );
      })}
      {gap > 0 && (() => { const h = gap * scale * p; const top = y; return <g><rect x={X} y={top} width={BW} height={h} fill="url(#dt-hatch)" stroke="var(--red)" strokeDasharray="4 3" /><text x={X + BW + 8} y={top + h / 2 + 4} style={{ fontSize: 10, fill: '#e7a398' }}>Gap {fmt(gap)}</text></g>; })()}
      {gap < 0 && <text x={X} y={H - 2} style={{ fontSize: 10, fill: '#e7a398' }}>Over-funded by {fmt(-gap)}</text>}
      <line x1={X - 40} y1={PAD} x2={X - 40} y2={H - PAD} stroke="var(--line-strong)" markerEnd="url(#arrow)" />
      <text x={X - 44} y={PAD + 8} textAnchor="end" style={{ fontSize: 8, fill: 'var(--ivory-3)' }} transform={`rotate(-90 ${X - 44} ${PAD + 8})`}>paid first</text>
      <text x={X - 44} y={H - PAD} textAnchor="start" style={{ fontSize: 8, fill: 'var(--ivory-3)' }} transform={`rotate(-90 ${X - 44} ${H - PAD})`}>first loss</text>
    </svg>
  );
}

function FlowRows({ rows, fmt, paidLabel }: { rows: { id: string; name: string; kind: StackTranche['kind']; label: string; paid: number; target: number; shortfall: number; pctLabel: string }[]; fmt: (v: number) => string; paidLabel: string }) {
  return (
    <div className="stack" style={{ gap: 8 }}>
      {rows.map((r, i) => (
        <AnimatedRow key={r.id} row={r} fmt={fmt} paidLabel={paidLabel} delay={i * 0.12} />
      ))}
    </div>
  );
}

function AnimatedRow({ row, fmt, paidLabel, delay }: { row: { id: string; name: string; kind: StackTranche['kind']; label: string; paid: number; target: number; shortfall: number; pctLabel: string }; fmt: (v: number) => string; paidLabel: string; delay: number }) {
  const paid = useTween(row.paid, 700);
  const color = C[KIND_META[row.kind].color];
  const w = row.target > 0 ? Math.min(100, (paid / row.target) * 100) : 0;
  const shorted = row.shortfall > 0.5 && row.kind !== 'common';
  return (
    <div className="dt-tranche-row" style={{ gridTemplateColumns: '14px 1fr 2fr auto', transitionDelay: `${delay}s` }}>
      <span className="sw" style={{ background: color }} />
      <div><strong className="small">{row.name}</strong><div className="tiny muted mono">{row.label}</div></div>
      <div>
        <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}><div style={{ width: `${w}%`, height: '100%', background: shorted ? `linear-gradient(90deg, ${color}, var(--red))` : color, transition: `width 0.7s var(--ease) ${delay}s` }} /></div>
        <div className="tiny mono muted" style={{ marginTop: 2 }}>{paidLabel} {fmt(paid)}{row.shortfall > 0.5 ? <span style={{ color: '#e7a398' }}> · short {fmt(row.shortfall)}</span> : ''}</div>
      </div>
      <Chip tone={shorted ? 'red' : row.kind === 'common' && row.paid <= 0 ? 'red' : 'green'}>{row.pctLabel || (row.paid > 0 ? 'paid' : 'nothing')}</Chip>
    </div>
  );
}
