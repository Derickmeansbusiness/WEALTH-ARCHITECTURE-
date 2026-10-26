export type Currency = 'USD' | 'AED' | 'XAF';

/** Explicit illustrative exchange-rate assumptions (per 1 USD). Shown wherever a conversion happens. */
export const FX_PER_USD: Record<Currency, number> = { USD: 1, AED: 3.6725, XAF: 600 };
export const FX_NOTE = 'Illustrative rates: 1 USD = 3.6725 AED (pegged) · 1 USD ≈ 600 XAF (XAF is pegged to EUR; the USD rate floats). Adjust in settings for current rates.';

const SYMBOL: Record<Currency, string> = { USD: '$', AED: 'AED ', XAF: 'FCFA ' };

export function money(value: number, opts: { currency?: Currency; compact?: boolean; decimals?: number; fromUSD?: boolean } = {}): string {
  const currency = opts.currency ?? 'USD';
  const v = opts.fromUSD ? value * FX_PER_USD[currency] : value;
  if (!isFinite(v)) return '—';
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(v);
  if (opts.compact) {
    if (abs >= 1e9) return `${sign}${SYMBOL[currency]}${(abs / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${sign}${SYMBOL[currency]}${(abs / 1e6).toFixed(abs >= 1e7 ? 1 : 2)}M`;
    if (abs >= 1e3) return `${sign}${SYMBOL[currency]}${(abs / 1e3).toFixed(abs >= 1e5 ? 0 : 1)}K`;
  }
  const decimals = opts.decimals ?? (currency === 'XAF' ? 0 : 0);
  return `${sign}${SYMBOL[currency]}${abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export const pct = (v: number, d = 1) => (isFinite(v) ? `${(v * 100).toFixed(d)}%` : '—');
export const ratio = (v: number, d = 2) => (isFinite(v) ? `${v.toFixed(d)}×` : '∞');
export const num = (v: number, d = 0) => (isFinite(v) ? v.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }) : '—');
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const uid = () => Math.random().toString(36).slice(2, 10);
