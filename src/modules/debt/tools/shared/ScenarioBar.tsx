/**
 * ScenarioBar — Save / Load / Compare / Export / Connect-to-Structure-Lab for every Debt Studio tool.
 * Saved scenarios live in the persisted app store (`scenarios`), keyed by `kind`.
 */
import { useMemo, useState } from 'react';
import { useAppStore, type SavedScenario } from '@/store/useAppStore';
import { Chip, EmptyState, Modal, TextField, SelectField } from '@/components/ui';
import { uid } from '@/lib/format';
import { RELATIONSHIP_META } from '@/types/structure';
import { buildMarkdown, downloadText, slug, type ReportSpec } from './report';

export interface CompareField { label: string; get: (data: unknown) => string }

export interface ScenarioBarProps {
  kind: SavedScenario['kind'];
  /** For kind 'other': only list scenarios whose data.tool === tag */
  tag?: string;
  defaultName: string;
  /** Current state to persist (JSON-serialisable) */
  data: unknown;
  report: () => ReportSpec;
  onLoad: (data: unknown, scenario: SavedScenario) => void;
  compareFields: CompareField[];
  /** Additional kinds this tool knows how to import (e.g. Stress-Test imports 'leverage') */
  importKinds?: SavedScenario['kind'][];
  onImport?: (scenario: SavedScenario) => void;
  /** Called with the saved scenario (lets a tool keep track of the saved id) */
  onSaved?: (scenario: SavedScenario) => void;
}

type Mode = null | 'save' | 'load' | 'compare' | 'connect';

const matchesTag = (s: SavedScenario, tag?: string) => {
  if (!tag) return true;
  const d = s.data as { tool?: string } | null;
  return !!d && typeof d === 'object' && d.tool === tag;
};

export default function ScenarioBar(props: ScenarioBarProps) {
  const { kind, tag, defaultName, data, report, onLoad, compareFields, importKinds = [], onImport, onSaved } = props;
  const scenarios = useAppStore((s) => s.scenarios);
  const structures = useAppStore((s) => s.structures);
  const currency = useAppStore((s) => s.currency);
  const saveScenario = useAppStore((s) => s.saveScenario);
  const deleteScenario = useAppStore((s) => s.deleteScenario);

  const [mode, setMode] = useState<Mode>(null);
  const [name, setName] = useState(defaultName);
  const [picked, setPicked] = useState<string[]>([]);
  const [link, setLink] = useState<{ structureId: string; edgeId: string } | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const mine = useMemo(() => scenarios.filter((s) => s.kind === kind && matchesTag(s, tag)).sort((a, b) => b.createdAt - a.createdAt), [scenarios, kind, tag]);
  const importable = useMemo(() => scenarios.filter((s) => importKinds.includes(s.kind)).sort((a, b) => b.createdAt - a.createdAt), [scenarios, importKinds]);

  const linkedStructure = link ? structures.find((s) => s.id === link.structureId) : undefined;
  const linkedEdge = linkedStructure?.edges.find((e) => e.id === link?.edgeId);
  const nodeLabel = (id: string) => linkedStructure?.nodes.find((n) => n.id === id)?.label ?? id;

  const toast = (msg: string) => { setFlash(msg); window.setTimeout(() => setFlash(null), 2200); };

  const doSave = () => {
    const sc: SavedScenario = { id: uid(), kind, name: name.trim() || defaultName, data, createdAt: Date.now(), structureId: link?.structureId, edgeId: link?.edgeId };
    saveScenario(sc);
    setLastSavedId(sc.id);
    onSaved?.(sc);
    setMode(null);
    toast(`Saved "${sc.name}"`);
  };

  const doExport = () => {
    const spec = report();
    const md = buildMarkdown(spec, currency, name);
    downloadText(`${slug(spec.tool)}-${slug(name)}-${new Date().toISOString().slice(0, 10)}.md`, md);
    toast('Report downloaded (.md)');
  };

  const applyLinkToLastSaved = (l: { structureId: string; edgeId: string }) => {
    if (!lastSavedId) return;
    const sc = scenarios.find((s) => s.id === lastSavedId);
    if (!sc) return;
    saveScenario({ ...sc, structureId: l.structureId, edgeId: l.edgeId });
    toast('Link applied to last saved scenario');
  };

  const comparable = mine.filter((s) => picked.includes(s.id)).slice(0, 3);

  return (
    <>
      <div className="dt-scenariobar" role="toolbar" aria-label="Scenario actions">
        <span className="eyebrow" style={{ marginRight: 6 }}>Scenario</span>
        <button className="btn sm primary" onClick={() => { setName(defaultName); setMode('save'); }}>Save</button>
        <button className="btn sm" onClick={() => setMode('load')}>Load{mine.length + importable.length > 0 ? ` (${mine.length + importable.length})` : ''}</button>
        <button className="btn sm" onClick={() => { setPicked(mine.slice(0, 3).map((s) => s.id)); setMode('compare'); }} disabled={mine.length < 2} title={mine.length < 2 ? 'Save at least two scenarios to compare' : 'Compare up to 3 saved scenarios'}>Compare</button>
        <button className="btn sm" onClick={doExport}>Export report</button>
        <button className="btn sm ghost" onClick={() => setMode('connect')}>Connect to Structure Lab</button>
        <span className="spacer" />
        {linkedStructure && linkedEdge && <Chip tone="green" title="This link is stored with the next saved scenario">Linked · {linkedStructure.name} · {nodeLabel(linkedEdge.from)} → {nodeLabel(linkedEdge.to)}</Chip>}
        {flash && <Chip tone="gold">{flash}</Chip>}
      </div>

      <Modal open={mode === 'save'} onClose={() => setMode(null)} title="Save scenario">
        <div className="stack">
          <TextField label="Scenario name" value={name} onChange={setName} placeholder={defaultName} />
          {linkedStructure && linkedEdge && <p className="small muted">Will be linked to <strong>{linkedStructure.name}</strong>, edge {nodeLabel(linkedEdge.from)} → {nodeLabel(linkedEdge.to)} ({RELATIONSHIP_META[linkedEdge.kind].label}).</p>}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn sm ghost" onClick={() => setMode(null)}>Cancel</button>
            <button className="btn sm primary" onClick={doSave}>Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={mode === 'load'} onClose={() => setMode(null)} title="Load saved scenario">
        {mine.length === 0 && importable.length === 0 ? (
          <EmptyState title="No saved scenarios yet" body="Use Save to store the current inputs. Saved scenarios persist in this browser and can be compared, exported or shown on the Financing Map." />
        ) : (
          <div className="stack">
            {mine.length > 0 && (
              <div className="dt-scenario-list">
                {mine.map((s) => (
                  <div className="dt-scenario-row" key={s.id}>
                    <span className="name">{s.name}</span>
                    {s.structureId && <Chip tone="green">Linked</Chip>}
                    <span className="when">{new Date(s.createdAt).toLocaleString()}</span>
                    <button className="btn sm primary" onClick={() => { onLoad(s.data, s); setName(s.name); setMode(null); toast(`Loaded "${s.name}"`); }}>Load</button>
                    <button className="btn sm ghost danger" onClick={() => deleteScenario(s.id)} aria-label={`Delete ${s.name}`}>Delete</button>
                  </div>
                ))}
              </div>
            )}
            {importable.length > 0 && onImport && (
              <div>
                <div className="eyebrow" style={{ margin: '8px 0' }}>Import from other tools</div>
                <div className="dt-scenario-list">
                  {importable.map((s) => (
                    <div className="dt-scenario-row" key={s.id}>
                      <Chip tone="amber">{s.kind}</Chip>
                      <span className="name">{s.name}</span>
                      <span className="when">{new Date(s.createdAt).toLocaleString()}</span>
                      <button className="btn sm" onClick={() => { onImport(s); setMode(null); toast(`Imported "${s.name}"`); }}>Import</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={mode === 'compare'} onClose={() => setMode(null)} title="Compare saved scenarios" wide>
        {mine.length < 2 ? <EmptyState title="Save at least two scenarios to compare" /> : (
          <div className="stack">
            <div className="row" style={{ gap: 8 }}>
              {mine.map((s) => {
                const on = picked.includes(s.id);
                return <button key={s.id} className={`btn sm ${on ? 'active' : 'ghost'}`} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== s.id) : p.length >= 3 ? p : [...p, s.id]))}>{s.name}</button>;
              })}
              <span className="tiny muted">Pick up to 3</span>
            </div>
            {comparable.length < 2 ? <p className="small muted">Select two or three scenarios.</p> : (
              <div className="table-wrap">
                <table className="table dt-compare">
                  <thead><tr><th>Metric</th>{comparable.map((s) => <th key={s.id} className="num">{s.name}</th>)}</tr></thead>
                  <tbody>
                    {compareFields.map((f) => (
                      <tr key={f.label}><td>{f.label}</td>{comparable.map((s) => <td key={s.id} className="num">{safe(() => f.get(s.data))}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={mode === 'connect'} onClose={() => setMode(null)} title="Connect to Structure Lab">
        {structures.length === 0 ? (
          <EmptyState title="No structures saved" body="Build and save a structure in the Structure Lab first. Then pick a LENDS TO / BORROWS FROM edge here so the saved loan appears on the Financing Map." />
        ) : (
          <ConnectPicker structures={structures} value={link} onChange={setLink} onDone={() => setMode(null)} onApply={lastSavedId ? applyLinkToLastSaved : undefined} />
        )}
      </Modal>
    </>
  );
}

function safe(fn: () => string): string { try { return fn(); } catch { return '—'; } }

function ConnectPicker({ structures, value, onChange, onDone, onApply }: { structures: ReturnType<typeof useAppStore.getState>['structures']; value: { structureId: string; edgeId: string } | null; onChange: (v: { structureId: string; edgeId: string } | null) => void; onDone: () => void; onApply?: (l: { structureId: string; edgeId: string }) => void }) {
  const [structureId, setStructureId] = useState(value?.structureId ?? structures[0]?.id ?? '');
  const st = structures.find((s) => s.id === structureId);
  const edges = (st?.edges ?? []).filter((e) => e.kind === 'lends-to' || e.kind === 'borrows-from');
  const [edgeId, setEdgeId] = useState(value?.edgeId ?? edges[0]?.id ?? '');
  const label = (id: string) => st?.nodes.find((n) => n.id === id)?.label ?? id;
  return (
    <div className="stack">
      <p className="small muted">Pick the structure and the credit relationship this scenario models. The saved scenario stores the structure and edge ids so the Financing Map can display the loan terms on that edge.</p>
      <SelectField label="Structure" value={structureId} onChange={(v) => { setStructureId(v); const s = structures.find((x) => x.id === v); const e = (s?.edges ?? []).filter((x) => x.kind === 'lends-to' || x.kind === 'borrows-from'); setEdgeId(e[0]?.id ?? ''); }} options={structures.map((s) => ({ value: s.id, label: s.name }))} />
      {edges.length === 0 ? (
        <div className="callout amber small"><p>This structure has no LENDS TO / BORROWS FROM edges. Add a credit relationship in the Structure Lab first.</p></div>
      ) : (
        <SelectField label="Credit edge" value={edgeId} onChange={setEdgeId} options={edges.map((e) => ({ value: e.id, label: `${label(e.from)} ${RELATIONSHIP_META[e.kind].label} ${label(e.to)}${e.loan ? ' · has loan terms' : ''}` }))} />
      )}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn sm ghost" onClick={() => { onChange(null); onDone(); }}>Clear link</button>
        {onApply && <button className="btn sm" disabled={!edgeId} onClick={() => { onChange({ structureId, edgeId }); onApply({ structureId, edgeId }); onDone(); }}>Apply to last saved</button>}
        <button className="btn sm primary" disabled={!edgeId} onClick={() => { onChange({ structureId, edgeId }); onDone(); }}>Use for next save</button>
      </div>
    </div>
  );
}
