import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Structure } from '@/types/structure';
import type { SourceRecord, ResearchClaim, Transcript } from '@/types/knowledge';
import type { Currency } from '@/lib/format';

export type JurisdictionMode = 'US' | 'UAE' | 'CEMAC' | 'UK';

export interface SavedScenario {
  id: string;
  kind: 'leverage' | 'family-bank' | 'stress' | 'capital-stack' | 'decision' | 'money-flow' | 'trust' | 'other';
  name: string;
  data: unknown;
  createdAt: number;
  /** Optional link to a Structure Lab structure + edge so a saved loan can appear on the map */
  structureId?: string;
  edgeId?: string;
}

export interface LessonProgress {
  visited: boolean;
  completed: boolean;
  /** knowledge check score 0..1 */
  score?: number;
  lastVisited?: number;
}

interface AppState {
  // Preferences
  currency: Currency;
  jurisdictionMode: JurisdictionMode;
  presenterNotes: boolean;
  setCurrency: (c: Currency) => void;
  setJurisdictionMode: (j: JurisdictionMode) => void;
  togglePresenterNotes: () => void;

  // Learning progress — keyed by lesson id ("ch01".."ch15", "debt-01".."debt-09")
  progress: Record<string, LessonProgress>;
  markVisited: (id: string) => void;
  markCompleted: (id: string, score?: number) => void;
  bookmarks: string[];        // lesson ids / section anchors
  toggleBookmark: (id: string) => void;
  notes: Record<string, string>;
  setNote: (id: string, text: string) => void;

  // Structure Lab
  structures: Structure[];
  saveStructure: (s: Structure) => void;
  deleteStructure: (id: string) => void;

  // Scenarios (calculators)
  scenarios: SavedScenario[];
  saveScenario: (s: SavedScenario) => void;
  deleteScenario: (id: string) => void;

  // Source Vault & Research Workspace
  sources: SourceRecord[];
  addSource: (s: SourceRecord) => void;
  updateSource: (s: SourceRecord) => void;
  deleteSource: (id: string) => void;
  transcripts: Transcript[];
  addTranscript: (t: Transcript) => void;
  deleteTranscript: (id: string) => void;
  researchClaims: ResearchClaim[];
  addResearchClaims: (c: ResearchClaim[]) => void;
  updateResearchClaim: (c: ResearchClaim) => void;
  deleteResearchClaim: (id: string) => void;

  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currency: 'USD',
      jurisdictionMode: 'US',
      presenterNotes: false,
      setCurrency: (currency) => set({ currency }),
      setJurisdictionMode: (jurisdictionMode) => set({ jurisdictionMode }),
      togglePresenterNotes: () => set((s) => ({ presenterNotes: !s.presenterNotes })),

      progress: {},
      markVisited: (id) => set((s) => ({ progress: { ...s.progress, [id]: { ...(s.progress[id] ?? { visited: false, completed: false }), visited: true, lastVisited: Date.now() } } })),
      markCompleted: (id, score) => set((s) => ({ progress: { ...s.progress, [id]: { ...(s.progress[id] ?? { visited: true, completed: false }), visited: true, completed: true, score: score ?? s.progress[id]?.score, lastVisited: Date.now() } } })),
      bookmarks: [],
      toggleBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [...s.bookmarks, id] })),
      notes: {},
      setNote: (id, text) => set((s) => ({ notes: { ...s.notes, [id]: text } })),

      structures: [],
      saveStructure: (st) => set((s) => ({ structures: s.structures.some((x) => x.id === st.id) ? s.structures.map((x) => (x.id === st.id ? st : x)) : [...s.structures, st] })),
      deleteStructure: (id) => set((s) => ({ structures: s.structures.filter((x) => x.id !== id) })),

      scenarios: [],
      saveScenario: (sc) => set((s) => ({ scenarios: s.scenarios.some((x) => x.id === sc.id) ? s.scenarios.map((x) => (x.id === sc.id ? sc : x)) : [...s.scenarios, sc] })),
      deleteScenario: (id) => set((s) => ({ scenarios: s.scenarios.filter((x) => x.id !== id) })),

      sources: [],
      addSource: (src) => set((s) => ({ sources: [src, ...s.sources] })),
      updateSource: (src) => set((s) => ({ sources: s.sources.map((x) => (x.id === src.id ? src : x)) })),
      deleteSource: (id) => set((s) => ({ sources: s.sources.filter((x) => x.id !== id) })),
      transcripts: [],
      addTranscript: (t) => set((s) => ({ transcripts: [t, ...s.transcripts] })),
      deleteTranscript: (id) => set((s) => ({ transcripts: s.transcripts.filter((t) => t.id !== id), researchClaims: s.researchClaims.filter((c) => c.transcriptId !== id) })),
      researchClaims: [],
      addResearchClaims: (c) => set((s) => ({ researchClaims: [...s.researchClaims, ...c] })),
      updateResearchClaim: (c) => set((s) => ({ researchClaims: s.researchClaims.map((x) => (x.id === c.id ? c : x)) })),
      deleteResearchClaim: (id) => set((s) => ({ researchClaims: s.researchClaims.filter((x) => x.id !== id) })),

      resetAll: () => set({ progress: {}, bookmarks: [], notes: {}, structures: [], scenarios: [], sources: [], transcripts: [], researchClaims: [] }),
    }),
    { name: 'fwa-v1' },
  ),
);
