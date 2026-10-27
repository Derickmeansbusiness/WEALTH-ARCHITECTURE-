import { Link, Route, Routes } from 'react-router-dom';
import { SectionHeader, Chip, Reveal, Disclaimer, useMoney, ObjectiveLegend } from '@/components/ui';
import { FAMILIES, entityCount } from '@/content/cases';
import FamilyPage from './FamilyPage';
import CompareView from './CompareView';
import './cases.css';

export default function CasesModule() {
  return (
    <Routes>
      <Route index element={<CasesIndex />} />
      <Route path="compare" element={<CompareView />} />
      <Route path=":familyId" element={<FamilyPage />} />
    </Routes>
  );
}

function CasesIndex() {
  const fmt = useMoney();
  return (
    <div className="page container">
      <SectionHeader eyebrow="Case studies · Five fictional families" title="From a first LLC to three legal systems" lede="Each family is a composite built to teach one stage of the architecture. Scrub through their stages and watch the structure morph, the balance sheet grow, and the decisions pile up, with the trade-offs, the professionals in the room, and the tax questions each move raises.">
        <Link to="/cases/compare" className="btn sm">Compare all five →</Link>
      </SectionHeader>
      <div className="cases-grid">
        {FAMILIES.map((f, i) => {
          const first = f.stages[0], last = f.stages[f.stages.length - 1];
          return (
            <Reveal key={f.id} delay={i * 0.07}>
              <Link to={`/cases/${f.id}`} className="panel tight cases-card">
                <div className="row between"><Chip tone="gold">Level {f.level}</Chip><span className="tiny muted mono">{f.stages.length} stages</span></div>
                <div className="cases-ladder" aria-label={`Level ${f.level} of 5`}>{[1, 2, 3, 4, 5].map((l) => <i key={l} className={l <= f.level ? 'on' : ''} />)}</div>
                <div className="display" style={{ fontSize: '1.35rem', lineHeight: 1.15 }}>{f.name}</div>
                <div className="tiny" style={{ color: 'var(--gold-2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{f.levelLabel}</div>
                <p className="small muted" style={{ margin: 0, flex: 1 }}>{f.tagline}</p>
                <div className="row between"><span className="tiny muted">{first.year} → {last.year}</span><span className="nw">{fmt(last.netWorthUSD, { compact: true })}</span></div>
                <div className="row between tiny muted"><span>{entityCount(first)} → {entityCount(last)} entities</span><span>{f.jurisdictions.length} jurisdiction{f.jurisdictions.length > 1 ? 's' : ''}</span></div>
              </Link>
            </Reveal>
          );
        })}
      </div>
      <div className="section">
        <SectionHeader eyebrow="Reading the cases" title="Six objectives, kept apart" lede="Every stage tags the objectives it actually served. Notice how early stages serve one or two and later stages serve several, and how no stage serves all six." />
        <ObjectiveLegend />
      </div>
      <Disclaimer>The families, people, companies and numbers are fictional. They are built to be realistic, not real. Nothing here is advice for any actual family.</Disclaimer>
    </div>
  );
}
