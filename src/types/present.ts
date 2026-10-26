/** Presentation Mode slide contract. Both the main masterclass deck and the Debt Studio deck conform to it. */
export interface Slide {
  id: string;
  /** Section label shown in presenter progress, e.g. "Chapter 05 — Trust Architecture" */
  section: string;
  title: string;
  /** Visual component rendered full-bleed. Receives `step` for progressive builds. */
  Visual: React.ComponentType<{ step: number; active: boolean }>;
  /** Number of progressive build steps (space/→ advances through steps before next slide). */
  steps?: number;
  notes?: string[];
  /** Estimated minutes for presenter pacing */
  minutes?: number;
}
