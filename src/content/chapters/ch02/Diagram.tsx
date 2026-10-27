import { useState } from 'react';
import { useClock } from '@/modules/academy/anim';
import { Chip } from '@/components/ui';

/** Five engine turbines feed a family capital reservoir. Flow volume (stroke width, particle speed) scales with each engine's cash contribution. */
const ENGINES = [
  { id: 'labor', label: 'Labor', flow: 180, color: 'rgba(243,236,220,0.7)', note: 'wages' },
  { id: 'business', label: 'Business', flow: 420, color: 'var(--gold)', note: 'profit' },
  { id: 'realestate', label: 'Real estate', flow: 160, color: 'var(--green-2)', note: 'rent' },
  { id: 'financial', label: 'Investments', flow: 70, color: 'var(--blue)', note: 'dividends' },
  { id: 'ip', label: 'IP', flow: 110, color: 'var(--violet)', note: 'royalties' },
];
const PRESETS: Record<string, number[]> = {
  'Early career': [260, 0, 0, 20, 0],
  'Founder': [120, 620, 0, 40, 0],
  'Structured family': [120, 380, 220, 110, 90],
  'Post-exit': [0, 0, 260, 520, 60],
};

export default function Diagram() {
  const [preset, setPreset] = useState('Structured family');
  const clock = useClock();
  const flows = PRESETS[preset];
  const total = flows.reduce((a, b) => a + b, 0);
  const W = 760, H = 400;
  const reservoirX = 560, reservoirY = 90, reservoirH = 220, reservoirW = 150;
  const fill = Math.min(1, total / 1000);
  const fillH = reservoirH * fill;
  const fillY = reservoirY + reservoirH - fillH;

  return (
    <div>
      <div className="acad-diagram-controls">
        {Object.keys(PRESETS).map((p) => <button key={p} className={`btn sm ${preset === p ? 'active' : 'ghost'}`} onClick={() => setPreset(p)}>{p}</button>)}
        <span style={{ flex: 1 }} />
        <Chip tone="gold">Inflow {total}k / yr</Chip>
        <Chip tone={flows.filter((f) => f > 0).length <= 2 ? 'red' : flows.filter((f) => f > 0).length <= 3 ? 'amber' : 'green'}>{flows.filter((f) => f > 0).length} engines running</Chip>
      </div>
      <div className="acad-diagram-wrap">
        <svg className="diagram" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Five wealth engines feeding a family capital reservoir">
          <defs>
            <linearGradient id="ch02-res" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--gold-2)" stopOpacity="0.85" />
              <stop offset="1" stopColor="var(--gold-3)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {ENGINES.map((e, i) => {
            const y = 50 + i * 72;
            const f = flows[i];
            const w = f > 0 ? 1 + (f / 650) * 9 : 0.6;
            const spin = f > 0 ? (clock * (0.4 + f / 200) * 60) % 360 : 0;
            const path = `M 170 ${y} C 320 ${y}, 380 ${reservoirY + reservoirH / 2}, ${reservoirX} ${reservoirY + reservoirH / 2 + (i - 2) * 22}`;
            return (
              <g key={e.id} opacity={f > 0 ? 1 : 0.3}>
                {/* turbine */}
                <g transform={`translate(120 ${y})`}>
                  <circle r="26" className="node" stroke={e.color} />
                  <g transform={`rotate(${spin})`}>
                    {[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M 0 0 L 6 -16 L -6 -16 Z" fill={e.color} opacity="0.85" transform={`rotate(${a})`} />)}
                  </g>
                  <circle r="5" fill="var(--bg-1)" stroke={e.color} />
                </g>
                <text x="80" y={y + 4} textAnchor="end" style={{ fontSize: 11.5, fill: 'var(--ivory)' }}>{e.label}</text>
                <text x="80" y={y + 17} textAnchor="end" className="label-mono" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>{f > 0 ? `${f}k ${e.note}` : 'idle'}</text>
                {/* flow */}
                <path d={path} fill="none" stroke={e.color} strokeWidth={w} opacity="0.25" />
                {f > 0 && <path d={path} fill="none" stroke={e.color} strokeWidth={Math.max(1.2, w * 0.5)} className="flow-line" style={{ animationDuration: `${Math.max(0.5, 2.4 - f / 300)}s` }} />}
              </g>
            );
          })}

          {/* reservoir */}
          <rect x={reservoirX} y={reservoirY} width={reservoirW} height={reservoirH} rx="12" className="node gold" />
          <clipPath id="ch02-clip"><rect x={reservoirX + 2} y={reservoirY + 2} width={reservoirW - 4} height={reservoirH - 4} rx="10" /></clipPath>
          <g clipPath="url(#ch02-clip)">
            <path d={`M ${reservoirX} ${fillY + Math.sin(clock * 2) * 3} Q ${reservoirX + 40} ${fillY - 6 + Math.sin(clock * 2 + 1) * 4}, ${reservoirX + 75} ${fillY + Math.sin(clock * 2 + 2) * 3} T ${reservoirX + reservoirW} ${fillY} V ${reservoirY + reservoirH} H ${reservoirX} Z`} fill="url(#ch02-res)" />
          </g>
          <text x={reservoirX + reservoirW / 2} y={reservoirY - 14} textAnchor="middle" className="label-mono" style={{ fontSize: 11, letterSpacing: 2, fill: 'var(--gold)' }}>FAMILY CAPITAL</text>
          <text x={reservoirX + reservoirW / 2} y={reservoirY + reservoirH / 2} textAnchor="middle" className="label-mono" style={{ fontSize: 15, fill: fill > 0.5 ? '#1a1508' : 'var(--ivory)' }}>{total}k</text>
          <text x={reservoirX + reservoirW / 2} y={reservoirY + reservoirH / 2 + 16} textAnchor="middle" style={{ fontSize: 9.5, fill: fill > 0.55 ? '#1a1508' : 'var(--ivory-3)' }}>per year, before tax</text>

          {/* outflows */}
          <path d={`M ${reservoirX + reservoirW} ${reservoirY + reservoirH - 30} H ${W - 20}`} className="edge red flow-line" strokeWidth="1.5" />
          <text x={W - 22} y={reservoirY + reservoirH - 36} textAnchor="end" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>tax · living · debt service</text>
          <path d={`M ${reservoirX + reservoirW / 2} ${reservoirY + reservoirH} V ${H - 30}`} className="edge gold flow-line" strokeWidth="1.5" />
          <text x={reservoirX + reservoirW / 2 + 8} y={H - 34} style={{ fontSize: 9.5, fill: 'var(--gold-2)' }}>re-invested → new engines</text>
          <text x="380" y={H - 14} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory-3)' }}>
            {preset === 'Early career' ? 'One turbine. Everything depends on the person.' : preset === 'Founder' ? 'A big turbine, but still one door. Concentration is the risk.' : preset === 'Post-exit' ? 'Business sold. The reservoir now lives in liquid and property engines.' : 'Several turbines. If one stops, the reservoir keeps filling.'}
          </text>
        </svg>
      </div>
      <p className="acad-diagram-caption">
        <strong>What moves:</strong> each turbine spins and its line pulses faster and thicker in proportion to the cash it sends to the family capital reservoir. Switch presets to see how a family's engine mix changes across a lifetime. The reservoir level shows total inflow; the red line is what leaves for tax, living costs and debt service, and the gold line is what is re-invested into new engines. Figures are illustrative thousands per year, not forecasts.
      </p>
    </div>
  );
}
