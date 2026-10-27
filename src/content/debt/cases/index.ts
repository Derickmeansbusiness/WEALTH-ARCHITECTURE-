import type { DebtCase } from '../types';
import caseA from './caseA';
import caseB from './caseB';
import caseC from './caseC';
import caseD from './caseD';
import caseE from './caseE';

export const DEBT_CASES: DebtCase[] = [caseA, caseB, caseC, caseD, caseE];
export const caseById = (id: string) => DEBT_CASES.find((c) => c.id.toLowerCase() === id.toLowerCase() || c.slug === id);
