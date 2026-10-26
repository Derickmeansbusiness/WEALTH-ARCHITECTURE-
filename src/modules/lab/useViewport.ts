/**
 * Pan / zoom state for an SVG canvas. Shared by the Structure Lab canvas and the Master Map.
 * World → screen: screen = world * k + (x, y).
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export interface Viewport { x: number; y: number; k: number }
export interface BBox { minX: number; minY: number; maxX: number; maxY: number }

export function useViewport(svgRef: RefObject<SVGSVGElement | null>, opts: { minK?: number; maxK?: number; initial?: Viewport } = {}) {
  const minK = opts.minK ?? 0.15, maxK = opts.maxK ?? 4;
  const [vp, setVpState] = useState<Viewport>(opts.initial ?? { x: 0, y: 0, k: 1 });
  const vpRef = useRef(vp);
  const animRef = useRef<number>(0);

  const setVp = useCallback((next: Viewport | ((v: Viewport) => Viewport)) => {
    const resolved = typeof next === 'function' ? next(vpRef.current) : next;
    const clamped = { ...resolved, k: Math.max(minK, Math.min(maxK, resolved.k)) };
    vpRef.current = clamped;
    setVpState(clamped);
  }, [minK, maxK]);

  const rect = useCallback(() => svgRef.current?.getBoundingClientRect() ?? new DOMRect(0, 0, 1, 1), [svgRef]);

  const toWorld = useCallback((clientX: number, clientY: number) => {
    const r = rect(); const v = vpRef.current;
    return { x: (clientX - r.left - v.x) / v.k, y: (clientY - r.top - v.y) / v.k };
  }, [rect]);

  /** Zoom by factor keeping the screen point (sx, sy) fixed. */
  const zoomAt = useCallback((sx: number, sy: number, factor: number) => {
    cancelAnimationFrame(animRef.current);
    setVp((v) => {
      const k = Math.max(minK, Math.min(maxK, v.k * factor));
      const f = k / v.k;
      return { k, x: sx - (sx - v.x) * f, y: sy - (sy - v.y) * f };
    });
  }, [setVp, minK, maxK]);

  const zoomBy = useCallback((factor: number) => { const r = rect(); zoomAt(r.width / 2, r.height / 2, factor); }, [rect, zoomAt]);

  const animateTo = useCallback((target: Viewport, ms = 650) => {
    cancelAnimationFrame(animRef.current);
    const from = { ...vpRef.current };
    const to = { ...target, k: Math.max(minK, Math.min(maxK, target.k)) };
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms); const e = ease(t);
      setVp({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, k: from.k + (to.k - from.k) * e });
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [setVp, minK, maxK]);

  /** Fit a world bbox into the svg with padding (px). */
  const fitTo = useCallback((b: BBox, padding = 60, animate = true, maxFitK = 1.4) => {
    const r = rect();
    const w = Math.max(1, b.maxX - b.minX), h = Math.max(1, b.maxY - b.minY);
    const k = Math.min(maxFitK, (r.width - padding * 2) / w, (r.height - padding * 2) / h);
    const target = { k, x: (r.width - w * k) / 2 - b.minX * k, y: (r.height - h * k) / 2 - b.minY * k };
    if (animate) animateTo(target); else setVp(target);
  }, [rect, animateTo, setVp]);

  /** Center a world point at a given zoom. */
  const centerOn = useCallback((wx: number, wy: number, k: number, animate = true) => {
    const r = rect();
    const target = { k, x: r.width / 2 - wx * k, y: r.height / 2 - wy * k };
    if (animate) animateTo(target); else setVp(target);
  }, [rect, animateTo, setVp]);

  // Native wheel listener (React's onWheel is passive and cannot preventDefault page scroll).
  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const factor = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016));
        zoomAt(e.clientX - r.left, e.clientY - r.top, factor);
      } else {
        setVp((v) => ({ ...v, x: v.x - e.deltaX }));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [svgRef, zoomAt, setVp]);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return { vp, vpRef, setVp, toWorld, zoomAt, zoomBy, animateTo, fitTo, centerOn, rect };
}

/** Pinch-zoom helper: track two pointers and return a zoom factor + midpoint per move. */
export function pinchState() {
  const pts = new Map<number, { x: number; y: number }>();
  let lastDist = 0;
  return {
    down(id: number, x: number, y: number) { pts.set(id, { x, y }); if (pts.size === 2) lastDist = dist(); },
    move(id: number, x: number, y: number): { factor: number; mx: number; my: number } | null {
      if (!pts.has(id)) return null;
      pts.set(id, { x, y });
      if (pts.size !== 2) return null;
      const d = dist(); const [a, b] = [...pts.values()];
      const out = lastDist > 0 ? { factor: d / lastDist, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 } : null;
      lastDist = d;
      return out;
    },
    up(id: number) { pts.delete(id); lastDist = 0; },
    get count() { return pts.size; },
  };
  function dist() { const [a, b] = [...pts.values()]; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0; }
}

export function bboxOf(points: { x: number; y: number; w?: number; h?: number }[]): BBox {
  if (!points.length) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    const hw = (p.w ?? 0) / 2, hh = (p.h ?? 0) / 2;
    minX = Math.min(minX, p.x - hw); maxX = Math.max(maxX, p.x + hw);
    minY = Math.min(minY, p.y - hh); maxY = Math.max(maxY, p.y + hh);
  }
  return { minX, minY, maxX, maxY };
}
