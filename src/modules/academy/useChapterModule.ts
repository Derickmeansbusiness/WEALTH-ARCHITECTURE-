import { useEffect, useState } from 'react';
import type { ChapterModule } from '@/types/content';
import { CHAPTER_LOADERS } from '@/content/chapters/registry';

export type LoadState<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; error: string };

const cache = new Map<string, ChapterModule>();

/** Loads one chapter module lazily with cache; returns loading/ready/error. */
export function useChapterModule(id: string | undefined) {
  const [state, setState] = useState<LoadState<ChapterModule>>(() => {
    const hit = id ? cache.get(id) : undefined;
    return hit ? { status: 'ready', data: hit } : { status: 'loading' };
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) { setState({ status: 'error', error: 'Unknown chapter' }); return; }
    const hit = cache.get(id);
    if (hit) { setState({ status: 'ready', data: hit }); return; }
    const loader = CHAPTER_LOADERS[id];
    if (!loader) { setState({ status: 'error', error: `No loader registered for ${id}` }); return; }
    let alive = true;
    setState({ status: 'loading' });
    loader()
      .then((m) => { if (!alive) return; cache.set(id, m.default); setState({ status: 'ready', data: m.default }); })
      .catch((e: unknown) => { if (!alive) return; setState({ status: 'error', error: e instanceof Error ? e.message : String(e) }); });
    return () => { alive = false; };
  }, [id, attempt]);

  return { state, retry: () => setAttempt((a) => a + 1) };
}

/** Loads every chapter module, tolerating individual failures (returns only the ones that resolved). */
export function useAllChapterModules() {
  const [mods, setMods] = useState<Record<string, ChapterModule>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const ids = Object.keys(CHAPTER_LOADERS);
    Promise.all(ids.map(async (id) => {
      const hit = cache.get(id);
      if (hit) return [id, hit] as const;
      try {
        const m = await CHAPTER_LOADERS[id]();
        cache.set(id, m.default);
        return [id, m.default] as const;
      } catch { return null; }
    })).then((rows) => {
      if (!alive) return;
      const out: Record<string, ChapterModule> = {};
      for (const r of rows) if (r) out[r[0]] = r[1];
      setMods(out); setLoading(false);
    });
    return () => { alive = false; };
  }, []);
  return { modules: mods, loading };
}
