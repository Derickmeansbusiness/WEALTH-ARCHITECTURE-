import type { Structure, StructureEdge } from '@/types/structure';
import { Callout, useMoney } from '@/components/ui';
import { consolidate, holdings, labelOf, loanBalance, loanEdges, loanParties, nodeById, categoryOf, affiliated } from '@/modules/lab/analysis';

export function DualBalanceSheets({ structure, edge, elapsedByEdge }: { structure: Structure; edge: StructureEdge; elapsedByEdge: Record<string, number> }) {
  const fmt = useMoney();
  const { lenderId, borrowerId } = loanParties(edge);
  const bal = loanBalance(edge.loan!, elapsedByEdge[edge.id]);
  const side = (nodeId: string) => {
    const assets: { label: string; amount: number; hi?: boolean }[] = holdings(structure, nodeId).map((h) => { const n = nodeById(structure, h.nodeId); return n && n.value !== undefined && ['asset', 'instrument'].includes(categoryOf(n)) ? { label: `${n.label}${h.percent !== undefined && h.percent !== 100 ? ` (${h.percent}%)` : ''}`, amount: n.value * ((h.percent ?? 100) / 100) } : null; }).filter((x): x is { label: string; amount: number } => !!x);
    const liabilities: { label: string; amount: number; hi?: boolean }[] = [];
    for (const e of loanEdges(structure)) {
      if (!e.loan) continue;
      const p = loanParties(e); const b = loanBalance(e.loan, elapsedByEdge[e.id]);
      if (p.lenderId === nodeId) assets.push({ label: `Loan receivable — ${labelOf(structure, p.borrowerId)}`, amount: b, hi: e.id === edge.id });
      if (p.borrowerId === nodeId) liabilities.push({ label: `Loan payable — ${labelOf(structure, p.lenderId)}`, amount: b, hi: e.id === edge.id });
    }
    const ta = assets.reduce((a, x) => a + x.amount, 0), tl = liabilities.reduce((a, x) => a + x.amount, 0);
    return { assets, liabilities, ta, tl, equity: ta - tl };
  };
  const L = side(lenderId), B = side(borrowerId);
  const Sheet = ({ title, s, role }: { title: string; s: ReturnType<typeof side>; role: string }) => (
    <div className="panel tight fm-sheet">
      <div className="row between" style={{ marginBottom: 8 }}><div><div className="eyebrow">{role}</div><h4 style={{ margin: 0 }}>{title}</h4></div></div>
      <div className="fm-sheet-cols">
        <div>
          <div className="tiny muted" style={{ letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Assets</div>
          {s.assets.length === 0 && <div className="tiny muted">— no valued assets recorded</div>}
          {s.assets.map((a, i) => <div key={i} className={`fm-line ${a.hi ? 'hi' : ''}`}><span>{a.label}</span><span className="mono">{fmt(a.amount, { compact: true })}</span></div>)}
          <div className="fm-line total"><span>Total assets</span><span className="mono">{fmt(s.ta, { compact: true })}</span></div>
        </div>
        <div>
          <div className="tiny muted" style={{ letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Liabilities & equity</div>
          {s.liabilities.map((l, i) => <div key={i} className={`fm-line ${l.hi ? 'hi red' : ''}`}><span>{l.label}</span><span className="mono">{fmt(l.amount, { compact: true })}</span></div>)}
          <div className="fm-line"><span>Equity (residual)</span><span className="mono" style={{ color: s.equity < 0 ? 'var(--red)' : 'var(--green-2)' }}>{fmt(s.equity, { compact: true })}</span></div>
          <div className="fm-line total"><span>Total</span><span className="mono">{fmt(s.ta, { compact: true })}</span></div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div>
        <div className="eyebrow">Dual balance sheets</div>
        <p className="small" style={{ margin: '4px 0 0' }}>The same {fmt(bal, { compact: true })} appears twice: as an <strong>asset</strong> of {labelOf(structure, lenderId)} and as a <strong>liability</strong> of {labelOf(structure, borrowerId)}. That is not a trick — it is what a loan is. Each entity's books must show it, each must respect it, and the family's consolidated view must eliminate it.</p>
      </div>
      <div className="grid grid-2" style={{ gap: 12 }}>
        <Sheet title={labelOf(structure, lenderId)} s={L} role="Lender" />
        <Sheet title={labelOf(structure, borrowerId)} s={B} role="Borrower" />
      </div>
    </div>
  );
}

export function ConsolidatedView({ structure, elapsedByEdge }: { structure: Structure; elapsedByEdge: Record<string, number> }) {
  const fmt = useMoney();
  const c = consolidate(structure, elapsedByEdge);
  const external = loanEdges(structure).filter((e) => e.loan && !affiliated(structure, loanParties(e).lenderId, loanParties(e).borrowerId));
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div>
        <div className="eyebrow">Consolidated family view</div>
        <p className="small" style={{ margin: '4px 0 0' }}>Add every entity's balance sheet together and the family looks richer and more indebted than it is: each intercompany loan is counted once as an asset and once as a liability. Consolidation eliminates those pairs. Equity does not change — only the gross numbers do.</p>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Line</th><th className="num">Gross (sum of entities)</th><th className="num">Eliminations</th><th className="num">Consolidated</th></tr></thead>
          <tbody>
            <tr><td>Assets</td><td className="num">{fmt(c.grossAssets, { compact: true })}</td><td className="num red">−{fmt(c.eliminated, { compact: true })}</td><td className="num">{fmt(c.netAssets, { compact: true })}</td></tr>
            <tr><td>Liabilities</td><td className="num">{fmt(c.grossLiabilities, { compact: true })}</td><td className="num red">−{fmt(c.eliminated, { compact: true })}</td><td className="num">{fmt(c.netLiabilities, { compact: true })}</td></tr>
            <tr><td><strong>Equity</strong></td><td className="num">{fmt(c.grossAssets - c.grossLiabilities, { compact: true })}</td><td className="num muted">0</td><td className="num"><strong>{fmt(c.netEquity, { compact: true })}</strong></td></tr>
          </tbody>
        </table>
      </div>
      <div className="grid grid-2" style={{ gap: 12 }}>
        <div className="panel tight">
          <div className="eyebrow" style={{ marginBottom: 6 }}>Eliminated intercompany loans ({c.eliminations.length})</div>
          {c.eliminations.length === 0 && <p className="small muted" style={{ margin: 0 }}>No intercompany loans in this structure.</p>}
          {c.eliminations.map((e) => <div key={e.edgeId} className="fm-line"><span>{labelOf(structure, e.lenderId)} → {labelOf(structure, e.borrowerId)}</span><span className="mono red">−{fmt(e.amount, { compact: true })}</span></div>)}
        </div>
        <div className="panel tight">
          <div className="eyebrow" style={{ marginBottom: 6 }}>External debt (stays on the consolidated sheet)</div>
          {external.length === 0 && <p className="small muted" style={{ margin: 0 }}>None — every loan here is family-to-family. The family as a whole owes nobody; individual entities owe each other.</p>}
          {external.map((e) => <div key={e.id} className="fm-line"><span>{labelOf(structure, loanParties(e).lenderId)} → {labelOf(structure, loanParties(e).borrowerId)}</span><span className="mono">{fmt(loanBalance(e.loan!, elapsedByEdge[e.id]), { compact: true })}</span></div>)}
        </div>
      </div>
      <Callout tone="amber" title="Avoiding double counting">Family net worth is the consolidated equity, not the sum of entity assets. A family bank does not create wealth by lending — it relocates liquidity and keeps the interest inside the family, taxable to the lender as earned. Any presentation that adds the lender's receivable and the borrower's purchased asset together is counting the same money twice.</Callout>
    </div>
  );
}
