import { Link } from 'react-router-dom';
import { CHAPTERS } from '@/content/chapters/manifest';
import { useAppStore } from '@/store/useAppStore';
import { Eyebrow, Panel, Reveal, ObjectiveLegend, ProgressBar, SectionHeader, Chip } from '@/components/ui';
import HeroNetwork from './HeroNetwork';
import './index.css';

const PILLARS = [
  { word: 'Create', body: 'Labor becomes business. Business becomes assets. The engine comes first.' },
  { word: 'Control', body: 'Ownership and control are different rights. Families separate them deliberately.' },
  { word: 'Protect', body: 'Liability is positioned, not wished away. Separation, insurance and documentation.' },
  { word: 'Compound', body: 'Capital recycles through the family balance sheet instead of leaking out.' },
  { word: 'Transfer', body: 'Succession is engineered decades ahead, with governance that outlives the founder.' },
];

const ROOMS = [
  { to: '/map', title: 'Architecture Map', body: 'Zoom from one individual out to future generations.', tag: 'Master visual' },
  { to: '/lab', title: 'Structure Lab', body: 'Drag, connect and view the same architecture five ways.', tag: 'Designer' },
  { to: '/money-flow', title: 'Money Flow Simulator', body: 'Follow $1,000,000 of revenue through every entity.', tag: 'Simulator' },
  { to: '/debt-credit-studio', title: 'Debt & Credit Studio', body: 'Leverage, stress tests, capital stacks and family lending.', tag: 'Studio' },
  { to: '/claims', title: 'Claim Checker', body: 'Green, amber, red. Internet claims meet primary law.', tag: 'Verification' },
  { to: '/jurisdictions', title: 'Jurisdiction Engine', body: 'Wyoming to Cook Islands, compared without a winner.', tag: 'Reference' },
  { to: '/waterfall', title: 'Capital Waterfall', body: 'Labor to family capital, and back up again.', tag: 'Animation' },
  { to: '/family-bank', title: 'Family Bank Simulator', body: 'Build a bona fide intra-family loan, both balance sheets.', tag: 'Simulator' },
  { to: '/trust-explorer', title: 'Trust Explorer', body: 'Flip revocable, grantor, foreign, discretionary. Watch it change.', tag: 'Explorer' },
  { to: '/liability', title: 'Liability Attack Simulator', body: 'Eight creditor scenarios moving through a structure.', tag: 'Simulator' },
  { to: '/timeline', title: '100-Year Timeline', body: 'Four generations. Four ways of inheriting.', tag: 'Timeline' },
  { to: '/governance', title: 'Governance Center', body: 'Constitution, council, policies. The human side of capital.', tag: 'Reference' },
  { to: '/cases', title: 'Case Studies', body: 'Five fictional families, from first business to global.', tag: 'Cases' },
  { to: '/sources', title: 'Source Vault', body: 'Every lesson cites. Every citation is searchable.', tag: 'Research' },
  { to: '/research', title: 'Research Workspace', body: 'Paste a transcript. Split it into claims. Verify before teaching.', tag: 'Admin' },
  { to: '/present', title: 'Presentation Mode', body: 'A 60 to 120 minute keynote deck for a conference screen.', tag: 'Keynote' },
];

export default function HomePage() {
  const progress = useAppStore((s) => s.progress);
  const done = CHAPTERS.filter((c) => progress[c.id]?.completed).length;
  return (
    <div className="page" style={{ paddingTop: 'var(--nav-h)' }}>
      {/* HERO */}
      <section className="container hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)', gap: 32, alignItems: 'center', minHeight: 'calc(100vh - var(--nav-h))', padding: '40px clamp(16px,4vw,40px)' }}>
        <div className="stack fade-up" style={{ gap: 22 }}>
          <Eyebrow>An interactive masterclass · 15 chapters · 16 laboratories</Eyebrow>
          <h1 style={{ lineHeight: 1.0 }}>The 100-Year<br />Family Wealth<br /><span className="gold" style={{ fontStyle: 'italic', fontWeight: 400 }}>Architecture</span></h1>
          <p className="lede" style={{ maxWidth: 560 }}>Create. Control. Protect. Compound. Transfer. How sophisticated families structure ownership, financing, risk, taxation, succession and governance across generations, shown as a living architecture instead of a stack of documents.</p>
          <div className="row" style={{ gap: 10 }}>
            <Link to="/academy" className="btn primary">Enter the Academy</Link>
            <Link to="/map" className="btn">Open the Architecture Map</Link>
            <Link to="/present" className="btn ghost">Presentation Mode →</Link>
          </div>
          <div className="row" style={{ gap: 14, marginTop: 8 }}>
            <div style={{ flex: 1, maxWidth: 320 }}><ProgressBar value={done / CHAPTERS.length} /></div>
            <span className="tiny muted mono">{done}/{CHAPTERS.length} chapters complete</span>
          </div>
        </div>
        <div className="fade-in delay-2"><HeroNetwork /></div>
      </section>

      {/* PILLARS */}
      <section className="container section">
        <div className="grid pillars-grid" style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12 }}>
          {PILLARS.map((p, i) => (
            <Reveal key={p.word} delay={i * 0.08}>
              <Panel tight style={{ height: '100%' }}>
                <div className="mono tiny gold">0{i + 1}</div>
                <div className="display" style={{ fontSize: '1.8rem', margin: '6px 0 8px' }}>{p.word}.</div>
                <p className="small muted" style={{ margin: 0 }}>{p.body}</p>
              </Panel>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRINCIPLE */}
      <section className="container section">
        <Reveal>
          <Panel tone="gold" style={{ padding: 'clamp(24px, 4vw, 48px)' }}>
            <div className="grid grid-2" style={{ gap: 32, alignItems: 'center' }}>
              <div className="stack">
                <Eyebrow>The educational principle</Eyebrow>
                <h2>We never teach that wealthy people don't pay tax.</h2>
                <p className="lede">We teach that wealthy families <strong>deliberately structure</strong> ownership, financing, risk, taxation, succession and governance. Six objectives overlap in every diagram you will see here. They are never the same thing, and this platform keeps them distinct on purpose.</p>
                <div className="row" style={{ gap: 8 }}>
                  <Chip tone="red">No sham transactions</Chip><Chip tone="red">No false debt</Chip><Chip tone="red">No "hiding" ownership</Chip><Chip tone="green">Lawful privacy ≠ concealment</Chip>
                </div>
              </div>
              <ObjectiveLegend />
            </div>
          </Panel>
        </Reveal>
      </section>

      {/* CHAPTERS */}
      <section className="container section">
        <SectionHeader eyebrow="The masterclass" title="Fifteen chapters, one architecture" lede="Each chapter contains a concept, an animated diagram, a real-world example, a simulator, a misconception, a professional explanation, a knowledge check, a case study, terminology and legal references." />
        <div className="grid grid-3">
          {CHAPTERS.map((c, i) => {
            const p = progress[c.id];
            return (
              <Reveal key={c.id} delay={(i % 3) * 0.06}>
                <Link to={`/academy/${c.slug}`} className="panel tight" style={{ display: 'block', color: 'inherit', height: '100%', transition: 'border-color 0.3s' }}>
                  <div className="row between">
                    <span className="mono gold">{String(c.number).padStart(2, '0')}</span>
                    {p?.completed ? <Chip tone="green">Complete</Chip> : p?.visited ? <Chip tone="gold">In progress</Chip> : <span className="tiny muted mono">{c.duration}</span>}
                  </div>
                  <div className="display" style={{ fontSize: '1.45rem', marginTop: 8 }}>{c.title}</div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ROOMS */}
      <section className="container section">
        <SectionHeader eyebrow="The laboratory" title="Sixteen rooms in the architecture" lede="Every room is interactive. Every simulation says what it assumes, and every warning tells you when a professional would normally be in the room." />
        <div className="grid grid-4">
          {ROOMS.map((r, i) => (
            <Reveal key={r.to} delay={(i % 4) * 0.05}>
              <Link to={r.to} className="panel tight" style={{ display: 'block', color: 'inherit', height: '100%' }}>
                <span className="chip">{r.tag}</span>
                <div className="display" style={{ fontSize: '1.3rem', margin: '10px 0 6px' }}>{r.title}</div>
                <p className="small muted" style={{ margin: 0 }}>{r.body}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* OUTCOME */}
      <section className="container section">
        <Reveal>
          <Panel style={{ padding: 'clamp(24px, 4vw, 48px)' }}>
            <Eyebrow>Final outcome</Eyebrow>
            <h2 style={{ marginTop: 10 }}>Look at any sophisticated diagram and explain it.</h2>
            <div className="grid grid-3" style={{ marginTop: 20 }}>
              {['Who legally owns each asset', 'Who controls each asset', 'Where liability sits', 'Where money flows', 'How succession works', 'What documentation connects the entities', 'What tax questions arise', 'What jurisdiction governs each component', 'What professional advice is required'].map((q, i) => (
                <div key={q} className="row" style={{ gap: 12, alignItems: 'flex-start' }}><span className="mono gold small">{String(i + 1).padStart(2, '0')}</span><span>{q}</span></div>
              ))}
            </div>
          </Panel>
        </Reveal>
      </section>
    </div>
  );
}
