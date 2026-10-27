import type { DebtLesson } from '../types';
import lesson01 from './lesson01';
import lesson02 from './lesson02';
import lesson03 from './lesson03';
import lesson04 from './lesson04';
import lesson05 from './lesson05';
import lesson06 from './lesson06';
import lesson07 from './lesson07';
import lesson08 from './lesson08';
import lesson09 from './lesson09';

export const DEBT_LESSONS: DebtLesson[] = [lesson01, lesson02, lesson03, lesson04, lesson05, lesson06, lesson07, lesson08, lesson09];

export const lessonByNumber = (n: number) => DEBT_LESSONS.find((l) => l.number === n);
export const lessonById = (id: string) => DEBT_LESSONS.find((l) => l.id === id);
export const DEBT_LESSON_IDS = DEBT_LESSONS.map((l) => l.id);
