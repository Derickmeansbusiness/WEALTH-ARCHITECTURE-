import type { Slide } from '@/types/present';
import Deck from './Deck';

/**
 * Mountable keynote deck. Drop it on a splat route and it owns the viewport.
 *
 * @param slides  the deck (see `Slide` in '@/types/present'). Each slide's `Visual` renders in a
 *                1920×1080 design space; `steps` enables progressive builds.
 * @param basePath route prefix used for URL sync, e.g. "/debt-credit-studio/present". The current
 *                 slide is reflected as `${basePath}/${n}` (1-based) so slides can be deep-linked and
 *                 the browser back button works. Must match the route this component is mounted on
 *                 (mount on `${basePath}/*`).
 *
 * Keyboard: → Space PageDown Enter = next · ← PageUp = previous · Home/End · digits+Enter = jump ·
 * f fullscreen · n presenter notes (store.togglePresenterNotes) · v presenter view · o overview ·
 * p progress/timer · b black screen · ? shortcuts · Esc closes overlays / exits fullscreen.
 * Touch: tap right/left third or swipe. Honors prefers-reduced-motion.
 *
 * @example
 *   <Route path="/debt-credit-studio/present/*" element={<PresentDeck slides={debtSlides} basePath="/debt-credit-studio/present" />} />
 */
export default function PresentDeck({ slides, basePath }: { slides: Slide[]; basePath: string }) {
  return <Deck slides={slides} basePath={basePath} />;
}

export { PresentDeck };
