import type { Structure, StructureNode, StructureEdge, ComponentKind, RelationshipKind, LoanTerms } from '@/types/structure';
import { COMPONENT_META, RELATIONSHIP_META } from '@/types/structure';
import { Chip, NumberField, SelectField, TextField, useMoney, Callout } from '@/components/ui';
import { pct } from '@/lib/format';
import { legalOwners, controllers, ultimateOwners, labelOf, isLoanEdge, loanParties, loanSummary, SECURITY_DOCS, affiliated, holdings } from './analysis';
import { CATEGORY_COLOR } from './views';

const KIND_OPTIONS = (Object.keys(COMPONENT_META) as ComponentKind[]).map((k) => ({ value: k, label: `${COMPONENT_META[k].label} (${COMPONENT_META[k].short})` }));
const REL_OPTIONS = (Object.keys(RELATIONSHIP_META) as RelationshipKind[]).map((k) => ({ value: k, label: RELATIONSHIP_META[k].label }));

export const DEFAULT_LOAN: LoanTerms = { principal: 500000, rate: 0.06, termMonths: 120, structure: 'amortizing', paymentFrequency: 'monthly', relatedParty: true, securityDocs: ['Promissory note'], originatedYear: new Date().getFullYear() };

export function NodeInspector({ structure, node, onChange, onDelete, readOnly }: { structure: Structure; node: StructureNode; onChange: (n: StructureNode) => void; onDelete: () => void; readOnly?: boolean }) {
  const fmt = useMoney();
  const meta = COMPONENT_META[node.kind];
  const owners = legalOwners(structure, node.id);
  const ctrl = controllers(structure, node.id);
  const ult = ultimateOwners(structure, node.id);
  const held = holdings(structure, node.id);
  return (
    <div className="lab-inspector stack" style={{ gap: 12 }}>
      <div className="row between">
        <Chip tone={meta.category === 'trust' ? 'violet' : meta.category === 'asset' ? 'green' : meta.category === 'instrument' ? 'amber' : 'gold'}>{meta.short} · {meta.category}</Chip>
        {!readOnly && <button className="btn sm danger" onClick={onDelete}>Delete</button>}
      </div>
      {readOnly ? <h4>{node.label}</h4> : <TextField label="Label" value={node.label} onChange={(v) => onChange({ ...node, label: v })} />}
      {!readOnly && <SelectField label="Component kind" value={node.kind} onChange={(k) => onChange({ ...node, kind: k })} options={KIND_OPTIONS} />}
      {!readOnly && <TextField label="Jurisdiction" value={node.jurisdiction ?? ''} placeholder="e.g. Wyoming · Jersey · UAE – DIFC" onChange={(v) => onChange({ ...node, jurisdiction: v || undefined })} />}
      {!readOnly && <NumberField label="Value / balance (USD)" value={node.value ?? 0} min={0} step={10000} prefix="$" onChange={(v) => onChange({ ...node, value: v || undefined })} hint="Illustrative. Drives node size in the Ownership view and the balance sheets." />}
      {!readOnly && <TextField label="Notes" value={node.notes ?? ''} multiline rows={2} onChange={(v) => onChange({ ...node, notes: v || undefined })} />}
      <div className="hairline" style={{ margin: '4px 0' }} />
      <div className="eyebrow">What the graph says</div>
      <dl className="lab-kv">
        <dt>Legal owners</dt><dd>{owners.length ? owners.map((o) => `${labelOf(structure, o.ownerId)}${o.percent !== undefined ? ` ${o.percent}%` : ''}`).join(', ') : meta.category === 'person' || meta.category === 'trust' ? 'n/a' : 'none recorded'}</dd>
        <dt>Ultimate owners</dt><dd>{ult.length ? ult.map((u) => `${labelOf(structure, u.ownerId)} ${pct(u.share, 0)}`).join(', ') : '—'}</dd>
        <dt>Controlled by</dt><dd>{ctrl.length ? ctrl.map((c) => `${labelOf(structure, c.controllerId)} (${RELATIONSHIP_META[c.via].label.toLowerCase()})`).join(', ') : 'nobody recorded'}</dd>
        <dt>Holds</dt><dd>{held.length ? held.map((h) => labelOf(structure, h.nodeId)).join(', ') : '—'}</dd>
        {node.value !== undefined && <><dt>Value</dt><dd>{fmt(node.value, { compact: true })}</dd></>}
      </dl>
      <p className="tiny muted" style={{ margin: 0 }}>Ownership and control are separate questions. A node that is owned by a trust and managed by a family member is the textbook separation; a node owned and controlled by the same person is the textbook exposure.</p>
    </div>
  );
}

export function EdgeInspector({ structure, edge, onChange, onDelete, readOnly }: { structure: Structure; edge: StructureEdge; onChange: (e: StructureEdge) => void; onDelete: () => void; readOnly?: boolean }) {
  const meta = RELATIONSHIP_META[edge.kind];
  const from = labelOf(structure, edge.from), to = labelOf(structure, edge.to);
  const isLoan = isLoanEdge(edge);
  const setKind = (k: RelationshipKind) => {
    const next: StructureEdge = { ...edge, kind: k };
    if (k !== 'owns') delete next.percent; else if (next.percent === undefined) next.percent = 100;
    if (['lends-to', 'borrows-from'].includes(k)) { if (!next.loan) next.loan = { ...DEFAULT_LOAN }; } else delete next.loan;
    onChange(next);
  };
  return (
    <div className="lab-inspector stack" style={{ gap: 12 }}>
      <div className="row between">
        <span className="chip" style={{ borderColor: meta.color, color: meta.color }}>{meta.label}</span>
        {!readOnly && <button className="btn sm danger" onClick={onDelete}>Delete</button>}
      </div>
      <div className="small"><strong>{from}</strong> <span className="muted">→</span> <strong>{to}</strong></div>
      <p className="tiny muted" style={{ margin: 0 }}>Appears on: {meta.maps.map((m) => m).join(', ')}</p>
      {!readOnly && <SelectField label="Relationship" value={edge.kind} onChange={setKind} options={REL_OPTIONS} />}
      {!readOnly && <TextField label="Label (optional)" value={edge.label ?? ''} placeholder="e.g. market rent · GP interest" onChange={(v) => onChange({ ...edge, label: v || undefined })} />}
      {edge.kind === 'owns' && !readOnly && <NumberField label="Ownership %" value={edge.percent ?? 0} min={0} max={100} step={1} suffix="%" onChange={(v) => onChange({ ...edge, percent: v })} hint="Percentages into one node should reconcile to 100%." />}
      {edge.kind === 'guarantees' && <Callout tone="danger" title="A guarantee bridges the liability fence">A creditor of {to} can pursue {from} directly. Treat every guarantee as a conscious decision: cap it, carve it out, let it burn off, and track it on the Liability view.</Callout>}
      {isLoan && <LoanEditor structure={structure} edge={edge} loan={edge.loan ?? DEFAULT_LOAN} onChange={(l) => onChange({ ...edge, loan: l })} readOnly={readOnly} />}
    </div>
  );
}

export function LoanEditor({ structure, edge, loan, onChange, readOnly }: { structure: Structure; edge: StructureEdge; loan: LoanTerms; onChange: (l: LoanTerms) => void; readOnly?: boolean }) {
  const fmt = useMoney();
  const { lenderId, borrowerId } = loanParties(edge);
  const sum = loanSummary(loan);
  const docs = loan.securityDocs ?? [];
  const toggleDoc = (d: string) => onChange({ ...loan, securityDocs: docs.includes(d) ? docs.filter((x) => x !== d) : [...docs, d] });
  const aff = affiliated(structure, lenderId, borrowerId);
  const nodeOptions = [{ value: '', label: '— none —' }, ...structure.nodes.filter((n) => n.id !== borrowerId).map((n) => ({ value: n.id, label: n.label }))];
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="hairline" style={{ margin: '2px 0' }} />
      <div className="eyebrow">Loan terms</div>
      <div className="small"><span className="muted">Lender</span> <strong>{labelOf(structure, lenderId)}</strong> · <span className="muted">Borrower</span> <strong>{labelOf(structure, borrowerId)}</strong></div>
      {!readOnly && (
        <>
          <NumberField label="Principal (USD)" value={loan.principal} min={0} step={10000} prefix="$" onChange={(v) => onChange({ ...loan, principal: v })} />
          <div className="grid grid-2" style={{ gap: 8 }}>
            <NumberField label="Annual rate" value={Math.round(loan.rate * 10000) / 100} min={0} max={30} step={0.05} suffix="%" onChange={(v) => onChange({ ...loan, rate: v / 100 })} />
            <NumberField label="Term (months)" value={loan.termMonths} min={1} max={480} step={12} onChange={(v) => onChange({ ...loan, termMonths: Math.max(1, Math.round(v)) })} />
          </div>
          <div className="grid grid-2" style={{ gap: 8 }}>
            <SelectField label="Structure" value={loan.structure} onChange={(v) => onChange({ ...loan, structure: v })} options={[{ value: 'amortizing', label: 'Amortizing' }, { value: 'interest-only', label: 'Interest-only' }, { value: 'balloon', label: 'Balloon' }]} />
            <SelectField label="Payments" value={loan.paymentFrequency} onChange={(v) => onChange({ ...loan, paymentFrequency: v })} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }, { value: 'annual', label: 'Annual' }]} />
          </div>
          {loan.structure === 'balloon' && <NumberField label="Balloon due (months)" value={loan.balloonMonths ?? Math.round(loan.termMonths / 2)} min={1} max={loan.termMonths} step={12} onChange={(v) => onChange({ ...loan, balloonMonths: Math.max(1, Math.round(v)) })} hint="Payments are sized over the full term; the remaining balance falls due here." />}
          <div className="grid grid-2" style={{ gap: 8 }}>
            <NumberField label="Originated (year)" value={loan.originatedYear ?? new Date().getFullYear()} min={1950} max={2100} onChange={(v) => onChange({ ...loan, originatedYear: Math.round(v) })} />
            <TextField label="Governing law" value={loan.jurisdiction ?? ''} placeholder="e.g. Nevada" onChange={(v) => onChange({ ...loan, jurisdiction: v || undefined })} />
          </div>
          <TextField label="Collateral" value={loan.collateral ?? ''} placeholder="Name an asset node, e.g. Commercial Building" onChange={(v) => onChange({ ...loan, collateral: v || undefined })} />
          <TextField label="Purpose" value={loan.purpose ?? ''} placeholder="What the money is for — productive use matters" onChange={(v) => onChange({ ...loan, purpose: v || undefined })} />
          <SelectField label="Guarantor" value={loan.guarantorId ?? ''} onChange={(v) => onChange({ ...loan, guarantorId: v || undefined })} options={nodeOptions} />
          <div className="field">
            <label>Security documentation</label>
            <div className="lab-doc-list">
              {SECURITY_DOCS.map((d) => <label key={d}><input type="checkbox" checked={docs.includes(d)} onChange={() => toggleDoc(d)} /> {d}</label>)}
            </div>
          </div>
          <label className="row" style={{ gap: 8, fontSize: '0.84rem', cursor: 'pointer' }}><input type="checkbox" checked={loan.relatedParty} onChange={(e) => onChange({ ...loan, relatedParty: e.target.checked })} style={{ accentColor: 'var(--gold)' }} /> Related-party loan {aff && !loan.relatedParty && <Chip tone="amber">affiliated — flag it</Chip>}</label>
        </>
      )}
      <div className="eyebrow" style={{ marginTop: 4 }}>Computed with @/lib/finance · buildLoan</div>
      <dl className="lab-kv">
        <dt>Periodic payment</dt><dd>{fmt(sum.periodicPayment)}</dd>
        <dt>Annual debt service</dt><dd>{fmt(sum.annualDebtService)}</dd>
        <dt>Total interest</dt><dd>{fmt(sum.totalInterest)}</dd>
        <dt>Total paid</dt><dd>{fmt(sum.totalPaid)}</dd>
        {sum.balloonBalance > 0 && <><dt>Balloon at maturity</dt><dd>{fmt(sum.balloonBalance)}</dd></>}
        <dt>Periods</dt><dd>{sum.totalPeriods} × {loan.paymentFrequency}</dd>
      </dl>
      {docs.length === 0 && <Callout tone="danger" title="Undocumented">No security documentation recorded. Undocumented intra-family debt is what gets recharacterized as a gift or a capital contribution.</Callout>}
      <p className="tiny muted" style={{ margin: 0 }}>Formula: payment = P·r·(1+r)ⁿ / ((1+r)ⁿ − 1) per period. For US related-party loans, compare the rate with the applicable federal rate (IRC §7872 below-market loan rules). Professional review is ordinarily required before any related-party loan is documented.</p>
    </div>
  );
}

export function colorFor(kind: ComponentKind) { return CATEGORY_COLOR[COMPONENT_META[kind].category]; }
