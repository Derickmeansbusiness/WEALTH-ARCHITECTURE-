import { useEffect, useRef, useState } from 'react';

/** Debounce a changing value (used to keep heavy recalculation off every keystroke). */
export function useDebounced<T>(value: T, ms = 120): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Tween a number toward its target with requestAnimationFrame. Returns the animated value. */
export function useTween(target: number, ms = 650): number {
  const [v, setV] = useState(target);
  const from = useRef(target);
  const cur = useRef(target);
  useEffect(() => {
    if (!isFinite(target)) { setV(target); cur.current = target; return; }
    const start = performance.now();
    const a = isFinite(cur.current) ? cur.current : target;
    from.current = a;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const next = a + (target - a) * easeOut(p);
      cur.current = next;
      setV(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/** 0..1 draw-in progress that restarts whenever `key` changes. */
export function useDrawIn(key: unknown, ms = 900): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    setP(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setP(easeOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ms]);
  return p;
}
