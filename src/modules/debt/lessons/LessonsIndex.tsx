import { Link } from 'react-router-dom';
import { DEBT_LESSONS } from '@/content/debt/lessons';
import { useAppStore } from '@/store/useAppStore';
import { Chip, ObjectiveTags, ProgressBar, Reveal, SectionHeader } from '@/components/ui';
import { STUDIO_BASE } from '../shell/StudioShell';

export default function LessonsIndex() {
  const progress = useAppStore((s) => s.progress);
  const done = DEBT_LESSONS.filter((l) => progress[l.id]?.completed).length;
  const next = DEBT_LESSONS.find((l) => !progress[l.id]?.completed) ?? DEBT_LESSONS[0];
  return (
    <div className="container ds-page">
      <SectionHeader eyebrow="Nine lessons · about five hours" title="The debt curriculum" lede="From the anatomy of a loan to the debt policy of an institutional family. Each lesson has visuals, an interactive, key terms, a misconception, a knowledge check and jurisdiction notes for the mode you have selected." />
      <div className="row between" style={{ marginBottom: 24 }}>
        <div style={{ flex: 1, maxWidth: 420 }}>
          <div style={{ flex: 1 }}><ProgressBar value={done / DEBT_LESSONS.length} /></div>
          <span className="tiny muted mono">{done}/{DEBT_LESSONS.length} complete</span>
        </div>
        <Link to={`${STUDIO_BASE}/lessons/${next.number}`} className="btn primary">{done === 0 ? 'Start Lesson 01' : done === DEBT_LESSONS.length ? 'Review Lesson 01' : `Continue · Lesson ${String(next.number).padStart(2, '0')}`} →</Link>
      </div>
      <div className="grid grid-3">
        {DEBT_LESSONS.map((l, i) => {
          const p = progress[l.id];
          return (
            <Reveal key={l.id} delay={(i % 3) * 0.06}>
              <Link to={`${STUDIO_BASE}/lessons/${l.number}`} className="panel tight ds-card-link">
                <div className="row between">
                  <span className="ds-card-num">LESSON {String(l.number).padStart(2, '0')}</span>
                  {p?.completed ? <Chip tone="green">Complete{p.score !== undefined ? ` · ${Math.round(p.score * 100)}%` : ''}</Chip> : p?.visited ? <Chip tone="gold">In progress</Chip> : <span className="tiny muted mono">{l.duration}</span>}
                </div>
                <div className="display" style={{ fontSize: '1.45rem', margin: '10px 0 6px' }}>{l.title}</div>
                <p className="small muted" style={{ margin: '0 0 12px' }}>{l.subtitle}</p>
                <ObjectiveTags objectives={l.objectives} />
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
