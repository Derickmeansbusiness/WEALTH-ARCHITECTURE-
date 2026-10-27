import type { CaseFamily } from './types';
import { STARTER } from './starter';
import { BUILDER } from './builder';
import { HNW } from './hnw';
import { MULTIGEN } from './multigen';
import { GLOBAL } from './global';

export const FAMILIES: CaseFamily[] = [STARTER, BUILDER, HNW, MULTIGEN, GLOBAL];
export const familyById = (id: string) => FAMILIES.find((f) => f.id === id);
export * from './types';
