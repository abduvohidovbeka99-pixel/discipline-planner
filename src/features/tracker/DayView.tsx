import { useStore } from '../../store/useStore';
import { useUi } from '../../store/uiStore';
import { MONTHS_GEN, WEEK_FULL, WEEK_SHORT } from '../../lib/dates';
import { dayDone, dayPct, doneCount, isDone, streak } from '../../lib/calc';
import { CheckMark } from '../../ui/Icons';
import { Bar } from '../../ui/Bar';
import { MoodCard } from './MoodRow';
import type { MonthCtx } from './context';

export function DayView({ ctx, sd }: { ctx: MonthCtx; sd: number }) {
  const { y, m, mk, n, off, isNow, td, md, habits } = ctx;
  const toggleDay = useStore((s) => s.toggleDay);
  const setUi = useUi((s) => s.set);

  const w0 = Math.floor((off + sd - 1) / 7) * 7 - off + 1;
  const dn = dayDone(md, habits, sd);
  const dp = (d: number) => dayPct(md, habits, d);
  const select = (d: number) => setUi({ selDay: { k: mk, d } });
  const shiftWeek = (dir: number) => select(Math.min(n, Math.max(1, sd + 7 * dir)));

  return (
    <>
      <div className="wst">
        <button type="button" className="arr" onClick={() => shiftWeek(-1)} aria-label="Предыдущая неделя">
          ‹
        </button>
        {WEEK_SHORT.map((wd, i) => {
          const x = w0 + i;
          if (x < 1 || x > n) return <div key={i} className="wd off" />;
          return (
            <button
              key={i}
              type="button"
              className={'wd' + (x === sd ? ' sel' : '') + (isNow && x === td ? ' tdy' : '')}
              onClick={() => select(x)}
            >
              <small>{wd}</small>
              <b>{x}</b>
              <i>
                <u style={{ width: dp(x) + '%' }} />
              </i>
            </button>
          );
        })}
        <button type="button" className="arr" onClick={() => shiftWeek(1)} aria-label="Следующая неделя">
          ›
        </button>
      </div>

      <div className="dayh">
        <b>
          {WEEK_FULL[new Date(y, m, sd).getDay()]}, {sd} {MONTHS_GEN[m]}
        </b>
        <span>
          {dn} из {habits.length}
        </span>
      </div>
      <Bar pct={dp(sd)} style={{ marginBottom: 14 }} />

      {habits.map((h) => {
        const on = isDone(md, h.id, sd);
        const sk = streak(md?.c[h.id], isNow, td, n);
        return (
          <button key={h.id} type="button" className={'hr' + (on ? ' on' : '')} onClick={() => toggleDay(mk, h.id, sd)} aria-pressed={on}>
            <span className="ck">
              <CheckMark />
            </span>
            <span className="nm">
              {h.name}
              <span className="sub">
                {doneCount(md, h.id, n)} из {h.goal} в месяце
                {sk > 1 ? ' · 🔥 серия ' + sk : ''}
              </span>
            </span>
          </button>
        );
      })}

      {habits.length > 0 && dn === habits.length && (
        <div className="card" style={{ textAlign: 'center', fontWeight: 700 }}>
          🎉 День закрыт на 100%!
        </div>
      )}

      <MoodCard ctx={ctx} day={sd} />
    </>
  );
}
