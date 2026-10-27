import type { Slide } from '@/types/present';

/** Fixed design space of the stage; slides are authored at this size and scaled with a CSS transform. */
export const STAGE_W = 1920;
export const STAGE_H = 1080;

/** Parse the 1-based slide number from a pathname under basePath. Returns a 0-based index, or 0 when absent. */
export function indexFromPath(pathname: string, basePath: string): number {
  const base = basePath.replace(/\/+$/, '');
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : '';
  const m = rest.match(/^\/?(\d+)/);
  if (!m) return 0;
  return Math.max(0, parseInt(m[1], 10) - 1);
}

/** Planned cumulative minutes at the start of each slide (slides without `minutes` count as 1). */
export function cumulativeMinutes(slides: Slide[]): number[] {
  const out: number[] = []; let acc = 0;
  for (const s of slides) { out.push(acc); acc += s.minutes ?? 1; }
  return out;
}

/** Pacing verdict: 'on' within 60s of plan, otherwise 'ahead' or 'behind', with the signed delta in seconds (positive = behind). */
export function pacing(elapsedSeconds: number, plannedMinutesAtStart: number): { state: 'on' | 'ahead' | 'behind'; delta: number } {
  const delta = elapsedSeconds - plannedMinutesAtStart * 60;
  if (Math.abs(delta) < 60) return { state: 'on', delta };
  return { state: delta > 0 ? 'behind' : 'ahead', delta };
}

/** Clamp a requested index into the deck. */
export const clampIndex = (i: number, count: number) => Math.min(Math.max(0, i), Math.max(0, count - 1));
