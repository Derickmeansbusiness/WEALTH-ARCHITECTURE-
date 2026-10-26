import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Chip, Stat, Disclaimer, Eyebrow } from '@/components/ui';
import { auditExposure, DEFAULT_FACTS, type ExposureFacts, type Severity } from './model';
import './styles.css';

const FACT_META: { key: keyof ExposureFacts; title: string; desc: string; risky: boolean }[] = [
  { key: 'singleMemberLLC', title: 'Operating business is a single-member LLC', desc: 'No second member with a genuine economic interest.', risky: true },
  { key: 'personalGuarantee', title: 'Personal guarantees on business or property debt', desc: 'Lender can pursue you directly regardless of the entity.', risky: true },
  { key: 'commingled', title: 'Commingled accounts / formalities ignored', desc: 'Personal and entity money share accounts; no minutes, leases or agreements.', risky: true },
  { key: 'transferAfterClaim', title: 'Assets moved into structures after a claim arose', desc: 'Or after a dispute was reasonably foreseeable.', risky: true },
  { key: 'daptNonResident', title: 'DAPT funded while living in a non-DAPT state', desc: 'Trust chooses Nevada/South Dakota/Delaware/Alaska law; settlor lives elsewhere.', risky: true },
  { key: 'adequateInsurance', title: 'Insurance adequate to realistic claims', desc: 'Primary liability plus umbrella sized to the exposure, not the premium.', risky: false },
  { key: 'chargingOrderExclusive', title: 'Residence state: charging order is exclusive remedy', desc: 'Wyoming, Nevada, Delaware and a few others; most states permit foreclosure.', risky: false },
  { key: 'tenancyByEntirety', title: 'Residence held as tenancy by the entirety', desc: 'Married couple in a state recognizing TBE for the home.', risky: false },
  { key: 'erisaPlans', title: 'Retirement savings in ERISA plans', desc: '401(k)/pension rather than only IRAs.', risky: false },
];

const SEV_TONE: Record<Severity, 'green' | 'amber' | 'red'> = { low: 'green', medium: 'amber', high: 'red', critical: 'red' };
const SEV_W: Record<Severity, number> = { low: 18, medium: 45, high: 75, critical: 100 };
const SEV_COLOR: Record<Severity, string> = { low: 'var(--green-2)', medium: 'var(--amber)', high: '#d4766a', critical: 'var(--red)' };

export default function Simulator() {
  const [facts, setFacts] = useState<ExposureFacts>(DEFAULT_FACTS);
  const result = useMemo(() => auditExposure(facts), [facts]);
  const toggle = (k: keyof ExposureFacts) => setFacts((f) => ({ ...f, [k]: !f[k] }));

  const scoreTone = result.integrityScore >= 80 ? 'green' : result.integrityScore >= 50 ? 'amber' : 'red';

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <Panel>
          <Eyebrow>Facts about the structure</Eyebrow>
          <p className="small muted" style={{ marginTop: 6 }}>Toggle what is true for the family. The audit shows where an outside creditor (a claim against you personally) and an inside creditor (a claim arising inside the business) can reach.</p>
          <div className="stack" style={{ gap: 8 }}>
            {FACT_META.map((m) => {
              const on = facts[m.key];
              return (
                <label key={m.key} className={`ch11-toggle ${on ? 'on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggle(m.key)} />
                  <div>
                    <div className="t">{m.title}</div>
                    <div className="d">{m.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto' }}><Chip tone={on ? (m.risky ? 'red' : 'green') : (m.risky ? 'green' : 'amber')}>{on ? 'yes' : 'no'}</Chip></span>
                </label>
              );
            })}
          </div>
        </Panel>

        <div className="stack" style={{ gap: 16 }}>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <Stat label="Structural integrity" value={`${result.integrityScore} / 100`} tone={scoreTone} sub="Heuristic, not a legal opinion" />
            <Stat label="Worst flag" value={result.worst.toUpperCase()} tone={SEV_TONE[result.worst] === 'green' ? 'green' : SEV_TONE[result.worst] === 'amber' ? 'amber' : 'red'} sub={`${result.flags.length} issue${result.flags.length === 1 ? '' : 's'} flagged`} />
          </div>
          <Panel tight>
            <Eyebrow>Exposure map</Eyebrow>
            <div className="ch11-map" style={{ marginTop: 10 }}>
              {result.assets.map((a) => (
                <div key={a.id} className="ch11-asset">
                  <h5>{a.label}</h5>
                  <div className="ch11-sev">
                    <span className="k">Outside claim</span><Chip tone={SEV_TONE[a.outside]}>{a.outside}</Chip>
                  </div>
                  <div className="ch11-bar"><i style={{ width: `${SEV_W[a.outside]}%`, background: SEV_COLOR[a.outside] }} /></div>
                  <div className="ch11-sev">
                    <span className="k">Inside claim</span><Chip tone={SEV_TONE[a.inside]}>{a.inside}</Chip>
                  </div>
                  <div className="ch11-bar"><i style={{ width: `${SEV_W[a.inside]}%`, background: SEV_COLOR[a.inside] }} /></div>
                  <ul>{a.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <div className="row between" style={{ marginBottom: 12 }}>
          <Eyebrow>Flagged exposures, worst first</Eyebrow>
          <Link to="/liability" className="btn sm ghost">Open the Liability Simulator →</Link>
        </div>
        {result.flags.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>No structural flags on these facts. That does not mean the structure is bulletproof; it means the common self-inflicted wounds are absent. Insurance limits, state law, and documentation quality still decide outcomes.</p>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {result.flags.map((f) => (
              <div key={f.id} className={`ch11-flag ${f.severity}`}>
                <div className="row between" style={{ marginBottom: 4 }}>
                  <h5>{f.title}</h5>
                  <div className="row" style={{ gap: 6 }}>
                    <Chip tone={SEV_TONE[f.severity]}>{f.severity}</Chip>
                    {f.professionalReview && <Chip tone="amber">Counsel review</Chip>}
                  </div>
                </div>
                <p>{f.detail}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel tight>
        <Eyebrow>Assumptions & formulas</Eyebrow>
        <ul className="small muted" style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Severity scale: low → medium → high → critical. Each asset is scored separately for an <strong>outside</strong> claim (against the owner personally) and an <strong>inside</strong> claim (arising inside the operating business).</li>
          <li>Integrity score = 100 − Σ penalties per flag (low 4, medium 10, high 18, critical 35), floored at 0. It is an ordering device, not a probability.</li>
          <li>Single-member LLC outside exposure: high where foreclosure of the charged interest is permitted; medium where the charging order is the exclusive remedy by statute. Multi-member: medium / low respectively.</li>
          <li>A personal guarantee raises inside exposure of personally held assets (home, brokerage) because the guaranteed lender becomes a direct personal creditor.</li>
          <li>Commingling or a transfer after the claim arose raises outside exposure of every entity or trust asset to at least high; a late transfer makes the trust critical (UVTA / 11 U.S.C. §548(e)).</li>
          <li>Tenancy by the entirety, ERISA status and homestead treatment are modelled as binary; in practice each has caps, exceptions (federal tax liens, joint debts, QDROs, bankruptcy §522 caps) and state-specific rules.</li>
          <li>Jurisdiction mode: United States. Non-US readers should treat the categories (inside vs outside liability, timing, documentation) as transferable and the specific remedies as not.</li>
        </ul>
      </Panel>
      <Disclaimer>Asset protection outcomes turn on state law, solvency at the time of transfer, documentation, and timing. Any flag marked “Counsel review” describes a situation where an asset protection attorney and, where trusts are involved, a tax adviser would ordinarily be engaged before acting.</Disclaimer>
    </div>
  );
}
