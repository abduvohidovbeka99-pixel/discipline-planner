import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppData, MonthData, NutritionState } from './types';
import { initialData, migrate, SCHEMA_VERSION, STORAGE_KEY } from './migrations';
import { flatStorage } from './storage';
import { emptyMonth } from '../lib/calc';
import { monthKey } from '../lib/dates';
import { PROGRAMS } from '../data/exercises';

export type ScoreKind = 'mood' | 'mot';

interface Actions {
  toggleDay(mk: string, habitId: string, day: number): void;
  /** Pick a score; picking the same value again clears it. */
  setScore(mk: string, kind: ScoreKind, day: number, value: number): void;
  /** Cycle a score 0→1→…→5→0 (table view). */
  cycleScore(mk: string, kind: ScoreKind, day: number): void;
  addHabit(name: string, goal: number): void;
  deleteHabit(id: string): void;
  setGoal(id: string, goal: number): void;

  toggleBook(id: string): void;

  /** Change load multiplier by ±0.1, clamped to 0.5..2. */
  changeLoad(programId: string, delta: number): void;
  /** Toggle a set; marking it also ticks the linked habit for `today`. */
  toggleSet(programId: string, key: string, today: { y: number; m: number; d: number }): void;
  resetPlan(programId: string): void;

  setCalories(tk: number): void;
  toggleCreatine(isoDate: string): void;
  newCreatinePack(): void;
  setCreatinePack(patch: Partial<{ tot: number; ml: number }>): void;
  saveWeight(isoDate: string, v: number): void;
  deleteWeight(isoDate: string): void;
  setGoalWeight(g: number): void;

  /** Replace all data (import). */
  replaceAll(data: AppData): void;
}

export type Store = AppData & Actions;

const dataOf = (s: Store): AppData => ({
  habits: s.habits,
  data: s.data,
  books: s.books,
  tr: s.tr,
  nut: s.nut,
  v2: s.v2,
  schemaVersion: s.schemaVersion,
});

/** Immutable update of one month. */
const withMonth = (s: AppData, mk: string, fn: (m: MonthData) => MonthData): Pick<AppData, 'data'> => ({
  data: { ...s.data, [mk]: fn(s.data[mk] ?? emptyMonth()) },
});

const toggleIn = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

const withNut = (s: AppData, patch: Partial<NutritionState>): Pick<AppData, 'nut'> => ({ nut: { ...s.nut, ...patch } });

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...initialData(),

      toggleDay: (mk, habitId, day) =>
        set((s) => withMonth(s, mk, (m) => ({ ...m, c: { ...m.c, [habitId]: toggleIn(m.c[habitId] ?? [], day) } }))),

      setScore: (mk, kind, day, value) =>
        set((s) =>
          withMonth(s, mk, (m) => ({ ...m, [kind]: { ...m[kind], [day]: m[kind][day] === value ? 0 : value } })),
        ),

      cycleScore: (mk, kind, day) =>
        set((s) => withMonth(s, mk, (m) => ({ ...m, [kind]: { ...m[kind], [day]: ((m[kind][day] || 0) + 1) % 6 } }))),

      addHabit: (name, goal) =>
        set((s) => ({ habits: [...s.habits, { id: 'h' + Date.now(), name, goal: Math.min(31, goal || 20) }] })),

      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      setGoal: (id, goal) =>
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, goal: Math.max(0, goal || 0) } : h)) })),

      toggleBook: (id) => set((s) => ({ books: { ...s.books, [id]: !s.books[id] } })),

      changeLoad: (pid, delta) =>
        set((s) => ({
          tr: { ...s.tr, k: { ...s.tr.k, [pid]: Math.min(2, Math.max(0.5, Math.round(((s.tr.k[pid] || 1) + delta) * 10) / 10)) } },
        })),

      toggleSet: (pid, key, today) =>
        set((s) => {
          const done = s.tr.d[pid] ?? [];
          const adding = !done.includes(key);
          const next: Partial<AppData> = { tr: { ...s.tr, d: { ...s.tr.d, [pid]: toggleIn(done, key) } } };
          if (adding) {
            const program = PROGRAMS.find((p) => p.id === pid);
            const habit = program && s.habits.find((h) => h.name === program.habit);
            if (habit) {
              const mk = monthKey(today.y, today.m);
              const m = s.data[mk] ?? emptyMonth();
              const days = m.c[habit.id] ?? [];
              if (!days.includes(today.d)) {
                next.data = { ...s.data, [mk]: { ...m, c: { ...m.c, [habit.id]: [...days, today.d] } } };
              }
            }
          }
          return next;
        }),

      resetPlan: (pid) => set((s) => ({ tr: { ...s.tr, d: { ...s.tr.d, [pid]: [] } } })),

      setCalories: (tk) => set((s) => withNut(s, { tk })),

      toggleCreatine: (d) => set((s) => withNut(s, { cr: { ...s.nut.cr, days: toggleIn(s.nut.cr.days, d) } })),

      newCreatinePack: () => set((s) => withNut(s, { cr: { ...s.nut.cr, days: [] } })),

      setCreatinePack: (patch) => set((s) => withNut(s, { cr: { ...s.nut.cr, ...patch } })),

      saveWeight: (d, v) =>
        set((s) => {
          const w = s.nut.w.some((e) => e.d === d) ? s.nut.w.map((e) => (e.d === d ? { d, v } : e)) : [...s.nut.w, { d, v }];
          w.sort((x, y) => (x.d < y.d ? -1 : 1));
          return withNut(s, { w });
        }),

      deleteWeight: (d) => set((s) => withNut(s, { w: s.nut.w.filter((e) => e.d !== d) })),

      setGoalWeight: (g) => set((s) => withNut(s, { g })),

      replaceAll: (data) => set(() => ({ ...migrate(data) })),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: flatStorage(),
      partialize: (s) => dataOf(s as Store),
      migrate: (persisted, version) => migrate(persisted, version),
      // Normalise on every load (also for current-version data).
      merge: (persisted, current) => ({ ...current, ...(persisted ? migrate(persisted) : {}) }),
    },
  ),
);

/** Snapshot of the persisted part of the state (for export). */
export const getData = (): AppData => dataOf(useStore.getState());
