import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Eyebrow, SectionHeader, Chip, ConfidenceChip, ObjectiveTags, Disclaimer, Callout, NumberField, SliderField, useMoney, Reveal, EmptyState } from '@/components/ui';
import { pct } from '@/lib/format';
import { simulateWaterfall, cumulativeLabor, DEFAULT_WATERFALL, ALL_TIERS, BASIN_TIERS, type WaterfallInputs, type TierId, type YearRow } from './engine';
import { TIER_INFO, HISTORY, MODERN, PROFESSIONAL_QUESTIONS, REFERENCES } from './content';
import './waterfall.css';

type Fmt = ReturnType<typeof useMoney>;
type BasinId = Exclude<TierId, 'labor'>;

// Stage geometry — a staircase of glass basins, cascade on the right, recycle loop on the left.
const SW = 1000, SH = 800, BW = 400, BH = 74, STEP_X = 70, STEP_Y = 108, X0 = 70, Y0 = 26;
const basinPos = (i: number) => ({ x: X0 + i * STEP_X, y: Y0 + i * STEP_Y });
const RECYCLE_TARGETS = ['business', 'realEstate', 'investments'] as const;

export default function WaterfallPage() {
  const fmt = useMoney();
  const [inputs, setInputs] = useState<WaterfallInputs>(DEFAULT_WATERFALL);
  const rows = useMemo(() => simulateWaterfall(inputs), [inputs]);
  const years = rows.length - 1;
  const [year, setYear] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<TierId | null>(null);
  const [showHistory, setShowHistory] = useState<'history' | 'modern'>('history');

  useEffect(() => { if (year > years) setYear(years); }, [years, year]);

  const raf = useRef(0); const last = useRef(0);
  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const tick = (now: number) => {
      if (now - last.current > 420) {
        last.current = now;
        setYear((y) => { if (y >= years) { setPlaying(false); return y; } return y + 1; });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, years]);

  const row = rows[Math.min(year, years)];
  const maxBal = Math.max(1, ...BASIN_TIERS.map((t) => rows[years].balances[t]));
  const maxLabor = Math.max(1, rows[years].labor);
  const maxFlow = Math.max(1, rows[years].cascade.business);
  const upd = (patch: Partial<WaterfallInputs>) => setInputs((i) => ({ ...i, ...patch }));

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Animation · the family balance sheet as a cascade"
        title={<>Family Capital <span className="gold" style={{ fontStyle: 'italic', fontWeight: 400 }}>Waterfall</span></>}
        lede="Labor produces a surplus. The surplus is poured into a business, the business overflows into real estate, real estate into investments, investments into permanent capital, permanent capital into insurance and liquidity, and what remains reaches the family — which sends part of it back up to the top. Scrub thirty years and watch the basins fill. Every growth and allocation assumption is explicit and editable, and deliberately conservative."
      />

      <div className="wf-layout">
        <Panel style={{ padding: 16 }}>
          <div className="wf-timeline" style={{ marginBottom: 10 }}>
            <div className="wf-year">Year {row.year}<small>of {years}</small></div>
            <button className="btn primary sm" onClick={() => { if (year >= years) setYear(0); setPlaying((p) => !p); }}>{playing ? '❙❙ Pause' : year >= years ? '↺ Replay' : '▶ Play'}</button>
            <input type="range" min={0} max={years} step={1} value={year} onChange={(e) => { setPlaying(false); setYear(parseInt(e.target.value, 10)); }} aria-label="Year" />
            <Chip tone="gold">Total {fmt(row.total, { compact: true })}</Chip>
            <Chip>Labor in {fmt(cumulativeLabor(rows, row.year), { compact: true })}</Chip>
          </div>
          <div className="wf-stage-wrap">
            <CascadeStage row={row} maxBal={maxBal} maxLabor={maxLabor} maxFlow={maxFlow} selected={selected} onSelect={setSelected} fmt={fmt} />
          </div>
          <p className="tiny muted" style={{ margin: '8px 0 0' }}>Fill levels are scaled to each tier's size at year {years} (square-root scale so small tiers stay visible). Gold particles fall with the cascade; green particles climb with the recycle loop. Click a basin to read what it is.</p>
        </Panel>

        <div className="stack">
          <Panel className="wf-explain" tone={selected ? 'gold' : undefined}>
            <Eyebrow>Tier</Eyebrow>
            {selected ? <TierPanel id={selected} row={row} fmt={fmt} onClose={() => setSelected(null)} /> : <EmptyState title="Select a basin" body="Each tier explains what it is, what it produces, how it is financed, who owns it and the risk it carries." />}
          </Panel>
          <Panel>
            <Eyebrow>Assumptions</Eyebrow>
            <div className="wf-inputs" style={{ marginTop: 10 }}>
              <NumberField label="Annual labor surplus" value={inputs.laborSurplus} onChange={(v) => upd({ laborSurplus: v })} prefix="$" step={5000} min={0} />
              <SliderField label="Surplus growth" value={inputs.laborGrowth} onChange={(v) => upd({ laborGrowth: v })} min={0} max={0.08} step={0.005} format={(v) => pct(v, 1)} />
              <div className="wf-group">Allocation retained at each tier</div>
              <SliderField label="Business reinvestment" value={inputs.alloc.business} onChange={(v) => upd({ alloc: { ...inputs.alloc, business: v } })} min={0} max={1} step={0.05} format={(v) => pct(v, 0)} />
              <SliderField label="Real estate" value={inputs.alloc.realEstate} onChange={(v) => upd({ alloc: { ...inputs.alloc, realEstate: v } })} min={0} max={1} step={0.05} format={(v) => pct(v, 0)} />
              <SliderField label="Investments" value={inputs.alloc.investments} onChange={(v) => upd({ alloc: { ...inputs.alloc, investments: v } })} min={0} max={1} step={0.05} format={(v) => pct(v, 0)} />
              <SliderField label="Permanent capital" value={inputs.alloc.permanent} onChange={(v) => upd({ alloc: { ...inputs.alloc, permanent: v } })} min={0} max={1} step={0.05} format={(v) => pct(v, 0)} />
              <SliderField label="Insurance / liquidity" value={inputs.alloc.insurance} onChange={(v) => upd({ alloc: { ...inputs.alloc, insurance: v } })} min={0} max={1} step={0.05} format={(v) => pct(v, 0)} />
              <SliderField label="Recycle from family capital" value={inputs.recycleRate} onChange={(v) => upd({ recycleRate: v })} min={0} max={0.8} step={0.05} format={(v) => pct(v, 0)} />
              <div className="wf-group">Growth per tier (total annual)</div>
              {(['business', 'realEstate', 'investments', 'permanent', 'insurance'] as const).map((t) => (
                <SliderField key={t} label={TIER_INFO[t].name} value={inputs.growth[t]} onChange={(v) => upd({ growth: { ...inputs.growth, [t]: v } })} min={-0.05} max={0.15} step={0.005} format={(v) => pct(v, 1)} />
              ))}
              <SliderField label="Family capital (cash)" value={inputs.growth.family} onChange={(v) => upd({ growth: { ...inputs.growth, family: v } })} min={0} max={0.05} step={0.005} format={(v) => pct(v, 1)} />
              <div className="wf-group">Cash yield paid down the cascade</div>
              {(['business', 'realEstate', 'investments', 'permanent'] as const).map((t) => (
                <SliderField key={t} label={TIER_INFO[t].name} value={inputs.yieldDown[t]} onChange={(v) => upd({ yieldDown: { ...inputs.yieldDown, [t]: v } })} min={0} max={0.12} step={0.005} format={(v) => pct(v, 1)} />
              ))}
            </div>
            <div className="row between" style={{ marginTop: 12 }}>
              <span className="tiny muted">Growth is total return; yield is the part paid out as cash, so a tier retains growth − yield.</span>
              <button className="btn sm ghost" onClick={() => setInputs(DEFAULT_WATERFALL)}>Defaults</button>
            </div>
          </Panel>
        </div>
      </div>

      {/* Per-tier balances */}
      <section className="section">
        <Eyebrow className="" >Per-tier balances · year {row.year}</Eyebrow>
        <div className="wf-tiers" style={{ marginTop: 12 }}>
          {BASIN_TIERS.map((t) => (
            <div key={t} className={`wf-tier-card ${selected === t ? 'selected' : ''}`} style={{ borderTopColor: TIER_INFO[t].color }} onClick={() => setSelected(t)}>
              <div className="l">{TIER_INFO[t].name}</div>
              <div className="v">{fmt(row.balances[t], { compact: true })}</div>
              <div className="s">{row.total > 0 ? pct(row.balances[t] / row.total, 0) : '—'} of total · in {fmt(row.cascade[t], { compact: true })}/yr</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stacked area */}
      <section className="section">
        <Panel>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div><Eyebrow>Family balance sheet over time</Eyebrow><h3 style={{ marginTop: 6 }}>Stacked by tier</h3></div>
            <div className="wf-legend">{BASIN_TIERS.map((t) => <span key={t}><i style={{ background: TIER_INFO[t].color }} />{TIER_INFO[t].name}</span>)}</div>
          </div>
          <StackedArea rows={rows} year={row.year} onYear={(y) => { setPlaying(false); setYear(y); }} fmt={fmt} />
          <p className="tiny muted" style={{ margin: '10px 0 0' }}>Formula per year: each tier grows by its growth rate, pays its yield down the cascade, then retains its allocation share of what arrives; the remainder passes down. The recycle share of family capital returns to business, real estate and investments ({pct(inputs.recycleSplit.business, 0)} / {pct(inputs.recycleSplit.realEstate, 0)} / {pct(inputs.recycleSplit.investments, 0)}). No tax is modelled inside the cascade; every tier's cash is assumed after the tax that applies to it.</p>
        </Panel>
      </section>

      {/* Rockefeller */}
      <section className="section">
        <Reveal>
          <SectionHeader eyebrow="Educational section" title={<>The Rockefeller Method: <span className="gold" style={{ fontStyle: 'italic', fontWeight: 400 }}>history vs marketing</span></>} lede="The cascade above is often sold online as 'the Rockefeller method': trusts, whole life insurance and a family bank lending to heirs. Part of that is a real and well-documented family history. Part of it is a sales script that borrowed the name. The two deserve to be separated claim by claim." />
        </Reveal>
        <div className="row" style={{ gap: 6, marginBottom: 14 }}>
          <button className={`btn sm ${showHistory === 'history' ? 'active' : 'ghost'}`} onClick={() => setShowHistory('history')}>Documented history</button>
          <button className={`btn sm ${showHistory === 'modern' ? 'active' : 'ghost'}`} onClick={() => setShowHistory('modern')}>The modern framing</button>
        </div>
        <div className="wf-claims">
          {(showHistory === 'history' ? HISTORY : MODERN).map((c) => (
            <div key={c.claim} className="wf-claim">
              <div><div className="q">{c.claim}</div><p>{c.verdict}</p></div>
              <ConfidenceChip level={c.level} />
            </div>
          ))}
        </div>
        <div className="grid grid-2" style={{ gap: 16, marginTop: 20 }}>
          <Callout tone="green" title="What is sound in the modern version">
            <p>Permanent capital held under a governance structure the founder does not control. Liquidity at death from insurance owned outside the estate. Lending to the next generation against documented notes instead of giving outright, so that capital is recycled and heirs are accountable. Written policies and a family council. None of this is new, and none of it needs the Rockefeller name to work.</p>
          </Callout>
          <Callout tone="danger" title="What is overstated">
            <p>Insurance as "tax-free banking": a policy loan is a loan with interest, a reduced death benefit and lapse risk, not a bank. "Guaranteed compounding": only the guaranteed column is guaranteed, and it is modest. "Universal applicability": the structure presumes surplus, insurability, horizon and the cost of trustees and advisers. And the historical claim itself: the fortune came from an operating business and long trusts, not from premiums.</p>
          </Callout>
        </div>
        <Panel style={{ marginTop: 16 }}>
          <Eyebrow>What a professional would ask before implementing any of it</Eyebrow>
          <ol style={{ margin: '12px 0 0', paddingLeft: 20, color: 'var(--ivory-2)' }}>
            {PROFESSIONAL_QUESTIONS.map((q) => <li key={q} style={{ marginBottom: 8, fontSize: '0.92rem' }}>{q}</li>)}
          </ol>
        </Panel>
        <Panel tight style={{ marginTop: 16 }}>
          <div className="row between"><Eyebrow>References</Eyebrow><Chip tone="amber">Not yet jurisdictionally verified</Chip></div>
          <ul className="wf-refs" style={{ margin: '10px 0 0', paddingLeft: 18 }}>
            {REFERENCES.map((r) => <li key={r.title}><strong>{r.title}</strong> — <span className="muted">{r.note}</span></li>)}
          </ul>
        </Panel>
        <div style={{ marginTop: 16 }}>
          <Disclaimer>The cascade is a teaching model, not a projection. Returns, yields and allocations are the user's assumptions; taxes, fees and transfer-tax costs are not modelled inside the basins. Trust, insurance and lending decisions depend on jurisdiction and individual facts and ordinarily require legal, tax and fiduciary review.</Disclaimer>
        </div>
      </section>
    </div>
  );
}

function CascadeStage({ row, maxBal, maxLabor, maxFlow, selected, onSelect, fmt }: { row: YearRow; maxBal: number; maxLabor: number; maxFlow: number; selected: TierId | null; onSelect: (t: TierId) => void; fmt: Fmt }) {
  const fill = (v: number, max: number) => Math.min(1, Math.sqrt(Math.max(0, v) / max));
  const particles = (flow: number) => Math.max(1, Math.min(6, Math.round((flow / maxFlow) * 6)));
  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} className="diagram wf-stage" aria-label="Capital cascading through seven tiers">
      <defs>
        {BASIN_TIERS.map((t, i) => (
          <linearGradient key={t} id={`wf-liq-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TIER_INFO[t].color} stopOpacity={0.9} /><stop offset="100%" stopColor={TIER_INFO[t].color} stopOpacity={0.35} /></linearGradient>
        ))}
        <linearGradient id="wf-liq-labor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ivory-2)" stopOpacity={0.7} /><stop offset="100%" stopColor="var(--ivory-2)" stopOpacity={0.25} /></linearGradient>
      </defs>

      {/* cascade paths (right side) */}
      {ALL_TIERS.slice(0, -1).map((t, i) => {
        const a = basinPos(i), b = basinPos(i + 1);
        const sx = a.x + BW - 26, sy = a.y + BH; const ex = b.x + BW - 56, ey = b.y;
        const d = `M ${sx} ${sy} C ${sx} ${sy + 24}, ${ex} ${ey - 20}, ${ex} ${ey}`;
        const receiving = ALL_TIERS[i + 1] as BasinId;
        const flow = row.cascade[receiving];
        const quiet = flow <= 0;
        const n = particles(flow);
        return (
          <g key={`fall-${t}`}>
            <path id={`wf-fall-${i}`} d={d} className={`wf-fall ${quiet ? 'quiet' : 'flow-line'}`} />
            {!quiet && Array.from({ length: n }).map((_, k) => (
              <circle key={k} r={2.6} className="wf-particle">
                <animateMotion dur="1.4s" repeatCount="indefinite" begin={`${-(k * 1.4) / n}s`}><mpath href={`#wf-fall-${i}`} /></animateMotion>
              </circle>
            ))}
            <text x={ex + 10} y={ey - 8} className="flowamt" style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fill: 'var(--ivory-3)' }}>{fmt(flow, { compact: true })}/yr</text>
          </g>
        );
      })}

      {/* recycle paths (left side, upward) */}
      {RECYCLE_TARGETS.map((t, k) => {
        const fi = basinPos(6); const ti = basinPos(ALL_TIERS.indexOf(t));
        const sx = fi.x + 20, sy = fi.y + BH; const ex = ti.x, ey = ti.y + BH / 2;
        const laneX = ex - 36 - k * 4;
        const d = `M ${sx} ${sy} C ${sx} ${sy + 50}, ${laneX} ${sy + 50}, ${laneX} ${sy - 10} L ${laneX} ${ey + 20} Q ${laneX} ${ey} ${ex} ${ey}`;
        const amt = row.recycle[t];
        const quiet = amt <= 0;
        const n = quiet ? 0 : Math.max(1, Math.min(4, Math.round((amt / maxFlow) * 8)));
        return (
          <g key={`rec-${t}`}>
            <path id={`wf-rec-${k}`} d={d} className={`wf-recycle ${quiet ? 'quiet' : 'flow-line'}`} />
            {Array.from({ length: n }).map((_, j) => (
              <circle key={j} r={2.4} className="wf-particle up">
                <animateMotion dur="4s" repeatCount="indefinite" begin={`${-(j * 4) / n}s`}><mpath href={`#wf-rec-${k}`} /></animateMotion>
              </circle>
            ))}
            {!quiet && <text x={laneX - 4} y={ey - 6} textAnchor="end" className="flowamt" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--green-2)' }}>↑ {fmt(amt, { compact: true })}</text>}
          </g>
        );
      })}
      <text x={basinPos(6).x - 150} y={basinPos(6).y + BH + 44} className="wf-label-up">recycle loop · family capital redeployed upward</text>

      {/* basins */}
      {ALL_TIERS.map((t, i) => {
        const p = basinPos(i);
        const info = TIER_INFO[t];
        const value = t === 'labor' ? row.labor : row.balances[t];
        const f = t === 'labor' ? fill(value, maxLabor) : fill(value, maxBal);
        const lh = Math.max(0, (BH - 6) * f);
        const ly = p.y + BH - 3 - lh;
        return (
          <g key={t} className={`wf-basin ${selected === t ? 'selected' : ''}`} onClick={() => onSelect(t)}>
            <rect x={p.x} y={p.y} width={BW} height={BH} rx={8} className="glass" />
            <rect x={p.x + 3} y={ly} width={BW - 6} height={lh} rx={5} className="liquid" fill={t === 'labor' ? 'url(#wf-liq-labor)' : `url(#wf-liq-${i - 1})`} />
            {lh > 1 && <line x1={p.x + 6} x2={p.x + BW - 6} y1={ly} y2={ly} className="liquid-top" stroke={info.color} strokeWidth={1.2} />}
            <line x1={p.x} x2={p.x + BW} y1={p.y + 1} y2={p.y + 1} className="rim" />
            <text x={p.x + 16} y={p.y + 30} className="name">{info.name}</text>
            <text x={p.x + 16} y={p.y + 46} className="tag">{info.tag}</text>
            <text x={p.x + BW - 14} y={p.y + 30} textAnchor="end" className="amt">{fmt(value, { compact: true })}{t === 'labor' ? ' /yr' : ''}</text>
            <text x={p.x + BW - 14} y={p.y + 46} textAnchor="end" className="tag">{i === 0 ? 'source' : `tier ${i}`}</text>
          </g>
        );
      })}
    </svg>
  );
}

function TierPanel({ id, row, fmt, onClose }: { id: TierId; row: YearRow; fmt: Fmt; onClose: () => void }) {
  const info = TIER_INFO[id];
  const value = id === 'labor' ? row.labor : row.balances[id];
  return (
    <div className="fade-in">
      <div className="row between" style={{ marginTop: 8 }}>
        <h3 style={{ fontSize: '1.5rem' }}>{info.name}</h3>
        <button className="btn sm ghost" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="row" style={{ gap: 8, marginTop: 6 }}>
        <Chip tone="gold">{fmt(value, { compact: true })}{id === 'labor' ? ' / yr' : ` at year ${row.year}`}</Chip>
        <Chip>{info.tag}</Chip>
      </div>
      <h4>What it is</h4><p>{info.what}</p>
      <h4>What it produces</h4><p>{info.produces}</p>
      <h4>How it is financed</h4><p>{info.financed}</p>
      <h4>Who owns it</h4><p>{info.owner}</p>
      <h4>Risk it carries</h4><p>{info.risk}</p>
      <h4>Objectives</h4><ObjectiveTags objectives={info.objectives} />
    </div>
  );
}

function StackedArea({ rows, year, onYear, fmt }: { rows: YearRow[]; year: number; onYear: (y: number) => void; fmt: Fmt }) {
  const W = 960, H = 300, PL = 64, PR = 16, PT = 12, PB = 28;
  const years = rows.length - 1;
  const max = Math.max(1, rows[years].total);
  const x = (y: number) => PL + (y / years) * (W - PL - PR);
  const yy = (v: number) => PT + (1 - v / max) * (H - PT - PB);
  // stack bottom-up in BASIN_TIERS order reversed so family sits at the bottom
  const order: BasinId[] = ['family', 'insurance', 'permanent', 'investments', 'realEstate', 'business'];
  const stacks = order.map((t, i) => rows.map((r) => {
    const below = order.slice(0, i).reduce((s, k) => s + r.balances[k], 0);
    return { y0: below, y1: below + r.balances[t] };
  }));
  const path = (s: { y0: number; y1: number }[]) => {
    const top = s.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${yy(p.y1)}`).join(' ');
    const bottom = [...s].map((p, i) => `L ${x(s.length - 1 - i)} ${yy(s[s.length - 1 - i].y0)}`).join(' ');
    return `${top} ${bottom} Z`;
  };
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="wf-chart" role="img" aria-label="Stacked area chart of tier balances over time" onClick={(e) => {
      const svg = e.currentTarget; const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * W;
      const yr = Math.round(((px - PL) / (W - PL - PR)) * years);
      onYear(Math.max(0, Math.min(years, yr)));
    }} style={{ cursor: 'crosshair' }}>
      {ticks.map((t) => <g key={t}><line x1={PL} x2={W - PR} y1={yy(max * t)} y2={yy(max * t)} className="gridline" /><text x={PL - 8} y={yy(max * t) + 3} textAnchor="end">{fmt(max * t, { compact: true })}</text></g>)}
      {order.map((t, i) => <path key={t} d={path(stacks[i])} fill={TIER_INFO[t].color} opacity={0.55} stroke={TIER_INFO[t].color} strokeWidth={0.8} />)}
      <line x1={PL} x2={W - PR} y1={H - PB} y2={H - PB} className="axis" />
      {Array.from({ length: Math.floor(years / 5) + 1 }).map((_, i) => <text key={i} x={x(i * 5)} y={H - 8} textAnchor="middle">Y{i * 5}</text>)}
      <line x1={x(year)} x2={x(year)} y1={PT} y2={H - PB} className="cursor" />
      <text x={x(year) + 6} y={PT + 10} style={{ fill: 'var(--gold-2)' }}>{fmt(rows[year].total, { compact: true })}</text>
    </svg>
  );
}
