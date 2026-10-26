import type { ReactNode } from 'react';

export interface TimelineMark { year: string | number; label: ReactNode; desc?: ReactNode; /** step at which the mark appears (default = its index) */ at?: number; tone?: 'gold' | 'green' | 'red' | 'blue' | 'violet' | 'amber' }

/**
 * Horizontal timeline. Marks are spaced evenly and alternate above/below the axis.
 * Mark `i` is visible when `step >= (mark.at ?? i)`. Omit `step` to show all.
 */
export function TimelineBar({ marks, step, alternate = true }: { marks: TimelineMark[]; step?: number; alternate?: boolean }) {
  const n = marks.length;
  const COLOR: Record<string, string> = { gold: 'var(--gold)', green: 'var(--green-2)', red: 'var(--red)', blue: 'var(--blue)', violet: 'var(--violet)', amber: 'var(--amber)' };
  return (
    <div className="present-tl">
      <div className="present-tl-axis" />
      {marks.map((m, i) => {
        const left = n === 1 ? 50 : 6 + (88 * i) / (n - 1);
        const on = step === undefined || step >= (m.at ?? i);
        const pos = alternate ? (i % 2 === 0 ? 'above' : 'below') : 'below';
        const color = COLOR[m.tone ?? 'gold'];
        return (
          <div key={i} style={{ position: 'absolute', left: `${left}%`, top: 0, bottom: 0 }}>
            <div className={`present-reveal ${on ? 'on' : ''}`} style={{ position: 'absolute', top: '50%', left: 0, width: 20, height: 20, transform: 'translate(-50%, -50%)' }}>
              <div className="present-tl-dot" style={{ borderColor: color, boxShadow: `0 0 20px ${color}` }} />
            </div>
            <div className={`present-tl-mark ${pos} present-reveal ${on ? 'on' : ''}`} style={{ left: 0 }}>
              <span className="present-tl-year" style={{ color }}>{m.year}</span>
              <span className="present-tl-label">{m.label}</span>
              {m.desc && <span className="present-tl-desc">{m.desc}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
