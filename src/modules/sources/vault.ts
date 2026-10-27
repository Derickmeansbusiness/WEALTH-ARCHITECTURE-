import type { SourceRecord, SourceCategory, EvidenceLevel, Topic } from '@/types/knowledge';
import { EVIDENCE_ORDER } from '@/content/sources/seed';
import { chapterById } from '@/content/chapters/manifest';

export interface VaultFilters {
  q: string;
  category: SourceCategory | 'all';
  topic: Topic | 'all';
  evidence: EvidenceLevel | 'all';
  jurisdiction: string; // '' = all
  lesson: string;       // '' = all
}

export const EMPTY_FILTERS: VaultFilters = { q: '', category: 'all', topic: 'all', evidence: 'all', jurisdiction: '', lesson: '' };

export type VaultSort = 'date-desc' | 'date-asc' | 'evidence' | 'title';

/** Pulls a sortable year out of free-form date strings like "2017", "1954 (as amended)", "2024-06-06", "Annual". */
export function parseYear(date: string): number {
  const m = date.match(/(1[6-9]\d{2}|20\d{2})/g);
  if (!m) return 0;
  return Math.max(...m.map(Number));
}

export function filterSources(all: SourceRecord[], f: VaultFilters): SourceRecord[] {
  const needle = f.q.trim().toLowerCase();
  return all.filter((s) => {
    if (f.category !== 'all' && s.category !== f.category) return false;
    if (f.topic !== 'all' && s.topic !== f.topic) return false;
    if (f.evidence !== 'all' && s.evidenceLevel !== f.evidence) return false;
    if (f.jurisdiction && s.jurisdiction !== f.jurisdiction) return false;
    if (f.lesson && s.lessonId !== f.lesson) return false;
    if (!needle) return true;
    return [s.title, s.author, s.claim, s.summary, s.notes, s.jurisdiction].join(' ').toLowerCase().includes(needle);
  });
}

export function sortSources(list: SourceRecord[], sort: VaultSort): SourceRecord[] {
  const out = [...list];
  switch (sort) {
    case 'date-desc': out.sort((a, b) => parseYear(b.date) - parseYear(a.date) || a.title.localeCompare(b.title)); break;
    case 'date-asc': out.sort((a, b) => parseYear(a.date) - parseYear(b.date) || a.title.localeCompare(b.title)); break;
    case 'evidence': out.sort((a, b) => EVIDENCE_ORDER.indexOf(a.evidenceLevel) - EVIDENCE_ORDER.indexOf(b.evidenceLevel) || parseYear(b.date) - parseYear(a.date)); break;
    case 'title': out.sort((a, b) => a.title.localeCompare(b.title)); break;
  }
  return out;
}

/** Map a lessonId to a route: chXX → /academy/<slug>; debt-0X → /debt-credit-studio/lessons/<n>. */
export function lessonLink(lessonId: string): { to: string; label: string } | null {
  const ch = lessonId.match(/^ch(\d{2})$/);
  if (ch) {
    const meta = chapterById(lessonId);
    return meta ? { to: `/academy/${meta.slug}`, label: `Ch. ${meta.number} · ${meta.short}` } : null;
  }
  const debt = lessonId.match(/^debt-0?(\d+)$/);
  if (debt) return { to: `/debt-credit-studio/lessons/${Number(debt[1])}`, label: `Debt lesson ${Number(debt[1])}` };
  return null;
}

const CSV_COLUMNS: (keyof SourceRecord)[] = ['id', 'title', 'author', 'date', 'jurisdiction', 'topic', 'category', 'claim', 'summary', 'evidenceLevel', 'lessonId', 'url', 'notes', 'lastReviewed', 'createdAt'];

function csvCell(v: unknown): string {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(records: SourceRecord[]): string {
  const head = CSV_COLUMNS.join(',');
  const rows = records.map((r) => CSV_COLUMNS.map((c) => csvCell(r[c])).join(','));
  return [head, ...rows].join('\n');
}

export function toJSON(records: SourceRecord[]): string {
  return JSON.stringify(records, null, 2);
}

const CATEGORIES: SourceCategory[] = ['primary-law', 'tax-regulation', 'government-guidance', 'court-case', 'professional-research', 'book', 'family-office-publication', 'video', 'interview', 'social-clip'];
const TOPICS: Topic[] = ['entity-structuring', 'trusts', 'tax', 'insurance', 'real-estate', 'family-banking', 'asset-protection', 'offshore', 'succession', 'governance', 'family-office', 'debt-credit'];
const EVIDENCE: EvidenceLevel[] = ['primary', 'authoritative', 'professional', 'anecdotal', 'unverified'];

/**
 * Parse an imported JSON document (array of records, or {sources:[...]}) into SourceRecords.
 * Invalid rows are skipped and reported. Unknown enum values fall back to safe defaults.
 */
export function parseImport(json: string, makeId: () => string, now = Date.now()): { records: SourceRecord[]; skipped: number; error?: string } {
  let data: unknown;
  try { data = JSON.parse(json); } catch { return { records: [], skipped: 0, error: 'File is not valid JSON.' }; }
  const arr = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray((data as { sources?: unknown }).sources)) ? (data as { sources: unknown[] }).sources : null;
  if (!arr) return { records: [], skipped: 0, error: 'Expected an array of source records (or an object with a "sources" array).' };
  const records: SourceRecord[] = [];
  let skipped = 0;
  for (const row of arr) {
    if (!row || typeof row !== 'object') { skipped++; continue; }
    const r = row as Record<string, unknown>;
    const title = typeof r.title === 'string' ? r.title.trim() : '';
    if (!title) { skipped++; continue; }
    const str = (k: string) => (typeof r[k] === 'string' ? (r[k] as string) : '');
    const category = CATEGORIES.includes(r.category as SourceCategory) ? (r.category as SourceCategory) : 'professional-research';
    const topic = TOPICS.includes(r.topic as Topic) ? (r.topic as Topic) : 'tax';
    const evidenceLevel = EVIDENCE.includes(r.evidenceLevel as EvidenceLevel) ? (r.evidenceLevel as EvidenceLevel) : 'unverified';
    records.push({
      id: typeof r.id === 'string' && r.id ? r.id : makeId(),
      title, author: str('author'), date: str('date'), jurisdiction: str('jurisdiction'), topic, category,
      claim: str('claim'), summary: str('summary'), evidenceLevel, lessonId: str('lessonId'), url: str('url'), notes: str('notes'),
      lastReviewed: str('lastReviewed') || undefined,
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : now,
    });
  }
  return { records, skipped };
}

export function validateSource(s: Partial<SourceRecord>): string[] {
  const errors: string[] = [];
  if (!s.title || !s.title.trim()) errors.push('Title is required.');
  if (!s.category) errors.push('Category is required.');
  if (s.url && !/^https?:\/\//i.test(s.url)) errors.push('URL must start with http:// or https:// (or be left blank).');
  return errors;
}
