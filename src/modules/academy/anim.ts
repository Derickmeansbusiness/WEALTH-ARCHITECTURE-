import { useEffect, useRef, useState } from 'react';

export const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * A staged animation driver. Returns the current stage, an eased progress 0..1 inside that stage,
 * and controls. Auto-advances through `stages` steps every `ms` milliseconds while playing.
 */
export function useStages(stages: number, ms = 2600, autoplay = true) {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [t, setT] = useState(0);
  const startRef = useRef<number>(0);

  // Progress inside the stage.
  useEffect(() => {
    let raf = 0;
    startRef.current = performance.now();
    const tick = (now: number) => {
      const p = clamp01((now - startRef.current) / Math.min(ms * 0.55, 1400));
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, ms]);

  // Auto-advance.
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStage((s) => (s + 1) % stages), ms);
    return () => window.clearTimeout(id);
  }, [playing, stage, stages, ms]);

  return {
    stage, t: easeOut(t), raw: t, playing,
    setStage: (s: number) => { setStage(((s % stages) + stages) % stages); },
    next: () => setStage((s) => (s + 1) % stages),
    prev: () => setStage((s) => (s - 1 + stages) % stages),
    toggle: () => setPlaying((p) => !p),
  };
}

/** Continuous clock in seconds for ambient motion. */
export function useClock(running = true) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0; const start = performance.now();
    const tick = (now: number) => { setS((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return s;
}
