import { useEffect, useRef, useState } from 'react';

/** True when the viewer prefers reduced motion. Visuals should snap to their final state when this is true. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Count-up animation. Returns a number that animates from 0 (or the previous value) to `target`
 * whenever `active` becomes true or `target` changes. Snaps when reduced motion is preferred.
 */
export function useCountUp(target: number, active: boolean, duration = 1400, delay = 0): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(active ? 0 : target);
  const fromRef = useRef(0);
  useEffect(() => {
    if (!active) { setValue(0); fromRef.current = 0; return; }
    if (reduced || duration <= 0) { setValue(target); fromRef.current = target; return; }
    let raf = 0; let start = 0; const from = fromRef.current;
    const tick = (now: number) => {
      if (!start) start = now + delay;
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const v = from + (target - from) * easeOut(t);
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(tick); else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, delay, reduced]);
  return value;
}

/** Elapsed-time clock in whole seconds since `startedAt` (ms epoch). Ticks every second. */
export function useElapsedSeconds(startedAt: number): number {
  const [s, setS] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setS(Math.max(0, Math.floor((Date.now() - startedAt) / 1000))), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);
  return s;
}

export const fmtClock = (seconds: number) => {
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
