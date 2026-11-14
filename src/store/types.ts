/**
 * Persisted state model. The shape intentionally mirrors the legacy
 * `habit-tracker-v1` localStorage value so that exports stay readable by the
 * old single-file prototype and vice versa.
 */

export interface Habit {
  id: string;
  name: string;
  /** Target number of days per month (0–31). */
  goal: number;
}

/** Mood / motivation score, 1..5 (0 or missing = not set). */
export type Score = 0 | 1 | 2 | 3 | 4 | 5;

export interface MonthData {
  /** habitId -> list of completed day numbers (1..31). */
  c: Record<string, number[]>;
  /** day number -> score. Keys are strings because the data is JSON. */
  mood: Record<string, number>;
  mot: Record<string, number>;
}

/** Workout progress. */
export interface TrainState {
  /** exerciseId -> load multiplier (0.5..2). */
  k: Record<string, number>;
  /** exerciseId -> list of completed "week.set" keys, e.g. "0.2". */
  d: Record<string, string[]>;
}

export interface CreatineState {
  /** Servings in the pack. */
  tot: number;
  /** Pack volume, ml. */
  ml: number;
  /** ISO dates (YYYY-MM-DD) on which a serving was taken. */
  days: string[];
}

export interface WeightEntry {
  /** ISO date YYYY-MM-DD */
  d: string;
  /** kg */
  v: number;
}

export interface NutritionState {
  cr: CreatineState;
  /** Weight log, sorted by date ascending. */
  w: WeightEntry[];
  /** Goal weight, kg (0 = not set). */
  g: number;
  /** Target daily calories for the meal plan. */
  tk: number;
}

export interface AppData {
  habits: Habit[];
  /**
   * Month key -> month data. Key format is `${year}-${monthIndex}` where
   * monthIndex is ZERO-based (legacy format: November 2026 is "2026-10").
   */
  data: Record<string, MonthData>;
  /** bookId -> read flag. */
  books: Record<string, boolean>;
  tr: TrainState;
  nut: NutritionState;
  /** Legacy flag: pull-ups/dips habits were added. */
  v2?: number;
  /** Schema version of the new app. Absent in legacy data. */
  schemaVersion: number;
}
