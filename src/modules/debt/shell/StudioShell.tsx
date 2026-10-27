import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppStore, type JurisdictionMode } from '@/store/useAppStore';
import { CurrencyToggle } from '@/components/ui';
import { FX_NOTE } from '@/lib/format';
import { DEBT_LESSONS } from '@/content/debt/lessons';
import { DEBT_JURISDICTION_LABELS } from '@/content/debt/types';

export const STUDIO_BASE = '/debt-credit-studio';

const TABS: { to: string; label: string; group: 'learn' | 'tools' | 'reference'; end?: boolean }[] = [
  { to: '', label: 'Studio', group: 'learn', end: true },
  { to: '/lessons', label: 'Lessons', group: 'learn' },
  { to: '/cases', label: 'Cases', group: 'learn' },
  { to: '/leverage', label: 'Leverage', group: 'tools' },
  { to: '/stress-test', label: 'Stress Test', group: 'tools' },
  { to: '/credit-profile', label: 'Credit Profile', group: 'tools' },
  { to: '/capital-stack', label: 'Capital Stack', group: 'tools' },
  { to: '/financing-map', label: 'Financing Map', group: 'tools' },
  { to: '/decision', label: 'Decision', group: 'tools' },
  { to: '/dashboard', label: 'Dashboard', group: 'tools' },
  { to: '/jurisdictions', label: 'Jurisdictions', group: 'reference' },
  { to: '/sources', label: 'Sources', group: 'reference' },
];

export function JurisdictionSelect({ compact }: { compact?: boolean }) {
  const mode = useAppStore((s) => s.jurisdictionMode);
  const set = useAppStore((s) => s.setJurisdictionMode);
  return (
    <label className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
      {!compact && <span className="tiny muted" style={{ whiteSpace: 'nowrap' }}>Jurisdiction</span>}
      <select className="ds-select" value={mode} onChange={(e) => set(e.target.value as JurisdictionMode)} aria-label="Jurisdiction mode">
        {(Object.keys(DEBT_JURISDICTION_LABELS) as JurisdictionMode[]).map((j) => <option key={j} value={j}>{DEBT_JURISDICTION_LABELS[j]}</option>)}
      </select>
    </label>
  );
}

export function FxCurrency() {
  return (
    <div className="ds-fx-tip" tabIndex={0} aria-describedby="ds-fx-note">
      <CurrencyToggle />
      <div className="ds-fx-bubble" id="ds-fx-note" role="tooltip"><strong style={{ color: 'var(--gold-2)' }}>Exchange-rate assumption. </strong>{FX_NOTE}</div>
    </div>
  );
}

export function LessonProgressDots() {
  const progress = useAppStore((s) => s.progress);
  const done = DEBT_LESSONS.filter((l) => progress[l.id]?.completed).length;
  return (
    <Link to={`${STUDIO_BASE}/lessons`} className="row" style={{ gap: 8, flexWrap: 'nowrap', color: 'inherit' }} title={`${done} of ${DEBT_LESSONS.length} lessons complete`}>
      <span className="ds-progress-dots" aria-label="Lesson progress">
        {DEBT_LESSONS.map((l) => { const p = progress[l.id]; return <span key={l.id} className={`ds-progress-dot ${p?.completed ? 'done' : p?.visited ? 'visited' : ''}`} />; })}
      </span>
      <span className="tiny muted mono">{done}/{DEBT_LESSONS.length}</span>
    </Link>
  );
}

export default function StudioShell() {
  const { pathname } = useLocation();
  return (
    <div className="ds-root">
      <div className="ds-subnav">
        <div className="container ds-subnav-inner">
          <Link to={STUDIO_BASE} className="ds-subnav-brand">
            <StudioMark />
            <span className="stack" style={{ gap: 0 }}>
              <span className="ds-brand-sub">Chapter 04 · Studio</span>
              <span className="ds-brand-title">Debt, Credit &amp; Strategic Leverage</span>
            </span>
          </Link>
          <nav className="ds-tabs" aria-label="Studio sections">
            {(['learn', 'tools', 'reference'] as const).map((g) => (
              <span key={g} className="row" style={{ gap: 2, flexWrap: 'nowrap' }}>
                <span className="ds-tab-group">{g === 'learn' ? 'Learn' : g === 'tools' ? 'Tools' : 'Ref'}</span>
                {TABS.filter((t) => t.group === g).map((t) => (
                  <NavLink key={t.to} to={`${STUDIO_BASE}${t.to}`} end={t.end} className={({ isActive }) => `ds-tab ${isActive ? 'active' : ''}`}>{t.label}</NavLink>
                ))}
              </span>
            ))}
            <Link to={`${STUDIO_BASE}/present`} className="ds-tab" style={{ color: 'var(--gold)' }}>Present ▸</Link>
          </nav>
          <div className="ds-subnav-controls">
            <LessonProgressDots />
            <JurisdictionSelect />
            <FxCurrency />
          </div>
        </div>
      </div>
      <Outlet key={pathname.split('/').slice(0, 3).join('/')} />
      <div className="container" style={{ paddingBottom: 48 }}>
        <hr className="hairline" />
        <div className="row between">
          <span className="tiny muted">Part of <Link to="/academy/debt-credit-leverage">Chapter 04 — Debt, Credit &amp; Strategic Leverage</Link> in the Academy.</span>
          <span className="tiny muted">Educational simulations · not legal, tax or investment advice · {FX_NOTE.split('.')[0]}.</span>
        </div>
      </div>
    </div>
  );
}

export function StudioMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <rect x="2" y="2" width="36" height="36" rx="6" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
      <rect x="10" y="22" width="6" height="10" fill="var(--gold)" opacity="0.9" />
      <rect x="18" y="14" width="6" height="18" fill="var(--amber)" opacity="0.9" />
      <rect x="26" y="8" width="6" height="24" fill="var(--ivory-2)" opacity="0.9" />
    </svg>
  );
}
