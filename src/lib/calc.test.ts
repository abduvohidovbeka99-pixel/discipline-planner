import { describe, expect, it } from 'vitest';
import type { Habit, MonthData } from '../store/types';
import {
  basePlanKcal,
  calendarWeeks,
  caloriePresets,
  creatineStats,
  dayPct,
  doneCount,
  gainForecast,
  goalProgress,
  habitPct,
  maintenanceKcal,
  overallPct,
  perfectDays,
  recommendedKcal,
  remainingToday,
  scalePlan,
  scoreAverage,
  streak,
  weekChunks,
  weekRowPct,
  weeksToGain,
  weightChange7d,
} from './calc';
import { addWeeks, isoShift, monthKey, monthOffset } from './dates';
import { rn, sg } from './format';

const H: Habit[] = [
  { id: 'a', name: 'A', goal: 10 },
  { id: 'b', name: 'B', goal: 4 },
  { id: 'z', name: 'Z', goal: 0 },
];
const md: MonthData = { c: { a: [1, 2, 3, 5, 31], b: [1, 2, 3, 4, 5, 6], z: [1] }, mood: { 1: 3, 2: 5, 3: 0 }, mot: {} };

describe('habit progress', () => {
  it('counts only days that exist in the month', () => {
    expect(doneCount(md, 'a', 31)).toBe(5);
    expect(doneCount(md, 'a', 30)).toBe(4);
  });
  it('percentage vs goal is capped at 100 and 0 for zero goal', () => {
    expect(habitPct(md, H[0], 30)).toBe(40);
    expect(habitPct(md, H[1], 30)).toBe(100);
    expect(habitPct(md, H[2], 30)).toBe(0);
  });
  it('overall progress is the rounded average of habit percentages', () => {
    expect(overallPct(md, H, 30)).toBe(Math.round((40 + 100 + 0) / 3));
    expect(overallPct(md, [], 30)).toBe(0);
    expect(overallPct(undefined, H, 30)).toBe(0);
  });
  it('day percentage and perfect days', () => {
    expect(dayPct(md, H, 1)).toBe(100);
    expect(dayPct(md, H, 2)).toBe(67);
    expect(dayPct(md, H, 7)).toBe(0);
    expect(perfectDays(md, H, 30)).toBe(1);
  });
  it('remaining habits today', () => {
    expect(remainingToday(md, H, 1)).toBe(0);
    expect(remainingToday(md, H, 4)).toBe(2);
  });
  it('mood average ignores empty scores', () => {
    expect(scoreAverage(md.mood)).toBe('4.0');
    expect(scoreAverage({})).toBe('—');
  });
});

describe('streak', () => {
  it('current month: today not done yet does not break the streak', () => {
    expect(streak([10, 11, 12, 13], true, 14, 30)).toBe(4);
    expect(streak([10, 11, 12, 13, 14], true, 14, 30)).toBe(5);
  });
  it('current month: a gap before today breaks it', () => {
    expect(streak([10, 11, 13], true, 14, 30)).toBe(1);
    expect(streak([11, 12], true, 14, 30)).toBe(0);
  });
  it('past month: counts back from the last day', () => {
    expect(streak([28, 29, 30], false, 14, 30)).toBe(3);
    expect(streak([28, 29], false, 14, 30)).toBe(0);
    expect(streak(undefined, false, 14, 30)).toBe(0);
  });
});

describe('calendar', () => {
  it('November 2026 starts on Sunday (offset 6) and has 6 week rows', () => {
    expect(monthOffset(2026, 10)).toBe(6);
    const w = calendarWeeks(6, 30);
    expect(w).toHaveLength(6);
    expect(w[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(w[5]).toEqual([30, null, null, null, null, null, null]);
  });
  it('week row % uses only real days', () => {
    expect(weekRowPct(md, H, [null, null, null, null, null, null, 1])).toBe(100);
    expect(weekRowPct(md, [], [1])).toBe(0);
  });
  it('7-day chunks for the table view', () => {
    const c = weekChunks(md, H, 30);
    expect(c.map((x) => [x.from, x.to])).toEqual([
      [1, 7],
      [8, 14],
      [15, 21],
      [22, 28],
      [29, 30],
    ]);
    expect(c[0]).toMatchObject({ done: 4 + 6 + 1, total: 21, pct: 52 });
    expect(c[4].total).toBe(6);
  });
  it('legacy month key is zero-based', () => {
    expect(monthKey(2026, 10)).toBe('2026-10');
  });
});

describe('nutrition', () => {
  it('maintenance and the recommended ★ value', () => {
    expect(maintenanceKcal(70.5)).toBe(2327);
    expect(recommendedKcal(70.5)).toBe(2750);
    expect(recommendedKcal(0)).toBe(0);
  });
  it('adds the recommendation to the presets once, sorted', () => {
    expect(caloriePresets([2400, 2700, 3000, 3300], 2750)).toEqual([2400, 2700, 2750, 3000, 3300]);
    expect(caloriePresets([2400, 2700, 3000, 3300], 2700)).toEqual([2400, 2700, 3000, 3300]);
  });
  it('base plan calories', () => {
    // Reference values computed by running the prototype's own code.
    expect(basePlanKcal()).toBeCloseTo(2736.8, 6);
  });
  it('scales the plan with grams rounded to 5 g (min 5)', () => {
    const p = scalePlan(2700);
    const breakfast = p.meals[0].items.map((i) => [i.food.id, i.grams]);
    expect(breakfast).toEqual([
      ['oat', 80],
      ['mlk', 245],
      ['ban', 120],
      ['egg', 150],
      ['wal', 15],
    ]);
    expect(Math.round(p.kcal)).toBe(2728);
    expect(scalePlan(1200).meals.flatMap((m) => m.items).every((i) => i.grams >= 5 && i.grams % 5 === 0)).toBe(true);
  });
  it('gain forecast: surplus/1000 kg per week, clamped to 0..0.5', () => {
    expect(gainForecast(2750, 70.5)).toEqual({ maintenance: 2327, surplus: 423, rate: 0.423 });
    expect(gainForecast(4000, 60).rate).toBe(0.5);
    expect(gainForecast(1500, 80).rate).toBe(0);
    expect(weeksToGain(1, 0.423)).toBe(3);
    expect(weeksToGain(5, 0.5)).toBe(10);
  });
  it('date after N weeks', () => {
    expect(addWeeks(2, new Date(2026, 10, 14))).toBe('28 ноября 2026');
    expect(addWeeks(100 / 7, new Date(2026, 10, 14))).toBe('22 февраля 2027');
  });
});

describe('creatine', () => {
  it('left servings, ml per serving, fill level', () => {
    const s = creatineStats({ tot: 100, ml: 500, days: ['2026-11-14', '2026-11-13'] });
    expect(s).toMatchObject({ taken: 2, left: 98, perServingMl: 5, fraction: 0.98, leftMl: 490 });
    expect(creatineStats({ tot: 1, ml: 5, days: ['a', 'b'] }).left).toBe(0);
  });
});

describe('weight', () => {
  const w = [
    { d: '2026-10-20', v: 68.4 },
    { d: '2026-10-27', v: 68.9 },
    { d: '2026-11-03', v: 69.3 },
    { d: '2026-11-07', v: 69.1 },
    { d: '2026-11-12', v: 69.8 },
  ];
  it('7-day change uses the latest entry at least 7 days older', () => {
    expect(rn(weightChange7d(w)!)).toBe(0.5);
    expect(weightChange7d(w.slice(3))).toBeNull();
    expect(weightChange7d([])).toBeNull();
  });
  it('goal progress from the first entry', () => {
    expect(goalProgress(w, 75)).toBe(21);
    expect(goalProgress(w, 60)).toBe(0);
    expect(goalProgress(w, 0)).toBe(0);
  });
  it('iso date shift works across months and DST', () => {
    expect(isoShift('2026-11-03', -7)).toBe('2026-10-27');
    expect(isoShift('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('signed format', () => {
    expect(sg(1.25)).toBe('+1.3');
    expect(sg(-0.04)).toBe('0');
    expect(sg(-0.3)).toBe('-0.3');
  });
});
