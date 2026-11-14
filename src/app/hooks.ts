import { useStore } from '../store/useStore';
import { overallPct } from '../lib/calc';
import { daysInMonth, monthKey } from '../lib/dates';
import { useToday } from './today';

/** Overall progress for the current calendar month (home ring, rewards). */
export function useOverallProgress(): number {
  const t = useToday();
  const habits = useStore((s) => s.habits);
  const md = useStore((s) => s.data[monthKey(t.y, t.m)]);
  return overallPct(md, habits, daysInMonth(t.y, t.m));
}
