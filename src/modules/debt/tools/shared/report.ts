import { FX_NOTE, FX_PER_USD, type Currency } from '@/lib/format';
import type { FormulaItem } from './Formulas';

export interface ReportSpec {
  title: string;
  tool: string;
  inputs: { label: string; value: string }[];
  outputs: { label: string; value: string }[];
  formulas: FormulaItem[];
  assumptions: string[];
  notes?: string[];
}

/** Build a Markdown summary report. Values are pre-formatted strings in the display currency. */
export function buildMarkdown(spec: ReportSpec, currency: Currency, scenarioName?: string): string {
  const ts = new Date();
  const lines: string[] = [];
  lines.push(`# ${spec.title}`);
  lines.push('');
  lines.push(`*The 100-Year Family Wealth Architecture — Debt, Credit & Strategic Leverage Studio · ${spec.tool}*`);
  lines.push('');
  lines.push(`- Generated: ${ts.toISOString()}`);
  if (scenarioName) lines.push(`- Scenario: ${scenarioName}`);
  lines.push(`- Display currency: ${currency}${currency !== 'USD' ? ` (converted from USD at ${FX_PER_USD[currency]} per USD)` : ''}`);
  lines.push('');
  lines.push('## Inputs');
  lines.push('');
  lines.push('| Input | Value |');
  lines.push('|---|---|');
  for (const i of spec.inputs) lines.push(`| ${i.label} | ${i.value} |`);
  lines.push('');
  lines.push('## Outputs');
  lines.push('');
  lines.push('| Output | Value |');
  lines.push('|---|---|');
  for (const o of spec.outputs) lines.push(`| ${o.label} | ${o.value} |`);
  lines.push('');
  lines.push('## Formulas');
  lines.push('');
  for (const f of spec.formulas) lines.push(`- **${f.label}** — \`${f.formula}\`${f.note ? ` — ${f.note}` : ''}`);
  lines.push('');
  lines.push('## Assumptions');
  lines.push('');
  for (const a of spec.assumptions) lines.push(`- ${a}`);
  if (spec.notes && spec.notes.length) {
    lines.push('');
    lines.push('## Notes');
    lines.push('');
    for (const n of spec.notes) lines.push(`- ${n}`);
  }
  lines.push('');
  lines.push('## Exchange-rate note');
  lines.push('');
  lines.push(FX_NOTE);
  lines.push('');
  lines.push('---');
  lines.push('Educational simulation, not advice. Legal and tax outcomes depend on jurisdiction, facts, documentation and timing. Engage qualified counsel, tax advisers and fiduciaries before acting. Illustrative, pre-tax figures; not a lending offer, credit decision or valuation.');
  return lines.join('\n');
}

export function downloadText(filename: string, text: string, type = 'text/markdown') {
  try {
    const blob = new Blob([text], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch {
    // Non-browser environment: silently ignore
  }
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'report';
