import type { ReactNode } from 'react';
import { NumberField, useMoney } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { FX_NOTE } from '@/lib/format';

/** USD money input. Shows the converted value as a hint when the display currency is not USD. */
export function MoneyField({ label, value, onChange, min = 0, step = 1000, hint, max }: { label: ReactNode; value: number; onChange: (v: number) => void; min?: number; step?: number; hint?: ReactNode; max?: number }) {
  const currency = useAppStore((s) => s.currency);
  const fmt = useMoney();
  const conv = currency !== 'USD' ? <span title={FX_NOTE}>≈ {fmt(value)}</span> : null;
  return <NumberField label={label} value={value} onChange={onChange} min={min} max={max} step={step} prefix="$" hint={hint || conv ? <>{hint}{hint && conv ? ' · ' : ''}{conv}</> : undefined} />;
}

/** Percentage input; stores a decimal (0.065) and shows 6.5. */
export function PctField({ label, value, onChange, min = -100, max = 100, step = 0.1, hint }: { label: ReactNode; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; hint?: ReactNode }) {
  const shown = Math.round(value * 10000) / 100;
  return <NumberField label={label} value={shown} onChange={(v) => onChange(v / 100)} min={min} max={max} step={step} suffix="%" hint={hint} />;
}

export function FxFootnote() {
  const currency = useAppStore((s) => s.currency);
  if (currency === 'USD') return null;
  return <p className="dt-fx">Inputs are in USD; displayed values are converted. {FX_NOTE}</p>;
}

export function Head({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede: ReactNode; children?: ReactNode }) {
  return (
    <div className="dt-head">
      <div className="eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <p className="lede">{lede}</p>
      {children}
    </div>
  );
}

export function WarningList({ items }: { items: { level: 'red' | 'amber' | 'green'; title: string; body: string }[] }) {
  return (
    <div className="dt-warnings">
      {items.map((w, i) => (
        <div key={i} className={`dt-warning ${w.level}`}>
          <span className="dt-wmark" />
          <div><strong>{w.title}</strong><div className="small muted" style={{ marginTop: 2 }}>{w.body}</div></div>
        </div>
      ))}
    </div>
  );
}
