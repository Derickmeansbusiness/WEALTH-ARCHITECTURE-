import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, SectionHeader, Chip, Disclaimer, Callout, Stat, useMoney, ObjectiveTags, Eyebrow, NumberField, SliderField, Tabs } from '@/components/ui';
import { pct } from '@/lib/format';
import { MODELS, STOPS, TRANSITIONS, HORIZON, DEFAULT_ASSUMPTIONS, simulate, ownership, transitionsBy, descendants, stopIndex, wealthAt, type Model, type Assumptions } from './math';
import { LESSONS, GOVERNANCE } from './lessons';
import './timeline.css';

const MODEL_COLOR: Record<Model, string> = { direct: 'var(--red)', trust: 'var(--violet)', succession: 'var(--gold)', office: 'var(--blue)' };
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function useAnimatedYear(target: number) {
  const [year, setYear] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now(); const a = from.current; const dur = 1400 + Math.abs(target - a) * 10;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const y = a + (target - a) * ease(p);
      setYear(y); from.current = y;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return year;
}

export default function TimelinePage() {
  const fmt = useMoney();
  const [target, setTarget] = useState(0);
  const [model, setModel] = useState<Model>('direct');
  const [view, setView] = useState<'single' | 'compare'>('single');
  const [a, setA] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const year = useAnimatedYear(target);
  const sims = useMemo(() => Object.fromEntries(MODELS.map((m) => [m.id, simulate(m.id, a)])) as Record<Model, ReturnType<typeof simulate>>, [a]);
  const sim = sims[model];
  const own = ownership(model, year, a.k, a.activeHeirs);
  const stop = stopIndex(year);
  const gen = transitionsBy(year) + 1;

  const setLeak = (m: Model, v: number) => setA((p) => ({ ...p, leakage: { ...p.leakage, [m]: v } }));

  return (
    <div className="page container">
      <SectionHeader eyebrow="The 100-Year Timeline" title="Four generations. Four ways of inheriting." lede="Jump forward through a century and watch what happens to ownership, decisions and the family balance sheet under direct inheritance, a dynasty trust, a business-succession plan, and family-office governance. Every number here is an illustration driven by the assumptions you can edit below.">
        <ObjectiveTags objectives={['estate-planning', 'succession', 'governance', 'tax-planning']} />
      </SectionHeader>

      <Panel tight>
        <div className="row between" style={{ gap: 18 }}>
          <div className="row" style={{ gap: 18 }}>
            <div className="tl-year num">{Math.round(year)}</div>
            <div className="stack" style={{ gap: 4 }}>
              <Eyebrow>Years from today</Eyebrow>
              <span className="small muted">Generation {gen} holds the wealth · {descendants(year, a.k)} living descendant{descendants(year, a.k) > 1 ? 's' : ''} in that generation</span>
              <div className="tl-stops" role="group" aria-label="Jump forward">
                {STOPS.map((s) => <button key={s} className={`btn sm ${target === s ? 'active' : 'ghost'}`} onClick={() => setTarget(s)}>+{s} yrs</button>)}
              </div>
            </div>
          </div>
          <div className="stack" style={{ gap: 8, alignItems: 'flex-end' }}>
            <Tabs size="sm" value={view} onChange={setView} tabs={[{ id: 'single', label: 'One model' }, { id: 'compare', label: 'Side by side' }]} />
            <div className="row" style={{ gap: 6 }}>
              {MODELS.map((m) => <button key={m.id} className={`btn sm ${model === m.id ? 'active' : 'ghost'}`} onClick={() => setModel(m.id)} style={{ borderColor: model === m.id ? MODEL_COLOR[m.id] : undefined }}><i style={{ width: 8, height: 8, borderRadius: 4, background: MODEL_COLOR[m.id], display: 'inline-block' }} />{m.short}</button>)}
            </div>
          </div>
        </div>
      </Panel>

      <div className="tl-layout" style={{ marginTop: 18 }}>
        <div className="stack">
          <Panel tight>
            <Eyebrow>Timeline · {MODELS.find((m) => m.id === model)!.label}</Eyebrow>
            <div className="tl-svg-wrap" style={{ marginTop: 10 }}>
              <TimelineAxis year={year} sim={sim} model={model} />
            </div>
          </Panel>
          {view === 'single' ? (
            <Panel tight>
              <div className="row between"><Eyebrow>Family tree and ownership</Eyebrow><span className="tiny muted">{a.k} children per person · transitions at years {TRANSITIONS.join(', ')}</span></div>
              <div className="tl-svg-wrap" style={{ marginTop: 10 }}>
                <FamilyTree year={year} model={model} k={a.k} activeHeirs={a.activeHeirs} />
              </div>
            </Panel>
          ) : (
            <div className="grid grid-2">
              {MODELS.map((m) => (
                <Panel key={m.id} tight className={model === m.id ? 'gold' : ''}>
                  <div className="row between"><span className="small" style={{ color: MODEL_COLOR[m.id] }}>{m.label}</span><span className="mono tiny muted">{fmt(wealthAt(sims[m.id], year), { compact: true })}</span></div>
                  <div className="tl-svg-wrap" style={{ marginTop: 8 }}>
                    <FamilyTree year={year} model={m.id} k={a.k} activeHeirs={a.activeHeirs} compact />
                  </div>
                </Panel>
              ))}
            </div>
          )}

          <div className="tl-models">
            {MODELS.map((m) => {
              const o = ownership(m.id, year, a.k, a.activeHeirs); const s = sims[m.id];
              const reached = s.events.filter((e) => e.year <= year);
              return (
                <button key={m.id} type="button" className={`tl-model ${model === m.id ? 'sel' : ''}`} onClick={() => setModel(m.id)}>
                  <span className="k" style={{ color: MODEL_COLOR[m.id] }}>{m.label}</span>
                  <span className="big">{fmt(wealthAt(s, year), { compact: true })}</span>
                  <span className="tiny muted">family wealth at year {Math.round(year)}</span>
                  <div className="row between tiny"><span className="muted">Legal owners</span><span className="mono">{o.legalOwners}</span></div>
                  <div className="row between tiny"><span className="muted">Stakeholders</span><span className="mono">{o.stakeholders}</span></div>
                  <div className="row between tiny"><span className="muted">Business owners</span><span className="mono">{o.businessOwners}</span></div>
                  <div className="row between tiny"><span className="muted">Transfer tax paid</span><span className="mono amber">{fmt(reached.reduce((x, e) => x + e.tax, 0), { compact: true })}</span></div>
                  <div className="row between tiny"><span className="muted">Leakage</span><span className="mono red">{fmt(reached.reduce((x, e) => x + e.leakage, 0), { compact: true })}</span></div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-2">
            <Panel tight>
              <Eyebrow>Ownership fragmentation</Eyebrow>
              <p className="tiny muted" style={{ margin: '4px 0 8px' }}>Legal owners of the main assets over time. Dashed: beneficiaries / members (people with a stake but no title).</p>
              <FragmentationChart year={year} k={a.k} activeHeirs={a.activeHeirs} sel={model} />
            </Panel>
            <Panel tight>
              <Eyebrow>Consolidated family wealth path</Eyebrow>
              <p className="tiny muted" style={{ margin: '4px 0 8px' }}>W(t+1) = W(t) × (1 + growth) − W(t) × spending × governance multiplier; at each transition: − transfer tax − leakage %.</p>
              <WealthChart year={year} sims={sims} sel={model} fmt={(v) => fmt(v, { compact: true })} />
            </Panel>
          </div>

          <Panel tight>
            <div className="row between"><Eyebrow>Assumptions (editable)</Eyebrow><Chip tone="amber">Illustrative · law changes</Chip></div>
            <p className="small muted" style={{ margin: '6px 0 12px' }}>Transfer tax here is a single illustrative rate above a per-estate exemption. Real rules differ by country and year: the US federal estate, gift and GST taxes have an indexed exclusion that Congress has changed repeatedly; many states add their own; the UAE has no estate tax; CEMAC states apply inheritance duties. No model in this tool eliminates tax. Trusts change <em>when and how often</em> the question is asked; they do not make it go away.</p>
            <div className="tl-assume">
              <NumberField label="Starting family wealth (USD)" value={a.startWealth} onChange={(v) => setA({ ...a, startWealth: v })} step={1_000_000} min={0} />
              <SliderField label="Children per generation" value={a.k} min={1} max={4} onChange={(v) => setA({ ...a, k: v })} />
              <SliderField label="Real growth / yr" value={a.growth} min={0} max={0.1} step={0.005} format={(v) => pct(v)} onChange={(v) => setA({ ...a, growth: v })} />
              <SliderField label="Spending / yr (% of wealth)" value={a.spending} min={0} max={0.08} step={0.0025} format={(v) => pct(v, 2)} onChange={(v) => setA({ ...a, spending: v })} />
              <SliderField label="Transfer-tax rate (illustrative)" value={a.taxRate} min={0} max={0.6} step={0.01} format={(v) => pct(v, 0)} onChange={(v) => setA({ ...a, taxRate: v })} />
              <NumberField label="Exemption per estate (USD)" value={a.exemption} onChange={(v) => setA({ ...a, exemption: v })} step={500_000} min={0} hint="Set to the current law of the relevant jurisdiction; this field does not update itself." />
              <SliderField label="Active heirs in the business (succession)" value={a.activeHeirs} min={1} max={3} onChange={(v) => setA({ ...a, activeHeirs: v })} />
              <div className="stack" style={{ gap: 6 }}>
                <span className="field"><label>Leakage at each transition</label></span>
                {MODELS.map((m) => <SliderField key={m.id} label={<span style={{ color: MODEL_COLOR[m.id] }}>{m.short}</span>} value={a.leakage[m.id]} min={0} max={0.4} step={0.01} format={(v) => pct(v, 0)} onChange={(v) => setLeak(m.id, v)} />)}
              </div>
            </div>
            <p className="tiny muted" style={{ marginTop: 10 }}>Leakage stands for probate and administration costs, forced-sale discounts, litigation, delay and disputes. Spending multiplier by model: direct ×{a.spendingMultiplier.direct}, trust ×{a.spendingMultiplier.trust}, succession ×{a.spendingMultiplier.succession}, office ×{a.spendingMultiplier.office} (governance discipline; illustrative). <button className="btn sm ghost" onClick={() => setA(DEFAULT_ASSUMPTIONS)}>Reset</button></p>
          </Panel>
        </div>

        <div className="stack">
          <Panel tight>
            <Eyebrow>At year {Math.round(year)} · {MODELS.find((m) => m.id === model)!.short}</Eyebrow>
            <div className="grid grid-2" style={{ gap: 8, marginTop: 10 }}>
              <Stat label="Family wealth" value={fmt(wealthAt(sim, year), { compact: true })} tone="gold" />
              <Stat label="Legal owners" value={own.legalOwners} sub={own.legalOwners > 1 ? `${(own.fraction * 100).toFixed(1)}% each` : 'consolidated'} />
              <Stat label="People with a stake" value={own.stakeholders} />
              <Stat label="Business owners" value={own.businessOwners} />
            </div>
            {own.legalOwners >= 9 && <Callout tone="danger" title="Decision paralysis"><p className="small">With {own.legalOwners} co-owners, any sale, refinancing or lease needs broad consent; any one owner can petition for partition. Illiquid fractional interests trade at steep discounts, if at all.</p></Callout>}
          </Panel>

          <Panel tight>
            <Eyebrow>Governance consequences</Eyebrow>
            <div className="tl-gov" style={{ marginTop: 10 }}>
              <GovIcon kind={GOVERNANCE[model].icon} color={MODEL_COLOR[model]} />
              <div>
                <div className="small" style={{ color: 'var(--ivory)' }}>{GOVERNANCE[model].label}</div>
                <ul>{GOVERNANCE[model].points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            </div>
          </Panel>

          <Panel tight>
            <Eyebrow>Estate transitions</Eyebrow>
            <div className="tl-events" style={{ marginTop: 10 }}>
              {sim.events.map((e) => (
                <div key={e.year} className={`tl-ev ${e.year <= year ? 'reached' : ''}`}>
                  <span className="mono gold">yr {e.year}</span>
                  <span><span style={{ color: 'var(--ivory)' }}>G{e.generation} → G{e.generation + 1}</span><br /><span className="tiny muted">{e.note}</span></span>
                  <span className="mono tiny" style={{ textAlign: 'right' }}><span className="amber">tax {fmt(e.tax, { compact: true })}</span><br /><span className="red">leak {fmt(e.leakage, { compact: true })}</span></span>
                </div>
              ))}
            </div>
            <p className="tiny muted" style={{ marginTop: 8 }}>Tax uses one exemption per estate. Under direct inheritance more estates means more exemptions used in total, but also more administrations and more fragmented control. Under the trust model the non-exempt remainder is taxed again at each generational termination (a stand-in for GST tax on non-exempt trusts).</p>
          </Panel>

          <Panel tight tone="gold">
            <Eyebrow>Lessons at +{STOPS[stop]} years</Eyebrow>
            <div className="stack" style={{ gap: 10, marginTop: 10 }}>
              <div className="tl-lesson"><div className="tiny red" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>What tends to go wrong</div><p className="small" style={{ margin: '4px 0 0' }}>{LESSONS[model][stop].wrong}</p></div>
              <div className="tl-lesson good"><div className="tiny green" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>What sophisticated families do</div><p className="small" style={{ margin: '4px 0 0' }}>{LESSONS[model][stop].sophisticated}</p></div>
            </div>
          </Panel>

          <Callout tone="amber" title="Go deeper">
            <p className="small"><Link to="/academy/wealth-transfer">Chapter 13 · Wealth Transfer</Link> · <Link to="/academy/trust-architecture">Chapter 6 · Trust Architecture</Link> · <Link to="/academy/family-governance">Chapter 14 · Family Governance</Link> · <Link to="/governance">Governance Center</Link></p>
          </Callout>
        </div>
      </div>

      <div className="section">
        <Disclaimer>This timeline is a model of tendencies, not a forecast. Growth, spending, mortality timing, tax law and family behaviour all vary. Transfer taxes are shown at a single illustrative rate and exemption; they are a planning question under every model and are never eliminated by one. Engage estate counsel, tax advisers and fiduciaries before acting.</Disclaimer>
      </div>
    </div>
  );
}

/* ───── Timeline axis ───── */
function TimelineAxis({ year, sim, model }: { year: number; sim: ReturnType<typeof simulate>; model: Model }) {
  const W = 960, H = 150, x0 = 50, x1 = 920;
  const X = (y: number) => x0 + ((x1 - x0) * y) / HORIZON;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="diagram tl-svg" aria-label="100-year timeline">
      {[0, 1, 2, 3].map((g) => {
        const from = g === 0 ? 0 : TRANSITIONS[g - 1]; const to = g === 3 ? HORIZON : TRANSITIONS[g];
        return <g key={g} className="tl-gen"><rect x={X(from)} y={58} width={X(to) - X(from)} height={14} fill={g % 2 ? 'rgba(201,169,97,0.05)' : 'rgba(243,236,220,0.03)'} /><text x={(X(from) + X(to)) / 2} y={69} textAnchor="middle">G{g + 1} HOLDS</text></g>;
      })}
      <line x1={x0} y1={85} x2={x1} y2={85} className="tl-axis" />
      <line x1={x0} y1={85} x2={X(year)} y2={85} className="tl-axis-done" />
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((t) => <g key={t} className="tl-tick"><line x1={X(t)} y1={85} x2={X(t)} y2={t % 50 === 0 ? 96 : 91} stroke="var(--line-strong)" /><text x={X(t)} y={110} textAnchor="middle">{t}</text></g>)}
      {sim.events.map((e) => {
        const reached = e.year <= year;
        return (
          <g key={e.year} className={`tl-event ${e.tax > 0 ? 'tax' : ''}`} opacity={reached ? 1 : 0.35}>
            <line x1={X(e.year)} y1={30} x2={X(e.year)} y2={85} stroke="var(--violet)" strokeDasharray="3 3" opacity={0.6} />
            <circle cx={X(e.year)} cy={30} r={9} />
            <text x={X(e.year)} y={33.5} textAnchor="middle" style={{ fontSize: 8 }}>G{e.generation}†</text>
            <text x={X(e.year)} y={18} textAnchor="middle">{e.tax > 0 ? 'estate tax event' : 'transition'}</text>
            {reached && <text x={X(e.year)} y={132} textAnchor="middle" className="label-mono" style={{ fontSize: 9, fill: 'var(--amber)' }}>−{Math.round(((e.tax + e.leakage) / e.wealthBefore) * 100)}%</text>}
          </g>
        );
      })}
      <g transform={`translate(${X(year)} 85)`}>
        <circle r={7} className="tl-marker" />
        <text y={-14} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--gold-2)' }} className="label-mono">year {Math.round(year)}</text>
      </g>
      <text x={x1} y={140} textAnchor="end" style={{ fontSize: 9, fill: 'var(--muted)' }}>{model === 'trust' ? 'title held by trustee throughout' : model === 'office' ? 'title held by pooled vehicle' : 'title re-registered at each death'}</text>
    </svg>
  );
}

/* ───── Family tree ───── */
function FamilyTree({ year, model, k, activeHeirs, compact }: { year: number; model: Model; k: number; activeHeirs: number; compact?: boolean }) {
  const W = 960, rowH = compact ? 62 : 84, top = compact ? 36 : 50, H = top + rowH * 3 + (compact ? 30 : 46);
  const holding = transitionsBy(year);
  const vehicleX = 760;
  const spanW = model === 'direct' ? 900 : 680;
  const rows = [0, 1, 2, 3].map((g) => {
    const n = Math.pow(k, g);
    const born = Math.max(0, 30 * g - 22);
    const appear = Math.max(0, Math.min(1, (year - born) / 6));
    const r = compact ? Math.max(3, 10 - g * 2) : Math.max(4, 13 - g * 2.5);
    return { g, n, appear, r, y: top + g * rowH, xs: Array.from({ length: n }, (_, i) => 40 + ((i + 0.5) * spanW) / n) };
  });
  const roleFor = (g: number, i: number) => {
    if (g < holding) return 'deceased';
    if (g > holding) return 'born';
    switch (model) {
      case 'direct': return 'owner';
      case 'trust': return 'beneficiary';
      case 'succession': return g === 0 ? 'active' : i % k < activeHeirs ? 'active' : 'equalised';
      case 'office': return 'member';
    }
  };
  const owners = descendants(year, k);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="diagram tl-svg" aria-label="Family tree growing over time">
      {rows.map((row) => row.g > 0 && row.appear > 0 && row.xs.map((x, i) => {
        const parent = rows[row.g - 1]; const px = parent.xs[Math.floor(i / k)];
        return <line key={`${row.g}-${i}`} x1={px} y1={parent.y} x2={x} y2={row.y} className="tl-link" opacity={row.appear} />;
      }))}
      {rows.map((row) => row.appear > 0 && (
        <g key={row.g} opacity={row.appear}>
          <text x={12} y={row.y + 3} className="label-mono" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>G{row.g + 1}</text>
          {row.xs.map((x, i) => {
            const role = roleFor(row.g, i);
            return (
              <g key={i} className={`tl-person ${role}`} transform={`translate(${x} ${row.y})`}>
                <circle r={row.r * (0.6 + 0.4 * row.appear)} />
                {model === 'direct' && role === 'owner' && row.n <= 27 && !compact && <text y={row.r + 11} textAnchor="middle">1/{owners}</text>}
                {model === 'succession' && role === 'active' && row.n <= 27 && !compact && <text y={row.r + 11} textAnchor="middle" style={{ fill: 'var(--gold)' }}>runs</text>}
              </g>
            );
          })}
        </g>
      ))}
      {model !== 'direct' && (
        <g className="tl-vehicle" transform={`translate(${vehicleX} ${top})`}>
          <rect x={0} y={-18} width={180} height={compact ? 40 : 52} rx={8} stroke={MODEL_COLOR[model]} />
          <text x={90} y={2} textAnchor="middle">{model === 'trust' ? 'Dynasty Trust' : model === 'office' ? 'Family LP + Family Office' : 'Operating Co · buy-sell'}</text>
          {!compact && <text x={90} y={18} textAnchor="middle" className="sub">{model === 'trust' ? 'TRUSTEE HOLDS TITLE · BENEFICIARIES CHANGE' : model === 'office' ? 'ONE OWNER OF RECORD · UNITS TO MEMBERS' : 'ACTIVE HEIRS OWN · OTHERS EQUALISED'}</text>}
          {rows[holding] && <line x1={0} y1={0} x2={rows[holding].xs[rows[holding].xs.length - 1] + 14 - vehicleX} y2={rows[holding].y - top} stroke={MODEL_COLOR[model]} strokeDasharray="4 4" opacity={0.6} className="flow-line" />}
        </g>
      )}
      {model === 'direct' && holding > 0 && !compact && <text x={vehicleX + 90} y={top} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--red)' }}>{owners} owners of record · tenants in common</text>}
      <g transform={`translate(${W - 10} ${H - 8})`}><text textAnchor="end" style={{ fontSize: 8.5, fill: 'var(--muted)' }}>{model === 'trust' ? 'dashed violet = beneficiary' : model === 'office' ? 'blue = member of pooled vehicle' : model === 'succession' ? 'gold = active heir · dashed green = equalised' : 'gold = owner of record'}</text></g>
    </svg>
  );
}

/* ───── Charts ───── */
function FragmentationChart({ year, k, activeHeirs, sel }: { year: number; k: number; activeHeirs: number; sel: Model }) {
  const W = 460, H = 200, L = 36, R = 10, T = 12, B = 26;
  const maxY = Math.max(4, Math.pow(k, 3));
  const X = (y: number) => L + ((W - L - R) * y) / HORIZON;
  const Y = (v: number) => T + (H - T - B) * (1 - Math.log(v) / Math.log(maxY));
  const path = (fn: (y: number) => number) => Array.from({ length: HORIZON + 1 }, (_, y) => `${y === 0 ? 'M' : 'L'}${X(y).toFixed(1)},${Y(Math.max(1, fn(y))).toFixed(1)}`).join(' ');
  const ticks = [1, k, k * k, k * k * k].filter((v, i, arr) => arr.indexOf(v) === i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="tl-chart" aria-label="Owners over time">
      {ticks.map((v) => <g key={v}><line x1={L} y1={Y(v)} x2={W - R} y2={Y(v)} className="grid" /><text x={L - 6} y={Y(v) + 3} textAnchor="end">{v}</text></g>)}
      {[0, 25, 50, 75, 100].map((t) => <text key={t} x={X(t)} y={H - 8} textAnchor="middle">{t}</text>)}
      <path d={path((y) => descendants(y, k))} stroke="var(--ivory-3)" strokeDasharray="3 4" className="tl-line" />
      {MODELS.map((m) => <path key={m.id} d={path((y) => ownership(m.id, y, k, activeHeirs).legalOwners)} stroke={MODEL_COLOR[m.id]} className={`tl-line ${sel === m.id ? 'sel' : ''}`} />)}
      <line x1={X(year)} y1={T} x2={X(year)} y2={H - B} stroke="var(--gold)" opacity={0.6} />
    </svg>
  );
}

function WealthChart({ year, sims, sel, fmt }: { year: number; sims: Record<Model, ReturnType<typeof simulate>>; sel: Model; fmt: (v: number) => string }) {
  const W = 460, H = 200, L = 52, R = 10, T = 12, B = 26;
  const maxW = Math.max(...MODELS.map((m) => Math.max(...sims[m.id].path.map((p) => p.wealth)))) * 1.05 || 1;
  const X = (y: number) => L + ((W - L - R) * y) / HORIZON;
  const Y = (v: number) => T + (H - T - B) * (1 - v / maxW);
  const path = (m: Model) => sims[m].path.map((p, i) => `${i === 0 ? 'M' : 'L'}${X(p.year).toFixed(1)},${Y(p.wealth).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="tl-chart" aria-label="Family wealth path under each model">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => <g key={f}><line x1={L} y1={Y(maxW * f)} x2={W - R} y2={Y(maxW * f)} className="grid" /><text x={L - 6} y={Y(maxW * f) + 3} textAnchor="end">{fmt(maxW * f)}</text></g>)}
      {[0, 25, 50, 75, 100].map((t) => <text key={t} x={X(t)} y={H - 8} textAnchor="middle">{t}</text>)}
      {TRANSITIONS.map((t) => <line key={t} x1={X(t)} y1={T} x2={X(t)} y2={H - B} stroke="var(--violet)" strokeDasharray="2 4" opacity={0.5} />)}
      {MODELS.map((m) => <path key={m.id} d={path(m.id)} stroke={MODEL_COLOR[m.id]} className={`tl-line ${sel === m.id ? 'sel' : ''}`} />)}
      <line x1={X(year)} y1={T} x2={X(year)} y2={H - B} stroke="var(--gold)" opacity={0.6} />
      {MODELS.map((m) => <circle key={m.id} cx={X(year)} cy={Y(wealthAt(sims[m.id], year))} r={sel === m.id ? 4 : 2.5} fill={MODEL_COLOR[m.id]} />)}
    </svg>
  );
}

function GovIcon({ kind, color }: { kind: 'fragments' | 'shield' | 'handoff' | 'council'; color: string }) {
  return (
    <svg viewBox="0 0 40 40" width={40} height={40} aria-hidden>
      {kind === 'fragments' && <g fill="none" stroke={color} strokeWidth={1.5}><path d="M6 8h12v12H6zM22 8h12v12H22zM6 22h12v12H6zM22 22h12v12H22z" /><path d="M12 14l6 6M28 14l-6 6M12 28l6-6M28 28l-6-6" opacity={0.5} /></g>}
      {kind === 'shield' && <g fill="none" stroke={color} strokeWidth={1.5}><path d="M20 4l13 5v10c0 8-6 14-13 17C13 33 7 27 7 19V9z" /><path d="M14 20l4 4 8-9" /></g>}
      {kind === 'handoff' && <g fill="none" stroke={color} strokeWidth={1.5}><circle cx={11} cy={12} r={4} /><circle cx={29} cy={12} r={4} /><path d="M11 16v8h18v-8M20 24v10M14 34h12" /></g>}
      {kind === 'council' && <g fill="none" stroke={color} strokeWidth={1.5}><circle cx={20} cy={20} r={6} /><circle cx={8} cy={10} r={3} /><circle cx={32} cy={10} r={3} /><circle cx={8} cy={30} r={3} /><circle cx={32} cy={30} r={3} /><path d="M10 12l5 4M30 12l-5 4M10 28l5-4M30 28l-5-4" /></g>}
    </svg>
  );
}
