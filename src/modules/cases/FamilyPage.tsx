import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Panel, SectionHeader, Chip, Disclaimer, Eyebrow, ObjectiveTags, Stat, useMoney, EmptyState, Callout } from '@/components/ui';
import { CHAPTERS } from '@/content/chapters/manifest';
import { familyById, entityCount } from '@/content/cases';
import StructureRenderer from './StructureRenderer';
import { useAnimatedNumber } from './useAnimatedNumber';

export default function FamilyPage() {
  const { familyId } = useParams();
  const fam = familyById(familyId ?? '');
  const fmt = useMoney();
  const [i, setI] = useState(0);
  const stage = fam?.stages[Math.min(i, (fam?.stages.length ?? 1) - 1)];
  const nw = useAnimatedNumber(stage?.netWorthUSD ?? 0);
  const maxLine = useMemo(() => (fam ? Math.max(...fam.stages.flatMap((s) => [...s.balanceSheet.assets, ...s.balanceSheet.liabilities].map((l) => l.value))) : 1), [fam]);

  if (!fam || !stage) {
    return <div className="page container"><EmptyState title="Family not found" body="This case study does not exist." action={<Link className="btn sm" to="/cases">All case studies</Link>} /></div>;
  }
  const assets = stage.balanceSheet.assets.reduce((s, l) => s + l.value, 0);
  const liabilities = stage.balanceSheet.liabilities.reduce((s, l) => s + l.value, 0);
  const chapters = CHAPTERS.filter((c) => fam.relatedChapters.includes(c.slug));

  return (
    <div className="page container">
      <div className="row" style={{ gap: 8, marginBottom: 14 }}>
        <Link to="/cases" className="btn sm ghost">‹ All families</Link>
        <Link to="/cases/compare" className="btn sm ghost">Compare families</Link>
      </div>
      <div className="cases-head">
        <SectionHeader eyebrow={`Case study · Level ${fam.level} · ${fam.levelLabel}`} title={fam.name} lede={fam.overview}>
          <div className="row" style={{ gap: 6 }}>{fam.jurisdictions.map((j) => <Chip key={j} tone="blue">{j}</Chip>)}<Chip tone="amber">Fictional · educational</Chip></div>
        </SectionHeader>
        <Panel tight tone="gold">
          <Eyebrow>Net worth · {stage.year}</Eyebrow>
          <div className="cases-nw num">{fmt(nw, { compact: true })}</div>
          <div className="grid grid-3" style={{ gap: 8, marginTop: 10 }}>
            <Stat label="Entities & trusts" value={entityCount(stage)} />
            <Stat label="Assets" value={fmt(assets, { compact: true })} tone="green" />
            <Stat label="Liabilities" value={fmt(liabilities, { compact: true })} tone="red" />
          </div>
        </Panel>
      </div>

      <div className="cases-scrub" role="tablist" aria-label="Stages" style={{ margin: '18px 0' }}>
        {fam.stages.map((s, idx) => (
          <button key={s.year} role="tab" aria-selected={idx === i} className={idx === i ? 'sel' : ''} onClick={() => setI(idx)}>
            <span className="yr">{s.year} · stage {idx + 1}</span>
            <span className="tt">{s.title}</span>
            <span className="bar" aria-hidden><span style={{ width: idx <= i ? '100%' : '0%' }} /></span>
          </button>
        ))}
      </div>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm ghost" disabled={i === 0} onClick={() => setI(i - 1)}>‹ Previous stage</button>
          <button className="btn sm" disabled={i === fam.stages.length - 1} onClick={() => setI(i + 1)}>Next stage ›</button>
        </div>
        <ObjectiveTags objectives={stage.objectivesServed} />
      </div>

      <div className="cases-layout">
        <div className="stack">
          <Panel tight>
            <div className="row between"><Eyebrow>Structure · {stage.title}</Eyebrow><span className="tiny muted">Nodes move and fade between stages</span></div>
            <div style={{ marginTop: 10 }}><StructureRenderer stage={stage} /></div>
          </Panel>
          <Panel tight>
            <Eyebrow>What happened</Eyebrow>
            <div className="stack" style={{ gap: 8, marginTop: 8 }}>{stage.narrative.map((p, k) => <p key={k} style={{ margin: 0 }}>{p}</p>)}</div>
          </Panel>
          <Panel tight>
            <Eyebrow>Decisions</Eyebrow>
            <div className="table-wrap" style={{ marginTop: 10 }}>
              <table className="table cases-decisions">
                <thead><tr><th>Decision</th><th>Why</th><th>Trade-off</th><th>Professionals involved</th></tr></thead>
                <tbody>{stage.decisions.map((d) => <tr key={d.decision}><td>{d.decision}</td><td>{d.why}</td><td>{d.tradeoff}</td><td className="muted">{d.professionalsInvolved}</td></tr>)}</tbody>
              </table>
            </div>
          </Panel>
          <div className="grid grid-2">
            <Panel tight tone="green"><Eyebrow>Mistakes avoided</Eyebrow><ul className="cases-list" style={{ marginTop: 10 }}>{stage.mistakesAvoided.map((m) => <li key={m}>{m}</li>)}</ul></Panel>
            <Panel tight tone="warn"><Eyebrow>Tax questions that arise</Eyebrow><ul className="cases-list" style={{ marginTop: 10 }}>{stage.taxQuestions.map((m) => <li key={m}>{m}</li>)}</ul><p className="tiny muted" style={{ marginTop: 8 }}>Questions, not answers. None of these structures eliminates tax; each changes who is taxed, on what, and when.</p></Panel>
          </div>
        </div>
        <div className="stack">
          <Panel tight>
            <Eyebrow>Balance sheet · {stage.year}</Eyebrow>
            <div className="cases-bs" style={{ marginTop: 10 }}>
              <div>
                <div className="tiny green" style={{ letterSpacing: '0.12em', marginBottom: 6 }}>ASSETS · {fmt(assets, { compact: true })}</div>
                {stage.balanceSheet.assets.map((l) => <Bar key={l.label} label={l.label} value={l.value} max={maxLine} color="var(--green-2)" fmt={fmt} />)}
              </div>
              <div>
                <div className="tiny red" style={{ letterSpacing: '0.12em', marginBottom: 6 }}>LIABILITIES · {fmt(liabilities, { compact: true })}</div>
                {stage.balanceSheet.liabilities.length === 0 && <p className="tiny muted">None</p>}
                {stage.balanceSheet.liabilities.map((l) => <Bar key={l.label} label={l.label} value={l.value} max={maxLine} color="var(--red)" fmt={fmt} />)}
              </div>
            </div>
            <p className="tiny muted" style={{ marginTop: 8 }}>Bars scale to the family's largest line across all stages, so growth is visible as you scrub.</p>
          </Panel>
          <Panel tight>
            <Eyebrow>Net worth path</Eyebrow>
            <MiniPath values={fam.stages.map((s) => s.netWorthUSD)} years={fam.stages.map((s) => s.year)} sel={i} fmt={(v) => fmt(v, { compact: true })} />
          </Panel>
          <Panel tight>
            <Eyebrow>Related chapters</Eyebrow>
            <div className="stack" style={{ gap: 6, marginTop: 10 }}>
              {chapters.map((c) => <Link key={c.id} to={`/academy/${c.slug}`} className="row between small" style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8 }}><span><span className="mono gold">{String(c.number).padStart(2, '0')}</span> &nbsp;{c.title}</span><span className="tiny muted">{c.duration}</span></Link>)}
            </div>
          </Panel>
          <Callout tone="amber" title="Try it elsewhere"><p className="small">Run this family's structure through the <Link to="/liability">Liability Attack Simulator</Link>, or see how its ownership would fragment on the <Link to="/timeline">100-Year Timeline</Link>.</p></Callout>
        </div>
      </div>
      <div className="section"><Disclaimer>All five families are fictional composites built for teaching. Figures, dates and outcomes are illustrative. Statutes and cases are cited as they are commonly understood; verify current law in the relevant jurisdiction and engage qualified advisers before acting.</Disclaimer></div>
    </div>
  );
}

function Bar({ label, value, max, color, fmt }: { label: string; value: number; max: number; color: string; fmt: (v: number, o?: { compact?: boolean }) => string }) {
  return (
    <div className="cases-bar">
      <div className="lbl"><span>{label}</span><span className="mono">{fmt(value, { compact: true })}</span></div>
      <div className="trk"><span style={{ width: `${Math.max(1.5, (value / max) * 100)}%`, background: color }} /></div>
    </div>
  );
}

function MiniPath({ values, years, sel, fmt }: { values: number[]; years: number[]; sel: number; fmt: (v: number) => string }) {
  const W = 360, H = 150, L = 50, R = 12, T = 12, B = 24;
  const max = Math.max(...values) * 1.08;
  const X = (i: number) => L + ((W - L - R) * i) / Math.max(1, values.length - 1);
  const Y = (v: number) => T + (H - T - B) * (1 - v / max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="cases-chart" aria-label="Net worth by stage">
      {[0, 0.5, 1].map((f) => <g key={f}><line x1={L} y1={Y(max * f)} x2={W - R} y2={Y(max * f)} className="grid" /><text x={L - 6} y={Y(max * f) + 3} textAnchor="end">{fmt(max * f)}</text></g>)}
      <path d={values.map((v, i) => `${i === 0 ? 'M' : 'L'}${X(i)},${Y(v)}`).join(' ')} className="ln" stroke="var(--gold)" />
      {values.map((v, i) => <g key={i}><circle cx={X(i)} cy={Y(v)} r={i === sel ? 5 : 3} fill={i === sel ? 'var(--gold-2)' : 'var(--gold)'} /><text x={X(i)} y={H - 8} textAnchor="middle">{years[i]}</text></g>)}
    </svg>
  );
}
