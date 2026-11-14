import { useStore, type ScoreKind } from '../../store/useStore';
import { WEEK_DAY_LC } from '../../lib/dates';
import { doneCount, habitPct, overallPct, scoreAverage, weekChunks } from '../../lib/calc';
import { Bar } from '../../ui/Bar';
import { ConfirmButton } from '../../ui/ConfirmButton';
import { NumberField } from '../../ui/NumberField';
import { AddHabit } from './AddHabit';
import { EMOJI, type MonthCtx } from './context';

const SCORE_ROWS: [ScoreKind, string][] = [
  ['mood', 'Настроение дня'],
  ['mot', 'Мотивация дня'],
];

/** Full spreadsheet-like month table (the prototype's original view). */
export function TableView({ ctx }: { ctx: MonthCtx }) {
  const { y, m, mk, n, isNow, td, md, habits } = ctx;
  const toggleDay = useStore((s) => s.toggleDay);
  const cycleScore = useStore((s) => s.cycleScore);
  const setGoal = useStore((s) => s.setGoal);
  const deleteHabit = useStore((s) => s.deleteHabit);

  const days = Array.from({ length: n }, (_, i) => i + 1);
  const tc = (d: number) => (isNow && d === td ? ' today' : '');
  const avgAll = overallPct(md, habits, n);

  return (
    <>
      <div className="card">
        <h2>Привычки, %</h2>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div className="big">{avgAll}%</div>
            <small style={{ color: 'var(--mut)' }}>общий прогресс</small>
          </div>
          <div className="sum" style={{ flex: 1, minWidth: 260 }}>
            {habits.map((h) => {
              const p = habitPct(md, h, n);
              return (
                <div key={h.id}>
                  <span className="n">{h.name}</span>
                  <Bar pct={p} />
                  <b>{p}%</b>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th className="name">Привычка</th>
                <th>Цель</th>
                {days.map((d) => (
                  <th key={d} className={tc(d)}>
                    {d}
                    <br />
                    <small>{WEEK_DAY_LC[new Date(y, m, d).getDay()]}</small>
                  </th>
                ))}
                <th>Сделано</th>
                <th>Осталось</th>
                <th>Прогресс</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => {
                const set = md?.c[h.id] ?? [];
                const c = doneCount(md, h.id, n);
                const p = habitPct(md, h, n);
                return (
                  <tr key={h.id}>
                    <td className="name">
                      <ConfirmButton className="del" confirm="Удалить?" onConfirm={() => deleteHabit(h.id)} title="Удалить">
                        ×
                      </ConfirmButton>{' '}
                      {h.name}
                    </td>
                    <td>
                      <NumberField className="g" min={0} max={31} value={h.goal} onCommit={(v) => setGoal(h.id, +v || 0)} aria-label="Цель" />
                    </td>
                    {days.map((d) => {
                      const on = set.includes(d);
                      return (
                        <td key={d} className={'d' + (on ? ' on' : '') + tc(d)}>
                          <button type="button" onClick={() => toggleDay(mk, h.id, d)} aria-label={h.name + ', ' + d}>
                            {on ? '✓' : ''}
                          </button>
                        </td>
                      );
                    })}
                    <td className="st">{c}</td>
                    <td className="st">{Math.max(0, h.goal - c)}</td>
                    <td className="p">
                      <div>
                        <Bar pct={p} />
                        <b>{p}%</b>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {SCORE_ROWS.map(([k, title]) => {
                const scores = md?.[k] ?? {};
                return (
                  <tr key={k}>
                    <td className="name">{title}</td>
                    <td />
                    {days.map((d) => (
                      <td key={d} className={'d' + tc(d)}>
                        <button type="button" onClick={() => cycleScore(mk, k, d)} aria-label={title + ', ' + d}>
                          {EMOJI[scores[d] || 0]}
                        </button>
                      </td>
                    ))}
                    <td className="st" colSpan={3}>
                      среднее: <b>{scoreAverage(scores)}</b>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <AddHabit namePh="Новая привычка" goalPh="Цель (дней)" goalWidth={130} />
      </div>

      <div className="card">
        <h2>По неделям</h2>
        <div className="wk">
          {weekChunks(md, habits, n).map((w) => (
            <div key={w.index}>
              <small>
                {w.index + 1} неделя · {w.from}–{w.to}
              </small>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {w.done} <small>из {w.total}</small>
              </div>
              <Bar pct={w.pct} />
              <small>
                {w.pct}% · осталось {w.total - w.done}
              </small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
