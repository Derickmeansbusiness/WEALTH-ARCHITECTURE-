import type { ChapterModule } from '@/types/content';
import { content } from './content';
import Diagram from './Diagram';
import Simulator from './Simulator';

const mod: ChapterModule = { content, Diagram, Simulator };
export default mod;
