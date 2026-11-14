import type { AppData, Habit, MonthData } from './types';
import { defaultHabits, V2_HABITS } from '../data/habits';

/** Current schema version of persisted data. Legacy prototype data is version 0. */
export const SCHEMA_VERSION = 1;

/** localStorage key — same as the prototype, so the data format stays shared. */
export const STORAGE_KEY = 'habit-tracker-v1';

type Loose = Record<string, unknown>;
const isObj = (x: unknown): x is Loose => typeof x === 'object' && x !== null && !Array.isArray(x);
const num = (x: unknown, d: number): number => (typeof x === 'number' && Number.isFinite(x) ? x : d);

/**
 * v0 → v1: everything the prototype did on load.
 * - missing/invalid state → default habits
 * - default `books`, `tr`, `nut`
 * - legacy `v2` step: add "Подтягивания" and "Брусья" habits once
 */
function fromV0(raw: unknown): AppData {
  const S: Loose = isObj(raw) && Array.isArray(raw.habits) ? { ...raw } : { habits: defaultHabits(), data: {} };

  const habits: Habit[] = (S.habits as unknown[])
    .filter(isObj)
    .map((h, i) => ({
      id: typeof h.id === 'string' ? h.id : 'h' + i + '-' + Date.now(),
      name: String(h.name ?? ''),
      goal: Math.max(0, num(h.goal, 0)),
    }));

  const data: Record<string, MonthData> = {};
  if (isObj(S.data)) {
    for (const [k, v] of Object.entries(S.data)) {
      if (!isObj(v)) continue;
      const c: Record<string, number[]> = {};
      if (isObj(v.c)) {
        for (const [hid, days] of Object.entries(v.c)) {
          if (Array.isArray(days)) c[hid] = days.filter((d): d is number => typeof d === 'number');
        }
      }
      data[k] = {
        c,
        mood: isObj(v.mood) ? (v.mood as Record<string, number>) : {},
        mot: isObj(v.mot) ? (v.mot as Record<string, number>) : {},
      };
    }
  }

  const books = isObj(S.books) ? (S.books as Record<string, boolean>) : {};
  const trRaw = isObj(S.tr) ? S.tr : {};
  const tr = {
    k: isObj(trRaw.k) ? (trRaw.k as Record<string, number>) : {},
    d: isObj(trRaw.d) ? (trRaw.d as Record<string, string[]>) : {},
  };
  const nutRaw = isObj(S.nut) ? S.nut : {};
  const crRaw = isObj(nutRaw.cr) ? nutRaw.cr : {};
  const nut = {
    cr: {
      tot: num(crRaw.tot, 100) || 100,
      ml: num(crRaw.ml, 500) || 500,
      days: Array.isArray(crRaw.days) ? (crRaw.days as unknown[]).filter((d): d is string => typeof d === 'string') : [],
    },
    w: Array.isArray(nutRaw.w)
      ? (nutRaw.w as unknown[])
          .filter(isObj)
          .filter((e) => typeof e.d === 'string' && typeof e.v === 'number')
          .map((e) => ({ d: e.d as string, v: e.v as number }))
          .sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0))
      : [],
    g: num(nutRaw.g, 0) || 0,
    tk: num(nutRaw.tk, 2700) || 2700,
  };

  let v2 = S.v2 ? 1 : undefined;
  if (!v2) {
    V2_HABITS.forEach(([name, goal], i) => {
      if (!habits.some((h) => h.name === name)) habits.push({ id: 'hn' + i, name, goal });
    });
    v2 = 1;
  }

  return { habits, data, books, tr, nut, v2, schemaVersion: 1 };
}

/** Ordered migrations: index i upgrades data from version i to i+1. */
const MIGRATIONS: ((s: unknown) => unknown)[] = [fromV0];

/**
 * Bring any stored/imported value up to the current schema.
 * `version` defaults to the value's own `schemaVersion` (0 for legacy data).
 */
export function migrate(raw: unknown, version?: number): AppData {
  let v = version ?? (isObj(raw) && typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0);
  if (v > SCHEMA_VERSION) throw new Error('Данные созданы более новой версией приложения');
  let s: unknown = raw;
  if (v === SCHEMA_VERSION) {
    // Still run the v0 normaliser defensively: it is idempotent on valid data.
    return fromV0(s);
  }
  while (v < SCHEMA_VERSION) {
    s = MIGRATIONS[v](s);
    v++;
  }
  return s as AppData;
}

/** Fresh state for a first launch. */
export const initialData = (): AppData => migrate(null, 0);
