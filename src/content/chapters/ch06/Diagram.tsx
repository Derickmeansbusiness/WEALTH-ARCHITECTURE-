import { useState } from 'react';
import { DEFAULT_TRUST_PARAMS, effectiveGrantorStatus, type TrustParams } from './trustLogic';

/**
 * The five-party trust diagram. Toggling the four structural parameters re-colors the
 * relationships: who can pull assets back, who is taxed, who can be reached, what is reported.
 */
const C = {
  gold: 'var(--gold)', gold2: 'var(--gold-2)', violet: 'var(--violet)', blue: 'var(--blue)', green: 'var(--green-2)', red: 'var(--red)', amber: 'var(--amber)', ivory2: 'var(--ivory-2)', ivory3: 'var(--ivory-3)',
};

const MARKERS: Record<string, string> = { gold: C.gold, blue: C.blue, red: C.red, amber: C.amber, green: C.green, ivory: C.ivory2 };
const mk = (k: keyof typeof MARKERS) => `url(#ch06-arrow-${k})`;

function Toggle<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; l: string }[] }) {
  return (
    <div className="ch06-toggle" role="radiogroup">
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}

export function TrustToggles({ p, set }: { p: TrustParams; set: (patch: Partial<TrustParams>) => void }) {
  return (
    <div className="ch06-toggle-row">
      <Toggle value={p.revocability} onChange={(v) => set({ revocability: v })} options={[{ v: 'revocable', l: 'Revocable' }, { v: 'irrevocable', l: 'Irrevocable' }]} />
      <Toggle value={p.grantorStatus} onChange={(v) => set({ grantorStatus: v })} options={[{ v: 'grantor', l: 'Grantor' }, { v: 'non-grantor', l: 'Non-grantor' }]} />
      <Toggle value={p.situs} onChange={(v) => set({ situs: v })} options={[{ v: 'domestic', l: 'Domestic' }, { v: 'foreign', l: 'Foreign' }]} />
      <Toggle value={p.distribution} onChange={(v) => set({ distribution: v })} options={[{ v: 'discretionary', l: 'Discretionary' }, { v: 'fixed', l: 'Fixed' }]} />
    </div>
  );
}

export function TrustDiagramSvg({ p }: { p: TrustParams }) {
  const grantor = effectiveGrantorStatus(p);
  const revocable = p.revocability === 'revocable';
  const foreign = p.situs === 'foreign';
  const discretionary = p.distribution === 'discretionary';
  const trustStroke = revocable ? C.red : foreign ? C.amber : C.violet;
  const distColor = discretionary ? C.green : C.gold;

  const settlor = { x: 120, y: 120 };
  const trustee = { x: 640, y: 120 };
  const protector = { x: 640, y: 350 };
  const trust = { x: 380, y: 230, w: 220, h: 96 };
  const bens = [{ x: 290, y: 410 }, { x: 380, y: 420 }, { x: 470, y: 410 }];

  return (
    <svg viewBox="0 0 760 470" className="diagram" aria-label="Five-party trust diagram: settlor, trustee, protector, beneficiaries and trust assets" style={{ maxHeight: 520 }}>
      <defs>
        {Object.entries(MARKERS).map(([k, color]) => (
          <marker key={k} id={`ch06-arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
        <radialGradient id="ch06-glow"><stop offset="0%" stopColor={revocable ? 'rgba(194,90,76,0.25)' : 'rgba(124,108,168,0.3)'} /><stop offset="100%" stopColor="rgba(0,0,0,0)" /></radialGradient>
      </defs>

      <circle cx={trust.x} cy={trust.y + 20} r={170} fill="url(#ch06-glow)" className="ch06-breathe" />

      {/* Settlor → Trust : transfer of legal title */}
      <g style={{ color: C.gold }}>
        <path d={`M ${settlor.x + 40} ${settlor.y + 20} Q 220 190 ${trust.x - trust.w / 2 - 6} ${trust.y - 10}`} fill="none" stroke={C.gold} strokeWidth={1.6} className="flow-line" markerEnd={mk('gold')} />
        <text x={175} y={150} style={{ fontSize: 11, fill: C.gold2 }}>transfers assets</text>
        <text x={175} y={164} style={{ fontSize: 10, fill: C.ivory3 }}>{revocable ? 'incomplete gift' : 'completed gift / sale'}</text>
      </g>
      {/* Revocable: settlor can recall */}
      {revocable && (
        <g style={{ color: C.red }} className="fade-in">
          <path d={`M ${trust.x - trust.w / 2 - 6} ${trust.y + 24} Q 200 240 ${settlor.x + 30} ${settlor.y + 48}`} fill="none" stroke={C.red} strokeWidth={1.4} strokeDasharray="3 5" markerEnd={mk('red')} />
          <text x={150} y={238} style={{ fontSize: 10, fill: '#e7a398' }}>power to revoke · §2038</text>
        </g>
      )}
      {/* Grantor: income tax flows back to settlor */}
      {grantor === 'grantor' && !revocable && (
        <g style={{ color: C.amber }} className="fade-in">
          <path d={`M ${trust.x - trust.w / 2} ${trust.y + 36} Q 170 260 ${settlor.x} ${settlor.y + 52}`} fill="none" stroke={C.amber} strokeWidth={1.2} strokeDasharray="2 6" markerEnd={mk('amber')} />
          <text x={128} y={248} style={{ fontSize: 10, fill: C.amber }}>income tax reported by settlor</text>
          <text x={128} y={261} style={{ fontSize: 10, fill: C.ivory3 }}>IRC §§671–677</text>
        </g>
      )}

      {/* Trustee → Trust : legal control */}
      <g style={{ color: C.blue }}>
        <path d={`M ${trustee.x - 42} ${trustee.y + 20} Q 540 190 ${trust.x + trust.w / 2 + 6} ${trust.y - 10}`} fill="none" stroke={C.blue} strokeWidth={1.6} className="flow-line" markerEnd={mk('blue')} />
        <text x={500} y={150} textAnchor="end" style={{ fontSize: 11, fill: '#9db7d6' }}>holds legal title · administers</text>
        <text x={500} y={164} textAnchor="end" style={{ fontSize: 10, fill: C.ivory3 }}>{discretionary ? 'real discretion over distributions' : 'follows fixed entitlements'}</text>
      </g>

      {/* Protector → Trustee : oversight */}
      <g style={{ color: C.ivory2 }}>
        <path d={`M ${protector.x} ${protector.y - 36} L ${trustee.x} ${trustee.y + 44}`} fill="none" stroke={C.ivory2} strokeWidth={1.2} strokeDasharray="4 6" markerEnd={mk('ivory')} opacity={0.7} />
        <text x={656} y={250} style={{ fontSize: 10, fill: C.ivory3 }}>remove / replace</text>
        <text x={656} y={263} style={{ fontSize: 10, fill: C.ivory3 }}>change situs · veto</text>
      </g>
      {/* Protector → Trust : situs oversight */}
      <path d={`M ${protector.x - 44} ${protector.y - 8} Q 540 300 ${trust.x + trust.w / 2 + 6} ${trust.y + 40}`} fill="none" stroke={C.ivory2} strokeWidth={1} strokeDasharray="2 6" opacity={0.45} />

      {/* Trust → Beneficiaries : distributions */}
      {bens.map((b, i) => (
        <g key={i} style={{ color: distColor }}>
          <path d={`M ${trust.x + (i - 1) * 50} ${trust.y + trust.h / 2 + 4} Q ${trust.x + (i - 1) * 60} 360 ${b.x} ${b.y - 20}`} fill="none" stroke={distColor} strokeWidth={discretionary ? 1.4 : 2} className={discretionary ? 'flow-line' : undefined} markerEnd={mk(discretionary ? 'green' : 'gold')} opacity={discretionary ? 0.9 : 1} />
        </g>
      ))}
      <text x={trust.x + 118} y={372} style={{ fontSize: 11, fill: distColor }}>{discretionary ? 'discretionary distributions' : 'mandatory distributions'}</text>
      <text x={trust.x + 118} y={386} style={{ fontSize: 10, fill: C.ivory3 }}>{discretionary ? 'beneficiary cannot compel · spendthrift' : 'fixed right · creditor can attach when due'}</text>

      {/* Trust assets node */}
      <g transform={`translate(${trust.x} ${trust.y})`}>
        <rect x={-trust.w / 2} y={-trust.h / 2} width={trust.w} height={trust.h} rx={14} className="node" stroke={trustStroke} strokeWidth={1.8} />
        <text y={-22} textAnchor="middle" style={{ fontSize: 13, fill: 'var(--ivory)', fontWeight: 600, letterSpacing: '0.04em' }}>TRUST ASSETS</text>
        <text y={-5} textAnchor="middle" style={{ fontSize: 10.5, fill: C.ivory3 }}>legal title: trustee · beneficial: beneficiaries</text>
        <text y={14} textAnchor="middle" style={{ fontSize: 10.5, fill: revocable ? '#e7a398' : foreign ? C.amber : '#b7adda' }}>
          {revocable ? 'revocable · grantor trust · in estate' : `${p.revocability} · ${grantor === 'grantor' ? 'grantor (§671)' : 'non-grantor (Form 1041)'}`}
        </text>
        <text y={32} textAnchor="middle" style={{ fontSize: 10.5, fill: foreign ? C.amber : C.ivory3 }}>
          {foreign ? 'foreign trust · §7701(a)(31) · Forms 3520 / 3520-A' : 'domestic · court test + control test met'}
        </text>
      </g>

      {/* Settlor */}
      <g transform={`translate(${settlor.x} ${settlor.y})`}>
        <circle r={40} className="node" stroke={C.gold} strokeWidth={1.6} />
        <circle r={4} fill={C.gold} />
        <text y={22} textAnchor="middle" style={{ fontSize: 11, fill: C.gold2, letterSpacing: '0.08em' }}>SETTLOR</text>
        <text y={62} textAnchor="middle" style={{ fontSize: 10, fill: C.ivory3 }}>creates & funds</text>
      </g>

      {/* Trustee */}
      <g transform={`translate(${trustee.x} ${trustee.y})`}>
        <circle r={40} className="node" stroke={C.blue} strokeWidth={1.6} />
        <circle r={4} fill={C.blue} />
        <text y={22} textAnchor="middle" style={{ fontSize: 11, fill: '#9db7d6', letterSpacing: '0.08em' }}>TRUSTEE</text>
        <text y={62} textAnchor="middle" style={{ fontSize: 10, fill: C.ivory3 }}>fiduciary · controls</text>
      </g>

      {/* Protector */}
      <g transform={`translate(${protector.x} ${protector.y})`}>
        <circle r={34} className="node" stroke={C.ivory2} strokeWidth={1.2} strokeDasharray="4 3" />
        <circle r={3.5} fill={C.ivory2} />
        <text y={20} textAnchor="middle" style={{ fontSize: 10.5, fill: C.ivory2, letterSpacing: '0.08em' }}>PROTECTOR</text>
        <text y={56} textAnchor="middle" style={{ fontSize: 10, fill: C.ivory3 }}>oversees · optional</text>
      </g>

      {/* Beneficiaries */}
      {bens.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y})`}>
          <circle r={18} className="node" stroke={C.violet} strokeWidth={1.4} />
          <circle r={3} fill={C.violet} />
        </g>
      ))}
      <text x={380} y={456} textAnchor="middle" style={{ fontSize: 11, fill: '#b7adda', letterSpacing: '0.08em' }}>BENEFICIARIES · equitable interest</text>
    </svg>
  );
}

export default function Diagram() {
  const [p, setP] = useState<TrustParams>(DEFAULT_TRUST_PARAMS);
  const set = (patch: Partial<TrustParams>) => setP((prev) => ({ ...prev, ...patch }));
  const grantor = effectiveGrantorStatus(p);
  return (
    <div>
      <TrustToggles p={p} set={set} />
      <div className="ch06-diagram-wrap">
        <TrustDiagramSvg p={p} />
      </div>
      <p className="ch06-caption">
        Gold is the settlor's transfer of title; blue is the trustee's legal control; the dashed ivory lines are the protector's oversight powers; the lower arrows are distributions to beneficiaries, flowing green when discretionary and solid gold when fixed.
        {p.revocability === 'revocable' && ' The red return arrow is the power to revoke: while it exists nothing has really left the settlor for estate-tax or creditor purposes.'}
        {p.revocability === 'irrevocable' && grantor === 'grantor' && ' The amber dotted line shows income tax flowing back to the settlor under the grantor trust rules while the assets stay outside the estate — the "tax burn" that makes an intentionally defective grantor trust work.'}
        {p.situs === 'foreign' && ' The amber border marks a foreign trust for U.S. tax purposes: more reporting, not less tax.'}
      </p>
    </div>
  );
}
