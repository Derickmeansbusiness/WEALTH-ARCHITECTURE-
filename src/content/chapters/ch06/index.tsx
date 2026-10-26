import type { ChapterModule } from '@/types/content';
import { CHAPTERS } from '../manifest';
import { EmptyState } from '@/components/ui';

const meta = CHAPTERS.find((c) => c.id === 'ch06')!;

const mod: ChapterModule = {
  content: {
    id: meta.id, number: meta.number, slug: meta.slug, title: meta.title, subtitle: 'Content in production', objectives: ['governance'], duration: meta.duration,
    hook: '', concept: [], realWorldExample: { title: '', body: [] }, misconception: { claim: '', reality: '', confidence: 'amber' }, professionalExplanation: [],
    knowledgeCheck: [], caseStudy: { title: '', family: '', situation: '', structure: '', outcome: '', lesson: '' }, terminology: [], references: [], takeaways: [],
  },
  Diagram: () => <EmptyState title="Diagram in production" />,
  Simulator: () => <EmptyState title="Simulator in production" />,
};
export default mod;
