import { describe, it, expect } from 'vitest';
import { scoreReadiness, radarPoints, QUESTIONS, COMPONENTS, type Answers } from './model';

const all = (a: 'yes' | 'partial' | 'no'): Answers => Object.fromEntries(QUESTIONS.map((q) => [q.id, a]));

describe('question set', () => {
  it('has 12 questions across all 10 components', () => {
    expect(QUESTIONS.length).toBe(12);
    const covered = new Set(QUESTIONS.map((q) => q.component));
    expect(covered.size).toBe(COMPONENTS.length);
  });
});

describe('scoreReadiness', () => {
  it('all yes → overall 1, mature, no gaps', () => {
    const r = scoreReadiness(all('yes'));
    expect(r.overall).toBeCloseTo(1, 10);
    expect(r.band).toBe('mature');
    expect(r.gaps.length).toBe(0);
    expect(r.answered).toBe(12);
  });
  it('all no → overall 0, forming, every component is a gap ordered by weight', () => {
    const r = scoreReadiness(all('no'));
    expect(r.overall).toBe(0);
    expect(r.band).toBe('forming');
    expect(r.gaps.length).toBe(COMPONENTS.length);
    expect(r.gaps[0].component.id).toBe('succession'); // highest weight
  });
  it('all partial → 0.5 developing', () => {
    const r = scoreReadiness(all('partial'));
    expect(r.overall).toBeCloseTo(0.5, 10);
    expect(r.band).toBe('developing');
  });
  it('unanswered questions count as zero for the component and are reported', () => {
    const r = scoreReadiness({ q1: 'yes' });
    const constitution = r.components.find((c) => c.component.id === 'constitution')!;
    expect(constitution.score).toBe(0.5); // one of two answered yes
    expect(constitution.answered).toBe(1);
    expect(r.answered).toBe(1);
  });
});

describe('radarPoints', () => {
  it('starts at the top and maps full scores to the radius', () => {
    const pts = radarPoints([1, 1, 1, 1], 100, 100, 50);
    expect(pts[0].x).toBeCloseTo(100, 6);
    expect(pts[0].y).toBeCloseTo(50, 6);
    expect(pts[1].x).toBeCloseTo(150, 6);
  });
  it('clamps scores to 0..1', () => {
    const pts = radarPoints([2, -1], 0, 0, 10);
    expect(pts[0].y).toBeCloseTo(-10, 6);
    expect(pts[1].x).toBeCloseTo(0, 6);
    expect(pts[1].y).toBeCloseTo(0, 6);
  });
});
