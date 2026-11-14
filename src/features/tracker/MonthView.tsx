import { Fragment } from 'react';
import { useUi } from '../../store/uiStore';
import { MONTHS, WEEK_SHORT } from '../../lib/dates';
import { calendarWeeks, dayPct, perfectDays, totalMarks, weekRowPct } from '../../lib/calc';
import { CheckMark } from '../../ui/Icons';
import type { MonthCtx } from './context';

/** Heat-map calendar of the month. Tapping a day opens it in the Day view. */
export function MonthView({ ctx }: { ctx: MonthCtx }) {
  const { y, m, mk, n, off, isNow, td, md, habits } = ctx;
  const setUi = useUi((s) => s.set);
  const tot = totalMarks(md, habits, n);
  const poss = habits.length * n;
  const weeks = calendarWeeks(off, n);

  return (
    <div className="card">
      <h2>
        {MONTHS[m]} {y}
      </h2>
      <div className="stats">
        <div>
          <b>{poss ? Math.round((tot / poss) * 100) : 0}%</b>
          <small>выполнено</small>
        </div>
        <div>
          <b>{perfectDays(md, habits, n)}</b>
          <small>идеальных дней</small>
        </div>
        <div>
          <b>{tot}</b>
          <small>отметок</small>
        </div>
      </div>

      <div className="cal">
        <span />
        {WEEK_SHORT.map((d, i) => (
          <span key={d} className={'dh' + (i > 4 ? ' we' : '')}>
            {d}
          </span>
        ))}
        <span className="dh">%</span>
        {weeks.map((row, w) => (
          <Fragment key={w}>
            <div className="sep" />
            <span className="wl">Н{w + 1}</span>
            {row.map((x, i) => {
              if (x === null) return <span key={i} />;
              const p = dayPct(md, habits, x);
              return (
                <button
                  key={i}
                  type="button"
                  className={'cd' + (isNow && x === td ? ' tdy' : '') + (p > 55 ? ' hi' : '')}
                  style={{ background: `color-mix(in srgb, var(--acc) ${p}%, var(--line))` }}
                  onClick={() => setUi({ selDay: { k: mk, d: x }, trackerView: 'day' })}
                  aria-label={`${x}: ${p}%`}
                >
                  {p === 100 ? <CheckMark /> : x}
                </button>
              );
            })}
            <b className="wp">{weekRowPct(md, habits, row)}%</b>
          </Fragment>
        ))}
      </div>
      <div className="hint">Чем темнее день — тем больше привычек выполнено. Нажми на день, чтобы открыть его.</div>
    </div>
  );
}

