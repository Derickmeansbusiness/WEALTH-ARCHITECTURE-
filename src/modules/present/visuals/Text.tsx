import type { ReactNode } from 'react';
import { useCountUp } from './motion';
import type { Tone } from './Frame';

/**
 * Progressive bullet list. Item `i` is visible once `step >= startAt + i`.
 * @param items title + optional body per bullet
 * @param step current slide step
 * @param startAt step at which the first item appears (default 0)
 * @param dimPrevious fade items that are not the latest revealed one
 * @param compact smaller typography for 6+ items
 */
export function BuildList({ items, step, startAt = 0, dimPrevious, compact, numbered = true }: {
  items: { title: ReactNode; body?: ReactNode }[]; step: number; startAt?: number; dimPrevious?: boolean; compact?: boolean; numbered?: boolean;
}) {
  const current = step - startAt;
  return (
    <ul className={`present-build ${compact ? 'compact' : ''}`}>
      {items.map((it, i) => {
        const on = current >= i;
        const dim = dimPrevious && on && current > i;
        return (
          <li key={i} className={`present-reveal ${on ? 'on' : ''} ${dim ? 'dim' : ''}`} style={{ transitionDelay: on ? '0ms' : '0ms' }}>
            <span className="present-build-n">{numbered ? String(i + 1).padStart(2, '0') : '—'}</span>
            <div>
              <div className="present-build-t">{it.title}</div>
              {it.body && <div className="present-build-d">{it.body}</div>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Animated number. Counts from 0 to `value` when `active` turns true.
 * @param format formatter (default: en-US integer). Use money()/pct() from '@/lib/format'.
 * @param label uppercase label under the number; `sub` muted caption
 */
export function Counter({ value, active, format, label, sub, tone, duration = 1400, delay = 0, size }: {
  value: number; active: boolean; format?: (n: number) => string; label?: ReactNode; sub?: ReactNode; tone?: Tone; duration?: number; delay?: number; size?: number;
}) {
  const v = useCountUp(value, active, duration, delay);
  const text = format ? format(v) : Math.round(v).toLocaleString('en-US');
  return (
    <div className="present-counter">
      <span className={`present-counter-v ${tone ?? ''}`} style={size ? { fontSize: size } : undefined}>{text}</span>
      {label && <span className="present-counter-l">{label}</span>}
      {sub && <span className="present-counter-s">{sub}</span>}
    </div>
  );
}

/**
 * Title whose words appear one per step. Word `i` is visible once `step >= startAt + i`.
 * @param gold indices of words rendered in italic gold
 */
export function SplitTitle({ words, step, startAt = 0, gold = [], size = 84 }: { words: string[]; step: number; startAt?: number; gold?: number[]; size?: number }) {
  return (
    <div className="present-split" style={{ fontSize: size }}>
      {words.map((w, i) => <span key={i} className={`${step - startAt >= i ? 'on' : ''} ${gold.includes(i) ? 'gold' : ''}`} style={{ transitionDelay: `${0.05 * i}s` }}>{w}</span>)}
    </div>
  );
}

/** GREEN / AMBER / RED confidence banner used on misconception slides. */
export function ConfidenceBanner({ level, on = true }: { level: 'green' | 'amber' | 'red'; on?: boolean }) {
  const label = level === 'green' ? 'Green · Strongly supported' : level === 'amber' ? 'Amber · Fact & jurisdiction dependent' : 'Red · Misleading as commonly stated';
  return (
    <div className={`present-reveal ${on ? 'on' : ''}`}>
      <span className={`present-banner ${level}`}><i />{label}</span>
    </div>
  );
}
