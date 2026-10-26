import { useEffect, useRef, useState } from 'react';

/**
 * Progress 0..1 that starts when the element enters the viewport, then (optionally) loops.
 * Uses requestAnimationFrame; respects reduced motion by jumping to 1.
 */
export function useInViewProgress<T extends Element = HTMLDivElement>(durationMs: number, opts: { loop?: boolean; restartKey?: unknown; delayMs?: number } = {}) {
  const ref = useRef<T | null>(null);
  const [t, setT] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setVisible(true); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setT(1); return; }
    let raf = 0;
    const start = performance.now() + (opts.delayMs ?? 0);
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      let p = elapsed / durationMs;
      if (opts.loop) p = p % 1; else p = Math.min(1, p);
      setT(p);
      if (opts.loop || p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, durationMs, opts.loop, opts.restartKey]);
  return { ref, t, visible };
}

/** Eased helpers */
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** sub-progress for a segment [a,b] of the master progress */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
