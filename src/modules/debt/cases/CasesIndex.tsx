import { Link } from 'react-router-dom';
import { DEBT_CASES } from '@/content/debt/cases';
import { ObjectiveTags, Reveal, SectionHeader, Chip } from '@/components/ui';
import { STUDIO_BASE } from '../shell/StudioShell';

export default function CasesIndex() {
  return (
    <div className="container ds-page">
      <SectionHeader eyebrow="Five cases · fictional families, realistic numbers" title="Debt decisions, stage by stage" lede="Each case follows a borrower through three to five stages with balance sheets, cash flows and loan schedules built from the same finance library as the tools. Scrub through the stages; read the decisions, tradeoffs and warnings." />
      <div className="grid grid-2">
        {DEBT_CASES.map((c, i) => (
          <Reveal key={c.id} delay={(i % 2) * 0.08}>
            <Link to={`${STUDIO_BASE}/cases/${c.id}`} className="panel ds-card-link">
              <div className="row between"><span className="ds-card-num">CASE {c.id}</span><Chip>{c.stages.length} stages</Chip></div>
              <div className="display" style={{ fontSize: '1.7rem', margin: '10px 0 4px' }}>{c.title}</div>
              <p className="small" style={{ color: 'var(--ivory-3)', margin: '0 0 10px' }}>{c.persona}</p>
              <p className="small" style={{ margin: '0 0 14px' }}>{c.summary}</p>
              <ObjectiveTags objectives={c.objectives} />
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
