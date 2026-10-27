import { useMemo, useState } from 'react';
import { Eyebrow, Stat, Disclaimer, Chip, Callout } from '@/components/ui';
import { POWERS, HOLDERS, readControl, type Assignment, type Holder, type Power } from './control';

const PRESETS: Record<string, Assignment> = {
  'Personal ownership': { title: 'founder', management: 'founder', voting: 'founder', distribution: 'founder', amendment: 'founder' },
  'Revocable trust': { title: 'trustee', management: 'founder', voting: 'founder', distribution: 'founder', amendment: 'founder' },
  'Irrevocable, founder manages': { title: 'trustee', management: 'founder', voting: 'trustee', distribution: 'trustee', amendment: 'trustee' },
  'Fully delegated': { title: 'trustee', management: 'manager', voting: 'trustee', distribution: 'trustee', amendment: 'trustee' },
};

const HOLDER_TONE: Record<Holder, 'gold' | 'violet' | 'blue' | 'green'> = { founder: 'gold', trustee: 'violet', manager: 'blue', beneficiaries: 'green' };

export default function Simulator() {
  const [a, setA] = useState<Assignment>(PRESETS['Irrevocable, founder manages']);
  const r = useMemo(() => readControl(a), [a]);
  const set = (p: Power, h: Holder) => setA((x) => ({ ...x, [p]: h }));

  const estateTone = r.estateInclusionRisk === 'high' ? 'red' : r.estateInclusionRisk === 'elevated' ? 'amber' : 'green';
  const credTone = r.creditorExposure === 'founder' ? 'red' : r.creditorExposure === 'mixed' ? 'amber' : 'green';
  const succTone = r.succession === 'none' ? 'red' : r.succession === 'partial' ? 'amber' : 'green';

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row between">
        <div><Eyebrow>Control Dial</Eyebrow><h4 style={{ margin: '4px 0 0' }}>Assign each power. Read what the design implies.</h4></div>
        <div className="row" style={{ gap: 6 }}>
          {Object.keys(PRESETS).map((k) => <button key={k} className="btn sm ghost" onClick={() => setA(PRESETS[k])}>{k}</button>)}
        </div>
      </div>

      <div className="acad-sim" style={{ gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Power</th>{HOLDERS.map((h) => <th key={h.id} style={{ textAlign: 'center' }}>{h.label}</th>)}</tr>
            </thead>
            <tbody>
              {POWERS.map((p) => (
                <tr key={p.id}>
                  <td><div style={{ color: 'var(--ivory)' }}>{p.label}</div><div className="tiny muted">{p.desc}</div></td>
                  {HOLDERS.map((h) => {
                    const on = a[p.id] === h.id;
                    return (
                      <td key={h.id} style={{ textAlign: 'center' }}>
                        <button onClick={() => set(p.id, h.id)} aria-pressed={on} aria-label={`${p.label}: ${h.label}`} style={{ width: 22, height: 22, borderRadius: '50%', border: `1px solid ${on ? 'var(--gold)' : 'var(--line-strong)'}`, background: on ? 'var(--gold)' : 'transparent', boxShadow: on ? '0 0 0 4px rgba(201,169,97,0.15)' : 'none', transition: 'all 0.2s' }} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="stack" style={{ gap: 12 }}>
          <div className="acad-sim-stats">
            <Stat label="Founder powers held" value={`${r.founderPowers} / 5`} sub={`control retained: ${r.controlRetained}`} tone={r.founderPowers >= 4 ? 'red' : r.founderPowers >= 2 ? 'amber' : 'green'} />
            <Stat label="Estate inclusion risk" value={r.estateInclusionRisk.toUpperCase()} tone={estateTone} sub="educational flag, §2036 / §2038" />
            <Stat label="Creditor exposure" value={r.creditorExposure === 'founder' ? 'FOUNDER' : r.creditorExposure === 'mixed' ? 'MIXED' : 'STRUCTURE'} tone={credTone} sub="which direction claims point" />
            <Stat label="Succession layer" value={r.succession.toUpperCase()} tone={succTone} sub={r.grantorTrustLikely ? 'grantor trust likely' : 'non-grantor possible'} />
          </div>
          <div className="row" style={{ gap: 6 }}>
            {POWERS.map((p) => <Chip key={p.id} tone={HOLDER_TONE[a[p.id]]}>{p.label.split(' ')[0]} → {HOLDERS.find((h) => h.id === a[p.id])!.label.split(' ')[0]}</Chip>)}
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {r.flags.map((f) => (
              <div key={f.title} className={`acad-flag ${f.tone}`}>
                <span className="dot" style={{ marginTop: 6, color: f.tone === 'red' ? 'var(--red)' : f.tone === 'amber' ? 'var(--amber)' : 'var(--green-2)' }} />
                <div><strong>{f.title}</strong><div className="small muted" style={{ marginTop: 2 }}>{f.body}</div></div>
              </div>
            ))}
          </div>
          <Callout tone="amber" title="How to read this">
            <p className="small" style={{ margin: 0 }}>The readout flags patterns that practitioners look for, drawn from IRC §2036/§2038, the grantor trust rules and the sham/alter-ego cases. It does not know your facts, your state, your trust instrument or your creditors. "Low" means the design is coherent, not that an outcome is guaranteed. Before any power is actually moved, this is a conversation with estate counsel and a tax adviser.</p>
          </Callout>
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
