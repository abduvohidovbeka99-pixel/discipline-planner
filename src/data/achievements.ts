/** Levels of per-habit achievements: total number of completed days. */
export const ACHIEVEMENT_LEVELS = [10, 25, 50, 100, 250];

/** Roman numerals for level badges. */
export const LEVEL_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

/** Russian plural: plural(5, ['день', 'дня', 'дней']) → 'дней'. */
export const plural = (n: number, [one, few, many]: [string, string, string]): string => {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
};

const DAYS: [string, string, string] = ['день', 'дня', 'дней'];
const TIMES: [string, string, string] = ['раз', 'раза', 'раз'];

/** Goal phrases for the default habits; other habits use a generic phrase. */
const PHRASES: Record<string, (n: number) => string> = {
  Тренировка: (n) => `Сходи на ${n} ${plural(n, ['тренировку', 'тренировки', 'тренировок'])}`,
  Книга: (n) => `Читай книгу ${n} ${plural(n, DAYS)}`,
  'Изучение Claude': (n) => `Изучай Claude ${n} ${plural(n, DAYS)}`,
  '250 отжиманий': (n) => `Сделай 250 отжиманий ${n} ${plural(n, TIMES)}`,
  'Отложить по 50 тыс': (n) => `Отложи по 50 тыс ${n} ${plural(n, TIMES)}`,
  Английский: (n) => `Занимайся английским ${n} ${plural(n, DAYS)}`,
  'Сон до 00:00': (n) => `Ляг спать до полуночи ${n} ${plural(n, TIMES)}`,
  'Вода 3 л': (n) => `Выпей 3 л воды ${n} ${plural(n, DAYS)}`,
  Пресс: (n) => `Покачай пресс ${n} ${plural(n, TIMES)}`,
  Подтягивания: (n) => `Проведи ${n} ${plural(n, ['тренировку', 'тренировки', 'тренировок'])} подтягиваний`,
  Брусья: (n) => `Проведи ${n} ${plural(n, ['тренировку', 'тренировки', 'тренировок'])} на брусьях`,
};

export const achievementText = (habitName: string, n: number): string =>
  (PHRASES[habitName] ?? ((k: number) => `Отметь «${habitName}» ${k} ${plural(k, TIMES)}`))(n);
