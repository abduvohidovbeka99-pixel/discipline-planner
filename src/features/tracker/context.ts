import type { Habit, MonthData } from '../../store/types';

/** Everything a tracker view needs about the displayed month. */
export interface MonthCtx {
  y: number;
  m: number;
  /** Legacy month key "YYYY-M" (zero-based month). */
  mk: string;
  /** Days in month. */
  n: number;
  /** Monday-first offset of the 1st. */
  off: number;
  isNow: boolean;
  /** Today's day number (meaningful when isNow). */
  td: number;
  md: MonthData | undefined;
  habits: Habit[];
}

export const EMOJI = ['', '😞', '🙁', '😐', '🙂', '😄'];
