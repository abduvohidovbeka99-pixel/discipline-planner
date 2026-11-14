import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useToday } from '../../app/today';
import { goalProgress, weightChange7d } from '../../lib/calc';
import { fmtIsoShort } from '../../lib/dates';
import { parseNum, rn, sg } from '../../lib/format';
import { Bar } from '../../ui/Bar';
import { ConfirmButton } from '../../ui/ConfirmButton';
import { NumberField } from '../../ui/NumberField';
import { WeightChart } from './WeightChart';

export function WeightView() {
  const t = useToday();
  const { w, g } = useStore((s) => s.nut);
  const saveWeight = useStore((s) => s.saveWeight);
  const deleteWeight = useStore((s) => s.deleteWeight);
  const setGoalWeight = useStore((s) => s.setGoalWeight);

  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [err, setErr] = useState(false);

  const save = () => {
    const v = parseNum(value);
    if (v > 20 && v < 400) {
      saveWeight(date || t.iso, v);
      setErr(false);
      setValue('');
      setDate('');
    } else setErr(true);
  };

  const last = w[w.length - 1];
  const first = w[0];
  const wt = last?.v ?? 0;
  const d7 = weightChange7d(w);
  const pg = goalProgress(w, g);

  return (
    <>
      <div className="card">
        <h2>Мой вес</h2>
        <form
          className="add"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            className="nin"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={20}
            max={400}
            placeholder="Вес, кг"
            style={{ flex: 1, minWidth: 110 }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Вес, кг"
          />
          <input className="nin" type="date" style={{ width: 150 }} value={date || t.iso} onChange={(e) => setDate(e.target.value)} aria-label="Дата" />
          <button type="submit" className="pbtn">
            Сохранить
          </button>
        </form>
        {err && (
          <div className="hint" style={{ color: 'var(--warn)' }}>
            Введи вес в килограммах, например 72.5
          </div>
        )}
      </div>

      {!w.length ? (
        <div className="card" style={{ textAlign: 'center' }}>
          Введи текущий вес — и здесь появятся график и прогресс.
        </div>
      ) : (
        <>
          <div className="card">
            <div className="stats s2">
              <div>
                <b>{rn(wt)} кг</b>
                <small>сейчас · {fmtIsoShort(last.d)}</small>
              </div>
              <div>
                <b>{sg(last.v - first.v)} кг</b>
                <small>с начала (старт {rn(first.v)} кг)</small>
              </div>
              <div>
                <b>{d7 == null ? '—' : sg(d7) + ' кг'}</b>
                <small>за 7 дней</small>
              </div>
              <div>
                <b>{g ? (g > wt ? '+' + rn(g - wt) + ' кг' : '✓') : '—'}</b>
                <small>{g ? 'до цели ' + rn(g) + ' кг' : 'цель не задана'}</small>
              </div>
            </div>
            {g > first.v && (
              <>
                <Bar pct={pg} style={{ margin: '4px 0 6px' }} />
                <div className="hint" style={{ margin: 0 }}>
                  Прогресс к цели: {pg}%
                </div>
              </>
            )}
            <div className="ctl">
              <span>Цель, кг:</span>
              <NumberField
                className="g"
                style={{ width: 84 }}
                step={0.5}
                min={0}
                value={g || ''}
                onCommit={(v) => {
                  const n = parseNum(v);
                  setGoalWeight(n > 0 ? n : 0);
                }}
                aria-label="Цель, кг"
              />
            </div>
          </div>

          <div className="card">
            <h2>График</h2>
            <WeightChart w={w.slice(-30)} goal={g} />
            {g > 0 && <div className="hint">Пунктир — цель {rn(g)} кг</div>}
          </div>

          <div className="card">
            <h2>История</h2>
            {w
              .slice()
              .reverse()
              .map((e, i, ar) => {
                const pv = ar[i + 1];
                return (
                  <div className="fr" key={e.d}>
                    <div className="fi">
                      <b>{fmtIsoShort(e.d)}</b>
                    </div>
                    <div className="fk">
                      <b>{rn(e.v)} кг</b>
                      <small>{pv ? sg(e.v - pv.v) + ' кг' : 'первая запись'}</small>
                    </div>
                    <ConfirmButton className="del" confirm="Удалить?" onConfirm={() => deleteWeight(e.d)}>
                      ×
                    </ConfirmButton>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </>
  );
}
