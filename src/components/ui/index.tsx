/**
 * Shared UI kit. Every module should compose from these primitives so the platform reads as one system.
 * Classes referenced here live in src/styles/global.css.
 */
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import type { Confidence, Objective } from '@/types/content';
import { OBJECTIVE_LABELS } from '@/types/content';
import { money, type Currency } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

export function Panel({ children, className = '', tone, tight, style }: { children: ReactNode; className?: string; tone?: 'gold' | 'green' | 'danger' | 'warn'; tight?: boolean; style?: CSSProperties }) {
  return <div className={`panel ${tone ?? ''} ${tight ? 'tight' : ''} ${className}`} style={style}>{children}</div>;
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`eyebrow ${className}`}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, lede, align = 'left', children }: { eyebrow?: ReactNode; title: ReactNode; lede?: ReactNode; align?: 'left' | 'center'; children?: ReactNode }) {
  return (
    <div className={`stack ${align === 'center' ? 'center' : ''}`} style={{ gap: 10, marginBottom: 28, alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2>{title}</h2>
      {lede && <p className="lede" style={{ maxWidth: 760 }}>{lede}</p>}
      {children}
    </div>
  );
}

export function Chip({ children, tone, className = '', title }: { children: ReactNode; tone?: 'gold' | 'green' | 'amber' | 'red' | 'blue' | 'violet'; className?: string; title?: string }) {
  return <span className={`chip ${tone ?? ''} ${className}`} title={title}>{children}</span>;
}

const CONF: Record<Confidence, { tone: 'green' | 'amber' | 'red'; label: string; desc: string }> = {
  green: { tone: 'green', label: 'Strongly supported', desc: 'Well-established in primary law or authoritative guidance.' },
  amber: { tone: 'amber', label: 'Fact / jurisdiction dependent', desc: 'True in some circumstances; depends on facts, jurisdiction and documentation.' },
  red: { tone: 'red', label: 'Misleading or incorrect', desc: 'As commonly stated, this is wrong or dangerously incomplete.' },
};
export function ConfidenceChip({ level, short }: { level: Confidence; short?: boolean }) {
  const c = CONF[level];
  return <Chip tone={c.tone} title={c.desc}><span className="dot" />{short ? level.toUpperCase() : c.label}</Chip>;
}

const OBJ_TONE: Record<Objective, 'gold' | 'green' | 'amber' | 'red' | 'blue' | 'violet'> = {
  'asset-protection': 'red', 'tax-planning': 'green', 'estate-planning': 'violet', privacy: 'blue', succession: 'gold', governance: 'amber',
};
export function ObjectiveTags({ objectives }: { objectives: Objective[] }) {
  return <div className="row" style={{ gap: 6 }}>{objectives.map((o) => <Chip key={o} tone={OBJ_TONE[o]}>{OBJECTIVE_LABELS[o]}</Chip>)}</div>;
}

export function Stat({ label, value, sub, tone }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: 'gold' | 'green' | 'red' | 'amber' }) {
  const color = tone === 'gold' ? 'var(--gold-2)' : tone === 'green' ? 'var(--green-2)' : tone === 'red' ? '#e7a398' : tone === 'amber' ? 'var(--amber)' : undefined;
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <span className="value" style={{ color }}>{value}</span>
      {sub && <span className="sub">{sub}</span>}
    </div>
  );
}

export function Money({ value, compact, decimals }: { value: number; compact?: boolean; decimals?: number }) {
  const currency = useAppStore((s) => s.currency);
  return <span className="num">{money(value, { currency, compact, decimals, fromUSD: true })}</span>;
}
export function useMoney() {
  const currency = useAppStore((s) => s.currency);
  return (v: number, opts: { compact?: boolean; decimals?: number } = {}) => money(v, { currency, fromUSD: true, ...opts });
}
export function CurrencyToggle() {
  const currency = useAppStore((s) => s.currency);
  const set = useAppStore((s) => s.setCurrency);
  return (
    <div className="row" style={{ gap: 4 }} role="radiogroup" aria-label="Display currency">
      {(['USD', 'AED', 'XAF'] as Currency[]).map((c) => (
        <button key={c} className={`btn sm ${currency === c ? 'active' : 'ghost'}`} onClick={() => set(c)} aria-pressed={currency === c}>{c}</button>
      ))}
    </div>
  );
}

export function Disclaimer({ children, tone = 'amber' }: { children?: ReactNode; tone?: 'amber' | 'danger' | 'green' }) {
  return (
    <div className={`callout ${tone} small`} role="note">
      <p><strong>Educational simulation, not advice.</strong> {children ?? 'Legal and tax outcomes depend on jurisdiction, facts, documentation and timing. Engage qualified counsel, tax advisers and fiduciaries before acting.'}</p>
    </div>
  );
}

export function Callout({ children, tone, title }: { children: ReactNode; tone?: 'danger' | 'green' | 'amber'; title?: ReactNode }) {
  return <div className={`callout ${tone ?? ''}`}>{title && <div className="eyebrow" style={{ marginBottom: 6 }}>{title}</div>}{children}</div>;
}

export function Tabs<T extends string>({ tabs, value, onChange, size = 'md' }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (t: T) => void; size?: 'sm' | 'md' }) {
  return (
    <div className="row" style={{ gap: 6 }} role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className={`btn ${size === 'sm' ? 'sm' : ''} ${value === t.id ? 'active' : 'ghost'}`} onClick={() => onChange(t.id)}>{t.label}</button>
      ))}
    </div>
  );
}

export function NumberField({ label, value, onChange, min, max, step = 1, prefix, suffix, hint }: { label: ReactNode; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; prefix?: string; suffix?: string; hint?: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
        {prefix && <span className="muted mono small">{prefix}</span>}
        <input className="input num" type="number" value={Number.isFinite(value) ? value : ''} min={min} max={max} step={step} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
        {suffix && <span className="muted mono small">{suffix}</span>}
      </div>
      {hint && <span className="tiny muted">{hint}</span>}
    </div>
  );
}

export function SliderField({ label, value, onChange, min, max, step = 1, format }: { label: ReactNode; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; format?: (v: number) => string }) {
  return (
    <div className="field">
      <div className="row between"><label>{label}</label><span className="mono small gold">{format ? format(value) : value}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

export function SelectField<T extends string>({ label, value, onChange, options }: { label: ReactNode; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, multiline, rows }: { label?: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; rows?: number }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {multiline ? <textarea className="input" rows={rows ?? 4} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /> : <input className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: ReactNode; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="display" style={{ fontSize: '1.4rem', color: 'var(--ivory)' }}>{title}</div>
      {body && <p className="small" style={{ marginTop: 8 }}>{body}</p>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

export function LoadingState({ lines = 3 }: { lines?: number }) {
  return <div className="stack" aria-busy="true">{Array.from({ length: lines }).map((_, i) => <div key={i} className="skeleton" style={{ height: 18, width: `${90 - i * 15}%` }} />)}</div>;
}

export function ErrorState({ title = 'Something went wrong', body, retry }: { title?: ReactNode; body?: ReactNode; retry?: () => void }) {
  return (
    <div className="panel danger">
      <div className="eyebrow red">Error</div>
      <h4 style={{ margin: '6px 0' }}>{title}</h4>
      {body && <p className="small">{body}</p>}
      {retry && <button className="btn sm" onClick={retry}>Try again</button>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(6px)' }} role="dialog" aria-modal="true">
      <div onClick={(e) => e.stopPropagation()} className="panel fade-up" style={{ maxWidth: wide ? 1100 : 720, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="row between" style={{ marginBottom: 14 }}>
          <h3>{title}</h3>
          <button className="btn sm ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Scroll-triggered reveal */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`${seen ? 'fade-up' : ''} ${className}`} style={{ opacity: seen ? undefined : 0, animationDelay: `${delay}s` }}>{children}</div>;
}

/** Minimal rich text: **bold**, *italic*, `code`. */
export function Rich({ text, as = 'p', className = '' }: { text: string; as?: 'p' | 'span' | 'li'; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  const nodes = parts.map((p, i) => {
    if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`')) return <code key={i} className="mono" style={{ color: 'var(--gold-2)', fontSize: '0.9em' }}>{p.slice(1, -1)}</code>;
    if (p.startsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
  if (as === 'span') return <span className={className}>{nodes}</span>;
  if (as === 'li') return <li className={className}>{nodes}</li>;
  return <p className={className}>{nodes}</p>;
}

export function ProgressBar({ value, tone = 'gold', height = 6 }: { value: number; tone?: 'gold' | 'green' | 'red' | 'amber'; height?: number }) {
  const color = tone === 'gold' ? 'var(--gold)' : tone === 'green' ? 'var(--green-2)' : tone === 'red' ? 'var(--red)' : 'var(--amber)';
  return (
    <div style={{ height, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.max(0, Math.min(100, value * 100))}%`, height: '100%', background: color, transition: 'width 0.6s var(--ease)' }} />
    </div>
  );
}

/** Six-objective legend used across the platform to keep objectives distinct. */
export function ObjectiveLegend() {
  const items: { o: Objective; desc: string }[] = [
    { o: 'asset-protection', desc: 'Where a claim can and cannot reach.' },
    { o: 'tax-planning', desc: 'How, when and by whom income and transfers are taxed.' },
    { o: 'estate-planning', desc: 'What happens to assets at death or incapacity.' },
    { o: 'privacy', desc: 'Lawful confidentiality, distinct from concealment.' },
    { o: 'succession', desc: 'Who runs and owns things next.' },
    { o: 'governance', desc: 'How a family decides, together, over time.' },
  ];
  return (
    <div className="grid grid-3" style={{ gap: 10 }}>
      {items.map(({ o, desc }) => (
        <div key={o} className="panel tight" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Chip tone={OBJ_TONE[o]}>{OBJECTIVE_LABELS[o]}</Chip>
          <span className="small muted">{desc}</span>
        </div>
      ))}
    </div>
  );
}
