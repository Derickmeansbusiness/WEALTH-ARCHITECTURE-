import { Suspense, lazy } from 'react';
import type { Slide } from '@/types/present';
import { LoadingState } from '@/components/ui';
import ErrorBoundary from '../shell/ErrorBoundary';
import SimpleDeck from './SimpleDeck';
import { debtSlides } from './slides';
import '../debt.css';

const BASE = '/debt-credit-studio/present';

type DeckProps = { slides: Slide[]; basePath: string };
// Shared keynote engine; falls back to the local SimpleDeck if it cannot be loaded.
const PresentDeck = lazy<React.ComponentType<DeckProps>>(() =>
  import('@/modules/present/PresentDeck').then((m) => ({ default: m.default as React.ComponentType<DeckProps> })).catch(() => ({ default: SimpleDeck })),
);

export default function DebtPresent() {
  return (
    <ErrorBoundary fallback={<SimpleDeck slides={debtSlides} basePath={BASE} />}>
      <Suspense fallback={<div className="ds-deck"><div className="ds-deck-stage" style={{ padding: 48 }}><LoadingState lines={4} /></div></div>}>
        <PresentDeck slides={debtSlides} basePath={BASE} />
      </Suspense>
    </ErrorBoundary>
  );
}
