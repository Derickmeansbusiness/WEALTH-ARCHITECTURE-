/** Safe dotted-path readers for saved-scenario payloads (used by Compare tables). */
export function path(d: unknown, p: string): unknown {
  return p.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), d);
}
export function num(d: unknown, p: string): number {
  const v = path(d, p);
  return typeof v === 'number' ? v : NaN;
}
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
