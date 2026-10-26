import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Chip, Stat, Disclaimer, Eyebrow, SelectField, useMoney } from '@/components/ui';
import { mapReporting, DEFAULT_STRUCTURE, SITUS, type StructureFacts, type Situs, type Burden } from './model';
import './styles.css';

function Seg<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="ch12-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => <button key={o.value} type="button" className={value === o.value ? 'on' : ''} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>)}
      </div>
    </div>
  );
}

const BURDEN_TONE: Record<Burden, 'green' | 'amber' | 'red'> = { light: 'green', moderate: 'amber', heavy: 'red' };

export default function Simulator() {
  const [f, setF] = useState<StructureFacts>(DEFAULT_STRUCTURE);
  const money = useMoney();
  const r = useMemo(() => mapReporting(f), [f]);
  const s = SITUS[f.situs];
  const set = <K extends keyof StructureFacts>(k: K, v: StructureFacts[K]) => setF((x) => ({ ...x, [k]: v }));
  const yn = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] as const;
  const b = (v: boolean) => (v ? 'yes' : 'no');

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <Panel>
          <Eyebrow>Structure facts</Eyebrow>
          <p className="small muted" style={{ marginTop: 6 }}>Describe the proposed foreign structure. The map lists the U.S. reporting categories it implicates and what the trust jurisdiction is actually offering.</p>
          <div className="stack" style={{ gap: 14 }}>
            <Seg label="Settlor" value={f.settlorUS ? 'us' : 'non'} onChange={(v) => set('settlorUS', v === 'us')} options={[{ value: 'us', label: 'U.S. person' }, { value: 'non', label: 'Non-U.S.' }]} />
            <Seg label="Beneficiaries" value={f.beneficiariesUS ? 'us' : 'non'} onChange={(v) => set('beneficiariesUS', v === 'us')} options={[{ value: 'us', label: 'Any U.S. person' }, { value: 'non', label: 'None U.S.' }]} />
            <SelectField<Situs> label="Trust situs" value={f.situs} onChange={(v) => set('situs', v)} options={(Object.keys(SITUS) as Situs[]).map((k) => ({ value: k, label: `${SITUS[k].name} — ${SITUS[k].statute}` }))} />
            <Seg label="Trust holds foreign financial accounts" value={b(f.foreignAccounts)} onChange={(v) => set('foreignAccounts', v === 'yes')} options={[...yn]} />
            <Seg label="Trust owns a foreign company (e.g. Nevis LLC)" value={b(f.foreignCompany)} onChange={(v) => set('foreignCompany', v === 'yes')} options={[...yn]} />
            <Seg label="Distributions paid to U.S. beneficiaries this year" value={b(f.distributionsToUS)} onChange={(v) => set('distributionsToUS', v === 'yes')} options={[...yn]} />
          </div>
          <div className="hairline" style={{ margin: '18px 0' }} />
          <Eyebrow>What {s.name} is offering a creditor</Eyebrow>
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <span className="small muted">Creditor barrier strength</span>
            <div className="ch12-meter" style={{ width: 120 }}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= s.barrierStrength ? 'on' : ''} />)}</div>
          </div>
          <ul className="ch12-situs">{s.features.map((x, i) => <li key={i}>{x}</li>)}</ul>
          <p className="tiny muted" style={{ marginTop: 8 }}>Barrier strength is a qualitative ordering of how hard the local statute makes a creditor's path. It is not a ranking of suitability: cost, trustee quality, political stability, banking access and the settlor's home-country law all weigh against it.</p>
        </Panel>

        <div className="stack" style={{ gap: 16 }}>
          <Panel tone="gold" tight>
            <Eyebrow>U.S. tax character</Eyebrow>
            <h4 style={{ margin: '6px 0 6px' }}>{r.taxCharacter}</h4>
            <p className="small" style={{ margin: 0 }}>{r.taxCharacterDetail}</p>
          </Panel>
          <div className="grid grid-3" style={{ gap: 12 }}>
            <Stat label="Compliance complexity" value={`${r.complexity} / 5`} tone={r.complexity >= 4 ? 'red' : r.complexity >= 3 ? 'amber' : 'green'} sub={r.complexityLabel} />
            <Stat label="Illustrative set-up" value={`${money(r.setupCost[0], { compact: true })}–${money(r.setupCost[1], { compact: true })}`} sub="legal, trustee onboarding, entity" />
            <Stat label="Illustrative annual" value={`${money(r.annualCost[0], { compact: true })}–${money(r.annualCost[1], { compact: true })}`} sub="trustee + U.S. compliance" />
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="small muted">Complexity</span>
            <div className="ch12-meter" style={{ flex: 1 }}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={`${i <= r.complexity ? 'on' : ''} ${i >= 4 && i <= r.complexity ? 'hot' : ''}`} />)}</div>
          </div>
          {r.notes.length > 0 && (
            <Panel tight>
              <Eyebrow>Planning notes</Eyebrow>
              <ul className="small" style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.55, color: 'var(--ivory-2)' }}>{r.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </Panel>
          )}
        </div>
      </div>

      <Panel>
        <div className="row between" style={{ marginBottom: 12 }}>
          <Eyebrow>Reporting categories implicated ({r.items.length})</Eyebrow>
          <Link to="/jurisdictions" className="btn sm ghost">Compare jurisdictions →</Link>
        </div>
        {r.items.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>No U.S. information-reporting categories are implicated on these facts. The settlor's and beneficiaries' home-country rules, and CRS exchange from the trust jurisdiction, apply instead.</p>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {r.items.map((it) => (
              <div key={it.id} className="ch12-item">
                <div>
                  <div className="form">{it.form}</div>
                  <div style={{ marginTop: 6 }}><Chip tone={BURDEN_TONE[it.burden]}>{it.burden}</Chip></div>
                </div>
                <div>
                  <h5>{it.title}</h5>
                  <p><span className="k">Who</span>{it.who}</p>
                  <p><span className="k">Why</span>{it.why}</p>
                  <p><span className="k">Penalty</span>{it.penalty}</p>
                  <div className="auth">{it.authority}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel tight>
        <Eyebrow>Assumptions & formulas</Eyebrow>
        <ul className="small muted" style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Tax character follows IRC §679 (U.S. settlor + U.S. beneficiary → grantor trust), §684 (U.S. settlor, no U.S. beneficiary → gain recognition on funding), §672(f) (non-U.S. settlor → generally non-grantor), and the throwback rules of §§665–668 for accumulation distributions to U.S. beneficiaries.</li>
          <li>FBAR is shown when any U.S. person is involved and the trust holds foreign accounts; the $10,000 aggregate threshold, the greater-than-50% beneficial-interest rule and trustee-filing exceptions are not modelled.</li>
          <li>Form 8938 thresholds ($50,000 / $100,000 and higher for taxpayers living abroad) are not modelled; the form is listed whenever foreign accounts and a U.S. person exist.</li>
          <li>A foreign LLC is assumed to default to corporate classification (Treas. Reg. §301.7701-3(b)(2)) because all members have limited liability; Form 8858 replaces Form 5471 if a check-the-box election is made.</li>
          <li>Complexity = round(1 + 1.4 × heavy items + 0.8 × moderate items + 0.2 × all items), capped at 5; set to 1 when no U.S. person is involved.</li>
          <li>Annual cost = situs trustee-fee band + U.S. compliance band ($2,500–$6,000 base, plus $2,500–$6,000 per heavy item and $1,000–$2,500 per moderate item) + $1,500–$4,000 if a foreign company needs annual maintenance. Set-up: $15,000–$60,000 plus $3,000–$8,000 for a company. All figures illustrative USD, converted at the displayed rate.</li>
          <li>Penalty figures are stated generally; several are inflation-adjusted and all are subject to reasonable-cause relief and current IRS procedures.</li>
        </ul>
      </Panel>
      <Disclaimer tone="danger">Foreign trusts carry some of the heaviest information-reporting penalties in the Code and willful non-reporting is a crime. Nothing here reduces tax. Confirm every category with a tax adviser experienced in foreign trust compliance before funding, and budget for annual filings as a permanent cost of the structure.</Disclaimer>
    </div>
  );
}
