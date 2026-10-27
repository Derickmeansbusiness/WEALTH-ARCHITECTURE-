import { GOV_COMPONENTS } from './components';

export type CharterDraft = Record<string, Record<string, string>>; // componentId → fieldId → value

export const CHARTER_NOTE_KEY = 'governance-charter';

export function parseDraft(json: string | undefined): CharterDraft {
  if (!json) return {};
  try {
    const v = JSON.parse(json);
    return v && typeof v === 'object' ? (v as CharterDraft) : {};
  } catch { return {}; }
}

export function completion(draft: CharterDraft): { filled: number; total: number; byComponent: Record<string, number> } {
  let filled = 0, total = 0; const byComponent: Record<string, number> = {};
  for (const c of GOV_COMPONENTS) {
    let f = 0;
    for (const fld of c.fields) { total++; if ((draft[c.id]?.[fld.id] ?? '').trim()) { filled++; f++; } }
    byComponent[c.id] = c.fields.length ? f / c.fields.length : 0;
  }
  return { filled, total, byComponent };
}

/** Assemble a printable Markdown charter from the draft. Empty fields are listed as open questions. */
export function buildCharterMarkdown(draft: CharterDraft, date = new Date()): string {
  const family = draft.constitution?.familyName?.trim() || 'The Family';
  const lines: string[] = [];
  lines.push(`# ${family} — Family Governance Charter (DRAFT)`);
  lines.push('');
  lines.push(`_Draft generated ${date.toISOString().slice(0, 10)}. This is an educational working draft, not a legal instrument. It creates no rights or obligations. Where it conflicts with any trust deed, shareholders' agreement or operating agreement, that document prevails. Review with counsel before adoption._`);
  lines.push('');
  GOV_COMPONENTS.forEach((c, i) => {
    lines.push(`## ${i + 1}. ${c.title}`);
    lines.push('');
    lines.push(`_${c.what}_`);
    lines.push('');
    const open: string[] = [];
    for (const f of c.fields) {
      const v = (draft[c.id]?.[f.id] ?? '').trim();
      if (v) { lines.push(`**${f.label}.** ${v}`); lines.push(''); } else open.push(f.label);
    }
    if (open.length) {
      lines.push('**Open questions for the family:**');
      for (const q of open) lines.push(`- ${q}`);
      lines.push('');
    }
  });
  lines.push('---');
  lines.push('');
  lines.push('_Educational draft produced with The 100-Year Family Wealth Architecture. Not legal, tax or investment advice._');
  return lines.join('\n');
}
