import { describe, it, expect } from 'vitest';
import type { SourceRecord } from '@/types/knowledge';
import { SEED_SOURCES } from '@/content/sources/seed';
import { EMPTY_FILTERS, filterSources, lessonLink, parseImport, parseYear, sortSources, toCSV, validateSource } from './vault';

const mk = (over: Partial<SourceRecord>): SourceRecord => ({
  id: 'x', title: 'T', author: 'A', date: '2020', jurisdiction: 'US', topic: 'tax', category: 'book', claim: '', summary: '', evidenceLevel: 'professional', lessonId: 'ch01', url: '', notes: '', createdAt: 1, ...over,
});

describe('seed integrity', () => {
  it('has at least 40 sources covering all 10 categories with unique ids', () => {
    expect(SEED_SOURCES.length).toBeGreaterThanOrEqual(40);
    const cats = new Set(SEED_SOURCES.map((s) => s.category));
    expect(cats.size).toBe(10);
    expect(new Set(SEED_SOURCES.map((s) => s.id)).size).toBe(SEED_SOURCES.length);
  });
  it('every seed source has a title, category and lessonId', () => {
    for (const s of SEED_SOURCES) { expect(s.title.length).toBeGreaterThan(3); expect(s.category).toBeTruthy(); expect(s.lessonId).toMatch(/^(ch\d{2}|debt-\d{2})$/); }
  });
});

describe('parseYear', () => {
  it('extracts the latest year from loose date strings', () => {
    expect(parseYear('2017')).toBe(2017);
    expect(parseYear('1954 (as amended)')).toBe(1954);
    expect(parseYear('1994 / 1995; amended 2015')).toBe(2015);
    expect(parseYear('Annual')).toBe(0);
  });
});

describe('filterSources', () => {
  it('searches across title, author, claim, summary, notes', () => {
    const list = [mk({ id: 'a', notes: 'mentions Olmstead' }), mk({ id: 'b', summary: 'nothing' })];
    expect(filterSources(list, { ...EMPTY_FILTERS, q: 'olmstead' }).map((s) => s.id)).toEqual(['a']);
  });
  it('applies category, topic, evidence, jurisdiction and lesson filters together', () => {
    const list = [mk({ id: 'a', category: 'court-case', topic: 'trusts', evidenceLevel: 'primary', jurisdiction: 'Florida', lessonId: 'ch11' }), mk({ id: 'b' })];
    expect(filterSources(list, { q: '', category: 'court-case', topic: 'trusts', evidence: 'primary', jurisdiction: 'Florida', lesson: 'ch11' }).map((s) => s.id)).toEqual(['a']);
  });
});

describe('sortSources', () => {
  it('sorts by date descending and by evidence rank', () => {
    const list = [mk({ id: 'old', date: '1999', evidenceLevel: 'unverified' }), mk({ id: 'new', date: '2024', evidenceLevel: 'primary' })];
    expect(sortSources(list, 'date-desc')[0].id).toBe('new');
    expect(sortSources(list, 'date-asc')[0].id).toBe('old');
    expect(sortSources(list, 'evidence')[0].id).toBe('new');
  });
});

describe('lessonLink', () => {
  it('maps chapter ids to academy slugs and debt lessons to the studio', () => {
    expect(lessonLink('ch05')).toEqual({ to: '/academy/entity-architecture', label: 'Ch. 5 · Entities' });
    expect(lessonLink('debt-04')?.to).toBe('/debt-credit-studio/lessons/4');
    expect(lessonLink('nope')).toBeNull();
  });
});

describe('toCSV / parseImport', () => {
  it('escapes commas and quotes', () => {
    const csv = toCSV([mk({ title: 'A, "quoted"' })]);
    expect(csv.split('\n')[1]).toContain('"A, ""quoted"""');
  });
  it('round-trips JSON, skips rows without titles, and defaults bad enums', () => {
    const json = JSON.stringify([{ title: 'Ok', category: 'book', topic: 'nope', evidenceLevel: 'primary' }, { author: 'no title' }, 'junk']);
    const { records, skipped } = parseImport(json, () => 'gen', 5);
    expect(records).toHaveLength(1);
    expect(skipped).toBe(2);
    expect(records[0]).toMatchObject({ id: 'gen', topic: 'tax', category: 'book', evidenceLevel: 'primary', createdAt: 5 });
  });
  it('reports invalid JSON', () => {
    expect(parseImport('{', () => 'x').error).toBeTruthy();
  });
});

describe('validateSource', () => {
  it('requires title and category and sane URL', () => {
    expect(validateSource({})).toHaveLength(2);
    expect(validateSource({ title: 'x', category: 'book', url: 'ftp://x' })).toHaveLength(1);
    expect(validateSource({ title: 'x', category: 'book', url: '' })).toHaveLength(0);
  });
});
