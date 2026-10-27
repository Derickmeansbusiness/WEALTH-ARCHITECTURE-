import { Fragment, useMemo, useState } from 'react';
import { Panel, Chip, Stat, Disclaimer, Eyebrow, NumberField, SliderField, useMoney } from '@/components/ui';
import { estimateOffice, DEFAULT_OFFICE, SERVICES, type OfficeInput, type OfficeModel, type Fit } from './model';
import './styles.css';

const FIT_LABEL: Record<Fit, string> = { typically: 'Typically considered', sometimes: 'Sometimes considered', rarely: 'Rarely considered' };
const FIT_TONE: Record<Fit, 'gold' | 'amber' | 'red'> = { typically: 'gold', sometimes: 'amber', rarely: 'red' };
const MODELS: OfficeModel[] = ['vfo', 'mfo', 'sfo'];

export default function Simulator() {
  const [inp, setInp] = useState<OfficeInput>(DEFAULT_OFFICE);
  const money = useMoney();
  const r = useMemo(() => estimateOffice(inp), [inp]);
  const set = <K extends keyof OfficeInput>(k: K, v: OfficeInput[K]) => setInp((x) => ({ ...x, [k]: v }));
  const fmtBps = (b: number) => (Number.isFinite(b) ? `${b.toFixed(0)} bps` : '—');

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <Panel>
          <Eyebrow>Scale & complexity</Eyebrow>
          <div className="stack" style={{ gap: 14, marginTop: 8 }}>
            <NumberField label="Investable assets (excluding operating businesses)" value={inp.investableAssets} onChange={(v) => set('investableAssets', v)} min={0} step={5_000_000} prefix="USD" />
            <SliderField label="Households served" value={inp.households} onChange={(v) => set('households', v)} min={1} max={12} />
            <SliderField label="Legal entities & trusts" value={inp.entities} onChange={(v) => set('entities', v)} min={0} max={60} />
            <SliderField label="Countries with assets, residents or filings" value={inp.countries} onChange={(v) => set('countries', v)} min={1} max={6} />
            <SliderField label="Operating businesses requiring oversight" value={inp.operatingBusinesses} onChange={(v) => set('operatingBusinesses', v)} min={0} max={5} />
          </div>
          <div className="hairline" style={{ margin: '18px 0' }} />
          <div className="grid grid-2" style={{ gap: 12 }}>
            <Stat label="Structural complexity" value={`${r.complexityScore} / 10`} tone={r.complexityScore >= 7 ? 'red' : r.complexityScore >= 4.5 ? 'amber' : 'green'} sub={r.complexityLabel} />
            <Stat label="Assets" value={money(inp.investableAssets, { compact: true })} sub={`${inp.households} household${inp.households === 1 ? '' : 's'} · ${inp.entities} entities`} />
          </div>
          {r.notes.length > 0 && (
            <ul className="small" style={{ margin: '14px 0 0', paddingLeft: 18, lineHeight: 1.55, color: 'var(--ivory-2)' }}>{r.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          )}
        </Panel>

        <Panel tight>
          <Eyebrow>Service coverage by model</Eyebrow>
          <div className="table-wrap" style={{ marginTop: 10, border: 0 }}>
            <table className="table">
              <thead><tr><th>Service</th><th>VFO</th><th>MFO</th><th>SFO</th></tr></thead>
              <tbody>
                {SERVICES.map((s) => (
                  <tr key={s.service}>
                    <td className="small">{s.service}</td>
                    {MODELS.map((m) => <td key={m} title={s[m]}><span className={`ch15-cov ${s[m]}`} /> <span className="tiny muted">{s[m]}</span></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row" style={{ gap: 12, marginTop: 10, fontSize: '0.72rem', color: 'var(--ivory-3)' }}>
            <span><span className="ch15-cov in-house" /> in-house</span><span><span className="ch15-cov outsourced" /> outsourced &amp; coordinated</span><span><span className="ch15-cov partial" /> partial</span><span><span className="ch15-cov none" /> not typical</span>
          </div>
        </Panel>
      </div>

      <div className="ch15-models">
        {MODELS.map((m) => {
          const e = r.estimates[m];
          return (
            <div key={m} className={`ch15-model ${e.fit}`}>
              <div className="row between">
                <h5>{e.label}</h5>
                <Chip tone={FIT_TONE[e.fit]}>{FIT_LABEL[e.fit]}</Chip>
              </div>
              <div>
                <div className="big">{money(e.annualCost, { compact: true })}<span className="small muted"> / yr</span></div>
                <div className="bps">{fmtBps(e.costBps)} of investable assets</div>
              </div>
              <p>{e.fitReason}</p>
              <div className="ch15-break">
                {e.breakdown.filter((b) => b.amount > 0).map((b) => (<Fragment key={b.item}><span>{b.item}</span><span className="n">{money(b.amount, { compact: true })}</span></Fragment>))}
              </div>
              <p><strong>Staffing.</strong> {e.staffing}</p>
              <p><strong>Governance.</strong> {e.governanceNote}</p>
            </div>
          );
        })}
      </div>

      <Panel tight>
        <Eyebrow>Assumptions & formulas</Eyebrow>
        <ul className="small muted" style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
          <li>All costs are stylized annual USD figures for illustration; real quotes vary by city, market cycle and the people involved. Investment management fees paid to external managers and custodians are excluded from every model.</li>
          <li><strong>SFO</strong> = core team $1.15M + $140k per household beyond two + $18k per entity + $90k per additional country + $110k per operating business + technology ($180k + 2 bps of assets, capped at $220k) + $260k office, insurance, outside counsel and audit.</li>
          <li><strong>MFO</strong> = tiered fee (95 bps on the first $25M, 60 bps to $100M, 40 bps to $250M, 28 bps above) with a $200k minimum + $9k per entity beyond five + $15k per additional household + $35k per additional country + $25k per operating business.</li>
          <li><strong>VFO</strong> = lead adviser retainer ($80k + 8 bps, capped at $300k) + bookkeeping ($45k + $4.5k per entity + $8k per additional household) + tax compliance ($30k + $7k per entity + $20k per additional country) + legal and trustee retainers ($35k + $20k per operating business) + $24k software.</li>
          <li>Complexity (0–10) = households beyond one × 0.5 (max 3) + entities ÷ 8 (max 3) + additional countries × 1.25 (max 2.5) + operating businesses × 0.75 (max 1.5).</li>
          <li>"Typically considered" thresholds: SFO at ≥ $250M, or ≥ $100M with complexity ≥ 4; MFO between $20M and $300M; VFO between $5M and $75M. These describe common practice discussion, not suitability for any family.</li>
          <li>Cost in basis points = annual cost ÷ investable assets × 10,000.</li>
        </ul>
      </Panel>
      <Disclaimer>Choosing an office model has legal and tax consequences: whether the office is a trade or business for deducting expenses (Lender Management LLC v. Commissioner, T.C. Memo. 2017-246, against the backdrop of §67(g)); whether it qualifies for the SEC family-office exclusion from adviser registration (Rule 202(a)(11)(G)-1) or must register; employment, benefits and state nexus. Each requires counsel and a tax adviser before a management company is formed or a profits interest is issued.</Disclaimer>
    </div>
  );
}
