import type { ChapterModule } from '@/types/content';

/**
 * Lazy registry of chapter modules. Each folder exports `default: ChapterModule`
 * ({ content, Diagram, Simulator }). Chapter authors only touch their own folder.
 */
export const CHAPTER_LOADERS: Record<string, () => Promise<{ default: ChapterModule }>> = {
  ch01: () => import('./ch01'),
  ch02: () => import('./ch02'),
  ch03: () => import('./ch03'),
  ch04: () => import('./ch04'),
  ch05: () => import('./ch05'),
  ch06: () => import('./ch06'),
  ch07: () => import('./ch07'),
  ch08: () => import('./ch08'),
  ch09: () => import('./ch09'),
  ch10: () => import('./ch10'),
  ch11: () => import('./ch11'),
  ch12: () => import('./ch12'),
  ch13: () => import('./ch13'),
  ch14: () => import('./ch14'),
  ch15: () => import('./ch15'),
};
