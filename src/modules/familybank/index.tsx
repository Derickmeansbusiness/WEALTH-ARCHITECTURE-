import { useEffect, useMemo, useState } from 'react';
import { Panel, Eyebrow, SectionHeader, Chip, Callout, Disclaimer, NumberField, SelectField, TextField, SliderField, Stat, Tabs, useMoney, EmptyState } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { buildLoan, annualize, type LoanStructure, type PaymentFrequency } from '@/lib/finance';
import { pct, uid } from '@/lib/format';
import type { LoanTerms } from '@/types/structure';
import { afrBand, AFR_BAND_LABEL, buildWarnings, exportSummary, type CollateralType } from './rules';
import './familybank.css';

type Fmt = ReturnType<typeof useMoney>;
const LENDERS = ['Family Trust', 'Family Holding Co', 'Investment Co', 'Parent', 'Grandparent', 'Family Bank LLC', 'custom'] as const;
const BORROWERS = ['Child', 'Operating Co', 'Property Co', 'Sibling', 'custom'] as const;
const PURPOSES = [
  { value: 'home purchase', label: 'Home purchase', asset: 'Residence' },
  { value: 'business startup', label: 'Business start-up', asset: 'Business equity' },
  { value: 'property acquisition', label: 'Property acquisition', asset: 'Investment property' },
  { value: 'education', label: 'Education', asset: 'Education (no balance-sheet asset)' },
  { value: 'debt consolidation', label: 'Debt consolidation', asset: 'Retired third-party debt' },
  { value: 'working capital', label: 'Working capital', asset: 'Working capital' },
];
const COLLATERAL: { value: CollateralType; label: string }[] = [
  { value: 'none', label: 'None (unsecured)' }, { value: 'real-estate', label: 'Real estate (mortgage / deed of trust)' }, { value: 'equipment', label: 'Equipment (UCC security interest)' },
  { value: 'securities', label: 'Securities (pledge / control agreement)' }, { value: 'business-interest', label: 'Business interest (pledge of membership units)' }, { value: 'personal-guarantee', label: 'Personal guarantee' },
];
const PAGE = 60;

interface State {
  lender: string; lenderCustom: string; borrower: string; borrowerCustom: string;
  principal: number; rate: number; termMonths: number; frequency: PaymentFrequency; structure: LoanStructure; amortizationMonths: number;
  collateralType: CollateralType; collateral: string; purpose: string; afr: number; jurisdiction: string;
}
const DEFAULT: State = {
  lender: 'Family Trust', lenderCustom: '', borrower: 'Child', borrowerCustom: '',
  principal: 250_000, rate: 0.045, termMonths: 120, frequency: 'monthly', structure: 'amortizing', amortizationMonths: 360,
  collateralType: 'real-estate', collateral: 'First-lien deed of trust on the residence acquired', purpose: 'home purchase', afr: 0.042, jurisdiction: '[State / country]',
};

export default function FamilyBankPage() {
  const fmt = useMoney();
  const saveScenario = useAppStore((s) => s.saveScenario);
  const structures = useAppStore((s) => s.structures);
  const allScenarios = useAppStore((s) => s.scenarios);
  const saved = useMemo(() => allScenarios.filter((x) => x.kind === 'family-bank'), [allScenarios]);
  const deleteScenario = useAppStore((s) => s.deleteScenario);

  const [st, setSt] = useState<State>(DEFAULT);
  const upd = (p: Partial<State>) => setSt((s) => ({ ...s, ...p }));
  const lenderName = st.lender === 'custom' ? (st.lenderCustom || 'Custom lender') : st.lender;
  const borrowerName = st.borrower === 'custom' ? (st.borrowerCustom || 'Custom borrower') : st.borrower;

  const summary = useMemo(() => buildLoan({ principal: Math.max(0, st.principal), annualRate: Math.max(0, st.rate), termMonths: Math.max(1, st.termMonths), structure: st.structure, frequency: st.frequency, amortizationMonths: st.structure === 'balloon' ? Math.max(st.termMonths, st.amortizationMonths) : undefined }), [st.principal, st.rate, st.termMonths, st.structure, st.frequency, st.amortizationMonths]);
  const annual = useMemo(() => annualize(summary.schedule, summary.periodsPerYear), [summary]);
  const warnings = useMemo(() => buildWarnings({ principal: st.principal, rate: st.rate, afr: st.afr, structure: st.structure, collateralType: st.collateralType, termMonths: st.termMonths, lender: lenderName, borrower: borrowerName }), [st, lenderName, borrowerName]);

  const [year, setYear] = useState(3);
  useEffect(() => { if (year > annual.length) setYear(annual.length); }, [annual.length, year]);
  const yr = Math.min(year, annual.length);
  const toDate = useMemo(() => {
    const slice = annual.slice(0, yr);
    return { interest: slice.reduce((s, r) => s + r.interest, 0), principal: slice.reduce((s, r) => s + r.principal, 0), payments: slice.reduce((s, r) => s + r.payment, 0), balance: yr === 0 ? st.principal : annual[yr - 1]?.balance ?? 0 };
  }, [annual, yr, st.principal]);

  // schedule view
  const [view, setView] = useState<'periodic' | 'annual'>('periodic');
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(summary.schedule.length / PAGE));
  useEffect(() => { if (page >= pages) setPage(0); }, [pages, page]);

  // save / connect / export
  const [name, setName] = useState('Family loan');
  const [structureId, setStructureId] = useState('');
  const [edgeId, setEdgeId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const structure = structures.find((s) => s.id === structureId);
  const loanEdges = structure ? structure.edges.filter((e) => e.kind === 'lends-to' || e.kind === 'borrows-from') : [];
  const nodeLabel = (id: string) => structure?.nodes.find((n) => n.id === id)?.label ?? id;

  const terms: LoanTerms = {
    principal: st.principal, rate: st.rate, termMonths: st.termMonths, structure: st.structure,
    balloonMonths: st.structure === 'amortizing' ? undefined : st.termMonths, paymentFrequency: st.frequency,
    collateral: st.collateralType === 'none' ? undefined : `${COLLATERAL.find((c) => c.value === st.collateralType)?.label}${st.collateral ? ` — ${st.collateral}` : ''}`,
    purpose: st.purpose, securityDocs: securityDocs(st.collateralType), relatedParty: true, originatedYear: new Date().getFullYear(), jurisdiction: st.jurisdiction,
  };
  const save = () => {
    saveScenario({
      id: uid(), kind: 'family-bank', name: name.trim() || 'Family loan', createdAt: Date.now(),
      structureId: structureId || undefined, edgeId: edgeId || undefined,
      data: { loan: terms, lender: lenderName, borrower: borrowerName, afr: st.afr, afrBand: afrBand(st.termMonths), collateralType: st.collateralType, periodicPayment: summary.periodicPayment, totalInterest: summary.totalInterest, balloonBalance: summary.balloonBalance, warnings: warnings.map((w) => w.id) },
    });
    setMsg(structureId && edgeId ? 'Saved and attached to your structure.' : 'Saved to your scenarios.');
    setTimeout(() => setMsg(null), 2600);
  };
  const exportFile = (ext: 'md' | 'txt') => {
    const text = exportSummary({ lender: lenderName, borrower: borrowerName, principal: st.principal, rate: st.rate, afr: st.afr, termMonths: st.termMonths, frequency: st.frequency, structure: st.structure, amortizationMonths: st.structure === 'balloon' ? st.amortizationMonths : undefined, collateralType: st.collateralType, collateral: st.collateral, purpose: st.purpose, summary, annual, warnings });
    const blob = new Blob([text], { type: ext === 'md' ? 'text/markdown' : 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `family-loan-${name.trim().replace(/\s+/g, '-').toLowerCase() || 'summary'}.${ext}`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  };
  const load = (data: unknown) => {
    const d = data as { loan?: LoanTerms; lender?: string; borrower?: string; afr?: number; collateralType?: CollateralType };
    if (!d?.loan) return;
    const l = d.loan;
    setSt((s) => ({
      ...s, principal: l.principal, rate: l.rate, termMonths: l.termMonths, structure: l.structure, frequency: l.paymentFrequency, purpose: l.purpose ?? s.purpose, jurisdiction: l.jurisdiction ?? s.jurisdiction,
      lender: (LENDERS as readonly string[]).includes(d.lender ?? '') ? d.lender! : 'custom', lenderCustom: (LENDERS as readonly string[]).includes(d.lender ?? '') ? '' : d.lender ?? '',
      borrower: (BORROWERS as readonly string[]).includes(d.borrower ?? '') ? d.borrower! : 'custom', borrowerCustom: (BORROWERS as readonly string[]).includes(d.borrower ?? '') ? '' : d.borrower ?? '',
      afr: d.afr ?? s.afr, collateralType: d.collateralType ?? s.collateralType, collateral: l.collateral?.split(' — ')[1] ?? '',
    }));
  };

  const purposeAsset = PURPOSES.find((p) => p.value === st.purpose)?.asset ?? 'Asset acquired';
  const band = afrBand(st.termMonths);

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Simulator · intra-family lending"
        title={<>Family Bank <span className="gold" style={{ fontStyle: 'italic', fontWeight: 400 }}>Simulator</span></>}
        lede="A family bank is only a bank if the loans are real: a written note, a market-tested rate, a schedule that is actually paid, security where an outside lender would demand it, and a lender who enforces. Build the loan here and see both balance sheets, the schedule, the note as it would read, and the warnings a professional would raise before anyone signs."
      />

      <div className="fb-layout">
        {/* INPUTS */}
        <Panel>
          <Eyebrow>Loan terms</Eyebrow>
          <div className="fb-inputs" style={{ marginTop: 10 }}>
            <SelectField label="Lender" value={st.lender} onChange={(v) => upd({ lender: v })} options={LENDERS.map((l) => ({ value: l, label: l === 'custom' ? 'Custom…' : l }))} />
            <SelectField label="Borrower" value={st.borrower} onChange={(v) => upd({ borrower: v })} options={BORROWERS.map((l) => ({ value: l, label: l === 'custom' ? 'Custom…' : l }))} />
            {st.lender === 'custom' && <TextField label="Lender name" value={st.lenderCustom} onChange={(v) => upd({ lenderCustom: v })} placeholder="e.g. Grandmother's Revocable Trust" />}
            {st.borrower === 'custom' && <TextField label="Borrower name" value={st.borrowerCustom} onChange={(v) => upd({ borrowerCustom: v })} placeholder="e.g. Niece" />}
            <NumberField label="Principal" value={st.principal} onChange={(v) => upd({ principal: v })} prefix="$" step={5000} min={0} />
            <NumberField label="Interest rate" value={Math.round(st.rate * 10000) / 100} onChange={(v) => upd({ rate: v / 100 })} suffix="% / yr" step={0.05} min={0} />
            <NumberField label="Term" value={st.termMonths} onChange={(v) => upd({ termMonths: Math.max(1, Math.round(v)) })} suffix="months" step={12} min={1} />
            <SelectField label="Payment frequency" value={st.frequency} onChange={(v) => upd({ frequency: v })} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }, { value: 'annual', label: 'Annual' }]} />
            <SelectField label="Structure" value={st.structure} onChange={(v) => upd({ structure: v })} options={[{ value: 'amortizing', label: 'Amortizing' }, { value: 'interest-only', label: 'Interest-only (principal at maturity)' }, { value: 'balloon', label: 'Balloon (payment on longer amortization)' }]} />
            {st.structure === 'balloon' && <NumberField label="Amortization horizon" value={st.amortizationMonths} onChange={(v) => upd({ amortizationMonths: Math.max(st.termMonths, Math.round(v)) })} suffix="months" step={12} min={st.termMonths} hint="Payment is sized as if the loan ran this long; the balance is due at the term." />}
            <div className="fb-group">Security & purpose</div>
            <SelectField label="Collateral type" value={st.collateralType} onChange={(v) => upd({ collateralType: v })} options={COLLATERAL} />
            <SelectField label="Purpose" value={st.purpose} onChange={(v) => upd({ purpose: v })} options={PURPOSES.map((p) => ({ value: p.value, label: p.label }))} />
            <div className="full"><TextField label="Collateral description" value={st.collateral} onChange={(v) => upd({ collateral: v })} placeholder="Describe the asset pledged, lien position, recording" /></div>
            <div className="full"><TextField label="Governing law" value={st.jurisdiction} onChange={(v) => upd({ jurisdiction: v })} placeholder="State / country whose law governs the note" /></div>
            <div className="fb-group">Applicable Federal Rate (for comparison)</div>
            <div className="full">
              <NumberField label={`Illustrative AFR · ${AFR_BAND_LABEL[band]}`} value={Math.round(st.afr * 10000) / 100} onChange={(v) => upd({ afr: v / 100 })} suffix="% / yr" step={0.01} min={0}
                hint={<>Look up the current AFR for this loan's term — short-term (≤ 3 years), mid-term (3–9 years) or long-term (&gt; 9 years) — in the IRS revenue ruling published for the month the loan is made, and match the compounding period to the payment frequency. The figure here is a placeholder you must replace.</>} />
            </div>
          </div>
          <div className="row between" style={{ marginTop: 10 }}>
            <Chip tone="amber">Not yet jurisdictionally verified</Chip>
            <button className="btn sm ghost" onClick={() => setSt(DEFAULT)}>Defaults</button>
          </div>
        </Panel>

        {/* RIGHT COLUMN: warnings, note, stats */}
        <div className="stack">
          <div className="fb-warn">
            {warnings.map((w) => <Callout key={w.id} tone={w.tone} title={w.title}><p style={{ margin: 0, fontSize: '0.88rem' }}>{w.body}</p></Callout>)}
          </div>
          <div className="grid grid-4" style={{ gap: 10 }}>
            <Stat label="Periodic payment" value={fmt(summary.periodicPayment)} sub={`${st.frequency} · ${summary.totalPeriods} payments`} tone="gold" />
            <Stat label="Total interest" value={fmt(summary.totalInterest)} sub={`${pct(summary.totalInterest / Math.max(1, st.principal), 1)} of principal`} />
            <Stat label="Total payments" value={fmt(summary.totalPaid)} />
            <Stat label="Due at maturity" value={fmt(summary.balloonBalance)} tone={summary.balloonBalance > 0 ? 'amber' : undefined} sub={summary.balloonBalance > 0 ? 'balloon / principal' : 'fully amortised'} />
          </div>
          <PromissoryNote st={st} lender={lenderName} borrower={borrowerName} summary={summary} fmt={fmt} />
        </div>
      </div>

      {/* CHART + BALANCE SHEETS */}
      <section className="section">
        <div className="fb-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <Panel>
            <Eyebrow>Balance and cumulative interest</Eyebrow>
            <LoanChart annual={annual} principal={st.principal} year={yr} onYear={setYear} fmt={fmt} />
            <div className="row" style={{ gap: 14, marginTop: 6 }}><span className="tiny" style={{ color: 'var(--gold-2)' }}>— outstanding principal</span><span className="tiny" style={{ color: 'var(--green-2)' }}>— cumulative interest</span></div>
          </Panel>
          <Panel>
            <div className="row between" style={{ marginBottom: 8 }}>
              <Eyebrow>Both balance sheets</Eyebrow>
              <span className="tiny muted">drag the year</span>
            </div>
            <SliderField label="Position after year" value={yr} onChange={(v) => setYear(Math.round(v))} min={0} max={annual.length} step={1} format={(v) => `Y${v}`} />
            <div className="fb-bs" style={{ marginTop: 12 }}>
              <div className="fb-bs-card">
                <div className="h"><span>{lenderName}</span><span className="tiny muted">lender</span></div>
                <div className="sec">Assets</div>
                <div className="r neg"><span>Cash (advanced, net of receipts)</span><span>{fmt(-st.principal + toDate.payments)}</span></div>
                <div className="r"><span>Note receivable</span><span>{fmt(toDate.balance)}</span></div>
                <div className="sec">Income to date</div>
                <div className="r"><span>Interest income</span><span>{fmt(toDate.interest)}</span></div>
                <div className="r tot"><span>Net position vs. day 0</span><span>{fmt(toDate.interest)}</span></div>
              </div>
              <div className="fb-bs-card">
                <div className="h"><span>{borrowerName}</span><span className="tiny muted">borrower</span></div>
                <div className="sec">Assets</div>
                <div className="r"><span>{purposeAsset}</span><span>{fmt(st.principal)}</span></div>
                <div className="r neg"><span>Cash paid to date</span><span>{fmt(-toDate.payments)}</span></div>
                <div className="sec">Liabilities</div>
                <div className="r"><span>Note payable</span><span>{fmt(toDate.balance)}</span></div>
                <div className="sec">Expense to date</div>
                <div className="r"><span>Interest expense</span><span>{fmt(toDate.interest)}</span></div>
                <div className="r tot"><span>Equity in the asset (principal repaid)</span><span>{fmt(toDate.principal)}</span></div>
              </div>
            </div>
            <p className="tiny muted" style={{ margin: '10px 0 0' }}>The asset is carried at cost; appreciation, depreciation and the tax treatment of the interest (income to the lender; deductible to the borrower only where the purpose qualifies) are not modelled.</p>
          </Panel>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="section">
        <Panel>
          <div className="row between" style={{ marginBottom: 10 }}>
            <div><Eyebrow>Amortization schedule</Eyebrow></div>
            <Tabs size="sm" value={view} onChange={setView} tabs={[{ id: 'periodic', label: `Periodic (${summary.schedule.length})` }, { id: 'annual', label: `Annual (${annual.length})` }]} />
          </div>
          {view === 'periodic' && summary.schedule.length > PAGE && (
            <div className="fb-pager" style={{ marginBottom: 8 }}>
              <button className="btn sm ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>◀</button>
              <span className="tiny mono muted">periods {page * PAGE + 1}–{Math.min(summary.schedule.length, (page + 1) * PAGE)} of {summary.schedule.length}</span>
              <button className="btn sm ghost" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}>▶</button>
            </div>
          )}
          <div className="table-wrap fb-sched">
            <table className="table">
              <thead><tr><th>{view === 'periodic' ? 'Period' : 'Year'}</th><th className="num">Payment</th><th className="num">Interest</th><th className="num">Principal</th><th className="num">Balance</th></tr></thead>
              <tbody>
                {view === 'annual'
                  ? annual.map((y) => <tr key={y.year}><td className="mono">Year {y.year}</td><td className="num">{fmt(y.payment, { decimals: 2 })}</td><td className="num">{fmt(y.interest, { decimals: 2 })}</td><td className="num">{fmt(y.principal, { decimals: 2 })}</td><td className="num">{fmt(y.balance, { decimals: 2 })}</td></tr>)
                  : summary.schedule.slice(page * PAGE, (page + 1) * PAGE).flatMap((r) => {
                    const rows = [<tr key={r.period}><td className="mono">{r.period}</td><td className="num">{fmt(r.payment, { decimals: 2 })}</td><td className="num">{fmt(r.interest, { decimals: 2 })}</td><td className="num">{fmt(r.principal, { decimals: 2 })}</td><td className="num">{fmt(r.balance, { decimals: 2 })}</td></tr>];
                    if (r.period % summary.periodsPerYear === 0 || r.period === summary.schedule.length) {
                      const y = annual[Math.ceil(r.period / summary.periodsPerYear) - 1];
                      if (y) rows.push(<tr key={`y${y.year}`} className="annual"><td>Year {y.year} subtotal</td><td className="num">{fmt(y.payment, { decimals: 2 })}</td><td className="num">{fmt(y.interest, { decimals: 2 })}</td><td className="num">{fmt(y.principal, { decimals: 2 })}</td><td className="num">{fmt(y.balance, { decimals: 2 })}</td></tr>);
                    }
                    return rows;
                  })}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      {/* SAVE / CONNECT / EXPORT */}
      <section className="section">
        <div className="grid grid-2" style={{ gap: 16 }}>
          <Panel>
            <Eyebrow>Save scenario</Eyebrow>
            <div className="row" style={{ gap: 8, alignItems: 'flex-end', marginTop: 10 }}>
              <div style={{ flex: 1, minWidth: 180 }}><TextField label="Name" value={name} onChange={setName} /></div>
              <button className="btn primary sm" onClick={save}>Save</button>
              <button className="btn sm" onClick={() => exportFile('md')}>Export .md</button>
              <button className="btn sm ghost" onClick={() => exportFile('txt')}>.txt</button>
            </div>
            {msg && <p className="tiny green" style={{ margin: '8px 0 0' }}>{msg}</p>}
            <p className="tiny muted" style={{ margin: '10px 0 0' }}>Saved with the shared <code className="mono">LoanTerms</code> shape so the Debt &amp; Credit Studio financing map can display it.</p>
            {saved.length > 0 && (
              <div className="stack" style={{ gap: 6, marginTop: 12 }}>
                <span className="tiny muted">Saved family-bank scenarios</span>
                {saved.map((s) => (
                  <div key={s.id} className="row between" style={{ gap: 8 }}>
                    <button className="btn sm ghost" onClick={() => load(s.data)}>↳ {s.name}{s.structureId ? ' · attached' : ''}</button>
                    <button className="btn sm ghost danger" onClick={() => deleteScenario(s.id)} aria-label={`Delete ${s.name}`}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel>
            <Eyebrow>Connect to Structure Lab</Eyebrow>
            {structures.length === 0 ? (
              <div style={{ marginTop: 10 }}><EmptyState title="No saved structures" body="Build and save a structure in the Structure Lab, draw a LENDS TO or BORROWS FROM edge, then attach this loan to it here." /></div>
            ) : (
              <div className="stack" style={{ gap: 10, marginTop: 10 }}>
                <SelectField label="Structure" value={structureId} onChange={(v) => { setStructureId(v); setEdgeId(''); }} options={[{ value: '', label: '— choose —' }, ...structures.map((s) => ({ value: s.id, label: s.name }))]} />
                {structure && (loanEdges.length === 0
                  ? <p className="small muted" style={{ margin: 0 }}>This structure has no lends-to / borrows-from edges yet.</p>
                  : <SelectField label="Loan edge" value={edgeId} onChange={setEdgeId} options={[{ value: '', label: '— choose —' }, ...loanEdges.map((e) => ({ value: e.id, label: `${nodeLabel(e.from)} ${e.kind === 'lends-to' ? '→ lends to →' : '→ borrows from →'} ${nodeLabel(e.to)}` }))]} />)}
                {structureId && edgeId && <Chip tone="green">Will attach on save</Chip>}
              </div>
            )}
          </Panel>
        </div>
        <div style={{ marginTop: 16 }}>
          <Disclaimer>The note and schedule are illustrations of how a bona fide intra-family loan is documented and behaves, not a template for use. Rates, the AFR, security law and the tax characterisation of forgone interest depend on jurisdiction, the relationship between the parties and current IRS guidance; a lawyer and tax adviser would ordinarily review before funding.</Disclaimer>
        </div>
      </section>
    </div>
  );
}

function securityDocs(c: CollateralType): string[] {
  const base = ['Promissory note', 'Lender resolution (board / trustee)', 'Payment schedule and ledger'];
  switch (c) {
    case 'real-estate': return [...base, 'Mortgage / deed of trust, recorded', 'Title search; lender named on hazard insurance'];
    case 'equipment': return [...base, 'Security agreement', 'UCC-1 financing statement filed'];
    case 'securities': return [...base, 'Pledge agreement', 'Account control agreement with custodian'];
    case 'business-interest': return [...base, 'Pledge of membership interests', 'Consent of other members under the operating agreement'];
    case 'personal-guarantee': return [...base, 'Guarantee agreement', 'Guarantor financial statement'];
    default: return base;
  }
}

function PromissoryNote({ st, lender, borrower, summary, fmt }: { st: State; lender: string; borrower: string; summary: ReturnType<typeof buildLoan>; fmt: Fmt }) {
  const freqWord = st.frequency === 'monthly' ? 'monthly' : st.frequency === 'quarterly' ? 'quarterly' : 'annual';
  const years = Math.round((st.termMonths / 12) * 10) / 10;
  const structureText = st.structure === 'amortizing'
    ? `in ${summary.totalPeriods} consecutive ${freqWord} installments of principal and interest of ${fmt(summary.periodicPayment, { decimals: 2 })} each, fully amortising the principal at maturity`
    : st.structure === 'interest-only'
      ? `in ${summary.totalPeriods} consecutive ${freqWord} installments of interest only of ${fmt(summary.periodicPayment, { decimals: 2 })} each, with the entire principal balance of ${fmt(st.principal)} due and payable at maturity`
      : `in ${summary.totalPeriods} consecutive ${freqWord} installments of ${fmt(summary.periodicPayment, { decimals: 2 })} each, calculated on a ${st.amortizationMonths}-month amortisation, with the remaining principal balance of approximately ${fmt(summary.balloonBalance)} due and payable in full at maturity`;
  const security = st.collateralType === 'none'
    ? 'This Note is unsecured.'
    : `This Note is secured by ${COLLATERAL.find((c) => c.value === st.collateralType)?.label.toLowerCase()}${st.collateral ? `: ${st.collateral}` : ''}, under a separate security instrument executed concurrently and, where applicable, recorded or filed.`;
  return (
    <div className="fb-note" aria-label="Promissory note illustration">
      <div className="fb-watermark">Educational illustration — not a legal instrument</div>
      <h3>Promissory Note</h3>
      <div className="fb-note-sub">{fmt(st.principal)} · {pct(st.rate, 2)} per annum · {years} years</div>
      <p>FOR VALUE RECEIVED, <span className="fb-term">{borrower}</span> ("Borrower") promises to pay to the order of <span className="fb-term">{lender}</span> ("Lender") the principal sum of <span className="fb-term">{fmt(st.principal)}</span>, together with interest on the unpaid principal balance at the fixed rate of <span className="fb-term">{pct(st.rate, 2)}</span> per annum, computed on the basis of {freqWord} compounding.</p>
      <div className="fb-clause"><b>Payment</b><p>Principal and interest shall be payable {structureText}. Payments are applied first to accrued interest, then to principal. Borrower may prepay in whole or in part without penalty.</p></div>
      <div className="fb-clause"><b>Maturity</b><p>All unpaid principal and accrued interest shall be due and payable {st.termMonths} months from the date of this Note (the "Maturity Date").</p></div>
      <div className="fb-clause"><b>Purpose</b><p>Proceeds shall be used solely for {st.purpose}.</p></div>
      <div className="fb-clause"><b>Security</b><p>{security}</p></div>
      <div className="fb-clause"><b>Default and acceleration</b><p>If any installment is not paid within thirty (30) days of its due date, or Borrower becomes insolvent, Lender may declare the entire unpaid balance immediately due and payable, and interest shall accrue on the unpaid balance at the stated rate plus two (2) percentage points until paid. Borrower shall pay Lender's reasonable costs of collection, including attorneys' fees.</p></div>
      <div className="fb-clause"><b>Governing law</b><p>This Note shall be governed by the laws of <span className="fb-term">{st.jurisdiction || '[State / country]'}</span>, without regard to conflict-of-laws principles. [Venue, waiver of presentment, notice and protest, and severability clauses as counsel advises.]</p></div>
      <div className="fb-sign">
        <div>Borrower · {borrower} · date</div>
        <div>Lender · {lender} · by its authorised signatory</div>
      </div>
    </div>
  );
}

function LoanChart({ annual, principal, year, onYear, fmt }: { annual: { year: number; interest: number; balance: number }[]; principal: number; year: number; onYear: (y: number) => void; fmt: Fmt }) {
  const W = 640, H = 260, PL = 64, PR = 16, PT = 12, PB = 26;
  const n = annual.length;
  const cum: number[] = [0]; annual.forEach((a) => cum.push(cum[cum.length - 1] + a.interest));
  const bal = [principal, ...annual.map((a) => a.balance)];
  const max = Math.max(1, principal, cum[cum.length - 1]);
  const x = (i: number) => PL + (i / Math.max(1, n)) * (W - PL - PR);
  const y = (v: number) => PT + (1 - v / max) * (H - PT - PB);
  const line = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const area = `${line(bal)} L ${x(n)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="fb-chart" role="img" aria-label="Loan balance and cumulative interest" style={{ cursor: 'crosshair' }} onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect(); const px = ((e.clientX - rect.left) / rect.width) * W;
      onYear(Math.max(0, Math.min(n, Math.round(((px - PL) / (W - PL - PR)) * n))));
    }}>
      {ticks.map((t) => <g key={t}><line x1={PL} x2={W - PR} y1={y(max * t)} y2={y(max * t)} className="gridline" /><text x={PL - 8} y={y(max * t) + 3} textAnchor="end">{fmt(max * t, { compact: true })}</text></g>)}
      <path d={area} fill="rgba(201,169,97,0.12)" />
      <path d={line(bal)} fill="none" stroke="var(--gold-2)" strokeWidth={1.8} />
      <path d={line(cum)} fill="none" stroke="var(--green-2)" strokeWidth={1.6} strokeDasharray="4 3" />
      <line x1={PL} x2={W - PR} y1={H - PB} y2={H - PB} className="axis" />
      {Array.from({ length: n + 1 }).filter((_, i) => n <= 12 || i % Math.ceil(n / 10) === 0).map((_, i, arr) => { const idx = n <= 12 ? i : i * Math.ceil(n / 10); return idx <= n ? <text key={idx} x={x(idx)} y={H - 8} textAnchor="middle">{idx}</text> : null; })}
      <line x1={x(year)} x2={x(year)} y1={PT} y2={H - PB} className="cursor" />
      <circle cx={x(year)} cy={y(bal[year] ?? 0)} r={3.5} fill="var(--gold-2)" />
      <circle cx={x(year)} cy={y(cum[year] ?? 0)} r={3.5} fill="var(--green-2)" />
    </svg>
  );
}
