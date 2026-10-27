import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Panel, SectionHeader, Chip, Disclaimer, Callout, Eyebrow, TextField, ObjectiveTags, ProgressBar, Modal, Stat } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { GOV_COMPONENTS } from './components';
import { buildCharterMarkdown, completion, parseDraft, CHARTER_NOTE_KEY, type CharterDraft } from './charter';
import GovernanceDiagram, { type Flow } from './GovernanceDiagram';
import './governance.css';

export default function GovernancePage() {
  const savedJson = useAppStore((s) => s.notes[CHARTER_NOTE_KEY]);
  const setNote = useAppStore((s) => s.setNote);
  const [sel, setSel] = useState(GOV_COMPONENTS[0].id);
  const [draft, setDraft] = useState<CharterDraft>(() => parseDraft(savedJson));
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [flow, setFlow] = useState<Flow | null>(null);

  // Reload if the persisted store hydrates after first render
  useEffect(() => { if (!dirty && savedJson) setDraft(parseDraft(savedJson)); }, [savedJson, dirty]);

  const comp = GOV_COMPONENTS.find((c) => c.id === sel)!;
  const idx = GOV_COMPONENTS.indexOf(comp);
  const done = useMemo(() => completion(draft), [draft]);
  const md = useMemo(() => buildCharterMarkdown(draft), [draft]);

  const setField = (cid: string, fid: string, v: string) => { setDirty(true); setDraft((d) => ({ ...d, [cid]: { ...(d[cid] ?? {}), [fid]: v } })); };
  const save = () => { setNote(CHARTER_NOTE_KEY, JSON.stringify(draft)); setDirty(false); setSavedAt(Date.now()); };
  const reload = () => { setDraft(parseDraft(useAppStore.getState().notes[CHARTER_NOTE_KEY])); setDirty(false); };
  const clear = () => { if (confirm('Clear the whole draft? This cannot be undone.')) { setDraft({}); setDirty(true); } };
  const download = () => {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${(draft.constitution?.familyName || 'family').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-governance-charter-draft.md`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="page container">
      <SectionHeader eyebrow="Knowledge · Family Governance Center" title="The human side of the architecture" lede="Entities and trusts hold capital. Governance decides what the family does with it, and whether the family is still a family in a hundred years. Ten components, each explained, each with a short form that assembles into a draft charter you can save, preview and export.">
        <ObjectiveTags objectives={['governance', 'succession', 'estate-planning']} />
      </SectionHeader>

      <Panel tight>
        <div className="row between">
          <div><Eyebrow>Governance architecture</Eyebrow><p className="small muted" style={{ margin: '4px 0 0' }}>Bodies and decision rights. Click a flow type to isolate it: who <strong>elects</strong>, who <strong>advises</strong>, who <strong>decides</strong>, who <strong>reports</strong>.</p></div>
          <Chip tone="gold">One common pattern, not the only one</Chip>
        </div>
        <div style={{ marginTop: 12 }}><GovernanceDiagram highlight={flow} onPick={setFlow} /></div>
        <p className="tiny muted" style={{ marginTop: 8 }}>Legal authority sits with the trustees, boards and managers named in binding documents. The assembly and council are legitimacy and voice; they work when the binding documents are drafted to listen to them (nomination rights, protector powers, consent rights), and they fail when they are not.</p>
      </Panel>

      <div className="gov-layout" style={{ marginTop: 18 }}>
        <nav className="gov-nav" aria-label="Governance components">
          {GOV_COMPONENTS.map((c, i) => (
            <button key={c.id} className={c.id === sel ? 'sel' : ''} onClick={() => setSel(c.id)} aria-current={c.id === sel}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>{c.short}
              <span className="fill" aria-hidden><span style={{ width: `${done.byComponent[c.id] * 100}%` }} /></span>
            </button>
          ))}
          <div style={{ marginTop: 12, padding: '0 6px' }}>
            <ProgressBar value={done.total ? done.filled / done.total : 0} tone="green" />
            <div className="tiny muted mono" style={{ marginTop: 6 }}>{done.filled}/{done.total} fields drafted</div>
          </div>
        </nav>

        <Panel className="gov-section fade-in" key={comp.id}>
          <div className="row between">
            <Eyebrow>Component {String(idx + 1).padStart(2, '0')} of 10</Eyebrow>
            <ObjectiveTags objectives={comp.objectives} />
          </div>
          <h3 style={{ margin: '8px 0 12px' }}>{comp.title}</h3>
          <h4>What it is</h4><p>{comp.what}</p>
          <h4>Why families adopt it</h4><p>{comp.why}</p>
          <h4>What a good one contains</h4><ul>{comp.contains.map((x) => <li key={x}>{x}</li>)}</ul>
          <h4>Common failure modes</h4><ul>{comp.failures.map((x) => <li key={x}>{x}</li>)}</ul>
          <h4>Sample clause language</h4>
          <div className="gov-clause">{comp.clause.replace(/^ILLUSTRATIVE:\s*/, '')}</div>
          <h4>Questions your family should answer</h4><ul>{comp.questions.map((x) => <li key={x}>{x}</li>)}</ul>
          <div className="row" style={{ marginTop: 18, gap: 8 }}>
            <button className="btn sm ghost" disabled={idx === 0} onClick={() => setSel(GOV_COMPONENTS[idx - 1].id)}>‹ Previous</button>
            <button className="btn sm" disabled={idx === GOV_COMPONENTS.length - 1} onClick={() => setSel(GOV_COMPONENTS[idx + 1].id)}>Next ›</button>
          </div>
        </Panel>

        <div className="gov-form stack">
          <Panel tight tone="gold">
            <div className="row between"><Eyebrow>Build your family's draft</Eyebrow><Chip tone={done.byComponent[comp.id] === 1 ? 'green' : 'amber'}>{Math.round(done.byComponent[comp.id] * 100)}%</Chip></div>
            <p className="tiny muted" style={{ margin: '4px 0 10px' }}>{comp.short} · a few fields. Leave blank what you do not know yet; blanks become "open questions" in the charter.</p>
            <div className="stack" style={{ gap: 10 }}>
              {comp.fields.map((f) => (
                <TextField key={f.id} label={f.label} value={draft[comp.id]?.[f.id] ?? ''} onChange={(v) => setField(comp.id, f.id, v)} placeholder={f.placeholder} multiline={f.multiline} rows={3} />
              ))}
            </div>
          </Panel>
          <Panel tight>
            <Eyebrow>Family Governance Charter (draft)</Eyebrow>
            <div className="row" style={{ gap: 6, marginTop: 10 }}>
              <button className="btn sm primary" onClick={save} disabled={!dirty}>Save locally</button>
              <button className="btn sm" onClick={() => setPreview(true)}>Preview</button>
              <button className="btn sm" onClick={download}>Export .md</button>
              <button className="btn sm ghost" onClick={reload} disabled={!dirty}>Reload saved</button>
              <button className="btn sm ghost danger" onClick={clear}>Clear</button>
            </div>
            <p className="tiny muted" style={{ marginTop: 10 }}>
              {dirty ? 'Unsaved changes.' : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}.` : savedJson ? 'Loaded from this browser.' : 'Nothing saved yet.'} Saved in this browser only (store key <code className="mono">governance-charter</code>). Nothing is uploaded.
            </p>
          </Panel>
        </div>
      </div>

      <section className="section">
        <SectionHeader eyebrow="Financial capital is not enough" title="Four capitals, one family" lede="Families that last treat money as the last of four balance sheets. The other three are harder to measure and easier to lose." />
        <div className="gov-capitals">
          {[
            { k: 'Human capital', d: 'The health, character, competence and purpose of each member. Education policy, employment policy and the distribution philosophy are its instruments.', tone: 'gold' as const },
            { k: 'Intellectual capital', d: 'What the family knows collectively: how the businesses work, how the structures work, the lessons of past mistakes. It dies with the founder unless it is taught.', tone: 'blue' as const },
            { k: 'Social capital', d: 'Trust among members, and the family\'s standing with its community, lenders, regulators and partners. Conflict resolution and philanthropy are its instruments.', tone: 'green' as const },
            { k: 'Financial capital', d: 'The balance sheet. The easiest to count and, on its own, the least predictive of whether a family stays together.', tone: 'violet' as const },
          ].map((c) => (
            <Panel key={c.k} tight><Chip tone={c.tone}>{c.k}</Chip><p className="small" style={{ margin: '10px 0 0' }}>{c.d}</p></Panel>
          ))}
        </div>
        <div className="grid grid-2" style={{ marginTop: 16 }}>
          <Panel tight tone="warn">
            <div className="row between"><Eyebrow>The "70% fail by the third generation" statistic</Eyebrow><Chip tone="amber">Practitioner survey, not causation</Chip></div>
            <div className="grid grid-3" style={{ gap: 8, margin: '12px 0' }}>
              <Stat label="Reported" value="70%" sub="of transitions 'failed'" tone="amber" />
              <Stat label="Attributed to" value="60%" sub="breakdown of trust & communication" />
              <Stat label="Attributed to" value="25%" sub="unprepared heirs" />
            </div>
            <p className="small">The figure comes from Roy Williams and Vic Preisser, <em>Preparing Heirs</em> (2003), based on a survey of roughly 3,250 families who had gone through a wealth transfer, as recalled by the authors' consulting practice. "Failure" was defined broadly (involuntary loss of control of assets). It is widely repeated as if it were a peer-reviewed finding about inheritance; it is not. The sample was self-selected, the definition is loose, and the folk saying "shirtsleeves to shirtsleeves in three generations" predates the data by a century. Treat it as what experienced practitioners observed, which is still worth hearing: when transitions fail, the cause reported is almost never the tax bill or the investment return. It is trust, communication and preparation.</p>
          </Panel>
          <Panel tight>
            <Eyebrow>How the components fit the architecture</Eyebrow>
            <p className="small" style={{ marginTop: 10 }}>The constitution and mission are the "why". The council and committees are the "who decides". The five policies (education, employment, distributions, conflict, succession) are the "how", and philanthropy is where the next generation practises all of it with real money. Beneath all of it sit the binding documents: trust deeds, operating agreements, shareholder agreements. Governance that is not wired into those documents is a wish.</p>
            <Callout tone="amber" title="Where a professional belongs"><p className="small">Making any of this binding (protector powers, nomination rights, arbitration clauses in trust deeds and operating agreements, foundation formation) is legal drafting in the relevant jurisdiction. See <Link to="/academy/family-governance">Chapter 14</Link> and <Link to="/academy/the-family-office">Chapter 15</Link>, and the <Link to="/timeline">100-Year Timeline</Link> for what happens without it.</p></Callout>
          </Panel>
        </div>
      </section>

      <Disclaimer>This center is educational. Sample clauses are illustrative and must be adapted and reviewed by counsel in the governing jurisdiction before use. A family charter is typically non-binding; binding effect requires provisions in trust instruments, company documents and shareholder agreements.</Disclaimer>

      <Modal open={preview} onClose={() => setPreview(false)} title="Family Governance Charter (draft) — preview" wide>
        <div className="row" style={{ gap: 6, marginBottom: 12 }}>
          <button className="btn sm" onClick={download}>Export .md</button>
          <button className="btn sm ghost" onClick={() => window.print()}>Print</button>
        </div>
        <div className="gov-preview">{renderMarkdown(md)}</div>
      </Modal>
    </div>
  );
}

/** Minimal Markdown renderer for the charter preview (headings, paragraphs, lists, hr, bold, italics). */
function renderMarkdown(md: string): ReactNode {
  const out: ReactNode[] = []; let list: string[] = []; let key = 0;
  const flush = () => { if (list.length) { out.push(<ul key={key++}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>); list = []; } };
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('- ')) { list.push(line.slice(2)); continue; }
    flush();
    if (!line.trim()) continue;
    if (line.startsWith('# ')) out.push(<h1 key={key++}>{line.slice(2)}</h1>);
    else if (line.startsWith('## ')) out.push(<h2 key={key++}>{line.slice(3)}</h2>);
    else if (line === '---') out.push(<hr key={key++} />);
    else out.push(<p key={key++}>{inline(line)}</p>);
  }
  flush();
  return out;
}
function inline(s: string): ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean);
  return parts.map((p, i) => p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith('_') && p.endsWith('_') && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : p);
}
