import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { CHAPTERS } from '@/content/chapters/manifest';
import { CurrencyToggle } from '@/components/ui';

const NAV: { to: string; label: string; group: 'learn' | 'lab' | 'knowledge' }[] = [
  { to: '/academy', label: 'Academy', group: 'learn' },
  { to: '/cases', label: 'Case Studies', group: 'learn' },
  { to: '/timeline', label: '100-Year Timeline', group: 'learn' },
  { to: '/map', label: 'Architecture Map', group: 'lab' },
  { to: '/lab', label: 'Structure Lab', group: 'lab' },
  { to: '/money-flow', label: 'Money Flow', group: 'lab' },
  { to: '/waterfall', label: 'Capital Waterfall', group: 'lab' },
  { to: '/family-bank', label: 'Family Bank', group: 'lab' },
  { to: '/trust-explorer', label: 'Trust Explorer', group: 'lab' },
  { to: '/liability', label: 'Liability Simulator', group: 'lab' },
  { to: '/debt-credit-studio', label: 'Debt & Credit Studio', group: 'lab' },
  { to: '/claims', label: 'Claim Checker', group: 'knowledge' },
  { to: '/jurisdictions', label: 'Jurisdictions', group: 'knowledge' },
  { to: '/governance', label: 'Governance Center', group: 'knowledge' },
  { to: '/sources', label: 'Source Vault', group: 'knowledge' },
  { to: '/research', label: 'Research Workspace', group: 'knowledge' },
];

export default function AppShell() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const progress = useAppStore((s) => s.progress);
  const completed = CHAPTERS.filter((c) => progress[c.id]?.completed).length;
  const immersive = pathname.startsWith('/present') || pathname.includes('/debt-credit-studio/present');
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);

  if (immersive) return <Outlet />;

  return (
    <>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--nav-h)', zIndex: 100, background: 'rgba(6,7,10,0.72)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--line)' }}>
        <div className="container row between" style={{ height: '100%', flexWrap: 'nowrap' }}>
          <NavLink to="/" className="row" style={{ gap: 12, color: 'var(--ivory)', flexWrap: 'nowrap' }}>
            <Monogram />
            <span className="display" style={{ fontSize: '1.05rem', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>The 100-Year Family Wealth Architecture</span>
          </NavLink>
          <nav className="row" style={{ gap: 4, flexWrap: 'nowrap' }}>
            <span className="tiny muted mono" style={{ marginRight: 8 }} title="Chapters completed">{completed}/{CHAPTERS.length}</span>
            <NavLink to="/academy" className={({ isActive }) => `btn sm ${isActive ? 'active' : 'ghost'}`}>Academy</NavLink>
            <NavLink to="/lab" className={({ isActive }) => `btn sm ${isActive ? 'active' : 'ghost'}`} style={{ display: 'none' }} id="nav-lab">Lab</NavLink>
            <NavLink to="/present" className="btn sm primary">Present</NavLink>
            <button className="btn sm" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Open menu">☰ Menu</button>
          </nav>
        </div>
      </header>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div onClick={(e) => e.stopPropagation()} className="fade-up" style={{ position: 'absolute', top: 'var(--nav-h)', right: 0, width: 'min(960px, 100%)', background: 'var(--bg-1)', borderLeft: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: 28, maxHeight: 'calc(100vh - var(--nav-h))', overflow: 'auto' }}>
            <div className="grid grid-3">
              {(['learn', 'lab', 'knowledge'] as const).map((g) => (
                <div key={g} className="stack" style={{ gap: 6 }}>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>{g === 'learn' ? 'Learn' : g === 'lab' ? 'Laboratory' : 'Knowledge systems'}</div>
                  {NAV.filter((n) => n.group === g).map((n) => (
                    <NavLink key={n.to} to={n.to} className={({ isActive }) => `btn ${isActive ? 'active' : 'ghost'}`} style={{ justifyContent: 'flex-start', borderRadius: 10 }}>{n.label}</NavLink>
                  ))}
                </div>
              ))}
            </div>
            <hr className="hairline" style={{ margin: '20px 0' }} />
            <div className="row between">
              <div className="row" style={{ gap: 10 }}><span className="tiny muted">Display currency</span><CurrencyToggle /></div>
              <NavLink to="/present" className="btn primary sm">Open Presentation Mode →</NavLink>
            </div>
          </div>
        </div>
      )}

      <main><Outlet /></main>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '40px 0', marginTop: 40 }}>
        <div className="container stack" style={{ gap: 12 }}>
          <div className="row between">
            <div className="row" style={{ gap: 10 }}><Monogram /><span className="display">Create. Control. Protect. Compound. Transfer.</span></div>
            <span className="tiny muted">Educational platform · Not legal, tax or investment advice</span>
          </div>
          <p className="tiny muted" style={{ maxWidth: 900 }}>
            Every structure shown here is a teaching model. Legal, tax and asset-protection outcomes depend on jurisdiction, residence, citizenship, facts, documentation and timing. Nothing here recommends a jurisdiction, entity or transaction. Engage licensed counsel, tax advisers and fiduciaries before acting.
          </p>
        </div>
      </footer>
    </>
  );
}

export function Monogram({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <rect x="2" y="2" width="36" height="36" rx="6" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
      <path d="M20 8 L31 20 L20 32 L9 20 Z" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
      <circle cx="20" cy="20" r="3" fill="var(--gold)" />
      <path d="M20 8 V32 M9 20 H31" stroke="var(--gold)" strokeWidth="0.6" opacity="0.6" />
    </svg>
  );
}
