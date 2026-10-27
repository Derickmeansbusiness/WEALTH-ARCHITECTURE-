/**
 * Governance Readiness — Chapter 14 (Family Governance).
 * Twelve yes / partial / no questions mapped onto ten governance components.
 * Produces a per-component score (0..1), an overall readiness, and prioritized gaps.
 */

export type Answer = 'yes' | 'partial' | 'no';
export const ANSWER_VALUE: Record<Answer, number> = { yes: 1, partial: 0.5, no: 0 };

export type ComponentId =
  | 'constitution' | 'council' | 'assembly' | 'investment' | 'education'
  | 'employment' | 'distribution' | 'conflict' | 'succession' | 'philanthropy';

export interface Component {
  id: ComponentId;
  label: string;
  short: string;
  /** relative importance for gap ordering (1 = baseline) */
  weight: number;
  /** what closing the gap looks like in practice */
  remedy: string;
}

export const COMPONENTS: Component[] = [
  { id: 'constitution', label: 'Family constitution & mission', short: 'Constitution', weight: 1.3, remedy: 'Draft a short written statement of purpose and values, then the decision rules that follow from it. Two pages the family actually reads beat forty it does not.' },
  { id: 'council', label: 'Family council', short: 'Council', weight: 1.2, remedy: 'Elect a small council (5–7) with a charter, term limits, a meeting rhythm and a budget. Keep it separate from the company board and from the trustees.' },
  { id: 'assembly', label: 'Family assembly', short: 'Assembly', weight: 0.8, remedy: 'Hold an annual all-family gathering with a real agenda: reporting from the council, education sessions, and time that is deliberately not about money.' },
  { id: 'investment', label: 'Investment committee & policy', short: 'Investment', weight: 1.1, remedy: 'Write an investment policy statement; name a committee with at least one independent member; define what the family office or external manager decides alone and what needs committee sign-off.' },
  { id: 'education', label: 'Education policy', short: 'Education', weight: 1.0, remedy: 'Build an age-staged curriculum: allowances and budgeting, then entity and trust literacy, then sitting in on committee meetings as observers before voting.' },
  { id: 'employment', label: 'Employment policy', short: 'Employment', weight: 1.0, remedy: 'Set entry requirements for family members (outside experience, a real open role, market compensation, a non-family manager) and an exit path that preserves relationships.' },
  { id: 'distribution', label: 'Distribution philosophy', short: 'Distributions', weight: 1.2, remedy: 'Decide what trusts and the family bank are for: stage-of-life support, matched earnings, enterprise capital, or discretionary need. Write it into letters of wishes so trustees are not guessing.' },
  { id: 'conflict', label: 'Conflict-resolution process', short: 'Conflict', weight: 1.3, remedy: 'Agree the ladder in advance: direct conversation, council facilitation, outside mediation, then arbitration. Put the ladder in shareholder agreements and trust instruments so it binds.' },
  { id: 'succession', label: 'Succession policy', short: 'Succession', weight: 1.4, remedy: 'Name successors and the process for choosing them for every role that matters: CEO, board chair, trustees, protector, council chair. Rehearse incapacity, not just death.' },
  { id: 'philanthropy', label: 'Philanthropy strategy', short: 'Philanthropy', weight: 0.7, remedy: 'Choose the vehicle (DAF, private foundation, direct giving) for the job, write a giving policy, and use it as the rising generation\'s first governance practice ground.' },
];

export interface Question { id: string; component: ComponentId; text: string }

export const QUESTIONS: Question[] = [
  { id: 'q1', component: 'constitution', text: 'Does the family have a written statement of shared purpose and values that most adult members could summarize?' },
  { id: 'q2', component: 'constitution', text: 'Are the decision rules (who decides what, by what vote) written down anywhere the family can read them?' },
  { id: 'q3', component: 'council', text: 'Is there a family council or equivalent body that meets on a schedule, with minutes?' },
  { id: 'q4', component: 'assembly', text: 'Does the whole family, including in-laws and the rising generation, gather at least annually with an agenda beyond a holiday?' },
  { id: 'q5', component: 'investment', text: 'Is there a written investment policy statement and a committee (with at least one independent voice) that reviews performance against it?' },
  { id: 'q6', component: 'education', text: 'Is there a deliberate program to teach the rising generation about the family\'s entities, trusts and finances, staged by age?' },
  { id: 'q7', component: 'employment', text: 'Are the conditions for a family member to work in the family enterprise written and applied to everyone?' },
  { id: 'q8', component: 'distribution', text: 'Do trustees and family members share a written understanding of what distributions are for and how requests are evaluated?' },
  { id: 'q9', component: 'conflict', text: 'Is there an agreed process for disputes (facilitation, mediation, then arbitration) written into the governing documents?' },
  { id: 'q10', component: 'succession', text: 'Are successors (or the selection process) identified for the key leadership, ownership and fiduciary roles?' },
  { id: 'q11', component: 'succession', text: 'Has the family rehearsed what happens if the current leader is incapacitated next month: powers of attorney, successor trustees, signing authority?' },
  { id: 'q12', component: 'philanthropy', text: 'Does the family have a stated giving strategy and a vehicle chosen for it, with the rising generation involved?' },
];

export type Answers = Record<string, Answer>;

export interface ComponentScore { component: Component; score: number; answered: number; total: number }
export interface Gap { component: Component; score: number; priority: number }

export interface ReadinessResult {
  components: ComponentScore[];
  /** 0..1 */
  overall: number;
  band: 'forming' | 'developing' | 'established' | 'mature';
  gaps: Gap[];
  answered: number;
}

export function scoreReadiness(answers: Answers): ReadinessResult {
  const components: ComponentScore[] = COMPONENTS.map((c) => {
    const qs = QUESTIONS.filter((q) => q.component === c.id);
    const answered = qs.filter((q) => answers[q.id] !== undefined);
    const score = answered.length ? answered.reduce((s, q) => s + ANSWER_VALUE[answers[q.id]], 0) / qs.length : 0;
    return { component: c, score, answered: answered.length, total: qs.length };
  });
  const answered = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const totalWeight = COMPONENTS.reduce((s, c) => s + c.weight, 0);
  const overall = components.reduce((s, c) => s + c.score * c.component.weight, 0) / totalWeight;
  const band = overall >= 0.85 ? 'mature' : overall >= 0.6 ? 'established' : overall >= 0.35 ? 'developing' : 'forming';
  const gaps = components
    .filter((c) => c.score < 1)
    .map((c) => ({ component: c.component, score: c.score, priority: (1 - c.score) * c.component.weight }))
    .sort((a, b) => b.priority - a.priority);
  return { components, overall, band, gaps, answered };
}

/** Radar polygon points for an SVG of radius r centered at (cx, cy). */
export function radarPoints(scores: number[], cx: number, cy: number, r: number): { x: number; y: number }[] {
  const n = scores.length;
  return scores.map((s, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = r * Math.max(0, Math.min(1, s));
    return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) };
  });
}
