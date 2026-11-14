import { useStore } from '../../store/useStore';
import { useUi, type TrackerView } from '../../store/uiStore';
import { useToday } from '../../app/today';
import { daysInMonth, monthKey, monthOffset } from '../../lib/dates';
import { Tiles, type TileItem } from '../../ui/Tiles';
import { GLYPHS } from '../../ui/Icons';
import { MonthNav } from './MonthNav';
import { DayView } from './DayView';
import { MonthView } from './MonthView';
import { HabitsView } from './HabitsView';
import { TableView } from './TableView';
import type { MonthCtx } from './context';
import './tracker.css';

const VIEWS: TileItem<TrackerView>[] = [
  { key: 'day', label: 'День', icon: GLYPHS.day },
  { key: 'cal', label: 'Месяц', icon: GLYPHS.cal },
  { key: 'hab', label: 'Привычки', icon: GLYPHS.hab },
  { key: 'tbl', label: 'Таблица', icon: GLYPHS.tbl },
];

export default function TrackerScreen() {
  const t = useToday();
  const { tracker, trackerView, selDay, set } = useUi();
  const habits = useStore((s) => s.habits);
  const y = tracker?.y ?? t.y;
  const m = tracker?.m ?? t.m;
  const mk = monthKey(y, m);
  const md = useStore((s) => s.data[mk]);
  const n = daysInMonth(y, m);
  const isNow = y === t.y && m === t.m;

  const ctx: MonthCtx = { y, m, mk, n, off: monthOffset(y, m), isNow, td: t.d, md, habits };
  const sd = selDay?.k === mk ? Math.min(selDay.d, n) : isNow ? t.d : 1;

  const go = (delta: number) => {
    const d = new Date(y, m + delta, 1);
    set({ tracker: { y: d.getFullYear(), m: d.getMonth() } });
  };

  return (
    <>
      <MonthNav y={y} m={m} onPrev={() => go(-1)} onNext={() => go(1)} onToday={() => set({ tracker: null, selDay: null })} />
      <Tiles items={VIEWS} value={trackerView} onChange={(v) => set({ trackerView: v })} />
      {trackerView === 'day' && <DayView ctx={ctx} sd={sd} />}
      {trackerView === 'cal' && <MonthView ctx={ctx} />}
      {trackerView === 'hab' && <HabitsView ctx={ctx} />}
      {trackerView === 'tbl' && <TableView ctx={ctx} />}
    </>
  );
}
