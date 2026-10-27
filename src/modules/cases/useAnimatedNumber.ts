import { useEffect, useRef, useState } from 'react';

/** Smoothly animates toward a target number (rAF, eased). */
export function useAnimatedNumber(target: number, ms = 900) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const a = from.current; const start = performance.now(); let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms); const e = 1 - Math.pow(1 - p, 3);
      const cur = a + (target - a) * e; setV(cur); from.current = cur;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
