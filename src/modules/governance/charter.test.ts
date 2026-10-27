import { describe, it, expect } from 'vitest';
import { buildCharterMarkdown, completion, parseDraft } from './charter';
import { GOV_COMPONENTS } from './components';

describe('governance charter', () => {
  it('has ten components each with fields, clause and questions', () => {
    expect(GOV_COMPONENTS.length).toBe(10);
    for (const c of GOV_COMPONENTS) {
      expect(c.fields.length).toBeGreaterThan(0);
      expect(c.clause.startsWith('ILLUSTRATIVE')).toBe(true);
      expect(c.questions.length).toBeGreaterThan(0);
    }
  });
  it('parses invalid json to an empty draft', () => {
    expect(parseDraft('not json')).toEqual({});
    expect(parseDraft(undefined)).toEqual({});
  });
  it('counts completion', () => {
    const c = completion({ constitution: { familyName: 'Test' } });
    expect(c.filled).toBe(1);
    expect(c.total).toBe(GOV_COMPONENTS.reduce((s, x) => s + x.fields.length, 0));
  });
  it('builds markdown with the family name and open questions', () => {
    const md = buildCharterMarkdown({ constitution: { familyName: 'The Mbeki family', preamble: 'We hold capital together.' } }, new Date('2026-01-01'));
    expect(md).toContain('# The Mbeki family — Family Governance Charter (DRAFT)');
    expect(md).toContain('**Preamble');
    expect(md).toContain('Open questions for the family');
    expect(md).toContain('2026-01-01');
  });
});
