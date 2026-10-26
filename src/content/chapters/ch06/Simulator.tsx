import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Chip, Disclaimer, Callout } from '@/components/ui';
import { TrustToggles } from './Diagram';
import { CATEGORY_LABELS, DEFAULT_TRUST_PARAMS, effectiveGrantorStatus, trustFlags, type TrustParams } from './trustLogic';

/** Mini trust parameter toggler: four structural choices → consequence flags. */
export default function Simulator() {
  const [p, setP] = useState<TrustParams>(DEFAULT_TRUST_PARAMS);
  const set = (patch: Partial<TrustParams>) => setP((prev) => ({ ...prev, ...patch }));
  const flags = useMemo(() => trustFlags(p), [p]);
  const grantor = effectiveGrantorStatus(p);
  const overridden = p.revocability === 'revocable' && p.grantorStatus === 'non-grantor';

  return (
    <div className="stack" style={{ gap: 18 }}>
      <Panel>
        <div className="row between" style={{ marginBottom: 10 }}>
          <div>
            <div className="eyebrow">Trust parameter toggler</div>
            <h3 style={{ margin: '4px 0 0' }}>Four choices, five consequences</h3>
          </div>
          <Chip tone="amber">Not yet jurisdictionally verified</Chip>
        </div>
        <TrustToggles p={p} set={set} />
        <div className="row" style={{ gap: 6 }}>
          <Chip tone={p.revocability === 'revocable' ? 'red' : 'violet'}>{p.revocability}</Chip>
          <Chip tone={grantor === 'grantor' ? 'amber' : 'green'}>{grantor === 'grantor' ? 'grantor trust' : 'non-grantor trust'}</Chip>
          <Chip tone={p.situs === 'foreign' ? 'amber' : 'blue'}>{p.situs}</Chip>
          <Chip tone={p.distribution === 'discretionary' ? 'green' : 'gold'}>{p.distribution}</Chip>
        </div>
        {overridden && (
          <p className="small muted" style={{ marginTop: 10 }}>
            You selected non-grantor, but a revocable trust is a grantor trust by operation of IRC §676. The toggle is shown as overridden.
          </p>
        )}
      </Panel>

      <div className="grid grid-2" style={{ gap: 12 }}>
        {flags.map((f) => (
          <div key={f.category} className={`ch06-flag ${f.tone} fade-up`}>
            <div className="c">{CATEGORY_LABELS[f.category]}</div>
            <div className="t">{f.title}</div>
            <p className="d">{f.detail}</p>
          </div>
        ))}
        <div className="ch06-flag fade-up" style={{ borderColor: 'var(--gold)' }}>
          <div className="c">Which objective is this serving?</div>
          <div className="t">{p.revocability === 'revocable' ? 'Estate administration, not protection or tax' : grantor === 'grantor' ? 'Tax planning first, protection second' : p.distribution === 'discretionary' ? 'Protection and succession first' : 'Succession certainty first'}</div>
          <p className="d">
            {p.revocability === 'revocable' && 'Probate avoidance and incapacity management. Useful, inexpensive and almost universally appropriate — but nothing here moves the needle on estate tax or creditor exposure.'}
            {p.revocability === 'irrevocable' && grantor === 'grantor' && 'The settlor keeps paying the income tax so the trust compounds gross. That is a wealth-transfer play. Whether the settlor can also be a beneficiary without losing protection depends entirely on state law.'}
            {p.revocability === 'irrevocable' && grantor === 'non-grantor' && p.distribution === 'discretionary' && 'An independent trustee with real discretion and a spendthrift clause is the classic asset-protection and multi-generational succession structure. The price is compressed trust tax brackets on retained income and a trustee who must genuinely say no sometimes.'}
            {p.revocability === 'irrevocable' && grantor === 'non-grantor' && p.distribution === 'fixed' && 'Beneficiaries know exactly what they receive and when. Simple to administer, easy to explain, and the trust can be modelled precisely. Weakest of the irrevocable options against a beneficiary\'s own creditors or divorce.'}
          </p>
        </div>
      </div>

      <Callout title="Go deeper">
        <p className="small" style={{ margin: 0 }}>
          This is the compact version. The full <Link to="/trust-explorer">Trust Explorer</Link> lets you choose situs, name the parties, add a protector and a directed-trust adviser, and see the reporting obligations for each jurisdiction mode.
        </p>
      </Callout>

      <Panel tight>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Assumptions & formulas</div>
        <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Flags are derived from four binary inputs with U.S. federal tax law as the reference frame (IRC §§671–679 grantor trust rules; §§2036–2038 retained-interest inclusion; §7701(a)(30)(E) and (31)(B) with Treas. Reg. §301.7701-7 for the court and control tests; Uniform Trust Code §§502–505 for creditor claims).</li>
          <li>"Revocable" forces grantor status (§676). "Fixed" means a mandatory income or principal entitlement; "discretionary" means the trustee may withhold entirely.</li>
          <li>State law governs creditor reach, self-settled trust treatment, directed-trust mechanics and the rule against perpetuities; these vary materially and are not modelled here.</li>
          <li>No flag states a tax or legal outcome for a real trust. Each one states the question that arises and the default federal answer.</li>
        </ul>
      </Panel>
      <Disclaimer>
        Trust characterisation turns on the exact wording of the instrument, who holds which powers, where the trustee and beneficiaries live, and how the trust is actually administered. Drafting, funding and reporting require a trusts and estates attorney and a CPA who files Forms 1041, 709 and (where relevant) 3520.
      </Disclaimer>
    </div>
  );
}
