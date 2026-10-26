import { useStages, lerp } from '@/modules/academy/anim';
import { Chip } from '@/components/ui';

/**
 * Stage 0: an individual balance sheet assembles (assets left, liabilities right, equity emerges).
 * Stage 1: a second person's sheet merges into a household sheet.
 * Stage 2: the household sheet is re-grouped under entities; total equity is unchanged.
 */
const STAGES = ['Individual', 'Household', 'Multi-entity'];

const A_IND = [ // founder's assets (k)
  { label: 'Residence', v: 1200, tone: 'rgba(243,236,220,0.22)' },
  { label: 'Business', v: 1800, tone: 'var(--gold)' },
  { label: 'Securities', v: 500, tone: 'var(--green-2)' },
  { label: 'Cash', v: 150, tone: 'var(--blue)' },
];
const L_IND = [
  { label: 'Mortgage', v: 700 },
  { label: 'Business loan', v: 400 },
];
const A_SPOUSE = [
  { label: 'Rental', v: 900, tone: 'var(--violet)' },
  { label: 'Retirement', v: 450, tone: 'var(--green)' },
];
const L_SPOUSE = [{ label: 'Rental loan', v: 600 }];

const SCALE = 0.052; // px per $k

export default function Diagram() {
  const { stage, t, playing, toggle, setStage } = useStages(STAGES.length, 3400);

  const assets = stage === 0 ? A_IND : [...A_IND, ...A_SPOUSE];
  const liabs = stage === 0 ? L_IND : [...L_IND, ...L_SPOUSE];
  const totA = assets.reduce((s, a) => s + a.v, 0);
  const totL = liabs.reduce((s, l) => s + l.v, 0);
  const equity = totA - totL;

  const baseY = 330;
  // In stages 0/1 the new blocks grow in; existing blocks stay.
  const growth = (idx: number, list: { v: number }[], isNew: boolean) => (isNew ? t : 1) * list[idx].v * SCALE;

  return (
    <div>
      <div className="acad-diagram-controls">
        {STAGES.map((s, i) => <button key={s} className={`btn sm ${stage === i ? 'active' : 'ghost'}`} onClick={() => setStage(i)}>{i + 1}. {s}</button>)}
        <button className="btn sm ghost" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚' : '▶'}</button>
        <span style={{ flex: 1 }} />
        <Chip tone="gold">Equity {equity.toLocaleString()}k</Chip>
      </div>
      <div className="acad-diagram-wrap">
        <svg className="diagram" viewBox="0 0 760 400" role="img" aria-label="Animated family balance sheet">
          <defs>
            <linearGradient id="ch01-eq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--gold-2)" stopOpacity="0.9" />
              <stop offset="1" stopColor="var(--gold)" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {stage < 2 ? (
            <g>
              {/* Column labels */}
              <text x="150" y="34" textAnchor="middle" className="label-mono" style={{ fill: 'var(--ivory-3)', fontSize: 11, letterSpacing: 2 }}>ASSETS</text>
              <text x="400" y="34" textAnchor="middle" className="label-mono" style={{ fill: 'var(--ivory-3)', fontSize: 11, letterSpacing: 2 }}>LIABILITIES</text>
              <text x="620" y="34" textAnchor="middle" className="label-mono" style={{ fill: 'var(--gold)', fontSize: 11, letterSpacing: 2 }}>EQUITY</text>
              <line x1="40" y1={baseY} x2="720" y2={baseY} stroke="var(--line-strong)" />

              {/* Asset stack */}
              {(() => {
                let y = baseY; const nodes = [];
                for (let i = 0; i < assets.length; i++) {
                  const isNew = stage === 1 && i >= A_IND.length;
                  const h = growth(i, assets, isNew);
                  y -= h;
                  nodes.push(
                    <g key={assets[i].label}>
                      <rect x="90" y={y} width="120" height={Math.max(0, h - 2)} rx="3" fill={assets[i].tone} opacity={isNew ? 0.4 + 0.6 * t : 1} />
                      {h > 14 && <text x="150" y={y + h / 2 + 4} textAnchor="middle" style={{ fontSize: 10.5, fill: '#0b0d12', fontWeight: 500 }}>{assets[i].label} {assets[i].v}k</text>}
                    </g>,
                  );
                }
                return nodes;
              })()}
              <text x="150" y={baseY + 22} textAnchor="middle" className="label-mono" style={{ fill: 'var(--ivory)', fontSize: 12 }}>{totA.toLocaleString()}k</text>

              {/* Liability stack */}
              {(() => {
                let y = baseY; const nodes = [];
                for (let i = 0; i < liabs.length; i++) {
                  const isNew = stage === 1 && i >= L_IND.length;
                  const h = growth(i, liabs, isNew);
                  y -= h;
                  nodes.push(
                    <g key={liabs[i].label}>
                      <rect x="340" y={y} width="120" height={Math.max(0, h - 2)} rx="3" fill="rgba(194,90,76,0.75)" stroke="var(--red)" opacity={isNew ? 0.4 + 0.6 * t : 1} />
                      {h > 14 && <text x="400" y={y + h / 2 + 4} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory)' }}>{liabs[i].label} {liabs[i].v}k</text>}
                    </g>,
                  );
                }
                return nodes;
              })()}
              <text x="400" y={baseY + 22} textAnchor="middle" className="label-mono" style={{ fill: 'var(--ivory)', fontSize: 12 }}>{totL.toLocaleString()}k</text>

              {/* Equity emerging */}
              {(() => {
                const prevEq = stage === 0 ? 0 : (A_IND.reduce((s, a) => s + a.v, 0) - L_IND.reduce((s, l) => s + l.v, 0));
                const eqNow = lerp(prevEq, equity, t);
                const h = eqNow * SCALE;
                return (
                  <g>
                    <rect x="560" y={baseY - h} width="120" height={Math.max(0, h)} rx="3" fill="url(#ch01-eq)" stroke="var(--gold)" />
                    <text x="620" y={baseY - h - 10} textAnchor="middle" className="label-mono" style={{ fill: 'var(--gold-2)', fontSize: 13 }}>{Math.round(eqNow).toLocaleString()}k</text>
                    {/* bracket from liabilities top to assets top */}
                    <path d={`M 470 ${baseY - totL * SCALE} H 530 V ${baseY - totA * SCALE} H 470`} fill="none" stroke="var(--gold)" strokeDasharray="3 4" opacity={0.6 * t} />
                    <text x="500" y={baseY - (totA + totL) / 2 * SCALE} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--gold)' }} opacity={t}>A − L</text>
                  </g>
                );
              })()}

              <text x="380" y="372" textAnchor="middle" style={{ fontSize: 12, fill: 'var(--ivory-3)' }}>
                {stage === 0 ? 'One person. Assets = Liabilities + Equity.' : 'Spouse\'s sheet merges in. The household is the economic unit.'}
              </text>
            </g>
          ) : (
            <EntityView t={t} equity={equity} />
          )}
        </svg>
      </div>
      <p className="acad-diagram-caption">
        <strong>What moves:</strong> assets stack on the left, liabilities on the right, and the gold bar is what is left, equity. In stage two a spouse's sheet merges, revealing the household picture. In stage three the identical assets are re-grouped under a trust, property LLC and holding company. Watch the total equity figure: it does not change. Only title, control, liability and transfer mechanics changed.
      </p>
    </div>
  );
}

function EntityView({ t, equity }: { t: number; equity: number }) {
  const boxes = [
    { x: 60, label: 'Personal', sub: 'Residence · Cash · Mortgage', eq: 650, tone: 'rgba(243,236,220,0.5)' },
    { x: 230, label: 'Revocable trust', sub: 'Securities', eq: 500, tone: 'var(--violet)' },
    { x: 400, label: 'Property LLC', sub: 'Rental · Rental loan', eq: 300, tone: 'var(--green-2)' },
    { x: 570, label: 'Holding Co', sub: 'Business · Biz loan', eq: 1400, tone: 'var(--gold)' },
  ];
  // retirement 450 is held in its own wrapper; shown as a small satellite
  return (
    <g>
      <g opacity={t}>
        <rect x="300" y="28" width="160" height="46" rx="23" className="node gold" />
        <text x="380" y="50" textAnchor="middle" style={{ fontSize: 12, fill: 'var(--ivory)' }}>The Family</text>
        <text x="380" y="65" textAnchor="middle" className="label-mono" style={{ fontSize: 10, fill: 'var(--gold)' }}>owners · decision-makers</text>
      </g>
      {boxes.map((b, i) => {
        const delay = i * 0.18;
        const p = Math.min(1, Math.max(0, (t - delay) / (1 - delay)));
        const y = lerp(260, 150, p);
        return (
          <g key={b.label} opacity={p}>
            <path d={`M 380 74 C 380 110, ${b.x + 65} 110, ${b.x + 65} ${y}`} className="edge gold flow-line" strokeWidth="1.2" />
            <text x={(380 + b.x + 65) / 2} y="112" textAnchor="middle" className="label-mono" style={{ fontSize: 9, fill: 'var(--gold-2)' }}>100%</text>
            <rect x={b.x} y={y} width="130" height="104" rx="10" className="node" stroke={b.tone} />
            <text x={b.x + 65} y={y + 26} textAnchor="middle" style={{ fontSize: 12, fill: 'var(--ivory)' }}>{b.label}</text>
            <text x={b.x + 65} y={y + 44} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>{b.sub}</text>
            <line x1={b.x + 14} y1={y + 56} x2={b.x + 116} y2={y + 56} stroke="var(--line-strong)" />
            <text x={b.x + 65} y={y + 76} textAnchor="middle" className="label-mono" style={{ fontSize: 13, fill: 'var(--gold-2)' }}>{b.eq.toLocaleString()}k</text>
            <text x={b.x + 65} y={y + 92} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>equity in this box</text>
          </g>
        );
      })}
      <g opacity={Math.max(0, (t - 0.7) / 0.3)}>
        <rect x="610" y="290" width="110" height="36" rx="18" className="node" stroke="var(--green)" />
        <text x="665" y="308" textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory)' }}>Retirement 450k</text>
        <text x="665" y="320" textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--ivory-3)' }}>own wrapper · beneficiary form</text>
      </g>
      <g opacity={Math.max(0, (t - 0.75) / 0.25)}>
        <line x1="60" y1="340" x2="700" y2="340" stroke="var(--gold)" strokeDasharray="2 4" opacity="0.5" />
        <text x="380" y="366" textAnchor="middle" style={{ fontSize: 12, fill: 'var(--ivory-2)' }}>Same assets. Total equity still <tspan className="label-mono" style={{ fill: 'var(--gold-2)' }}>{equity.toLocaleString()}k</tspan>. What changed: title, control, liability walls, succession path.</text>
        <text x="380" y="384" textAnchor="middle" style={{ fontSize: 10, fill: 'var(--ivory-3)' }}>Re-grouping is not value creation. It is design.</text>
      </g>
    </g>
  );
}
