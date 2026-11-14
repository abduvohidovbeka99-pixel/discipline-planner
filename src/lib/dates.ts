import { useEffect, useState } from 'react';

export const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
/** Genitive month names: "14 ноября". */
export const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
/** Short weekday names, Monday first. */
export const WEEK_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
/** Lowercase short weekday names indexed by Date#getDay() (Sunday = 0). */
export const WEEK_DAY_LC = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
/** Full weekday names indexed by Date#getDay(). */
export const WEEK_FULL = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

/** Legacy month key: zero-based month index ("2026-10" is November 2026). */
export const monthKey = (y: number, m: number): string => y + '-' + m;

export const daysInMonth = (y: number, m: number): number => new Date(y, m + 1, 0).getDate();

/** Offset of the 1st day of the month in a Monday-first week (0..6). */
export const monthOffset = (y: number, m: number): number => (new Date(y, m, 1).getDay() + 6) % 7;

/** Local date as YYYY-MM-DD. */
export const iso = (d: Date): string =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

/** "2026-11-14" -> "14 ноября" (`fd`). */
export const fmtIsoShort = (s: string): string => {
  const p = s.split('-');
  return +p[2] + ' ' + MONTHS_GEN[+p[1] - 1];
};

/** Date `weeks` weeks after `from`, as "14 ноября 2026" (`addw`). */
export const addWeeks = (weeks: number, from: Date): string => {
  const d = new Date(from);
  d.setDate(d.getDate() + Math.round(weeks * 7));
  return d.getDate() + ' ' + MONTHS_GEN[d.getMonth()] + ' ' + d.getFullYear();
};

/** Shift an ISO date by `days` (calendar arithmetic, timezone-independent). */
export const isoShift = (s: string, days: number): string => {
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
};

export interface Today {
  date: Date;
  y: number;
  m: number;
  d: number;
  iso: string;
}

export const makeToday = (now = new Date()): Today => ({
  date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  y: now.getFullYear(),
  m: now.getMonth(),
  d: now.getDate(),
  iso: iso(now),
});

/**
 * Current day that updates itself at midnight and whenever the app becomes
 * visible again (a phone may keep the PWA suspended for hours).
 */
export function useTodayClock(): Today {
  const [today, setToday] = useState(makeToday);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      setToday((prev) => {
        const next = makeToday();
        return next.iso === prev.iso ? prev : next;
      });
    };
    const schedule = () => {
      clearTimeout(timer);
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      timer = setTimeout(() => {
        refresh();
        schedule();
      }, midnight.getTime() - now.getTime());
    };
    const onWake = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        schedule();
      }
    };
    schedule();
    document.addEventListener('visibilitychange', onWake);
    window.addEventListener('focus', onWake);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('focus', onWake);
    };
  }, []);

  return today;
}
