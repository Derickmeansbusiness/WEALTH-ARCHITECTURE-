import type { Structure } from '@/types/structure';
import { Callout, Chip, useMoney } from '@/components/ui';
import { crossCollateralization, labelOf, loanEdges, loanParties, nodeById, categoryOf, creditorReach } from '@/modules/lab/analysis';

export default function Flags({ structure, onFocusEdge }: { structure: Structure; onFocusEdge: (edgeId: string) => void }) {
  const fmt = useMoney();
  const guarantees = structure.edges.filter((e) => e.kind === 'guarantees');
  const termGuarantors = loanEdges(structure).filter((e) => e.loan?.guarantorId && !guarantees.some((g) => g.from === e.loan!.guarantorId && g.to === loanParties(e).borrowerId));
  const cross = crossCollateralization(structure);
  const total = guarantees.length + termGuarantors.length + cross.length;
  if (total === 0) return <Callout tone="green" title="No guarantees or cross-collateralization detected">Each loan stands on its own collateral and nobody outside the borrower is on the hook. That is the cleanest version of family lending — and the one most families drift away from one favour at a time.</Callout>;

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row" style={{ gap: 8 }}><div className="eyebrow">Flags</div><Chip tone="red">{total}</Chip></div>
      {guarantees.map((g) => {
        const guarantor = nodeById(structure, g.from); const borrower = nodeById(structure, g.to);
        const reach = creditorReach(structure, g.to);
        const extra = reach.reached.filter((id) => id !== g.to && id !== g.from).length;
        const loansOnBorrower = loanEdges(structure).filter((e) => loanParties(e).borrowerId === g.to && e.loan);
        const exposure = loansOnBorrower.reduce((a, e) => a + (e.loan?.principal ?? 0), 0);
        return (
          <Callout key={g.id} tone="danger" title={`Guarantee · ${guarantor?.label} stands behind ${borrower?.label}`}>
            <p className="small" style={{ margin: 0 }}>
              {guarantor && categoryOf(guarantor) === 'person' ? `A personal guarantee puts ${guarantor.label}'s own assets behind an entity's debt. ` : `An entity guarantee bridges two balance sheets that the structure was built to keep apart. `}
              If {borrower?.label} defaults, its lender{loansOnBorrower.length !== 1 ? 's' : ''} can pursue {guarantor?.label} directly{exposure ? ` for up to ${fmt(exposure, { compact: true })} of principal plus interest and costs` : ''}, and from there everything {guarantor?.label} owns{extra ? ` — ${extra} further node${extra === 1 ? '' : 's'} on this map` : ''}. Guarantees should be capped, carved-out, time-limited and reviewed every year; the liability view shows the path.
            </p>
            <div className="row" style={{ gap: 6, marginTop: 6 }}>{loansOnBorrower.map((e) => <button key={e.id} className="btn sm ghost" onClick={() => onFocusEdge(e.id)}>View loan: {labelOf(structure, loanParties(e).lenderId)} → {labelOf(structure, loanParties(e).borrowerId)}</button>)}</div>
          </Callout>
        );
      })}
      {termGuarantors.map((e) => (
        <Callout key={e.id} tone="danger" title={`Guarantor named in loan terms · ${labelOf(structure, e.loan!.guarantorId!)}`}>
          <p className="small" style={{ margin: 0 }}>The loan from {labelOf(structure, loanParties(e).lenderId)} to {labelOf(structure, loanParties(e).borrowerId)} names {labelOf(structure, e.loan!.guarantorId!)} as guarantor, but no GUARANTEES relationship is drawn. The exposure is real either way — draw it so the liability map tells the truth.</p>
          <button className="btn sm ghost" style={{ marginTop: 6 }} onClick={() => onFocusEdge(e.id)}>View loan</button>
        </Callout>
      ))}
      {cross.map((g) => (
        <Callout key={g.collateral} tone="danger" title={`Cross-collateralization · ${g.collateral} secures ${g.edgeIds.length} loans`}>
          <p className="small" style={{ margin: 0 }}>
            The same asset is pledged on more than one loan. Priority between the lenders is decided by filing or recording order, not by family intent; a default on either loan can trigger the other\'s covenants; and the junior lender\'s "security" may be worth nothing after the senior lender is paid. Inside a family this also means one entity\'s trouble travels to a sibling through the collateral rather than through ownership. Either release the second pledge, subordinate it in writing, or accept and document that the two loans are effectively one credit.
          </p>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>{g.edgeIds.map((id) => { const e = structure.edges.find((x) => x.id === id)!; return <button key={id} className="btn sm ghost" onClick={() => onFocusEdge(id)}>{labelOf(structure, loanParties(e).lenderId)} → {labelOf(structure, loanParties(e).borrowerId)} · {fmt(e.loan?.principal ?? 0, { compact: true })}</button>; })}</div>
        </Callout>
      ))}
    </div>
  );
}
