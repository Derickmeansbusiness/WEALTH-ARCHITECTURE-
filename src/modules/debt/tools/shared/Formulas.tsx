import { useState, type ReactNode } from 'react';

export interface FormulaItem { label: string; formula: string; note?: string }

/** Collapsible "Formulas & assumptions" panel. Every simulator shows its math. */
export default function Formulas({ items, assumptions, title = 'Formulas & assumptions', defaultOpen = false }: { items: FormulaItem[]; assumptions?: ReactNode[]; title?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel tight dt-formulas">
      <button className="dt-formulas-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="eyebrow">{title}</span>
        <span className="mono small muted">{open ? '− hide' : `+ ${items.length} formula${items.length === 1 ? '' : 's'}`}</span>
      </button>
      {open && (
        <div className="stack" style={{ gap: 12, marginTop: 14 }}>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Quantity</th><th>Formula</th><th>Note</th></tr></thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.label}>
                    <td style={{ whiteSpace: 'nowrap' }}>{f.label}</td>
                    <td className="mono small gold" style={{ whiteSpace: 'nowrap' }}>{f.formula}</td>
                    <td className="small muted">{f.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {assumptions && assumptions.length > 0 && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Assumptions</div>
              <ul className="small muted dt-assumptions">{assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
