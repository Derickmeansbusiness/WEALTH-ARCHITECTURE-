import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Slide } from '@/types/present';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/ui';
import { fmtClock, useElapsedSeconds } from './visuals/motion';
import './present.css';

export const STAGE_W = 1920;
export const STAGE_H = 1080;
const TRANSITION_MS = 600;

type Dir = 'fwd' | 'back';

/** Parse the 1-based slide number from a pathname under basePath. Returns 0-based index or 0. */
export function indexFromPath(pathname: string, basePath: string): number {
  const rest = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : '';
  const m = rest.match(/^\/?(\d+)/);
  if (!m) return 0;
  return Math.max(0, parseInt(m[1], 10) - 1);
}

/** Planned cumulative minutes at the start of each slide. */
export function cumulativeMinutes(slides: Slide[]): number[] {
  const out: number[] = []; let acc = 0;
  for (const s of slides) { out.push(acc); acc += s.minutes ?? 1; }
  return out;
}

/** Pacing verdict: 'on' within 60s of plan, 'ahead' or 'behind' otherwise, with the delta in seconds. */
export function pacing(elapsedSeconds: number, plannedMinutesAtStart: number): { state: 'on' | 'ahead' | 'behind'; delta: number } {
  const delta = elapsedSeconds - plannedMinutesAtStart * 60;
  if (Math.abs(delta) < 60) return { state: 'on', delta };
  return { state: delta > 0 ? 'behind' : 'ahead', delta };
}

/** A live slide rendered at a fixed 1920×1080 and scaled to `width`. Used for overview and presenter view. */
export function SlideThumb({ slide, width, step, label }: { slide: Slide; width: number; step?: number; label?: ReactNode }) {
  const s = width / STAGE_W;
  const V = slide.Visual;
  const st = step ?? Math.max(0, (slide.steps ?? 1) - 1);
  return (
    <div className="present-thumb" style={{ width }}>
      <div className="present-thumb-inner" style={{ transform: `scale(${s})` }}>
        <div className="present-layer"><V step={st} active={false} /></div>
      </div>
      {label}
    </div>
  );
}

/**
 * Keynote deck engine. Fixed 1920×1080 design space letterboxed to the viewport; keyboard, touch and
 * URL-synced navigation; progressive builds; presenter notes drawer; presenter view; overview grid.
 * @param slides the deck
 * @param basePath route prefix used for URL sync, e.g. "/present" → "/present/12"
 */
export default function Deck({ slides, basePath: rawBase }: { slides: Slide[]; basePath: string }) {
  const basePath = rawBase.replace(/\/+$/, '');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const presenterNotes = useAppStore((s) => s.presenterNotes);
  const togglePresenterNotes = useAppStore((s) => s.togglePresenterNotes);

  const count = slides.length;
  const rawIndex = indexFromPath(pathname, basePath);
  const index = Math.min(Math.max(0, rawIndex), Math.max(0, count - 1));
  const slide = slides[index];
  const maxStep = Math.max(0, (slide?.steps ?? 1) - 1);

  // ── step + transition state ─────────────────────────────────
  const [step, setStep] = useState(0);
  const stepRef = useRef(0); stepRef.current = step;
  const pendingStep = useRef<number | null>(null);
  const prevIndex = useRef(index);
  const [exiting, setExiting] = useState<{ index: number; dir: Dir; step: number; key: number } | null>(null);
  const [dir, setDir] = useState<Dir>('fwd');

  useEffect(() => {
    if (rawIndex !== index && count > 0) navigate(`${basePath}/${index + 1}`, { replace: true });
  }, [rawIndex, index, count, basePath, navigate]);

  useEffect(() => {
    const prev = prevIndex.current;
    if (prev !== index) {
      const d: Dir = index > prev ? 'fwd' : 'back';
      setDir(d);
      setExiting({ index: prev, dir: d, step: stepRef.current, key: Date.now() });
      const t = window.setTimeout(() => setExiting(null), TRANSITION_MS + 50);
      prevIndex.current = index;
      const target = pendingStep.current;
      pendingStep.current = null;
      setStep(target === null ? 0 : Math.min(target, Math.max(0, (slides[index]?.steps ?? 1) - 1)));
      return () => window.clearTimeout(t);
    }
  }, [index, slides]);

  const goTo = useCallback((i: number, opts: { endStep?: boolean } = {}) => {
    const clamped = Math.min(Math.max(0, i), count - 1);
    if (clamped === index) return;
    pendingStep.current = opts.endStep ? Math.max(0, (slides[clamped]?.steps ?? 1) - 1) : 0;
    navigate(`${basePath}/${clamped + 1}`);
  }, [count, index, slides, navigate, basePath]);

  const next = useCallback(() => {
    if (step < maxStep) setStep(step + 1); else goTo(index + 1);
  }, [step, maxStep, goTo, index]);
  const prev = useCallback(() => {
    if (step > 0) setStep(step - 1); else goTo(index - 1, { endStep: true });
  }, [step, goTo, index]);

  // ── UI state ────────────────────────────────────────────────
  const [overview, setOverview] = useState(false);
  const [help, setHelp] = useState(false);
  const [hud, setHud] = useState(true);
  const [black, setBlack] = useState(false);
  const [presenterView, setPresenterView] = useState(false);
  const [jump, setJump] = useState('');
  const [chrome, setChrome] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const elapsed = useElapsedSeconds(startedAt);
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  // body/document chrome
  useEffect(() => {
    document.documentElement.classList.add('present-active');
    return () => { document.documentElement.classList.remove('present-active'); };
  }, []);

  // stage scale
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const measure = () => { const r = el.getBoundingClientRect(); setScale(Math.min(r.width / STAGE_W, r.height / STAGE_H)); };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [presenterNotes, presenterView]);

  // fullscreen tracking
  useEffect(() => {
    const on = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  // mouse-move chrome (exit link + controls) fades after 2s
  const chromeTimer = useRef(0);
  const onMouseMove = useCallback(() => {
    setChrome(true);
    window.clearTimeout(chromeTimer.current);
    chromeTimer.current = window.setTimeout(() => setChrome(false), 2000);
  }, []);
  useEffect(() => () => window.clearTimeout(chromeTimer.current), []);

  // jump buffer auto-clear
  useEffect(() => {
    if (!jump) return;
    const t = window.setTimeout(() => setJump(''), 3500);
    return () => window.clearTimeout(t);
  }, [jump]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) { setJump((j) => (j + k).slice(0, 3)); e.preventDefault(); return; }
      switch (k) {
        case 'Enter':
          e.preventDefault();
          if (jump) { goTo(parseInt(jump, 10) - 1); setJump(''); } else if (!overview) next();
          return;
        case 'ArrowRight': case ' ': case 'PageDown': case 'ArrowDown':
          e.preventDefault(); if (!overview) next(); return;
        case 'ArrowLeft': case 'PageUp': case 'ArrowUp': case 'Backspace':
          e.preventDefault(); if (!overview) prev(); return;
        case 'Home': e.preventDefault(); goTo(0); return;
        case 'End': e.preventDefault(); goTo(count - 1, { endStep: true }); return;
        case 'n': case 'N': togglePresenterNotes(); return;
        case 'o': case 'O': setOverview((o) => !o); return;
        case 'p': case 'P': setHud((h) => !h); return;
        case 'b': case 'B': case '.': setBlack((b) => !b); return;
        case 'f': case 'F': toggleFullscreen(); return;
        case 'v': case 'V': setPresenterView((v) => !v); return;
        case 't': case 'T': setStartedAt(Date.now()); return;
        case '?': case 'h': case 'H': setHelp((h) => !h); return;
        case 'Escape':
          if (help) { setHelp(false); return; }
          if (overview) { setOverview(false); return; }
          if (jump) { setJump(''); return; }
          if (black) { setBlack(false); return; }
          if (document.fullscreenElement) document.exitFullscreen?.();
          return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, overview, help, black, next, prev, goTo, count, togglePresenterNotes, toggleFullscreen]);

  // touch: swipe
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current; touchStart.current = null; if (!s) return;
    const t = e.changedTouches[0]; const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - s.t < 800) { if (dx < 0) next(); else prev(); }
  };

  const cumul = useMemo(() => cumulativeMinutes(slides), [slides]);
  const totalMinutes = useMemo(() => slides.reduce((s, x) => s + (x.minutes ?? 1), 0), [slides]);
  const pace = pacing(elapsed, cumul[index] ?? 0);
  const nextSlide = slides[index + 1];
  const progress = count > 1 ? index / (count - 1) : 1;

  if (count === 0) {
    return (
      <div className="present-root" ref={rootRef}>
        <div className="present-empty"><EmptyState title="No slides in this deck" body="The deck array is empty." action={<Link to="/" className="btn">Back to the platform</Link>} /></div>
      </div>
    );
  }

  const Current = slide.Visual;
  const ExitingSlide = exiting ? slides[exiting.index] : null;

  return (
    <div className={`present-root ${isFs && !chrome ? 'present-hide-cursor' : ''}`} ref={rootRef} onMouseMove={onMouseMove}>
      {/* progress bar */}
      <div className="present-progress" aria-hidden><i style={{ width: `${progress * 100}%` }} /></div>

      {/* exit link + controls appear on mouse move */}
      <div className={`present-exit ${chrome ? 'on' : ''}`}><Link to="/" className="present-ctl" title="Exit presentation">← Exit</Link></div>
      <div className={`present-controls ${chrome ? 'on' : ''}`}>
        <button className="present-ctl" onClick={toggleFullscreen}><kbd>f</kbd>{isFs ? 'Exit full screen' : 'Full screen'}</button>
        <button className={`present-ctl ${presenterNotes ? 'active' : ''}`} onClick={togglePresenterNotes}><kbd>n</kbd>Notes</button>
        <button className={`present-ctl ${presenterView ? 'active' : ''}`} onClick={() => setPresenterView((v) => !v)}><kbd>v</kbd>Presenter view</button>
        <button className={`present-ctl ${overview ? 'active' : ''}`} onClick={() => setOverview((o) => !o)}><kbd>o</kbd>Overview</button>
        <button className={`present-ctl ${hud ? 'active' : ''}`} onClick={() => setHud((h) => !h)}><kbd>p</kbd>Progress</button>
        <button className="present-ctl" onClick={() => setHelp((h) => !h)}><kbd>?</kbd>Keys</button>
      </div>

      <div className="present-main">
        <div className="present-stage-wrap" ref={wrapRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className={`present-stage ${black ? 'present-black' : ''}`} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${scale})` }} aria-live="polite">
            {ExitingSlide && exiting && (
              <div key={`exit-${exiting.key}`} className={`present-layer exit-${exiting.dir}`}>
                <ExitingSlide.Visual step={exiting.step} active={false} />
              </div>
            )}
            <div key={`cur-${index}`} className={`present-layer enter-${dir}`}>
              <Current step={step} active={!overview && !black} />
            </div>
            <button className="present-tap left" aria-label="Previous" onClick={prev} tabIndex={-1} style={{ border: 0, cursor: 'inherit' }} />
            <button className="present-tap right" aria-label="Next" onClick={next} tabIndex={-1} style={{ border: 0, cursor: 'inherit' }} />
          </div>

          {/* HUD */}
          <div className={`present-hud ${hud && !overview ? 'on' : ''}`}>
            <div>
              <div className="present-hud-section">{slide.section}</div>
              <div className="present-hud-counter" style={{ marginTop: 4 }}><b>{index + 1}</b> / {count}{maxStep > 0 && <span style={{ marginLeft: 12, color: 'var(--muted)' }}>step {step + 1}/{maxStep + 1}</span>}</div>
            </div>
            <div className="present-hud-right">
              <span className={`present-pace ${pace.state}`}>{pace.state === 'on' ? 'on pace' : `${pace.state} ${fmtClock(Math.abs(Math.round(pace.delta)))}`}</span>
              <span>{fmtClock(elapsed)} <span style={{ color: 'var(--muted)' }}>/ {totalMinutes.toFixed(0)} min</span></span>
            </div>
          </div>

          {jump && <div className="present-jump">{jump}<small>Enter to jump · Esc to cancel</small></div>}

          {overview && (
            <Overview slides={slides} index={index} onPick={(i) => { setOverview(false); goTo(i); }} />
          )}
          {help && <Help onClose={() => setHelp(false)} />}
        </div>

        {presenterView && (
          <aside className="present-side">
            <div className="present-clock">{fmtClock(elapsed)}</div>
            <h5>Now · {index + 1} / {count}</h5>
            <SlideThumb slide={slide} width={384} step={step} />
            <h5>Next{nextSlide ? ` · ${nextSlide.title}` : ' · End of deck'}</h5>
            {nextSlide ? <SlideThumb slide={nextSlide} width={384} /> : <div className="present-thumb" style={{ width: 384 }} />}
            <div className="present-meta"><span>plan {slide.minutes ?? 1} min</span><span>{pace.state === 'on' ? 'on pace' : `${pace.state} ${fmtClock(Math.abs(Math.round(pace.delta)))}`}</span></div>
          </aside>
        )}
      </div>

      {presenterNotes && (
        <div className="present-drawer">
          <div>
            <h5>Presenter notes · {slide.section}</h5>
            <div className="present-notes">
              {(slide.notes ?? ['No notes for this slide.']).map((n, i) => <p key={i}>{n}</p>)}
            </div>
          </div>
          <div>
            <h5>Next</h5>
            <div className="present-next">{nextSlide ? nextSlide.title : 'End of deck'}</div>
            <div className="present-meta">
              <span>slide {index + 1}/{count}</span>
              <span>plan {slide.minutes ?? 1} min</span>
              {maxStep > 0 && <span>build {step + 1}/{maxStep + 1}</span>}
              <span>{fmtClock(elapsed)} elapsed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Overview({ slides, index, onPick }: { slides: Slide[]; index: number; onPick: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(280);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => { const width = el.getBoundingClientRect().width; const cols = Math.max(2, Math.floor((width + 16) / 296)); setW((width - 16 * (cols - 1)) / cols); };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { ref.current?.querySelector('.present-overview-item.current')?.scrollIntoView({ block: 'center' }); }, []);
  let lastSection = '';
  return (
    <div className="present-overview" role="dialog" aria-label="Slide overview">
      <div className="present-overview-head"><h3>Overview</h3><span>{slides.length} slides · click to jump · Esc to close</span></div>
      <div className="present-overview-grid" ref={ref} style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${Math.floor(w)}px, 1fr))` }}>
        {slides.map((s, i) => {
          const header = s.section !== lastSection ? <div key={`h-${i}`} className="present-overview-section">{s.section}</div> : null;
          lastSection = s.section;
          return [
            header,
            <button key={s.id + i} className={`present-overview-item ${i === index ? 'current' : ''}`} onClick={() => onPick(i)}>
              <SlideThumb slide={s} width={w} />
              <div className="present-ov-cap"><b>{String(i + 1).padStart(2, '0')}</b><span title={s.title}>{s.title}</span></div>
            </button>,
          ];
        })}
      </div>
    </div>
  );
}

function Help({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ['→  Space  PageDown  Enter', 'Next build step / next slide'],
    ['←  PageUp  Backspace', 'Previous step / previous slide'],
    ['Home / End', 'First / last slide'],
    ['1 2 3 … then Enter', 'Jump to slide number'],
    ['f', 'Toggle full screen'],
    ['n', 'Presenter notes drawer'],
    ['v', 'Presenter view (current + next)'],
    ['o', 'Overview grid of all slides'],
    ['p', 'Progress bar, counter and timer'],
    ['b  or  .', 'Black screen'],
    ['t', 'Reset the timer'],
    ['Esc', 'Close overlay / exit full screen'],
    ['Tap right / left third · swipe', 'Navigate on touch screens'],
  ];
  return (
    <div className="present-help" onClick={onClose} role="dialog" aria-label="Keyboard shortcuts">
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ marginBottom: 14 }}><h3>Keyboard</h3><button className="btn sm ghost" onClick={onClose}>Close</button></div>
        <table><tbody>{rows.map(([k, d]) => <tr key={k}><td>{k}</td><td>{d}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
