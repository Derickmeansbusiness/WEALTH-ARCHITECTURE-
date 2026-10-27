import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Chip, Stat, Disclaimer, Eyebrow, ProgressBar } from '@/components/ui';
import { pct } from '@/lib/format';
import { scoreReadiness, radarPoints, QUESTIONS, COMPONENTS, type Answer, type Answers } from './model';
import './styles.css';

const ANSWERS: Answer[] = ['yes', 'partial', 'no'];
const BAND_LABEL = { forming: 'Forming', developing: 'Developing', established: 'Established', mature: 'Mature' } as const;
const BAND_TONE = { forming: 'red', developing: 'amber', established: 'gold', mature: 'green' } as const;

function Radar({ scores, labels }: { scores: number[]; labels: string[] }) {
  const cx = 200, cy = 200, r = 140, n = scores.length;
  const rings = [0.25, 0.5, 0.75, 1];
  const pts = radarPoints(scores, cx, cy, r);
  const outer = radarPoints(scores.map(() => 1), cx, cy, r);
  const labelPts = radarPoints(scores.map(() => 1.18), cx, cy, r);
  const poly = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 400 400" className="ch14-radar" role="img" aria-label="Governance readiness radar across ten components">
      {rings.map((k) => <polygon key={k} points={radarPoints(scores.map(() => k), cx, cy, r).map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(243,236,220,0.1)" strokeWidth={1} />)}
      {outer.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(243,236,220,0.08)" />)}
      <polygon points={poly} fill="rgba(201,169,97,0.18)" stroke="var(--gold)" strokeWidth={1.6} style={{ transition: 'all 0.5s var(--ease)' }} />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={scores[i] >= 0.75 ? 'var(--green-2)' : scores[i] >= 0.4 ? 'var(--amber)' : 'var(--red)'} />)}
      {labelPts.map((p, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
        return <text key={i} x={p.x} y={p.y + 4} textAnchor={anchor} style={{ fontSize: 10.5, fill: 'var(--ivory-2)' }}>{labels[i]}</text>;
      })}
    </svg>
  );
}

export default function Simulator() {
  const [answers, setAnswers] = useState<Answers>({});
  const result = useMemo(() => scoreReadiness(answers), [answers]);
  const complete = result.answered === QUESTIONS.length;
  const reset = () => setAnswers({});

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <Panel>
          <div className="row between" style={{ marginBottom: 6 }}>
            <Eyebrow>Twelve questions</Eyebrow>
            <span className="mono small muted">{result.answered} / {QUESTIONS.length} answered</span>
          </div>
          <ProgressBar value={result.answered / QUESTIONS.length} tone="gold" />
          <p className="small muted" style={{ margin: '10px 0 12px' }}>Answer for the family as it is today, not as the founder would like it to be. "Partial" means something exists but is informal, undocumented or not applied to everyone.</p>
          <div className="stack" style={{ gap: 8 }}>
            {QUESTIONS.map((q, i) => {
              const comp = COMPONENTS.find((c) => c.id === q.component)!;
              return (
                <div key={q.id} className="ch14-q">
                  <span className="c">{i + 1} · {comp.label}</span>
                  <span className="t">{q.text}</span>
                  <div className="ch14-ans" role="radiogroup" aria-label={q.text}>
                    {ANSWERS.map((a) => <button key={a} type="button" className={`${a} ${answers[q.id] === a ? 'on' : ''}`} aria-pressed={answers[q.id] === a} onClick={() => setAnswers((s) => ({ ...s, [q.id]: a }))}>{a}</button>)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="row" style={{ marginTop: 12 }}><button className="btn sm ghost" onClick={reset}>Reset</button></div>
        </Panel>

        <div className="stack" style={{ gap: 14 }}>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <Stat label="Weighted readiness" value={complete ? pct(result.overall, 0) : `${pct(result.overall, 0)}*`} tone={complete ? (BAND_TONE[result.band] === 'gold' ? 'gold' : BAND_TONE[result.band]) : undefined} sub={complete ? BAND_LABEL[result.band] : 'provisional until all answered'} />
            <Stat label="Components fully in place" value={`${result.components.filter((c) => c.score >= 1).length} / ${COMPONENTS.length}`} sub={`${result.gaps.filter((g) => g.score === 0).length} absent entirely`} />
          </div>
          <Panel tight>
            <Eyebrow>Readiness radar</Eyebrow>
            <Radar scores={result.components.map((c) => c.score)} labels={result.components.map((c) => c.component.short)} />
          </Panel>
        </div>
      </div>

      <Panel>
        <div className="row between" style={{ marginBottom: 12 }}>
          <Eyebrow>Prioritized gaps</Eyebrow>
          <Link to="/governance" className="btn sm ghost">Open the Governance Builder →</Link>
        </div>
        {result.answered === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>Answer the questions to see which components to address first. Priority weights succession and conflict resolution most heavily, because those are the gaps that cost families the most when tested.</p>
        ) : result.gaps.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>Every component scores fully. The remaining work is the hardest part: keeping it alive when the people who built it are gone.</p>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {result.gaps.map((g, i) => (
              <div key={g.component.id} className={`ch14-gap ${g.score === 0 ? 'hot' : ''}`}>
                <div className="row between" style={{ marginBottom: 4 }}>
                  <h5>{i + 1}. {g.component.label}</h5>
                  <div className="row" style={{ gap: 6 }}>
                    <Chip tone={g.score === 0 ? 'red' : 'amber'}>{g.score === 0 ? 'absent' : `${pct(g.score, 0)} in place`}</Chip>
                    <Chip>weight {g.component.weight.toFixed(1)}</Chip>
                  </div>
                </div>
                <p>{g.component.remedy}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel tight>
        <Eyebrow>Assumptions & formulas</Eyebrow>
        <ul className="small muted" style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Answer values: yes = 1, partial = 0.5, no = 0. Unanswered questions count as 0 for their component until answered.</li>
          <li>Component score = mean of its questions (constitution and succession carry two questions each; the other eight carry one).</li>
          <li>Weighted readiness = Σ(component score × weight) ÷ Σ weights. Weights: succession 1.4; constitution and conflict 1.3; council and distribution 1.2; investment 1.1; education and employment 1.0; assembly 0.8; philanthropy 0.7.</li>
          <li>Bands: forming &lt; 35%, developing 35–59%, established 60–84%, mature ≥ 85%.</li>
          <li>Gap priority = (1 − score) × weight; ties broken by order. The radar plots raw component scores on ten equally spaced axes.</li>
          <li>This is a self-assessment instrument. It measures whether structures exist and are written, not whether they are followed, which is the thing that matters and which only time reveals.</li>
        </ul>
      </Panel>
      <Disclaimer tone="amber">Governance documents interact with legal instruments: a family constitution binds only where its terms are carried into shareholder agreements, operating agreements, trust instruments and employment contracts. Those require counsel in each relevant jurisdiction. Philanthropic vehicles carry their own tax rules (private foundation excise taxes under IRC §§4940–4945; donor-advised fund rules under §4966) that need a tax adviser.</Disclaimer>
    </div>
  );
}
