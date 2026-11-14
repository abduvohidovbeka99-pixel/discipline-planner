import { describe, expect, it } from 'vitest';
import { achievementText, plural } from '../data/achievements';
import { habitAchievement, habitTotal, rankHistory, rankIndex, rankMaxPct, rankMinPct } from './achievements';

describe('monthly rank', () => {
  it('splits 100% into 7 equal segments', () => {
    expect([0, 1, 14, 15, 28, 29, 42, 43, 57, 58, 71, 72, 85, 86, 95, 100].map(rankIndex)).toEqual([
      0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7,
    ]);
  });
  it('thresholds shown in the UI match rankIndex', () => {
    for (let i = 1; i <= 7; i++) {
      expect(rankIndex(rankMinPct(i))).toBe(i);
      expect(rankIndex(rankMaxPct(i))).toBe(i);
    }
    expect([1, 2, 3, 4, 5, 6, 7].map(rankMinPct)).toEqual([1, 15, 29, 43, 58, 72, 86]);
  });
  it('each month gets its own rank, newest first', () => {
    const habits = [{ id: 'a', name: 'A', goal: 10 }];
    const data = {
      '2026-10': { c: { a: Array.from({ length: 10 }, (_, i) => i + 1) }, mood: {}, mot: {} }, // 100% → Алмаз
      '2026-11': { c: { a: [1, 2] }, mood: {}, mot: {} }, // 20% → Серебро
      junk: { c: {}, mood: {}, mot: {} },
    };
    expect(rankHistory(data, habits).map((h) => [h.key, h.pct, h.rank])).toEqual([
      ['2026-11', 20, 2],
      ['2026-10', 100, 7],
    ]);
  });
});

describe('habit achievements', () => {
  const data = {
    '2026-9': { c: { a: [1, 2, 3, 31] }, mood: {}, mot: {} }, // October: 31 days
    '2026-10': { c: { a: [1, 2, 31] }, mood: {}, mot: {} }, // November: day 31 ignored
  };
  it('counts completed days across all months', () => {
    expect(habitTotal(data, 'a')).toBe(6);
    expect(habitTotal(data, 'zzz')).toBe(0);
  });
  it('levels 10/25/50/100/250', () => {
    const many = { '2026-0': { c: { a: Array.from({ length: 31 }, (_, i) => i + 1) }, mood: {}, mot: {} } };
    expect(habitAchievement(many, { id: 'a', name: 'A', goal: 1 })).toMatchObject({ total: 31, unlocked: 2, next: 50, prev: 25 });
    expect(habitAchievement({}, { id: 'a', name: 'A', goal: 1 })).toMatchObject({ unlocked: 0, next: 10, prev: 0 });
  });
  it('goal phrases', () => {
    expect(achievementText('Тренировка', 10)).toBe('Сходи на 10 тренировок');
    expect(achievementText('Книга', 25)).toBe('Читай книгу 25 дней');
    expect(achievementText('Медитация', 50)).toBe('Отметь «Медитация» 50 раз');
    expect([1, 2, 5, 11, 21, 22, 25].map((n) => plural(n, ['день', 'дня', 'дней']))).toEqual(['день', 'дня', 'дней', 'дней', 'день', 'дня', 'дней']);
  });
});
