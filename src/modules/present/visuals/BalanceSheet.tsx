import type { ReactNode } from 'react';
import { money } from '@/lib/format';

export interface BsRow { label: ReactNode; value: number; sub?: ReactNode }

/**
 * A balance sheet that assembles row by row. With `step` given, assets reveal first
 * (one per step), then liabilities, then the equity line. Omit `step` to show everything.
 * @param format number formatter (default compact USD)
 */
export function BalanceSheet({ assets, liabilities, step, title, format = (v) => money(v, { compact: true }), equityLabel = 'Net worth (equity)', compact }: {
  assets: BsRow[]; liabilities: BsRow[]; step?: number; title?: ReactNode; format?: (v: number) => string; equityLabel?: ReactNode; compact?: boolean;
}) {
  const total = assets.length + liabilities.length;
  const shown = step === undefined ? total + 1 : step + 1;
  const ta = assets.reduce((s, r) => s + r.value, 0);
  const tl = liabilities.reduce((s, r) => s + r.value, 0);
  const rowStyle = compact ? { padding: '10px 16px', fontSize: 20 } : undefined;
  return (
    <div className="present-bs">
      <div className="present-bs-col">
        <div className="present-bs-head"><span>{title ?? 'Assets'}</span><span className="num" style={{ color: 'var(--ivory-2)', letterSpacing: 0, textTransform: 'none' }}>{shown >= assets.length ? format(ta) : ''}</span></div>
        {assets.map((r, i) => (
          <div key={i} className={`present-bs-row present-reveal ${shown > i ? 'on' : ''}`} style={rowStyle}>
            <span>{r.label}{r.sub && <small>{r.sub}</small>}</span><span className="num">{format(r.value)}</span>
          </div>
        ))}
      </div>
      <div className="present-bs-col">
        <div className="present-bs-head"><span>Liabilities &amp; equity</span><span className="num" style={{ color: 'var(--ivory-2)', letterSpacing: 0, textTransform: 'none' }}>{shown > total ? format(ta) : ''}</span></div>
        {liabilities.map((r, i) => (
          <div key={i} className={`present-bs-row liab present-reveal ${shown > assets.length + i ? 'on' : ''}`} style={rowStyle}>
            <span>{r.label}{r.sub && <small>{r.sub}</small>}</span><span className="num">({format(r.value)})</span>
          </div>
        ))}
        <div className={`present-bs-row eq present-reveal ${shown > total ? 'on' : ''}`} style={rowStyle}>
          <span>{equityLabel}<small>Assets − liabilities</small></span><span className="num">{format(ta - tl)}</span>
        </div>
      </div>
    </div>
  );
}
