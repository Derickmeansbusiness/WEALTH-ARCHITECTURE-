import { useMemo, useState } from 'react';
import { Eyebrow, Stat, Tabs, Disclaimer, Callout, NumberField, SelectField, useMoney, Chip } from '@/components/ui';
import { pct, uid } from '@/lib/format';
import { summarize, regroup, sumEquity, ASSET_META, type AssetLine, type LiabilityLine, type AssetKind, type LiabilityKind } from './balanceSheet';

const DEFAULT_ASSETS: AssetLine[] = [
  { id: 'a1', label: 'Primary residence', kind: 'residence', value: 1_200_000 },
  { id: 'a2', label: 'Operating business (your share)', kind: 'business', value: 1_800_000 },
  { id: 'a3', label: 'Brokerage account', kind: 'securities', value: 500_000 },
  { id: 'a4', label: 'Rental duplex', kind: 'rental', value: 900_000 },
  { id: 'a5', label: 'Retirement accounts', kind: 'retirement', value: 450_000 },
  { id: 'a6', label: 'Cash', kind: 'cash', value: 150_000 },
];
const DEFAULT_LIABS: LiabilityLine[] = [
  { id: 'l1', label: 'Home mortgage', kind: 'mortgage', value: 700_000, annualService: 55_000 },
  { id: 'l2', label: 'Rental loan', kind: 'rental-debt', value: 600_000, annualService: 46_000 },
  { id: 'l3', label: 'Business term loan', kind: 'business-debt', value: 400_000, annualService: 90_000 },
];

const LIAB_LABEL: Record<LiabilityKind, string> = { mortgage: 'Home mortgage', 'rental-debt': 'Loan on rental property', 'business-debt': 'Business debt', consumer: 'Consumer / vehicle debt', other: 'Other' };

export default function Simulator() {
  const [assets, setAssets] = useState<AssetLine[]>(DEFAULT_ASSETS);
  const [liabs, setLiabs] = useState<LiabilityLine[]>(DEFAULT_LIABS);
  const [living, setLiving] = useState(180_000);
  const [view, setView] = useState<'personal' | 'structured'>('personal');
  const fmt = useMoney();

  const s = useMemo(() => summarize(assets, liabs, living), [assets, liabs, living]);
  const groups = useMemo(() => regroup(assets, liabs), [assets, liabs]);

  const updA = (id: string, patch: Partial<AssetLine>) => setAssets((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const updL = (id: string, patch: Partial<LiabilityLine>) => setLiabs((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const runwayTone = !isFinite(s.liquidityRatio) ? 'green' : s.liquidityRatio >= 2 ? 'green' : s.liquidityRatio >= 1 ? 'amber' : 'red';

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row between">
        <div><Eyebrow>Balance Sheet Builder</Eyebrow><h4 style={{ margin: '4px 0 0' }}>Enter what you own and owe. Then watch the same numbers re-grouped.</h4></div>
        <Tabs size="sm" value={view} onChange={setView} tabs={[{ id: 'personal', label: 'Personal sheet' }, { id: 'structured', label: 'Structured sheet' }]} />
      </div>

      <div className="acad-sim">
        <div className="stack" style={{ gap: 14 }}>
          <div className="stack" style={{ gap: 10 }}>
            <div className="row between"><Eyebrow>Assets</Eyebrow><button className="btn sm ghost" onClick={() => setAssets((xs) => [...xs, { id: uid(), label: 'New asset', kind: 'other', value: 0 }])}>+ Add</button></div>
            {assets.map((a) => (
              <div key={a.id} className="panel tight stack" style={{ gap: 8 }}>
                <div className="row between" style={{ flexWrap: 'nowrap' }}>
                  <input className="input" value={a.label} onChange={(e) => updA(a.id, { label: e.target.value })} style={{ fontSize: '0.85rem', padding: '6px 10px' }} />
                  <button className="btn sm ghost" onClick={() => setAssets((xs) => xs.filter((x) => x.id !== a.id))} aria-label="Remove">✕</button>
                </div>
                <div className="grid grid-2" style={{ gap: 8 }}>
                  <SelectField label="Type" value={a.kind} onChange={(k) => updA(a.id, { kind: k as AssetKind })} options={(Object.keys(ASSET_META) as AssetKind[]).map((k) => ({ value: k, label: ASSET_META[k].label }))} />
                  <NumberField label="Value (USD)" value={a.value} onChange={(v) => updA(a.id, { value: v })} step={10_000} min={0} />
                </div>
              </div>
            ))}
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <div className="row between"><Eyebrow>Liabilities</Eyebrow><button className="btn sm ghost" onClick={() => setLiabs((xs) => [...xs, { id: uid(), label: 'New liability', kind: 'other', value: 0, annualService: 0 }])}>+ Add</button></div>
            {liabs.map((l) => (
              <div key={l.id} className="panel tight stack" style={{ gap: 8 }}>
                <div className="row between" style={{ flexWrap: 'nowrap' }}>
                  <input className="input" value={l.label} onChange={(e) => updL(l.id, { label: e.target.value })} style={{ fontSize: '0.85rem', padding: '6px 10px' }} />
                  <button className="btn sm ghost" onClick={() => setLiabs((xs) => xs.filter((x) => x.id !== l.id))} aria-label="Remove">✕</button>
                </div>
                <SelectField label="Type" value={l.kind} onChange={(k) => updL(l.id, { kind: k as LiabilityKind })} options={(Object.keys(LIAB_LABEL) as LiabilityKind[]).map((k) => ({ value: k, label: LIAB_LABEL[k] }))} />
                <div className="grid grid-2" style={{ gap: 8 }}>
                  <NumberField label="Balance (USD)" value={l.value} onChange={(v) => updL(l.id, { value: v })} step={10_000} min={0} />
                  <NumberField label="Annual debt service" value={l.annualService ?? 0} onChange={(v) => updL(l.id, { annualService: v })} step={1_000} min={0} />
                </div>
              </div>
            ))}
          </div>
          <NumberField label="Annual living costs (excl. debt service)" value={living} onChange={setLiving} step={5_000} min={0} hint="Used for the liquidity runway." />
        </div>

        <div className="stack" style={{ gap: 14 }}>
          <div className="acad-sim-stats">
            <Stat label="Total assets" value={fmt(s.totalAssets, { compact: true })} />
            <Stat label="Total liabilities" value={fmt(s.totalLiabilities, { compact: true })} tone="red" />
            <Stat label="Net worth" value={fmt(s.netWorth, { compact: true })} tone="gold" sub="Assets − Liabilities" />
            <Stat label="Liquid assets" value={fmt(s.liquidAssets, { compact: true })} sub={`${pct(s.liquidShare, 0)} of assets`} />
            <Stat label="Liquidity runway" value={isFinite(s.liquidityRatio) ? `${s.liquidityRatio.toFixed(1)} yrs` : '∞'} tone={runwayTone} sub="liquid ÷ (living + debt service)" />
            <Stat label="Working assets" value={pct(s.workingShare, 0)} sub="produce income or growth" tone={s.workingShare > 0.5 ? 'green' : 'amber'} />
            <Stat label="Leverage" value={pct(s.leverage, 0)} sub="liabilities ÷ assets" />
          </div>

          {view === 'personal' ? (
            <div className="panel tight">
              <Eyebrow>Personal balance sheet</Eyebrow>
              <div className="grid grid-2" style={{ gap: 14, marginTop: 10 }}>
                <div>
                  <div className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Assets</div>
                  {assets.map((a) => <Row key={a.id} label={a.label} value={fmt(a.value, { compact: true })} tag={ASSET_META[a.kind].working ? 'working' : 'consumption'} tagTone={ASSET_META[a.kind].working ? 'green' : undefined} />)}
                </div>
                <div>
                  <div className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Liabilities & equity</div>
                  {liabs.map((l) => <Row key={l.id} label={l.label} value={fmt(l.value, { compact: true })} red />)}
                  <Row label="Equity (net worth)" value={fmt(s.netWorth, { compact: true })} gold />
                </div>
              </div>
            </div>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              <Callout tone="amber" title="What re-grouping does and does not do">
                <p className="small" style={{ margin: 0 }}>The structured sheet shows the same lines under the vehicles a planner would typically propose. Total equity is <strong>{fmt(sumEquity(groups), { compact: true })}</strong>, identical to the personal sheet. Re-grouping changes <strong>legal title, control, liability exposure and succession mechanics</strong>. It does not change value, and it does not by itself change income tax: a single-member LLC is disregarded and a revocable trust is a grantor trust. Lenders must consent before financed assets move.</p>
              </Callout>
              <div className="grid grid-2" style={{ gap: 10 }}>
                {groups.map((g) => (
                  <div key={g.id} className="panel tight" style={{ borderColor: g.kind === 'holdco' ? 'rgba(201,169,97,0.4)' : g.kind === 'llc' ? 'rgba(62,160,118,0.4)' : g.kind === 'trust' ? 'rgba(124,108,168,0.4)' : undefined }}>
                    <div className="row between"><span className="display" style={{ fontSize: '1.1rem' }}>{g.name}</span><Chip tone={g.kind === 'holdco' ? 'gold' : g.kind === 'llc' ? 'green' : g.kind === 'trust' ? 'violet' : undefined}>{g.kind}</Chip></div>
                    <div style={{ marginTop: 8 }}>
                      {g.assets.map((a) => <Row key={a.id} label={a.label} value={fmt(a.value, { compact: true })} />)}
                      {g.liabilities.map((l) => <Row key={l.id} label={l.label} value={`(${fmt(l.value, { compact: true })})`} red />)}
                      <Row label="Equity in this box" value={fmt(g.equity, { compact: true })} gold />
                    </div>
                    <p className="tiny muted" style={{ margin: '8px 0 0' }}>{g.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="acad-formula">{`Net worth = Σ assets − Σ liabilities
Liquidity runway (yrs) = liquid assets ÷ (annual living costs + annual debt service)
Working share = (securities + retirement + rental + business) ÷ total assets
Leverage = Σ liabilities ÷ Σ assets`}</div>
          <Disclaimer>Classifications (liquid / working) are simplifications for teaching. Real valuations, marketability discounts, embedded tax on unrealised gains and lender consent requirements all change the picture and need professional input.</Disclaimer>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, red, gold, tag, tagTone }: { label: string; value: string; red?: boolean; gold?: boolean; tag?: string; tagTone?: 'green' }) {
  return (
    <div className="row between" style={{ padding: '5px 0', borderBottom: '1px solid var(--line)', fontSize: '0.86rem', flexWrap: 'nowrap' }}>
      <span style={{ color: gold ? 'var(--gold-2)' : 'var(--ivory-2)', display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>{tag && <Chip tone={tagTone}>{tag}</Chip>}</span>
      <span className="mono" style={{ color: red ? '#e7a398' : gold ? 'var(--gold-2)' : 'var(--ivory)', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

