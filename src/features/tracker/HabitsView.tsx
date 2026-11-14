import { useStore } from '../../store/useStore';
import type { Habit } from '../../store/types';
import { WEEK_SHORT } from '../../lib/dates';
import { calendarWeeks, doneCount, habitPct, streak } from '../../lib/calc';
import { CheckMark } from '../../ui/Icons';
import { Bar } from '../../ui/Bar';
import { ConfirmButton } from '../../ui/ConfirmButton';
import { NumberField } from '../../ui/NumberField';
import { AddHabit } from './AddHabit';
import type { MonthCtx } from './context';

function HabitCard({ ctx, h }: { ctx: MonthCtx; h: Habit }) {
  const { mk, n, off, isNow, td, md } = ctx;
  const toggleDay = useStore((s) => s.toggleDay);
  const setGoal = useStore((s) => s.setGoal);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const p = habitPct(md, h, n);
  const cnt = doneCount(md, h.id, n);
  const days = md?.c[h.id] ?? [];

  return (
    <div className="card hc">
      <div className="hh">
        <div>
          <b>{h.name}</b>
          <span className="sub">
            Сделано {cnt} из {h.goal} · осталось {Math.max(0, h.goal - cnt)}
          </span>
        </div>
        <div className="pcb">{p}%</div>
      </div>
      <Bar pct={p} />
      <div className="cal7">
        {WEEK_SHORT.map((x, i) => (
          <span key={x} className={'dh' + (i > 4 ? ' we' : '')}>
            {x}
          </span>
        ))}
        <span />
        {calendarWeeks(off, n).map((row, w) => {
          const real = row.filter((y): y is number => y !== null);
          const wc = real.filter((y) => days.includes(y)).length;
          return [
            <div key={'s' + w} className="sep" />,
            ...row.map((y, i) => {
              if (y === null) return <span key={w + '-' + i} />;
              const o = days.includes(y);
              return (
                <button
                  key={w + '-' + i}
                  type="button"
                  className={'dc' + (o ? ' on' : '') + (isNow && y === td ? ' tdy' : '') + (isNow && y > td ? ' fut' : '')}
                  onClick={() => toggleDay(mk, h.id, y)}
                  aria-pressed={o}
                  aria-label={String(y)}
                >
                  {o ? <CheckMark /> : y}
                </button>
              );
            }),
            <b key={'p' + w} className="wp">
              {wc}/{real.length}
            </b>,
          ];
        })}
      </div>
      <div className="ctl">
        <span>
          🔥 Серия: <b>{streak(days, isNow, td, n)}</b>
        </span>
        <span style={{ flex: 1 }} />
        <span>Цель:</span>
        <NumberField className="g" min={0} max={31} value={h.goal} onCommit={(v) => setGoal(h.id, +v || 0)} aria-label="Цель, дней" />
        <span>дн.</span>
        <ConfirmButton className="del" confirm="Удалить?" onConfirm={() => deleteHabit(h.id)} title="Удалить">
          🗑
        </ConfirmButton>
      </div>
    </div>
  );
}

export function HabitsView({ ctx }: { ctx: MonthCtx }) {
  return (
    <>
      {ctx.habits.map((h) => (
        <HabitCard key={h.id} ctx={ctx} h={h} />
      ))}
      <div className="card">
        <h2>Новая привычка</h2>
        <AddHabit namePh="Название" goalPh="Цель, дней" goalWidth={110} wide />
      </div>
    </>
  );
}
