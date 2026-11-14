import { ACHIEVEMENT_LEVELS, achievementText, LEVEL_NUMERALS } from '../../data/achievements';
import { useStore } from '../../store/useStore';
import { habitAchievement } from '../../lib/achievements';
import { Bar, BarRow } from '../../ui/Bar';

/** Level-based achievements for every habit (10/25/50/100/250 completed days). */
export function HabitAchievementsView() {
  const data = useStore((s) => s.data);
  const habits = useStore((s) => s.habits);
  const list = habits.map((h) => habitAchievement(data, h));
  const unlocked = list.reduce((a, x) => a + x.unlocked, 0);
  const total = list.length * ACHIEVEMENT_LEVELS.length;

  return (
    <>
      <div className="card">
        <h2>Достижения привычек</h2>
        <BarRow pct={total ? Math.round((unlocked / total) * 100) : 0} label={unlocked + '/' + total} />
        <div className="hint" style={{ margin: 0 }}>
          У каждой привычки 5 уровней: 10, 25, 50, 100 и 250 отметок за всё время.
        </div>
      </div>

      {list.map((a) => (
        <div className="card ach" key={a.habit.id}>
          <div className="hh">
            <div>
              <b>{a.habit.name}</b>
              <span className="sub">Всего отметок: {a.total}</span>
            </div>
            <div className="pcb" style={{ fontSize: 20 }}>
              {a.unlocked}/{ACHIEVEMENT_LEVELS.length}
            </div>
          </div>
          <div className="lvls">
            {ACHIEVEMENT_LEVELS.map((n, i) => {
              const on = i < a.unlocked;
              const nx = i === a.unlocked;
              return (
                <div key={n} className={'lvl' + (on ? ' on' : '') + (nx ? ' nx' : '')} title={achievementText(a.habit.name, n)}>
                  <span className="lvb">{on ? '✓' : LEVEL_NUMERALS[i]}</span>
                  <small>{n}</small>
                </div>
              );
            })}
          </div>
          {a.next !== null ? (
            <div className="ach-next">
              <div className="ach-line">
                <span>
                  Ур. {LEVEL_NUMERALS[a.unlocked]}: {achievementText(a.habit.name, a.next)}
                </span>
                <b>
                  {a.total}/{a.next}
                </b>
              </div>
              <Bar pct={Math.round(((a.total - a.prev) / (a.next - a.prev)) * 100)} />
            </div>
          ) : (
            <div className="ach-next ach-done">Все уровни пройдены 🏆 {achievementText(a.habit.name, ACHIEVEMENT_LEVELS[ACHIEVEMENT_LEVELS.length - 1])} — выполнено!</div>
          )}
          {a.unlocked > 0 && (
            <ul className="ach-got">
              {ACHIEVEMENT_LEVELS.slice(0, a.unlocked).map((n, i) => (
                <li key={n}>
                  ✓ Ур. {LEVEL_NUMERALS[i]}: {achievementText(a.habit.name, n)}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}
