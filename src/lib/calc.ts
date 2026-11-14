/**
 * Pure calculations (habit progress, streaks, nutrition, forecasts).
 * All formulas are ported verbatim from the prototype.
 */
import type { Habit, MonthData, WeightEntry, CreatineState } from '../store/types';
import { FOOD_BY_ID, type Food } from '../data/foods';
import { MEAL_PLAN, type Meal } from '../data/mealPlan';
import { isoShift } from './dates';

export const emptyMonth = (): MonthData => ({ c: {}, mood: {}, mot: {} });

/* ------------------------------------------------------------------ */
/* Habits                                                              */
/* ------------------------------------------------------------------ */

export const isDone = (md: MonthData | undefined, habitId: string, day: number): boolean =>
  !!md?.c[habitId]?.includes(day);

/** Number of completed days in the month (ignores days beyond month length). */
export const doneCount = (md: MonthData | undefined, habitId: string, daysInMonth: number): number =>
  (md?.c[habitId] ?? []).filter((i) => i <= daysInMonth).length;

/** Habit completion vs. goal, 0..100. */
export const habitPct = (md: MonthData | undefined, h: Habit, daysInMonth: number): number =>
  h.goal > 0 ? Math.min(100, Math.round((doneCount(md, h.id, daysInMonth) / h.goal) * 100)) : 0;

/** Overall progress: average of per-habit percentages. */
export const overallPct = (md: MonthData | undefined, habits: Habit[], daysInMonth: number): number =>
  habits.length ? Math.round(habits.reduce((a, h) => a + habitPct(md, h, daysInMonth), 0) / habits.length) : 0;

/** Number of habits done on a day. */
export const dayDone = (md: MonthData | undefined, habits: Habit[], day: number): number =>
  habits.filter((h) => isDone(md, h.id, day)).length;

/** Share of habits done on a day, 0..100. */
export const dayPct = (md: MonthData | undefined, habits: Habit[], day: number): number =>
  habits.length ? Math.round((dayDone(md, habits, day) / habits.length) * 100) : 0;

/**
 * Current streak. For the current month counts back from today (today may be
 * not done yet without breaking the streak); for other months — from the last day.
 */
export const streak = (days: number[] | undefined, isCurrentMonth: boolean, today: number, daysInMonth: number): number => {
  const s = days ?? [];
  let i = isCurrentMonth ? today : daysInMonth;
  if (isCurrentMonth && !s.includes(i)) i--;
  let c = 0;
  while (i >= 1 && s.includes(i)) {
    c++;
    i--;
  }
  return c;
};

/** Days where every habit was done. */
export const perfectDays = (md: MonthData | undefined, habits: Habit[], daysInMonth: number): number => {
  if (!habits.length) return 0;
  let n = 0;
  for (let i = 1; i <= daysInMonth; i++) if (dayDone(md, habits, i) === habits.length) n++;
  return n;
};

/** Total check marks in the month. */
export const totalMarks = (md: MonthData | undefined, habits: Habit[], daysInMonth: number): number =>
  habits.reduce((a, h) => a + doneCount(md, h.id, daysInMonth), 0);

/** Calendar grid: weeks (Monday first) of day numbers, `null` for blanks. */
export const calendarWeeks = (offset: number, daysInMonth: number): (number | null)[][] => {
  const weeks: (number | null)[][] = [];
  const n = Math.ceil((offset + daysInMonth) / 7);
  for (let w = 0; w < n; w++) {
    const row: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      const x = w * 7 - offset + 1 + i;
      row.push(x < 1 || x > daysInMonth ? null : x);
    }
    weeks.push(row);
  }
  return weeks;
};

/** Completion % of a calendar week row. */
export const weekRowPct = (md: MonthData | undefined, habits: Habit[], row: (number | null)[]): number => {
  const days = row.filter((x): x is number => x !== null);
  if (!habits.length || !days.length) return 0;
  const done = days.reduce((a, x) => a + dayDone(md, habits, x), 0);
  return Math.round((done / (habits.length * days.length)) * 100);
};

export interface WeekChunk {
  index: number;
  from: number;
  to: number;
  done: number;
  total: number;
  pct: number;
}

/** "По неделям" in the table view: 7-day chunks starting from the 1st. */
export const weekChunks = (md: MonthData | undefined, habits: Habit[], daysInMonth: number): WeekChunk[] => {
  const out: WeekChunk[] = [];
  for (let w = 0, s = 1; s <= daysInMonth; w++, s += 7) {
    const e = Math.min(daysInMonth, s + 6);
    const days = e - s + 1;
    let done = 0;
    habits.forEach((h) => {
      done += (md?.c[h.id] ?? []).filter((v) => v >= s && v <= e).length;
    });
    const total = habits.length * days;
    out.push({ index: w, from: s, to: e, done, total, pct: total ? Math.round((done / total) * 100) : 0 });
  }
  return out;
};

/** Average of the set scores (mood/motivation) as "3.5" or "—". */
export const scoreAverage = (scores: Record<string, number>): string => {
  const vals = Object.values(scores).filter((v) => v > 0);
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
};

/** Habits not yet done today. */
export const remainingToday = (md: MonthData | undefined, habits: Habit[], today: number): number =>
  habits.filter((h) => !isDone(md, h.id, today)).length;

/* ------------------------------------------------------------------ */
/* Nutrition                                                           */
/* ------------------------------------------------------------------ */

/** Maintenance calories ≈ weight × 33. */
export const maintenanceKcal = (weight: number): number => (weight ? Math.round(weight * 33) : 0);

/** Recommended plan (★): maintenance + 400, rounded to 50. */
export const recommendedKcal = (weight: number): number =>
  weight ? Math.round((maintenanceKcal(weight) + 400) / 50) * 50 : 0;

/** Calories of the unscaled base plan. */
export const basePlanKcal = (plan: Meal[] = MEAL_PLAN): number =>
  plan.reduce((a, m) => a + m.items.reduce((s, [id, g]) => s + (FOOD_BY_ID[id].kcal * g) / 100, 0), 0);

export interface PlanItem {
  food: Food;
  grams: number;
  kcal: number;
  p: number;
  f: number;
  c: number;
}
export interface PlanMeal {
  meal: Meal;
  items: PlanItem[];
  kcal: number;
  p: number;
  f: number;
  c: number;
}
export interface ScaledPlan {
  meals: PlanMeal[];
  kcal: number;
  p: number;
  f: number;
  c: number;
}

/** Scale the base plan to target calories; grams rounded to 5, min 5 g. */
export const scalePlan = (target: number, plan: Meal[] = MEAL_PLAN): ScaledPlan => {
  const sc = target / basePlanKcal(plan);
  const meals = plan.map((meal) => {
    const items = meal.items.map(([id, base]) => {
      const food = FOOD_BY_ID[id];
      const grams = Math.max(5, Math.round((base * sc) / 5) * 5);
      return {
        food,
        grams,
        kcal: (food.kcal * grams) / 100,
        p: (food.p * grams) / 100,
        f: (food.f * grams) / 100,
        c: (food.c * grams) / 100,
      };
    });
    const sum = (k: 'kcal' | 'p' | 'f' | 'c') => items.reduce((a, x) => a + x[k], 0);
    return { meal, items, kcal: sum('kcal'), p: sum('p'), f: sum('f'), c: sum('c') };
  });
  const tot = (k: 'kcal' | 'p' | 'f' | 'c') => meals.reduce((a, x) => a + x[k], 0);
  return { meals, kcal: tot('kcal'), p: tot('p'), f: tot('f'), c: tot('c') };
};

/** Calorie preset chips, including the recommended value if it is not a preset. */
export const caloriePresets = (presets: number[], rec: number): number[] => {
  const pr = [...presets];
  if (rec && !pr.includes(rec)) {
    pr.push(rec);
    pr.sort((a, b) => a - b);
  }
  return pr;
};

export interface GainForecast {
  maintenance: number;
  surplus: number;
  /** kg per week, clamped to 0..0.5 */
  rate: number;
}

/** Weight gain rate: surplus / 1000 kg per week, capped at 0.5. */
export const gainForecast = (targetKcal: number, weight: number): GainForecast => {
  const maintenance = maintenanceKcal(weight);
  const surplus = targetKcal - maintenance;
  return { maintenance, surplus, rate: Math.max(0, Math.min(0.5, surplus / 1000)) };
};

/** Whole weeks needed to gain `kg` at `rate` kg/week. */
export const weeksToGain = (kg: number, rate: number): number => Math.ceil(kg / rate);

/* ------------------------------------------------------------------ */
/* Creatine                                                            */
/* ------------------------------------------------------------------ */

export const creatineStats = (c: CreatineState) => {
  const taken = c.days.length;
  const left = Math.max(0, c.tot - taken);
  const perServingMl = c.ml / c.tot;
  return { taken, left, perServingMl, fraction: left / c.tot, leftMl: left * perServingMl };
};

/* ------------------------------------------------------------------ */
/* Weight                                                              */
/* ------------------------------------------------------------------ */

/** Change vs. the latest entry at least 7 days older than the last one. */
export const weightChange7d = (w: WeightEntry[]): number | null => {
  if (!w.length) return null;
  const last = w[w.length - 1];
  const lim = isoShift(last.d, -7);
  let ref: WeightEntry | null = null;
  w.forEach((e) => {
    if (e.d <= lim) ref = e;
  });
  return ref ? last.v - (ref as WeightEntry).v : null;
};

/** Progress from the first entry towards the goal, 0..100. */
export const goalProgress = (w: WeightEntry[], goal: number): number => {
  if (!w.length) return 0;
  const first = w[0].v;
  const cur = w[w.length - 1].v;
  return goal > first ? Math.max(0, Math.min(100, Math.round(((cur - first) / (goal - first)) * 100))) : 0;
};
