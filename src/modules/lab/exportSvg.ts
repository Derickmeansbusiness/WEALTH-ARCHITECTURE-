/** Serialize a live canvas <svg> to a standalone .svg string with CSS variables resolved and fonts/colours inlined. */

const VAR_RE = /var\((--[a-z0-9-]+)\)/gi;

export function resolveCssVars(text: string): string {
  const root = getComputedStyle(document.documentElement);
  return text.replace(VAR_RE, (_, name: string) => root.getPropertyValue(name).trim() || '#c9a961');
}

const EXPORT_CSS = `
  text { font-family: Inter, system-ui, sans-serif; }
  .sc-label { font-size: 12px; font-weight: 500; }
  .sc-kind, .sc-sub { font-size: 9px; letter-spacing: 0.04em; }
  .sc-short { font-size: 9px; font-weight: 600; letter-spacing: 0.08em; font-family: ui-monospace, Menlo, monospace; }
  .sc-value, .sc-pct { font-size: 10px; font-family: ui-monospace, Menlo, monospace; }
  .sc-badge { font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; }
  .sc-edge-label rect { fill: #0b0d12; stroke: rgba(243,236,220,0.12); }
  .sc-edge-label text { font-size: 9px; letter-spacing: 0.08em; font-weight: 500; }
  .sc-edge-line { fill: none; }
  .sc-edge-hit, .sc-port, .sc-connect-preview, .sc-hint, .sc-grid { display: none; }
  .sc-fence rect { fill: rgba(62,160,118,0.04); stroke: rgba(62,160,118,0.55); stroke-dasharray: 6 5; }
  .sc-fence.breached rect { fill: rgba(194,90,76,0.05); stroke: rgba(194,90,76,0.7); }
  .sc-fence text { font-size: 8px; letter-spacing: 0.16em; fill: rgba(62,160,118,0.8); }
  .sc-fence.breached text { fill: rgba(194,90,76,0.9); }
`;

export function serializeCanvas(svg: SVGSVGElement, title: string): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const r = svg.getBoundingClientRect();
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(Math.round(r.width)));
  clone.setAttribute('height', String(Math.round(r.height)));
  clone.setAttribute('viewBox', `0 0 ${Math.round(r.width)} ${Math.round(r.height)}`);
  clone.removeAttribute('style');
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '100%'); bg.setAttribute('height', '100%'); bg.setAttribute('fill', '#06070a');
  clone.insertBefore(bg, clone.firstChild);
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = EXPORT_CSS;
  clone.insertBefore(style, clone.firstChild);
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  t.textContent = `${title} — The 100-Year Family Wealth Architecture (educational illustration)`;
  clone.insertBefore(t, clone.firstChild);
  const raw = new XMLSerializer().serializeToString(clone);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${resolveCssVars(raw)}`;
}

export function downloadText(filename: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'structure';
