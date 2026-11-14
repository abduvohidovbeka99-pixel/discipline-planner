import { MILESTONES } from '../../data/milestones';
import { useOverallProgress } from '../../app/hooks';

/** The original 25/50/75/100% milestones of the current month. */
export function MilestonesView() {
  const p = useOverallProgress();
  const next = MILESTONES.find((m) => m.pct > p);
  return (
    <>
      <div className="card">
        <h2>Что ждёт тебя на пути</h2>
        <div>
          {next ? (
            <>
              Следующая награда — <b>«{next.title}»</b>: осталось <b>{next.pct - p}%</b> общего прогресса.
            </>
          ) : (
            'Все награды открыты. Ты — пример дисциплины! 🏆'
          )}
        </div>
      </div>
      <div className="ms">
        {MILESTONES.map((m) => {
          const on = p >= m.pct;
          return (
            <div key={m.pct} className={'mile' + (on ? ' on' : '') + (m.pct === 100 ? ' final' : '')}>
              <div className="pc">
                {m.emoji} {m.pct}%
              </div>
              <b>
                {m.title}
                {on ? ' — открыто ✓' : ' 🔒'}
              </b>
              <ul>
                {m.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
