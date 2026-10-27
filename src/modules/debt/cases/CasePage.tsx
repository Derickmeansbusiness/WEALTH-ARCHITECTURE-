import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DEBT_CASES, caseById } from '@/content/debt/cases';
import type { CaseBalanceSheet, CaseDebt, CaseEntitySheet, CaseStage } from '@/content/debt/types';
import { consolidate, sheetTotals } from '@/content/debt/math';
import { analyzeLeverage, buildLoan } from '@/lib/finance';
import { pct, ratio } from '@/lib/format';
import { Chip, Disclaimer, EmptyState, ObjectiveTags, Panel, useMoney } from '@/components/ui';
import ErrorBoundary from '../shell/ErrorBoundary';
import { STUDIO_BASE } from '../shell/StudioShell';

function Sheet({ sheet, title, tone, showIc }: { sheet: CaseBalanceSheet; title?: string; tone?: 'gold' | 'green' | 'danger' | 'warn'; showIc?: boolean }) {
  const fmt = useMoney();
  const ta = sheetTotals(sheet.assets), tl = sheetTotals(sheet.liabilities);
  return (
    <Panel tight tone={tone}>
      {title && <div className="display" style={{ fontSize: '1.1rem', marginBottom: 8 }}>{title}</div>}
      <div className="ds-two" style={{ gap: 14 }}>
        <div className="ds-sheet">
          <div className="eyebrow" style={{ marginBottom: 6 }}>Assets</div>
          {sheet.assets.map((l, i) => <div key={i} className={`ds-sheet-line ${l.intercompany && showIc ? 'ic' : ''}`}><span>{l.label}{l.intercompany && showIc ? ' ⇄' : ''}</span><span className="mono">{fmt(l.value, { compact: true })}</span></div>)}
          <div className="ds-sheet-line total"><span>Total assets</span><span className="mono">{fmt(ta, { compact: true })}</span></div>
        </div>
        <div className="ds-sheet">
          <div className="eyebrow" style={{ marginBottom: 6 }}>Liabilities &amp; equity</div>
          {sheet.liabilities.map((l, i) => <div key={i} className={`ds-sheet-line ${l.intercompany && showIc ? 'ic' : ''}`}><span>{l.label}{l.intercompany && showIc ? ' ⇄' : ''}</span><span className="mono">{fmt(l.value, { compact: true })}</span></div>)}
          <div className="ds-sheet-line total"><span>Equity (residual)</span><span className="mono" style={{ color: ta - tl < 0 ? 'var(--red)' : 'var(--gold-2)' }}>{fmt(ta - tl, { compact: true })}</span></div>
          <div className="ds-sheet-line tiny muted"><span>Debt ÷ assets</span><span className="mono">{ta > 0 ? pct(tl / ta, 0) : '—'}</span></div>
        </div>
      </div>
    </Panel>
  );
}

function EntitySheets({ entities }: { entities: CaseEntitySheet[] }) {
  const fmt = useMoney();
  const [view, setView] = useState<'entity' | 'consolidated'>('entity');
  const c = useMemo(() => consolidate(entities), [entities]);
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="row between">
        <div className="row" style={{ gap: 6 }}>
          <button className={`btn sm ${view === 'entity' ? 'active' : 'ghost'}`} onClick={() => setView('entity')}>Entity view ({entities.length} balance sheets)</button>
          <button className={`btn sm ${view === 'consolidated' ? 'active' : 'ghost'}`} onClick={() => setView('consolidated')}>Consolidated view</button>
        </div>
        {view === 'consolidated' ? <Chip tone={c.balanced ? 'blue' : 'red'}>{c.balanced ? `Intercompany eliminated: ${fmt(c.eliminatedAssets, { compact: true })}` : 'Intercompany balances do not reconcile'}</Chip> : <span className="tiny muted">⇄ marks intercompany lines; each is a real, enforceable obligation of that entity</span>}
      </div>
      {view === 'entity' ? (
        <div className="grid grid-2">{entities.map((e) => <Sheet key={e.name} sheet={e} title={e.name} showIc tone={e.kind === 'holding' ? 'gold' : undefined} />)}</div>
      ) : (
        <div className="stack" style={{ gap: 8 }}>
          <Sheet sheet={{ assets: c.assets, liabilities: c.liabilities }} title="The family, consolidated (external position only)" tone="gold" />
          <p className="tiny muted" style={{ margin: 0 }}>Receivables and payables between family entities ({fmt(c.eliminatedAssets, { compact: true })} on each side) are eliminated. This answers “what does the family own and owe to the outside world?” — not “what can each creditor reach?”. Each entity’s own statements remain the legal position.</p>
        </div>
      )}
    </div>
  );
}

function CashFlow({ lines }: { lines: CaseStage['cashFlow'] }) {
  const fmt = useMoney();
  const max = Math.max(1, ...lines.map((l) => Math.abs(l.value)));
  return (
    <Panel tight>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Annual cash flows</div>
      <div className="stack" style={{ gap: 6 }}>
        {lines.map((l, i) => (
          <div key={i} className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
            <span className="small" style={{ flex: '0 0 45%', color: 'var(--ivory-2)' }}>{l.label}{l.note ? <span className="tiny muted"> · {l.note}</span> : null}</span>
            <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: l.value < 0 ? `${50 - (Math.abs(l.value) / max) * 50}%` : '50%', width: `${(Math.abs(l.value) / max) * 50}%`, background: l.value < 0 ? 'var(--amber)' : 'var(--green-2)', borderRadius: 4, transition: 'all 0.8s var(--ease)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--line-strong)' }} />
            </div>
            <span className="mono small" style={{ flex: '0 0 90px', textAlign: 'right', color: l.value < 0 ? 'var(--amber)' : 'var(--green-2)' }}>{fmt(l.value, { compact: true })}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DebtTable({ debts }: { debts: CaseDebt[] }) {
  const fmt = useMoney();
  const rows = useMemo(() => debts.map((d) => ({ d, loan: buildLoan({ principal: d.principal, annualRate: d.annualRate, termMonths: Math.max(1, d.termMonths), structure: d.structure, amortizationMonths: d.amortizationMonths }) })), [debts]);
  if (!debts.length) return <Panel tight><EmptyState title="No new facilities at this stage" body="The obligations carried from the previous stage remain in force." /></Panel>;
  const totalDs = rows.reduce((s, r) => s + r.loan.annualDebtService, 0);
  return (
    <Panel tight>
      <div className="row between" style={{ marginBottom: 10 }}><div className="eyebrow">Debt obligations · computed with buildLoan</div><span className="tiny muted mono">Total annual debt service {fmt(totalDs, { compact: true })}</span></div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Facility</th><th>Lender</th><th className="num">Principal</th><th className="num">Rate</th><th>Structure</th><th className="num">Payment</th><th className="num">Annual D/S</th><th className="num">Balloon</th><th>Collateral · guarantee</th></tr></thead>
          <tbody>
            {rows.map(({ d, loan }) => (
              <tr key={d.name}>
                <td style={{ color: 'var(--ivory)' }}>{d.name}{d.note ? <div className="tiny muted">{d.note}</div> : null}</td>
                <td className="small">{d.lender}</td>
                <td className="num">{fmt(d.principal, { compact: true })}</td>
                <td className="num">{pct(d.annualRate, 2)}</td>
                <td className="small">{d.structure}{d.structure === 'balloon' && d.amortizationMonths ? ` · ${d.amortizationMonths / 12}-yr amort` : ''} · {Math.round(d.termMonths / 12 * 10) / 10}y</td>
                <td className="num">{fmt(loan.periodicPayment)}/mo</td>
                <td className="num">{fmt(loan.annualDebtService, { compact: true })}</td>
                <td className="num" style={{ color: loan.balloonBalance > 0 ? 'var(--amber)' : undefined }}>{loan.balloonBalance > 0 ? fmt(loan.balloonBalance, { compact: true }) : '—'}</td>
                <td className="small">{d.collateral ?? 'Unsecured'}{d.guarantee ? <div className="tiny" style={{ color: /none/i.test(d.guarantee) ? 'var(--green-2)' : 'var(--amber)' }}>{d.guarantee}</div> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function MaturityLadder({ debts }: { debts: CaseDebt[] }) {
  const fmt = useMoney();
  const withMat = debts.filter((d) => d.maturityYear !== undefined);
  if (withMat.length < 3) return null;
  const years = Array.from({ length: Math.max(...withMat.map((d) => d.maturityYear!)) + 1 }, (_, i) => i);
  const byYear = years.map((y) => ({ y, total: withMat.filter((d) => d.maturityYear === y).reduce((s, d) => s + d.principal, 0), names: withMat.filter((d) => d.maturityYear === y).map((d) => d.name) }));
  const max = Math.max(1, ...byYear.map((b) => b.total));
  const total = withMat.reduce((s, d) => s + d.principal, 0);
  const next24 = byYear.filter((b) => b.y <= 2).reduce((s, b) => s + b.total, 0);
  return (
    <Panel tight>
      <div className="row between" style={{ marginBottom: 10 }}><div className="eyebrow">Maturity ladder</div><Chip tone={next24 / total > 0.5 ? 'red' : next24 / total > 0.3 ? 'amber' : 'green'}>{pct(next24 / total, 0)} of debt matures within 2 years</Chip></div>
      <div className="stack" style={{ gap: 6 }}>
        {byYear.map((b) => (
          <div key={b.y} className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
            <span className="mono tiny muted" style={{ flex: '0 0 56px' }}>{b.y === 0 ? 'Now/≤1y' : `Year ${b.y}`}</span>
            <div style={{ flex: 1 }}><div className="ds-ladder-bar" style={{ width: `${(b.total / max) * 100}%`, opacity: b.total ? 1 : 0.15, background: b.y <= 2 && b.total ? 'linear-gradient(90deg, #8a5f1c, var(--amber))' : undefined }} title={b.names.join(', ')} /></div>
            <span className="mono small" style={{ flex: '0 0 80px', textAlign: 'right' }}>{b.total ? fmt(b.total, { compact: true }) : ''}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ComparePanel({ compare }: { compare: NonNullable<ReturnType<typeof caseById>>['compare'] }) {
  const fmt = useMoney();
  if (!compare) return null;
  const results = compare.map((c) => ({ label: c.label, r: analyzeLeverage(c.input) }));
  const ys = [1, 3, 5, 7, 10].filter((y) => y <= compare[0].input.holdYears);
  return (
    <Panel tight tone="gold">
      <div className="eyebrow" style={{ marginBottom: 10 }}>Side by side · analyzeLeverage · base case ({pct(compare[0].input.appreciation)} appreciation)</div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Metric</th>{results.map((r) => <th key={r.label} className="num">{r.label}</th>)}</tr></thead>
          <tbody>
            <tr><td>Equity invested</td>{results.map((r) => <td key={r.label} className="num">{fmt(r.r.totalEquityIn, { compact: true })}</td>)}</tr>
            <tr><td>Year-1 cash flow</td>{results.map((r) => <td key={r.label} className="num">{fmt(r.r.years[0].cashFlow, { compact: true })}</td>)}</tr>
            <tr><td>Year-1 cash-on-cash</td>{results.map((r) => <td key={r.label} className="num">{pct(r.r.yearOneCashOnCash)}</td>)}</tr>
            <tr><td>Year-1 DSCR</td>{results.map((r) => <td key={r.label} className="num">{isFinite(r.r.yearOneDscr) ? ratio(r.r.yearOneDscr) : '—'}</td>)}</tr>
            {ys.map((y) => <tr key={y}><td>Equity, end of year {y}</td>{results.map((r) => <td key={r.label} className="num">{fmt(r.r.years[y - 1].equity, { compact: true })}</td>)}</tr>)}
            <tr><td>Approx. IRR on equity</td>{results.map((r) => <td key={r.label} className="num" style={{ color: 'var(--gold-2)' }}>{pct(r.r.loan.periodicPayment > 0 ? r.r.leveragedIrrApprox : r.r.unleveredIrrApprox)}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="tiny muted" style={{ margin: '10px 0 0' }}>Change appreciation, rate and LTV in the <Link to={`${STUDIO_BASE}/leverage`}>Leverage Calculator</Link>. The financed case is not recommended by default.</p>
    </Panel>
  );
}

export default function CasePage() {
  const { id } = useParams();
  const c = id ? caseById(id) : undefined;
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { setStage(0); setPlaying(false); }, [id]);
  useEffect(() => {
    if (!playing || !c) return;
    const t = setInterval(() => setStage((s) => { if (s >= c.stages.length - 1) { setPlaying(false); return s; } return s + 1; }), 7000);
    return () => clearInterval(t);
  }, [playing, c]);
  if (!c) return <div className="container ds-page"><EmptyState title={`Case “${id}” does not exist`} body="Cases are A through E." action={<Link className="btn" to={`${STUDIO_BASE}/cases`}>All cases</Link>} /></div>;
  const s = c.stages[stage];
  const idx = DEBT_CASES.findIndex((x) => x.id === c.id);
  const prevCase = DEBT_CASES[idx - 1], nextCase = DEBT_CASES[idx + 1];
  return (
    <div className="container ds-page">
      <div className="ds-page-head stack fade-up" style={{ gap: 10 }}>
        <Link to={`${STUDIO_BASE}/cases`} className="tiny muted">← All cases</Link>
        <div className="eyebrow">Case {c.id}</div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.6vw, 3.8rem)' }}>{c.title}</h1>
        <p className="lede" style={{ maxWidth: 820 }}>{c.persona}</p>
        <p className="small" style={{ maxWidth: 820, color: 'var(--ivory-3)' }}>{c.summary}</p>
        <ObjectiveTags objectives={c.objectives} />
      </div>

      <div className="row between">
        <div className="eyebrow">Stage {stage + 1} of {c.stages.length}</div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm ghost" disabled={stage === 0} onClick={() => setStage((x) => x - 1)}>← Previous</button>
          <button className={`btn sm ${playing ? 'active' : ''}`} onClick={() => setPlaying((p) => !p)}>{playing ? '❚❚ Pause' : '▶ Play stages'}</button>
          <button className="btn sm ghost" disabled={stage === c.stages.length - 1} onClick={() => setStage((x) => x + 1)}>Next →</button>
        </div>
      </div>
      <div className="ds-scrubber" role="tablist" aria-label="Case stages">
        {c.stages.map((st, i) => (
          <button key={st.id} role="tab" aria-selected={i === stage} className={`ds-scrub-step ${i < stage ? 'done' : ''} ${i === stage ? 'current' : ''}`} onClick={() => { setStage(i); setPlaying(false); }}>
            <span className="n">{i + 1}</span><span className="l">{st.timing}</span>
          </button>
        ))}
      </div>

      <div key={s.id} className="stack fade-up" style={{ gap: 18 }}>
        <div className="row between"><h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>{s.title}</h2><Chip tone="gold">{s.timing}</Chip></div>
        <div style={{ maxWidth: 860 }}>{s.narrative.map((p, i) => <p key={i} style={{ fontSize: '1.02rem', lineHeight: 1.7 }}>{p}</p>)}</div>

        {s.metrics && <div className="ds-kpi-row">{s.metrics.map((m) => <div key={m.label} className="stat"><span className="label">{m.label}</span><span className="value" style={{ fontSize: '1.1rem', color: m.tone === 'red' ? '#e7a398' : m.tone === 'green' ? 'var(--green-2)' : m.tone === 'amber' ? 'var(--amber)' : m.tone === 'gold' ? 'var(--gold-2)' : undefined }}>{m.value}</span></div>)}</div>}

        <ErrorBoundary title="Balance sheet failed to render">
          {s.entities?.length ? <EntitySheets entities={s.entities} /> : (s.balanceSheet.assets.length > 0 ? <Sheet sheet={s.balanceSheet} title="Balance sheet" /> : null)}
        </ErrorBoundary>

        <div className="ds-two">
          <ErrorBoundary title="Cash flow failed to render"><CashFlow lines={s.cashFlow} /></ErrorBoundary>
          <div className="stack" style={{ gap: 12 }}>
            <Panel tight tone="warn"><div className="eyebrow amber" style={{ marginBottom: 8 }}>Warnings</div><ul style={{ margin: 0, paddingLeft: 18 }}>{s.warnings.map((w, i) => <li key={i} className="small" style={{ marginBottom: 6 }}>{w}</li>)}</ul></Panel>
            <Panel tight><div className="eyebrow" style={{ marginBottom: 8 }}>Tradeoffs</div><ul style={{ margin: 0, paddingLeft: 18 }}>{s.tradeoffs.map((w, i) => <li key={i} className="small" style={{ marginBottom: 6 }}>{w}</li>)}</ul></Panel>
          </div>
        </div>

        <ErrorBoundary title="Debt table failed to render"><DebtTable debts={s.debts} /></ErrorBoundary>
        <ErrorBoundary title="Maturity ladder failed to render"><MaturityLadder debts={s.debts} /></ErrorBoundary>
        {c.compare && stage >= 1 && <ErrorBoundary title="Comparison failed to render"><ComparePanel compare={c.compare} /></ErrorBoundary>}

        {s.decision && (
          <Panel tone="gold">
            <div className="eyebrow" style={{ marginBottom: 8 }}>The decision</div>
            <h3 style={{ marginBottom: 14 }}>{s.decision.question}</h3>
            <div className="grid grid-3">
              {s.decision.options.map((o) => (
                <div key={o.label} className="panel tight" style={{ borderColor: o.tone === 'green' ? 'rgba(62,160,118,0.5)' : o.tone === 'red' ? 'rgba(194,90,76,0.5)' : 'rgba(209,154,58,0.5)' }}>
                  <div className="row between" style={{ marginBottom: 8 }}><strong>{o.label}</strong>{o.tone && <Chip tone={o.tone}>{o.tone === 'green' ? 'Chosen / sound' : o.tone === 'red' ? 'Rejected' : 'Tradeoff'}</Chip>}</div>
                  <p className="small" style={{ margin: 0 }}>{o.consequence}</p>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {stage === c.stages.length - 1 && (
        <div className="stack fade-up" style={{ marginTop: 32, gap: 14 }}>
          <h3>What this case teaches</h3>
          <div className="grid grid-2">{c.takeaways.map((t, i) => <div key={i} className="panel tight row" style={{ gap: 12, alignItems: 'flex-start' }}><span className="mono gold small">{String(i + 1).padStart(2, '0')}</span><span className="small">{t}</span></div>)}</div>
          <div className="row" style={{ gap: 8 }}>
            {c.relatedLessons.map((n) => <Link key={n} className="btn sm" to={`${STUDIO_BASE}/lessons/${n}`}>Lesson {String(n).padStart(2, '0')}</Link>)}
            {c.relatedTools.map((t) => <Link key={t.to} className="btn sm ghost" to={t.to}>{t.label} →</Link>)}
          </div>
        </div>
      )}

      <div style={{ marginTop: 28 }}><Disclaimer>All families and figures are fictional teaching models. Loan payments are computed with the platform’s finance library; thresholds quoted are illustrative ranges, not lender policy.</Disclaimer></div>
      <div className="row between" style={{ marginTop: 20 }}>
        {prevCase ? <Link to={`${STUDIO_BASE}/cases/${prevCase.id}`} className="btn">← Case {prevCase.id}: {prevCase.title}</Link> : <span />}
        {nextCase ? <Link to={`${STUDIO_BASE}/cases/${nextCase.id}`} className="btn primary">Case {nextCase.id}: {nextCase.title} →</Link> : <Link to={`${STUDIO_BASE}/jurisdictions`} className="btn primary">Jurisdictions →</Link>}
      </div>
    </div>
  );
}
