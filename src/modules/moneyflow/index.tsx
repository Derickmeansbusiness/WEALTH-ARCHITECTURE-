import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Eyebrow, SectionHeader, Chip, ObjectiveTags, Disclaimer, Callout, NumberField, SliderField, TextField, useMoney, Stat, EmptyState } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { uid, pct } from '@/lib/format';
import { buildFlows, applyFlows, DEFAULT_INPUTS, ENTITIES, ENTITY_BY_ID, type Flow, type FlowInputs, type EntityId, type Balances } from './engine';
import './moneyflow.css';

type Fmt = ReturnType<typeof useMoney>;
const W = 1000, H = 720, NODE_W = 156, NODE_H = 58;
const TONE: Record<string, string> = { gold: 'var(--gold)', ivory: 'var(--ivory-3)', green: 'var(--green-2)', violet: 'var(--violet)', blue: 'var(--blue)', red: 'var(--red)', amber: 'var(--amber)' };
/** Per-edge curve offset so parallel/reverse edges and long edges do not collide with boxes. */
const CURVE: Record<string, number> = { tax: -95, interest: 70, loan: 46, contribution: 46, mortgage: 0, acquisition: 0, premium: 0, family: 0, distribution: 0, investment: 0, expenses: 0, revenue: 0 };
const SPEEDS = [0.5, 1, 2, 4];
const BASE_MS = 2200;

interface Pt { x: number; y: number }
function edgeGeometry(f: Flow) {
  const A = ENTITY_BY_ID[f.from], B = ENTITY_BY_ID[f.to];
  const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
  // shrink endpoints to the box boundary
  const ax = Math.abs(dx / len), ay = Math.abs(dy / len);
  const tA = Math.min((NODE_W / 2) / (ax || 1e-9), (NODE_H / 2) / (ay || 1e-9));
  const start: Pt = { x: A.x + (dx / len) * tA, y: A.y + (dy / len) * tA };
  const end: Pt = { x: B.x - (dx / len) * tA, y: B.y - (dy / len) * tA };
  const off = CURVE[f.id] ?? 0;
  const nx = -dy / len, ny = dx / len;
  const ctrl: Pt = { x: (start.x + end.x) / 2 + nx * off, y: (start.y + end.y) / 2 + ny * off };
  const d = `M ${start.x} ${start.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`;
  const at = (t: number): Pt => ({ x: (1 - t) ** 2 * start.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x, y: (1 - t) ** 2 * start.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y });
  const tail = at(0.94);
  const angle = Math.atan2(end.y - tail.y, end.x - tail.x) * 180 / Math.PI;
  return { d, at, end, angle };
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function MoneyFlowPage() {
  const fmt = useMoney();
  const saveScenario = useAppStore((s) => s.saveScenario);
  const scenarios = useAppStore((s) => s.scenarios.filter((x) => x.kind === 'money-flow'));
  const deleteScenario = useAppStore((s) => s.deleteScenario);

  const [inputs, setInputs] = useState<FlowInputs>(DEFAULT_INPUTS);
  const flows = useMemo(() => buildFlows(inputs), [inputs]);
  const [step, setStep] = useState(0);           // number of completed flows
  const [progress, setProgress] = useState(0);   // 0..1 of flow[step]
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [scenarioName, setScenarioName] = useState('My $1M flow');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const total = flows.length;
  const done = step >= total;
  const current = done ? null : flows[step];

  // rAF loop
  const raf = useRef(0);
  const last = useRef(0);
  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = now - last.current; last.current = now;
      setProgress((p) => {
        const np = p + (dt * speed) / BASE_MS;
        if (np >= 1) {
          setStep((s) => {
            const ns = s + 1;
            if (ns >= total) setPlaying(false);
            return ns;
          });
          return 0;
        }
        return np;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, speed, total]);

  const reset = useCallback(() => { setPlaying(false); setStep(0); setProgress(0); }, []);
  const stepOnce = useCallback(() => { setPlaying(false); setProgress(0); setStep((s) => Math.min(total, s + 1)); }, [total]);
  const stepBack = useCallback(() => { setPlaying(false); setProgress(0); setStep((s) => Math.max(0, s - 1)); }, []);
  const update = (patch: Partial<FlowInputs>) => { setInputs((i) => ({ ...i, ...patch })); reset(); };

  const balances: Balances = useMemo(() => applyFlows(flows, step), [flows, step]);
  const selectedFlow = flows.find((f) => f.id === selected) ?? null;
  const activeEntities = new Set<EntityId>(current ? [current.from, current.to] : []);

  const save = () => {
    saveScenario({ id: uid(), kind: 'money-flow', name: scenarioName.trim() || 'Money flow', data: { inputs, summary: { revenue: inputs.revenue, flows: flows.map((f) => ({ id: f.id, amount: f.amount })) } }, createdAt: Date.now() });
    setSavedMsg('Saved to your scenarios.');
    setTimeout(() => setSavedMsg(null), 2400);
  };
  const load = (data: unknown) => {
    const d = data as { inputs?: Partial<FlowInputs> };
    if (d && d.inputs) { setInputs({ ...DEFAULT_INPUTS, ...d.inputs }); reset(); }
  };

  const overall = (step + (current ? progress : 0)) / total;

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Simulator · follow the money"
        title={<>Money Flow <span className="gold" style={{ fontStyle: 'italic', fontWeight: 400 }}>Simulator</span></>}
        lede="One million dollars of revenue enters an operating company. Watch it move, step by step, through expenses, tax, a holding company, an intercompany note, a property acquisition with lender debt, an insurance trust and finally the household. Every movement has an economic reason, a legal mechanism and a tax question. Click any packet or edge to read them."
      />

      <div className="mf-layout">
        {/* STAGE */}
        <Panel style={{ padding: 16 }}>
          <div className="mf-controls" style={{ marginBottom: 10 }}>
            <button className="btn primary sm" onClick={() => (done ? reset() : setPlaying((p) => !p))}>{done ? '↺ Replay' : playing ? '❙❙ Pause' : '▶ Play'}</button>
            <button className="btn sm" onClick={stepBack} disabled={step === 0}>◀ Back</button>
            <button className="btn sm" onClick={stepOnce} disabled={done}>Step ▶</button>
            <button className="btn sm ghost" onClick={reset}>Reset</button>
            <div className="row" style={{ gap: 4 }}>
              {SPEEDS.map((s) => <button key={s} className={`btn sm ${speed === s ? 'active' : 'ghost'}`} onClick={() => setSpeed(s)}>{s}×</button>)}
            </div>
            <div className="mf-progress" aria-hidden><div style={{ width: `${overall * 100}%` }} /></div>
            <span className="mono tiny muted">{Math.min(step + (current ? 1 : 0), total)} / {total}</span>
          </div>
          <div className="mf-stage-wrap">
            <Stage flows={flows} step={step} progress={progress} balances={balances} selected={selected} onSelect={(id) => setSelected(id)} active={activeEntities} fmt={fmt} />
          </div>
          <div className="row between" style={{ marginTop: 10 }}>
            <span className="small muted">{current ? <><span className="mono gold">{String(current.step).padStart(2, '0')}</span> · {current.title}</> : done ? 'Cycle complete. Edit an input to re-run, or replay.' : 'Press play.'}</span>
            {current && <Chip tone="gold">{fmt(current.amount)}</Chip>}
          </div>
        </Panel>

        {/* LEDGER */}
        <Panel style={{ padding: 16 }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <Eyebrow>Ledger</Eyebrow>
            <span className="tiny muted">click a row for the reasoning</span>
          </div>
          <div className="table-wrap mf-ledger">
            <table className="table">
              <thead><tr><th>#</th><th>Movement</th><th className="num">Amount</th></tr></thead>
              <tbody>
                {flows.map((f, i) => {
                  const state = i < step ? 'done' : i === step && !done ? 'live' : 'pending';
                  return (
                    <tr key={f.id} className={`${state} ${selected === f.id ? 'selected' : ''}`} onClick={() => setSelected(f.id)}>
                      <td className="mono tiny">{String(f.step).padStart(2, '0')}</td>
                      <td>
                        <div style={{ fontSize: '0.84rem' }}>{f.title}</div>
                        <div className="mf-dir">{ENTITY_BY_ID[f.from].label} → {ENTITY_BY_ID[f.to].label}{state === 'live' ? ' · in transit' : ''}</div>
                      </td>
                      <td className="num">{f.kind === 'recognition' ? <span className="muted">({fmt(f.amount)})</span> : fmt(f.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="mf-layout" style={{ marginTop: 16 }}>
        {/* INPUTS */}
        <Panel>
          <div className="row between" style={{ marginBottom: 12 }}>
            <Eyebrow>Scenario inputs</Eyebrow>
            <button className="btn sm ghost" onClick={() => { setInputs(DEFAULT_INPUTS); reset(); }}>Defaults</button>
          </div>
          <div className="mf-inputs">
            <NumberField label="OpCo revenue" value={inputs.revenue} onChange={(v) => update({ revenue: v })} prefix="$" step={10000} min={0} />
            <SliderField label="Expense ratio" value={inputs.expenseRatio} onChange={(v) => update({ expenseRatio: v })} min={0.2} max={0.95} step={0.01} format={(v) => pct(v, 0)} />
            <SliderField label={<>Tax reserve rate</>} value={inputs.taxReserveRate} onChange={(v) => update({ taxReserveRate: v })} min={0.01} max={0.5} step={0.01} format={(v) => pct(v, 0)} />
            <SliderField label="Distribution to HoldCo" value={inputs.distributionPct} onChange={(v) => update({ distributionPct: v })} min={0} max={1} step={0.05} format={(v) => pct(v, 0)} />
            <NumberField label="HoldCo → PropCo loan" value={inputs.loanAmount} onChange={(v) => update({ loanAmount: v })} prefix="$" step={5000} min={0} />
            <SliderField label="Note interest rate" value={inputs.loanRate} onChange={(v) => update({ loanRate: v })} min={0} max={0.15} step={0.0025} format={(v) => pct(v, 2)} />
            <SliderField label="Investment % of remaining cash" value={inputs.investmentPct} onChange={(v) => update({ investmentPct: v })} min={0} max={1} step={0.05} format={(v) => pct(v, 0)} />
            <NumberField label="Property price" value={inputs.propertyPrice} onChange={(v) => update({ propertyPrice: v })} prefix="$" step={10000} min={0} />
            <SliderField label="Loan-to-value" value={inputs.ltv} onChange={(v) => update({ ltv: v })} min={0} max={0.9} step={0.05} format={(v) => pct(v, 0)} />
            <NumberField label="Insurance premium (via trust)" value={inputs.premium} onChange={(v) => update({ premium: v })} prefix="$" step={1000} min={0} />
            <NumberField label="Family distribution" value={inputs.familyDistribution} onChange={(v) => update({ familyDistribution: v })} prefix="$" step={1000} min={0} />
          </div>
          <p className="tiny muted" style={{ marginTop: 12, marginBottom: 0 }}>Tax reserve: <strong>illustrative blended rate — actual depends on entity classification, state and facts.</strong> Amounts that exceed what the paying entity holds are clamped and the ledger says so. Property price is scaled to the equity PropCo actually received at the chosen LTV.</p>
          <hr className="hairline" style={{ margin: '18px 0' }} />
          <div className="row" style={{ gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 180 }}><TextField label="Scenario name" value={scenarioName} onChange={setScenarioName} /></div>
            <button className="btn primary sm" onClick={save}>Save scenario</button>
            {savedMsg && <span className="tiny green">{savedMsg}</span>}
          </div>
          {scenarios.length > 0 && (
            <div className="stack" style={{ gap: 6, marginTop: 12 }}>
              <span className="tiny muted">Saved money-flow scenarios</span>
              {scenarios.map((s) => (
                <div key={s.id} className="row between" style={{ gap: 8 }}>
                  <button className="btn sm ghost" onClick={() => load(s.data)}>↳ {s.name}</button>
                  <button className="btn sm ghost danger" onClick={() => deleteScenario(s.id)} aria-label={`Delete ${s.name}`}>✕</button>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* WHY */}
        <Panel tone={selectedFlow ? 'gold' : undefined} className="mf-why">
          <Eyebrow>Why this movement occurs</Eyebrow>
          {selectedFlow ? <WhyPanel flow={selectedFlow} fmt={fmt} onClose={() => setSelected(null)} /> : (
            <EmptyState title="Select a movement" body="Click a moving packet, an edge on the stage, or a row in the ledger. Each movement explains its economic reason, legal mechanism, documentation, tax questions and who approves it." />
          )}
        </Panel>
      </div>

      {/* BALANCE SHEETS */}
      <section className="section">
        <div className="row between" style={{ marginBottom: 14 }}>
          <Eyebrow>Running balance sheets · after step {step} of {total}</Eyebrow>
          <span className="tiny muted mono">Σ cash across all boxes = {fmt(ENTITIES.reduce((s, e) => s + balances[e.id].cash, 0))}</span>
        </div>
        <div className="mf-bs">
          {(['opco', 'holdco', 'propco', 'invco', 'trust', 'family'] as EntityId[]).map((id) => (
            <BalanceCard key={id} id={id} b={balances} active={activeEntities.has(id)} fmt={fmt} />
          ))}
        </div>
        <div className="mf-bs-ext" style={{ marginTop: 12 }}>
          {(['customers', 'vendors', 'tax', 'lenders', 'insurance', 'seller'] as EntityId[]).map((id) => (
            <Chip key={id} tone={id === 'tax' ? 'red' : id === 'lenders' ? 'blue' : id === 'insurance' ? 'green' : undefined}>{ENTITY_BY_ID[id].label}: {fmt(balances[id].cash + Object.values(balances[id].assets).reduce((s, v) => s + v, 0))}</Chip>
          ))}
        </div>
      </section>

      <section className="section" style={{ marginTop: 32 }}>
        <div className="grid grid-2" style={{ gap: 16 }}>
          <Callout tone="danger" title="What this is NOT">
            <p><strong>No tax disappears by moving money between related entities.</strong> The tax reserve is the one flow in this cycle that never goes to zero. Distributions, loans and contributions change who reports income and when, not whether it is reported.</p>
            <p><strong>Related-party loans must be bona fide.</strong> The HoldCo → PropCo note only counts as debt if it has a written note, a real rate, a maturity, actual payments and a borrower who could repay. Otherwise it is recharacterised as equity or a disguised distribution, and the asset-protection logic collapses with it.</p>
            <p style={{ marginBottom: 0 }}><strong>Distributions follow governing documents.</strong> Every arrow out of OpCo and HoldCo requires authority under the operating agreement and must pass the statutory solvency test. A distribution that strips an entity ahead of a known claim is a fraudulent transfer, not planning.</p>
          </Callout>
          <div className="stack">
            <Panel tight>
              <Eyebrow>Key figures this cycle</Eyebrow>
              <div className="grid grid-2" style={{ gap: 8, marginTop: 10 }}>
                <Stat label="Operating profit" value={fmt(flows[2].amount)} />
                <Stat label="Tax reserve" value={fmt(flows[3].amount)} tone="red" sub={pct(inputs.taxReserveRate, 0) + ' illustrative'} />
                <Stat label="To HoldCo" value={fmt(flows[4].amount)} tone="gold" />
                <Stat label="Property acquired" value={fmt(flows[8].amount)} sub={`${pct(inputs.ltv, 0)} debt`} />
              </div>
            </Panel>
            <Disclaimer>Rates, ratios and the one-year snapshot are illustrative. Entity classification, state law, lender covenants and the trust instrument determine real outcomes. Professional legal and tax review would ordinarily be required before any of these movements is executed.</Disclaimer>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stage({ flows, step, progress, balances, selected, onSelect, active, fmt }: { flows: Flow[]; step: number; progress: number; balances: Balances; selected: string | null; onSelect: (id: string) => void; active: Set<EntityId>; fmt: Fmt }) {
  const current = step < flows.length ? flows[step] : null;
  const geo = useMemo(() => Object.fromEntries(flows.map((f) => [f.id, f.from !== f.to ? edgeGeometry(f) : null])), [flows]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="diagram mf-stage" aria-label="Money flow stage">
      <defs>
        <radialGradient id="mf-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(201,169,97,0.18)" /><stop offset="100%" stopColor="rgba(201,169,97,0)" /></radialGradient>
      </defs>
      <circle cx={360} cy={270} r={260} fill="url(#mf-glow)" />
      {/* edges */}
      {flows.map((f, i) => {
        const g = geo[f.id]; if (!g) return null;
        const state = i < step ? 'done' : i === step && current ? 'live' : '';
        return (
          <g key={f.id} onClick={() => onSelect(f.id)}>
            <path d={g.d} className="mf-hit" />
            <path d={g.d} className={`mf-edge ${state} ${selected === f.id ? 'selected' : ''} ${state === 'live' ? 'flow-line' : ''}`} />
            <polygon points="0,-4 8,0 0,4" className="mf-arrow" transform={`translate(${g.end.x} ${g.end.y}) rotate(${g.angle})`} style={{ fill: state ? 'var(--gold)' : undefined }} />
            <text x={g.at(0.5).x + 6} y={g.at(0.5).y - 6} className="mf-stepnum">{String(f.step).padStart(2, '0')}</text>
          </g>
        );
      })}
      {/* nodes */}
      {ENTITIES.map((e) => {
        const b = balances[e.id];
        const value = e.external ? b.cash + Object.values(b.assets).reduce((s, v) => s + v, 0) : b.cash;
        return (
          <g key={e.id} className={`mf-node ${e.external ? 'external' : ''} ${active.has(e.id) ? 'active' : ''}`} transform={`translate(${e.x} ${e.y})`}>
            <rect x={-NODE_W / 2} y={-NODE_H / 2} width={NODE_W} height={NODE_H} rx={10} style={{ stroke: active.has(e.id) ? 'var(--gold)' : TONE[e.tone] }} />
            <text y={-10} textAnchor="middle" className="mf-title">{e.label}</text>
            <text y={3} textAnchor="middle" className="mf-sub">{e.sub}</text>
            <text y={18} textAnchor="middle" className="mf-cash">{e.external ? '' : 'cash '}{fmt(value, { compact: true })}</text>
            {!e.external && (b.totalLiabilities > 0 || Object.keys(b.assets).length > 0) && (
              <text y={NODE_H / 2 + 12} textAnchor="middle" className="mf-stepnum">equity {fmt(b.equity, { compact: true })}{b.totalLiabilities > 0 ? ` · debt ${fmt(b.totalLiabilities, { compact: true })}` : ''}</text>
            )}
          </g>
        );
      })}
      {/* packet */}
      {current && current.from !== current.to && geo[current.id] && (() => {
        const g = geo[current.id]!; const p = g.at(ease(progress));
        return (
          <g className="mf-packet" transform={`translate(${p.x} ${p.y})`} onClick={() => onSelect(current.id)}>
            <circle r={16} className="halo" />
            <circle r={6.5} className="core" />
            <text y={-14} textAnchor="middle">{fmt(current.amount, { compact: true })}</text>
          </g>
        );
      })()}
      {/* recognition pulse */}
      {current && current.from === current.to && (
        <g transform={`translate(${ENTITY_BY_ID[current.from].x} ${ENTITY_BY_ID[current.from].y})`} onClick={() => onSelect(current.id)} style={{ cursor: 'pointer' }}>
          <rect x={-NODE_W / 2 - 8 * progress} y={-NODE_H / 2 - 8 * progress} width={NODE_W + 16 * progress} height={NODE_H + 16 * progress} rx={12} className="mf-pulse" opacity={1 - progress} />
          <text y={-NODE_H / 2 - 14} textAnchor="middle" className="mf-cash" style={{ pointerEvents: 'none' }}>profit {fmt(current.amount, { compact: true })}</text>
        </g>
      )}
    </svg>
  );
}

function BalanceCard({ id, b, active, fmt }: { id: EntityId; b: Balances; active: boolean; fmt: Fmt }) {
  const e = ENTITY_BY_ID[id]; const x = b[id];
  return (
    <div className={`mf-bs-card ${active ? 'active' : ''}`}>
      <div className="row between"><span style={{ fontWeight: 500, color: 'var(--ivory)' }}>{e.label}</span><span className="tiny muted">{e.sub}</span></div>
      <div className="mf-bs-head">Assets</div>
      <div className="mf-bs-row"><span>Cash</span><span>{fmt(x.cash)}</span></div>
      {Object.entries(x.assets).map(([k, v]) => <div key={k} className="mf-bs-row"><span>{k}</span><span>{fmt(v)}</span></div>)}
      <div className="mf-bs-head">Liabilities</div>
      {Object.keys(x.liabilities).length === 0 && <div className="mf-bs-row"><span className="muted">none</span><span>—</span></div>}
      {Object.entries(x.liabilities).map(([k, v]) => <div key={k} className="mf-bs-row"><span>{k}</span><span>{fmt(v)}</span></div>)}
      <div className="mf-bs-row mf-bs-eq"><span>Equity</span><span>{fmt(x.equity)}</span></div>
    </div>
  );
}

function WhyPanel({ flow, fmt, onClose }: { flow: Flow; fmt: Fmt; onClose: () => void }) {
  return (
    <div className="fade-in">
      <div className="row between" style={{ marginTop: 8 }}>
        <h3 style={{ fontSize: '1.4rem' }}>{flow.title}</h3>
        <button className="btn sm ghost" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="row" style={{ gap: 8, marginTop: 6 }}>
        <Chip>{ENTITY_BY_ID[flow.from].label} → {ENTITY_BY_ID[flow.to].label}</Chip>
        <Chip tone="gold">{fmt(flow.amount)}</Chip>
        <Chip tone={flow.kind === 'tax' ? 'red' : flow.kind === 'loan' || flow.kind === 'interest' ? 'blue' : undefined}>{flow.kind}</Chip>
      </div>
      {flow.notes.length > 0 && <Callout tone="amber"><p style={{ margin: 0, fontSize: '0.85rem' }}>{flow.notes.join(' ')}</p></Callout>}
      <h4>Economic reason</h4><p>{flow.explain.economic}</p>
      <h4>Legal mechanism</h4><p>{flow.explain.legal}</p>
      <h4>Documentation required</h4><ul>{flow.explain.documentation.map((d) => <li key={d}>{d}</li>)}</ul>
      <h4>Tax questions raised</h4><ul>{flow.explain.taxQuestions.map((d) => <li key={d}>{d}</li>)}</ul>
      <h4>Who approves</h4><p>{flow.explain.approvals}</p>
      <h4>Objectives served</h4><ObjectiveTags objectives={flow.explain.objectives} />
    </div>
  );
}
