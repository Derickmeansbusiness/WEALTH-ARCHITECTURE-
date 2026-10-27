import { useMemo, useState } from 'react';
import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { JURISDICTIONS, JURISDICTION_SECTIONS, COMPARE_DIMENSIONS, SUITABILITY_NOTE, jurisdictionById, type Jurisdiction } from '@/content/jurisdictions';
import { Chip, Disclaimer, EmptyState, Eyebrow, Panel, Reveal, SectionHeader, Callout, Tabs } from '@/components/ui';
import './jurisdictions.css';

export default function JurisdictionsModule() {
  return (
    <Routes>
      <Route index element={<JurisdictionsIndex />} />
      <Route path="compare" element={<Compare />} />
      <Route path=":id" element={<JurisdictionDetail />} />
    </Routes>
  );
}

const TYPE_LABEL: Record<Jurisdiction['type'], string> = { 'us-state': 'US state', country: 'Country', territory: 'Territory' };

/** Short key chips for the card grid: derived from the record so content stays single-sourced. */
function keyChips(j: Jurisdiction): { label: string; tone?: 'gold' | 'green' | 'amber' | 'red' | 'blue' | 'violet' }[] {
  const chips: { label: string; tone?: 'gold' | 'green' | 'amber' | 'red' | 'blue' | 'violet' }[] = [];
  const tax = j.taxCharacteristics.join(' ').toLowerCase();
  if (tax.includes('no state individual') || tax.includes('no personal income tax') || tax.includes('no income, capital gains')) chips.push({ label: 'No personal income tax', tone: 'green' });
  if (/exclusive remedy|exclusive-remedy|sole remedy/.test(j.chargingOrderProtection.toLowerCase())) chips.push({ label: 'Charging order exclusive', tone: 'blue' });
  if (j.trustRegimes.some((t) => /dapt|self-settled|spendthrift trust act|qualified dispositions|qualified spendthrift/i.test(t))) chips.push({ label: 'Self-settled trusts', tone: 'violet' });
  if (j.trustRegimes.some((t) => /perpetuit|dynasty|1,000-year|365-year/i.test(t))) chips.push({ label: 'Dynasty trusts', tone: 'gold' });
  if (/not public|not required on any public|no public register|names of members and managers are not/i.test(j.publicOwnershipDisclosure)) chips.push({ label: 'Owners not public', tone: 'blue' });
  if (j.creditorProtections.some((c) => /foreign judgments|non-recognition|not recognised/i.test(c))) chips.push({ label: 'Foreign judgments not enforced', tone: 'red' });
  if (/common-law/i.test(j.summary) && j.type !== 'us-state') chips.push({ label: 'Common-law courts', tone: 'gold' });
  return chips.slice(0, 4);
}

function MiniMap({ seed }: { seed: string }) {
  // Abstract "territory" glyph: a deterministic polygon so cards differ without using flags as imagery.
  const pts = useMemo(() => {
    let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const n = 8; const out: string[] = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const r = 32 + ((h >> (i * 3)) % 14); out.push(`${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`); }
    return out.join(' ');
  }, [seed]);
  return <svg className="map" viewBox="0 0 100 100" aria-hidden="true"><polygon points={pts} fill="none" stroke="var(--gold)" strokeWidth="1.5" /><circle cx="50" cy="50" r="3" fill="var(--gold)" /></svg>;
}

function JurisdictionCard({ j }: { j: Jurisdiction }) {
  return (
    <Link to={`/jurisdictions/${j.id}`} className={`jx-card ${j.verified ? '' : 'scaffold'}`}>
      <MiniMap seed={j.id} />
      <div className="row between">
        <span className="flag" aria-hidden="true">{j.flagEmoji}</span>
        {j.verified ? <Chip tone="green">Reviewed {j.lastReviewed}</Chip> : <Chip tone="amber">Not yet jurisdictionally verified</Chip>}
      </div>
      <div>
        <div className="region">{TYPE_LABEL[j.type]} · {j.region}</div>
        <h3>{j.name}</h3>
      </div>
      <p className="summary">{j.summary.replace(/^Scaffold card\.\s*/, '')}</p>
      <div className="chips">{keyChips(j).map((c) => <Chip key={c.label} tone={c.tone}>{c.label}</Chip>)}</div>
    </Link>
  );
}

// ───────────────────────────────── Index ─────────────────────────────────
function JurisdictionsIndex() {
  const [view, setView] = useState<'all' | 'us' | 'intl'>('all');
  const list = JURISDICTIONS.filter((j) => view === 'all' || (view === 'us' ? j.type === 'us-state' : j.type !== 'us-state'));
  const verified = list.filter((j) => j.verified);
  const scaffold = list.filter((j) => !j.verified);
  return (
    <div className="page container">
      <SectionHeader
        eyebrow={`Jurisdiction Engine · ${JURISDICTIONS.filter((j) => j.verified).length} reviewed · ${JURISDICTIONS.filter((j) => !j.verified).length} in progress`}
        title="Wyoming to the Cook Islands, compared without a winner."
        lede={SUITABILITY_NOTE}
      >
        <div className="row" style={{ gap: 10, marginTop: 6 }}>
          <Tabs size="sm" value={view} onChange={setView} tabs={[{ id: 'all', label: 'All' }, { id: 'us', label: 'US states' }, { id: 'intl', label: 'International' }]} />
          <Link to="/jurisdictions/compare" className="btn sm primary">Compare side by side →</Link>
        </div>
      </SectionHeader>

      {verified.length === 0 && scaffold.length === 0 ? <EmptyState title="No jurisdictions in this view." /> : null}
      <div className="jx-grid">
        {verified.map((j, i) => <Reveal key={j.id} delay={i * 0.05}><JurisdictionCard j={j} /></Reveal>)}
      </div>
      {scaffold.length > 0 && (
        <>
          <div className="row between" style={{ margin: '40px 0 14px' }}>
            <Eyebrow>Scaffold cards · minimal content, pending verification</Eyebrow>
            <Chip tone="amber">Not yet jurisdictionally verified</Chip>
          </div>
          <div className="jx-grid">
            {scaffold.map((j, i) => <Reveal key={j.id} delay={i * 0.05}><JurisdictionCard j={j} /></Reveal>)}
          </div>
        </>
      )}

      <div className="hairline" />
      <QuestionsPanel />
      <div style={{ marginTop: 24 }}><Disclaimer>Jurisdiction summaries are educational. Statutes, fees and reporting regimes change; several items are marked for verification. Engage counsel licensed in the relevant jurisdiction before relying on any entry.</Disclaimer></div>
    </div>
  );
}

const QUESTIONS: { k: string; qs: string[] }[] = [
  { k: 'Residence', qs: ['Where does each family member live and pay tax today?', 'Does anyone plan to move within ten years?', 'Which states or countries can tax the trust, the entity and the owners?'] },
  { k: 'Citizenship', qs: ['Are any family members US citizens or green-card holders (taxed worldwide)?', 'Do any hold citizenships with exit taxes or forced heirship?', 'Will the next generation hold different passports?'] },
  { k: 'Asset location', qs: ['Where is the real estate, and can a foreign structure hold it?', 'Where are operating businesses and bank accounts?', 'Which assets must stay where they are for regulatory or practical reasons?'] },
  { k: 'Income sources', qs: ['Is income earned actively in a specific place, or passively from portfolios?', 'Which jurisdictions have nexus to that income today?', 'How will income sources change after a sale or succession?'] },
  { k: 'Business activity', qs: ['Who are the customers and counterparties, and where?', 'Will lenders or investors require a specific entity jurisdiction?', 'Does the business carry high liability exposure that insurance cannot cover?'] },
  { k: 'Objectives', qs: ['Which of the six objectives matters most: protection, tax, estate, privacy, succession, governance?', 'Which objective would the family sacrifice first if forced to?', 'What does success look like in 2050, not 2027?'] },
];

function QuestionsPanel() {
  return (
    <Panel tone="gold">
      <Eyebrow>Which questions to ask (instead of "which is best")</Eyebrow>
      <p className="small" style={{ margin: '10px 0 16px' }}>The engine compares; it does not recommend. Work through these with counsel before any jurisdiction is chosen.</p>
      <div className="jx-questions">
        {QUESTIONS.map((q) => (
          <div key={q.k} className="jx-q">
            <div className="k">{q.k}</div>
            <ul>{q.qs.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ───────────────────────────────── Detail ─────────────────────────────────
function JurisdictionDetail() {
  const { id = '' } = useParams();
  const j = jurisdictionById(id);
  if (!j) {
    return <div className="page container"><EmptyState title="Jurisdiction not found." body="It may be a future card not yet added." action={<Link className="btn" to="/jurisdictions">All jurisdictions</Link>} /></div>;
  }
  const others = JURISDICTIONS.filter((x) => x.id !== j.id && x.verified).slice(0, 3);
  return (
    <div className="page container">
      <div className="row between" style={{ marginBottom: 18 }}>
        <Link to="/jurisdictions" className="btn sm ghost">← All jurisdictions</Link>
        <Link to={`/jurisdictions/compare?ids=${[j.id, ...others.slice(0, 1).map((o) => o.id)].join(',')}`} className="btn sm">Compare with others →</Link>
      </div>

      <div className="jx-hero">
        <div className="stack fade-up" style={{ gap: 14 }}>
          <Eyebrow>{TYPE_LABEL[j.type]} · {j.region}</Eyebrow>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}><span aria-hidden="true" style={{ marginRight: 12 }}>{j.flagEmoji}</span>{j.name}</h1>
          <div className="row" style={{ gap: 8 }}>
            {j.verified ? <Chip tone="green">Reviewed {j.lastReviewed}</Chip> : <Chip tone="amber">Not yet jurisdictionally verified</Chip>}
            {keyChips(j).map((c) => <Chip key={c.label} tone={c.tone}>{c.label}</Chip>)}
          </div>
          <p className="lede">{j.summary.replace(/^Scaffold card\.\s*/, '')}</p>
        </div>
        <Panel tone="gold" className="fade-up delay-2">
          <Eyebrow>Suitability factors</Eyebrow>
          <ul className="small" style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--ivory-2)' }}>
            {j.suitabilityFactors.map((f) => <li key={f} style={{ marginBottom: 6 }}>{f}</li>)}
          </ul>
          <p className="tiny muted" style={{ marginTop: 12, marginBottom: 0 }}>{SUITABILITY_NOTE}</p>
        </Panel>
      </div>

      {!j.verified && (
        <div style={{ marginTop: 20 }}>
          <Callout tone="amber" title="Scaffold card"><p className="small" style={{ margin: 0 }}>This jurisdiction has minimal content that has not been reviewed against current primary law. Treat every line as a prompt for verification, not as a settled statement.</p></Callout>
        </div>
      )}

      <div className="jx-panels" style={{ marginTop: 28 }}>
        {JURISDICTION_SECTIONS.map((s) => {
          const value = j[s.key];
          const wide = s.key === 'taxCharacteristics' || s.key === 'foreignOwnerConsiderations';
          const cls = s.key === 'majorAdvantages' ? 'adv' : s.key === 'majorLimitations' ? 'lim' : '';
          return (
            <section key={s.key} className={`jx-panel ${wide ? 'wide' : ''} ${cls}`}>
              <h4>{s.label}</h4>
              {s.kind === 'list' && Array.isArray(value) ? <ul>{(value as string[]).map((v) => <li key={v}>{v}</li>)}</ul> : <p>{String(value)}</p>}
            </section>
          );
        })}
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <Panel>
          <Eyebrow>References</Eyebrow>
          <ul className="small" style={{ margin: '10px 0 0', paddingLeft: 18 }}>
            {j.references.map((r) => (
              <li key={r.title} style={{ marginBottom: 8 }}>
                {r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a> : <span style={{ color: 'var(--ivory)' }}>{r.title}</span>}
                {r.citation && <span className="mono muted"> · {r.citation}</span>}
                {r.note && <span className="muted"> — {r.note}</span>}
              </li>
            ))}
          </ul>
          <Link to="/sources" className="btn sm ghost" style={{ marginTop: 12 }}>Open the Source Vault →</Link>
        </Panel>
        <Panel>
          <Eyebrow>Compare with</Eyebrow>
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            {others.map((o) => <Link key={o.id} to={`/jurisdictions/compare?ids=${j.id},${o.id}`} className="btn sm">{o.flagEmoji} {o.name}</Link>)}
          </div>
          <p className="tiny muted" style={{ marginTop: 14, marginBottom: 0 }}>Side-by-side tables show differences; they do not rank. {SUITABILITY_NOTE}</p>
        </Panel>
      </div>
      <div style={{ marginTop: 24 }}><Disclaimer /></div>
    </div>
  );
}

// ───────────────────────────────── Compare ─────────────────────────────────
function Compare() {
  const [params, setParams] = useSearchParams();
  const initial = (params.get('ids') ?? 'wyoming,south-dakota').split(',').filter((id) => jurisdictionById(id)).slice(0, 4);
  const [ids, setIds] = useState<string[]>(initial.length ? initial : ['wyoming', 'south-dakota']);
  const [dims, setDims] = useState<string[]>(COMPARE_DIMENSIONS.map((d) => d.key as string));

  const toggle = (id: string) => {
    let next: string[];
    if (ids.includes(id)) next = ids.filter((x) => x !== id);
    else if (ids.length >= 4) return;
    else next = [...ids, id];
    setIds(next);
    setParams(next.length ? { ids: next.join(',') } : {}, { replace: true });
  };
  const chosen = ids.map((id) => jurisdictionById(id)!).filter(Boolean);

  return (
    <div className="page container">
      <div className="row between" style={{ marginBottom: 18 }}>
        <Link to="/jurisdictions" className="btn sm ghost">← All jurisdictions</Link>
        <span className="small muted mono">{chosen.length}/4 selected</span>
      </div>
      <SectionHeader eyebrow="Side-by-side comparison" title="Pick two to four jurisdictions." lede={SUITABILITY_NOTE} />

      <Panel tight>
        <Eyebrow>Jurisdictions</Eyebrow>
        <div className="jx-pick" style={{ marginTop: 10 }}>
          {JURISDICTIONS.map((j) => (
            <button key={j.id} className={`btn sm ${ids.includes(j.id) ? 'active' : 'ghost'}`} onClick={() => toggle(j.id)} disabled={!ids.includes(j.id) && ids.length >= 4} aria-pressed={ids.includes(j.id)}>
              <span aria-hidden="true">{j.flagEmoji}</span> {j.name}{!j.verified && <span className="tiny amber"> · unverified</span>}
            </button>
          ))}
        </div>
        <div className="hairline" style={{ margin: '16px 0' }} />
        <Eyebrow>Dimensions</Eyebrow>
        <div className="jx-pick" style={{ marginTop: 10 }}>
          {COMPARE_DIMENSIONS.map((d) => (
            <button key={d.key as string} className={`btn sm ${dims.includes(d.key as string) ? 'active' : 'ghost'}`} onClick={() => setDims(dims.includes(d.key as string) ? dims.filter((x) => x !== d.key) : [...dims, d.key as string])}>{d.label}</button>
          ))}
        </div>
      </Panel>

      {chosen.length < 2 ? (
        <div style={{ marginTop: 20 }}><EmptyState title="Select at least two jurisdictions." body="The table appears once two or more are chosen." /></div>
      ) : (
        <div className="table-wrap" style={{ marginTop: 20 }}>
          <table className="jx-compare">
            <thead>
              <tr>
                <th className="dim">Dimension</th>
                {chosen.map((j) => (
                  <th key={j.id}>
                    <div className="head">
                      <span className="name"><span aria-hidden="true">{j.flagEmoji}</span> {j.name}</span>
                      {j.verified ? <Chip tone="green">Reviewed</Chip> : <Chip tone="amber">Not yet verified</Chip>}
                      <Link to={`/jurisdictions/${j.id}`} className="tiny">Open detail →</Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_DIMENSIONS.filter((d) => dims.includes(d.key as string)).map((d) => (
                <tr key={d.key as string}>
                  <th className="dim">{d.label}</th>
                  {chosen.map((j) => {
                    const v = j[d.key];
                    return (
                      <td key={j.id}>
                        {Array.isArray(v) ? <ul>{(v as string[]).map((x) => <li key={x}>{x}</li>)}</ul> : d.key === 'type' ? TYPE_LABEL[v as Jurisdiction['type']] : String(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 32 }}><QuestionsPanel /></div>
      <div style={{ marginTop: 24 }}><Disclaimer /></div>
    </div>
  );
}
