import type { Slide } from '@/types/present';
import { openingSlides } from './opening';
import { closingSlides } from './closing';
import { ch01 } from './ch01';
import { ch02 } from './ch02';
import { ch03 } from './ch03';
import { ch04Fallback } from './ch04';
import { ch05 } from './ch05';
import { ch06 } from './ch06';
import { ch07 } from './ch07';
import { ch08 } from './ch08';
import { ch09 } from './ch09';
import { ch10 } from './ch10';
import { ch11 } from './ch11';
import { ch12 } from './ch12';
import { ch13 } from './ch13';
import { ch14 } from './ch14';
import { ch15 } from './ch15';

export { ch04Fallback };

/**
 * Builds the full masterclass deck: opening sequence, fifteen chapter sections and the closing sequence.
 * Chapter 04 is supplied by the Debt & Credit Studio deck (`debtSlides`); when that array is empty at
 * runtime the built-in fallback Chapter 04 section is used instead.
 */
export function buildMasterclassDeck(debtSlides: Slide[]): Slide[] {
  const ch04 = debtSlides && debtSlides.length > 0 ? debtSlides : ch04Fallback;
  return [
    ...openingSlides,
    ...ch01, ...ch02, ...ch03,
    ...ch04,
    ...ch05, ...ch06, ...ch07, ...ch08, ...ch09, ...ch10, ...ch11, ...ch12, ...ch13, ...ch14, ...ch15,
    ...closingSlides,
  ];
}

/** Total planned minutes of a deck. */
export const deckMinutes = (slides: Slide[]) => slides.reduce((s, x) => s + (x.minutes ?? 1), 0);
