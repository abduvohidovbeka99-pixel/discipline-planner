import type { Habit } from '../store/types';

/** Default habits of the prototype (`DEF`), ids h0..h8. */
export const DEFAULT_HABITS: ReadonlyArray<readonly [string, number]> = [
  ['Тренировка', 8],
  ['Книга', 12],
  ['Изучение Claude', 31],
  ['250 отжиманий', 31],
  ['Отложить по 50 тыс', 24],
  ['Английский', 31],
  ['Сон до 00:00', 24],
  ['Вода 3 л', 24],
  ['Пресс', 31],
];

/** Habits added by the legacy `v2` migration, ids hn0..hn1. */
export const V2_HABITS: ReadonlyArray<readonly [string, number]> = [
  ['Подтягивания', 12],
  ['Брусья', 12],
];

export const defaultHabits = (): Habit[] =>
  DEFAULT_HABITS.map(([name, goal], i) => ({ id: 'h' + i, name, goal }));
