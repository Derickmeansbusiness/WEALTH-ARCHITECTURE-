/**
 * Advanced Family Financing Map — Debt & Credit Studio tool.
 * Reuses the Structure Lab engine (StructureCanvas in cash-flow view) and the pure analysis functions.
 * Default export, no required props: the Debt Studio shell renders <FinancingMap /> at /debt-credit-studio/financing-map.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Structure, StructureEdge } from '@/types/structure';
import { useAppStore } from '@/store/useAppStore';
import { Disclaimer, EmptyState, Panel, SelectField, Chip, Tabs } from '@/components/ui';
import StructureCanvas from '@/modules/lab/StructureCanvas';
import { FAMILY_FINANCING } from '@/modules/lab/templates';
import { loanEdges, loanParties, labelOf, warnings } from '@/modules/lab/analysis';
import { VIEW_LEGENDS } from '@/modules/lab/views';
import LoanDetail from './financingMap/LoanDetail';
import { DualBalanceSheets, ConsolidatedView } from './financingMap/BalanceSheets';
import Flags from './financingMap/Flags';
import '@/modules/lab/lab.css';

interface Source { key: string; label: string; sub: string; structure: Structure; focusEdgeId?: string }

export default function FinancingMap() {
  const structures = useAppStore((s) => s.structures);
  const scenarios = useAppStore((s) => s.scenarios);
  const currentYear = new Date().getFullYear();

  const sources = useMemo<Source[]>(() => {
    const out: Source[] = [{ key: 'preset', label: 'Preset · Family Financing chain', sub: 'Trust → Holding → Investment Co. lends to Property Co. → property → rent → contractual repayment', structure: FAMILY_FINANCING }];
    for (const sc of scenarios.filter((s) => (s.kind === 'family-bank' || s.kind === 'leverage') && s.structureId)) {
      const st = structures.find((x) => x.id === sc.structureId);
      if (st && loanEdges(st).length) out.push({ key: `scenario:${sc.id}`, label: `Scenario · ${sc.name}`, sub: `${sc.kind === 'family-bank' ? 'Family Bank' : 'Leverage'} scenario linked to "${st.name}"`, structure: st, focusEdgeId: sc.edgeId });
    }
    for (const st of structures) if (loanEdges(st).length) out.push({ key: `structure:${st.id}`, label: `Saved · ${st.name}`, sub: `${loanEdges(st).length} loan${loanEdges(st).length === 1 ? '' : 's'} · ${st.nodes.length} components`, structure: st });
    return out;
  }, [structures, scenarios]);

  const [sourceKey, setSourceKey] = useState(sources[0].key);
  const source = sources.find((s) => s.key === sourceKey) ?? sources[0];
  const structure = source.structure;
  const loans = useMemo(() => loanEdges(structure).filter((e) => e.loan), [structure]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [elapsedOverride, setElapsedOverride] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<'detail' | 'sheets' | 'consolidated' | 'flags'>('detail');
  const [fitSignal, setFitSignal] = useState(0);

  useEffect(() => { setSelectedId(source.focusEdgeId ?? loans[0]?.id ?? null); setElapsedOverride({}); setFitSignal((x) => x + 1); }, [sourceKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const defaultElapsed = (e: StructureEdge) => Math.max(0, (currentYear - (e.loan?.originatedYear ?? currentYear)) * 12);
  const elapsedByEdge = useMemo(() => Object.fromEntries(loans.map((e) => [e.id, elapsedOverride[e.id] ?? defaultElapsed(e)])), [loans, elapsedOverride, currentYear]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedLoan = loans.find((e) => e.id === selectedId);
  const loanWarnings = useMemo(() => warnings(structure).filter((w) => ['undocumented-loan', 'related-party-unflagged', 'guarantee-bridge', 'loan-no-terms'].includes(w.code)), [structure]);
  const focusEdge = (id: string) => { setSelectedId(id); setTab('detail'); };
  const legend = VIEW_LEGENDS.cashflow;

  return (
    <div className="stack fm-root" style={{ gap: 18 }}>
      <div className="row between" style={{ alignItems: 'flex-end', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 260, maxWidth: 520 }}>
          <SelectField label="Financing structure" value={sourceKey} onChange={setSourceKey} options={sources.map((s) => ({ value: s.key, label: s.label }))} />
          <p className="tiny muted" style={{ margin: '4px 0 0' }}>{source.sub}</p>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <Chip tone="green">{loans.length} loan{loans.length === 1 ? '' : 's'}</Chip>
          {loanWarnings.length > 0 && <Chip tone="amber">{loanWarnings.length} loan warnings</Chip>}
          <Link to={`/lab?load=${structure.id}`} className="btn sm ghost" onClick={() => { if (!structures.some((s) => s.id === structure.id)) useAppStore.getState().saveStructure({ ...structure, id: structure.id }); }}>Edit in Structure Lab →</Link>
        </div>
      </div>

      <div className="fm-canvas">
        <StructureCanvas
          structure={structure}
          view="cashflow"
          readOnly
          selectedId={selectedId}
          onSelect={(id) => { if (id && loans.some((e) => e.id === id)) { setSelectedId(id); setTab('detail'); } else if (id === null) setSelectedId(selectedLoan?.id ?? null); }}
          highlightEdgeIds={loans.map((e) => e.id)}
          height={520}
          fitSignal={fitSignal}
          emptyState={<EmptyState title="No financing structure" body="Save a structure with a loan in the Structure Lab, or link a Family Bank / Leverage scenario to one." />}
        >
          <div className="lab-question">
            <div className="eyebrow" style={{ color: legend.accent }}>{legend.label} · loans emphasised</div>
            <div className="display">{legend.question}</div>
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              <span className="tiny muted row" style={{ gap: 5 }}><span style={{ width: 14, borderTop: '2px solid var(--green-2)' }} />capital advanced</span>
              <span className="tiny muted row" style={{ gap: 5 }}><span style={{ width: 14, borderTop: '2px solid var(--amber)' }} />debt service back to lender</span>
              <span className="tiny muted">click a loan edge for detail</span>
            </div>
          </div>
        </StructureCanvas>
      </div>

      <div className="row" style={{ gap: 6 }}>
        {loans.map((e) => <button key={e.id} className={`btn sm ${selectedId === e.id ? 'active' : 'ghost'}`} onClick={() => focusEdge(e.id)}>{labelOf(structure, loanParties(e).lenderId)} → {labelOf(structure, loanParties(e).borrowerId)}</button>)}
      </div>

      <Panel>
        <div className="row between" style={{ marginBottom: 14 }}>
          <Tabs size="sm" value={tab} onChange={setTab} tabs={[{ id: 'detail', label: 'Loan detail' }, { id: 'sheets', label: 'Dual balance sheets' }, { id: 'consolidated', label: 'Consolidated family view' }, { id: 'flags', label: 'Flags' }]} />
        </div>
        {tab === 'detail' && (selectedLoan ? <LoanDetail structure={structure} edge={selectedLoan} elapsedMonths={elapsedByEdge[selectedLoan.id]} onElapsed={(m) => setElapsedOverride((o) => ({ ...o, [selectedLoan.id]: m }))} currentYear={currentYear} /> : <EmptyState title="Select a loan" body="Click a green/amber loan edge on the map, or one of the loan buttons above." />)}
        {tab === 'sheets' && (selectedLoan ? <DualBalanceSheets structure={structure} edge={selectedLoan} elapsedByEdge={elapsedByEdge} /> : <EmptyState title="Select a loan" body="The dual balance sheets show one loan from both sides." />)}
        {tab === 'consolidated' && <ConsolidatedView structure={structure} elapsedByEdge={elapsedByEdge} />}
        {tab === 'flags' && <Flags structure={structure} onFocusEdge={focusEdge} />}
      </Panel>

      <div className="grid grid-2" style={{ gap: 12 }}>
        <Panel tight>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Reading the chain</div>
          <p className="small" style={{ margin: 0 }}>Capital does not leave the family: the trust owns the holding company, the holding company capitalises an investment company, the investment company lends to a property company at documented terms, the property company buys a building and rents it to the operating company, and the rent services the loan on schedule. Interest that would have gone to a bank accrues to the family lender — and is taxed to it as income. Nothing here reduces tax; it changes who earns the interest and who carries the risk.</p>
        </Panel>
        <Panel tight>
          <div className="eyebrow" style={{ marginBottom: 6 }}>What makes it hold</div>
          <p className="small" style={{ margin: 0 }}>Real terms (rate referenced to a market or statutory benchmark — in the US, the applicable federal rate under IRC §7872), real documents (note, security agreement, filings, resolutions), real payments actually made and recorded, and real separation (no commingling, no undocumented forgiveness). Loans that are not serviced become gifts in substance; guarantees and shared collateral quietly re-connect the balance sheets the structure separated.</p>
        </Panel>
      </div>
      <Disclaimer>Figures are illustrative and computed from the recorded terms with the shared finance engine. Related-party lending has income-tax, gift-tax, usury, licensing and fiduciary dimensions that vary by jurisdiction; professional legal and tax review is ordinarily required before any family loan is documented or funded.</Disclaimer>
    </div>
  );
}
