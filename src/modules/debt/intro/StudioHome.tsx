import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chip, Eyebrow, Panel, Reveal, SectionHeader, Disclaimer, ObjectiveLegend } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { DEBT_LESSONS } from '@/content/debt/lessons';
import { DEBT_CASES } from '@/content/debt/cases';
import { useInViewProgress } from '@/content/debt/lessons/visuals/animation';
import IsoBuilding from './IsoBuilding';
import FinancingSplit from './FinancingSplit';
import LayersExplorer from './LayersExplorer';
import LeverageThesis from './LeverageThesis';
import BankStatement from './BankStatement';
import ErrorBoundary from '../shell/ErrorBoundary';
import { STUDIO_BASE } from '../shell/StudioShell';

const QUESTION = ['HOW CAN YOU CONTROL', 'A $1 MILLION ASSET', 'WITHOUT OWNING', '$1 MILLION IN CASH?'];

const TOOLS = [
  { to: `${STUDIO_BASE}/leverage`, title: 'Leverage Calculator', body: 'All-cash vs financed, year by year, downside included.', tag: 'Tool' },
  { to: `${STUDIO_BASE}/stress-test`, title: 'Stress Test', body: 'Rate, value and income shocks on any loan or portfolio.', tag: 'Tool' },
  { to: `${STUDIO_BASE}/credit-profile`, title: 'Credit Profile', body: 'The presentation a credit committee expects.', tag: 'Tool' },
  { to: `${STUDIO_BASE}/capital-stack`, title: 'Capital Stack', body: 'Senior to common: who is paid first and what each layer costs.', tag: 'Tool' },
  { to: `${STUDIO_BASE}/financing-map`, title: 'Financing Map', body: 'Debt and related-party loans drawn onto a family structure.', tag: 'Structure' },
  { to: `${STUDIO_BASE}/decision`, title: 'Decision Simulator', body: 'Borrow now, grow slower, or wait — same assumptions, three paths.', tag: 'Tool' },
  { to: `${STUDIO_BASE}/dashboard`, title: 'Debt Dashboard', body: 'Maturity ladder, covenant headroom, guarantee schedule.', tag: 'Tool' },
  { to: `${STUDIO_BASE}/jurisdictions`, title: 'Jurisdictions', body: 'US · UAE · Cameroon/CEMAC/OHADA · UK (coming).', tag: 'Reference' },
  { to: `${STUDIO_BASE}/sources`, title: 'Sources', body: 'The bibliography behind all nine lessons.', tag: 'Reference' },
  { to: `${STUDIO_BASE}/present`, title: 'Presentation', body: 'A 35-minute animated teaching sequence on how borrowed capital works.', tag: 'Deck' },
];

export default function StudioHome() {
  const progress = useAppStore((s) => s.progress);
  const done = DEBT_LESSONS.filter((l) => progress[l.id]?.completed).length;
  // cinematic master timeline for the hero (question → building → split)
  const [t, setT] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setT(1); return; }
    let raf = 0; const start = performance.now(); const dur = 9000;
    const tick = (now: number) => { const p = Math.min(1, (now - start) / dur); setT(p); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const buildT = Math.max(0, Math.min(1, (t - 0.3) / 0.4));
  const splitT = Math.max(0, Math.min(1, (t - 0.62) / 0.38));
  const thesis = useInViewProgress<HTMLDivElement>(2600);

  return (
    <div className="ds-intro">
      {/* 1. The question + the building */}
      <section className="container" style={{ padding: 'clamp(36px, 6vw, 80px) clamp(16px, 4vw, 40px) 20px' }}>
        <div className="ds-hero-grid">
          <div className="stack" style={{ gap: 24 }}>
            <Eyebrow>Chapter 04 · The Debt, Credit &amp; Strategic Leverage Studio</Eyebrow>
            <h1 className="ds-intro-question" aria-label={QUESTION.join(' ')}>
              {QUESTION.map((line, i) => <span key={line} className={`ds-line ${i === 1 ? 'gold' : ''}`} style={{ animationDelay: `${0.3 + i * 0.55}s` }}>{line}</span>)}
            </h1>
            <p className="lede fade-in" style={{ animationDelay: '2.6s', maxWidth: 560 }}>You borrow most of it. A lender advances {`$700,000`} against the building, you contribute {`$300,000`}, and a company you own holds the title. The rest of this studio is about what that sentence costs, what it risks, and how disciplined families do it.</p>
            <div className="row fade-in" style={{ animationDelay: '3s', gap: 10 }}>
              <Link to={`${STUDIO_BASE}/lessons/1`} className="btn primary">Start Lesson 01</Link>
              <Link to={`${STUDIO_BASE}/leverage`} className="btn">Open the Leverage Calculator</Link>
              <Link to={`${STUDIO_BASE}/present`} className="btn ghost">Present →</Link>
            </div>
            <div className="row fade-in" style={{ animationDelay: '3.2s', gap: 10 }}>
              <Chip tone="gold">{done}/{DEBT_LESSONS.length} lessons complete</Chip>
              <Chip>9 lessons</Chip><Chip>7 tools</Chip><Chip>5 cases</Chip><Chip>35-min deck</Chip>
            </div>
          </div>
          <div className="ds-stage fade-in" style={{ animationDelay: '1.6s' }}>
            <div className="ds-stage-3d"><IsoBuilding t={buildT} /></div>
          </div>
        </div>
      </section>

      {/* 2. Financing split */}
      <section className="container section" style={{ marginTop: 24 }}>
        <Panel tone="gold" style={{ padding: 'clamp(20px, 3vw, 36px)' }}>
          <div className="ds-hero-grid" style={{ alignItems: 'start' }}>
            <div className="stack">
              <Eyebrow>Step one · how the purchase is financed</Eyebrow>
              <h2>One asset, two sources of capital</h2>
              <p>The building costs {`$1,000,000`}. The family’s Property Co puts in {`$300,000`} of equity and borrows {`$700,000`} from a lender who takes a first lien on the building. The company controls an asset worth more than three times the cash it contributed. That multiple — 3.33× — is the leverage factor, and it cuts both ways.</p>
            </div>
            <FinancingSplit t={splitT} />
          </div>
        </Panel>
      </section>

      {/* 3. Layers */}
      <section className="container section">
        <SectionHeader eyebrow="Step two · four layers of the same transaction" title="Ownership, liabilities, interest, cash flow" lede="Toggle each layer. Ownership and liability live on different balance sheets; interest flows every month regardless of occupancy; the equity holder receives only what is left." />
        <Panel><ErrorBoundary title="Layer explorer failed"><LayersExplorer /></ErrorBoundary></Panel>
      </section>

      {/* 4. Thesis */}
      <section className="container section" ref={thesis.ref}>
        <SectionHeader eyebrow="The thesis" title={<>The Power of Leverage: <span className="gold" style={{ fontStyle: 'italic', fontWeight: 400 }}>Borrowed Capital Can Multiply Both Wealth and Risk</span></>} lede="The asset moves ten percent. The loan does not move at all. Everything in between belongs to equity." />
        <Panel><ErrorBoundary title="Thesis chart failed"><LeverageThesis t={thesis.t} /></ErrorBoundary></Panel>
      </section>

      {/* 5. Banking interface + principles */}
      <section className="container section">
        <div className="ds-two" style={{ alignItems: 'start' }}>
          <Reveal>
            <div className="stack">
              <Eyebrow>The obligation, month by month</Eyebrow>
              <h3>What the lender’s system sees</h3>
              <p className="small muted">A {`$700,000`} loan at 6.5% is 360 payments of about $4,424. Watch the statement fill: the balance barely moves in the first year because interest is charged on the full outstanding amount. This is the view that matters when rent stops arriving.</p>
              <ErrorBoundary title="Statement failed"><BankStatement /></ErrorBoundary>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Panel tone="green" style={{ height: '100%' }}>
              <Eyebrow>How this studio teaches debt</Eyebrow>
              <h3 style={{ margin: '8px 0 14px' }}>Debt is a financing instrument, not a strategy</h3>
              <p className="small">It can accelerate capital formation when supported by <strong>productive assets</strong>, <strong>sustainable cash flow</strong> and <strong>disciplined risk management</strong>. It is never presented here as inherently beneficial or as a way to eliminate tax, and no tool in this studio recommends the most leveraged scenario by default.</p>
              <p className="small">Every simulation shows its assumptions and formulas. Every jurisdictional statement carries a verification status. Six objectives stay distinct in every diagram:</p>
              <ObjectiveLegend />
            </Panel>
          </Reveal>
        </div>
      </section>

      {/* 6. Studio map */}
      <section className="container section">
        <SectionHeader eyebrow="The studio map" title="Nine lessons, seven tools, five cases" lede="Start with the lessons if debt is new to you; start with the tools if you have a term sheet in hand; start with the cases if you learn from stories." />
        <div className="grid grid-3">
          {DEBT_LESSONS.map((l, i) => {
            const p = progress[l.id];
            return (
              <Reveal key={l.id} delay={(i % 3) * 0.05}>
                <Link to={`${STUDIO_BASE}/lessons/${l.number}`} className="panel tight ds-card-link">
                  <div className="row between"><span className="ds-card-num">LESSON {String(l.number).padStart(2, '0')}</span>{p?.completed ? <Chip tone="green">Done</Chip> : p?.visited ? <Chip tone="gold">Started</Chip> : <span className="tiny muted mono">{l.duration}</span>}</div>
                  <div className="display" style={{ fontSize: '1.35rem', marginTop: 8 }}>{l.title}</div>
                  <p className="small muted" style={{ margin: '6px 0 0' }}>{l.subtitle}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
        <div className="grid grid-4" style={{ marginTop: 16 }}>
          {TOOLS.map((r, i) => (
            <Reveal key={r.to} delay={(i % 4) * 0.05}>
              <Link to={r.to} className="panel tight ds-card-link">
                <span className="chip">{r.tag}</span>
                <div className="display" style={{ fontSize: '1.25rem', margin: '10px 0 6px' }}>{r.title}</div>
                <p className="small muted" style={{ margin: 0 }}>{r.body}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="grid grid-3" style={{ marginTop: 16 }}>
          {DEBT_CASES.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.05}>
              <Link to={`${STUDIO_BASE}/cases/${c.id}`} className="panel tight ds-card-link">
                <div className="row between"><span className="ds-card-num">CASE {c.id}</span><Chip>{c.stages.length} stages</Chip></div>
                <div className="display" style={{ fontSize: '1.3rem', marginTop: 8 }}>{c.title}</div>
                <p className="small muted" style={{ margin: '6px 0 0' }}>{c.summary}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section" style={{ marginTop: 20 }}>
        <Disclaimer>The {`$1,000,000`} property, its {`$700,000`} loan and every family in this studio are teaching models. Lending terms, ratios and legal treatment vary by lender, jurisdiction and facts. Return to <Link to="/academy/debt-credit-leverage">Chapter 04</Link> for the Academy chapter this studio extends.</Disclaimer>
      </section>
    </div>
  );
}
