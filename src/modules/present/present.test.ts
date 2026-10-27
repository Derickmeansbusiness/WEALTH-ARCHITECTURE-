import { describe, it, expect } from 'vitest';
import type { Slide } from '@/types/present';
import { indexFromPath, cumulativeMinutes, pacing, clampIndex } from './engine';
import { buildMasterclassDeck, deckMinutes, ch04Fallback } from './slides';

const Noop = () => null;
const fake = (id: string, minutes = 1): Slide => ({ id, section: 'Chapter 04 — Debt', title: id, Visual: Noop, minutes });

describe('present engine helpers', () => {
  it('parses 1-based slide numbers from the URL into 0-based indices', () => {
    expect(indexFromPath('/present', '/present')).toBe(0);
    expect(indexFromPath('/present/', '/present')).toBe(0);
    expect(indexFromPath('/present/1', '/present')).toBe(0);
    expect(indexFromPath('/present/12', '/present')).toBe(11);
    expect(indexFromPath('/debt-credit-studio/present/7', '/debt-credit-studio/present/')).toBe(6);
    expect(indexFromPath('/present/0', '/present')).toBe(0);
    expect(indexFromPath('/elsewhere/4', '/present')).toBe(0);
  });
  it('clamps indices into the deck', () => {
    expect(clampIndex(-3, 10)).toBe(0);
    expect(clampIndex(50, 10)).toBe(9);
    expect(clampIndex(4, 0)).toBe(0);
  });
  it('accumulates planned minutes at the start of each slide', () => {
    expect(cumulativeMinutes([fake('a', 1), fake('b', 2.5), fake('c')])).toEqual([0, 1, 3.5]);
  });
  it('reports pacing within a one-minute tolerance', () => {
    expect(pacing(0, 0).state).toBe('on');
    expect(pacing(59, 0).state).toBe('on');
    expect(pacing(200, 1).state).toBe('behind');
    expect(pacing(0, 5)).toEqual({ state: 'ahead', delta: -300 });
  });
});

describe('masterclass deck', () => {
  const deck = buildMasterclassDeck([]);
  it('has roughly 85–100 slides with unique ids and notes on every slide', () => {
    expect(deck.length).toBeGreaterThanOrEqual(85);
    expect(deck.length).toBeLessThanOrEqual(105);
    const ids = new Set(deck.map((s) => s.id));
    expect(ids.size).toBe(deck.length);
    for (const s of deck) {
      expect(typeof s.Visual).toBe('function');
      expect(s.notes && s.notes.length).toBeGreaterThan(0);
      expect(s.section.length).toBeGreaterThan(0);
      expect(s.steps === undefined || s.steps >= 1).toBe(true);
    }
  });
  it('paces to roughly ninety minutes', () => {
    const total = deckMinutes(deck);
    expect(total).toBeGreaterThanOrEqual(80);
    expect(total).toBeLessThanOrEqual(100);
  });
  it('covers all fifteen chapters plus opening and closing in order', () => {
    const sections = Array.from(new Set(deck.map((s) => s.section)));
    expect(sections[0]).toBe('Opening');
    expect(sections[sections.length - 1]).toBe('Closing');
    for (let n = 1; n <= 15; n++) expect(sections.some((s) => s.startsWith(`Chapter ${String(n).padStart(2, '0')}`))).toBe(true);
  });
  it('splices the Debt Studio deck in as Chapter 04 and otherwise falls back', () => {
    expect(deck.some((s) => s.id === ch04Fallback[0].id)).toBe(true);
    const debt = [fake('debt-1'), fake('debt-2'), fake('debt-3')];
    const withDebt = buildMasterclassDeck(debt);
    expect(withDebt.some((s) => s.id === ch04Fallback[0].id)).toBe(false);
    const i = withDebt.findIndex((s) => s.id === 'debt-1');
    expect(withDebt[i - 1].section.startsWith('Chapter 03')).toBe(true);
    expect(withDebt[i + 3].section.startsWith('Chapter 05')).toBe(true);
  });
});
