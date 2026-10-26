import type { ComponentType, ReactNode } from 'react';
import type { Slide } from '@/types/present';
import type { Objective } from '@/types/content';
import type { ChapterMeta } from '@/content/chapters/manifest';
import { pad2 } from '@/lib/format';
import { SlideFrame, Glass, Reveal, BuildList, Counter, ConfidenceBanner, ObjectiveChips, ArrowLegend, type Tone } from '../visuals';

export const sectionOf = (c: ChapterMeta) => `Chapter ${pad2(c.number)} — ${c.title}`;

export interface VisualProps { step: number; active: boolean }

/** Section title card: big number + title + one-line hook. */
export function sectionCard(ch: ChapterMeta, hook: string, notes: string[], minutes = 0.5): Slide {
  return {
    id: `${ch.id}-section`, section: sectionOf(ch), title: ch.title, minutes, notes,
    Visual: ({ step }) => (
      <div className="present-frame" style={{ justifyContent: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '520px 1fr', gap: 80, alignItems: 'center' }}>
          <div className="present-section-n"><b>{pad2(ch.number)}</b></div>
          <div>
            <div className="present-eyebrow">Chapter {pad2(ch.number)} of 15 · {ch.duration}</div>
            <h2 className="present-title xl" style={{ fontSize: 110 }}>{ch.title}</h2>
            <Reveal on={step >= 0}><p className="present-sub" style={{ fontSize: 36, marginTop: 30, fontStyle: 'italic', color: 'var(--gold-2)', fontFamily: 'var(--font-display)' }}>{hook}</p></Reveal>
          </div>
        </div>
      </div>
    ),
  };
}

/** Concept slide with a progressive build list. steps = items.length. */
export function conceptSlide(ch: ChapterMeta, id: string, title: ReactNode, items: { title: ReactNode; body?: ReactNode }[], notes: string[], opts: { minutes?: number; eyebrow?: string; compact?: boolean; footnote?: ReactNode; cite?: ReactNode } = {}): Slide {
  return {
    id: `${ch.id}-${id}`, section: sectionOf(ch), title: typeof title === 'string' ? title : ch.title, steps: items.length, minutes: opts.minutes ?? 1.25, notes,
    Visual: ({ step }) => (
      <SlideFrame eyebrow={opts.eyebrow ?? `Chapter ${pad2(ch.number)} · Concept`} title={title} titleSize="md" footnote={opts.footnote} cite={opts.cite}>
        <BuildList items={items} step={step} compact={opts.compact ?? items.length > 5} dimPrevious />
      </SlideFrame>
    ),
  };
}

/** Diagram slide: full-width custom visual with optional legend. */
export function diagramSlide(ch: ChapterMeta, id: string, title: ReactNode, Diagram: ComponentType<VisualProps>, steps: number, notes: string[], opts: { minutes?: number; sub?: ReactNode; legend?: boolean | { tone: Tone; label: string }[]; cite?: ReactNode; footnote?: ReactNode; eyebrow?: string } = {}): Slide {
  return {
    id: `${ch.id}-${id}`, section: sectionOf(ch), title: typeof title === 'string' ? title : ch.title, steps, minutes: opts.minutes ?? 1.25, notes,
    Visual: ({ step, active }) => (
      <SlideFrame eyebrow={opts.eyebrow ?? `Chapter ${pad2(ch.number)} · Architecture`} title={title} titleSize="md" sub={opts.sub} footnote={opts.footnote} cite={opts.cite}>
        <div style={{ position: 'absolute', inset: 0 }}><Diagram step={step} active={active} /></div>
        {opts.legend && <div style={{ position: 'absolute', right: 0, top: -70 }}><ArrowLegend items={Array.isArray(opts.legend) ? opts.legend : undefined} /></div>}
      </SlideFrame>
    ),
  };
}

export interface CounterSpec { value: number; label: ReactNode; sub?: ReactNode; format?: (n: number) => string; tone?: Tone }

/** Worked example slide: animated counters (left) and a chart (right, revealed at step 1). steps = 2. */
export function numbersSlide(ch: ChapterMeta, id: string, title: ReactNode, counters: CounterSpec[], chart: (p: VisualProps) => ReactNode, notes: string[], opts: { minutes?: number; assumptions?: ReactNode; cite?: ReactNode; sub?: ReactNode; chartWidth?: number } = {}): Slide {
  return {
    id: `${ch.id}-${id}`, section: sectionOf(ch), title: typeof title === 'string' ? title : ch.title, steps: 2, minutes: opts.minutes ?? 1, notes,
    Visual: ({ step, active }) => (
      <SlideFrame eyebrow={`Chapter ${pad2(ch.number)} · Worked example`} title={title} titleSize="md" sub={opts.sub} footnote={opts.assumptions ? <span>Assumptions: {opts.assumptions}</span> : 'Illustrative figures. Educational simulation, not advice.'} cite={opts.cite}>
        <div style={{ display: 'grid', gridTemplateColumns: `${counters.length > 3 ? 720 : 560}px 1fr`, gap: 60, height: '100%', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: counters.length > 3 ? '1fr 1fr' : '1fr', gap: 44 }}>
            {counters.map((c, i) => <Counter key={i} value={c.value} active={active} format={c.format} label={c.label} sub={c.sub} tone={c.tone} delay={i * 180} size={counters.length > 3 ? 60 : 76} />)}
          </div>
          <Reveal on={step >= 1} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{chart({ step, active: active && step >= 1 })}</Reveal>
        </div>
      </SlideFrame>
    ),
  };
}

/** Misconception slide: claim → reality → GREEN/AMBER/RED confidence banner. steps = 3. */
export function misconceptionSlide(ch: ChapterMeta, id: string, claim: string, reality: ReactNode, confidence: 'green' | 'amber' | 'red', notes: string[], opts: { minutes?: number; cite?: ReactNode; why?: ReactNode } = {}): Slide {
  return {
    id: `${ch.id}-${id}`, section: sectionOf(ch), title: `Misconception: ${claim}`, steps: 3, minutes: opts.minutes ?? 0.75, notes,
    Visual: ({ step }) => (
      <SlideFrame eyebrow={`Chapter ${pad2(ch.number)} · Misconception`} title="Claim vs reality" titleSize="md" cite={opts.cite}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'stretch', height: 560 }}>
          <Glass tone="red" on={step >= 0}>
            <div className="present-kicker" style={{ color: '#e7a398' }}>The claim</div>
            <h4 style={{ fontSize: 50, fontStyle: 'italic' }}>“{claim}”</h4>
          </Glass>
          <Glass tone="green" on={step >= 1}>
            <div className="present-kicker" style={{ color: 'var(--green-2)' }}>The reality</div>
            <p style={{ fontSize: 27 }}>{reality}</p>
            {opts.why && <p style={{ fontSize: 20, color: 'var(--ivory-3)', marginTop: 18 }}>{opts.why}</p>}
          </Glass>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, display: 'flex', justifyContent: 'center' }}><ConfidenceBanner level={confidence} on={step >= 2} /></div>
      </SlideFrame>
    ),
  };
}

/** Key takeaway slide: lines reveal by step, objectives chips at the bottom. steps = lines.length. */
export function takeawaySlide(ch: ChapterMeta, lines: ReactNode[], objectives: Objective[], notes: string[], opts: { minutes?: number; cite?: ReactNode } = {}): Slide {
  return {
    id: `${ch.id}-takeaway`, section: sectionOf(ch), title: `Key takeaway — ${ch.title}`, steps: lines.length, minutes: opts.minutes ?? 0.5, notes,
    Visual: ({ step }) => (
      <SlideFrame eyebrow={`Chapter ${pad2(ch.number)} · Key takeaway`} title="What to carry forward" titleSize="md" cite={opts.cite}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34, maxWidth: 1500 }}>
          {lines.map((l, i) => (
            <Reveal key={i} on={step >= i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 28, alignItems: 'start' }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 20px var(--gold)', marginTop: 20 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 46, lineHeight: 1.18, color: 'var(--ivory)' }}>{l}</span>
            </Reveal>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, bottom: 20 }}>
          <div className="present-eyebrow" style={{ marginBottom: 16, fontSize: 15 }}>Objectives in play</div>
          <ObjectiveChips objectives={objectives} />
        </div>
      </SlideFrame>
    ),
  };
}

/** Statement slide: one big line, optional sub, optional list of supporting lines revealed by step. */
export function statementSlide(section: string, id: string, title: ReactNode, opts: { eyebrow?: string; sub?: ReactNode; lines?: ReactNode[]; notes?: string[]; minutes?: number; cite?: ReactNode; titleSize?: 'md' | 'base' | 'lg' | 'xl' }): Slide {
  const lines = opts.lines ?? [];
  return {
    id, section, title: typeof title === 'string' ? title : id, steps: Math.max(1, lines.length + (opts.sub ? 1 : 0)), minutes: opts.minutes ?? 1, notes: opts.notes,
    Visual: ({ step }) => (
      <SlideFrame eyebrow={opts.eyebrow} title={title} titleSize={opts.titleSize ?? 'lg'} cite={opts.cite}>
        {opts.sub && <Reveal on={step >= 1}><p className="present-sub" style={{ marginTop: 0 }}>{opts.sub}</p></Reveal>}
        {lines.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: lines.length > 4 ? '1fr 1fr 1fr' : '1fr', gap: 24, marginTop: 40 }}>
            {lines.map((l, i) => (
              <Glass key={i} on={step >= i + (opts.sub ? 2 : 1)} style={{ padding: '26px 32px' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'baseline' }}><span className="mono" style={{ color: 'var(--gold)', fontSize: 22 }}>{pad2(i + 1)}</span><span style={{ fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: 1.15, color: 'var(--ivory)' }}>{l}</span></div>
              </Glass>
            ))}
          </div>
        )}
      </SlideFrame>
    ),
  };
}
