import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, SectionHeader, Chip, Disclaimer, Callout, Stat, useMoney, ObjectiveTags, Eyebrow } from '@/components/ui';
import { L_NODES, L_EDGES, VIEW, nodeById, ASSETS, type LNode } from './structure';
import { SCENARIOS, DEFAULT_FACTS, FACT_META, scorecard, type Facts, type ScenarioId, type Step } from './scenarios';
import './liability.css';

const STEP_MS = 1900;
const HOLD_MS = 1200;
const EDGE_COLOR = { gold: 'var(--gold)', violet: 'var(--violet)', green: 'var(--green-2)', amber: 'var(--amber)', ivory: 'rgba(243,236,220,0.35)' } as const;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function travelCap(s: Step) { return s.outcome === 'blocked' ? 0.58 : s.outcome === 'info' ? 0 : 1; }
function pointOn(a: LNode, b: LNode, p: number) { return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p }; }

const OUTCOME_CHIP: Record<Step['outcome'], { tone: 'red' | 'green' | 'amber' | 'blue' | 'gold'; label: string }> = {
  exposed: { tone: 'red', label: 'Passes — exposed' },
  blocked: { tone: 'green', label: 'Stops — barrier holds' },
  absorbed: { tone: 'green', label: 'Absorbed by insurance' },
  weakened: { tone: 'amber', label: 'Partial — weakened' },
  info: { tone: 'blue', label: 'Context' },
};

export default function LiabilityPage() {
  const fmt = useMoney();
  const [scenarioId, setScenarioId] = useState<ScenarioId>('tenant');
  const [facts, setFacts] = useState<Facts>(DEFAULT_FACTS);
  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === scenarioId)!, [scenarioId]);
  const steps = useMemo(() => scenario.build(facts), [scenario, facts]);
  const baseline = useMemo(() => scenario.build(DEFAULT_FACTS), [scenario]);

  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const holdUntil = useRef<number | null>(null);
  const last = useRef<number>(0);

  // Reset on scenario/facts change
  useEffect(() => { setIdx(0); setT(0); setPlaying(true); holdUntil.current = null; }, [scenarioId, facts]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = now - last.current; last.current = now;
      if (holdUntil.current !== null) {
        if (now >= holdUntil.current) {
          holdUntil.current = null;
          if (idx < steps.length - 1) { setIdx((i) => i + 1); setT(0); } else { setPlaying(false); return; }
        }
      } else {
        setT((prev) => {
          const next = Math.min(1, prev + dt / STEP_MS);
          if (next >= 1 && holdUntil.current === null) holdUntil.current = now + HOLD_MS;
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, idx, steps.length]);

  const stepTo = (i: number) => { holdUntil.current = null; setPlaying(false); setIdx(Math.max(0, Math.min(steps.length - 1, i))); setT(1); };
  const replay = () => { holdUntil.current = null; setIdx(0); setT(0); setPlaying(true); };

  const current = steps[idx];
  const done = steps.slice(0, idx);
  const et = ease(t);

  // Node statuses
  const status = useMemo(() => {
    const m: Record<string, 'exposed' | 'weakened' | 'blocked-at'> = {};
    const consider = t >= 1 ? steps.slice(0, idx + 1) : done;
    for (const s of consider) {
      if (s.outcome === 'exposed') { m[s.to] = 'exposed'; for (const a of s.exposes ?? []) m[a] = 'exposed'; }
      else if (s.outcome === 'weakened') { if (m[s.to] !== 'exposed') m[s.to] = 'weakened'; for (const a of s.weakens ?? []) if (m[a] !== 'exposed') m[a] = 'weakened'; }
      else if (s.outcome === 'blocked') { if (!m[s.to]) m[s.to] = 'blocked-at'; }
    }
    return m;
  }, [steps, idx, t, done]);

  const score = useMemo(() => scorecard(steps), [steps]);
  const baseScore = useMemo(() => scorecard(baseline), [baseline]);
  const exposedValue = ASSETS.filter((a) => score[a.id] === 'exposed').reduce((s, a) => s + a.value, 0);
  const weakenedValue = ASSETS.filter((a) => score[a.id] === 'weakened').reduce((s, a) => s + a.value, 0);
  const totalValue = ASSETS.reduce((s, a) => s + a.value, 0);
  const protectedValue = totalValue - exposedValue - weakenedValue;
  const factsOn = FACT_META.filter((f) => facts[f.id]).length;

  const A = nodeById[current.from], B = nodeById[current.to];
  const cap = travelCap(current);
  const tokenP = Math.min(et, cap);
  const token = pointOn(A, B, tokenP);
  const arrived = t >= 1;

  return (
    <div className="page container">
      <SectionHeader eyebrow="Laboratory · Liability Attack Simulator" title="Watch a claim try to move through a structure" lede="Eight scenarios, one teaching structure. A claim enters where it originates and attempts to travel upward, sideways and inward. Each barrier either holds or breaks, depending on the facts. Toggle the facts and watch where the breach appears." >
        <ObjectiveTags objectives={['asset-protection', 'estate-planning', 'succession']} />
      </SectionHeader>

      <div className="liab-scenarios" role="tablist" aria-label="Scenario">
        {SCENARIOS.map((s) => (
          <button key={s.id} role="tab" aria-selected={s.id === scenarioId} className={`btn ${s.id === scenarioId ? 'active' : 'ghost'}`} onClick={() => setScenarioId(s.id)}>{s.label}</button>
        ))}
      </div>

      <div className="liab-layout" style={{ marginTop: 18 }}>
        <div className="stack">
          <Panel tight>
            <div className="row between" style={{ marginBottom: 10 }}>
              <div>
                <Eyebrow>{scenario.label}</Eyebrow>
                <p className="small" style={{ margin: '6px 0 0', maxWidth: 680 }}>{scenario.summary}</p>
              </div>
              {factsOn > 0 && <Chip tone="red">{factsOn} adverse fact{factsOn > 1 ? 's' : ''} active</Chip>}
            </div>
            <div className="liab-diagram-wrap">
              <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="diagram liab-diagram" aria-label={`${scenario.label} moving through the structure`}>
                <defs>
                  <radialGradient id="liab-token-g"><stop offset="0%" stopColor="#ffb3a7" /><stop offset="100%" stopColor="var(--red)" /></radialGradient>
                </defs>
                {L_EDGES.map((e, i) => {
                  const a = nodeById[e.from], b = nodeById[e.to];
                  const mid = pointOn(a, b, 0.5);
                  return (
                    <g key={i}>
                      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="liab-edge" stroke={EDGE_COLOR[e.tone]} strokeDasharray={e.dashed ? '4 5' : undefined} />
                      {e.label && <text x={mid.x} y={mid.y - 4} textAnchor="middle" className="liab-edge-label">{e.label}</text>}
                    </g>
                  );
                })}
                {/* trails of completed steps */}
                {done.map((s, i) => {
                  if (s.outcome === 'info') return null;
                  const a = nodeById[s.from], b = nodeById[s.to];
                  const end = pointOn(a, b, travelCap(s));
                  return (
                    <g key={`trail-${i}`}>
                      <line x1={a.x} y1={a.y} x2={end.x} y2={end.y} className="liab-trail" />
                      {s.outcome === 'blocked' && <Shield x={end.x} y={end.y} small />}
                    </g>
                  );
                })}
                {current.outcome !== 'info' && <line x1={A.x} y1={A.y} x2={token.x} y2={token.y} className="liab-trail live" />}
                {L_NODES.map((n) => {
                  const w = n.kind === 'asset' ? 118 : 136, h = n.sub ? 46 : 36;
                  const st = status[n.id];
                  return (
                    <g key={n.id} className={`liab-node ${n.kind} ${st ?? ''} ${n.id === scenario.origin ? 'origin' : ''}`} transform={`translate(${n.x} ${n.y})`}>
                      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={n.kind === 'person' ? 18 : 8} />
                      <text y={n.sub ? -3 : 4} textAnchor="middle">{n.label}</text>
                      {n.sub && <text y={12} textAnchor="middle" className="sub">{n.sub}</text>}
                    </g>
                  );
                })}
                {/* breach ring when the token arrives on an exposed node */}
                {arrived && current.outcome === 'exposed' && <circle cx={B.x} cy={B.y} r={14} className="liab-breach-ring" />}
                {arrived && current.outcome === 'weakened' && <circle cx={B.x} cy={B.y} r={14} className="liab-breach-ring" style={{ stroke: 'var(--amber)' }} />}
                {current.outcome === 'blocked' && et >= cap && <Shield x={token.x} y={token.y} />}
                {/* token */}
                <g className="liab-token" transform={`translate(${token.x} ${token.y})`} opacity={current.outcome === 'absorbed' && arrived ? 0.25 : 1}>
                  <circle r={current.outcome === 'blocked' && et >= cap ? 7 : 9} fill="url(#liab-token-g)" />
                  <text y={-14} textAnchor="middle" style={{ fontSize: 10, fill: '#ffb3a7', letterSpacing: '0.08em' }}>{scenario.tokenLabel.toUpperCase()}</text>
                </g>
              </svg>
            </div>
            <div className="liab-controls" style={{ marginTop: 12 }}>
              <button className="btn sm" onClick={() => (playing ? setPlaying(false) : (idx === steps.length - 1 && t >= 1 ? replay() : setPlaying(true)))}>{playing ? 'Pause' : idx === steps.length - 1 && t >= 1 ? 'Replay' : 'Play'}</button>
              <button className="btn sm ghost" onClick={() => stepTo(idx - 1)} disabled={idx === 0}>‹ Back</button>
              <button className="btn sm ghost" onClick={() => stepTo(idx + 1)} disabled={idx >= steps.length - 1}>Step ›</button>
              <div className="liab-progress" aria-hidden><span style={{ width: `${((idx + t) / steps.length) * 100}%` }} /></div>
              <span className="mono tiny muted">step {idx + 1}/{steps.length}</span>
            </div>
            <div className="liab-legend" style={{ marginTop: 10 }}>
              <span><i style={{ background: 'var(--red)' }} />Claim token / exposed</span>
              <span><i style={{ background: 'var(--green-2)' }} />Barrier holds</span>
              <span><i style={{ background: 'var(--amber)' }} />Weakened</span>
              <span><i style={{ background: 'var(--violet)' }} />Trusts</span>
              <span><i style={{ background: 'var(--gold)' }} />Persons / ownership</span>
            </div>
          </Panel>

          <Panel tight>
            <div className="row between" style={{ marginBottom: 10 }}>
              <div><Eyebrow>Facts</Eyebrow><p className="small muted" style={{ margin: '4px 0 0' }}>Each toggle is a real-world weakness. Turning one on re-runs the attack and shows where the claim now breaks through.</p></div>
              {factsOn > 0 && <button className="btn sm ghost" onClick={() => setFacts(DEFAULT_FACTS)}>Reset facts</button>}
            </div>
            <div className="liab-facts">
              {FACT_META.map((f) => (
                <button key={f.id} type="button" className={`liab-fact ${facts[f.id] ? 'on' : ''}`} aria-pressed={facts[f.id]} onClick={() => setFacts((p) => ({ ...p, [f.id]: !p[f.id] }))}>
                  <span className="box">{facts[f.id] ? '✓' : ''}</span>
                  <span><div className="lbl">{f.label}</div><div className="hint">{f.hint}</div></span>
                </button>
              ))}
            </div>
          </Panel>

          <div className="grid grid-2">
            {scenario.explainer.map((e) => (
              <Panel key={e.title} tight>
                <Eyebrow>{e.title}</Eyebrow>
                <p className="small" style={{ margin: '8px 0 0' }}>{e.body}</p>
              </Panel>
            ))}
          </div>
        </div>

        <div className="stack">
          <Panel tight>
            <Eyebrow>Narration</Eyebrow>
            <div className="liab-steps" style={{ marginTop: 10 }}>
              {steps.map((s, i) => {
                const oc = OUTCOME_CHIP[s.outcome];
                return (
                  <div key={s.id + i} className={`liab-step ${i < idx ? 'done' : ''} ${i === idx ? 'current' : ''} ${s.breach ? 'breach' : ''}`} onClick={() => stepTo(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && stepTo(i)}>
                    <div className="row between" style={{ gap: 6 }}>
                      <span className="mono tiny muted">{String(i + 1).padStart(2, '0')}</span>
                      <div className="row" style={{ gap: 6 }}>
                        {s.breach && <Chip tone="red">Breach</Chip>}
                        <Chip tone={oc.tone}>{oc.label}</Chip>
                      </div>
                    </div>
                    <div className="title" style={{ marginTop: 6 }}>{s.title}</div>
                    {s.barrier && <div className={`barrier ${s.outcome === 'blocked' ? 'green' : s.outcome === 'exposed' ? 'red' : 'amber'}`}>Barrier · {s.barrier}</div>}
                    {(i <= idx) && <p>{s.narrative}</p>}
                    {(i <= idx) && s.cite && <div className="cite">{s.cite}</div>}
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel tight tone={exposedValue > totalValue * 0.5 ? 'danger' : undefined}>
            <Eyebrow>Scorecard · {scenario.label}</Eyebrow>
            <p className="tiny muted" style={{ margin: '4px 0 10px' }}>Illustrative values. "Exposed" means the claim reaches the asset on these facts; "weakened" means delay, partial loss or a tax/continuity cost.</p>
            <div className="liab-score-bar" aria-hidden>
              <span style={{ width: `${(exposedValue / totalValue) * 100}%`, background: 'var(--red)' }} />
              <span style={{ width: `${(weakenedValue / totalValue) * 100}%`, background: 'var(--amber)' }} />
              <span style={{ width: `${(protectedValue / totalValue) * 100}%`, background: 'var(--green-2)' }} />
            </div>
            <div className="grid grid-3" style={{ gap: 8, margin: '12px 0' }}>
              <Stat label="Exposed" value={fmt(exposedValue, { compact: true })} tone="red" />
              <Stat label="Weakened" value={fmt(weakenedValue, { compact: true })} tone="amber" />
              <Stat label="Protected" value={fmt(protectedValue, { compact: true })} tone="green" />
            </div>
            <div className="liab-score">
              <span className="hd">Asset</span><span className="hd">Baseline</span><span className="hd">Now</span>
              {ASSETS.map((a) => (
                <ScoreRow key={a.id} label={a.label} value={fmt(a.value, { compact: true })} base={baseScore[a.id]} now={score[a.id]} />
              ))}
            </div>
          </Panel>

          <Callout tone="amber" title="Where a professional belongs">
            <p className="small">Entity formation, trust drafting, titling of the residence, guarantee negotiation and insurance limits are each a separate professional decision. Charging-order strength, homestead caps, tenancy by the entirety and voidable-transfer lookbacks all vary by state. See <Link to="/academy/domestic-asset-protection">Chapter 11</Link> and <Link to="/jurisdictions">the Jurisdiction Engine</Link>.</p>
          </Callout>
        </div>
      </div>

      <div className="section">
        <Disclaimer tone="danger">This simulator is a teaching model, not legal advice. It uses one fixed structure and simplified rules of thumb. Real outcomes turn on the governing state's statutes and case law, the exact documents, timing, solvency, and the judge. A different state, a different fact, or a different creditor can reverse any result shown here. Consult qualified counsel before relying on any barrier.</Disclaimer>
      </div>
    </div>
  );
}

function Shield({ x, y, small }: { x: number; y: number; small?: boolean }) {
  const s = small ? 0.75 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="liab-shield">
      <path d="M0 -13 L11 -8 L11 2 C11 9 5 13 0 15 C-5 13 -11 9 -11 2 L-11 -8 Z" fill="rgba(17,20,27,0.95)" stroke="var(--green-2)" strokeWidth={1.6} />
      <path d="M-4 1 L-1 4 L5 -3" fill="none" stroke="var(--green-2)" strokeWidth={1.8} />
    </g>
  );
}

function ScoreRow({ label, value, base, now }: { label: string; value: string; base: string; now: string }) {
  const tone = (s: string) => (s === 'exposed' ? 'red' : s === 'weakened' ? 'amber' : 'green');
  return (
    <>
      <span><span className="small">{label}</span> <span className="mono tiny muted">{value}</span></span>
      <Chip tone={tone(base)}>{base}</Chip>
      <Chip tone={tone(now)} className={now !== base ? 'fade-in' : ''}>{now}{now !== base ? ' ↯' : ''}</Chip>
    </>
  );
}
