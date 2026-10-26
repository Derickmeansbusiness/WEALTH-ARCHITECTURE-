/** Single source of truth for the 15-chapter masterclass sequence. */
export interface ChapterMeta { id: string; number: number; slug: string; title: string; short: string; duration: string }

export const CHAPTERS: ChapterMeta[] = [
  { id: 'ch01', number: 1, slug: 'wealth-foundations', title: 'Wealth Foundations', short: 'Foundations', duration: '20 min' },
  { id: 'ch02', number: 2, slug: 'wealth-engines', title: 'Wealth Engines', short: 'Engines', duration: '20 min' },
  { id: 'ch03', number: 3, slug: 'ownership-vs-control', title: 'Ownership vs Control', short: 'Ownership vs Control', duration: '25 min' },
  { id: 'ch04', number: 4, slug: 'debt-credit-leverage', title: 'Debt, Credit & Strategic Leverage', short: 'Debt & Leverage', duration: '35 min' },
  { id: 'ch05', number: 5, slug: 'entity-architecture', title: 'Entity Architecture', short: 'Entities', duration: '30 min' },
  { id: 'ch06', number: 6, slug: 'trust-architecture', title: 'Trust Architecture', short: 'Trusts', duration: '30 min' },
  { id: 'ch07', number: 7, slug: 'the-family-bank', title: 'The Family Bank', short: 'Family Bank', duration: '25 min' },
  { id: 'ch08', number: 8, slug: 'family-capital-waterfall', title: 'Family Capital Waterfall', short: 'Capital Waterfall', duration: '20 min' },
  { id: 'ch09', number: 9, slug: 'real-estate-tax-architecture', title: 'Real Estate Tax Architecture', short: 'Real Estate Tax', duration: '30 min' },
  { id: 'ch10', number: 10, slug: 'insurance-as-infrastructure', title: 'Insurance as Financial Infrastructure', short: 'Insurance', duration: '25 min' },
  { id: 'ch11', number: 11, slug: 'domestic-asset-protection', title: 'Domestic Asset Protection', short: 'Domestic Protection', duration: '30 min' },
  { id: 'ch12', number: 12, slug: 'offshore-asset-protection', title: 'Offshore Asset Protection', short: 'Offshore Protection', duration: '30 min' },
  { id: 'ch13', number: 13, slug: 'wealth-transfer', title: 'Wealth Transfer', short: 'Transfer', duration: '30 min' },
  { id: 'ch14', number: 14, slug: 'family-governance', title: 'Family Governance', short: 'Governance', duration: '25 min' },
  { id: 'ch15', number: 15, slug: 'the-family-office', title: 'The Family Office', short: 'Family Office', duration: '25 min' },
];

export const chapterById = (id: string) => CHAPTERS.find((c) => c.id === id);
export const chapterBySlug = (slug: string) => CHAPTERS.find((c) => c.slug === slug);
