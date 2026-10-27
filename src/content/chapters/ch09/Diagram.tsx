import { useEffect, useMemo, useState } from 'react';
import { useMoney } from '@/components/ui';
import { analyzeRental, DEFAULT_RENTAL } from './rentalTax';

/**
 * Side-by-side waterfalls for one property in year one: cash flow on the left, taxable income
 * on the right. Same rent, same expenses — then the paths diverge: cash pays principal, tax
 * deducts depreciation. Below, the recapture exposure that depreciation builds year after year.
 */
interface Step { label: string; delta: number; tone: string; note?: string }

export default function Diagram() {
  const fmt = useMoney();
  const r = useMemo(() => analyzeRental({ ...DEFAULT_RENTAL, holdYears: 10 }), []);
  const y1 = r.years[0];
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (now: number) => { setT((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cash: Step[] = [
    { label: 'Gross rent', delta: y1.grossRent, tone: 'var(--green-2)' },
    { label: 'Vacancy', delta: -(y1.grossRent - y1.effectiveRent), tone: 'var(--red)' },
    { label: 'Operating expenses', delta: -y1.expenses, tone: 'var(--red)' },
    { label: 'Interest', delta: -y1.interest, tone: 'var(--red)' },
    { label: 'Principal', delta: -y1.principal, tone: 'var(--amber)', note: 'cash out · not deductible' },
  ];
  const tax: Step[] = [
    { label: 'Gross rent', delta: y1.grossRent, tone: 'var(--green-2)' },
    { label: 'Vacancy', delta: -(y1.grossRent - y1.effectiveRent), tone: 'var(--red)' },
    { label: 'Operating expenses', delta: -y1.expenses, tone: 'var(--red)' },
    { label: 'Interest', delta: -y1.interest, tone: 'var(--red)' },
    { label: 'Depreciation', delta: -y1.depreciation, tone: 'var(--violet)', note: 'deductible · no cash out' },
  ];

  const W = 880, H = 540;
  const chartTop = 60, chartBottom = 330;
  const maxV = y1.grossRent * 1.05;
  const minV = Math.min(0, y1.taxableIncome) * 1.6;
  const scale = (v: number) => chartBottom - ((v - minV) / (maxV - minV)) * (chartBottom - chartTop);
  const zeroY = scale(0);

  const renderWaterfall = (steps: Step[], x0: number, title: string, finalLabel: string, finalValue: number, finalTone: string, delay: number) => {
    const barW = 46, gap = 14;
    let cum = 0;
    const items = steps.map((s, i) => {
      const from = cum; cum += s.delta;
      return { ...s, from, to: cum, i };
    });
    const totalX = x0 + items.length * (barW + gap);
    return (
      <g>
        <text x={x0} y={chartTop - 24} style={{ fontSize: 12, fill: 'var(--ivory)', fontWeight: 600, letterSpacing: '0.1em' }}>{title}</text>
        <line x1={x0 - 8} x2={totalX + barW + 8} y1={zeroY} y2={zeroY} stroke="var(--line-strong)" />
        {items.map((it) => {
          const p = Math.max(0, Math.min(1, (t - delay - it.i * 0.45) / 0.6));
          const top = Math.min(scale(it.from), scale(it.to));
          const h = Math.abs(scale(it.from) - scale(it.to)) * p;
          const yTop = it.delta >= 0 ? scale(it.from) - h : scale(it.from);
          const x = x0 + it.i * (barW + gap);
          return (
            <g key={it.label} opacity={p > 0 ? 1 : 0}>
              <rect x={x} y={yTop} width={barW} height={Math.max(0.5, h)} fill={it.tone} opacity={0.75} rx={3} />
              {it.i > 0 && <line x1={x - gap} x2={x} y1={scale(it.from)} y2={scale(it.from)} stroke="var(--ivory-3)" strokeDasharray="2 3" opacity={0.6} />}
              <text x={x + barW / 2} y={chartBottom + 16} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>{it.label.split(' ')[0]}</text>
              <text x={x + barW / 2} y={chartBottom + 27} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>{it.label.split(' ').slice(1).join(' ')}</text>
              <text x={x + barW / 2} y={Math.min(top, yTop) - 4} textAnchor="middle" className="label-mono" style={{ fontSize: 9, fill: it.tone }}>{p >= 1 ? fmt(Math.abs(it.delta), { compact: true }) : ''}</text>
              {it.note && p >= 1 && <text x={x + barW / 2} y={chartBottom + 40} textAnchor="middle" style={{ fontSize: 8.5, fill: it.tone }}>{it.note}</text>}
            </g>
          );
        })}
        {(() => {
          const p = Math.max(0, Math.min(1, (t - delay - items.length * 0.45) / 0.6));
          const h = Math.abs(scale(0) - scale(finalValue)) * p;
          const yTop = finalValue >= 0 ? zeroY - h : zeroY;
          return (
            <g opacity={p > 0 ? 1 : 0}>
              <rect x={totalX} y={yTop} width={barW} height={Math.max(0.5, h)} fill={finalTone} opacity={0.95} rx={3} stroke={finalTone} />
              <text x={totalX + barW / 2} y={chartBottom + 16} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory)', fontWeight: 600 }}>{finalLabel}</text>
              <text x={totalX + barW / 2} y={finalValue >= 0 ? yTop - 4 : yTop + h + 12} textAnchor="middle" className="label-mono" style={{ fontSize: 10, fill: finalTone, fontWeight: 600 }}>{p >= 1 ? fmt(finalValue, { compact: true }) : ''}</text>
            </g>
          );
        })()}
      </g>
    );
  };

  // Recapture strip
  const stripY = 420, stripH = 26, stripX = 60, stripW = 760;
  const maxAcc = r.years[r.years.length - 1].accumulatedDepreciation;
  const stripP = Math.max(0, Math.min(1, (t - 7) / 4));
  const shownYears = Math.max(0, Math.min(r.years.length, Math.floor(stripP * r.years.length + 0.0001)));

  return (
    <div>
      <div className="ch09-legend">
        <span style={{ ['--c' as string]: 'var(--green-2)' }}>income</span>
        <span style={{ ['--c' as string]: 'var(--red)' }}>cash expenses & interest</span>
        <span style={{ ['--c' as string]: 'var(--amber)' }}>principal (cash, not deductible)</span>
        <span style={{ ['--c' as string]: 'var(--violet)' }}>depreciation (deductible, not cash)</span>
      </div>
      <div className="ch09-diagram-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="diagram" aria-label="Cash flow waterfall beside taxable income waterfall for a rental property, with accumulated recapture exposure" style={{ maxHeight: 600 }}>
          {renderWaterfall(cash, 40, 'CASH FLOW · YEAR 1', 'Cash flow', y1.cashFlow, 'var(--green-2)', 0.2)}
          {renderWaterfall(tax, 470, 'TAXABLE INCOME · YEAR 1', 'Taxable', y1.taxableIncome, y1.taxableIncome < 0 ? 'var(--violet)' : 'var(--gold)', 0.6)}
          <line x1={440} x2={440} y1={chartTop - 30} y2={chartBottom + 40} stroke="var(--line)" />

          {/* Recapture exposure strip */}
          <text x={stripX} y={stripY - 14} style={{ fontSize: 11, fill: 'var(--ivory)', fontWeight: 600, letterSpacing: '0.1em' }}>ACCUMULATED DEPRECIATION = RECAPTURE EXPOSURE ON SALE</text>
          <rect x={stripX} y={stripY} width={stripW} height={stripH} rx={6} fill="rgba(255,255,255,0.04)" stroke="var(--line)" />
          {r.years.slice(0, shownYears).map((y, i) => {
            const w = (y.depreciation / maxAcc) * stripW;
            const x = stripX + (y.accumulatedDepreciation - y.depreciation) / maxAcc * stripW;
            return (
              <g key={y.year}>
                <rect x={x} y={stripY} width={Math.max(0, w - 1)} height={stripH} fill="var(--violet)" opacity={0.3 + 0.05 * i} />
                <text x={x + w / 2} y={stripY + stripH + 14} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--ivory-3)' }}>Y{y.year}</text>
              </g>
            );
          })}
          {shownYears > 0 && (
            <text x={stripX + stripW} y={stripY - 14} textAnchor="end" className="label-mono" style={{ fontSize: 10.5, fill: '#b7adda' }}>
              {fmt(r.years[shownYears - 1].accumulatedDepreciation, { compact: true })} after {shownYears} yr · unrecaptured §1250 gain taxed up to 25% on sale
            </text>
          )}
          <text x={stripX} y={stripY + stripH + 38} style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>
            Deferred, not eliminated: a §1031 exchange carries the exposure into the next property; a §1014 step-up at death is the only thing that erases it.
          </text>
        </svg>
      </div>
      <p className="ch09-caption">
        Both columns start with the same rent and the same operating expenses, and both deduct the same interest. Then they part: the cash column pays loan principal (real money, not deductible), while the tax column deducts depreciation (a deduction, no money). For the default property the owner banks positive cash flow and reports a tax loss. The strip below is the cost of that: every dollar of depreciation claimed lowers basis and becomes gain on sale. Default inputs: a {fmt(DEFAULT_RENTAL.purchasePrice, { compact: true })} residential property, 20% land, 70% loan-to-value at 6.5% over 30 years.
      </p>
    </div>
  );
}
