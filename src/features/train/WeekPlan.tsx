import type { Program } from '../../data/exercises';
import { useStore } from '../../store/useStore';
import { useToday } from '../../app/today';
import { BarRow } from '../../ui/Bar';
import { ConfirmButton } from '../../ui/ConfirmButton';

/** 4-week plan with set checkboxes, progress and reset. */
export function WeekPlan({ program: e }: { program: Program }) {
  const t = useToday();
  const k = useStore((s) => s.tr.k[e.id] || 1);
  const dn = useStore((s) => s.tr.d[e.id]) ?? [];
  const hasHabit = useStore((s) => s.habits.some((h) => h.name === e.habit));
  const toggleSet = useStore((s) => s.toggleSet);
  const resetPlan = useStore((s) => s.resetPlan);

  const tot = e.weeks.length * e.per;
  const pc = Math.round((dn.length / tot) * 100);
  let next = '';
  outer: for (let w = 0; w < e.weeks.length; w++)
    for (let s = 0; s < e.per; s++)
      if (!dn.includes(w + '.' + s)) {
        next = w + '.' + s;
        break outer;
      }

  return (
    <div className="card">
      <h2>План на 4 недели · {e.name}</h2>
      <BarRow pct={pc} label={dn.length + '/' + tot} />
      {e.weeks.map((s, w) => (
        <div className="wkr" key={w}>
          <b>Неделя {w + 1}</b>
          <span className="tx">{e.fmt(s, k)}</span>
          <div>
            {Array.from({ length: e.per }, (_, i) => {
              const key = w + '.' + i;
              const on = dn.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={'sb' + (on ? ' on' : '') + (key === next ? ' nx' : '')}
                  onClick={() => toggleSet(e.id, key, t)}
                  aria-pressed={on}
                  aria-label={`Неделя ${w + 1}, подход ${i + 1}`}
                >
                  {on ? '✓' : i + 1}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="hint">
        {hasHabit ? 'Отметка тренировки ставит галочку «' + e.habit + '» в трекере за сегодня. ' : ''}
        Если больно в суставах — остановись; при проблемах со здоровьем сначала проконсультируйся с врачом.
      </div>
      <ConfirmButton className="nav sm" armClass="" style={{ marginTop: 10 }} confirm="Точно сбросить план?" onConfirm={() => resetPlan(e.id)}>
        Сбросить план
      </ConfirmButton>
    </div>
  );
}
