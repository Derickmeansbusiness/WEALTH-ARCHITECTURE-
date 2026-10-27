/** Structure Lab — full-screen drag-and-drop wealth architecture designer at /lab. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Structure, StructureNode, StructureEdge, ComponentKind, RelationshipKind, MapView } from '@/types/structure';
import { COMPONENT_META, RELATIONSHIP_META, MAP_VIEWS } from '@/types/structure';
import { useAppStore } from '@/store/useAppStore';
import { Modal, TextField, Chip } from '@/components/ui';
import { uid } from '@/lib/format';
import StructureCanvas from './StructureCanvas';
import Palette from './Palette';
import { NodeInspector, EdgeInspector, DEFAULT_LOAN } from './Inspector';
import AnalysisPanel from './AnalysisPanel';
import { TEMPLATES, cloneStructure, emptyStructure } from './templates';
import { VIEW_LEGENDS } from './views';
import { defaultCreditorOrigin, defaultDeceased, warnings } from './analysis';
import { serializeCanvas, downloadText, slug } from './exportSvg';
import './lab.css';

type RightTab = 'inspector' | 'analysis' | 'legend';

function useHistory(initial: Structure | (() => Structure)) {
  const [present, setPresent] = useState<Structure>(initial);
  const past = useRef<Structure[]>([]);
  const future = useRef<Structure[]>([]);
  const [, bump] = useState(0);
  const commit = useCallback((next: Structure | ((s: Structure) => Structure)) => {
    setPresent((cur) => {
      const n = typeof next === 'function' ? next(cur) : next;
      if (n === cur) return cur;
      past.current = [...past.current.slice(-79), cur];
      future.current = [];
      return { ...n, updatedAt: Date.now() };
    });
  }, []);
  const replace = useCallback((next: Structure) => { past.current = []; future.current = []; setPresent(next); bump((x) => x + 1); }, []);
  const undo = useCallback(() => { setPresent((cur) => { const p = past.current.pop(); if (!p) return cur; future.current.push(cur); bump((x) => x + 1); return p; }); }, []);
  const redo = useCallback(() => { setPresent((cur) => { const f = future.current.pop(); if (!f) return cur; past.current.push(cur); bump((x) => x + 1); return f; }); }, []);
  return { present, commit, replace, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}

export default function StructureLab() {
  const [params, setParams] = useSearchParams();
  const structures = useAppStore((s) => s.structures);
  const saveStructure = useAppStore((s) => s.saveStructure);
  const deleteStructure = useAppStore((s) => s.deleteStructure);

  const { present: structure, commit, replace, undo, redo, canUndo, canRedo } = useHistory(() => {
    const load = params.get('load');
    const found = load ? useAppStore.getState().structures.find((s) => s.id === load) : undefined;
    return found ? cloneStructure(found, { id: found.id, createdAt: found.createdAt }) : cloneStructure(TEMPLATES[1], { id: `lab-${uid()}` });
  });

  const [view, setView] = useState<MapView>('ownership');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [armed, setArmed] = useState<ComponentKind | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [pending, setPending] = useState<{ from: string; to: string } | null>(null);
  const [deathEvent, setDeathEvent] = useState(false);
  const [creditorOrigin, setCreditorOrigin] = useState<string | undefined>();
  const [deceased, setDeceased] = useState<string | undefined>();
  const [tab, setTab] = useState<RightTab>('analysis');
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [menu, setMenu] = useState<'templates' | 'load' | 'export' | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [fitSignal, setFitSignal] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ?load= after mount (e.g. navigated from the Master Map while already on /lab)
  const loadedParam = useRef<string | null>(params.get('load'));
  useEffect(() => {
    const id = params.get('load');
    if (!id || id === loadedParam.current) return;
    loadedParam.current = id;
    const found = structures.find((s) => s.id === id);
    if (found) { replace(cloneStructure(found, { id: found.id, createdAt: found.createdAt })); setFitSignal((x) => x + 1); say(`Loaded "${found.name}"`); }
  }, [params, structures, replace]);

  const say = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(null), 2400); };

  const selectedNode = useMemo(() => structure.nodes.find((n) => n.id === selectedId), [structure, selectedId]);
  const selectedEdge = useMemo(() => structure.edges.find((e) => e.id === selectedId), [structure, selectedId]);
  const warnCount = useMemo(() => warnings(structure).filter((w) => w.severity !== 'info').length, [structure]);
  const creditorOriginId = creditorOrigin && structure.nodes.some((n) => n.id === creditorOrigin) ? creditorOrigin : defaultCreditorOrigin(structure);
  const deceasedId = deceased && structure.nodes.some((n) => n.id === deceased) ? deceased : defaultDeceased(structure);

  // ── Mutations ─────────────────────────────────────────────────────────
  const place = (kind: ComponentKind, x: number, y: number) => {
    const n: StructureNode = { id: `n-${uid()}`, kind, label: COMPONENT_META[kind].label, x, y };
    commit((s) => ({ ...s, nodes: [...s.nodes, n] }));
    setSelectedId(n.id); setArmed(null); setTab('inspector'); setRightOpen(true);
  };
  const updateNode = (n: StructureNode) => commit((s) => ({ ...s, nodes: s.nodes.map((x) => (x.id === n.id ? n : x)) }));
  const updateEdge = (e: StructureEdge) => commit((s) => ({ ...s, edges: s.edges.map((x) => (x.id === e.id ? e : x)) }));
  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    commit((s) => ({ ...s, nodes: s.nodes.filter((n) => n.id !== selectedId), edges: s.edges.filter((e) => e.id !== selectedId && e.from !== selectedId && e.to !== selectedId) }));
    setSelectedId(null);
  }, [selectedId, commit]);
  const addEdge = (from: string, to: string, kind: RelationshipKind) => {
    const e: StructureEdge = { id: `e-${uid()}`, from, to, kind };
    if (kind === 'owns') e.percent = 100;
    if (kind === 'lends-to' || kind === 'borrows-from') e.loan = { ...DEFAULT_LOAN };
    commit((s) => ({ ...s, edges: [...s.edges, e] }));
    setPending(null); setSelectedId(e.id); setTab('inspector'); setRightOpen(true);
    if (!RELATIONSHIP_META[kind].maps.includes(view)) say(`${RELATIONSHIP_META[kind].label} is shown on the ${RELATIONSHIP_META[kind].maps.map((m) => VIEW_LEGENDS[m].label).join(' / ')}`);
  };
  const onSelect = (id: string | null) => { setSelectedId(id); if (id) { setTab('inspector'); } };
  const focusId = (id: string) => { setSelectedId(id); setTab('inspector'); };

  // ── File ops ──────────────────────────────────────────────────────────
  const newStructure = () => { replace(emptyStructure(`lab-${uid()}`)); setSelectedId(null); setMenu(null); setFitSignal((x) => x + 1); };
  const loadTemplate = (t: Structure) => { replace(cloneStructure(t, { id: `lab-${uid()}` })); setSelectedId(null); setMenu(null); setFitSignal((x) => x + 1); say(`Template loaded: ${t.name}`); };
  const loadSaved = (s: Structure) => { replace(cloneStructure(s, { id: s.id, createdAt: s.createdAt })); setSelectedId(null); setMenu(null); setFitSignal((x) => x + 1); setParams({}, { replace: true }); say(`Loaded "${s.name}"`); };
  const save = () => { const name = saveName.trim() || structure.name || 'Untitled architecture'; const next = { ...structure, name, updatedAt: Date.now() }; saveStructure(next); replace(next); setSaveOpen(false); say(`Saved "${name}"`); };
  const exportJson = () => { downloadText(`${slug(structure.name)}.json`, JSON.stringify(structure, null, 2), 'application/json'); setMenu(null); };
  const exportSvg = () => { if (svgRef.current) downloadText(`${slug(structure.name)}-${view}.svg`, serializeCanvas(svgRef.current, `${structure.name} · ${VIEW_LEGENDS[view].label}`), 'image/svg+xml'); setMenu(null); };
  const importJson = (file: File) => {
    file.text().then((txt) => {
      try {
        const parsed = JSON.parse(txt) as Partial<Structure>;
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error('Not a structure file');
        const ids = new Set(parsed.nodes.map((n) => n.id));
        const nodes = parsed.nodes.filter((n) => n && COMPONENT_META[n.kind] && typeof n.x === 'number' && typeof n.y === 'number');
        const edges = parsed.edges.filter((e) => e && RELATIONSHIP_META[e.kind] && ids.has(e.from) && ids.has(e.to));
        replace({ id: `lab-${uid()}`, name: parsed.name || file.name.replace(/\.json$/i, ''), description: parsed.description, nodes, edges, createdAt: Date.now(), updatedAt: Date.now() });
        setFitSignal((x) => x + 1); say(`Imported ${nodes.length} nodes, ${edges.length} relationships`);
      } catch (err) { say(`Import failed: ${(err as Error).message}`); }
    });
  };

  // ── Keyboard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable;
      if (e.key === 'Escape') { setArmed(null); setConnectMode(false); setPending(null); setMenu(null); return; }
      if (typing) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSelected(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) setConnectMode((c) => !c);
      if (/^[1-5]$/.test(e.key)) setView(MAP_VIEWS[Number(e.key) - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [removeSelected, undo, redo]);

  const legend = VIEW_LEGENDS[view];

  return (
    <div className="lab-root" onClick={() => { if (menu) setMenu(null); }}>
      {/* LEFT — palette */}
      <aside className={`lab-side left ${leftOpen ? 'open' : ''}`} aria-label="Component palette">
        <div className="lab-side-head"><div className="eyebrow">Components</div><button className="btn sm ghost" style={{ display: 'none' }} id="lab-close-left" onClick={() => setLeftOpen(false)}>Close</button></div>
        <div className="lab-side-body"><Palette armed={armed} onArm={(k) => { setArmed(k); setConnectMode(false); if (k) setLeftOpen(false); }} /></div>
      </aside>

      {/* CENTER — toolbar + canvas */}
      <section className="lab-main">
        <div className="lab-toolbar" onClick={(e) => e.stopPropagation()}>
          <input className="lab-name" value={structure.name} onChange={(e) => commit({ ...structure, name: e.target.value })} aria-label="Structure name" />
          <span className="sep" />
          <button className="btn sm ghost" onClick={newStructure}>New</button>
          <div className="lab-menu-wrap">
            <button className={`btn sm ${menu === 'templates' ? 'active' : 'ghost'}`} onClick={() => setMenu(menu === 'templates' ? null : 'templates')}>Templates ▾</button>
            {menu === 'templates' && (
              <div className="lab-menu">
                {TEMPLATES.map((t) => <button key={t.id} className="lab-menu-item" onClick={() => loadTemplate(t)}><span>{t.name}</span><span className="sub">{t.nodes.length} components · {t.edges.length} relationships</span></button>)}
              </div>
            )}
          </div>
          <button className="btn sm ghost" onClick={() => { setSaveName(structure.name); setSaveOpen(true); }}>Save</button>
          <div className="lab-menu-wrap">
            <button className={`btn sm ${menu === 'load' ? 'active' : 'ghost'}`} onClick={() => setMenu(menu === 'load' ? null : 'load')}>Load ▾ {structures.length > 0 && <span className="tiny mono muted">{structures.length}</span>}</button>
            {menu === 'load' && (
              <div className="lab-menu">
                {structures.length === 0 && <div className="lab-menu-item"><span className="sub">No saved structures yet. Save this one, or open the Master Map and send it here.</span></div>}
                {structures.map((s) => (
                  <div key={s.id} className="lab-menu-row">
                    <button className="lab-menu-item" onClick={() => loadSaved(s)}><span>{s.name}</span><span className="sub">{s.nodes.length} components · saved {new Date(s.updatedAt).toLocaleDateString()}</span></button>
                    <button className="btn sm danger" onClick={() => { deleteStructure(s.id); say(`Deleted "${s.name}"`); }} aria-label={`Delete ${s.name}`}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="lab-menu-wrap">
            <button className={`btn sm ${menu === 'export' ? 'active' : 'ghost'}`} onClick={() => setMenu(menu === 'export' ? null : 'export')}>Export ▾</button>
            {menu === 'export' && (
              <div className="lab-menu">
                <button className="lab-menu-item" onClick={exportJson}><span>Export JSON</span><span className="sub">Portable structure file</span></button>
                <button className="lab-menu-item" onClick={exportSvg}><span>Export image (.svg)</span><span className="sub">Current view, as drawn</span></button>
                <button className="lab-menu-item" onClick={() => { fileRef.current?.click(); setMenu(null); }}><span>Import JSON…</span><span className="sub">Load a structure file</span></button>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }} />
          <span className="sep hide-sm" />
          <button className="btn sm ghost" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">↶</button>
          <button className="btn sm ghost" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">↷</button>
          <span className="sep" />
          <button className={`btn sm ${connectMode ? 'active' : 'ghost'}`} onClick={() => { setConnectMode((c) => !c); setArmed(null); }} title="Connect two nodes (C)">⟶ Connect</button>
          <button className="btn sm ghost hide-sm" onClick={removeSelected} disabled={!selectedId} title="Delete selection (Del)">Delete</button>
          <span style={{ flex: 1 }} />
          <span className="tiny muted hide-sm">{structure.nodes.length} components · {structure.edges.length} relationships</span>
          {warnCount > 0 && <button className="btn sm ghost" onClick={() => { setTab('analysis'); setRightOpen(true); }}><Chip tone="amber">{warnCount} warnings</Chip></button>}
        </div>

        <div className="lab-canvas-wrap">
          <StructureCanvas
            structure={structure}
            view={view}
            onChange={commit}
            selectedId={selectedId}
            onSelect={onSelect}
            placeKind={armed}
            onPlace={place}
            connectMode={connectMode}
            onConnect={(from, to) => setPending({ from, to })}
            deathEvent={deathEvent}
            deceasedId={deceasedId}
            creditorOriginId={creditorOriginId}
            fitSignal={fitSignal}
            svgRef={svgRef}
            emptyState={<div className="empty" style={{ border: 0 }}><div className="display" style={{ fontSize: '1.5rem', color: 'var(--ivory)' }}>An empty canvas</div><p className="small" style={{ marginTop: 8 }}>Drag a component from the palette, or load a template.</p><div className="row" style={{ justifyContent: 'center', marginTop: 12, gap: 6 }}>{TEMPLATES.slice(0, 3).map((t) => <button key={t.id} className="btn sm" onClick={() => loadTemplate(t)}>{t.name.split(':')[0]}</button>)}<button className="btn sm ghost" onClick={() => setLeftOpen(true)} id="lab-open-palette">Palette</button></div></div>}
          >
            <div className="lab-views">
              <div role="tablist" aria-label="Map view">
                {MAP_VIEWS.map((v, i) => <button key={v.id} role="tab" aria-selected={view === v.id} className={`btn sm ${view === v.id ? 'active' : 'ghost'}`} onClick={() => setView(v.id)} title={`${v.question} (${i + 1})`}>{v.label.replace(' Map', '')}</button>)}
              </div>
            </div>
            <div className="lab-question">
              <div className="eyebrow" style={{ color: legend.accent }}>{legend.label}</div>
              <div className="display">{legend.question}</div>
              <div className="row" style={{ gap: 8, marginTop: 6 }}>{legend.items.map((it) => <span key={it.label} className="tiny muted row" style={{ gap: 5 }}><span style={{ width: 14, height: 0, borderTop: `2px ${it.dashed ? 'dashed' : 'solid'} ${it.color}` }} />{it.label}</span>)}</div>
            </div>
            {view === 'succession' && (
              <div className="lab-view-controls">
                <label className="row" style={{ gap: 8, fontSize: '0.8rem', cursor: 'pointer' }}><input type="checkbox" checked={deathEvent} onChange={(e) => setDeathEvent(e.target.checked)} style={{ accentColor: 'var(--violet)' }} /> Death event{deceasedId ? `: ${structure.nodes.find((n) => n.id === deceasedId)?.label}` : ''}</label>
              </div>
            )}
            {view === 'liability' && creditorOriginId && (
              <div className="lab-view-controls">
                <label className="row" style={{ gap: 8, fontSize: '0.8rem' }}><span className="muted">Claim at</span><select className="input" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }} value={creditorOriginId} onChange={(e) => setCreditorOrigin(e.target.value)}>{structure.nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}</select></label>
              </div>
            )}
            <div className="lab-drawer-bar">
              <button className="btn sm" onClick={() => { setLeftOpen((o) => !o); setRightOpen(false); }}>Palette</button>
              <button className="btn sm" onClick={() => { setRightOpen((o) => !o); setLeftOpen(false); }}>{selectedId ? 'Inspector' : 'Analysis'}</button>
            </div>
            {toast && <div className="lab-toast">{toast}</div>}
            {pending && (
              <div className="lab-popover center" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Choose relationship">
                <div className="row between" style={{ marginBottom: 8 }}>
                  <div className="small"><strong>{structure.nodes.find((n) => n.id === pending.from)?.label}</strong> <span className="muted">→</span> <strong>{structure.nodes.find((n) => n.id === pending.to)?.label}</strong></div>
                  <button className="btn sm ghost" onClick={() => setPending(null)} aria-label="Cancel">✕</button>
                </div>
                <div className="lab-rel-grid">
                  {(Object.keys(RELATIONSHIP_META) as RelationshipKind[]).map((k) => <button key={k} onClick={() => addEdge(pending.from, pending.to, k)}><span className="sw" style={{ background: RELATIONSHIP_META[k].color }} />{RELATIONSHIP_META[k].label}</button>)}
                </div>
                <button className="btn sm ghost" style={{ marginTop: 8 }} onClick={() => setPending({ from: pending.to, to: pending.from })}>⇄ Reverse direction</button>
              </div>
            )}
          </StructureCanvas>
        </div>
      </section>

      {/* RIGHT — inspector / analysis / legend */}
      <aside className={`lab-side right ${rightOpen ? 'open' : ''}`} aria-label="Inspector and analysis">
        <div className="lab-side-head" style={{ padding: 0 }}>
          <div className="lab-tabs" style={{ flex: 1 }}>
            {(['inspector', 'analysis', 'legend'] as RightTab[]).map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
          </div>
        </div>
        <div className="lab-side-body">
          {tab === 'inspector' && (selectedNode ? <NodeInspector structure={structure} node={selectedNode} onChange={updateNode} onDelete={removeSelected} /> : selectedEdge ? <EdgeInspector structure={structure} edge={selectedEdge} onChange={updateEdge} onDelete={removeSelected} /> : <p className="small muted">Select a component or a relationship on the canvas. Drag from the small gold port on a node to connect it to another; or use Connect mode and tap two nodes.</p>)}
          {tab === 'analysis' && <AnalysisPanel structure={structure} view={view} creditorOriginId={creditorOriginId} deceasedId={deceasedId} onCreditorOrigin={setCreditorOrigin} onDeceased={setDeceased} onFocus={focusId} />}
          {tab === 'legend' && (
            <div className="stack" style={{ gap: 14 }}>
              {MAP_VIEWS.map((v) => { const l = VIEW_LEGENDS[v.id]; return (
                <div key={v.id} className={`panel tight ${view === v.id ? 'gold' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setView(v.id)}>
                  <div className="eyebrow" style={{ color: l.accent }}>{l.label}</div>
                  <div className="display" style={{ fontSize: '1.05rem', margin: '4px 0 6px' }}>{l.question}</div>
                  <p className="tiny muted" style={{ margin: 0 }}>{l.legend}</p>
                </div>
              ); })}
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Shortcuts</div>
                <p className="tiny muted" style={{ margin: 0 }}>1–5 switch views · C toggles Connect · Del removes · Esc cancels · Ctrl+Z / Ctrl+Shift+Z undo / redo · wheel zooms · drag the background to pan · double-click zooms in.</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title="Save structure">
        <TextField label="Name" value={saveName} onChange={setSaveName} placeholder="e.g. Our family — 2026 draft" />
        <p className="tiny muted">Saved in this browser (persisted locally). Saved structures with loans also appear in the Debt Studio financing map.</p>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}><button className="btn ghost" onClick={() => setSaveOpen(false)}>Cancel</button><button className="btn primary" onClick={save}>Save</button></div>
      </Modal>
    </div>
  );
}
