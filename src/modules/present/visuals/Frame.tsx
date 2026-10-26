import type { CSSProperties, ReactNode } from 'react';
import type { Objective } from '@/types/content';
import { OBJECTIVE_LABELS } from '@/types/content';

/** Semantic tone used by every visual primitive. Arrow semantics: green = money, gold = ownership, blue = control, red = liability, violet = fiduciary/trust, amber = warning. */
export type Tone = 'gold' | 'green' | 'blue' | 'red' | 'violet' | 'amber' | 'ivory';

/** CSS color for a tone (SVG strokes/fills). */
export const TONE_COLOR: Record<Tone, string> = {
  gold: 'var(--gold)', green: 'var(--green-2)', blue: 'var(--blue)', red: 'var(--red)', violet: 'var(--violet)', amber: 'var(--amber)', ivory: 'var(--ivory-2)',
};
/** Objective → tone mapping (matches the shared UI kit). */
export const OBJECTIVE_TONE: Record<Objective, Tone> = {
  'asset-protection': 'red', 'tax-planning': 'green', 'estate-planning': 'violet', privacy: 'blue', succession: 'gold', governance: 'amber',
};

/**
 * Standard slide frame inside the 1920×1080 stage.
 * @param eyebrow small gold uppercase label (chapter / section)
 * @param title display title; `titleSize` picks 72 / 84 / 96 / 120px
 * @param sub optional lede under the title
 * @param center centers the whole frame (title cards)
 * @param footnote left footer text; `cite` right footer (authority citation)
 */
export function SlideFrame({ eyebrow, title, titleSize = 'base', sub, children, center, footnote, cite, style }: {
  eyebrow?: ReactNode; title?: ReactNode; titleSize?: 'md' | 'base' | 'lg' | 'xl'; sub?: ReactNode; children?: ReactNode; center?: boolean; footnote?: ReactNode; cite?: ReactNode; style?: CSSProperties;
}) {
  return (
    <div className={`present-frame ${center ? 'center' : ''}`} style={style}>
      {eyebrow && <div className="present-eyebrow">{eyebrow}</div>}
      {title && <h2 className={`present-title ${titleSize === 'base' ? '' : titleSize}`}>{title}</h2>}
      {sub && <p className="present-sub">{sub}</p>}
      {children && <div className="present-body">{children}</div>}
      {(footnote || cite) && <div className="present-footnote"><span>{footnote}</span>{cite && <span className="mono">{cite}</span>}</div>}
    </div>
  );
}

/** Glass panel for use inside a slide. `on` controls a fade/slide-in reveal (default true). */
export function Glass({ children, tone, on = true, dim, style, className = '' }: { children: ReactNode; tone?: Tone; on?: boolean; dim?: boolean; style?: CSSProperties; className?: string }) {
  return <div className={`present-glass present-reveal ${tone ?? ''} ${on ? 'on' : ''} ${dim ? 'dim' : ''} ${className}`} style={style}>{children}</div>;
}

/** Generic reveal wrapper: hidden until `on`; `dim` fades previously-shown content back. */
export function Reveal({ children, on, dim, style, className = '', as = 'div' }: { children: ReactNode; on: boolean; dim?: boolean; style?: CSSProperties; className?: string; as?: 'div' | 'span' | 'li' }) {
  const cls = `present-reveal ${on ? 'on' : ''} ${dim ? 'dim' : ''} ${className}`;
  if (as === 'span') return <span className={cls} style={style}>{children}</span>;
  if (as === 'li') return <li className={cls} style={style}>{children}</li>;
  return <div className={cls} style={style}>{children}</div>;
}

/** Large uppercase chip. */
export function BigChip({ children, tone }: { children: ReactNode; tone?: Tone }) {
  return <span className={`present-chip ${tone ?? ''}`}>{children}</span>;
}

/** Six-objective chips, large, using the platform tones. */
export function ObjectiveChips({ objectives, shown }: { objectives: Objective[]; shown?: number }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {objectives.map((o, i) => (
        <Reveal key={o} on={shown === undefined || i < shown} as="span"><BigChip tone={OBJECTIVE_TONE[o]}>{OBJECTIVE_LABELS[o]}</BigChip></Reveal>
      ))}
    </div>
  );
}

/** Arrow-semantics legend (money / ownership / control / liability). Pass `items` to customize. */
export function ArrowLegend({ items }: { items?: { tone: Tone; label: string }[] }) {
  const list = items ?? [
    { tone: 'green', label: 'Money' }, { tone: 'gold', label: 'Ownership' }, { tone: 'blue', label: 'Control' }, { tone: 'red', label: 'Liability' },
  ];
  return (
    <div className="present-legend">
      {list.map((l) => <span key={l.label}><i style={{ background: TONE_COLOR[l.tone] }} />{l.label}</span>)}
    </div>
  );
}
