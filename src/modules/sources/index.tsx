import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SourceRecord, SourceCategory, EvidenceLevel, Topic } from '@/types/knowledge';
import { SOURCE_CATEGORY_LABELS, TOPIC_LABELS } from '@/types/knowledge';
import { SEED_SOURCES, SOURCE_CATEGORY_ORDER, EVIDENCE_META, EVIDENCE_ORDER } from '@/content/sources/seed';
import { CHAPTERS } from '@/content/chapters/manifest';
import { useAppStore } from '@/store/useAppStore';
import { uid } from '@/lib/format';
import { Chip, Disclaimer, EmptyState, Eyebrow, Modal, Panel, SectionHeader, SelectField, TextField, Callout } from '@/components/ui';
import { EMPTY_FILTERS, filterSources, lessonLink, parseImport, sortSources, toCSV, toJSON, validateSource, type VaultFilters, type VaultSort } from './vault';
import './sources.css';

export function EvidenceChip({ level }: { level: EvidenceLevel }) {
  const m = EVIDENCE_META[level];
  return <Chip tone={m.tone} title={m.desc}><span className="dot" />{m.label}</Chip>;
}

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const BLANK: Omit<SourceRecord, 'id' | 'createdAt'> = { title: '', author: '', date: '', jurisdiction: '', topic: 'tax', category: 'primary-law', claim: '', summary: '', evidenceLevel: 'unverified', lessonId: 'ch01', url: '', notes: '', lastReviewed: '' };

export default function SourceVault() {
  const userSources = useAppStore((s) => s.sources);
  const addSource = useAppStore((s) => s.addSource);
  const updateSource = useAppStore((s) => s.updateSource);
  const deleteSource = useAppStore((s) => s.deleteSource);

  const all = useMemo(() => [...userSources, ...SEED_SOURCES], [userSources]);
  const seedIds = useMemo(() => new Set(SEED_SOURCES.map((s) => s.id)), []);
  const isUser = (s: SourceRecord) => !seedIds.has(s.id);

  const [filters, setFilters] = useState<VaultFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<VaultSort>('evidence');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SourceRecord | null>(null);
  const [form, setForm] = useState<Omit<SourceRecord, 'id' | 'createdAt'>>(BLANK);
  const [errors, setErrors] = useState<string[]>([]);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof VaultFilters>(k: K, v: VaultFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));
  const results = useMemo(() => sortSources(filterSources(all, filters), sort), [all, filters, sort]);
  const selected = selectedId ? all.find((s) => s.id === selectedId) ?? null : null;

  const jurisdictions = useMemo(() => Array.from(new Set(all.map((s) => s.jurisdiction).filter(Boolean))).sort(), [all]);
  const lessons = useMemo(() => Array.from(new Set(all.map((s) => s.lessonId).filter(Boolean))).sort(), [all]);
  const evidenceCounts = useMemo(() => EVIDENCE_ORDER.map((e) => ({ e, n: results.filter((s) => s.evidenceLevel === e).length })), [results]);

  const openAdd = () => { setEditing(null); setForm(BLANK); setErrors([]); setFormOpen(true); };
  const openEdit = (s: SourceRecord) => { const { id: _id, createdAt: _c, ...rest } = s; setEditing(s); setForm({ ...rest, lastReviewed: rest.lastReviewed ?? '' }); setErrors([]); setFormOpen(true); };
  const save = () => {
    const errs = validateSource(form);
    if (errs.length) { setErrors(errs); return; }
    const rec: SourceRecord = { ...form, lastReviewed: form.lastReviewed || undefined, id: editing?.id ?? uid(), createdAt: editing?.createdAt ?? Date.now() };
    if (editing) updateSource(rec); else addSource(rec);
    setFormOpen(false); setSelectedId(rec.id);
  };
  const remove = (s: SourceRecord) => {
    if (!isUser(s)) return;
    if (window.confirm(`Delete "${s.title}" from your vault?`)) { deleteSource(s.id); if (selectedId === s.id) setSelectedId(null); }
  };
  const onImport = async (file: File) => {
    const text = await file.text();
    const { records, skipped, error } = parseImport(text, uid);
    if (error) { setImportMsg(error); return; }
    const existing = new Set(all.map((s) => s.id));
    let added = 0;
    for (const r of records) { if (existing.has(r.id)) { updateSource(r); } else { addSource(r); added++; } }
    setImportMsg(`Imported ${records.length} record${records.length === 1 ? '' : 's'} (${added} new, ${records.length - added} updated, ${skipped} skipped).`);
  };

  const topicOpts = [{ value: 'all' as const, label: 'All topics' }, ...(Object.keys(TOPIC_LABELS) as Topic[]).map((t) => ({ value: t, label: TOPIC_LABELS[t] }))];
  const catOpts = [{ value: 'all' as const, label: 'All categories' }, ...SOURCE_CATEGORY_ORDER.map((c) => ({ value: c, label: SOURCE_CATEGORY_LABELS[c] }))];
  const evOpts = [{ value: 'all' as const, label: 'All evidence levels' }, ...EVIDENCE_ORDER.map((e) => ({ value: e, label: EVIDENCE_META[e].label }))];
  const lessonLabel = (id: string) => lessonLink(id)?.label ?? id;
  const active = filters.q || filters.category !== 'all' || filters.topic !== 'all' || filters.evidence !== 'all' || filters.jurisdiction || filters.lesson;

  return (
    <div className="page container">
      <SectionHeader
        eyebrow={`Source Vault · ${SEED_SOURCES.length} curated · ${userSources.length} added by you`}
        title="Every lesson cites. Every citation is searchable."
        lede="Primary law, regulations, agency guidance, court decisions, professional research, books, family-office publications and media clips, each tagged with an evidence level so a Tax Court memorandum never carries the same weight as a thirty-second video."
      >
        <div className="sv-legend">
          {EVIDENCE_ORDER.map((e) => <span key={e} className="row" style={{ gap: 6 }}><EvidenceChip level={e} /><span>{EVIDENCE_META[e].desc}</span></span>)}
        </div>
      </SectionHeader>

      <Panel tight>
        <div className="sv-toolbar">
          <TextField label="Search title, author, claim, summary, notes" value={filters.q} onChange={(v) => set('q', v)} placeholder='e.g. "Lender Management", "§7872", "charging order"' />
          <SelectField label="Category" value={filters.category} onChange={(v) => set('category', v)} options={catOpts} />
          <SelectField label="Topic" value={filters.topic} onChange={(v) => set('topic', v)} options={topicOpts} />
          <SelectField label="Evidence level" value={filters.evidence} onChange={(v) => set('evidence', v)} options={evOpts} />
        </div>
        <div className="sv-toolbar-2">
          <SelectField label="Jurisdiction" value={filters.jurisdiction} onChange={(v) => set('jurisdiction', v)} options={[{ value: '', label: 'All jurisdictions' }, ...jurisdictions.map((j) => ({ value: j, label: j }))]} />
          <SelectField label="Lesson" value={filters.lesson} onChange={(v) => set('lesson', v)} options={[{ value: '', label: 'All lessons' }, ...lessons.map((l) => ({ value: l, label: lessonLabel(l) }))]} />
          <SelectField label="Sort" value={sort} onChange={setSort} options={[{ value: 'evidence', label: 'Evidence level (strongest first)' }, { value: 'date-desc', label: 'Date (newest first)' }, { value: 'date-asc', label: 'Date (oldest first)' }, { value: 'title', label: 'Title A–Z' }]} />
          <div className="row" style={{ gap: 6, alignSelf: 'end' }}>
            <button className="btn primary sm" onClick={openAdd}>+ Add source</button>
            <button className="btn sm ghost" onClick={() => download(`source-vault-${Date.now()}.json`, toJSON(all), 'application/json')}>Export JSON</button>
            <button className="btn sm ghost" onClick={() => download(`source-vault-${Date.now()}.csv`, toCSV(all), 'text/csv')}>Export CSV</button>
            <button className="btn sm ghost" onClick={() => fileRef.current?.click()}>Import JSON</button>
            <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''; }} />
          </div>
        </div>
        {importMsg && <div style={{ marginTop: 12 }}><Callout tone={importMsg.startsWith('Imported') ? 'green' : 'danger'}><p className="small" style={{ margin: 0 }}>{importMsg} <button className="btn sm ghost" style={{ marginLeft: 8 }} onClick={() => setImportMsg(null)}>Dismiss</button></p></Callout></div>}
      </Panel>

      <div className="row between" style={{ margin: '16px 0 12px' }}>
        <div className="sv-counts">
          <span className="small mono muted">{results.length} of {all.length} sources</span>
          {evidenceCounts.filter((c) => c.n > 0).map((c) => <Chip key={c.e} tone={EVIDENCE_META[c.e].tone}>{c.n} {EVIDENCE_META[c.e].label.toLowerCase()}</Chip>)}
        </div>
        {active && <button className="btn sm ghost" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>}
      </div>

      <div className="sv-layout">
        <div className="sv-list">
          {results.length === 0 ? (
            <EmptyState title="No sources match." body="Loosen a filter, or add the source you were looking for." action={<button className="btn primary" onClick={openAdd}>Add a source</button>} />
          ) : results.map((s) => (
            <button key={s.id} className={`sv-row ${selectedId === s.id ? 'active' : ''}`} onClick={() => setSelectedId(s.id)} aria-expanded={selectedId === s.id}>
              <span className={`bar ${EVIDENCE_META[s.evidenceLevel].tone}`} aria-hidden="true" />
              <span className="main">
                <span className="title">{s.title}</span>
                <span className="meta"><span>{s.author}</span><span className="mono">{s.date}</span><span>{s.jurisdiction}</span>{isUser(s) && <span className="gold">Added by you</span>}</span>
                <p className="claim">{s.claim}</p>
              </span>
              <span className="side">
                <EvidenceChip level={s.evidenceLevel} />
                <Chip>{SOURCE_CATEGORY_LABELS[s.category]}</Chip>
                <span className="tiny muted">{TOPIC_LABELS[s.topic]} · {lessonLabel(s.lessonId)}</span>
              </span>
            </button>
          ))}
        </div>

        <aside className="sv-drawer">
          {selected ? (
            <Panel>
              <div className="row between">
                <Eyebrow>Source detail</Eyebrow>
                <button className="btn sm ghost" onClick={() => setSelectedId(null)} aria-label="Close detail">✕</button>
              </div>
              <dl>
                <dt>Title</dt><dd className="title">{selected.title}</dd>
                <dt>Evidence</dt><dd><EvidenceChip level={selected.evidenceLevel} /> <span className="tiny muted">{EVIDENCE_META[selected.evidenceLevel].desc}</span></dd>
                <dt>Category</dt><dd>{SOURCE_CATEGORY_LABELS[selected.category]}</dd>
                <dt>Author</dt><dd>{selected.author || '—'}</dd>
                <dt>Date</dt><dd className="mono">{selected.date || '—'}</dd>
                <dt>Jurisdiction</dt><dd>{selected.jurisdiction || '—'}</dd>
                <dt>Topic</dt><dd>{TOPIC_LABELS[selected.topic]}</dd>
                <dt>Lesson</dt><dd>{(() => { const l = lessonLink(selected.lessonId); return l ? <Link to={l.to}>{l.label} →</Link> : <span className="muted">{selected.lessonId || '—'}</span>; })()}</dd>
                <dt>Claim</dt><dd>{selected.claim || '—'}</dd>
                <dt>Summary</dt><dd>{selected.summary || '—'}</dd>
                <dt>Notes</dt><dd>{selected.notes || '—'}</dd>
                <dt>URL</dt><dd>{selected.url ? <a href={selected.url} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all' }}>{selected.url}</a> : <span className="amber">URL to be verified</span>}</dd>
                <dt>Reviewed</dt><dd className="mono">{selected.lastReviewed ?? '—'}</dd>
              </dl>
              <div className="row" style={{ gap: 6, marginTop: 16 }}>
                {isUser(selected) ? (
                  <>
                    <button className="btn sm" onClick={() => openEdit(selected)}>Edit</button>
                    <button className="btn sm danger" onClick={() => remove(selected)}>Delete</button>
                  </>
                ) : <span className="tiny muted">Curated seed record. Add your own version to annotate it.</span>}
                <button className="btn sm ghost" onClick={() => download(`${selected.id}.json`, toJSON([selected]), 'application/json')}>Export</button>
              </div>
            </Panel>
          ) : (
            <Panel tight>
              <Eyebrow>Detail</Eyebrow>
              <p className="small muted" style={{ marginTop: 8 }}>Select a source to see its full record, lesson link and URL status. Sources you add can be edited or deleted here; curated records cannot.</p>
              <div className="hairline" style={{ margin: '14px 0' }} />
              <Eyebrow>Categories</Eyebrow>
              <div className="row" style={{ gap: 6, marginTop: 8 }}>
                {SOURCE_CATEGORY_ORDER.map((c) => <button key={c} className={`btn sm ${filters.category === c ? 'active' : 'ghost'}`} onClick={() => set('category', filters.category === c ? 'all' : c)}>{SOURCE_CATEGORY_LABELS[c]} <span className="mono muted">{all.filter((s) => s.category === c).length}</span></button>)}
              </div>
            </Panel>
          )}
        </aside>
      </div>

      <div style={{ marginTop: 28 }}><Disclaimer tone="amber">Evidence levels describe the kind of source, not whether a specific claim drawn from it is correct. Primary law must still be read in context and checked for amendment. Items marked "URL to be verified" have a known citation but no confirmed link.</Disclaimer></div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit source' : 'Add a source'} wide>
        <div className="sv-form">
          <div className="full"><TextField label="Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. IRC § 2036 — Transfers with retained life estate" /></div>
          <TextField label="Author / issuing body" value={form.author} onChange={(v) => setForm({ ...form, author: v })} />
          <TextField label="Date (ISO or year)" value={form.date} onChange={(v) => setForm({ ...form, date: v })} placeholder="2017 or 2024-06-06" />
          <TextField label="Jurisdiction" value={form.jurisdiction} onChange={(v) => setForm({ ...form, jurisdiction: v })} placeholder="United States (federal), Wyoming, UAE…" />
          <SelectField label="Category *" value={form.category} onChange={(v: SourceCategory) => setForm({ ...form, category: v })} options={SOURCE_CATEGORY_ORDER.map((c) => ({ value: c, label: SOURCE_CATEGORY_LABELS[c] }))} />
          <SelectField label="Topic" value={form.topic} onChange={(v: Topic) => setForm({ ...form, topic: v })} options={(Object.keys(TOPIC_LABELS) as Topic[]).map((t) => ({ value: t, label: TOPIC_LABELS[t] }))} />
          <SelectField label="Evidence level" value={form.evidenceLevel} onChange={(v: EvidenceLevel) => setForm({ ...form, evidenceLevel: v })} options={EVIDENCE_ORDER.map((e) => ({ value: e, label: `${EVIDENCE_META[e].label} — ${EVIDENCE_META[e].desc}` }))} />
          <SelectField label="Lesson" value={form.lessonId} onChange={(v) => setForm({ ...form, lessonId: v })} options={[...CHAPTERS.map((c) => ({ value: c.id, label: `${c.id} · ${c.short}` })), ...Array.from({ length: 9 }, (_, i) => ({ value: `debt-0${i + 1}`, label: `debt-0${i + 1} · Debt lesson ${i + 1}` }))]} />
          <TextField label="URL" value={form.url} onChange={(v) => setForm({ ...form, url: v })} placeholder="https://… (leave blank if unverified)" />
          <TextField label="Last reviewed" value={form.lastReviewed ?? ''} onChange={(v) => setForm({ ...form, lastReviewed: v })} placeholder="YYYY-MM-DD" />
          <div className="full"><TextField label="Claim this source supports or refutes" value={form.claim} onChange={(v) => setForm({ ...form, claim: v })} multiline rows={2} /></div>
          <div className="full"><TextField label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} multiline rows={3} /></div>
          <div className="full"><TextField label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} multiline rows={2} /></div>
        </div>
        {errors.length > 0 && <div style={{ marginTop: 12 }}><Callout tone="danger"><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul></Callout></div>}
        <div className="row" style={{ gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={() => setFormOpen(false)}>Cancel</button>
          <button className="btn primary" onClick={save}>{editing ? 'Save changes' : 'Add to vault'}</button>
        </div>
      </Modal>
    </div>
  );
}
