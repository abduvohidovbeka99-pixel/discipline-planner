import type { Habit, MonthData } from '../store/types';
import { ACHIEVEMENT_LEVELS } from '../data/achievements';
import { RANKS } from '../data/ranks';
import { daysInMonth } from './dates';
import { overallPct } from './calc';

/* ------------------------------------------------------------------ */
/* Monthly rank                                                        */
/* ------------------------------------------------------------------ */

/**
 * Rank index for a month's progress: 0 = no rank, 1..7 = Бронза..Алмаз.
 * 100% is split into 7 equal segments (≈14.3% each); any progress > 0 gives Бронза.
 */
export const rankIndex = (pct: number): number => (pct <= 0 ? 0 : Math.min(RANKS.length, Math.floor((pct * RANKS.length) / 100) + 1));

/** Minimal whole percent needed for rank i (1..7): 1, 15, 29, 43, 58, 72, 86. */
export const rankMinPct = (i: number): number => (i <= 1 ? 1 : Math.ceil(((i - 1) * 100) / RANKS.length));

/** Max whole percent that still belongs to rank i (1..7): 14, 28, 42, 57, 71, 85, 100. */
export const rankMaxPct = (i: number): number => (i >= RANKS.length ? 100 : rankMinPct(i + 1) - 1);

/** Parse the legacy month key "YYYY-M" (zero-based month). */
export const parseMonthKey = (k: string): { y: number; m: number } | null => {
  const r = /^(\d{4})-(\d{1,2})$/.exec(k);
  return r ? { y: +r[1], m: +r[2] } : null;
};

export interface MonthRank {
  key: string;
  y: number;
  m: number;
  pct: number;
  rank: number;
}

/** Rank of every month that has data, newest first. */
export const rankHistory = (data: Record<string, MonthData>, habits: Habit[]): MonthRank[] =>
  Object.keys(data)
    .map((key) => {
      const p = parseMonthKey(key);
      if (!p) return null;
      const pct = overallPct(data[key], habits, daysInMonth(p.y, p.m));
      return { key, ...p, pct, rank: rankIndex(pct) };
    })
    .filter((x): x is MonthRank => x !== null)
    .sort((a, b) => b.y - a.y || b.m - a.m);

/* ------------------------------------------------------------------ */
/* Habit achievements                                                  */
/* ------------------------------------------------------------------ */

/** All-time number of completed days for a habit (across all months). */
export const habitTotal = (data: Record<string, MonthData>, habitId: string): number =>
  Object.entries(data).reduce((sum, [key, md]) => {
    const p = parseMonthKey(key);
    const n = p ? daysInMonth(p.y, p.m) : 31;
    return sum + (md.c[habitId] ?? []).filter((d) => d >= 1 && d <= n).length;
  }, 0);

export interface HabitAchievement {
  habit: Habit;
  total: number;
  /** Number of unlocked levels (0..5). */
  unlocked: number;
  /** Next level target, or null when everything is unlocked. */
  next: number | null;
  /** Previous threshold (for the progress bar to the next level). */
  prev: number;
}

export const habitAchievement = (data: Record<string, MonthData>, habit: Habit, levels = ACHIEVEMENT_LEVELS): HabitAchievement => {
  const total = habitTotal(data, habit.id);
  const unlocked = levels.filter((l) => total >= l).length;
  return { habit, total, unlocked, next: levels[unlocked] ?? null, prev: unlocked ? levels[unlocked - 1] : 0 };
};
