import { useMemo } from 'react';
import type { Structure, MapView } from '@/types/structure';
import { RELATIONSHIP_META } from '@/types/structure';
import { Chip, Disclaimer, SelectField, useMoney } from '@/components/ui';
import { pct } from '@/lib/format';
import { analyze, labelOf, type StructureWarning } from './analysis';
import { VIEW_LEGENDS } from './views';

export default function AnalysisPanel({ structure, view, creditorOriginId, deceasedId, onCreditorOrigin, onDeceased, onFocus }: {
  structure: Structure; view: MapView; creditorOriginId?: string; deceasedId?: string;
  onCreditorOrigin: (id: string) => void; onDeceased: (id: string) => void; onFocus: (id: string) => void;
}) {
  const fmt = useMoney();
  const a = useMemo(() => analyze(structure, { creditorOriginId, deceasedId }), [structure, creditorOriginId, deceasedId]);
  const nodeOptions = structure.nodes.map((n) => ({ value: n.id, label: n.label }));
  const reds = a.warnings.filter((w) => w.severity === 'red').length, ambers = a.warnings.filter((w) => w.severity === 'amber').length;
  const legend = VIEW_LEGENDS[view];

  if (!structure.nodes.length) return <p className="small muted">Add components and relationships; the analysis updates live.</p>;

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div>
        <div className="row between" style={{ marginBottom: 6 }}>
          <div className="eyebrow">Warnings</div>
          <div className="row" style={{ gap: 4 }}>{reds > 0 && <Chip tone="red">{reds} red</Chip>}{ambers > 0 && <Chip tone="amber">{ambers} amber</Chip>}{a.warnings.length === 0 && <Chip tone="green">clean</Chip>}</div>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          {a.warnings.length === 0 && <p className="small muted" style={{ margin: 0 }}>No structural warnings fired. That means the map is internally consistent — not that the structure is right for anyone.</p>}
          {a.warnings.map((w) => <WarningRow key={w.id} w={w} onFocus={onFocus} />)}
        </div>
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>This view · {legend.label}</div>
        <p className="small" style={{ margin: 0, color: 'var(--ivory-2)' }}>{legend.legend}</p>
      </div>

      {view === 'liability' && (
        <div className="stack" style={{ gap: 8 }}>
          <SelectField label="Claim arises at" value={creditorOriginId ?? ''} onChange={onCreditorOrigin} options={nodeOptions} />
          {a.reach && (
            <>
              <p className="small" style={{ margin: 0 }}>A creditor of <strong>{labelOf(structure, a.reach.originId)}</strong> can reach <strong>{a.reach.reached.length - 1}</strong> other node{a.reach.reached.length === 2 ? '' : 's'}{a.reach.guaranteeBreaches.length ? `, ${a.reach.guaranteeBreaches.length} of them only because of a guarantee` : ''}.</p>
              <ul className="lab-list">
                {a.reach.steps.slice(1).map((s) => <li key={s.nodeId}><button onClick={() => onFocus(s.nodeId)}>{labelOf(structure, s.nodeId)}</button><span className={`tiny ${s.throughGuarantee ? 'red' : 'muted'}`} style={{ textAlign: 'right', maxWidth: '60%' }}>{s.reason}</span></li>)}
                {a.reach.steps.length === 1 && <li><span className="green small">Contained. Nothing beyond the node itself is reachable on this map.</span></li>}
              </ul>
              <p className="tiny muted" style={{ margin: 0 }}>Model only. Real reach depends on charging-order statutes, veil-piercing doctrine, fraudulent-transfer look-backs, and whether the entity was actually run as a separate entity.</p>
            </>
          )}
        </div>
      )}

      {view === 'succession' && (
        <div className="stack" style={{ gap: 8 }}>
          <SelectField label="Death of" value={deceasedId ?? ''} onChange={onDeceased} options={nodeOptions} />
          {a.succession && (
            <>
              <Section title="Passes through the estate">{a.succession.estate.length ? a.succession.estate.map((e) => <li key={e.edgeId}><button onClick={() => onFocus(e.nodeId)}>{labelOf(structure, e.nodeId)}{e.percent !== undefined ? ` (${e.percent}%)` : ''}</button><span className="tiny muted">{treatmentLabel(e.treatment)}</span></li>) : <li><span className="small muted">Nothing held in their own name.</span></li>}</Section>
              <Section title="Who receives">{a.succession.receivers.length || a.succession.payouts.length ? <>{a.succession.payouts.map((p) => <li key={p.edgeId}><button onClick={() => onFocus(p.toId)}>{labelOf(structure, p.toId)}</button><span className="tiny green">death benefit from {labelOf(structure, p.policyId)}</span></li>)}{a.succession.receivers.map((r) => <li key={r.edgeId}><button onClick={() => onFocus(r.nodeId)}>{labelOf(structure, r.nodeId)}</button><span className="tiny muted">{r.what} · {labelOf(structure, r.fromId)}</span></li>)}</> : <li><span className="small muted">No beneficiaries recorded.</span></li>}</Section>
              <Section title="Roles that fall vacant">{a.succession.vacancies.length ? a.succession.vacancies.map((v) => <li key={v.edgeId}><button onClick={() => onFocus(v.nodeId)}>{labelOf(structure, v.nodeId)}</button><span className="tiny red">{RELATIONSHIP_META[v.role].label.toLowerCase()} — successor needed</span></li>) : <li><span className="small green">No roles depend on this person.</span></li>}</Section>
            </>
          )}
        </div>
      )}

      {view === 'cashflow' && (
        <Section title={`Cash flows (${a.cashFlows.length})`}>
          {a.cashFlows.length === 0 && <li><span className="small muted">No cash-moving relationships yet. Add distributions, loans, employment or management edges.</span></li>}
          {a.cashFlows.map((f) => <li key={f.id}><button onClick={() => onFocus(f.edgeId)}>{labelOf(structure, f.fromId)} → {labelOf(structure, f.toId)}</button><span className="tiny muted" style={{ textAlign: 'right' }}>{f.label}{f.annual ? ` · ${fmt(f.annual, { compact: true })}/yr` : f.oneOff ? ` · ${fmt(f.oneOff, { compact: true })}` : ''}</span></li>)}
        </Section>
      )}

      {(view === 'ownership' || view === 'control') && (
        <Section title={view === 'ownership' ? 'Ultimate economic owners' : 'Who decides'}>
          {structure.nodes.filter((n) => (view === 'ownership' ? a.nodes[n.id].ultimate.length > 0 : a.nodes[n.id].controllers.length > 0)).map((n) => (
            <li key={n.id}><button onClick={() => onFocus(n.id)}>{n.label}</button><span className="tiny muted" style={{ textAlign: 'right', maxWidth: '60%' }}>{view === 'ownership' ? a.nodes[n.id].ultimate.map((u) => `${labelOf(structure, u.ownerId)} ${pct(u.share, 0)}`).join(', ') : a.nodes[n.id].controllers.map((c) => `${labelOf(structure, c.controllerId)} (${RELATIONSHIP_META[c.via].label.toLowerCase()})`).join(', ')}</span></li>
          ))}
          {view === 'control' && structure.nodes.filter((n) => a.nodes[n.id].isPureOwner).length > 0 && <li><span className="small muted">Pure owners (own, decide nothing): {structure.nodes.filter((n) => a.nodes[n.id].isPureOwner).map((n) => n.label).join(', ')}</span></li>}
        </Section>
      )}

      {a.crossCollateral.length > 0 && <Section title="Cross-collateralization">{a.crossCollateral.map((g) => <li key={g.collateral}><span className="small red">{g.collateral}</span><span className="tiny muted">pledged on {g.edgeIds.length} loans</span></li>)}</Section>}

      <Disclaimer>This panel checks the internal logic of a diagram. It does not know the documents, the governing law, the tax residence of anyone involved or whether the entities were actually respected in practice. Professional legal and tax review is ordinarily required before any of this is implemented.</Disclaimer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className="eyebrow" style={{ marginBottom: 6 }}>{title}</div><ul className="lab-list">{children}</ul></div>;
}

function WarningRow({ w, onFocus }: { w: StructureWarning; onFocus: (id: string) => void }) {
  return (
    <div className={`lab-warning ${w.severity}`} onClick={() => { const id = w.edgeIds[0] ?? w.nodeIds[0]; if (id) onFocus(id); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') { const id = w.edgeIds[0] ?? w.nodeIds[0]; if (id) onFocus(id); } }}>
      <div className="t">{w.title}</div>
      <div className="d">{w.detail}</div>
    </div>
  );
}

function treatmentLabel(t: string) {
  return t === 'probate' ? 'probate / will' : t === 'trust-terms' ? 'trust terms (outside probate)' : t === 'beneficiary-designation' ? 'beneficiary designation' : 'operating / buy-sell agreement';
}
