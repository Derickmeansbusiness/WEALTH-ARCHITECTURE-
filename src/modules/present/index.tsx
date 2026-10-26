import { useMemo } from 'react';
import { debtSlides } from '@/modules/debt/present/slides';
import PresentDeck from './PresentDeck';
import { buildMasterclassDeck } from './slides';

/** Presentation Mode — the 60–120 minute masterclass keynote at /present/* */
export default function PresentPage() {
  const slides = useMemo(() => buildMasterclassDeck(debtSlides ?? []), []);
  return <PresentDeck slides={slides} basePath="/present" />;
}
