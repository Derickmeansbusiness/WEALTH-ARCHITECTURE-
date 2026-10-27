import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Slide } from '@/types/present';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/ui';

/**
 * Minimal local fallback deck used only if the shared PresentDeck cannot be loaded.
 * Full-screen · ←/→/space · step support · progress bar · notes toggle (store.presenterNotes) · URL sync.
 */
export default function SimpleDeck({ slides, basePath }: { slides: Slide[]; basePath: string }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const notes = useAppStore((s) => s.presenterNotes);
  const toggleNotes = useAppStore((s) => s.togglePresenterNotes);
  const fromUrl = useMemo(() => { const m = pathname.slice(basePath.length).match(/^\/?(\d+)/); return m ? Math.max(0, Math.min(slides.length - 1, parseInt(m[1], 10) - 1)) : 0; }, [pathname, basePath, slides.length]);
  const [i, setI] = useState(fromUrl);
  const [step, setStep] = useState(0);
  useEffect(() => { setI(fromUrl); }, [fromUrl]);
  useEffect(() => { navigate(`${basePath}/${i + 1}`, { replace: true }); setStep(0); }, [i, basePath, navigate]);
  const slide = slides[i];
  const steps = slide?.steps ?? 1;
  const next = useCallback(() => { if (step < steps - 1) setStep((s) => s + 1); else if (i < slides.length - 1) setI((x) => x + 1); }, [step, steps, i, slides.length]);
  const prev = useCallback(() => { if (step > 0) setStep((s) => s - 1); else if (i > 0) setI((x) => x - 1); }, [step, i]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', ' ', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === 'Home') setI(0); else if (e.key === 'End') setI(slides.length - 1);
      else if (e.key.toLowerCase() === 'n') toggleNotes();
      else if (e.key.toLowerCase() === 'f') { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, slides.length, toggleNotes]);
  if (!slide) return <div className="ds-deck"><div className="ds-deck-stage"><EmptyState title="No slides in this deck" action={<Link className="btn" to="/debt-credit-studio">Back to the studio</Link>} /></div></div>;
  const total = slides.reduce((s, x) => s + (x.minutes ?? 1), 0);
  const elapsed = slides.slice(0, i).reduce((s, x) => s + (x.minutes ?? 1), 0);
  const V = slide.Visual;
  return (
    <div className="ds-deck" role="application" aria-label="Presentation">
      <div className="ds-deck-progress"><div style={{ width: `${((i + (step + 1) / steps) / slides.length) * 100}%` }} /></div>
      <div className="ds-deck-top">
        <span>{slide.section}</span>
        <span className="mono">{i + 1} / {slides.length} · step {step + 1}/{steps} · ≈{elapsed}′ of {total}′</span>
      </div>
      <div className="ds-deck-stage" onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); if (e.clientX - r.left < r.width / 3) prev(); else next(); }}>
        <div className="ds-deck-title" key={slide.id}>{slide.title}</div>
        <div className="ds-deck-visual" key={`${slide.id}-v`}><V step={step} active /></div>
        {notes && slide.notes && <aside className="ds-deck-notes" onClick={(e) => e.stopPropagation()}><div className="eyebrow" style={{ marginBottom: 6 }}>Presenter notes</div><ul style={{ margin: 0, paddingLeft: 16 }}>{slide.notes.map((n, k) => <li key={k}>{n}</li>)}</ul></aside>}
      </div>
      <div className="ds-deck-bottom">
        <Link to="/debt-credit-studio" className="btn sm ghost">✕ Exit</Link>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm" onClick={prev} disabled={i === 0 && step === 0}>← Prev</button>
          <button className={`btn sm ${notes ? 'active' : ''}`} onClick={toggleNotes}>Notes (n)</button>
          <button className="btn sm primary" onClick={next} disabled={i === slides.length - 1 && step === steps - 1}>Next →</button>
        </div>
        <span className="tiny muted">← → space · n notes · f fullscreen</span>
      </div>
    </div>
  );
}
